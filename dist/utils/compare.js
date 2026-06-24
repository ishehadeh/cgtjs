export function compareBigInt(lhs, rhs) {
    if (lhs < rhs) {
        return -1;
    }
    else if (lhs > rhs) {
        return 1;
    }
    else {
        return 0;
    }
}
