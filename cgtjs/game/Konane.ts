import type { Game } from '../solver/Game.ts';

export type KonanePlayer = 'black' | 'white';
export type KonaneTile = KonanePlayer | 'empty';

function requireInteger(n: unknown, name = 'value'): bigint {
  if (typeof n !== 'number' && typeof n !== 'bigint') {
    throw new TypeError(`expected ${name} to be numeric, got ${n}`);
  }
  if (typeof n === 'number' && !Number.isInteger(n)) {
    throw new TypeError(`expected ${name} to be an integer, got ${n}`);
  }
  return BigInt(n);
}

/**
 * A single Konane move: hop along a line from (fromX, fromY) to (toX, toY), capturing
 * the intervening opponent pieces.
 */
export class KonaneMove {
  #fromX: bigint;
  #fromY: bigint;
  #toX: bigint;
  #toY: bigint;

  constructor(fromX: bigint | number, fromY: bigint | number, toX: bigint | number, toY: bigint | number) {
    this.#fromX = requireInteger(fromX);
    this.#fromY = requireInteger(fromY);
    this.#toX = requireInteger(toX);
    this.#toY = requireInteger(toY);

    if (this.fromX !== this.toX && this.fromY !== this.toY) {
      throw new Error(
        `moves must be either horizontal or vertical, cannot move from <${this.fromX}, ${this.fromY}> to <${this.toX}, ${this.toY}>`,
      );
    }
    if (this.fromX === this.toX && this.fromY === this.toY) {
      throw new Error(`move has no effect! move from <${this.fromX}, ${this.fromY}> to <${this.toX}, ${this.toY}>`);
    }
  }

  get fromX() {
    return this.#fromX;
  }
  get fromY() {
    return this.#fromY;
  }
  get toX() {
    return this.#toX;
  }
  get toY() {
    return this.#toY;
  }

  *clearedCells(): Generator<{ x: bigint; y: bigint }, void, void> {
    let xDiff = 0n;
    let yDiff = 0n;
    if (this.fromX === this.toX) {
      yDiff = this.fromY > this.toY ? -1n : 1n;
    } else {
      xDiff = this.fromX > this.toX ? -1n : 1n;
    }

    let x = this.fromX;
    let y = this.fromY;
    while (x !== this.toX || y !== this.toY) {
      yield { x, y };
      x += xDiff;
      y += yDiff;
    }
  }
}

/**
 * Bit-parallel move enumeration for a player (Hawaiian checkers / Konane).
 */
export class KonaneMoveGenerator {
  #game: Konane;
  #player: KonanePlayer;
  #dir: 0 | 1 | 2 | 3 | 4 = 0;
  #hops: bigint = 0n;
  #moveList: bigint = 0n;

  constructor(game: Konane, player: KonanePlayer) {
    if (player !== 'black' && player !== 'white') {
      throw new TypeError(`expected player to be "black" or "white", got '${player}'`);
    }

    this.#game = game;
    this.#player = player;
    this.setDir(0);
  }

  private setDir(dir: 0 | 1 | 2 | 3 | 4) {
    this.#dir = dir;
    if (this.#dir === 4) {
      return;
    }

    this.#hops = 0n;
    this.#moveList = this.#player === 'black' ? this.#game.blackBits : this.#game.whiteBits;
    this.#moveList &= ~this.#game.borderMask(this.#dir);
    this.hop();
  }

  #shift() {
    const bits = Number(this.#game.width * this.#game.height);
    switch (this.#dir) {
      case 0:
        this.#moveList = BigInt.asUintN(bits, this.#moveList >> 1n);
        break;
      case 1:
        this.#moveList = BigInt.asUintN(bits, this.#moveList << 1n);
        break;
      case 2:
        this.#moveList = BigInt.asUintN(bits, this.#moveList << this.#game.width);
        break;
      case 3:
        this.#moveList = BigInt.asUintN(bits, this.#moveList >> this.#game.width);
        break;
    }
  }

  hop() {
    if (this.#dir === 4 || this.#moveList === 0n) {
      return;
    }

    this.#moveList &= ~this.#game.borderMask(this.#dir);
    this.#shift();
    if (this.#player === 'black') {
      this.#moveList &= this.#game.whiteBits;
    } else {
      this.#moveList &= this.#game.blackBits;
    }

    this.#moveList &= ~this.#game.borderMask(this.#dir);
    this.#shift();
    this.#moveList &= this.#game.emptyMask();
    this.#hops += 1n;
  }

