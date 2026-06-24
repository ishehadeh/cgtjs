import { expect, test } from 'vitest';
import { BitBoard } from '../../cgtjs/Board';
import { BlokusCram } from '../../cgtjs/game/BlokusCram';

const DOMINO = BitBoard.fromString(`11`);
const DOMINO_V = BitBoard.fromString(`1
1`);
const MONOMINO = BitBoard.fromString(`1`);

test('canPlacePolyomino - empty board allows placement', () => {
  const board = new BlokusCram(
    BitBoard.fromString(`
    00
    00`),
    [DOMINO],
  );

  expect(board.canPlacePolyomino(DOMINO, 0, 0)).toBe(true);
});

test('canPlacePolyomino - board with one tile blocks placement adjecent to it', () => {
  const board = new BlokusCram(
    BitBoard.fromString(`
    01
    00
    00
  `),
    [DOMINO],
  );

  expect(board.canPlacePolyomino(DOMINO, 0, 0)).toBe(false);
  expect(board.canPlacePolyomino(DOMINO, 1, 0)).toBe(false);
  expect(board.canPlacePolyomino(DOMINO, 1, 1)).toBe(false);
  expect(board.canPlacePolyomino(DOMINO, 0, 2)).toBe(true);
});

test('canPlacePolyomino - board with one tile does not block placement diagonal to it', () => {
  const board = new BlokusCram(
    BitBoard.fromString(`
    01
    00
    00
  `),
    [DOMINO_V],
  );
  expect(board.canPlacePolyomino(DOMINO_V, 0, 0)).toBe(false);
  expect(board.canPlacePolyomino(DOMINO_V, 1, 0)).toBe(false);
  expect(board.canPlacePolyomino(DOMINO_V, 1, 1)).toBe(false);
  expect(board.canPlacePolyomino(DOMINO_V, 0, 2)).toBe(false);
  expect(board.canPlacePolyomino(DOMINO_V, 0, 1)).toBe(true);
});

test('canPlacePolyomino - blocked spaces prevent placement', () => {
  const board = new BlokusCram(
    BitBoard.fromString(`
    000
    000
  `),
    [DOMINO],
    BitBoard.fromString(`
    010
    000
  `),
  );

  expect(board.canPlacePolyomino(DOMINO, 0, 0)).toBe(false);
  expect(board.canPlacePolyomino(DOMINO, 1, 0)).toBe(false);
  expect(board.canPlacePolyomino(DOMINO, 0, 1)).toBe(true);
});

test('moves - blocked spaces stay blocked in child positions', () => {
  const blocked = BitBoard.fromString(`00001`);
  const board = new BlokusCram(BitBoard.fromString(`00000`), [MONOMINO], blocked);

  const firstMove = [...board.moves()].find((move) => move.toString() === '10000\n');

  expect(firstMove).toBeDefined();
  if (firstMove === undefined) {
    throw new Error('expected a move at the left edge');
  }
  expect(firstMove.blocked?.toString()).toBe(blocked.toString());
  expect([...firstMove.moves()].map((move) => move.toString())).not.toContain('10001\n');
});
