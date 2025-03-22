import type { Ordering } from "./compare";
import { PartialOrder } from "./PartialOrder";

export class Order extends PartialOrder {
    /** Returns -1 if `this < rhs`, 1 if `this > rhs` or 0 if `this == rhs`.
     *  Implementing this interface implies that any two object's of the implementor's
     *  type fall into one of the above cases (<, >, or ==).
     */
    compare(rhs: Order): Ordering {
        throw Error("Not Implement: Order.compare");
    }

    partialCompare(rhs: unknown): Ordering | null {
        return this.compare(rhs)
    }
}