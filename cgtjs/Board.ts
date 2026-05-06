function wordCountFromCells(cells: number): number {
  return (cells + 31) >>> 5;
}

/** Clear bits beyond `cellCount - 1` in the backing store. */
function maskWordsToCellCount(words: Uint32Array, cellCount: number): void {
  const wc = words.length;
  if (wc === 0) {
    return;
  }
  const rem = cellCount & 31;
  const lastMask = rem === 0 ? 0xffff_ffff >>> 0 : (0xffff_ffff >>> (32 - rem)) >>> 0;
  words[wc - 1] = (words[wc - 1] & lastMask) >>> 0;
}

export class BitBoard {
  #width: number;
  #height: number;
  #words: Uint32Array;

  /** Bit-packed backing store (`ceil(w*h / 32)` words), row-major, bit 0 = (0,0). Extra high bits are always cleared. */
  get words(): Readonly<Uint32Array> {
    return this.#words;
  }

  get width(): number {
    return this.#width;
  }

  get height(): number {
    return this.#height;
  }

  /**
   * Deserialize from `toString()` format: one row per line, `'0'` / `'1'`, optional outer whitespace ignored.
   */
  static fromString(str: string): BitBoard {
    const rows = str
      .split('\n')
      .map((r) => r.trim())
      .filter((r) => r.length !== 0);
    if (rows.length === 0) {
      throw new RangeError('BitBoard.fromString: empty grid');
    }
    const w = Math.max(...rows.map((r) => r.length));
    const h = rows.length;
    const bb = new BitBoard(w, h);
    for (let y = 0; y < h; y++) {
      const row = rows[y];
      for (let x = 0; x < w; x++) {
        const ch = row[x] ?? '0';
        if (ch === '1') {
          bb.set(x, y);
        } else if (ch !== '0') {
          throw new TypeError(`BitBoard.fromString: invalid character "${ch}"`);
        }
      }
    }
    return bb;
  }

