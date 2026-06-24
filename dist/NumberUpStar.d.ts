import { CanonicalForm } from './CanonicalForm.ts';
import { DyadicRational } from './DyadicRational.ts';
import { type Ordering } from './utils/compare.ts';
/** Sum of a dyadic rational number m/(2^n), an positive or negative infinitesimal (up), and a Nimber (star)
 * @prop {bigint} up
 * @prop {bigint} star
 * @prop {DyadicRational} number
 */
export declare class NumberUpStar extends CanonicalForm {
    #private;
    get number(): DyadicRational;
    get up(): bigint;
    get star(): bigint;
    get leftMoves(): CanonicalForm[];
    get rightMoves(): CanonicalForm[];
    isZero(): boolean;
    constructor(number?: DyadicRational | bigint, up?: bigint, star?: bigint);
    /** Try to coerce an arbirary value into a NumberUpStar
     *
     * @throws {TypeError}
     */
    static coerce(value: unknown): NumberUpStar;
    partialCompare(rhsRaw: CanonicalForm): Ordering | null;
    /** If the up and star components are zero return a DyadicRational, otherwise return null
     * @returns {DyadicRational | null}
     */
    asNumber(): DyadicRational | null;
    /** If the niumber and up components are zero return the star component, otherwise return null
     * @returns {bigint | null}
     */
    asNimber(): bigint | null;
    generateRightOptions(): Generator<NumberUpStar, void, unknown>;
    generateLeftOptions(): Generator<NumberUpStar, void, unknown>;
    toString(): string;
    clone(): NumberUpStar;
}
