import type { BitBoard } from '../Board.ts';
import type { Game } from '../solver/Game.ts';

/**
 * Impartial Blokus, where players can place any of the given polyominos anywhere on the board.
 */
export class BlokusCram implements Game<BlokusCram> {
  #board: BitBoard;
  #polyominos: BitBoard[];

  constructor(board: BitBoard, polyominos: BitBoard[]) {
    this.#board = board;
    this.#polyominos = polyominos;
  }

  get polyominos(): Readonly<BitBoard[]> {
    return this.#polyominos;
  }

  get board(): Readonly<BitBoard> {
    return this.#board;
  }

  public canPlacePolyomino(polyomino: BitBoard, x: number, y: number): boolean {
    for (const [polyX, polyY] of polyomino.iterSet()) {
      const adjustedX = x + polyX;
      const adjustedY = y + polyY;
      if (adjustedX < 0 || adjustedY < 0 || adjustedX >= this.#board.width || adjustedY >= this.#board.height) {
        return false;
      }
      if (this.#board.get(adjustedX, adjustedY)) {
        return false;
      }
      const SIDE_MATRIX = [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
      ];
      for (const [dx, dy] of SIDE_MATRIX) {
        const sideX = adjustedX + dx;
        const sideY = adjustedY + dy;
        if (sideX < 0 || sideY < 0 || sideX >= this.#board.width || sideY >= this.#board.height) {
          continue;
        }
        if (this.#board.get(sideX, sideY)) {
          return false;
        }
      }
    }

    return true;
  }

  public tryPlacePolyomino(polyomino: BitBoard, x: number, y: number): boolean {
    if (!this.canPlacePolyomino(polyomino, x, y)) {
      return false;
    }
    this.mustPlacePolyomino(polyomino, x, y);
    return true;
  }

  public mustPlacePolyomino(polyomino: BitBoard, x: number, y: number): void {
    for (const [polyX, polyY] of polyomino.iterSet()) {
      this.#board.set(x + polyX, y + polyY);
    }
  }

  public *moves(): Generator<BlokusCram, void, unknown> {
    for (const polyomino of this.#polyominos) {
      for (const [boardX, boardY] of this.#board.iterClear()) {
        if (this.canPlacePolyomino(polyomino, boardX, boardY)) {
          const game = new BlokusCram(this.#board.clone(), this.#polyominos);
          game.mustPlacePolyomino(polyomino, boardX, boardY);
          yield game;
        }
      }
    }
  }

  public *movesLeft(): Generator<BlokusCram, void, void> {
    yield* this.moves();
  }

  public *movesRight(): Generator<BlokusCram, void, void> {
    yield* this.moves();
  }

  public hash(): string {
    return `${this.#board.toBase64()},${this.#polyominos.map((polyomino) => polyomino.toBase64()).join(',')}`;
  }

  public toString(): string {
    return this.#board.toString();
  }
}
