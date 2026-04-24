import type { CanonicalForm } from '../CanonicalForm.ts';
import { MoveSet } from '../MoveSet.ts';
import type { Game } from './Game.ts';
import { MoveStore } from './MoveStore.ts';

export class CanonicalFormStore<G extends Game<G>> {
  /**
   * A map of game id -> canonical form, for faster look up of canonical forms.
   */
  private readonly canonicalFormMap: Map<number, CanonicalForm> = new Map();
  private solveQueue: number[] = [];
  private readonly moveStore: MoveStore<G>;

  constructor(moveStore?: MoveStore<G>) {
    this.moveStore = moveStore ?? new MoveStore();
  }

  private getCanonicalForm(gameId: number): CanonicalForm {
    const canonicalForm = this.canonicalFormMap.get(gameId);
    if (canonicalForm === undefined) {
      throw new Error(
        `Canonical form missing for id ${gameId} but caller assumed it was ready; this is an internal error.`,
      );
    }
    return canonicalForm;
  }

  /**
   * Solve the next game in the queue.
   * Returns true if a game was solved, false if the queue is empty.
   */
  public solveNext(): 'solved' | 'queued' | 'empty' {
    const gameId = this.solveQueue.shift();
    if (gameId === undefined) {
      return 'empty';
    }

    const leftMoveIds = this.moveStore.getLeftMoveIds(gameId);
    const rightMoveIds = this.moveStore.getRightMoveIds(gameId);

    const leftCanonicalForms: CanonicalForm[] = [];
    const rightCanonicalForms: CanonicalForm[] = [];
    for (const leftMoveId of leftMoveIds) {
      if (!this.canonicalFormMap.has(leftMoveId)) {
        if (!this.solveQueue.includes(leftMoveId)) {
          this.solveQueue.push(leftMoveId);
        }
        break;
      }
      leftCanonicalForms.push(this.getCanonicalForm(leftMoveId));
    }
    for (const rightMoveId of rightMoveIds) {
      if (!this.canonicalFormMap.has(rightMoveId)) {
        if (!this.solveQueue.includes(rightMoveId)) {
          this.solveQueue.push(rightMoveId);
        }
        break;
      }
      rightCanonicalForms.push(this.getCanonicalForm(rightMoveId));
    }

    const allSolved =
      leftCanonicalForms.length === leftMoveIds.length && rightCanonicalForms.length === rightMoveIds.length;
    if (allSolved) {
      const moveSet = new MoveSet(leftCanonicalForms, rightCanonicalForms);
      const canonicalForm: CanonicalForm = moveSet.normalize();
      this.canonicalFormMap.set(gameId, canonicalForm);
      return 'solved';
    } else {
      if (!this.solveQueue.includes(gameId)) {
        this.solveQueue.push(gameId);
      }
      return 'queued';
    }
  }

  public solve(game: G): CanonicalForm {
    const gameId = this.moveStore.getGameId(game);
    this.solveQueue = [gameId];
    while (true) {
      const result = this.solveNext();

      if (result === 'empty') {
        break;
      }
    }
    const canonicalForm = this.canonicalFormMap.get(gameId);
    if (canonicalForm === undefined) {
      throw new Error(`Canonical form not found for game id ${gameId}, even after solving. This is a bug.`);
    }
    return canonicalForm;
  }
}
