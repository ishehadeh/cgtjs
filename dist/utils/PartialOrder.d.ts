import type { Ordering } from './compare.ts';
/** Marks child classes as partially (optionally) comparable
 */
export declare class PartialOrder {
    partialCompare(_rhs: PartialOrder): Ordering | null;
}
