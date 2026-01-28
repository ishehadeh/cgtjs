var import_node_module = require("node:module");
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __moduleCache = /* @__PURE__ */ new WeakMap;
var __toCommonJS = (from) => {
  var entry = __moduleCache.get(from), desc;
  if (entry)
    return entry;
  entry = __defProp({}, "__esModule", { value: true });
  if (from && typeof from === "object" || typeof from === "function")
    __getOwnPropNames(from).map((key) => !__hasOwnProp.call(entry, key) && __defProp(entry, key, {
      get: () => from[key],
      enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
    }));
  __moduleCache.set(from, entry);
  return entry;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: (newValue) => all[name] = () => newValue
    });
};

// cgtjs/index.ts
var exports_cgtjs = {};
__export(exports_cgtjs, {
  deltaSwap: () => deltaSwap,
  canonicalForm: () => canonicalForm,
  TileState: () => TileState,
  NumberUpStar: () => NumberUpStar,
  MoveSet: () => MoveSet,
  CanonicalForm: () => CanonicalForm,
  Blokus: () => Blokus,
  BitBoard: () => BitBoard
});
module.exports = __toCommonJS(exports_cgtjs);

// cgtjs/Board.ts
class BitBoard {
  #bits;
  #width;
  #height;
  #maskRow = 0n;
  #maskCol = 0n;
  get width() {
    return this.#width;
  }
  get height() {
    return this.#height;
  }
  get maskRow() {
    return this.#maskRow;
  }
  get maskCol() {
    return this.#maskCol;
  }
  get bits() {
    return BigInt.asUintN(Number(this.width * this.height), this.#bits);
  }
  set bits(bits) {
    this.#bits = BigInt.asUintN(Number(this.width * this.height), bits);
  }
  constructor(w, h, bits = 0n) {
    this.#width = w;
    this.#height = h;
    this.#bits = BigInt.asUintN(Number(w * h), bits);
    this.#maskCol = BigInt.asUintN(Number(w * h), 0n);
    this.#maskRow = BigInt.asUintN(Number(w * h), 0n);
    for (let i = 0n;i < this.width; ++i) {
      this.#maskRow |= 1n << i;
    }
    for (let i = 0n;i < this.height; ++i) {
      this.#maskCol |= 1n << i * this.width;
    }
  }
  resize(w, h) {
    const newBoard = new BitBoard(w, h);
    const rowMask = this.width < w ? this.maskRow : newBoard.maskRow;
    const copyHeight = this.height > h ? h : this.height;
    for (let i = 0n;i < copyHeight; ++i) {
      newBoard.#bits |= (this.#bits & rowMask << i * this.width) >> i * this.width << i * w;
    }
    return newBoard;
  }
  clone() {
    return new BitBoard(this.width, this.height, this.bits);
  }
  translateInPlace(x, y) {
    while (x < 0) {
      this.#bits &= ~this.maskCol;
      this.#bits >>= 1n;
      x += 1n;
    }
    while (x > 0) {
      this.#bits &= ~(this.maskCol << this.width - 1n);
      this.#bits <<= 1n;
      x -= 1n;
    }
    while (y < 0) {
      this.#bits >>= this.width;
      y += 1n;
    }
    while (y > 0) {
      this.#bits &= ~(this.maskRow << (this.height - 1n) * this.width);
      this.#bits <<= this.height;
      y -= 1n;
    }
  }
  translate(x, y) {
    const tr = new BitBoard(this.width, this.height, this.bits);
    tr.translateInPlace(x, y);
    return tr;
  }
  get(x, y) {
    return (this.#bits & 1n << y * this.width + x) > 0;
  }
  getByIndex(i) {
    return (this.#bits & 1n << i) > 0;
  }
  set(x, y) {
    this.#bits |= 1n << y * this.width + x;
  }
  clear(x, y) {
    this.#bits &= ~(1n << y * this.width + x);
  }
  flipVerticalInPlace() {
    let newBits = BigInt.asUintN(Number(this.width * this.height), 0n);
    for (let i = 0n;i < this.height; ++i) {
      const rowTopOffset = i * this.width;
      const rowBottomOffset = (this.height - i - 1n) * this.width;
      newBits |= (this.maskRow & this.#bits >> rowTopOffset) << rowBottomOffset;
      newBits |= (this.maskRow & this.#bits >> rowBottomOffset) << rowTopOffset;
    }
    this.#bits = newBits;
  }
  transpose() {
    const newBoard = new BitBoard(this.height, this.width);
    for (let x = 0n;x < this.width; ++x) {
      for (let y = 0n;y < this.height; ++y) {
        if (this.get(x, y)) {
          newBoard.set(y, x);
        }
      }
    }
    return newBoard;
  }
  flipHorizontalInPlace() {
    let newBits = BigInt.asUintN(Number(this.width * this.height), 0n);
    for (let i = 0n;i < (this.width + 1n) / 2n; ++i) {
      const colLeftOffset = i;
      const colRightOffset = this.width - i - 1n;
      newBits |= (this.maskCol & this.#bits >> colLeftOffset) << colRightOffset;
      newBits |= (this.maskCol & this.#bits >> colRightOffset) << colLeftOffset;
    }
    this.#bits = newBits;
  }
  flipHorizontal() {
    const clone = this.clone();
    clone.flipHorizontalInPlace();
    return clone;
  }
  flipVertical() {
    const clone = this.clone();
    clone.flipVerticalInPlace();
    return clone;
  }
  toString() {
    let str = "";
    for (let y = 0n;y < this.height; ++y) {
      for (let x = 0n;x < this.width; ++x) {
        str += this.get(x, y) ? "1" : "0";
      }
      str += `
`;
    }
    return str;
  }
  rotateClockwise() {
    const tr = this.transpose();
    tr.flipHorizontalInPlace();
    return tr;
  }
  *iterSet() {
    for (let i = 0n;i < this.width * this.height; ++i) {
      if ((this.#bits & 1n << i) > 0n) {
        yield [i % this.width, i / this.width];
      }
    }
  }
  *iterClear() {
    for (let i = 0n;i < this.width * this.height; ++i) {
      if ((this.#bits & 1n << i) == 0n) {
        yield [i % this.width, i / this.width];
      }
    }
  }
}
function deltaSwap(board, mask, delta) {
  const x = (board ^ board >> delta) & mask;
  return board ^ x << delta ^ x;
}

// cgtjs/game/Blokus.ts
var TileState;
((TileState2) => {
  TileState2["Interior"] = "interior";
  TileState2["Corner"] = "corner";
  TileState2["Side"] = "side";
  TileState2["Empty"] = "empty";
})(TileState ||= {});

class Blokus {
  #side;
  #corner;
  #interior;
  get width() {
    return this.#side.width;
  }
  get height() {
    return this.#side.height;
  }
  constructor(side, corner, interior) {
    this.#side = side;
    this.#corner = corner;
    this.#interior = interior;
  }
  static empty(w, h) {
    return new Blokus(new BitBoard(w, h), new BitBoard(w, h), new BitBoard(w, h));
  }
  static fromString(str) {
    const rowsTrimmed = str.split(`
`).map((r) => r.trim()).filter((r) => r.length !== 0);
    const w = BigInt(Math.max(...rowsTrimmed.map((r) => r.length)));
    const h = BigInt(rowsTrimmed.length);
    const game = Blokus.empty(w, h);
    let y = 0n;
    for (const row of rowsTrimmed) {
      let x = 0n;
      for (const cell of row) {
        switch (cell) {
          case ".":
            game.set(x, y, "empty" /* Empty */);
            break;
          case "i":
            game.set(x, y, "interior" /* Interior */);
            break;
          case "c":
            game.set(x, y, "corner" /* Corner */);
            break;
          case "s":
            game.set(x, y, "side" /* Side */);
            break;
          default:
            throw TypeError("unexpected character");
        }
        x += 1n;
      }
      y += 1n;
    }
    return game;
  }
  isEqualTo(other) {
    return other.width === this.width && other.height === this.height && other.#corner.bits === this.#corner.bits && other.#side.bits === this.#side.bits && other.#interior.bits === this.#interior.bits;
  }
  toStringBoard() {
    let boardStr = "";
    for (let y = 0n;y < this.height; ++y) {
      for (let x = 0n;x < this.width; ++x) {
        switch (this.get(x, y)) {
          case "side" /* Side */:
            boardStr += "s";
            break;
          case "corner" /* Corner */:
            boardStr += "c";
            break;
          case "interior" /* Interior */:
            boardStr += "i";
            break;
          case "empty" /* Empty */:
            boardStr += ".";
            break;
        }
      }
      boardStr += `
`;
    }
    return boardStr;
  }
  get(x, y) {
    if (this.#side.get(x, y))
      return "side" /* Side */;
    if (this.#corner.get(x, y))
      return "corner" /* Corner */;
    if (this.#interior.get(x, y))
      return "interior" /* Interior */;
    return "empty" /* Empty */;
  }
  getByIndex(i) {
    if (this.#side.getByIndex(i))
      return "side" /* Side */;
    if (this.#corner.getByIndex(i))
      return "corner" /* Corner */;
    if (this.#interior.getByIndex(i))
      return "interior" /* Interior */;
    return "empty" /* Empty */;
  }
  set(x, y, state) {
    switch (state) {
      case "interior" /* Interior */:
        this.#side.clear(x, y);
        this.#corner.clear(x, y);
        this.#interior.set(x, y);
        break;
      case "side" /* Side */:
        this.#side.set(x, y);
        this.#corner.clear(x, y);
        this.#interior.clear(x, y);
        break;
      case "corner" /* Corner */:
        this.#side.clear(x, y);
        this.#corner.set(x, y);
        this.#interior.clear(x, y);
        break;
      case "empty" /* Empty */:
        this.#side.clear(x, y);
        this.#corner.clear(x, y);
        this.#interior.clear(x, y);
        break;
      default:
        throw new TypeError(`invalid state: "${state}"`);
    }
  }
  clone() {
    return new Blokus(this.#side.clone(), this.#corner.clone(), this.#interior.clone());
  }
  toString() {
    return `Blokus(${this.width}, ${this.height}, ${this.#side.bits}, ${this.#corner.bits}, ${this.#interior.bits})`;
  }
  serialize() {
    const littleEndian = false;
    const fieldSize = (this.height * this.width + 7n) / 8n;
    const size = 2n + 2n + fieldSize * 3n;
    const buffer = new ArrayBuffer(Number(size));
    const dataView = new DataView(buffer);
    dataView.setUint16(0, Number(this.width), littleEndian);
    dataView.setUint16(2, Number(this.height), littleEndian);
    let offset = 4;
    for (const field of [this.#side.bits, this.#corner.bits, this.#interior.bits]) {
      for (let byteIndex = 0n;byteIndex < fieldSize; ++byteIndex) {
        dataView.setUint8(offset, Number(field >> byteIndex * 8n & 0xffn));
        offset += 1;
      }
    }
    return buffer;
  }
  static deserialize(buffer) {
    const littleEndian = false;
    const dataView = new DataView(buffer);
    const width = BigInt(dataView.getUint16(0, littleEndian));
    const height = BigInt(dataView.getUint16(2, littleEndian));
    const fieldSize = (height * width + 7n) / 8n;
    let offset = 4;
    const fieldBits = Number(fieldSize * 8n);
    let fields = {
      sideBits: BigInt.asUintN(fieldBits, 0n),
      cornerBits: BigInt.asUintN(fieldBits, 0n),
      interiorBits: BigInt.asUintN(fieldBits, 0n)
    };
    for (let fieldName in fields) {
      for (let byteIndex = 0n;byteIndex < fieldSize; ++byteIndex) {
        fields[fieldName] |= BigInt.asUintN(fieldBits, BigInt(dataView.getUint8(offset))) << byteIndex * 8n;
        offset += 1;
      }
    }
    return new Blokus(new BitBoard(width, height, fields["sideBits"]), new BitBoard(width, height, fields["cornerBits"]), new BitBoard(width, height, fields["interiorBits"]));
  }
  countInterior() {
    let bits = this.#interior.bits;
    let count = 0n;
    while (bits > 0n) {
      count += bits & 1n;
      bits >>= 1n;
    }
    return count;
  }
  resize(w, h) {
    return new Blokus(this.#side.resize(w, h), this.#corner.resize(w, h), this.#interior.resize(w, h));
  }
  rotateClockwise() {
    return new Blokus(this.#side.rotateClockwise(), this.#corner.rotateClockwise(), this.#interior.rotateClockwise());
  }
  flipHorizontal() {
    return new Blokus(this.#side.flipHorizontal(), this.#corner.flipHorizontal(), this.#interior.flipHorizontal());
  }
  flipVertical() {
    return new Blokus(this.#side.flipVertical(), this.#corner.flipVertical(), this.#interior.flipVertical());
  }
  translateInPlace(x, y) {
    this.#side.translateInPlace(x, y);
    this.#corner.translateInPlace(x, y);
    this.#interior.translateInPlace(x, y);
  }
  assertValid() {
    console.assert((this.#corner.bits & this.#interior.bits) === 0n);
    console.assert((this.#corner.bits & this.#side.bits) === 0n);
    console.assert((this.#side.bits & this.#interior.bits) === 0n);
  }
  tryPlacePolyomino(boardX, boardY, polyomino, polyX = 0n, polyY = 0n) {
    const changes = [];
    for (let x = 0n;x < polyomino.width; ++x) {
      for (let y = 0n;y < polyomino.height; ++y) {
        const tileX = x + boardX - polyX;
        const tileY = y + boardY - polyY;
        const isOutOfBounds = tileX < 0 || tileY < 0 || tileX >= this.width || tileY >= this.height;
        const polyTile = polyomino.get(x, y);
        const boardTile = this.get(tileX, tileY);
        if (isOutOfBounds) {
          if (polyTile === "interior" /* Interior */) {
            return false;
          } else {
            continue;
          }
        }
        if (polyTile === "interior" /* Interior */) {
          if (boardTile === "side" /* Side */ || boardTile === "interior" /* Interior */) {
            return false;
          } else {
            changes.push([tileX, tileY, polyTile]);
          }
        } else if (polyTile === "corner" /* Corner */) {
          if (boardTile === "empty" /* Empty */) {
            changes.push([tileX, tileY, polyTile]);
          }
        } else if (polyTile === "empty" /* Empty */) {} else if (polyTile === "side" /* Side */) {
          if (boardTile === "interior" /* Interior */) {
            return false;
          } else {
            changes.push([tileX, tileY, polyTile]);
          }
        }
      }
    }
    for (const [x, y, state] of changes) {
      this.set(x, y, state);
    }
    return true;
  }
  *movesDeduplicated(polyominos) {
    const alreadySeen = new Set;
    for (const child of this.moves(polyominos)) {
      const serialized = child.toString();
      if (!alreadySeen.has(serialized)) {
        alreadySeen.add(serialized);
        yield child;
      }
    }
  }
  *moves(polyominos) {
    for (const polyomino of polyominos) {
      let currentPoly = polyomino;
      for (let mirror = 0;mirror < 2; ++mirror) {
        if (mirror > 0) {
          currentPoly = currentPoly.flipHorizontal();
        }
        for (let rotation = 0;rotation < 4; rotation++) {
          if (rotation > 0) {
            currentPoly = currentPoly.rotateClockwise();
          }
          for (const [boardX, boardY] of this.#corner.iterSet()) {
            for (const [polyX, polyY] of currentPoly.#corner.iterSet()) {
              for (const [offsetX, offsetY] of [[1n, 1n], [-1n, 1n], [1n, -1n], [-1n, -1n]]) {
                const boardInteriorX = boardX + offsetX;
                const boardInteriorY = boardY + offsetY;
                const pieceInteriorX = polyX - offsetX;
                const pieceInteriorY = polyY - offsetY;
                if (boardInteriorX >= 0n && boardInteriorX < this.width && boardInteriorY >= 0n && boardInteriorY < this.height && this.get(boardInteriorX, boardInteriorY) !== "interior" /* Interior */) {
                  continue;
                }
                if (currentPoly.get(pieceInteriorX, pieceInteriorY) !== "interior" /* Interior */) {
                  continue;
                }
                let newBoard = this.clone();
                if (newBoard.tryPlacePolyomino(boardInteriorX, boardInteriorY, currentPoly, polyX, polyY)) {
                  yield newBoard;
                }
              }
            }
          }
        }
      }
    }
  }
}
// cgtjs/utils/PartialOrder.ts
class PartialOrder {
  partialCompare(rhs) {
    throw Error("Not Implemented: Order.partialCompare");
  }
}

// cgtjs/CanonicalForm.ts
class CanonicalForm extends PartialOrder {
  get leftMoves() {
    throw new Error("Not Implemented");
  }
  get rightMoves() {
    throw new Error("Not Implemented");
  }
  asNumber() {
    throw new Error("Not Implemented");
  }
  asNimber() {
    throw new Error("Not Implemented");
  }
  partialCompare(rhs) {
    if (!(rhs instanceof CanonicalForm)) {
      throw new TypeError("expected an instance of CanonicalForm");
    }
    const rhsL = rhs.leftMoves;
    const rhsR = rhs.rightMoves;
    const lhsL = this.leftMoves;
    const lhsR = this.rightMoves;
    let isLt = false;
    for (const hL of rhsL) {
      if ((hL.partialCompare(this) ?? NaN) >= 0) {
        isLt = true;
        break;
      }
    }
    if (!isLt) {
      for (const gR of lhsR) {
        if ((gR.partialCompare(rhs) ?? NaN) <= 0) {
          isLt = true;
          break;
        }
      }
    }
    let isGt = false;
    for (const gL of lhsL) {
      if ((gL.partialCompare(rhs) ?? NaN) >= 0) {
        isGt = true;
        break;
      }
    }
    if (!isGt) {
      for (const hR of rhsR) {
        if ((hR.partialCompare(this) ?? NaN) <= 0) {
          isGt = true;
          break;
        }
      }
    }
    if (!isGt && !isLt) {
      return 0;
    } else if (isGt && !isLt) {
      return 1;
    } else if (isLt && !isGt) {
      return -1;
    } else {
      return null;
    }
  }
  clone() {
    throw new Error("unimplemented");
  }
}
// cgtjs/utils/typecheck.ts
function expectBigInt(n, name = "value") {
  if (typeof n != "number" && typeof n != "bigint") {
    throw new TypeError(`expected ${name} to be numeric, got ${n}`);
  }
  if (typeof n == "number" && !Number.isInteger(n)) {
    throw new TypeError(`expected ${name} to be an integer, got ${n}`);
  }
  return Object.freeze(BigInt(n));
}

// cgtjs/utils/compare.ts
function compareBigInt(lhs, rhs) {
  if (lhs < rhs) {
    return -1;
  } else if (lhs > rhs) {
    return 1;
  } else {
    return 0;
  }
}

// cgtjs/DyadicRational.ts
class DyadicRational {
  #numerator;
  #denominatorExp;
  get leftMoves() {
    const l = this.left();
    return l ? [l] : [];
  }
  get rightMoves() {
    const r = this.right();
    return r ? [r] : [];
  }
  constructor(numerator, denominatorExp = 0n) {
    this.#numerator = expectBigInt(numerator);
    this.#denominatorExp = expectBigInt(denominatorExp);
    if (this.#denominatorExp < 0n) {
      throw new Error(`invalid dyadic rational (${this}): denominator must be greater than or equal to zero.`);
    }
    this.normalize();
  }
  static from(value) {
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
        return new DyadicRational(BigInt(value));
      default:
        throw new TypeError(`cannot coerce value "${value}" to a DyadicRational`);
    }
  }
  get numerator() {
    return this.#numerator;
  }
  get denominatorExp() {
    return this.#denominatorExp;
  }
  denominator() {
    return 2n ** this.denominatorExp;
  }
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
  compare(rhs) {
    let compatRhs = DyadicRational.from(rhs);
    let compatLhs = this;
    if (compatRhs.denominatorExp < this.denominatorExp) {
      compatRhs = compatRhs.clone();
      compatRhs.#increaseDenom(this.denominatorExp);
    } else if (compatRhs.denominatorExp > this.denominatorExp) {
      compatLhs = compatLhs.clone();
      compatLhs.#increaseDenom(compatRhs.denominatorExp);
    }
    return compareBigInt(compatLhs.numerator, compatRhs.numerator);
  }
  #increaseDenom(denomExp) {
    if (this.#denominatorExp > denomExp) {
      throw new Error(`denomator must be increased! new dominator is '${denomExp}', but value is ${this}`);
    }
    const diff = denomExp - this.denominatorExp;
    this.#numerator *= 2n ** diff;
    this.#denominatorExp = denomExp;
  }
  normalize() {
    while (this.#denominatorExp > 0n && this.#numerator % 2n == 0n) {
      this.#denominatorExp -= 1n;
      this.#numerator /= 2n;
    }
  }
  neg() {
    this.#numerator *= -1n;
  }
  isZero() {
    return this.numerator == 0n;
  }
  right() {
    if (this.denominatorExp === 0n) {
      if (this.numerator < 0n) {
        return new DyadicRational(this.numerator + 1n, 0n);
      } else {
        return null;
      }
    }
    return new DyadicRational((this.numerator - 1n) / 2n + 1n, this.denominatorExp - 1n);
  }
  left() {
    if (this.denominatorExp === 0n) {
      if (this.numerator > 0n) {
        return new DyadicRational(this.numerator - 1n, 0n);
      } else {
        return null;
      }
    }
    return new DyadicRational((this.numerator - 1n) / 2n, this.denominatorExp - 1n);
  }
  add(rhs) {
    if (rhs.denominatorExp < this.denominatorExp) {
      rhs = rhs.clone();
      rhs.#increaseDenom(this.denominatorExp);
    } else if (rhs.denominatorExp > this.denominatorExp) {
      this.#increaseDenom(rhs.denominatorExp);
    }
    this.#numerator += rhs.numerator;
    this.normalize();
    return this;
  }
  sub(rhs) {
    const rhsRat = DyadicRational.from(rhs);
    rhsRat.neg();
    this.add(rhsRat);
    return this;
  }
}

// cgtjs/NumberUpStar.ts
function absBigInt(n) {
  return n < 0n ? -n : n;
}

class NumberUpStar extends CanonicalForm {
  #number;
  #up;
  #star;
  get number() {
    return this.#number;
  }
  get up() {
    return this.#up;
  }
  get star() {
    return this.#star;
  }
  get leftMoves() {
    return [...this.generateLeftOptions()];
  }
  get rightMoves() {
    return [...this.generateRightOptions()];
  }
  isZero() {
    return this.number.isZero() && this.up == 0n && this.star == 0n;
  }
  constructor(number = 0n, up = 0n, star = 0n) {
    super();
    this.#number = DyadicRational.from(number);
    this.#up = expectBigInt(up, "up component");
    this.#star = expectBigInt(star, "nimber");
    if (this.#star < 0) {
      throw new Error(`invalid NumberUpStar (${this}): star must be greater than or equal to zero.`);
    }
  }
  static coerce(value) {
    if (value instanceof DyadicRational) {
      return NumberUpStar.coerce(value);
    } else if (value instanceof NumberUpStar) {
      return value;
    }
    switch (typeof value) {
      case "bigint":
      case "number":
      case "boolean":
        return new NumberUpStar(DyadicRational.from(value));
      default:
        throw new TypeError(`cannot coerce NumberUpStar from '${value}' (typeof value = ${typeof value})`);
    }
  }
  partialCompare(rhsRaw) {
    if (rhsRaw instanceof MoveSet) {
      return super.partialCompare(rhsRaw);
    }
    const rhs = NumberUpStar.coerce(rhsRaw);
    const numCmp = this.number.compare(rhs.number);
    const upCmp = compareBigInt(this.up, rhs.up);
    const starCmp = compareBigInt(this.star, rhs.star);
    if (numCmp == 0 && upCmp == 0 && starCmp == 0) {
      return 0;
    }
    if (numCmp != 0) {
      return numCmp;
    }
    if (absBigInt(this.up) == 1n && rhs.up == 0n && rhs.star != 0n) {
      return null;
    }
    if (absBigInt(rhs.up) == 1n && this.up == 0n && this.star != 0n) {
      return null;
    }
    if (upCmp == 0) {
      return null;
    } else {
      return upCmp;
    }
  }
  asNumber() {
    if (this.up == 0n && this.star == 0n) {
      return this.number;
    } else {
      return null;
    }
  }
  asNimber() {
    if (this.up == 0n && this.number.isZero()) {
      return this.star;
    } else {
      return null;
    }
  }
  *generateRightOptions() {
    const numRight = this.number.right();
    const upRight = this.up > 0 ? new NumberUpStar(0n, this.up - 1n, 1n) : this.up < 0 ? NumberUpStar.coerce(0n) : null;
    if (numRight != null) {
      yield new NumberUpStar(numRight, this.up, this.star);
    }
    if (upRight) {
      yield upRight;
    }
    if (this.star != 0n) {
      for (let i = 0n;i < this.star; ++i) {
        yield new NumberUpStar(this.number, this.up);
      }
    }
  }
  *generateLeftOptions() {
    const numLeft = this.number.left();
    const upLeft = this.up < 0 ? new NumberUpStar(0n, this.up + 1n, 1n) : this.up > 0 ? NumberUpStar.coerce(0n) : null;
    if (numLeft != null) {
      yield new NumberUpStar(numLeft, this.up, this.star);
    }
    if (upLeft) {
      yield upLeft;
    }
    if (this.star != 0n) {
      for (let i = 0n;i < this.star; ++i) {
        yield new NumberUpStar(this.number, this.up);
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
      if (str) {
        str += " + ";
      }
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
      if (str) {
        str += " + ";
      }
      str += "*";
      if (this.star !== 1n) {
        str += this.star.toString();
      }
    }
    return str;
  }
  clone() {
    return new NumberUpStar(this.number, this.up, this.star);
  }
}

// cgtjs/MoveSet.ts
function powerOfTwoLess(n) {
  let bit = 1n;
  while (bit < n) {
    bit *= 2n;
  }
  bit /= 2n;
  return bit;
}
function canonicalForm(left, right) {
  const canonLeft = [];
  const canonRight = [];
  for (const l of left) {
    if (l instanceof MoveSet) {
      canonLeft.push(l.normalize());
    } else {
      canonLeft.push(NumberUpStar.coerce(l));
    }
  }
  for (const r of right) {
    if (r instanceof MoveSet) {
      canonRight.push(r.normalize());
    } else {
      canonRight.push(NumberUpStar.coerce(r));
    }
  }
  return new MoveSet(canonLeft, canonRight).normalize();
}

class MoveSet extends CanonicalForm {
  left;
  right;
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
  }
  clone() {
    return new MoveSet([...this.leftMoves], [...this.rightMoves]);
  }
  isZero() {
    return this.left.length == 0 && this.right.length == 0;
  }
  bypassReversibleL() {
    for (let i = 0;i < this.left.length; ++i) {
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
          str += "| }";
        } else {
          str += " | ";
        }
      } else {
        str += ", ";
      }
    }
    if (this.left.length == 0) {
      str += "| ";
    }
    for (const r in this.right) {
      str += this.right[r].toString();
      if (+r == this.right.length - 1) {
        str += " }";
      } else {
        str += ", ";
      }
    }
    return str;
  }
  bypassReversibleR() {
    for (let i = 0;i < this.right.length; ++i) {
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
  removeDominatedMoves(left) {
    const moves = [];
    const existingMoves = left ? this.left : this.right;
    if (existingMoves.length == 1) {
      return;
    }
    for (const m of existingMoves) {
      let insert = true;
      for (const i in moves) {
        const cmp = m.partialCompare(moves[i]);
        if (cmp !== null) {
          insert = false;
          if (cmp == 0 || left && cmp == -1 || !left && cmp == 1) {
            break;
          } else {
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
  asNimber() {
    if (this.isImpartial()) {
      let nimbers = null;
      for (const l of this.leftMoves) {
        const nimber = l.asNimber();
        if (nimber == null) {
          nimbers = null;
          break;
        } else {
          if (nimbers == null) {
            nimbers = new Set([nimber]);
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
        return mex;
      }
    }
    return null;
  }
  asNus() {
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
          return new NumberUpStar(number, 0n, 1n);
        }
      }
      return new NumberUpStar(0n, 0n, this.asNimber() ?? 0n);
    }
    if (this.rightMoves.length == 0 && this.leftMoves.length > 0) {
      let left = this.leftMoves;
      let zeroCmp = left[0].partialCompare(new NumberUpStar(0n));
      for (const l in left.slice(1)) {
        const lZeroCmp = left[0].partialCompare(new NumberUpStar(0n));
        if (lZeroCmp != zeroCmp) {
          zeroCmp = null;
          break;
        }
      }
      if (zeroCmp == -1) {
        return new NumberUpStar(0n);
      }
    }
    if (this.leftMoves.length == 0 && this.rightMoves.length > 0) {
      let left = this.rightMoves;
      let zeroCmp = left[0].partialCompare(new NumberUpStar(0n));
      for (const l in left.slice(1)) {
        const lZeroCmp = left[0].partialCompare(new NumberUpStar(0n));
        if (lZeroCmp != zeroCmp) {
          zeroCmp = null;
          break;
        }
      }
      if (zeroCmp == -1) {
        return new NumberUpStar(0n);
      }
    }
    return null;
  }
  isImpartial() {
    for (const gL of this.leftMoves) {
      let found = false;
      for (const gR of this.rightMoves) {
        if (gR.partialCompare(gL) == 0) {
          found = true;
          break;
        }
      }
      if (found == false)
        return false;
    }
    return true;
  }
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
      star = -1n;
    }
    if (a1 instanceof NumberUpStar && a2 instanceof NumberUpStar && b1 instanceof NumberUpStar) {
      if (a1.number == a2.number && b1.number == a1.number && b1.up == 0n && a1.up == 0n && a2.up == 0n) {
        if (a1.star == 0n && a2.star == 1n || a2.star == 0n && a1.star == 1n) {
          return new NumberUpStar(a1.number, star, 1n);
        }
      }
    }
    return null;
  }
  asUp() {
    if (this.left.length == 1 && this.right.length == 1) {
      let [l] = this.left;
      let [r] = this.right;
      if (l instanceof NumberUpStar && r instanceof NumberUpStar) {
        if (l.isZero() && (r.up > 0n || r.star > 0n)) {
          return new NumberUpStar(r.number, r.up + 1n, r.star ^ 1n);
        }
        if (r.isZero() && (l.up < 0n || r.star > 0n)) {
          return new NumberUpStar(r.number, r.up - 1n, r.star ^ 1n);
        }
      }
    }
  }
  asNumber() {
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
    if (leftMax == null && rightMin != null) {
      if (rightMin.numerator > 0) {
        return new DyadicRational(0);
      } else {
        const result = rightMin.clone();
        result.sub(new DyadicRational(1n));
        return result;
      }
    } else if (rightMin == null && leftMax != null) {
      if (leftMax.numerator < 0) {
        return new DyadicRational(0);
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
    if (leftMax.numerator < 0 && rightMin.numerator > 0) {
      return new DyadicRational(0);
    }
    let dist = rightMin.clone();
    let endpointOffset;
    dist.sub(leftMax);
    if (dist.numerator == 1n) {
      endpointOffset = new DyadicRational(1n, dist.denominatorExp + 1n);
    } else {
      endpointOffset = new DyadicRational(powerOfTwoLess(dist.numerator), dist.denominatorExp);
    }
    if (rightMin.numerator < 0) {
      const result = rightMin.clone();
      result.sub(endpointOffset);
      return result;
    } else {
      const result = leftMax.clone();
      result.add(endpointOffset);
      return result;
    }
  }
}
