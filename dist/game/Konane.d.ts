import type { Game } from '../solver/Game.ts';
export type KonanePlayer = 'black' | 'white';
export type KonaneTile = KonanePlayer | 'empty';
/**
 * A single Konane move: hop along a line from (fromX, fromY) to (toX, toY), capturing
 * the intervening opponent pieces.
 */
export declare class KonaneMove {
    #private;
    constructor(fromX: bigint | number, fromY: bigint | number, toX: bigint | number, toY: bigint | number);
    get fromX(): bigint;
    get fromY(): bigint;
    get toX(): bigint;
    get toY(): bigint;
    clearedCells(): Generator<{
        x: bigint;
        y: bigint;
    }, void, void>;
}
/**
 * Bit-parallel move enumeration for a player (Hawaiian checkers / Konane).
 */
export declare class KonaneMoveGenerator {
    #private;
    constructor(game: Konane, player: KonanePlayer);
    private setDir;
    hop(): void;
    currentMoves(): Generator<KonaneMove, void, void>;
    allMovesInCurrentDirection(): Generator<KonaneMove, void, void>;
    allMoves(): Generator<KonaneMove, void, void>;
}
/**
 * Konane (Hawaiian checkers): black ("x") and white ("o") on a board; a move is a
 * series of orthogonally adjacent jumps that capture the jumped pieces.
 * Left/Right in CGT terms: black = movesLeft, white = movesRight.
 */
export declare class Konane implements Game<Konane> {
    #private;
    get width(): bigint;
    get height(): bigint;
    /** Raw occupied-by-black bitboard (exposed for {@link KonaneMoveGenerator}). */
    get blackBits(): bigint;
    /** Raw occupied-by-white bitboard (exposed for {@link KonaneMoveGenerator}). */
    get whiteBits(): bigint;
    constructor(w: bigint | number, h: bigint | number);
    static fromString(boardStr: string): Konane;
    boardMask(): bigint;
    private tileIndex;
    rowMask(n?: bigint): bigint;
    columnMask(n?: bigint): bigint;
    /** Border 0 = left, 1 = right, 2 = down, 3 = up */
    borderMask(border: 0 | 1 | 2 | 3): bigint;
    emptyMask(): bigint;
    setTile(x: bigint | number, y: bigint | number, state: KonaneTile): void;
    getTile(x: bigint | number, y: bigint | number): KonaneTile;
    /**
     * Move generator for the given player. Prefer {@link Konane.prototype.movesLeft} /
     * {@link Konane.prototype.movesRight} for the {@link Game} interface.
     */
    moves(player: KonanePlayer): KonaneMoveGenerator;
    movesFrom(fromX: bigint | number, fromY: bigint | number): Generator<KonaneMove, void, void>;
    applyMove(move: KonaneMove, player: KonanePlayer): void;
    movesLeft(): Generator<Konane, void, void>;
    movesRight(): Generator<Konane, void, void>;
    hash(): string;
    serialize(): bigint;
    toString(): string;
    /**
     * Copy with a new size: keeps existing rows, adding empty cells to the right and bottom
     * when growing.
     */
    cloneWithSize(newW: bigint | number, newH: bigint | number): Konane;
    clone(): Konane;
    isEqualTo(other: Konane): boolean;
}
