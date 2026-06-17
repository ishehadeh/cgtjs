## Learned User Preferences

- Prefer git `dist` branch distribution over npm registry for rapid iteration across dependent projects.
- When implementing an attached plan, do not edit the plan file; complete the plan's todos instead.
- Source relative imports must use `.ts` extensions (do not switch to `.js` extensions in source).
- Package must support subpath imports (`cgtjs/game`, etc.) with per-subpath type restrictions; aliasing every subpath to one bundle's types is unacceptable.
- Prefer simple builds—use plain `tsc` emit when it suffices; avoid over-complicated multi-bundle or type-shim tooling.
- Board/bitboard code should use `number` coordinates and `Uint32Array` storage with runtime-computed row/column masks; avoid `bigint` entirely in the board pipeline.
- Board tests should assert via string serialization round-trip (`toString`/`fromString`), not packed bit literals.

## Learned Workspace Facts

- Package exposes subpath imports (`cgtjs`, `cgtjs/game`, `cgtjs/solver`, `cgtjs/utils`); local `file:` consumers may need a Turbopack alias for subpath exports.
- Build uses `tsc -p tsconfig.build.json` (plain emit, no bundling); `dist/` mirrors `cgtjs/` with per-subpath `index.js` and `index.d.ts`.
- CI publishes to the `dist` git branch on push to `main` via `scripts/prepare-dist-branch.mjs` (no `postinstall` build on consumers).
- Konane tests are validated against konjecture's Rust `cgt.rs` and Nowakowski et al., "1×n Konane: A Summary of Results" (Games of No Chance 2, 2010).
- `NumberUpStar` is `(number, up, star)`; dyadic rationals like `1/2` must not be constructed via `(1n, 1n)` — use the proper dyadic/nus helpers instead.
