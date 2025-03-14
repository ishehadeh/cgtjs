import { describe, expect, test } from 'bun:test';
import { Blokus } from '../../cgtjs/game/Blokus';
import { uniqueBy } from '../../cgtjs/utils/unique';

const DOMINO = Blokus.fromString(`
    csc
    sis
    sis
    csc`);

    
test('rotate domino 90, 180, 270, and 360 degrees', () => {
    let domino = DOMINO.clone();
    expect(domino.isEqualTo(Blokus.fromString(`
        csc
        sis
        sis
        csc`))).toBe(true);

    domino = domino.rotateClockwise();
    expect(domino.isEqualTo(Blokus.fromString(`
        cssc
        siis
        cssc`))).toBe(true);

    domino = domino.rotateClockwise();
    expect(domino.isEqualTo(Blokus.fromString(`
        csc
        sis
        sis
        csc`)), domino.toStringBoard()).toBe(true);
    
    domino = domino.rotateClockwise();
    expect(domino.isEqualTo(Blokus.fromString(`
        cssc
        siis
        cssc`))).toBe(true);

});

test('blokus generates correct moves for domino 4x4', () => {
    const game = Blokus.fromString(
        `c...
         ....
         ....
         ....`
    );
    const moves = uniqueBy([...game.moves([DOMINO])], move => move.toString());
    expect(moves.length).toBe(2);
    expect(moves.map(m => m.toString())).toEqual([
        Blokus.fromString(`is..
        is..
        sc..
        ....`).toString(),
        Blokus.fromString(`iis.
         ssc.
         ....
         ....`).toString(),
    ]);
});