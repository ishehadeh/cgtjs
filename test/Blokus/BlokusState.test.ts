import { expect, test } from "bun:test";
import { Blokus, TileState } from "../../cgtjs/game/Blokus";


test('set/get tile state', function () {
    const game = Blokus.empty(10n, 10n);
    game.set(3n, 3n, TileState.Corner);
    expect(game.get(3n, 3n)).toBe(TileState.Corner);
})


