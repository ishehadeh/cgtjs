import type { CanonicalForm } from '../CanonicalForm.ts';
import { CanonicalFormStore } from '../solver/CanonicalFormStore.ts';
import type { Game } from '../solver/Game.ts';

/** Recursively compute the canonical value of a normal-play Nim position (impartial). */
export function solveNim(nim: Nim): CanonicalForm {
  const canonicalFormStore = new CanonicalFormStore<Nim>();
  const canonicalForm = canonicalFormStore.solve(nim);
  return canonicalForm;
}

export class Nim implements Game<Nim> {
  public readonly piles: bigint[];

  constructor(piles: bigint[]) {
    this.piles = piles;
  }

  public *moves(): Generator<Nim> {
    // on a given turn, a player may take any number of stones from any pile, so long as they take at least one stone.
    for (const [index, pile] of this.piles.entries()) {
      for (let i = 1n; i <= pile; i++) {
        yield new Nim(this.piles.map((p, j) => (j === index ? p - i : p)));
      }
    }
  }

  public *movesLeft(): Generator<Nim> {
    yield* this.moves();
  }

  public *movesRight(): Generator<Nim> {
    yield* this.moves();
  }

  public hash(): string {
    return this.piles.join(',');
  }
}
