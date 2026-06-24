import { CanonicalForm } from './CanonicalForm.ts';
import { DyadicRational } from './DyadicRational.ts';
import { NumberUpStar } from './NumberUpStar.ts';
export declare function canonicalForm(left: (NumberUpStar | MoveSet)[], right: (NumberUpStar | MoveSet)[]): NumberUpStar | MoveSet;
/** A list of left and right player moves
 * @implements {PartialOrder}
 */
export declare class MoveSet extends CanonicalForm {
    left: CanonicalForm[];
    right: CanonicalForm[];
    /**
     * @param {CanonicalForm[]} left
     * @param {CanonicalForm[]} right
     */
    constructor(left: CanonicalForm[], right: CanonicalForm[]);
    clone(): MoveSet;
    /** Returns true if neither player has any options
     * @returns {boolean}
     */
    isZero(): boolean;
    /** Bypass reversible moves for the left player
     */
    bypassReversibleL(): void;
    toString(): string;
    /** Bypass reversible moves for the right player
     */
    bypassReversibleR(): void;
    /** Remove dominated moves from a single side.
     * @param {boolean} left  true to remove dominated left moves, false to remove dominated right moves
     */
    removeDominatedMoves(left: boolean): void;
    get leftMoves(): CanonicalForm[];
    get rightMoves(): CanonicalForm[];
    normalize(): NumberUpStar | this;
    asNimber(): bigint | null;
    asNus(): NumberUpStar | null;
    /** Check if left == right
     * @returns {boolean}
     */
    isImpartial(): boolean;
    /** Try to conver this into a NumberUpStar where up and star are equal to 1
     * i.e. return n + ^ +  * if {n,n*|n} or n + -^ + * if {n|n,n*}
     */
    asUpStar(): NumberUpStar | null;
    /** returns a NumberUpStar if the game is in the form {0|G}, if G is a NumberUpStar with up > 0 or {G|0} if up < 0
     *  or returns ^ if the game is {0|*} or -^ if the game is {*|0}
     */
    asUp(): NumberUpStar | undefined;
    asNumber(): DyadicRational | null;
}
