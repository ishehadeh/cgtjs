import { BitBoard } from "../Board.ts";

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

    getByIndex(i: bigint): TileState {
        if (this.#side.getByIndex(i)) return TileState.Side;
        if (this.#corner.getByIndex(i)) return TileState.Corner;
        if (this.#interior.getByIndex(i)) return TileState.Interior;
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

    clone(): Blokus {
        return new Blokus(
            this.#side.clone(),
            this.#corner.clone(),
            this.#interior.clone(),
        );
    }

    /**
     * Get a string representation of the object.
     */
    toString(): string {
        return `Blokus(${this.width}, ${this.height}, ${this.#side.bits}, ${this.#corner.bits}, ${this.#interior.bits})`;
    }

    countInterior(): bigint {
        let bits = this.#interior.bits;
        let count = 0n;
        while (bits > 0n) {
            count += bits & 1n;
            bits >>= 1n;
        }

        return count;
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

    tryPlacePolyomino(boardX: bigint, boardY: bigint, polyomino: Blokus, polyX: bigint, polyY: bigint): boolean {
        const changes: [bigint, bigint, TileState][] = [];
        for (let x = 0n; x < polyomino.width; ++x) {
            for (let y = 0n; y < polyomino.height; ++y) {
                const tileX = x + boardX - polyX;
                const tileY = y + boardY - polyY;
                const isOutOfBounds = (tileX < 0 || tileY < 0 || tileX >= this.width || tileY >= this.height);

                const polyTile = polyomino.get(x, y);
                const boardTile = this.get(tileX, tileY);
                // tried to place an polyomino tile out of bounds
                if (isOutOfBounds) {
                    if (polyTile === TileState.Interior) {
                        return false;
                    } else {
                        continue;
                    }
                } 

                if (polyTile === TileState.Interior) {
                    if (boardTile === TileState.Side || boardTile === TileState.Interior) {
                        return false;
                    } else {
                        changes.push([tileX, tileY, polyTile]);
                    }
                } else if (polyTile === TileState.Corner) {
                    // corner only overrides empty, but it can be placed on something
                    if (boardTile === TileState.Empty) {
                        changes.push([tileX, tileY, polyTile]);
                    }
                } else if (polyTile === TileState.Empty) {
                    // nothing to do
                } else if (polyTile === TileState.Side) {
                    if (boardTile === TileState.Interior) {
                        return false;
                    } else {
                        changes.push([tileX, tileY, polyTile]);
                    }
                }
            }
        }
        for (const [x, y, state] of changes) {
            this.set(x, y, state);
        }

        return true;
    }

    /**
     * enumerate all possible moves for a given set of polyominos.
     * 
     * @param polyominos 
     */
    *moves(polyominos: Blokus[]): Generator<Blokus, void, void> {
        for (const polyomino of polyominos) {
            let currentPoly = polyomino;

            // Try all 4 rotations
            for (let rotation = 0; rotation < 4; rotation++) {
                // TODO: also check reflections
                if (rotation > 0) {
                    currentPoly = currentPoly.rotateClockwise();
                }

                // For each corner in the board
                for (const [boardX, boardY] of this.#corner.iterSet()) {
                    // For each corner in the polyomino
                    for (const [polyX, polyY] of currentPoly.#corner.iterSet()) {
                        // Create a copy of the board to test the move
                        const newBoard = this.clone();
                        // Try to place the polyomino
                        if (newBoard.tryPlacePolyomino(boardX, boardY, currentPoly, polyX + 1n, polyY + 1n)) {
                            yield newBoard;
                        }
                    }
                }
            }
        }
    }

}
