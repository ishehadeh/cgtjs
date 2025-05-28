import { expect, test } from "bun:test";
import { Blokus, TileState } from "../../cgtjs/game/Blokus";

test('serialize and deserialzie 4x4', () => {
    const input = Blokus.empty(2n, 2n);
    input.set(1n, 1n, TileState.Corner);
    const serialized = input.serialize();
    
    const output = Blokus.deserialize(serialized);
    expect(output.isEqualTo(input), `expected:\n${input.toStringBoard()}\ngot:\n${output.toStringBoard()}`).toEqual(true);
});