import { BitBoard } from "../../Board.js";
export var TileState;
(function (TileState) {
    TileState["Interior"] = "interior";
    TileState["Corner"] = "corner";
    TileState["Side"] = "side";
    TileState["Empty"] = "empty";
})(TileState || (TileState = {}));
export class Blokus {
    #side;
    #corner;
    #interior;
    get width() {
        return this.#side.width;
    }
    get height() {
        return this.#side.height;
    }
    get corners() {
        return this.#corner;
    }
    get interiors() {
        return this.#interior;
    }
    get sides() {
        return this.#side;
    }
    constructor(side, corner, interior) {
        this.#side = side;
        this.#corner = corner;
        this.#interior = interior;
    }
    static empty(w, h) {
        return new Blokus(new BitBoard(w, h), new BitBoard(w, h), new BitBoard(w, h));
    }
    static fromString(str) {
        const rowsTrimmed = str
            .split('\n')
            .map((r) => r.trim())
            .filter((r) => r.length !== 0);
        const w = Math.max(...rowsTrimmed.map((r) => r.length));
        const h = rowsTrimmed.length;
        const game = Blokus.empty(w, h);
        let y = 0;
        for (const row of rowsTrimmed) {
            let x = 0;
            for (const cell of row) {
                switch (cell) {
                    case '.':
                        game.set(x, y, TileState.Empty);
                        break; // empty
                    case 'i':
                        game.set(x, y, TileState.Interior);
                        break;
                    case 'c':
                        game.set(x, y, TileState.Corner);
                        break;
                    case 's':
                        game.set(x, y, TileState.Side);
                        break;
                    default:
                        throw TypeError('unexpected character');
                }
                x += 1;
            }
            y += 1;
        }
        return game;
    }
    isEqualTo(other) {
        return (other.width === this.width &&
            other.height === this.height &&
            other.#corner.equals(this.#corner) &&
            other.#side.equals(this.#side) &&
            other.#interior.equals(this.#interior));
    }
    toStringBoard() {
        let boardStr = '';
        for (let y = 0; y < this.height; ++y) {
            for (let x = 0; x < this.width; ++x) {
                switch (this.get(x, y)) {
                    case TileState.Side:
                        boardStr += 's';
                        break;
                    case TileState.Corner:
                        boardStr += 'c';
                        break;
                    case TileState.Interior:
                        boardStr += 'i';
                        break;
                    case TileState.Empty:
                        boardStr += '.';
                        break;
                }
            }
            boardStr += '\n';
        }
        return boardStr;
    }
    get(x, y) {
        if (this.#side.get(x, y))
            return TileState.Side;
        if (this.#corner.get(x, y))
            return TileState.Corner;
        if (this.#interior.get(x, y))
            return TileState.Interior;
        return TileState.Empty;
    }
    getByIndex(i) {
        if (this.#side.getByIndex(i))
            return TileState.Side;
        if (this.#corner.getByIndex(i))
            return TileState.Corner;
        if (this.#interior.getByIndex(i))
            return TileState.Interior;
        return TileState.Empty;
    }
    set(x, y, state) {
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
    clone() {
        return new Blokus(this.#side.clone(), this.#corner.clone(), this.#interior.clone());
    }
    /**
     * Get a string representation of the object.
     */
    toString() {
        return `Blokus(${this.width}, ${this.height}, [${this.#side.words.toString()}], [${this.#corner.toString()}], [${this.#interior.toString()}])`;
    }
    serialize() {
        const littleEndian = false;
        const cells = this.height * this.width;
        const fieldSize = (cells + 7) >> 3;
        const size = 2 + 2 + fieldSize * 3;
        const buffer = new ArrayBuffer(size);
        const dataView = new DataView(buffer);
        // first three bytes give the size of each field.
        // height and width are always 16 bit.
        dataView.setUint16(0, this.width, littleEndian); // width
        dataView.setUint16(2, this.height, littleEndian); // height
        let offset = 4;
        for (const board of [this.#side, this.#corner, this.#interior]) {
            board.writePackedBytes(dataView, offset, fieldSize);
            offset += fieldSize;
        }
        return buffer;
    }
    static deserialize(buffer) {
        const littleEndian = false;
        const dataView = new DataView(buffer);
        const width = dataView.getUint16(0, littleEndian);
        const height = dataView.getUint16(2, littleEndian);
        const cells = width * height;
        const fieldSize = (cells + 7) >> 3;
        let offset = 4;
        const side = BitBoard.fromPackedBytes(width, height, dataView, offset, fieldSize);
        offset += fieldSize;
        const corner = BitBoard.fromPackedBytes(width, height, dataView, offset, fieldSize);
        offset += fieldSize;
        const interior = BitBoard.fromPackedBytes(width, height, dataView, offset, fieldSize);
        return new Blokus(side, corner, interior);
    }
    countInterior() {
        const cc = this.width * this.height;
        let count = 0;
        for (let i = 0; i < cc; i++) {
            if (this.#interior.getByIndex(i)) {
                count++;
            }
        }
        return count;
    }
    resize(w, h) {
        return new Blokus(this.#side.resize(w, h), this.#corner.resize(w, h), this.#interior.resize(w, h));
    }
    rotateClockwise() {
        return new Blokus(this.#side.rotateClockwise(), this.#corner.rotateClockwise(), this.#interior.rotateClockwise());
    }
    flipHorizontal() {
        return new Blokus(this.#side.flipHorizontal(), this.#corner.flipHorizontal(), this.#interior.flipHorizontal());
    }
    flipVertical() {
        return new Blokus(this.#side.flipVertical(), this.#corner.flipVertical(), this.#interior.flipVertical());
    }
    translateInPlace(x, y) {
        this.#side.translateInPlace(x, y);
        this.#corner.translateInPlace(x, y);
        this.#interior.translateInPlace(x, y);
    }
    assertValid() {
        const cc = this.width * this.height;
        const wc = (cc + 31) >>> 5;
        const rem = cc & 31;
        const lastMask = rem === 0 ? 0xffff_ffff >>> 0 : (0xffff_ffff >>> (32 - rem)) >>> 0;
        const side = [...this.#side.words];
        const corner = [...this.#corner.words];
        const interior = [...this.#interior.words];
        for (let wi = 0; wi < wc; wi++) {
            const mask = wi === wc - 1 ? lastMask : 0xffff_ffff >>> 0;
            console.assert((((corner[wi] & interior[wi]) >>> 0) & mask) === 0);
            console.assert((((corner[wi] & side[wi]) >>> 0) & mask) === 0);
            console.assert((((side[wi] & interior[wi]) >>> 0) & mask) === 0);
        }
    }
    tryPlacePolyomino(boardX, boardY, polyomino, polyX = 0, polyY = 0) {
        const changes = [];
        for (let x = 0; x < polyomino.width; ++x) {
            for (let y = 0; y < polyomino.height; ++y) {
                const tileX = x + boardX - polyX;
                const tileY = y + boardY - polyY;
                const isOutOfBounds = tileX < 0 || tileY < 0 || tileX >= this.width || tileY >= this.height;
                const polyTile = polyomino.get(x, y);
                const boardTile = this.get(tileX, tileY);
                // tried to place an polyomino tile out of bounds
                if (isOutOfBounds) {
                    if (polyTile === TileState.Interior) {
                        return false;
                    }
                    else {
                        continue;
                    }
                }
                if (polyTile === TileState.Interior) {
                    if (boardTile === TileState.Side || boardTile === TileState.Interior) {
                        return false;
                    }
                    else {
                        changes.push([tileX, tileY, polyTile]);
                    }
                }
                else if (polyTile === TileState.Corner) {
                    // corner only overrides empty, but it can be placed on something
                    if (boardTile === TileState.Empty) {
                        changes.push([tileX, tileY, polyTile]);
                    }
                }
                else if (polyTile === TileState.Empty) {
                    // nothing to do
                }
                else if (polyTile === TileState.Side) {
                    if (boardTile === TileState.Interior) {
                    }
                    else {
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
    *movesDeduplicated(polyominos) {
        const alreadySeen = new Set();
        for (const child of this.moves(polyominos)) {
            const serialized = child.toString();
            if (!alreadySeen.has(serialized)) {
                alreadySeen.add(serialized);
                yield child;
            }
        }
    }
    /**
     * enumerate all possible moves for a given set of polyominos.
     *
     * @param polyominos
     */
    *moves(polyominos) {
        for (const polyomino of polyominos) {
            let currentPoly = polyomino;
            for (let mirror = 0; mirror < 2; ++mirror) {
                if (mirror > 0) {
                    currentPoly = currentPoly.flipHorizontal();
                }
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
                            for (const [offsetX, offsetY] of [
                                [1, 1],
                                [-1, 1],
                                [1, -1],
                                [-1, -1],
                            ]) {
                                const boardInteriorX = boardX + offsetX;
                                const boardInteriorY = boardY + offsetY;
                                const pieceInteriorX = polyX - offsetX;
                                const pieceInteriorY = polyY - offsetY;
                                if (boardInteriorX >= 0 &&
                                    boardInteriorX < this.width &&
                                    boardInteriorY >= 0 &&
                                    boardInteriorY < this.height &&
                                    this.get(boardInteriorX, boardInteriorY) !== TileState.Interior) {
                                    continue;
                                }
                                if (currentPoly.get(pieceInteriorX, pieceInteriorY) !== TileState.Interior) {
                                    continue;
                                }
                                // Create a copy of the board to test the move
                                const newBoard = this.clone();
                                // Try to place the polyomino
                                if (newBoard.tryPlacePolyomino(boardInteriorX, boardInteriorY, currentPoly, polyX, polyY)) {
                                    yield newBoard;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
