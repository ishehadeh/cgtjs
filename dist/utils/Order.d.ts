import type { Ordering } from './compare.ts';
import { PartialOrder } from './PartialOrder.ts';
export declare class Order extends PartialOrder {
    /** Returns -1 if `this < rhs`, 1 if `this > rhs` or 0 if `this == rhs`.
     *  Implementing this interface implies that any two object's of the implementor's
     *  type fall into one of the above cases (<, >, or ==).
     */
    compare(_rhs: unknown): Ordering;
    partialCompare(rhs: unknown): Ordering | null;
}
