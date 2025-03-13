export type Ordering = -1 | 0 | 1;

export function compareBigInt(lhs: bigint, rhs: bigint): Ordering {
    if (lhs < rhs) {
        return -1;
    } else if (lhs > rhs) {
        return 1;
    } else {
        return 0;
    }
}