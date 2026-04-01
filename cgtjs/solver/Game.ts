/**
 * Abstract interface for specific game state
 */
export interface Game<T extends Game<T>> {
  /**
   * Get all of the 'left' player's moves.
   * This method should never throw
   *
   * @generator
   * @yields {T}
   */
  movesLeft(): Generator<T, void, void>;

  /**
   * Get all of the 'right' player's moves.
   * This method should never throw
   *
   * @generator
   * @yields {T}
   */
  movesRight(): Generator<T, void, void>;

  /**
   * Get A unique and deterministic hash for the game.
   * This method should never throw
   *
   * @returns {string}
   */
  hash(): string;
}
