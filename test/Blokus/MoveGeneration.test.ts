import { describe, expect, test } from 'bun:test';
import { Blokus } from '../../cgtjs/game/Blokus';
import { uniqueBy } from '../../cgtjs/utils/unique';
import { DOMINO, L4 } from './util/pieces';

test('rotate domino 90, 180, 270, and 360 degrees', () => {
  let domino = DOMINO.clone();
  expect(
    domino.isEqualTo(
      Blokus.fromString(`
        csc
        sis
        sis
        csc`),
    ),
  ).toBe(true);

  domino = domino.rotateClockwise();
  expect(
    domino.isEqualTo(
      Blokus.fromString(`
        cssc
        siis
        cssc`),
    ),
  ).toBe(true);

  domino = domino.rotateClockwise();
  expect(
    domino.isEqualTo(
      Blokus.fromString(`
        csc
        sis
        sis
        csc`),
    ),
    domino.toStringBoard(),
  ).toBe(true);

  domino = domino.rotateClockwise();
  expect(
    domino.isEqualTo(
      Blokus.fromString(`
        cssc
        siis
        cssc`),
    ),
  ).toBe(true);
});

test('blokus generates correct moves for domino 4x4', () => {
  const game = Blokus.fromString(
    `c...
         ....
         ....
         ....`,
  );
  const moves = uniqueBy([...game.moves([DOMINO])], (move) => move.toString());
  expect(moves.length).toBe(2);
  expect(moves.map((m) => m.toString())).toEqual([
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

test('blokus generates correct moves for domino 3x1', () => {
  const game = Blokus.fromString(`c..`);
  const moves = uniqueBy([...game.moves([DOMINO])], (move) => move.toString());
  expect(moves.length).toBe(1);
  expect(moves.map((m) => m.toStringBoard())).toEqual([Blokus.fromString(`iis`).toStringBoard()]);
});

test('top right corner', () => {
  const game = Blokus.fromString(
    `is.
         isc
         sis
         sis
         csc`,
  );
  const moves = uniqueBy([...game.moves([DOMINO])], (move) => move.toString());
  expect(moves.length).toBe(1);
  expect(moves.map((m) => m.toString())).toEqual([
    Blokus.fromString(
      `isi
         isi
         sis
         sis
         csc`,
    ).toString(),
  ]);
});

test('allows placing side square of polyomino on interior square', () => {
  const game = Blokus.fromString(
    `ci
         .i`,
  );
  const moves = uniqueBy([...game.moves([DOMINO])], (move) => move.toString());
  expect(moves.map((m) => m.toStringBoard())).toEqual(['ii\nii\n']);
});

describe('integration', () => {
  test('L4 wire puzzle', () => {
    // this is an L4 wire for (TBD if it works) for proving blokus is NP-Complete by reduction to circuit sat.
    const game = Blokus.fromString(
      `
    ..i..i..
    iii..iii
    i......i
    iii..iii
    .i....i.
    .ii..ii.
    iiisciii
    iiiis..i
    iiiisiii`,
    );
    const moves = uniqueBy([...game.moves([L4])], (move) => move.toString());
    expect(moves.length).toBe(2);
    expect(moves.map((m) => m.toString())).toEqual([
      Blokus.fromString(`
    ..i..i..
    iii..iii
    i......i
    iiicsiii
    .i.siii.
    .iisiii.
    iiisiiii
    iiiisc.i
    iiiisiii`).toString(),
      Blokus.fromString(`
    ..i..i..
    iii..iii
    i......i
    iiissiii
    .isiisi.
    .iisiii.
    iiisiiii
    iiiisc.i
    iiiisiii`).toString(),
    ]);
  });
});
