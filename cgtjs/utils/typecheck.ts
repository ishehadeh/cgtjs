/** Verify that `n` is a bigint or number, cast n to BigInt and copy it
 * 
 * @param {any} n
 * @param {string} name  how the value (n) is referenced in errors
 * @throws {TypeError}
 * @returns bigint
 */
export function expectBigInt(n: unknown, name = "value"): bigint {
    if (typeof n != "number" && typeof n != "bigint") {
        throw new TypeError(`expected ${name} to be numeric, got ${n}`)
    }
    if (typeof n == "number" && !Number.isInteger(n)) {
        throw new TypeError(`expected ${name} to be an integer, got ${n}`)
    }

    return Object.freeze(BigInt(n));
}
