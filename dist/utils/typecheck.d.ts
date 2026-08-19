/** Verify that `n` is a bigint or number, cast n to BigInt and copy it
 *
 * @param {any} n
 * @param {string} name  how the value (n) is referenced in errors
 * @throws {TypeError}
 * @returns bigint
 */
export declare function expectBigInt(n: unknown, name?: string): bigint;
