import { expectBigInt } from './utils/typecheck.ts';
import { compareBigInt } from './utils/compare.ts';

export class DyadicRational {
    /** the "m" in m/(2^n)
     */
    #numerator: bigint;

    /** the "n" in m/(2^n)
     * INVARIANT: #denominatorExp >= 0
     */
    #denominatorExp: bigint;

    get leftMoves(): [DyadicRational] | []  {
        const l = this.left();
        return l ? [l] : [];
    }

    get rightMoves(): [DyadicRational] | [] {
        const r = this.right();
        return r ? [r] : [];
    }

    /**
     * 
     * @param {bigint | number} numerator
     * @param {bigint | number} denominatorExp must be greater than or equal to zero
     */
    constructor(numerator: bigint | number, denominatorExp: bigint | number = 0n) {
        this.#numerator = expectBigInt(numerator);
        this.#denominatorExp = expectBigInt(denominatorExp);
        if (this.#denominatorExp < 0n) {
            throw new Error(`invalid dyadic rational (${this}): denominator must be greater than or equal to zero.`);
        }
        this.normalize();
    }

    /** Construct a Dyadic Rational from a string, bigint, or number
     *
     * @throws {TypeError}
     */
    static from(value: bigint | boolean | number | string | DyadicRational): DyadicRational {
        if (value instanceof DyadicRational) {
            return new DyadicRational(value.numerator, value.denominatorExp);
        }

        switch (typeof value) {
            case "bigint":
                return new DyadicRational(value);
            case "boolean":
                return new DyadicRational(value ? 1n : 0n);
            case "number":
                return new DyadicRational(value);
            case "string":
                return new DyadicRational(BigInt(value))
            default:
                throw new TypeError(`cannot coerce value "${value}" to a DyadicRational`);
        }
    }

    get numerator() { return this.#numerator; }
    get denominatorExp() { return this.#denominatorExp; }

    /** Calculate the real denominator.
     * @returns {bigint}
     */
    denominator() { return 2n ** this.denominatorExp; }

    toString() {
        if (this.denominatorExp == 0n) {
            return this.numerator.toString();
        } else {
            return `${this.numerator}/${this.denominator()}`;
        }
    }

    clone() {
        return DyadicRational.from(this);
    }

    compare(rhs: bigint | boolean | number | string | DyadicRational) {
        let compatRhs = DyadicRational.from(rhs);
        let compatLhs: DyadicRational = this;
        if (compatRhs.denominatorExp < this.denominatorExp) {
            compatRhs = compatRhs.clone();
            compatRhs.#increaseDenom(this.denominatorExp);
        } else if (compatRhs.denominatorExp > this.denominatorExp) {
            compatLhs = compatLhs.clone();
            compatLhs.#increaseDenom(compatRhs.denominatorExp);
        }

        return compareBigInt(compatLhs.numerator, compatRhs.numerator);
    }

    #increaseDenom(denomExp: bigint) {
        if (this.#denominatorExp > denomExp) {
            throw new Error(`denomator must be increased! new dominator is '${denomExp}', but value is ${this}`)
        }
        const diff = denomExp - this.denominatorExp;
        this.#numerator *= (2n ** diff);
        this.#denominatorExp = denomExp;
    }

    /** Simplify the fraction, this operation should be run after construction, or any arithmetic.
     */
    normalize() {
        while (this.#denominatorExp > 0n && (this.#numerator % 2n) == 0n) {
            this.#denominatorExp -= 1n;
            this.#numerator /= 2n;
        }
    }

    neg() {
        this.#numerator *= -1n;
    }

    /** shorthand to check if the numerator is zero
     *  @returns {boolean}
     */
    isZero() {
        return this.numerator == 0n;
    }

    /** Get the right options
     */
    right(): DyadicRational | null {
        // 2 cases here
        //  1. This is a whole number, so N = {|N + 1} or N = {N - 1|}, or N = 0
        if (this.denominatorExp === 0n) {
            // if the number is < 0 then only right has options
            if (this.numerator < 0n) {
                return new DyadicRational(this.numerator + 1n, 0n);
            } else {
                // right has no options if N >= 0
                return null;
            }
        }

        // 2. this is a fraction, so (2p + 1)/(2^m+1) = {p/(2^m) | (p + 1)/(2^m)}
        // Ref: https://mathstrek.blog/2012/08/15/combinatorial-game-theory-vii/, "More Fractions"
        return new DyadicRational((this.numerator - 1n) / 2n + 1n, this.denominatorExp - 1n);
    }

    /** Get the left options
     */
    left(): DyadicRational | null {
        // 2 cases here
        //  1. This is a whole number, so N = {|N + 1} or N = {N - 1|}, or N = 0
        if (this.denominatorExp === 0n) {
            // if the number is > 0 then only left has options
            if (this.numerator > 0n) {
                return new DyadicRational(this.numerator - 1n, 0n);
            } else {
                // left has no options if N <= 0
                return null;
            }
        }

        // 2. this is a fraction, so (2p + 1)/(2^m+1) = {p/(2^m) | (p + 1)/(2^m)}
        // Ref: https://mathstrek.blog/2012/08/15/combinatorial-game-theory-vii/, "More Fractions"
        return new DyadicRational((this.numerator - 1n) / 2n, this.denominatorExp - 1n);
    }

    /** Add rhs to this rational, return a reference to self.
     */
    add(rhs: DyadicRational): DyadicRational {
        // make sure we match denominators
        if (rhs.denominatorExp < this.denominatorExp) {
            rhs = rhs.clone();
            rhs.#increaseDenom(this.denominatorExp);
        } else if (rhs.denominatorExp > this.denominatorExp) {
            this.#increaseDenom(rhs.denominatorExp);
        }

        this.#numerator += rhs.numerator
        this.normalize();
        return this;
    }


    /** subtract rhs to this rational, return a reference to self.
     */
    sub(rhs: DyadicRational): DyadicRational {
        const rhsRat = DyadicRational.from(rhs);
        rhsRat.neg();
        this.add(rhsRat);
        return this;
    }
}