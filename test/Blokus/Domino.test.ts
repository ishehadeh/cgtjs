import { expect, test } from 'bun:test';
import { Blokus, TileState } from '../../cgtjs/game/Blokus';
import { uniqueBy } from '../../cgtjs/utils/unique';
import { DOMINO } from './util/pieces';
import { canonicalForm, NumberUpStar, type MoveSet } from '../../cgtjs';

function solve(blokus: Blokus, poly: Blokus[]): NumberUpStar|MoveSet {
    const solveChildren: Blokus[] = []
    for (const child of blokus.moves(poly)) {

        let exists = false;
        for (const existingChild of solveChildren) {
            if (existingChild.isEqualTo(child)) {
                exists = true;
                break;
            }
        }
        if (!exists) {
            solveChildren.push(child);
        }
    }
    const canonMoves = solveChildren.map(child => solve(child, poly));
    return canonicalForm(canonMoves, canonMoves);
}

test('3x9', () => {
    const domino = DOMINO.clone();
    const board = Blokus.empty(3n, 9n);
    board.set(0n, 0n, TileState.Corner);
    
    const result = solve(board, [domino]);
    const expected = new NumberUpStar(0n, 0n, 2n);
    expect(result.partialCompare(expected), `got: ${result.toString()}`).toBe(0);
});
