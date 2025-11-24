#!/usr/bin/env bash
set -euo pipefail

# Safer version to prepare a minimal cPanel deploy branch.
# - Runs the build
# - Copies only the `dist` output (excluding node_modules or other stray files)
# - Adds `.htaccess`, `.env` (from deployments/cpanel/.env.production) and `.cpanel.yml`
# - Creates/overwrites branch `deploy/cpanel` with that minimal content and pushes it.

BRANCH="deploy/cpanel"
BUILD_SCRIPT="./build-production.sh"

if [ ! -x "$BUILD_SCRIPT" ]; then
  chmod +x "$BUILD_SCRIPT"
fi

ORIG_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Building production assets on branch: $ORIG_BRANCH"
"$BUILD_SCRIPT"

TMPDIR=$(mktemp -d)
echo "Assembling package in temp dir: $TMPDIR"

# Use rsync to copy dist safely and exclude common large/noise folders
rsync -a --delete --exclude='node_modules' --exclude='.git' dist/ "$TMPDIR/" || true

# Copy deployment helpers
if [ -f deployments/cpanel/.htaccess ]; then
  cp deployments/cpanel/.htaccess "$TMPDIR/.htaccess"
fi
if [ -f deployments/cpanel/.env.production ]; then
  cp deployments/cpanel/.env.production "$TMPDIR/.env"
fi
if [ -f .cpanel.yml ]; then
  cp .cpanel.yml "$TMPDIR/.cpanel.yml"
fi

echo "Creating clean orphan branch: $BRANCH"
git checkout --orphan "$BRANCH"
git reset --hard

# Copy assembled package into repo root and commit
cp -R "$TMPDIR/"* . || true
git add -A
if git commit -m "chore: clean deploy-ready cPanel package"; then
  echo "Committed clean deploy package on branch $BRANCH"
else
  echo "No changes to commit (maybe identical)."
fi

echo "Pushing $BRANCH to origin (force)"
git push -u origin "$BRANCH" --force

echo "Switching back to original branch: $ORIG_BRANCH"
git checkout "$ORIG_BRANCH"

# Cleanup
rm -rf "$TMPDIR"

echo "Done. Clean deploy branch '$BRANCH' pushed to origin."

exit 0
