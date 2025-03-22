import { expect, test } from "bun:test";
import { DyadicRational } from "../cgtjs/DyadicRational";

test("2 + 2 = 4", () => {
  DyadicRational.from(2).add(DyadicRational.from(2));
  expect(DyadicRational.from(2).add(DyadicRational.from(2)).toString()).toBe("4");
});

test("1/2 + 1/8 = 5/8", () => {
  expect(new DyadicRational(1, 1n).add(new DyadicRational(1, 3n)).toString()).toBe("5/8");
});

test("Dyadic rational addition", () => {
  const rat = (n: number | bigint, d: number | bigint = 0) => new DyadicRational(n, d);

  expect(rat(2).add(rat(1)).compare(3)).toBe(0);
  expect(rat(1, 1).add(rat(1)).compare(rat(3, 1))).toBe(0);
  expect(rat(3, 1).add(rat(1, 3)).compare(rat(13, 3))).toBe(0);
});

test("Dyadic rational compare", () => {
  const rat = (n: number | bigint, d: number | bigint = 0) => new DyadicRational(n, d);

  expect(rat(2).compare(1)).toBe(1);
  expect(rat(1, 1).compare(rat(3, 1))).toBe(-1);
  expect(rat(-1, 1).compare(rat(1, 1))).toBe(-1);
  expect(rat(3, 1).compare(1)).toBe(1);
  expect(rat(-3, 1).compare(-1)).toBe(-1);
});


test("Dyadic rational left/right moves", () => {
  const rat = (n: number | bigint, d: number | bigint = 0) => new DyadicRational(n, d);

  expect(rat(2).left()).toEqual(rat(1));
  expect(rat(2).right()).toEqual(null);

  expect(rat(-2).left()).toEqual(null);
  expect(rat(-2).right()).toEqual(rat(-1));

  expect(rat(3, 1).left()).toEqual(rat(1));
  expect(rat(3, 1).right()).toEqual(rat(2));

  expect(rat(-3, 1).left()).toEqual(rat(-2));
  expect(rat(-3, 1).right()).toEqual(rat(-1));
});
