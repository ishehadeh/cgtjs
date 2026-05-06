import { expect, test } from 'vitest';
import { Blokus } from '../../cgtjs/game/Blokus/Blokus';

const DOMINO = Blokus.fromString(`
        csc
        sis
        sis
        csc`);

test('place a domino in empty 8x8', () => {
  const game = Blokus.empty(8, 8);
  expect(game.tryPlacePolyomino(0, 0, DOMINO, 0, 0)).toBe(true);
  expect(
    game.isEqualTo(
      Blokus.fromString(
        `
        csc.....
        sis.....
        sis....
        csc....
        ........
        ........
        ........
        ........`,
      ),
    ),
  ).toBe(true);
});

test('overlap interiors are not allowed', () => {
  const game = Blokus.empty(8, 8);
  expect(game.tryPlacePolyomino(0, 0, DOMINO, 0, 0)).toBe(true);
  expect(game.tryPlacePolyomino(0, 1, DOMINO, 0, 0)).toBe(false);

  expect(
    game.isEqualTo(
      Blokus.fromString(
        `
        csc.....
        sis.....
        sis....
        csc....
        ........
        ........
        ........
        ........`,
      ),
    ),
  ).toBe(true);
});

test('domino placed on corner is allowed', () => {
  const game = Blokus.empty(8, 8);
  expect(game.tryPlacePolyomino(0, 0, DOMINO, 0, 0)).toBe(true);
  expect(game.tryPlacePolyomino(2, 3, DOMINO, 1, 1)).toBe(true);

  expect(
    game.isEqualTo(
      Blokus.fromString(
        `
        csc.....
        sis.....
        sisc....
        csis....
        .sis....
        .csc....
        ........
        ........`,
      ),
    ),
  ).toBe(true);
});

test('domino placed on corner, rotate', () => {
  const game = Blokus.empty(8, 8);
  expect(game.tryPlacePolyomino(0, 0, DOMINO, 1, 1)).toBe(true);
  expect(game.tryPlacePolyomino(1, 2, DOMINO.rotateClockwise(), 1, 1)).toBe(true);

  expect(
    game.isEqualTo(
      Blokus.fromString(
        `
        is......
        issc....
        siis....
        cssc....
        ........
        ........
        ........
        ........`,
      ),
    ),
    `\n${game.toStringBoard()}`,
  ).toBe(true);
});

test('domino placed with overflowing side', () => {
  const game = Blokus.empty(8, 8);
  expect(game.tryPlacePolyomino(0, 0, DOMINO, 1, 1)).toBe(true);
  expect(game.tryPlacePolyomino(7, 6, DOMINO, 1, 1)).toBe(true);
  expect(game.tryPlacePolyomino(0, 6, DOMINO, 1, 1)).toBe(true);
  expect(game.tryPlacePolyomino(7, 0, DOMINO, 1, 1)).toBe(true);

  expect(
    game.isEqualTo(
      Blokus.fromString(
        `   is....si
            is....si
            sc....cs
            ........
            ........
            sc....cs
            is....si
            is....si`,
      ),
    ),
  ).toBe(true);
});
