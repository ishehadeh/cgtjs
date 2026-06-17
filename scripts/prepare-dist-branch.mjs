import { execSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publishDir = join(root, '.publish');
const distDir = join(root, 'dist');
const requiredArtifacts = [
  'index.js',
  'index.d.ts',
  'game/index.js',
  'game/index.d.ts',
  'solver/index.js',
  'solver/index.d.ts',
  'utils/index.js',
  'utils/index.d.ts',
];

for (const artifact of requiredArtifacts) {
  const path = join(distDir, artifact);
  if (!existsSync(path)) {
    console.error(`Missing build artifact: dist/${artifact}`);
    console.error('Run "bun run build" before preparing the dist branch.');
    process.exit(1);
  }
}

const sourcePackage = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

function toDistExport(entry) {
  return {
    types: entry.types.replace(/^\.\/cgtjs\//, './dist/').replace(/\.ts$/, '.d.ts'),
    import: entry.import.replace(/^\.\/cgtjs\//, './dist/').replace(/\.ts$/, '.js'),
    default: entry.default.replace(/^\.\/cgtjs\//, './dist/').replace(/\.ts$/, '.js'),
  };
}

const publishExports = Object.fromEntries(
  Object.entries(sourcePackage.exports).map(([key, entry]) => [key, toDistExport(entry)]),
);

const publishPackage = {
  name: sourcePackage.name,
  version: sourcePackage.version,
  type: sourcePackage.type,
  module: 'dist/index.js',
  types: 'dist/index.d.ts',
  files: ['dist'],
  exports: publishExports,
  private: false,
  repository: {
    type: 'git',
    url: 'git+https://github.com/ishehadeh/cgtjs.git',
  },
};

if (sourcePackage.peerDependencies) {
  publishPackage.peerDependencies = sourcePackage.peerDependencies;
}

let sourceCommit = process.env.SOURCE_COMMIT;
if (!sourceCommit) {
  try {
    sourceCommit = execSync('git rev-parse HEAD', { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    sourceCommit = 'local';
  }
}

const buildInfo = {
  sourceCommit,
  sourceRef: process.env.SOURCE_REF ?? 'refs/heads/main',
  builtAt: process.env.BUILT_AT ?? new Date().toISOString(),
};

rmSync(publishDir, { recursive: true, force: true });
mkdirSync(publishDir, { recursive: true });
cpSync(distDir, join(publishDir, 'dist'), { recursive: true });
writeFileSync(join(publishDir, 'package.json'), `${JSON.stringify(publishPackage, null, 2)}\n`);
writeFileSync(join(publishDir, 'BUILD_INFO.json'), `${JSON.stringify(buildInfo, null, 2)}\n`);

console.log(`Prepared dist branch contents in ${publishDir}`);
