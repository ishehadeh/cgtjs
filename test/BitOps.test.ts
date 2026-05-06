import { expect, test } from 'vitest';
import { deltaSwap } from '../cgtjs/Board';

test('deltaSwap swaps single bit pattern', () => {
  expect(deltaSwap(0b00001, 0b1, 4)).toBe(0b10000);
  expect(deltaSwap(0b01001, 0b1, 4)).toBe(0b11000);
});

test('deltaSwap multiple bits', () => {
  expect(deltaSwap(0b001000010, 0b1, 4)).toBe(0b001000010);
  expect(deltaSwap(0b01001, 0b1, 4)).toBe(0b11000);
});
