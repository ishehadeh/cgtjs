## Learned User Preferences

- Prefer git `dist` branch distribution over npm registry for rapid iteration across dependent projects.
- Use `tsc` for JS emit, `esbuild` for single-file JS bundle, and `dts-bundle-generator` for bundled `.d.ts`; do not use `bun build` for bundling or type stripping.
- When implementing an attached plan, do not edit the plan file; complete the plan's todos instead.
- Board/bitboard code should use `number` coordinates and `Uint32Array` storage with runtime-computed row/column masks; avoid `bigint` entirely in the board pipeline.
- Board tests should assert via string serialization round-trip (`toString`/`fromString`), not packed bit literals.

## Learned Workspace Facts

- Monorepo with `cgtjs` (TypeScript CGT library: games, solver, canonical forms) and `cgtjs-ui` (Next.js app with `GridGameDisplay` grid components).
- Package exposes subpath imports (e.g. `cgtjs/game`); local `file:` consumers may need a Turbopack alias for subpath exports.
- Build produces single `dist/index.js` and bundled `dist/index.d.ts`; CI publishes to the `dist` git branch on push to `main`.
- Konane tests are validated against konjecture's Rust `cgt.rs` and Nowakowski et al., "1×n Konane: A Summary of Results" (Games of No Chance 2, 2010).
- `NumberUpStar` is `(number, up, star)`; dyadic rationals like `1/2` must not be constructed via `(1n, 1n)` — use the proper dyadic/nus helpers instead.
