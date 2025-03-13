import type { Blokus } from "./game/Blokus";

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

        for (let i = 0n; i < this.width; ++i) {
            this.#maskRow |= (1n << i);
        }

        for (let i = 0n; i < this.width; ++i) {
            this.#maskCol |= (1n << (i * this.width));
        }
    }

    resize(w: bigint, h: bigint): BitBoard {
        const newBoard = new BitBoard(w, h);

        // use the smaller row mask so it doesn't overflow on either board
        const rowMask = this.width < w ? this.maskRow : newBoard.maskRow;
        const copyWidth = this.width < w ? this.width : w;

        // copy the smaller number of rows so it doesn't overflow either board's height
        const copyHeight = this.height > h ? h : this.height;

        for (let i = 0n; i < copyHeight; ++i) {
            newBoard.#bits |= ((this.#bits & (rowMask << (i * copyWidth))) >> (i * copyWidth)) << (i * w);
        }

        return newBoard;
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
            const colRightOffset = this.width - i - 1n;
            newBits |= (this.maskCol & (this.#bits >> colLeftOffset)) << colRightOffset;
            newBits |= (this.maskCol & (this.#bits >> colRightOffset)) << colLeftOffset;
        }
        this.#bits = newBits;
    }

    rotateClockwise(): BitBoard {
        const tr = this.transpose();
        tr.flipHorizontalInPlace();
        return tr;
    }

    *iterSet(): Generator<bigint, void> {
        for (let i = 0n; i < this.width * this.height; ++i) {
            if ((this.#bits & (1n << i)) > 0n) {
                yield i;
            }
        }
    }

    *iterClear(): Generator<bigint, void> {
        for (let i = 0n; i < this.width * this.height; ++i) {
            if ((this.#bits & (1n << i)) == 0n) {
                yield i;
            }
        }
    }
}

export function deltaSwap(board: bigint, mask: bigint, delta: bigint) {
    // more detail: https://reflectionsonsecurity.wordpress.com/2014/05/11/efficient-bit-permutation-using-delta-swaps/
    const x = (board ^ (board >> delta)) & mask;
    return (board ^ (x << delta)) ^ x
}

