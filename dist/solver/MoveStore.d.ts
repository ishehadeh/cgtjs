import type { Game } from './Game.ts';
export declare class MoveStore<G extends Game<G>> {
    /**
     * All games that have been seen, the index of the game is it's 'id'
     */
    private readonly games;
    /**
     * A map of game hash -> id, for faster look up of game ids.
     */
    private readonly gameIdMap;
    /**
     * Left moves for a game, where the index is the game id.
     */
    private readonly leftMoveSets;
    /**
     * Right moves for a game, where the index is the game id.
     */
    private readonly rightMoveSets;
    leftMoves(state: G): G[];
    rightMoves(state: G): G[];
    getLeftMoveIds(gameId: number): number[];
    getRightMoveIds(gameId: number): number[];
    iterGames(): Generator<G>;
    idToGame(id: number): G;
    getGameId(state: G): number;
}
