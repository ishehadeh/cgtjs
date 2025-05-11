import { CanonicalForm } from "./CanonicalForm.ts";
import { DyadicRational } from "./DyadicRational.ts";
import { MoveSet } from "./MoveSet.ts";
import { compareBigInt, type Ordering } from "./utils/compare.ts";
import { expectBigInt } from "./utils/typecheck.ts";

function absBigInt(n: bigint): bigint {
    return n < 0n ? -n : n;
}

/** Sum of a dyadic rational number m/(2^n), an positive or negative infinitesimal (up), and a Nimber (star)
         * @prop {bigint} up
         * @prop {bigint} star
         * @prop {DyadicRational} number
         */
export class NumberUpStar extends CanonicalForm {
    #number
    #up
    #star

    // expose properties as get-only
    // we'll handle any mutation to avoid invalid states.

    get number() { return this.#number }
    get up() { return this.#up }
    get star() { return this.#star }

    get leftMoves(): CanonicalForm[] {
        return [...this.generateLeftOptions()]
    }
    get rightMoves(): CanonicalForm[] {
        return [...this.generateRightOptions()]
    }

    isZero(): boolean {
        return this.number.isZero() && this.up == 0n && this.star == 0n;
    }

    constructor(number: DyadicRational | bigint = 0n, up = 0n, star = 0n) {
        super();

        this.#number = DyadicRational.from(number);
        this.#up = expectBigInt(up, "up component");
        this.#star = expectBigInt(star, "nimber");
        if (this.#star < 0) {
            throw new Error(`invalid NumberUpStar (${this}): star must be greater than or equal to zero.`);
        }
    }

    /** Try to coerce an arbirary value into a NumberUpStar
     * 
     * @throws {TypeError}
     */
    static coerce(value: unknown): NumberUpStar {
        if (value instanceof DyadicRational) {
            return NumberUpStar.coerce(value)
        } else if (value instanceof NumberUpStar) {
            return value;
        }
        // if (typeof value == "object" && value != null && value != undefined) {
        //     for (const key of Object.keys(value)) {
        //         if (!["n", "u", "s", "number", "up", "star"].includes(key)) {
        //             throw new TypeError("Object keys must be one of 'number', 'up', or 'star' (or 'n', 'u', 's' for short). recieved: " + JSON.stringify(value));
        //         }
        //     }
        //     const number = value["number"] ?? value["n"];
        //     const up = value["up"] ?? value["u"];
        //     const star = value["star"] ?? value["s"];
        //     return new NumberUpStar(DyadicRational.from(number ?? 0), up, star)
        // }

        switch (typeof value) {
            case "bigint":
            case "number":
            case "boolean":
                return new NumberUpStar(DyadicRational.from(value));
            default:
                throw new TypeError(`cannot coerce NumberUpStar from '${value}' (typeof value = ${typeof value})`);
        }
    }

    partialCompare(rhsRaw: CanonicalForm): Ordering | null {
        if (rhsRaw instanceof MoveSet) {
            return super.partialCompare(rhsRaw);
        }

        // source: Lessons In Play, Observation 5.41, pg. 101.
        const rhs = NumberUpStar.coerce(rhsRaw);
        const numCmp = this.number.compare(rhs.number);
        const upCmp = compareBigInt(this.up, rhs.up);
        const starCmp = compareBigInt(this.star, rhs.star);

        // equality is easy...
        if (numCmp == 0 && upCmp == 0 && starCmp == 0) {
            return 0;
        }

        // numbers take precedence over infinitesimals
        if (numCmp != 0) {
            // for any positive number x:
            //  1) -x < ^ < x
            //  2) -x < -^ < x
            //  3) -x < * < x
            // so if either number is non-zero (implies by them not being equal)
            // the difference between the numbers will overpower infinitesimals
            return numCmp
        }


        // +/-^ is incomparable with *
        if (absBigInt(this.up) == 1n && rhs.up == 0n && rhs.star != 0n) {
            return null
        }
        if (absBigInt(rhs.up) == 1n && this.up == 0n && this.star != 0n) {
            return null
        }

        // everything is equal except (maybe) star, so these values are incomparable
        if (upCmp == 0) {
            return null
        } else {
            // with the exception of +/-^1, up overrules star
            return upCmp
        }
    }

    /** If the up and star components are zero return a DyadicRational, otherwise return null
     * @returns {DyadicRational | null}
     */
    asNumber() {
        if (this.up == 0n && this.star == 0n) {
            return this.number
        } else {
            return null;
        }
    }

    /** If the niumber and up components are zero return the star component, otherwise return null
     * @returns {bigint | null}
     */
    asNimber() {
        if (this.up == 0n && this.number.isZero()) {
            return this.star
        } else {
            return null;
        }
    }

    *generateRightOptions() {
        const numRight = this.number.right();
        const upRight = this.up > 0 ? new NumberUpStar(0n, this.up - 1n, 1n) : (this.up < 0 ? NumberUpStar.coerce(0n) : null);
        // player moves on number:
        if (numRight != null) {
            yield new NumberUpStar(numRight, this.up, this.star);
        }

        // player moves on up game
        if (upRight) {
            yield upRight;
        }

        // player moves on star game
        if (this.star != 0n) {
            for (let i = 0n; i < this.star; ++i) {
                yield new NumberUpStar(this.number, this.up)
            }
        }
    }

    *generateLeftOptions() {
        const numLeft = this.number.left();
        const upLeft = this.up < 0 ? new NumberUpStar(0n, this.up + 1n, 1n) : (this.up > 0 ? NumberUpStar.coerce(0n) : null);

        // player moves on number:
        if (numLeft != null) {
            yield new NumberUpStar(numLeft, this.up, this.star);
        }

        // player moves on up game
        if (upLeft) {
            yield upLeft;
        }

        // player moves on star game
        if (this.star != 0n) {
            for (let i = 0n; i < this.star; ++i) {
                yield new NumberUpStar(this.number, this.up)
            }
        }
    }

    toString() {
        if (this.number.isZero() && this.up == 0n && this.star == 0n) {
            return "0";
        }
        let str = "";
        if (!this.number.isZero()) {
            str += this.number.toString();
        }
        if (this.up != 0n) {
            if (str) { str += " + " }
            if (this.up != 1n && this.up != -1n) {
                str += absBigInt(this.up).toString();
            }
            if (this.up > 0) {
                str += "↑";
            } else {
                str += "↓";
            }
        }
        if (this.star != 0n) {
            if (str) { str += " + " }
            str += "*"
            if (this.star !== 1n) {
                str += this.star.toString();
            }
        }
        return str;
    }

    clone(): NumberUpStar {
        return new NumberUpStar(this.number, this.up, this.star)
    }
}