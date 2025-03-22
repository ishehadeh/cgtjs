import { expect, test, describe } from "bun:test";
import { DyadicRational } from '../cgtjs/DyadicRational.ts';
import { NumberUpStar } from '../cgtjs/NumberUpStar.ts';
import { MoveSet, canonicalForm } from '../cgtjs/MoveSet.ts';

test("NumberUpStar comparison 0 || *", () => {
    let zero = new NumberUpStar(0n, 0n, 0n);
    let star = new NumberUpStar(0n, 0n, 1n);

    expect(zero.partialCompare(star)).toBe(null);
})

test("NumberUpStar compares up & up move set with star", () => {
    let up = new NumberUpStar(0n, 1n, 0n);
    let down = new NumberUpStar(0n, -1n, 0n);
    let star = new NumberUpStar(0n, 0n, 1n);

    expect(star.partialCompare(up)).toBe(null);
    expect(star.partialCompare(down)).toBe(null);
    expect(canonicalForm([new NumberUpStar(0n)], [down]).partialCompare(star)).toBe(0);
})

test("NumberUpStar compares up with rational move set", () => {
    const b = canonicalForm([new NumberUpStar(new DyadicRational(11, 2))], [new NumberUpStar(new DyadicRational(1, 1))]);

    expect(new NumberUpStar(new DyadicRational(2)).partialCompare(b)).toBe(-1);
    expect(new NumberUpStar(new DyadicRational(2)).partialCompare(new NumberUpStar(new DyadicRational(11, 2)))).toBe(-1);
})