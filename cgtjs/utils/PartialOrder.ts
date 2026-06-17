import type { Ordering } from './compare.ts';

/** Marks child classes as partially (optionally) comparable
 */
export class PartialOrder {
  partialCompare(_rhs: PartialOrder): Ordering | null {
    throw Error('Not Implemented: Order.partialCompare');
  }
}
