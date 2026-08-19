import { CanonicalFormStore } from "../solver/CanonicalFormStore.js";
/** Recursively compute the canonical value of a normal-play Nim position (impartial). */
export function solveNim(nim) {
    const canonicalFormStore = new CanonicalFormStore();
    const canonicalForm = canonicalFormStore.solve(nim);
    return canonicalForm;
}
export class Nim {
    piles;
    constructor(piles) {
        this.piles = piles;
    }
    *moves() {
        // on a given turn, a player may take any number of stones from any pile, so long as they take at least one stone.
        for (const [index, pile] of this.piles.entries()) {
            for (let i = 1n; i <= pile; i++) {
                yield new Nim(this.piles.map((p, j) => (j === index ? p - i : p)));
            }
        }
    }
    *movesLeft() {
        yield* this.moves();
    }
    *movesRight() {
        yield* this.moves();
    }
    hash() {
        return this.piles.join(',');
    }
}
