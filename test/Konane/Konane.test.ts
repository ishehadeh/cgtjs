import { describe, expect, test } from 'vitest';
import type { CanonicalForm } from '../../cgtjs/CanonicalForm.ts';
import { DyadicRational } from '../../cgtjs/DyadicRational.ts';
import { Konane, KonaneMove } from '../../cgtjs/game/Konane.ts';
import { MoveSet } from '../../cgtjs/MoveSet.ts';
import { NumberUpStar } from '../../cgtjs/NumberUpStar.ts';
import { CanonicalFormStore } from '../../cgtjs/solver/CanonicalFormStore.ts';
import { MoveStore } from '../../cgtjs/solver/MoveStore.ts';

function requireNumberUpStar(cf: CanonicalForm): NumberUpStar {
  expect(cf).toBeInstanceOf(NumberUpStar);
  return cf as NumberUpStar;
}

describe('Konane board encoding', () => {
  test('fromString and round-trip toString', () => {
    const s = 'xo_ox\noxo__\nx_xox\noxoxo';
    const g = Konane.fromString(s);
    expect(g.toString()).toBe(s);
  });
});

describe('KonaneMove', () => {
  test('rejects diagonal and zero-length moves', () => {
    expect(() => new KonaneMove(0, 0, 1, 1)).toThrow();
    expect(() => new KonaneMove(0, 0, 0, 0)).toThrow();
  });

  test('clearedCells traces path from start through captured piece', () => {
    const move = new KonaneMove(4, 2, 2, 2);
    expect([...move.clearedCells()]).toEqual([
      { x: 4n, y: 2n },
      { x: 3n, y: 2n },
    ]);
  });
});

describe('move generation', () => {
  test('walkthrough Ex.2: single horizontal jump for black', () => {
    const g = Konane.fromString('_____\n_____\n___ox\n_____');
    const moves = [...g.moves('black').allMoves()];
    expect(moves).toHaveLength(1);
    expect(moves[0].fromX).toBe(4n);
    expect(moves[0].fromY).toBe(2n);
    expect(moves[0].toX).toBe(2n);
    expect(moves[0].toY).toBe(2n);
  });

  test('walkthrough Ex.3: simple jump and two-hop jump', () => {
    const g = Konane.fromString('_____\n_____\n_o_ox\n_____');
    const moves = [...g.moves('black').allMoves()];
    expect(moves).toHaveLength(2);
    const destinations = new Set(moves.map((m) => `${m.toX},${m.toY}`));
    expect(destinations.has('2,2')).toBe(true);
    expect(destinations.has('0,2')).toBe(true);
  });

  test('midgame board has left and right options', () => {
    const g = Konane.fromString('xo_ox\noxo__\nx_xox\noxoxo');
    expect([...g.movesLeft()].length).toBeGreaterThan(0);
    expect([...g.movesRight()].length).toBeGreaterThan(0);
  });
});

describe('CanonicalFormStore.solve', () => {
  test('nontrivial 5x4 position is non-zero; may normalize to 1 or remain a MoveSet', () => {
    const g = Konane.fromString('xo_ox\noxo__\nx_xox\noxoxo');
    const store = new CanonicalFormStore(new MoveStore<Konane>());
    const value = store.solve(g);

    if (value instanceof NumberUpStar) {
      expect(value.isZero()).toBe(false);
      expect(value.partialCompare(new NumberUpStar(1n))).toBe(0);
      expect(value.number.compare(DyadicRational.from(1n))).toBe(0);
      expect(value.up).toBe(0n);
      expect(value.star).toBe(0n);
      return;
    }

    expect(value).toBeInstanceOf(MoveSet);
    expect((value as MoveSet).isZero()).toBe(false);
  });

  test('walkthrough Ex.1 introduction position is 0', () => {
    const g = Konane.fromString('oxox\nx_xo\no_ox\nxoxo');
    const store = new CanonicalFormStore(new MoveStore<Konane>());
    const value = requireNumberUpStar(store.solve(g));
    expect(value.isZero()).toBe(true);
    expect(value.partialCompare(new NumberUpStar(0n))).toBe(0);
  });

  test('terminal 1x1 black stone is 0', () => {
    const g = Konane.fromString('x');
    expect([...g.movesLeft()]).toHaveLength(0);
    expect([...g.movesRight()]).toHaveLength(0);
    const store = new CanonicalFormStore(new MoveStore<Konane>());
    expect(requireNumberUpStar(store.solve(g)).isZero()).toBe(true);
  });

  test('empty board is 0', () => {
    const g = new Konane(3, 3);
    const store = new CanonicalFormStore(new MoveStore<Konane>());
    expect(requireNumberUpStar(store.solve(g)).isZero()).toBe(true);
  });
});

describe('clone and identity', () => {
  test('clone is independent; applyMove matches expected board', () => {
    const before = '_____\n_____\n___ox\n_____';
    const after = '_____\n_____\n__x__\n_____';
    const g = Konane.fromString(before);
    const child = g.clone();
    const move = [...child.moves('black').allMoves()][0];
    child.applyMove(move, 'black');
    expect(child.isEqualTo(Konane.fromString(after))).toBe(true);
    expect(g.toString()).toBe(before);
  });

  test('clone hash matches original', () => {
    const g = Konane.fromString('xo_ox\noxo__\nx_xox\noxoxo');
    expect(g.clone().hash()).toBe(g.hash());
  });
});
