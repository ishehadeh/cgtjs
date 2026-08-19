import { PartialOrder } from "./utils/PartialOrder.js";
export class CanonicalForm extends PartialOrder {
    get leftMoves() {
        throw new Error('Not Implemented');
    }
    get rightMoves() {
        throw new Error('Not Implemented');
    }
    asNumber() {
        throw new Error('Not Implemented');
    }
    asNimber() {
        throw new Error('Not Implemented');
    }
    partialCompare(rhs) {
        if (!(rhs instanceof CanonicalForm)) {
            throw new TypeError('expected an instance of CanonicalForm');
        }
        // TEMPERATURE THEORY AND THE THERMOSTATIC STRATEGY, Karen Ye
        // https://www.math.uchicago.edu/~may/VIGRE/VIGRE2009/REUPapers/Ye.pdf
        // Definition 2.3: An equivalent definition of inequality is that G ≥ H if and only
        // if there is no option Hᴸ such that Hᴸ ≥ G and there is no option Gᴿ such that
        // Gᴿ ≤ H
        const rhsL = rhs.leftMoves;
        const rhsR = rhs.rightMoves;
        const lhsL = this.leftMoves;
        const lhsR = this.rightMoves;
        let isLt = false;
        // Check: "no option Hᴸ such that Hᴸ ≥ G"
        for (const hL of rhsL) {
            if ((hL.partialCompare(this) ?? NaN) >= 0) {
                isLt = true;
                break;
            }
        }
        if (!isLt) {
            // Check: " no option Gᴿ such that Gᴿ ≤ H"
            for (const gR of lhsR) {
                if ((gR.partialCompare(rhs) ?? NaN) <= 0) {
                    isLt = true;
                    break;
                }
            }
        }
        // check the inverse, H >= G
        let isGt = false;
        // Check: "no option Gᴸ such that Gᴸ ≥ H"
        for (const gL of lhsL) {
            if ((gL.partialCompare(rhs) ?? NaN) >= 0) {
                isGt = true;
                break;
            }
        }
        if (!isGt) {
            // Check: " no option Hᴿ such that Hᴿ ≤ G"
            for (const hR of rhsR) {
                if ((hR.partialCompare(this) ?? NaN) <= 0) {
                    isGt = true;
                    break;
                }
            }
        }
        if (!isGt && !isLt) {
            // !(this < rhs) && !(this > rhs) ==> this == rhs
            return 0;
        }
        else if (isGt && !isLt) {
            return 1;
        }
        else if (isLt && !isGt) {
            return -1;
        }
        else {
            return null;
        }
    }
    clone() {
        throw new Error('unimplemented');
    }
}