  /**
   * Build a board from consecutive low-order bits (`bit i → cell (i % w, floor(i/w))`).
   */
  static fromLinearPacked(w: number, h: number, packed: number): BitBoard {
    const bb = new BitBoard(w, h);
    const cc = w * h;
    for (let i = 0; i < cc; i++) {
      if ((packed >>> i) & 1) {
        const idx = i;
        bb.#words[idx >>> 5] |= 1 << (idx & 31);
      }
    }
    maskWordsToCellCount(bb.#words, w * h);
    return bb;
  }

  /** Read contiguous bytes (`bit byteIndex*8+b` from byte’s LSB; matches `writePackedBytes` / Blokus `serialize`). */
  static fromPackedBytes(
    width: number,
    height: number,
    dataView: DataView,
    byteOffset: number,
    fieldSizeBytes: number,
  ): BitBoard {
    const bb = new BitBoard(width, height);
    const cc = width * height;
    let linear = 0;
    for (let bi = 0; bi < fieldSizeBytes; bi++) {
      const b = dataView.getUint8(byteOffset + bi);
      for (let k = 0; k < 8 && linear < cc; k++, linear++) {
        if ((b >>> k) & 1) {
          bb.#words[linear >>> 5] |= 1 << (linear & 31);
        }
      }
    }
    maskWordsToCellCount(bb.#words, cc);
    return bb;
  }

  writePackedBytes(dataView: DataView, byteOffset: number, fieldSizeBytes: number): void {
    const cc = this.#width * this.#height;
    let linear = 0;
    for (let bi = 0; bi < fieldSizeBytes; bi++) {
      let byte = 0;
      for (let k = 0; k < 8 && linear + k < cc; k++) {
        const gi = linear + k;
        if ((this.#words[gi >>> 5] >>> (gi & 31)) & 1) {
          byte |= 1 << k;
        }
      }
      linear += 8;
      dataView.setUint8(byteOffset + bi, byte);
    }
  }

  constructor(w: number, h: number, initialWords?: Uint32Array) {
    this.#width = w;
    this.#height = h;
    const cc = w * h;
    const wc = wordCountFromCells(cc);
    this.#words = new Uint32Array(wc);
    if (initialWords !== undefined) {
      if (initialWords.length !== wc) {
        throw new RangeError(`expected ${wc} words, got ${initialWords.length}`);
      }
      this.#words.set(initialWords);
    }
    maskWordsToCellCount(this.#words, cc);
  }

  equals(other: BitBoard): boolean {
    if (this.#width !== other.#width || this.#height !== other.#height) {
      return false;
    }
    const cc = this.#width * this.#height;
    const wc = this.#words.length;
    const rem = cc & 31;
    const lastMask = rem === 0 ? 0xffff_ffff >>> 0 : (0xffff_ffff >>> (32 - rem)) >>> 0;
    for (let wi = 0; wi < wc; wi++) {
      let a = this.#words[wi] >>> 0;
      let b = other.#words[wi] >>> 0;
      if (wi === wc - 1) {
        a &= lastMask;
        b &= lastMask;
      }
      if (a !== b) {
        return false;
      }
    }
    return true;
  }

  resize(w: number, h: number): BitBoard {
    const nb = new BitBoard(w, h);
    const copyH = Math.min(this.#height, h);
    const copyW = Math.min(this.#width, w);
    for (let y = 0; y < copyH; y++) {
      for (let x = 0; x < copyW; x++) {
        if (this.get(x, y)) {
          nb.set(x, y);
        }
      }
    }
    return nb;
  }

  clone(): BitBoard {
    return new BitBoard(this.#width, this.#height, new Uint32Array(this.#words));
  }

  translateInPlace(x: number, y: number): void {
    const src = this.clone();
    this.#clearAll();
    const w = this.#width;
    const h = this.#height;
    const cc = w * h;
    for (let i = 0; i < cc; i++) {
      if (!src.getByIndex(i)) {
        continue;
      }
      const cx = i % w;
      const cy = (i / w) | 0;
      const tx = cx + x;
      const ty = cy + y;
      if (tx >= 0 && tx < w && ty >= 0 && ty < h) {
        this.set(tx, ty);
      }
    }
  }

  translate(x: number, y: number): BitBoard {
    const tr = this.clone();
    tr.translateInPlace(x, y);
    return tr;
  }

  get(x: number, y: number): boolean {
    const i = y * this.#width + x;
    return ((this.#words[i >>> 5] >>> (i & 31)) & 1) !== 0;
  }

  getByIndex(i: number): boolean {
    return ((this.#words[i >>> 5] >>> (i & 31)) & 1) !== 0;
  }

  set(x: number, y: number): void {
    const i = y * this.#width + x;
    this.#words[i >>> 5] |= 1 << (i & 31);
  }

  clear(x: number, y: number): void {
    const i = y * this.#width + x;
    this.#words[i >>> 5] &= ~(1 << (i & 31));
  }

  flipVerticalInPlace(): void {
    const h = this.#height;
    const mid = Math.floor(h / 2);
    const w = this.#width;
    for (let y = 0; y < mid; y++) {
      const yb = h - 1 - y;
      for (let x = 0; x < w; x++) {
        const a = this.get(x, y);
        const b = this.get(x, yb);
        if (a !== b) {
          if (a) {
            this.set(x, yb);
            this.clear(x, y);
          } else {
            this.set(x, y);
            this.clear(x, yb);
          }
        }
      }
    }
  }

  transpose(): BitBoard {
    const newBoard = new BitBoard(this.#height, this.#width);
    for (let x = 0; x < this.#width; x++) {
      for (let y = 0; y < this.#height; y++) {
        if (this.get(x, y)) {
          newBoard.set(y, x);
        }
      }
    }
    return newBoard;
  }

  flipHorizontalInPlace(): void {
    const w = this.#width;
    const h = this.#height;
    for (let y = 0; y < h; y++) {
      for (let xl = 0, xr = w - 1; xl < xr; xl++, xr--) {
        const a = this.get(xl, y);
        const b = this.get(xr, y);
        if (a !== b) {
          if (a) {
            this.set(xr, y);
            this.clear(xl, y);
          } else {
            this.set(xl, y);
            this.clear(xr, y);
          }
        }
      }
    }
  }

  flipHorizontal(): BitBoard {
    const clone = this.clone();
    clone.flipHorizontalInPlace();
    return clone;
  }

  flipVertical(): BitBoard {
    const clone = this.clone();
    clone.flipVerticalInPlace();
    return clone;
  }

  toString(): string {
    let str = '';
    for (let y = 0; y < this.#height; y++) {
      for (let x = 0; x < this.#width; x++) {
        str += this.get(x, y) ? '1' : '0';
      }
      str += '\n';
    }
    return str;
  }

  rotateClockwise(): BitBoard {
    const tr = this.transpose();
    tr.flipHorizontalInPlace();
    return tr;
  }

  /**
   * Iterate the cells that are "true" (have a '1' value in the bitboard)
   *
   * @returns a generator that yields the x and y coordinates of the cells that are "true", in the form [x, y]
   */
  *iterSet(): Generator<[number, number], void> {
    const cc = this.#width * this.#height;
    const w = this.#width;
    for (let i = 0; i < cc; i++) {
      if ((this.#words[i >>> 5] >>> (i & 31)) & 1) {
        yield [i % w, (i / w) | 0];
      }
    }
  }

  *iterClear(): Generator<[number, number], void> {
    const cc = this.#width * this.#height;
    const w = this.#width;
    for (let i = 0; i < cc; i++) {
      if (((this.#words[i >>> 5] >>> (i & 31)) & 1) === 0) {
        yield [i % w, (i / w) | 0];
      }
    }
  }

  #clearAll(): void {
    this.#words.fill(0);
  }
}

/**
 * Efficient bit permutation using delta swaps (`board`, `mask`, `delta` are treated as unsigned 32-bit values).
 *
 * More detail:
 * https://reflectionsonsecurity.wordpress.com/2014/05/11/efficient-bit-permutation-using-delta-swaps/
 */
export function deltaSwap(board: number, mask: number, delta: number): number {
  const x = ((((board >>> delta) >>> 0) ^ (board >>> 0)) >>> 0) & (mask >>> 0);
  const shifted = (x << delta) >>> 0;
  return ((board >>> 0) ^ shifted ^ x) >>> 0;
}
