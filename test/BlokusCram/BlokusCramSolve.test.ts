import { expect, test } from 'vitest';
import { NumberUpStar } from '../../cgtjs';
import { BitBoard } from '../../cgtjs/Board';
import { BlokusCram } from '../../cgtjs/game/BlokusCram';
import { CanonicalFormStore } from '../../cgtjs/solver/CanonicalFormStore';

const DOMINO_H = BitBoard.fromString(`11`);
const DOMINO_V = BitBoard.fromString(`1\n1`);

test('solves 2x6 board with domino', () => {
  const board = BitBoard.fromString(`
    000000
    000000
  `);

  const game = new BlokusCram(board, [DOMINO_V, DOMINO_H]);
  const solver = new CanonicalFormStore();
  const result = solver.solve(game);

  const expectedResult = new NumberUpStar(0n, 0n, 3n);
  expect(
    result.partialCompare(expectedResult),
    `expected ${result.toString()} to be ${expectedResult.toString()}`,
  ).toBe(0);
});
