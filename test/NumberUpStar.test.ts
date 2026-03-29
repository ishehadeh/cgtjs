import { expect, test } from 'bun:test';
import { DyadicRational } from '../cgtjs/DyadicRational.ts';
import { canonicalForm } from '../cgtjs/MoveSet.ts';
import { NumberUpStar } from '../cgtjs/NumberUpStar.ts';

test('NumberUpStar comparison 0 || *', () => {
  const zero = new NumberUpStar(0n, 0n, 0n);
  const star = new NumberUpStar(0n, 0n, 1n);

  expect(zero.partialCompare(star)).toBe(null);
});

test('NumberUpStar compares up & up move set with star', () => {
  const up = new NumberUpStar(0n, 1n, 0n);
  const down = new NumberUpStar(0n, -1n, 0n);
  const star = new NumberUpStar(0n, 0n, 1n);

  expect(star.partialCompare(up)).toBe(null);
  expect(star.partialCompare(down)).toBe(null);
  expect(canonicalForm([new NumberUpStar(0n)], [down]).partialCompare(star)).toBe(0);
});

test('NumberUpStar compares up with rational move set', () => {
  const b = canonicalForm([new NumberUpStar(new DyadicRational(11, 2))], [new NumberUpStar(new DyadicRational(1, 1))]);

  expect(new NumberUpStar(new DyadicRational(2)).partialCompare(b)).toBe(-1);
  expect(new NumberUpStar(new DyadicRational(2)).partialCompare(new NumberUpStar(new DyadicRational(11, 2)))).toBe(-1);
});

test('[*] => 0', () => {
  expect(
    canonicalForm([new NumberUpStar(0n, 0n, 1n)], [new NumberUpStar(0n, 0n, 1n)]).partialCompare(new NumberUpStar(0n)),
  ).toBe(0);
});

test('[*, 0] => *2', () => {
  const moves = [new NumberUpStar(0n, 0n, 0n), new NumberUpStar(0n, 0n, 1n)];
  const got = canonicalForm(
    moves,
    moves.map((m) => m.clone()),
  );
  const expected = new NumberUpStar(0n, 0n, 2n);
  expect(got.partialCompare(expected), `got: ${got.toString()}`).toBe(0);
});
