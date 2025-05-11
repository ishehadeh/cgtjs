import { CanonicalForm } from "./CanonicalForm";
import { Blokus, TileState } from "./game/Blokus";
import { canonicalForm, MoveSet } from "./MoveSet";
import type { NumberUpStar } from "./NumberUpStar";

function solve(blokus: Blokus, poly: Blokus[]): NumberUpStar|MoveSet {
    const canonMoves = []
    for (const move of blokus.moves(poly)) {
        canonMoves.push(solve(move, poly));
    }

    return canonicalForm(canonMoves, canonMoves);
}

const DOMINO = Blokus.fromString(`
    cssc
    siis
    sis
    csc`);

const game = Blokus.empty(9n, 3n);
game.set(0n, 0n, TileState.Corner);
console.log(`Impartial, Domino only, ${game.width}x${game.height} = `, solve(game, [DOMINO]).toString());