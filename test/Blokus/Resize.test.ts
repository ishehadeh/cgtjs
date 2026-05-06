import { expect, test } from 'vitest';
import { Blokus, TileState } from '../../cgtjs/game/Blokus/Blokus';

test("resize - tile coordiantes don't change (grow)", () => {
  const game = Blokus.empty(10, 10);
  game.set(3, 3, TileState.Corner);
  expect(game.resize(20, 20).get(3, 3)).toBe(TileState.Corner);
});

test("resize - tile coordiantes don't change (shrink)", () => {
  const game = Blokus.empty(10, 10);
  game.set(3, 3, TileState.Corner);
  expect(game.resize(5, 5).get(3, 3)).toBe(TileState.Corner);
});
