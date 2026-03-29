/// <reference types="vitest/config" />

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sourceRoot = resolve(__dirname, 'cgtjs');
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['cgtjs/**/*.ts'],
    },
  },
  build: {
    lib: {
      entry: resolve(sourceRoot, 'index.ts'),
      name: 'CGT.js',
      fileName: 'index',
    },
  },
  plugins: [
    dts({
      entryRoot: sourceRoot,
    }),
  ],
});
