import { describe, expect, test } from 'vitest';
import type { CanonicalForm } from '../../cgtjs/CanonicalForm.ts';
import { DyadicRational } from '../../cgtjs/DyadicRational.ts';
import { Konane } from '../../cgtjs/game/Konane.ts';
import { canonicalForm } from '../../cgtjs/MoveSet.ts';
import { NumberUpStar } from '../../cgtjs/NumberUpStar.ts';
import { CanonicalFormStore } from '../../cgtjs/solver/CanonicalFormStore.ts';
import { MoveStore } from '../../cgtjs/solver/MoveStore.ts';

// adapted from https://github.com/ishehadeh/konjecture/blob/main/konane/src/cgt.rs
// results from “1xn Konane: A Summary of Results.” In Games of No Chance [2] More Games of No Chance, 1. paperback ed, with Richard J. Nowakowski, Michael Henry Albert, Alice Chan, and Alice Tsai. Games of No Chance 2. Cambridge Univ. Press, 2010. https://library.slmath.org/books/Book42/contents.html.

function assertCanonicalEqual(label: string, actual: CanonicalForm, expected: CanonicalForm) {
  expect(actual.partialCompare(expected), `${label}: got ${actual.toString()}`).toBe(0);
}

const ZERO = new NumberUpStar(0n);
const FUZZY = new NumberUpStar(0n, 0n, 1n);
const DOWN = new NumberUpStar(0n, -1n, 0n);

function genSolidLinearPattern(n: number): Konane {
  const g = new Konane(256, 1n);
  for (let x = 1; x <= n; x++) {
    g.setTile(BigInt(x), 0n, x % 2 === 0 ? 'white' : 'black');
  }
  return g;
}

function linearWithOffsetTail1(n: number): Konane {
  const g = new Konane(64, 4n);
  for (let x = 0; x < n; x++) {
    if (x < 1) {
      g.setTile(BigInt(x + 1), 2n, x % 2 === 0 ? 'white' : 'black');
    } else {
      g.setTile(BigInt(x + 1), 1n, (x - 1) % 2 === 0 ? 'white' : 'black');
    }
  }
  return g;
}

function linearWithTail(tailLen: number, n: number, offset: number): Konane {
  const g = new Konane(40, 8n);
  for (let i = 0; i < tailLen; i++) {
    g.setTile(1n, BigInt(5 + i), i % 2 === 0 ? 'white' : 'black');
  }
  for (let x = offset; x < n - tailLen + offset; x++) {
    g.setTile(BigInt(x + 1), 4n, x % 2 === 0 ? 'black' : 'white');
  }
  return g;
}

function solve(game: Konane) {
  return new CanonicalFormStore(new MoveStore<Konane>()).solve(game);
}

