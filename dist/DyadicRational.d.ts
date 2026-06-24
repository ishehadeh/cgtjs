export declare class DyadicRational {
    #private;
    get leftMoves(): [DyadicRational] | [];
    get rightMoves(): [DyadicRational] | [];
    /**
     *
     * @param {bigint | number} numerator
     * @param {bigint | number} denominatorExp must be greater than or equal to zero
     */
    constructor(numerator: bigint | number, denominatorExp?: bigint | number);
    /** Construct a Dyadic Rational from a string, bigint, or number
     *
     * @throws {TypeError}
     */
    static from(value: bigint | boolean | number | string | DyadicRational): DyadicRational;
    get numerator(): bigint;
    get denominatorExp(): bigint;
    /** Calculate the real denominator.
     * @returns {bigint}
     */
    denominator(): bigint;
    toString(): string;
    clone(): DyadicRational;
    compare(rhs: bigint | boolean | number | string | DyadicRational): import("./index.ts").Ordering;
    /** Simplify the fraction, this operation should be run after construction, or any arithmetic.
     */
    normalize(): void;
    neg(): void;
    /** shorthand to check if the numerator is zero
     *  @returns {boolean}
     */
    isZero(): boolean;
    /** Get the right options
     */
    right(): DyadicRational | null;
    /** Get the left options
     */
    left(): DyadicRational | null;
    /** Add rhs to this rational, return a reference to self.
     */
    add(rhs: DyadicRational): DyadicRational;
    /** subtract rhs to this rational, return a reference to self.
     */
    sub(rhs: DyadicRational): DyadicRational;
}
