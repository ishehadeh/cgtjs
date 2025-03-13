import { expect, test } from "bun:test";
import { BitBoard } from "../cgtjs/Board";

test('vertical flip - 2x2 BitBoard', function () {
    const board = new BitBoard(2n, 2n);
    board.set(0n, 0n);
    board.set(1n, 1n);
    expect(board.bits).toBe(0b1001n);

    board.flipVerticalInPlace();

    expect(board.bits).toBe(0b0110n);
});

test('vertical flip - 3x3 BitBoard', function () {
    const board = new BitBoard(3n, 3n);
    board.set(0n, 0n);
    board.set(1n, 1n);
    board.set(1n, 2n);
    expect(board.bits).toBe(0b010_010_001n);

    board.flipVerticalInPlace();

    expect(board.bits).toBe(0b001_010_010n);
});


test('vertical flip - 4x4 BitBoard', function () {
    const board = new BitBoard(4n, 4n);
    board.set(1n, 1n);
    board.set(1n, 2n);
    board.set(0n, 3n);
    board.set(3n, 3n);
    for (let i = 0n; i < 4n; ++i)
        board.set(i, 0n);

    expect(board.bits).toBe(0b1001_0010_0010_1111n);

    board.flipVerticalInPlace();

    expect(board.bits).toBe(0b1111_0010_0010_1001n);
});

test('horizontal flip - 2x2 BitBoard', function () {
    const board = new BitBoard(2n, 2n, 0b10_01n);
    expect(board.bits).toBe(0b10_01n);

    board.flipHorizontalInPlace();
    expect(board.bits).toBe(0b01_10n);
});

test('horizontal flip - 3x3 BitBoard', function () {
    const board = new BitBoard(3n, 3n, 0b010_010_001n);
    expect(board.bits).toBe(0b010_010_001n);

    board.flipHorizontalInPlace();
    expect(board.bits).toBe(0b010_010_100n);
});


test('horizontal flip - 4x4 BitBoard', function () {
    const board = new BitBoard(4n, 4n, 0b1001_0010_0010_1011n);
    expect(board.bits).toBe(0b1001_0010_0010_1011n);

    board.flipHorizontalInPlace();
    expect(board.bits).toBe(0b1001_0100_0100_1101n);
});

test('transpose - 2x2 BitBoard', function () {
    const board = new BitBoard(2n, 2n, 0b10_01n);
    expect(board.bits).toBe(0b10_01n);

    expect(board.transpose().bits).toBe(0b10_01n);
});

test('transpose - 3x3 BitBoard', function () {
    const board = new BitBoard(3n, 3n, 0b010_010_001n);
    expect(board.bits).toBe(0b010_010_001n);

    expect(board.transpose().bits).toBe(0b000_110_001n);
});


test('transpose - 4x4 BitBoard', function () {
    const board = new BitBoard(4n, 4n, 0b1001_0010_0010_1011n);
    expect(board.bits).toBe(0b1001_0010_0010_1011n);

    board.flipHorizontalInPlace();
    expect(board.bits).toBe(0b1001_0100_0100_1101n);
});

test('rotate clockwise - 2x2 BitBoard', function () {
    const board = new BitBoard(2n, 2n, 0b10_01n);
    expect(board.bits).toBe(0b10_01n);
    expect(board.rotateClockwise().bits).toBe(0b01_10n);

    expect((new BitBoard(2n, 2n, 0b10_11n)).rotateClockwise().bits).toBe(0b11_10n);
});

test('rotate clockwise - 3x3 BitBoard', function () {
    const board = new BitBoard(3n, 3n, 0b010_010_001n);
    expect(board.bits).toBe(0b010_010_001n);

    expect(board.rotateClockwise().bits).toBe(0b000_011_100n);
});


test('resize - 1x1 to 3x3', function () {
    const board = new BitBoard(1n, 1n, 1n);
    expect(board.resize(3n, 3n).bits).toBe(1n);
});

test('resize - 2x2 to 3x5, rows extend', function () {
    const board = new BitBoard(2n, 2n, 0b10_01n);
    expect(board.resize(3n, 5n).bits).toBe(0b010_001n);
});
