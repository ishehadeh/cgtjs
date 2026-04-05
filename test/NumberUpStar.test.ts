import { expect, test } from 'vitest';
import { DyadicRational } from '../cgtjs/DyadicRational.ts';
import { canonicalForm, MoveSet } from '../cgtjs/MoveSet.ts';
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
  const b = canonicalForm(
    [new NumberUpStar(new DyadicRational(11n, 2n))],
    [new NumberUpStar(new DyadicRational(1n, 1n))],
  );
  expect(b, `expected b to be { 11/4 | 1/2 } but got ${b.toString()}`).toBeInstanceOf(MoveSet);

  expect(new NumberUpStar(new DyadicRational(2n)).partialCompare(b)).toBe(null);
  expect(new NumberUpStar(new DyadicRational(2n)).partialCompare(new NumberUpStar(new DyadicRational(11n, 2n)))).toBe(
    -1,
  );
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
