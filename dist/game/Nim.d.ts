import type { CanonicalForm } from '../CanonicalForm.ts';
import type { Game } from '../solver/Game.ts';
/** Recursively compute the canonical value of a normal-play Nim position (impartial). */
export declare function solveNim(nim: Nim): CanonicalForm;
export declare class Nim implements Game<Nim> {
    readonly piles: bigint[];
    constructor(piles: bigint[]);
    moves(): Generator<Nim>;
    movesLeft(): Generator<Nim>;
    movesRight(): Generator<Nim>;
    hash(): string;
}
