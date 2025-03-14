/**
 * Returns a new array with duplicate elements removed based on a key function.
 * @param array The array to deduplicate.
 * @param keyFn A function that returns a unique key for each element.
 * @returns A new array with only unique elements.
 */
export function uniqueBy<T, K>(array: T[], keyFn: (item: T) => K): T[] {
    const seen = new Map<K, boolean>();
    return array.filter(item => {
        const key = keyFn(item);
        if (seen.has(key)) return false;
        seen.set(key, true);
        return true;
    });
}