import { expect, test } from "bun:test";
import { DyadicRational } from "../cgtjs/DyadicRational";

test("2 + 2 = 4", () => {
  DyadicRational.from(2).add(DyadicRational.from(2));
  expect(DyadicRational.from(2).add(DyadicRational.from(2)).toString()).toBe("4");
});

test("1/2 + 1/8 = 5/8", () => {
  expect(new DyadicRational(1, 1n).add(new DyadicRational(1, 3n)).toString()).toBe("5/8");
});