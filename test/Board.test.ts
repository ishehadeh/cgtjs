import { expect, test } from 'vitest';
import { BitBoard } from '../cgtjs/Board';

test('vertical flip - 2x2 BitBoard', () => {
  const board = new BitBoard(2, 2);
  board.set(0, 0);
  board.set(1, 1);
  expect(board.toString()).toBe(`10\n01\n`);

  board.flipVerticalInPlace();

  expect(board.toString()).toBe(`01\n10\n`);
});

test('vertical flip - 3x3 BitBoard', () => {
  const board = new BitBoard(3, 3);
  board.set(0, 0);
  board.set(1, 1);
  board.set(1, 2);
  expect(board.toString()).toBe(`100\n010\n010\n`);

  board.flipVerticalInPlace();

  expect(board.toString()).toBe(`010\n010\n100\n`);
});

test('vertical flip - 4x4 BitBoard', () => {
  const board = new BitBoard(4, 4);
  board.set(1, 1);
  board.set(1, 2);
  board.set(0, 3);
  board.set(3, 3);
  for (let i = 0; i < 4; ++i) board.set(i, 0);

  expect(board.toString()).toBe(`1111\n0100\n0100\n1001\n`);

  board.flipVerticalInPlace();

  expect(board.toString()).toBe(`1001\n0100\n0100\n1111\n`);
});

test('horizontal flip - 2x2 BitBoard', () => {
  const board = BitBoard.fromString(`
    10
    01
  `);
  expect(board.toString()).toBe(`10\n01\n`);

  board.flipHorizontalInPlace();
  expect(board.toString()).toBe(`01\n10\n`);
});

test('horizontal flip - 3x3 BitBoard', () => {
  const board = BitBoard.fromString(`
    100
    010
    010
  `);
  expect(board.toString()).toBe(`100\n010\n010\n`);

  board.flipHorizontalInPlace();
  expect(board.toString()).toBe(`001\n010\n010\n`);
});

test('horizontal flip - 4x4 BitBoard', () => {
  const board = BitBoard.fromString(`
    1101
    0100
    1001
    0010
  `);
  expect(board.toString()).toBe(`1101\n0100\n1001\n0010\n`);

  board.flipHorizontalInPlace();
  expect(board.toString()).toBe(`1011\n0010\n1001\n0100\n`);
});

test('horizontal flip - 4x3 BitBoard, symmetric', () => {
  const board = BitBoard.fromString(`
    1001
    0000
    1001
  `);
  expect(board.toString()).toBe(`1001\n0000\n1001\n`);

  board.flipHorizontalInPlace();
  expect(board.toString()).toBe(`1001\n0000\n1001\n`);
});

test('horizontal flip - 3x4 BitBoard, symmetric', () => {
  const board = BitBoard.fromString(`
    101
    000
    000
    101
  `);
  expect(board.toString()).toBe(`101\n000\n000\n101\n`);

  board.flipHorizontalInPlace();
  expect(board.toString()).toBe(`101\n000\n000\n101\n`);
});

test('transpose - 2x2 BitBoard', () => {
  const board = BitBoard.fromString(`
    10
    01
  `);
  expect(board.toString()).toBe(`10\n01\n`);

  expect(board.transpose().toString()).toBe(`10\n01\n`);
});

test('transpose - 3x3 BitBoard', () => {
  const board = BitBoard.fromString(`
    100
    010
    010
  `);
  expect(board.toString()).toBe(`100\n010\n010\n`);

  expect(board.transpose().toString()).toBe(`100\n011\n000\n`);
});

test('transpose - 4x4 BitBoard', () => {
  const board = BitBoard.fromString(`
    1101
    0100
    1001
    0010
  `);
  expect(board.toString()).toBe(`1101\n0100\n1001\n0010\n`);

  board.flipHorizontalInPlace();
  expect(board.toString()).toBe(`1011\n0010\n1001\n0100\n`);
});

test('transpose - 4x3 BitBoard (bottom row empty)', () => {
  const board = BitBoard.fromString(`
    0100
    1010
    0010
  `);
  expect(board.toString()).toBe(`0100\n1010\n0010\n`);

  expect(board.transpose().toString()).toBe(`010\n100\n011\n000\n`);
});

test('transpose - 4x3 BitBoard (bottom row non-empty)', () => {
  const board = BitBoard.fromString(`
    0101
    1010
    0011
  `);
  expect(board.toString()).toBe(`0101\n1010\n0011\n`);

  expect(board.transpose().toString()).toBe(`010\n100\n011\n101\n`);
});

test('rotate clockwise - 2x2 BitBoard', () => {
  const board = BitBoard.fromString(`
    10
    01
  `);
  expect(board.toString()).toBe(`10\n01\n`);
  expect(board.rotateClockwise().toString()).toBe(`01\n10\n`);

  expect(
    BitBoard.fromString(`
      11
      01
    `)
      .rotateClockwise()
      .toString(),
  ).toBe(`01\n11\n`);
});

test('rotate clockwise - 3x3 BitBoard', () => {
  const board = BitBoard.fromString(`
    100
    010
    010
  `);
  expect(board.toString()).toBe(`100\n010\n010\n`);

  expect(board.rotateClockwise().toString()).toBe(`001\n110\n000\n`);
});

test('rotate clockwise - 4x3 BitBoard', () => {
  const board = BitBoard.fromString(`
    0100
    1010
    0010
  `);
  expect(board.toString()).toBe(`0100\n1010\n0010\n`);

  expect(board.rotateClockwise().toString()).toBe(`010\n001\n110\n000\n`);
});

test('rotate clockwise - 3x3 BitBoard, symmetric', () => {
  const board = BitBoard.fromString(`
    101
    000
    101
  `);
  expect(board.toString()).toBe(`101\n000\n101\n`);

  expect(board.rotateClockwise().toString()).toBe(`101\n000\n101\n`);
});

test('transpose - 3x4 BitBoard, symmetric', () => {
  const board = BitBoard.fromString(`
    1001
    0000
    1001
  `);
  expect(board.toString()).toBe(`1001\n0000\n1001\n`);

  expect(board.transpose().toString()).toBe(`101\n000\n000\n101\n`);
});

test('rotate clockwise - 3x4 BitBoard, symmetric', () => {
  const board = BitBoard.fromString(`
    1001
    0000
    1001
  `);
  expect(board.toString()).toBe(`1001\n0000\n1001\n`);

  expect(board.rotateClockwise().toString()).toBe(`101\n000\n000\n101\n`);
});

test('resize - 1x1 to 3x3', () => {
  const board = BitBoard.fromString(`1`);
  expect(board.resize(3, 3).toString()).toBe(`100\n000\n000\n`);
});

test('resize - 2x2 to 3x5, rows extend', () => {
  const board = BitBoard.fromString(`
    10
    01
  `);
  expect(board.resize(3, 5).toString()).toBe(`100\n010\n000\n000\n000\n`);
});
