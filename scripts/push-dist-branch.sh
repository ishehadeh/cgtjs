#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PUBLISH_DIR="$ROOT/.publish"

node "$ROOT/scripts/prepare-dist-branch.mjs"

SOURCE_COMMIT="${SOURCE_COMMIT:-$(git -C "$ROOT" rev-parse HEAD)}"
SHORT_SHA="$(echo "$SOURCE_COMMIT" | cut -c1-7)"

cd "$PUBLISH_DIR"
git init -q
git config user.name "${GIT_USER_NAME:-github-actions[bot]}"
git config user.email "${GIT_USER_EMAIL:-41898282+github-actions[bot]@users.noreply.github.com}"
git add -A
git commit -q -m "build: ${SHORT_SHA} from main"

if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  REMOTE_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/ishehadeh/cgtjs.git"
else
  REMOTE_URL="git@github.com:ishehadeh/cgtjs.git"
fi

git push --force "$REMOTE_URL" HEAD:dist

echo "Pushed dist branch at ${SHORT_SHA}"
