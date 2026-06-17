# cgtjs

TypeScript primitives for combinatorial game theory, and a few game implementations

## Installing

Prebuilt package from the `dist` branch (no compile step at install time):

```json
"cgtjs": "github:ishehadeh/cgtjs#dist"
```

For local development against source, use a path dependency:

```json
"cgtjs": "file:../cgtjs"
```

The `main` branch is source-only. CI updates the `dist` branch on each successful push to `main`. After installing from `#dist`, check `node_modules/cgtjs/BUILD_INFO.json` to see which source commit was built.

To pin a specific build, install from a commit on the `dist` branch:

```json
"cgtjs": "github:ishehadeh/cgtjs#<dist-branch-commit-sha>"
```

## Development

```bash
bun install
bun run build    # generate dist/index.js + dist/*.d.ts
bun run test     # run test suite
bun run check    # run linter and formatter
bun run fix      # run linter and formatter in write mode
```
