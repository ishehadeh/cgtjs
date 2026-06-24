import type { BitBoard } from '../Board.ts';
import type { Game } from '../solver/Game.ts';
/**
 * Impartial Blokus, where players can place any of the given polyominos anywhere on the board.
 */
export declare class BlokusCram implements Game<BlokusCram> {
    #private;
    /**
     *
     * @param board Current set of spaces where polyominos have been placed. A 1 bit indicates a space that is already occupied.
     * @param blocked A board of spaces that can't be played, useful for oddly shaped or non-rectangular boards. If null, the board is assumed to be rectangular and unblocked.
     * @param polyominos
     */
    constructor(board: BitBoard, polyominos: BitBoard[], blocked?: BitBoard | null);
    get polyominos(): Readonly<BitBoard[]>;
    get board(): Readonly<BitBoard>;
    get blocked(): Readonly<BitBoard> | null;
    canPlacePolyomino(polyomino: BitBoard, x: number, y: number): boolean;
    tryPlacePolyomino(polyomino: BitBoard, x: number, y: number): boolean;
    mustPlacePolyomino(polyomino: BitBoard, x: number, y: number): void;
    moves(): Generator<BlokusCram, void, unknown>;
    movesLeft(): Generator<BlokusCram, void, void>;
    movesRight(): Generator<BlokusCram, void, void>;
    hash(): string;
    toString(): string;
}
