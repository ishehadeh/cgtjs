/** Marks child classes as partially (optionally) comparable
 */
export class PartialOrder {
    partialCompare(_rhs) {
        throw Error('Not Implemented: Order.partialCompare');
    }
}