describe('Konane line patterns', () => {
  test('solid linear pattern', () => {
    const cases: { n: number; exp: CanonicalForm }[] = [
      { n: 0, exp: ZERO },
      { n: 1, exp: ZERO },
      { n: 2, exp: FUZZY },
      { n: 3, exp: new NumberUpStar(-1n) },
      { n: 4, exp: ZERO },
      { n: 5, exp: new NumberUpStar(-2n) },
      { n: 6, exp: FUZZY },
      { n: 7, exp: new NumberUpStar(-3n) },
      { n: 8, exp: ZERO },
      { n: 9, exp: new NumberUpStar(-4n) },
      { n: 10, exp: FUZZY },
    ];
    for (const { n, exp } of cases) {
      assertCanonicalEqual(`slp(${n})`, solve(genSolidLinearPattern(n)), exp);
    }
    for (let i = 11; i < 40; i++) {
      const g = genSolidLinearPattern(i);
      const v = solve(g);
      const exp = i % 4 === 0 ? ZERO : i >= 2 && (i - 2) % 4 === 0 ? FUZZY : new NumberUpStar(-BigInt(i - 1) / 2n);
      assertCanonicalEqual(`slp(${i})`, v, exp);
    }
  });

  test('linear with offset tail 1', () => {
    for (const { n, exp } of [
      { n: 0, exp: ZERO },
      { n: 1, exp: ZERO },
      { n: 2, exp: ZERO },
      { n: 3, exp: DOWN },
      { n: 4, exp: new NumberUpStar(4n / 2n - 1n) },
      { n: 5, exp: FUZZY },
      { n: 6, exp: new NumberUpStar(6n / 2n - 1n) },
      { n: 7, exp: ZERO },
    ] as { n: number; exp: NumberUpStar }[]) {
      assertCanonicalEqual(`lot1(${n})`, solve(linearWithOffsetTail1(n)), exp);
    }
    for (let i = 8; i < 32; i++) {
      const v = solve(linearWithOffsetTail1(i));
      if (i % 2 === 0) {
        assertCanonicalEqual(`lot1(${i})`, v, new NumberUpStar(BigInt(i) / 2n - 1n));
      } else if ((i - 1) % 4 === 0) {
        assertCanonicalEqual(`lot1(${i})`, v, FUZZY);
      } else if ((i - 3) % 4 === 0) {
        assertCanonicalEqual(`lot1(${i})`, v, ZERO);
      } else {
        expect.fail(`lot1(${i}): no branch matched (should be unreachable)`);
      }
    }
  });

  test('linear with offset tail 2', () => {
    for (const { n, exp } of [
      { n: 3, exp: DOWN },
      { n: 4, exp: ZERO },
      { n: 5, exp: new NumberUpStar(new DyadicRational(1n, 1n)) },
    ] as { n: number; exp: NumberUpStar }[]) {
      assertCanonicalEqual(`lot2(${n})`, solve(linearWithTail(2, n, 1)), exp);
    }
    for (let i = 6; i < 32; i++) {
      const v = solve(linearWithTail(2, i, 1));
      if (i % 4 === 0) {
        assertCanonicalEqual(`lot2(${i})`, v, new NumberUpStar(-1n, 0n, 1n));
      } else if ((i - 1) % 4 === 0) {
        assertCanonicalEqual(`lot2(${i})`, v, new NumberUpStar(2n * BigInt((i - 1) / 4) - 2n));
      } else if ((i - 2) % 4 === 0) {
        assertCanonicalEqual(`lot2(${i})`, v, new NumberUpStar(-1n));
      } else {
        expect((i - 3) % 4).toBe(0);
        assertCanonicalEqual(`lot2(${i})`, v, new NumberUpStar(2n * BigInt((i - 3) / 4) - 1n));
      }
    }
  });

  test('linear with tail 1', () => {
    assertCanonicalEqual('lt1(1)', solve(linearWithTail(1, 1, 0)), ZERO);
    assertCanonicalEqual('lt1(2)', solve(linearWithTail(1, 2, 0)), FUZZY);
    assertCanonicalEqual('lt1(3)', solve(linearWithTail(1, 3, 0)), FUZZY);
    assertCanonicalEqual('lt1(4)', solve(linearWithTail(1, 4, 0)), canonicalForm([FUZZY], [DOWN]));
    for (let i = 5; i < 32; i++) {
      const v = solve(linearWithTail(1, i, 0));
      const exp: CanonicalForm =
        i % 4 === 0
          ? canonicalForm([FUZZY], [new NumberUpStar((-2n * BigInt(i)) / 4n + 2n)])
          : (i - 1) % 4 === 0
            ? canonicalForm([new NumberUpStar(2n * BigInt((i - 1) / 4) - 1n)], [FUZZY])
            : (i - 2) % 4 === 0
              ? canonicalForm([ZERO], [new NumberUpStar(-2n * BigInt((i - 2) / 4) + 1n)])
              : (() => {
                  expect((i - 3) % 4).toBe(0);
                  return canonicalForm([new NumberUpStar(2n * BigInt((i - 3) / 4))], [ZERO]);
                })();
      assertCanonicalEqual(`lt1(${i})`, v, exp);
    }
  });
});
