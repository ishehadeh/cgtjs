import { expect, test } from "bun:test";
import { Blokus, TileState } from "../../cgtjs/game/Blokus";

const DOMINO = Blokus.fromString(`
        csc
        sis
        sis
        csc`);

test('place a domino in empty 8x8', function () {
    const game = Blokus.empty(8n, 8n);
    expect(game.tryPlacePolyomino(0n, 0n, DOMINO, 0n, 0n)).toBe(true);
    expect(game.isEqualTo(Blokus.fromString(
        `
        csc.....
        sis.....
        sis....
        csc....
        ........
        ........
        ........
        ........`))).toBe(true);
});


test('overlap interiors are not allowed', function () {
    const game = Blokus.empty(8n, 8n);
    expect(game.tryPlacePolyomino(0n, 0n, DOMINO, 0n, 0n)).toBe(true);
    expect(game.tryPlacePolyomino(0n, 1n, DOMINO, 0n, 0n)).toBe(false);


    expect(game.isEqualTo(Blokus.fromString(
        `
        csc.....
        sis.....
        sis....
        csc....
        ........
        ........
        ........
        ........`))).toBe(true);
});


test('domino placed on corner is allowed', function () {
    const game = Blokus.empty(8n, 8n);
    expect(game.tryPlacePolyomino(0n, 0n, DOMINO, 0n, 0n)).toBe(true);
    expect(game.tryPlacePolyomino(2n, 3n, DOMINO, 1n, 1n)).toBe(true);

    expect(game.isEqualTo(Blokus.fromString(
        `
        csc.....
        sis.....
        sisc....
        csis....
        .sis....
        .csc....
        ........
        ........`))).toBe(true);
});

test('domino placed on corner, rotate', function () {
    const game = Blokus.empty(8n, 8n);
    expect(game.tryPlacePolyomino(0n, 0n, DOMINO, 1n, 1n)).toBe(true);
    expect(game.tryPlacePolyomino(1n, 2n, DOMINO.rotateClockwise(), 1n, 1n)).toBe(true);

    expect(game.isEqualTo(Blokus.fromString(
        `
        is......
        issc....
        siis....
        cssc....
        ........
        ........
        ........
        ........`)), '\n' + game.toStringBoard()).toBe(true);
});


test('domino placed with overflowing side', function () {
    const game = Blokus.empty(8n, 8n);
    expect(game.tryPlacePolyomino(0n, 0n, DOMINO, 1n, 1n)).toBe(true);
    expect(game.tryPlacePolyomino(7n, 6n, DOMINO, 1n, 1n)).toBe(true);
    expect(game.tryPlacePolyomino(0n, 6n, DOMINO, 1n, 1n)).toBe(true);
    expect(game.tryPlacePolyomino(7n, 0n, DOMINO, 1n, 1n)).toBe(true);


    expect(game.isEqualTo(Blokus.fromString(
        `   is....si
            is....si
            sc....cs
            ........
            ........
            sc....cs
            is....si
            is....si`))).toBe(true);
});

