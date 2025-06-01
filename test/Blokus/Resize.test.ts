import { expect, test } from "bun:test";
import { Blokus, TileState } from "../../cgtjs/game/Blokus";

test('resize - tile coordiantes don\'t change (grow)', function () {
    const game = Blokus.empty(10n, 10n);
    game.set(3n, 3n, TileState.Corner);
    expect(game.resize(20n, 20n).get(3n, 3n)).toBe(TileState.Corner);
})


test('resize - tile coordiantes don\'t change (shrink)', function () {
    const game = Blokus.empty(10n, 10n);
    game.set(3n, 3n, TileState.Corner);
    expect(game.resize(5n, 5n).get(3n, 3n)).toBe(TileState.Corner);
})

