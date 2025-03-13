import { BitBoard } from "../Board";

export enum TileState {
    Interior = 'interior',
    Corner = 'corner',
    Side = 'side',
    Empty = 'empty',
}

export class Blokus {
    #side: BitBoard;
    #corner: BitBoard;
    #interior: BitBoard;

    get width() {
        return this.#side.width;
    }

    get height() {
        return this.#side.height;
    }

    constructor(side: BitBoard, corner: BitBoard, interior: BitBoard) {
        this.#side = side
        this.#corner = corner;
        this.#interior = interior;
    }

    static empty(w: bigint, h: bigint): Blokus {
        return new Blokus(
            new BitBoard(w, h),
            new BitBoard(w, h),
            new BitBoard(w, h),
        );
    }

    static fromString(str: string): Blokus {
        const rowsTrimmed = str.split("\n")
            .map(r => r.trim())
            .filter(r => r.length !== 0);
        const w = BigInt(Math.max(...rowsTrimmed.map(r => r.length)))
        const h = BigInt(rowsTrimmed.length);
        const game = Blokus.empty(w, h);
        let y = 0n;
        for (const row of rowsTrimmed) {
            let x = 0n;
            for (const cell of row) {
                switch (cell) {
                    case ".":
                        game.set(x, y, TileState.Empty);
                        break; // empty
                    case "i":
                        game.set(x, y, TileState.Interior);
                        break;
                    case "c":
                        game.set(x, y, TileState.Corner);
                        break;
                    case "s":
                        game.set(x, y, TileState.Side);
                        break;
                    default:
                        throw TypeError("unexpected character");
                }
                x += 1n;
            }
            y += 1n;
        }

        return game;
    }

    isEqualTo(other: Blokus): boolean {
        return other.width === this.width &&
            other.height === this.height &&
            other.#corner.bits === this.#corner.bits &&
            other.#side.bits === this.#side.bits &&
            other.#interior.bits === this.#interior.bits;
    }

    toStringBoard(): string {
        let boardStr = "";
        for (let y = 0n; y < this.height; ++y) {
            for (let x = 0n; x < this.width; ++x) {
                switch (this.get(x, y)) {
                    case TileState.Side:
                        boardStr += "s";
                        break;
                    case TileState.Corner:
                        boardStr += "c";
                        break;
                    case TileState.Interior:
                        boardStr += "i";
                        break;
                    case TileState.Empty:
                        boardStr += ".";
                        break;
                }
            }
            boardStr += "\n"
        }
        return boardStr;
    }


    get(x: bigint, y: bigint): TileState {
        if (this.#side.get(x, y)) return TileState.Side;
        if (this.#corner.get(x, y)) return TileState.Corner;
        if (this.#interior.get(x, y)) return TileState.Interior;
        return TileState.Empty;
    }

    set(x: bigint, y: bigint, state: TileState) {
        switch (state) {
            case TileState.Interior:
                this.#side.clear(x, y);
                this.#corner.clear(x, y);
                this.#interior.set(x, y);
                break;

            case TileState.Side:
                this.#side.set(x, y);
                this.#corner.clear(x, y);
                this.#interior.clear(x, y);
                break;

            case TileState.Corner:
                this.#side.clear(x, y);
                this.#corner.set(x, y);
                this.#interior.clear(x, y);
                break;

            case TileState.Empty:
                this.#side.clear(x, y);
                this.#corner.clear(x, y);
                this.#interior.clear(x, y);
                break;
            default:
                throw new TypeError(`invalid state: "${state}"`);
        }
    }

    resize(w: bigint, h: bigint): Blokus {
        return new Blokus(
            this.#side.resize(w, h),
            this.#corner.resize(w, h),
            this.#interior.resize(w, h),
        )
    }

    rotateClockwise(): Blokus {
        return new Blokus(
            this.#side.rotateClockwise(),
            this.#corner.rotateClockwise(),
            this.#interior.rotateClockwise(),
        );
    }

    translateInPlace(x: bigint, y: bigint) {
        this.#side.translateInPlace(x, y);
        this.#corner.translateInPlace(x, y);
        this.#interior.translateInPlace(x, y);
    }

    assertValid() {
        console.assert((this.#corner.bits & this.#interior.bits) === 0n);
        console.assert((this.#corner.bits & this.#side.bits) === 0n);
        console.assert((this.#side.bits & this.#interior.bits) === 0n);
    }

    tryPlacePolyomino(x: bigint, y: bigint, polyomino: Blokus, polyX: bigint, polyY: bigint): boolean {
        const trPolyomino = polyomino.resize(this.#corner.width, this.#corner.height);
        trPolyomino.translateInPlace(x - polyX, y - polyY);

        // interior pieces cannot be placed onto side or interior pieces.
        if ((this.#interior.bits & (trPolyomino.#interior.bits | trPolyomino.#side.bits)) != 0n) {
            return false;
        }


        this.#interior.bits |= trPolyomino.#interior.bits;
        this.#side.bits |= (trPolyomino.#side.bits & ~this.#interior.bits);
        this.#corner.bits |= (trPolyomino.#corner.bits & ~(this.#interior.bits | this.#side.bits));
        this.#corner.bits &= ~(trPolyomino.#interior.bits | trPolyomino.#side.bits);
        this.#side.bits &= ~(trPolyomino.#interior.bits);
        return true;
    }
}
