import { expect, test } from 'vitest';
import { canonicalForm, MoveSet } from '../cgtjs/MoveSet.ts';
import { NumberUpStar } from '../cgtjs/NumberUpStar.ts';

test('normalize: {1/2 | 2} is 1 (left reversible bypass)', () => {
  const half = canonicalForm([new NumberUpStar(0n)], [new NumberUpStar(1n)]);
  const g = new MoveSet([half], [new NumberUpStar(2n)]);
  const n = g.clone().normalize();

  expect(n.partialCompare(new NumberUpStar(1n)), `got ${n.toString()}`).toBe(0);
});

test('normalize: {-2 | -1/2} is -1 (right reversible bypass)', () => {
  const negHalf = canonicalForm([new NumberUpStar(-1n)], [new NumberUpStar(0n)]);
  const g = new MoveSet([new NumberUpStar(-2n)], [negHalf]);
  const n = g.clone().normalize();

  expect(n.partialCompare(new NumberUpStar(-1n)), `got ${n.toString()}`).toBe(0);
});
