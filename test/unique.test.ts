import { Blokus } from '../cgtjs/game/Blokus';
import { uniqueBy } from '../cgtjs/utils/unique';
import { expect, test } from "bun:test";

test('uniqueBy removes duplicates from an array of strings based on identity', () => {
    const input = ['a', 'b', 'a', 'c', 'b', 'd'];
    const result = uniqueBy(input, x => x);
    expect(result).toEqual(['a', 'b', 'c', 'd']);
});

test('uniqueBy removes duplicates from an array of integers based on identity', () => {
    const input = [1, 2, 1, 3, 2, 4];
    const result = uniqueBy(input, x => x);
    expect(result).toEqual([1, 2, 3, 4]);
});

test('uniqueBy handles empty arrays', () => {
    const input: number[] = [];
    const result = uniqueBy(input, x => x);
    expect(result).toEqual([]);
});

test('uniqueBy deduplicates objects based on a specific property', () => {
    const input = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 1, name: 'Charlie' },
        { id: 3, name: 'Dave' }
    ];
    const result = uniqueBy(input, x => x.id);
    expect(result).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Dave' }
    ]);
});

test('should deduplicate Blokus pieces based on shape', () => {
    // Mock Blokus pieces wtesth a shape property
    const pieces = [
        Blokus.fromString(`siis\n....`),
        Blokus.fromString(`siis\n.c..`),
        Blokus.fromString(`siis\n....`),
        Blokus.fromString(`siis\n..c.`),
    ];

    const result = uniqueBy(pieces, piece => piece.toString());
    expect(result).toEqual([
        Blokus.fromString(`siis\n....`),
        Blokus.fromString(`siis\n.c..`),
        Blokus.fromString(`siis\n..c.`),
    ]);
});

test('should deduplicate based on computed values', () => {
    const input = [10, 20, 30, 11, 21, 31];
    // Deduplicate based on remainder when divided by 10
    const result = uniqueBy(input, x => x % 10);
    expect(result).toEqual([10, 11]);
});