  *currentMoves(): Generator<KonaneMove, void, void> {
    if (this.#dir === 4) {
      return;
    }

    const w = this.#game.width;
    const h = this.#game.height;
    for (let i = 0n; i < w * h; ++i) {
      if ((this.#moveList & (1n << i)) !== 0n) {
        const toX = i % w;
        const toY = i / w;
        let fromX = toX;
        let fromY = toY;
        if (this.#dir === 0) {
          fromX = toX + 2n * this.#hops;
        }
        if (this.#dir === 1) {
          fromX = toX - 2n * this.#hops;
        }
        if (this.#dir === 2) {
          fromY = toY - 2n * this.#hops;
        }
        if (this.#dir === 3) {
          fromY = toY + 2n * this.#hops;
        }
        yield new KonaneMove(fromX, fromY, toX, toY);
      }
    }
  }

  *allMovesInCurrentDirection(): Generator<KonaneMove, void, void> {
    if (this.#dir === 4) {
      return;
    }

    while (this.#moveList !== 0n) {
      yield* this.currentMoves();
      this.hop();
    }
  }

  *allMoves(): Generator<KonaneMove, void, void> {
    while (this.#dir < 4) {
      yield* this.allMovesInCurrentDirection();
      this.setDir((this.#dir + 1) as 0 | 1 | 2 | 3 | 4);
    }
  }
}

/**
 * Konane (Hawaiian checkers): black ("x") and white ("o") on a board; a move is a
 * series of orthogonally adjacent jumps that capture the jumped pieces.
 * Left/Right in CGT terms: black = movesLeft, white = movesRight.
 */
export class Konane implements Game<Konane> {
  #width: bigint;
  #height: bigint;
  #black: bigint;
  #white: bigint;

  get width() {
    return this.#width;
  }

  get height() {
    return this.#height;
  }

  /** Raw occupied-by-black bitboard (exposed for {@link KonaneMoveGenerator}). */
  get blackBits() {
    return this.#black;
  }

  /** Raw occupied-by-white bitboard (exposed for {@link KonaneMoveGenerator}). */
  get whiteBits() {
    return this.#white;
  }

  constructor(w: bigint | number, h: bigint | number) {
    this.#width = requireInteger(w, 'width');
    this.#height = requireInteger(h, 'height');
    const bits = Number(this.#width * this.#height);
    this.#black = BigInt.asUintN(bits, 0n);
    this.#white = BigInt.asUintN(bits, 0n);
  }

  static fromString(boardStr: string): Konane {
    if (typeof boardStr !== 'string') {
      throw new TypeError(`expected board to be a string, got "${boardStr}"`);
    }
    const rowStrs = boardStr
      .trim()
      .split(/\s+/)
      .map((row) => row.trim());
    const h = rowStrs.length;
    const w = Math.max(...rowStrs.map((r) => r.length), 0);
    const board = new Konane(w, h);

    for (let y = 0n; y < BigInt(h); ++y) {
      const row = rowStrs[Number(y)];
      for (let x = 0n; x < BigInt(row.length); ++x) {
        const ch = row[Number(x)];
        switch (ch) {
          case '_':
            break;
          case 'x':
            board.setTile(x, y, 'black');
            break;
          case 'o':
            board.setTile(x, y, 'white');
            break;
          default:
            throw new Error(`unexpected character in state string: "${ch}" (full: "${boardStr}")`);
        }
      }
    }
    return board;
  }

  boardMask() {
    const n = this.#width * this.#height;
    return n === 0n ? 0n : (1n << n) - 1n;
  }

  private tileIndex(x: bigint, y: bigint) {
    const bigX = requireInteger(x, 'x coordinate');
    const bigY = requireInteger(y, 'y coordinate');
    if (bigX >= this.width || bigY >= this.height) {
      throw new Error(`tile coordinate <${x}, ${y}> is out of bounds for a ${this.width}x${this.height} board`);
    }
    return bigX + bigY * this.#width;
  }

  rowMask(n: bigint = 0n) {
    const bigN = requireInteger(n, 'row index');
    if (bigN >= this.height) {
      throw new Error(`row index '${n}' is out of bounds for board size ${this.width}x${this.height}`);
    }
    const bits = Number(this.#width * this.#height);
    let mask = BigInt.asUintN(bits, 0n);
    for (let x = 0n; x < this.width; ++x) {
      mask |= 1n << this.tileIndex(x, bigN);
    }
    return mask;
  }

  columnMask(n: bigint = 0n) {
    const bigN = requireInteger(n, 'column index');
    if (bigN >= this.width) {
      throw new Error(`column index '${n}' is out of bounds for board size ${this.width}x${this.height}`);
    }
    const bits = Number(this.#width * this.#height);
    let mask = BigInt.asUintN(bits, 0n);
    for (let y = 0n; y < this.height; ++y) {
      mask |= 1n << this.tileIndex(bigN, y);
    }
    return mask;
  }

  /** Border 0 = left, 1 = right, 2 = down, 3 = up */
  borderMask(border: 0 | 1 | 2 | 3) {
    switch (border) {
      case 0:
        return this.columnMask(0n);
      case 1:
        return this.columnMask(this.width - 1n);
      case 2:
        return this.rowMask(this.height - 1n);
      case 3:
        return this.rowMask(0n);
      default:
        throw new Error(`invalid value for border, expect [0, 3], got ${border}`);
    }
  }

  emptyMask() {
    const m = this.boardMask();
    return m & (m ^ (this.#white | this.#black));
  }

  setTile(x: bigint | number, y: bigint | number, state: KonaneTile) {
    const bit = 1n << this.tileIndex(requireInteger(x), requireInteger(y));
    const m = this.boardMask();
    const bitInv = m ^ bit;
    switch (state) {
      case 'black':
        this.#black = BigInt.asUintN(Number(this.width * this.height), this.#black | bit);
        this.#white = BigInt.asUintN(Number(this.width * this.height), this.#white & bitInv);
        break;
      case 'white':
        this.#white = BigInt.asUintN(Number(this.width * this.height), this.#white | bit);
        this.#black = BigInt.asUintN(Number(this.width * this.height), this.#black & bitInv);
        break;
      case 'empty':
        this.#black = BigInt.asUintN(Number(this.width * this.height), this.#black & bitInv);
        this.#white = BigInt.asUintN(Number(this.width * this.height), this.#white & bitInv);
        break;
    }
  }

  getTile(x: bigint | number, y: bigint | number): KonaneTile {
    const mask = 1n << this.tileIndex(requireInteger(x), requireInteger(y));
    const isBlack = (this.#black & mask) !== 0n;
    const isWhite = (this.#white & mask) !== 0n;
    if (isBlack && isWhite) {
      throw new Error(`invalid state for tile at <${x}, ${y}>, marked as both black and white`);
    }
    if (isBlack) {
      return 'black';
    }
    if (isWhite) {
      return 'white';
    }
    return 'empty';
  }

  /**
   * Move generator for the given player. Prefer {@link Konane.prototype.movesLeft} /
   * {@link Konane.prototype.movesRight} for the {@link Game} interface.
   */
  moves(player: KonanePlayer): KonaneMoveGenerator {
    return new KonaneMoveGenerator(this, player);
  }

  *movesFrom(fromX: bigint | number, fromY: bigint | number): Generator<KonaneMove, void, void> {
    const tileState = this.getTile(fromX, fromY);
    if (tileState === 'empty') {
      return;
    }
    for (const move of this.moves(tileState).allMoves()) {
      if (move.fromX === requireInteger(fromX) && move.fromY === requireInteger(fromY)) {
        yield move;
      }
    }
  }

  applyMove(move: KonaneMove, player: KonanePlayer) {
    for (const { x, y } of move.clearedCells()) {
      this.setTile(x, y, 'empty');
    }
    this.setTile(move.toX, move.toY, player);
  }

  *movesLeft(): Generator<Konane, void, void> {
    for (const move of this.moves('black').allMoves()) {
      const child = this.clone();
      child.applyMove(move, 'black');
      yield child;
    }
  }

  *movesRight(): Generator<Konane, void, void> {
    for (const move of this.moves('white').allMoves()) {
      const child = this.clone();
      child.applyMove(move, 'white');
      yield child;
    }
  }

  hash(): string {
    return this.serialize().toString(16);
  }

  serialize(): bigint {
    const boardBits = this.width * this.height;
    const totalBits = 16n + boardBits * 2n;
    let serialized = BigInt.asUintN(Number(totalBits), this.width);
    serialized |= this.height << 8n;
    serialized |= this.#black << 16n;
    serialized |= this.#white << (16n + boardBits);
    return serialized;
  }

  toString() {
    let str = '';
    for (let y = 0n; y < this.height; ++y) {
      for (let x = 0n; x < this.width; ++x) {
        switch (this.getTile(x, y)) {
          case 'black':
            str += 'x';
            break;
          case 'white':
            str += 'o';
            break;
          case 'empty':
            str += '_';
            break;
        }
      }
      if (y !== this.height - 1n) {
        str += '\n';
      }
    }
    return str;
  }

  /**
   * Copy with a new size: keeps existing rows, adding empty cells to the right and bottom
   * when growing.
   */
  cloneWithSize(newW: bigint | number, newH: bigint | number): Konane {
    const newWb = requireInteger(newW);
    const newHb = requireInteger(newH);
    const newGame = new Konane(newWb, newHb);
    if (this.#black !== 0n || this.#white !== 0n) {
      for (let y = 0n; y < this.height; ++y) {
        newGame.#black = BigInt.asUintN(
          Number(newWb * newHb),
          newGame.#black | (((this.#black & this.rowMask(y)) >> (y * this.width)) << (y * newWb)),
        );
        newGame.#white = BigInt.asUintN(
          Number(newWb * newHb),
          newGame.#white | (((this.#white & this.rowMask(y)) >> (y * this.width)) << (y * newWb)),
        );
      }
    }
    return newGame;
  }

  clone() {
    const newGame = new Konane(this.width, this.height);
    newGame.#black = this.#black;
    newGame.#white = this.#white;
    return newGame;
  }

  isEqualTo(other: Konane) {
    return (
      this.width === other.width &&
      this.height === other.height &&
      this.#black === other.#black &&
      this.#white === other.#white
    );
  }
}
