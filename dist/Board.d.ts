export declare class BitBoard {
    #private;
    /** Bit-packed backing store (`ceil(w*h / 32)` words), row-major, bit 0 = (0,0). Extra high bits are always cleared. */
    get words(): Readonly<Uint32Array>;
    get width(): number;
    get height(): number;
    /**
     * Deserialize from `toString()` format: one row per line, `'0'` / `'1'`, optional outer whitespace ignored.
     */
    static fromString(str: string): BitBoard;
    /**
     * Build a board from consecutive low-order bits (`bit i → cell (i % w, floor(i/w))`).
     */
    static fromLinearPacked(w: number, h: number, packed: number): BitBoard;
    /** Read contiguous bytes (`bit byteIndex*8+b` from byte’s LSB; matches `writePackedBytes` / Blokus `serialize`). */
    static fromPackedBytes(width: number, height: number, dataView: DataView, byteOffset: number, fieldSizeBytes: number): BitBoard;
    writePackedBytes(dataView: DataView, byteOffset: number, fieldSizeBytes: number): void;
    constructor(w: number, h: number, initialWords?: Uint32Array);
    equals(other: BitBoard): boolean;
    resize(w: number, h: number): BitBoard;
    clone(): BitBoard;
    translateInPlace(x: number, y: number): void;
    translate(x: number, y: number): BitBoard;
    get(x: number, y: number): boolean;
    getByIndex(i: number): boolean;
    set(x: number, y: number): void;
    clear(x: number, y: number): void;
    flipVerticalInPlace(): void;
    transpose(): BitBoard;
    flipHorizontalInPlace(): void;
    flipHorizontal(): BitBoard;
    flipVertical(): BitBoard;
    toString(): string;
    rotateClockwise(): BitBoard;
    /**
     * Iterate the cells that are "true" (have a '1' value in the bitboard)
     *
     * @returns a generator that yields the x and y coordinates of the cells that are "true", in the form [x, y]
     */
    iterSet(): Generator<[number, number], void>;
    iterClear(): Generator<[number, number], void>;
    toBase64(): string;
}
/**
 * Efficient bit permutation using delta swaps (`board`, `mask`, `delta` are treated as unsigned 32-bit values).
 *
 * More detail:
 * https://reflectionsonsecurity.wordpress.com/2014/05/11/efficient-bit-permutation-using-delta-swaps/
 */
export declare function deltaSwap(board: number, mask: number, delta: number): number;
