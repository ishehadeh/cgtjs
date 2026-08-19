import { expect, test } from 'vitest';
import { BitBoard } from '../../cgtjs/Board';
import { BlokusCram } from '../../cgtjs/game/BlokusCram';
import { MoveStore } from '../../cgtjs/solver/MoveStore';

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

test('hash - differs when only blocked differs', () => {
  const board = BitBoard.fromString('00');
  const unblocked = new BlokusCram(board.clone(), [MONOMINO], null);
  const blocked = new BlokusCram(board.clone(), [MONOMINO], BitBoard.fromString('01'));

  expect(unblocked.hash()).not.toBe(blocked.hash());
});

test('hash - two different blocked boards also produce different hashes', () => {
  const board = BitBoard.fromString('00');
  const blockedLeft = new BlokusCram(board.clone(), [MONOMINO], BitBoard.fromString('10'));
  const blockedRight = new BlokusCram(board.clone(), [MONOMINO], BitBoard.fromString('01'));

  expect(blockedLeft.hash()).not.toBe(blockedRight.hash());
});

test('MoveStore - games sharing board and polyominos but differing in blocked keep distinct move sets', () => {
  const board = BitBoard.fromString('00');
  const unblocked = new BlokusCram(board.clone(), [MONOMINO], null);
  const blocked = new BlokusCram(board.clone(), [MONOMINO], BitBoard.fromString('01'));

  const store = new MoveStore<BlokusCram>();

  const unblockedMoves = store.leftMoves(unblocked).map((move) => move.toString());
  const blockedMoves = store.leftMoves(blocked).map((move) => move.toString());

  // unblocked can place at either cell; blocked can only place at cell 0.
  expect(unblockedMoves.sort()).toEqual(['01\n', '10\n'].sort());
  expect(blockedMoves).toEqual(['10\n']);
});
