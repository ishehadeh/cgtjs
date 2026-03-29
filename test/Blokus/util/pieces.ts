// import { Blokus } from ";

import { ssrImportKey } from 'vite/module-runner';
import { Blokus } from '../../../cgtjs/index.ts';

export const DOMINO = Blokus.fromString(`
    csc
    sis
    sis
    csc`);
export const L4 = Blokus.fromString(`
    cssc
    siis
    sisc
    sis.
    csc.`);
