import { expect, test } from "bun:test";
import { deltaSwap } from "../cgtjs/Board";


test('deltaSwap swaps single bit pattern', function () {
    expect(deltaSwap(0b00001n, 0b1n, 4n))
        .toBe(0b10000n);
    expect(deltaSwap(0b01001n, 0b1n, 4n))
        .toBe(0b11000n);
});

test('deltaSwap multiple bits', function () {
    expect(deltaSwap(0b001_000_010n, 0b1n, 4n))
        .toBe(0b001_000_010n);
    expect(deltaSwap(0b01001n, 0b1n, 4n))
        .toBe(0b11000n);
})