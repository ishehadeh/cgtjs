import fc from 'fast-check';
import { expect, test } from 'vitest';
import { Nim, solveNim } from '../cgtjs/game/Nim.ts';
import { NumberUpStar } from '../cgtjs/NumberUpStar.ts';

function expectNimber(piles: bigint[], expectedStar: bigint) {
  const got = solveNim(new Nim(piles));
  const want = new NumberUpStar(0n, 0n, expectedStar);
  expect(got.partialCompare(want), `piles=[${piles.join(',')}] got '${got.toString()}' want '${want.toString()}'`).toBe(
    0,
  );
}

test('terminal position (no stones) is *0', () => {
  expectNimber([0n], 0n);
});

test('single-pile Nim *n matches heap size', () => {
  // naive `solveNim` recomputes subgames; keep heaps small enough to finish quickly
  for (const n of [1n, 2n, 3n, 4n, 5n]) {
    expectNimber([n], n);
  }
});

test('arbitrary piles equal the XOR of their sizes', () => {
  // set some really small params here because solving is slow
  fc.assert(
    fc.property(fc.array(fc.bigInt({ min: 0n, max: 5n }), { minLength: 0, maxLength: 3 }), (piles: bigint[]) => {
      expectNimber(
        piles,
        piles.reduce((a, b) => a ^ b, 0n),
      );
    }),
    { numRuns: 10 },
  );
});
