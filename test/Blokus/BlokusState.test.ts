import { expect, test } from 'vitest';
import { Blokus, TileState } from '../../cgtjs/game/Blokus/Blokus';

test('set/get tile state', () => {
  const game = Blokus.empty(10, 10);
  game.set(3, 3, TileState.Corner);
  expect(game.get(3, 3)).toBe(TileState.Corner);
});

test('corners, sides, and interiors getters match get() for each cell', () => {
  const game = Blokus.fromString(`
        is.
        isc
        sis
        sis
        csc
    `);

  // check that the corners, sides, and interiors getters match the get() method for each cell
  for (let y = 0; y < game.height; y += 1) {
    for (let x = 0; x < game.width; x += 1) {
      const state = game.get(x, y);
      expect(game.corners.get(x, y)).toBe(state === TileState.Corner);
      expect(game.sides.get(x, y)).toBe(state === TileState.Side);
      expect(game.interiors.get(x, y)).toBe(state === TileState.Interior);
    }
  }
});

test('rebuilding Blokus from sides, corners, and interiors is equal to the original', () => {
  const original = Blokus.fromString(`
        csc
        sis
        sis
        csc
    `);
  const copy = new Blokus(original.sides, original.corners, original.interiors);
  expect(copy.isEqualTo(original)).toBe(true);
});
