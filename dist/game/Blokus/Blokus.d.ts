import { BitBoard } from '../../Board.ts';
export declare enum TileState {
    Interior = "interior",
    Corner = "corner",
    Side = "side",
    Empty = "empty"
}
export declare class Blokus {
    #private;
    get width(): number;
    get height(): number;
    get corners(): BitBoard;
    get interiors(): BitBoard;
    get sides(): BitBoard;
    constructor(side: BitBoard, corner: BitBoard, interior: BitBoard);
    static empty(w: number, h: number): Blokus;
    static fromString(str: string): Blokus;
    isEqualTo(other: Blokus): boolean;
    toStringBoard(): string;
    get(x: number, y: number): TileState;
    getByIndex(i: number): TileState;
    set(x: number, y: number, state: TileState): void;
    clone(): Blokus;
    /**
     * Get a string representation of the object.
     */
    toString(): string;
    serialize(): ArrayBuffer;
    static deserialize(buffer: ArrayBufferLike): Blokus;
    countInterior(): number;
    resize(w: number, h: number): Blokus;
    rotateClockwise(): Blokus;
    flipHorizontal(): Blokus;
    flipVertical(): Blokus;
    translateInPlace(x: number, y: number): void;
    assertValid(): void;
    tryPlacePolyomino(boardX: number, boardY: number, polyomino: Blokus, polyX?: number, polyY?: number): boolean;
    movesDeduplicated(polyominos: Blokus[]): Generator<Blokus, void, void>;
    /**
     * enumerate all possible moves for a given set of polyominos.
     *
     * @param polyominos
     */
    moves(polyominos: Blokus[]): Generator<Blokus, void, void>;
}
