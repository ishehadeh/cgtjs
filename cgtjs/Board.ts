export class BitBoard {
    #bits: bigint;
    #width: bigint;
    #height: bigint;

    #maskRow: bigint = 0n;
    #maskCol: bigint = 0n;

    get width(): bigint {
        return this.#width
    }

    get height(): bigint {
        return this.#height
    }

    get maskRow(): bigint {
        return this.#maskRow
    }

    get maskCol(): bigint {
        return this.#maskCol
    }

    get bits(): bigint {
        return BigInt.asUintN(Number(this.width * this.height), this.#bits);
    }

    set bits(bits: bigint) {
        this.#bits = BigInt.asUintN(Number(this.width * this.height), bits);
    }

    constructor(w: bigint, h: bigint, bits: bigint = 0n) {
        this.#width = w;
        this.#height = h;
        this.#bits = BigInt.asUintN(Number(w * h), bits);
        this.#maskCol = BigInt.asUintN(Number(w * h), 0n)
        this.#maskRow = BigInt.asUintN(Number(w * h), 0n)

        for (let i = 0n; i < this.width; ++i) {
            this.#maskRow |= (1n << i);
        }

        for (let i = 0n; i < this.height; ++i) {
            this.#maskCol |= (1n << (i * this.width));
        }
    }

    resize(w: bigint, h: bigint): BitBoard {
        const newBoard = new BitBoard(w, h);

        // use the smaller row mask so it doesn't overflow on either board
        const rowMask = this.width < w ? this.maskRow : newBoard.maskRow;

        // copy the smaller number of rows so it doesn't overflow either board's height
        const copyHeight = this.height > h ? h : this.height;

        for (let i = 0n; i < copyHeight; ++i) {
            newBoard.#bits |= ((this.#bits & (rowMask << (i * this.width))) >> (i * this.width)) << (i * w);
        }

        return newBoard;
    }

    clone(): BitBoard {
        return new BitBoard(this.width, this.height, this.bits);
    }

    translateInPlace(x: bigint, y: bigint) {
        // TODO: optimize
        while (x < 0) {
            this.#bits &= ~(this.maskCol);
            this.#bits >>= 1n;
            x += 1n;
        }
        while (x > 0) {
            this.#bits &= ~(this.maskCol << (this.width - 1n));
            this.#bits <<= 1n;
            x -= 1n;
        }

        while (y < 0) {
            this.#bits >>= this.width;
            y += 1n;
        }
        while (y > 0) {
            this.#bits &= ~(this.maskRow << ((this.height - 1n) * this.width));
            this.#bits <<= this.height;
            y -= 1n;
        }
    }

    translate(x: bigint, y: bigint): BitBoard {
        const tr = new BitBoard(this.width, this.height, this.bits);
        tr.translateInPlace(x, y);
        return tr;
    }

    get(x: bigint, y: bigint): boolean {
        return (this.#bits & (1n << (y * this.width + x))) > 0;
    }

    getByIndex(i: bigint): boolean {
        return (this.#bits & (1n << i)) > 0;
    }

    set(x: bigint, y: bigint) {
        this.#bits |= 1n << (y * this.width + x);
    }

    clear(x: bigint, y: bigint) {
        this.#bits &= ~(1n << (y * this.width + x));
    }

    flipVerticalInPlace() {
        let newBits = BigInt.asUintN(Number(this.width * this.height), 0n);
        for (let i = 0n; i < this.height; ++i) {
            const rowTopOffset = (i * this.width);
            const rowBottomOffset = ((this.height - i - 1n) * this.width);
            newBits |= (this.maskRow & (this.#bits >> rowTopOffset)) << rowBottomOffset;
            newBits |= (this.maskRow & (this.#bits >> rowBottomOffset)) << rowTopOffset;
        }
        this.#bits = newBits;
    }

    transpose(): BitBoard {
        // FIXME: optimize
        const newBoard = new BitBoard(this.height, this.width)
        for (let x = 0n; x < this.width; ++x) {
            for (let y = 0n; y < this.height; ++y) {
                if (this.get(x, y)) {
                    newBoard.set(y, x);
                }
            }
        }
        return newBoard
    }

    flipHorizontalInPlace() {
        let newBits = BigInt.asUintN(Number(this.width * this.height), 0n);
        for (let i = 0n; i < (this.width + 1n) / 2n; ++i) {
            const colLeftOffset = i;
            const colRightOffset = (this.width - i) - 1n;
            newBits |= (this.maskCol & (this.#bits >> colLeftOffset)) << colRightOffset;
            newBits |= (this.maskCol & (this.#bits >> colRightOffset)) << colLeftOffset;
        }
        this.#bits = newBits;
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
        let str = "";
        for (let y = 0n; y < this.height; ++y) {
            for (let x = 0n; x < this.width; ++x) {
                str += this.get(x, y) ? "1" : "0";
            }
            str += "\n";
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
    *iterSet(): Generator<[bigint, bigint], void> {
        for (let i = 0n; i < this.width * this.height; ++i) {
            if ((this.#bits & (1n << i)) > 0n) {
                yield [i % this.width, i / this.width];
            }
        }
    }

    *iterClear(): Generator<[bigint, bigint], void> {
        for (let i = 0n; i < this.width * this.height; ++i) {
            if ((this.#bits & (1n << i)) == 0n) {
                yield [i % this.width, i / this.width];
            }
        }
    }
}

export function deltaSwap(board: bigint, mask: bigint, delta: bigint) {
    // more detail: https://reflectionsonsecurity.wordpress.com/2014/05/11/efficient-bit-permutation-using-delta-swaps/
    const x = (board ^ (board >> delta)) & mask;
    return (board ^ (x << delta)) ^ x
}

