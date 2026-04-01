import type { Game } from './Game';

export class MoveStore<G extends Game<G>> {
  /**
   * All games that have been seen, the index of the game is it's 'id'
   */
  private readonly games: G[] = [];

  /**
   * A map of game hash -> id, for faster look up of game ids.
   */
  private readonly gameIdMap: Map<string, number> = new Map();

  /**
   * Left moves for a game, where the index is the game id.
   */
  private readonly leftMoveSets: number[][] = [];

  /**
   * Right moves for a game, where the index is the game id.
   */
  private readonly rightMoveSets: number[][] = [];

  public leftMoves(state: G): G[] {
    return this.getLeftMoveIds(this.getGameId(state)).map((id) => this.idToGame(id));
  }

  public rightMoves(state: G): G[] {
    return this.getRightMoveIds(this.getGameId(state)).map((id) => this.idToGame(id));
  }

  public getLeftMoveIds(gameId: number): number[] {
    let leftMoves = this.leftMoveSets[gameId];
    if (leftMoves === undefined) {
      leftMoves = [];
      for (const move of this.idToGame(gameId).movesLeft()) {
        leftMoves.push(this.getGameId(move));
      }
      this.leftMoveSets[gameId] = leftMoves;
    }
    return leftMoves;
  }

  public getRightMoveIds(gameId: number): number[] {
    let rightMoves = this.rightMoveSets[gameId];
    if (rightMoves === undefined) {
      rightMoves = [];
      for (const move of this.idToGame(gameId).movesRight()) {
        rightMoves.push(this.getGameId(move));
      }
      this.rightMoveSets[gameId] = rightMoves;
    }
    return rightMoves;
  }

  public *iterGames(): Generator<G> {
    for (const game of this.games) {
      yield game;
    }
  }

  public idToGame(id: number): G {
    if (id < 0 || id >= this.games.length) {
      throw new Error(`Unknown game id ${id}`);
    }
    return this.games[id];
  }

  public getGameId(state: G): number {
    const id = this.gameIdMap.get(state.hash());
    if (id === undefined) {
      const newId = this.games.length;
      this.games.push(state);
      this.gameIdMap.set(state.hash(), newId);
      return newId;
    }
    return id;
  }
}
