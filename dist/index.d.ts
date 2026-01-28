declare class BitBoard {
	private;
	get width(): bigint;
	get height(): bigint;
	get maskRow(): bigint;
	get maskCol(): bigint;
	get bits(): bigint;
	set bits(bits: bigint);
	constructor(w: bigint, h: bigint, bits?: bigint);
	resize(w: bigint, h: bigint): BitBoard;
	clone(): BitBoard;
	translateInPlace(x: bigint, y: bigint);
	translate(x: bigint, y: bigint): BitBoard;
	get(x: bigint, y: bigint): boolean;
	getByIndex(i: bigint): boolean;
	set(x: bigint, y: bigint);
	clear(x: bigint, y: bigint);
	flipVerticalInPlace();
	transpose(): BitBoard;
	flipHorizontalInPlace();
	flipHorizontal(): BitBoard;
	flipVertical(): BitBoard;
	toString(): string;
	rotateClockwise(): BitBoard;
	/**
	* Iterate the cells that are "true" (have a '1' value in the bitboard)
	* 
	* @returns a generator that yields the x and y coordinates of the cells that are "true", in the form [x, y]
	*/
	iterSet(): Generator<[bigint, bigint], void>;
	iterClear(): Generator<[bigint, bigint], void>;
}
declare function deltaSwap(board: bigint, mask: bigint, delta: bigint);
declare enum TileState {
	Interior = "interior",
	Corner = "corner",
	Side = "side",
	Empty = "empty"
}
declare class Blokus {
	private;
	get width();
	get height();
	get corners();
	get interiors();
	get sides();
	constructor(side: BitBoard, corner: BitBoard, interior: BitBoard);
	static empty(w: bigint, h: bigint): Blokus;
	static fromString(str: string): Blokus;
	isEqualTo(other: Blokus): boolean;
	toStringBoard(): string;
	get(x: bigint, y: bigint): TileState;
	getByIndex(i: bigint): TileState;
	set(x: bigint, y: bigint, state: TileState);
	clone(): Blokus;
	/**
	* Get a string representation of the object.
	*/
	toString(): string;
	serialize(): ArrayBuffer;
	static deserialize(buffer: ArrayBufferLike): Blokus;
	countInterior(): bigint;
	resize(w: bigint, h: bigint): Blokus;
	rotateClockwise(): Blokus;
	flipHorizontal(): Blokus;
	flipVertical(): Blokus;
	translateInPlace(x: bigint, y: bigint);
	assertValid();
	tryPlacePolyomino(boardX: bigint, boardY: bigint, polyomino: Blokus, polyX?: bigint, polyY?: bigint): boolean;
	movesDeduplicated(polyominos: Blokus[]): Generator<Blokus, void, void>;
	/**
	* enumerate all possible moves for a given set of polyominos.
	* 
	* @param polyominos 
	*/
	moves(polyominos: Blokus[]): Generator<Blokus, void, void>;
}
declare class DyadicRational {
	private;
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
	get numerator();
	get denominatorExp();
	/** Calculate the real denominator.
	* @returns {bigint}
	*/
	denominator();
	toString();
	clone();
	compare(rhs: bigint | boolean | number | string | DyadicRational);
	/** Simplify the fraction, this operation should be run after construction, or any arithmetic.
	*/
	normalize();
	neg();
	/** shorthand to check if the numerator is zero
	*  @returns {boolean}
	*/
	isZero();
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
type Ordering = -1 | 0 | 1;
/** Marks child classes as partially (optionally) comparable
*/
declare class PartialOrder {
	partialCompare(rhs: PartialOrder): Ordering | null;
}
declare class CanonicalForm extends PartialOrder {
	get leftMoves(): CanonicalForm[];
	get rightMoves(): CanonicalForm[];
	asNumber(): DyadicRational | null;
	asNimber(): bigint | null;
	partialCompare(rhs: CanonicalForm): Ordering | null;
	clone(): CanonicalForm;
}
/** Sum of a dyadic rational number m/(2^n), an positive or negative infinitesimal (up), and a Nimber (star)
* @prop {bigint} up
* @prop {bigint} star
* @prop {DyadicRational} number
*/
declare class NumberUpStar extends CanonicalForm {
	private;
	get number();
	get up();
	get star();
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
	asNumber();
	/** If the niumber and up components are zero return the star component, otherwise return null
	* @returns {bigint | null}
	*/
	asNimber();
	generateRightOptions();
	generateLeftOptions();
	toString();
	clone(): NumberUpStar;
}
declare function canonicalForm(left: (NumberUpStar | MoveSet)[], right: (NumberUpStar | MoveSet)[]);
/** A list of left and right player moves
* @implements {PartialOrder}
*/
declare class MoveSet extends CanonicalForm {
	left;
	right;
	/**
	* @param {CanonicalForm[]} left
	* @param {CanonicalForm[]} right
	*/
	constructor(left: CanonicalForm[], right: CanonicalForm[]);
	clone(): MoveSet;
	/** Returns true if neither player has any options
	* @returns {boolean}
	*/
	isZero();
	/** Bypass reversible moves for the left player
	*/
	bypassReversibleL();
	toString();
	/** Bypass reversible moves for the right player
	*/
	bypassReversibleR();
	/** Remove dominated moves from a single side.
	* @param {boolean} left  true to remove dominated left moves, false to remove dominated right moves
	*/
	removeDominatedMoves(left: boolean);
	get leftMoves();
	get rightMoves();
	normalize();
	asNimber(): bigint | null;
	asNus(): NumberUpStar | null;
	/** Check if left == right
	* @returns {boolean}
	*/
	isImpartial();
	/** Try to conver this into a NumberUpStar where up and star are equal to 1 
	* i.e. return n + ^ +  * if {n,n*|n} or n + -^ + * if {n|n,n*}
	*/
	asUpStar();
	/** returns a NumberUpStar if the game is in the form {0|G}, if G is a NumberUpStar with up > 0 or {G|0} if up < 0
	*  or returns ^ if the game is {0|*} or -^ if the game is {*|0}
	*/
	asUp();
	asNumber(): DyadicRational | null;
}
export { deltaSwap, canonicalForm, TileState, NumberUpStar, MoveSet, CanonicalForm, Blokus, BitBoard };
