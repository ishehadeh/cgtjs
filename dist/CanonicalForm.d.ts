import type { DyadicRational } from './DyadicRational.ts';
import type { Ordering } from './utils/compare.ts';
import { PartialOrder } from './utils/PartialOrder.ts';
export declare class CanonicalForm extends PartialOrder {
    get leftMoves(): CanonicalForm[];
    get rightMoves(): CanonicalForm[];
    asNumber(): DyadicRational | null;
    asNimber(): bigint | null;
    partialCompare(rhs: CanonicalForm): Ordering | null;
    clone(): CanonicalForm;
}
