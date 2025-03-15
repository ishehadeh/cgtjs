import fc from 'fast-check';
import { expect, test, describe } from "bun:test";
import { DyadicRational } from '../cgtjs/DyadicRational.ts';

function fcDyadicRational(numerator: fc.BigIntConstraints, denominatorExp: fc.BigIntConstraints): fc.Arbitrary<DyadicRational> {
    return fc.tuple(
        fc.bigInt(numerator),
        fc.bigInt(denominatorExp)
    ).map(([numerator, denominatorExp]) => new DyadicRational(numerator, denominatorExp));
}

describe('DyadicRational', () => {
    test('addition of two positive numbers is greater than either operand', () => {
        fc.assert(
            fc.property(
                fcDyadicRational({ min: 1n }, { min: 0n, max: 100n }),
                fcDyadicRational({ min: 1n }, { min: 0n, max: 100n }),
                (a, b) => {
                    const sum = a.clone().add(b);
                    return sum.compare(a) > 0 && sum.compare(b) > 0;
                }
            ),
            { numRuns: 500 }
        );
    });

    test('addition between positive and negative operands is less than the positive operand, greater than the negative operand', () => {
        fc.assert(
            fc.property(
                fcDyadicRational({ min: 1n }, { min: 0n, max: 100n }),
                fcDyadicRational({ max: -1n }, { min: 0n, max: 100n }),
                (gtZero, ltZero) => {
                    const sum = gtZero.clone().add(ltZero);
                    return sum.compare(gtZero) < 0 && sum.compare(ltZero) > 0;
                }
            ),
            { numRuns: 500 }
        );
    });

    test('addition between two negative operands is less than the either', () => {
        fc.assert(
            fc.property(
                fcDyadicRational({ max: -1n }, { min: 0n, max: 100n }),
                fcDyadicRational({ max: -1n }, { min: 0n, max: 100n }),
                (a, b) => {
                    const sum = a.clone().add(b);
                    return sum.compare(a) < 0 && sum.compare(b) < 0;
                }
            ),
            { numRuns: 500 }
        );
    });
});