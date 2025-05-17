import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import dts from "vite-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url))
const sourceRoot = resolve(__dirname, 'cgtjs');
export default defineConfig({
  build: {
    lib: {
      entry: resolve(sourceRoot, 'index.ts'),
      name: 'CGT.js',
      fileName: 'index',
    },
  },
  plugins: [
    dts({
        entryRoot: sourceRoot
    }),
  ]
})