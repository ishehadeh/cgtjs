import { CanonicalForm } from "./CanonicalForm.ts";
import { DyadicRational } from "./DyadicRational.ts";
import { NumberUpStar } from './NumberUpStar.ts';



/** Get the first power of two < n
 * @param {bigint} n
 * @returns {bigint}
 */
function powerOfTwoLess(n: bigint): bigint {
    let bit = 1n;
    while (bit < n) {
        bit *= 2n;
    }
    bit /= 2n;
    return bit;
}


export function canonicalForm(left: (NumberUpStar | MoveSet)[], right: (NumberUpStar | MoveSet)[]) {
    const canonLeft = [];
    const canonRight = [];
    for (const l of left) {
        if (l instanceof MoveSet) {
            canonLeft.push(l.normalize());
        } else {
            canonLeft.push(NumberUpStar.coerce(l))
        }
    }

    for (const r of right) {
        if (r instanceof MoveSet) {
            canonRight.push(r.normalize());
        } else {
            canonRight.push(NumberUpStar.coerce(r))
        }
    }

    return (new MoveSet(canonLeft, canonRight)).normalize();
}

/** A list of left and right player moves
 * @implements {PartialOrder}
 */
export class MoveSet extends CanonicalForm {
    left;
    right;

    /**
     * @param {CanonicalForm[]} left
     * @param {CanonicalForm[]} right
     */
    constructor(left: CanonicalForm[], right: CanonicalForm[]) {
        super();

        this.left = left;
        this.right = right;
    }

    clone(): MoveSet {
        return new MoveSet([...this.leftMoves], [...this.rightMoves]);
    }

    /** Returns true if neither player has any options
     * @returns {boolean}
     */
    isZero() {
        return this.left.length == 0 && this.right.length == 0;
    }

    /** Bypass reversible moves for the left player
     */
    bypassReversibleL() {
        for (let i = 0; i < this.left.length; ++i) {
            for (const lR of this.left[i].rightMoves) {
                if (lR.partialCompare(this) ?? NaN <= 0) {
                    let moves = [...lR.leftMoves];
                    if (moves.length > 0) {
                        this.left[i] = moves[0];
                        if (moves.length > 1) {
                            this.left.push(...moves.slice(1));
                        }
                    } else {
                        this.left.splice(i, 1);
                        i -= 1;
                    }
                    break;
                }
            }
        }
    }

    toString() {
        let str = "{ ";
        for (const l in this.left) {
            str += this.left[l].toString();
            if (+l == this.left.length - 1) {
                if (this.right.length == 0) {
                    str += "| }"
                } else {
                    str += " | "
                }
            } else {
                str += ", "
            }
        }
        if (this.left.length == 0) {
            str += "| ";
        }

        for (const r in this.right) {
            str += this.right[r].toString();
            if (+r == this.right.length - 1) {
                str += " }"
            } else {
                str += ", "
            }
        }
        return str;
    }


    /** Bypass reversible moves for the right player
     */
    bypassReversibleR() {
        for (let i = 0; i < this.right.length; ++i) {
            for (const rL of this.right[i].leftMoves) {
                if (rL.partialCompare(this) ?? NaN >= 0) {
                    let moves = [...rL.rightMoves];
                    if (moves.length > 0) {
                        this.right[i] = moves[0];
                        if (moves.length > 1) {
                            this.right.push(...moves.slice(1));
                        }
                    } else {
                        this.right.splice(i, 1);
                        i -= 1;
                    }
                    break;
                }
            }
        }
    }

    /** Remove dominated moves from a single side.
     * @param {boolean} left  true to remove dominated left moves, false to remove dominated right moves
     */
    removeDominatedMoves(left: boolean) {
        const moves: CanonicalForm[] = [];
        const existingMoves = left ? this.left : this.right;
        if (existingMoves.length == 1) {
            return;
        }

        for (const m of existingMoves) {
            let insert = true;
            for (const i in moves) {
                const cmp = m.partialCompare(moves[i]);
                if (!Number.isNaN(cmp)) {
                    // since we have some ordering with an existing move
                    // there's no need to add this one.
                    insert = false;

                    if (cmp == 0 || (left && cmp == -1) || (!left && cmp == 1)) {
                        // skip moves which already have a better move in the list
                        break;
                    } else {
                        // this move is better than the existing move so add it
                        moves[i] = m;
                        break;
                    }
                }
            }
            if (insert) {
                moves.push(m);
            }
        }

        if (left) {
            this.left = moves;
        } else {
            this.right = moves;
        }
    }

    get leftMoves() {
        return this.left.map((m) => m.clone());
    }
    get rightMoves() {
        return this.right.map((m) => m.clone());
    }

    normalize() {
        this.removeDominatedMoves(true);
        this.removeDominatedMoves(false);

        this.bypassReversibleL();
        this.bypassReversibleR();

        return this.asNus() ?? this;
    }

    asNimber(): bigint | null {
        if (this.isImpartial()) {
            let nimbers = null;
            for (const l of this.leftMoves) {
                const nimber = l.asNimber();
                if (nimber == null) {
                    nimbers = null;
                    break;
                } else {
                    if (nimbers == null) {
                        nimbers = new Set([nimber])
                    } else {
                        nimbers.add(nimber);
                    }
                }
            }
            if (nimbers != null) {
                let mex = 0n;
                while (nimbers.has(mex)) {
                    mex += 1n;
                }
                return mex
            }
        }
        return null;
    }

