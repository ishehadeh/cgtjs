import type { CanonicalForm } from '../CanonicalForm.ts';
import type { Game } from './Game.ts';
import { MoveStore } from './MoveStore.ts';
export declare class CanonicalFormStore<G extends Game<G>> {
    /**
     * A map of game id -> canonical form, for faster look up of canonical forms.
     */
    private readonly canonicalFormMap;
    private solveQueue;
    private readonly moveStore;
    constructor(moveStore?: MoveStore<G>);
    private getCanonicalForm;
    /**
     * Solve the next game in the queue.
     * Returns true if a game was solved, false if the queue is empty.
     */
    solveNext(): 'solved' | 'queued' | 'empty';
    solve(game: G): CanonicalForm;
}