    asNus(): NumberUpStar|null {
        const num = this.asNumber();
        if (num) {
            return new NumberUpStar(num);
        }
        const up = this.asUpStar() ?? this.asUp();
        if (up) {
            return up;
        }

        if (this.isImpartial()) {
            if (this.leftMoves.length == 1) {
                const number = this.leftMoves[0].asNumber();
                if (number != null) {
                    return new NumberUpStar(number, 0n, 1n)
                }
            }

            return new NumberUpStar(0n, this.asNimber() ?? 0n, 0n)
        }

        if (this.rightMoves.length == 0 && this.leftMoves.length > 0) {
            let left = this.leftMoves
            let zeroCmp = left[0].partialCompare(new NumberUpStar(0n));
            for (const l in left.slice(1)) {
                const lZeroCmp = left[0].partialCompare(new NumberUpStar(0n));
                if (lZeroCmp != zeroCmp) {
                    zeroCmp = null;
                    break;
                }
            }
            if (zeroCmp == -1) {
                return new NumberUpStar(0n)
            }
        }
        if (this.leftMoves.length == 0 && this.rightMoves.length > 0) {
            let left = this.rightMoves
            let zeroCmp = left[0].partialCompare(new NumberUpStar(0n));
            for (const l in left.slice(1)) {
                const lZeroCmp = left[0].partialCompare(new NumberUpStar(0n));
                if (lZeroCmp != zeroCmp) {
                    zeroCmp = null;
                    break;
                }
            }
            if (zeroCmp == -1) {
                return new NumberUpStar(0n)
            }
        }
        return null;
    }

    /** Check if left == right
     * @returns {boolean}
     */
    isImpartial() {
        for (const gL of this.leftMoves) {
            let found = false;
            for (const gR of this.rightMoves) {
                if (gR.partialCompare(gL) == 0) {
                    found = true;
                    break;
                }
            }
            if (found == false) return false;
        }
        return true;
    }

    /** Try to conver this into a NumberUpStar where up and star are equal to 1 
     * i.e. return n + ^ +  * if {n,n*|n} or n + -^ + * if {n|n,n*}
     */
    asUpStar() {
        let a1, a2;
        let b1;
        let star;

        if (this.left.length == 2 && this.right.length == 1) {
            [a1, a2] = this.left;
            [b1] = this.right;
            star = 1n;
        } else if (this.left.length == 1 && this.right.length == 2) {
            [a1, a2] = this.right;
            [b1] = this.left;
            star = -1n
        }


        if (a1 instanceof NumberUpStar && a2 instanceof NumberUpStar && b1 instanceof NumberUpStar) {
            if (a1.number == a2.number && b1.number == a1.number && b1.up == 0n && a1.up == 0n && a2.up == 0n) {
                if ((a1.star == 0n && a2.star == 1n) || (a2.star == 0n && a1.star == 1n)) {
                    return new NumberUpStar(a1.number, star, 1n);
                }
            }
        }

        return null;
    }

    /** returns a NumberUpStar if the game is in the form {0|G}, if G is a NumberUpStar with up > 0 or {G|0} if up < 0
     *  or returns ^ if the game is {0|*} or -^ if the game is {*|0}
     */
    asUp() {
        if (this.left.length == 1 && this.right.length == 1) {
            let [l] = this.left;
            let [r] = this.right;
            if (l instanceof NumberUpStar && r instanceof NumberUpStar) {
                if (l.isZero() && (r.up > 0n || r.star > 0n)) {
                    return new NumberUpStar(r.number, r.up + 1n, r.star ^ 1n)
                }
                if (r.isZero() && (l.up < 0n || r.star > 0n)) {
                    return new NumberUpStar(r.number, r.up - 1n, r.star ^ 1n)
                }
            }
        }
    }


    asNumber(): DyadicRational | null {
        let leftMax = null;
        let rightMin = null;
        for (const l of this.leftMoves) {
            let lNum = l.asNumber();
            if (lNum == null) {
                return null;
            }
            if (leftMax == null || leftMax.compare(lNum) == -1) {
                leftMax = lNum;
            }
        }
        for (const r of this.rightMoves) {
            let rNum = r.asNumber();
            if (rNum == null) {
                return null;
            }
            if (rightMin == null || rightMin.compare(rNum) == 1) {
                rightMin = rNum;
            }
        }


        // handle no options for left or right player
        if (leftMax == null && rightMin != null) {
            if (rightMin.numerator > 0) {
                return new DyadicRational(0)
            } else {
                const result = rightMin.clone();
                result.sub(new DyadicRational(1n));
                return result;
            }
        } else if (rightMin == null && leftMax != null) {
            if (leftMax.numerator < 0) {
                return new DyadicRational(0)
            } else {
                const result = leftMax.clone();
                result.add(new DyadicRational(1n));
                return result;
            }
        } else if (rightMin == null && leftMax == null) {
            return new DyadicRational(0);
        }

        if (rightMin == null || leftMax == null) {
            throw new Error("unreachable");
        }

        if (leftMax.compare(rightMin) != -1) {
            return null;
        }

        // 1 (easy case) the simplest number is zero
        // Source: https://mathstrek.blog/2012/08/15/combinatorial-game-theory-vii/, "Simplicity Rule"
        if (leftMax.numerator < 0 && rightMin.numerator > 0) {
            return new DyadicRational(0);
        }

        // 2: try to find the smallest denominator
        let dist = rightMin.clone();
        let endpointOffset;
        dist.sub(leftMax);
        if (dist.numerator == 1n) {
            // forced to split the rational number
            endpointOffset = new DyadicRational(1n, dist.denominatorExp + 1n);
        } else {
            endpointOffset = new DyadicRational(powerOfTwoLess(dist.numerator), dist.denominatorExp);
        }

        if (rightMin.numerator < 0) {
            const result = rightMin.clone();
            result.sub(endpointOffset);
            return result
        } else {
            const result = leftMax.clone();
            result.add(endpointOffset);
            return result;
        }
    }
}
