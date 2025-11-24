#!/usr/bin/env bash
set -euo pipefail

# Prepares a minimal deploy-ready branch for cPanel containing only the built static files
# and required deployment files (.htaccess, .env.production copied to .env, .cpanel.yml).

BRANCH="deploy/cpanel"
BUILD_SCRIPT="./build-production.sh"

if [ ! -x "$BUILD_SCRIPT" ]; then
  echo "Making $BUILD_SCRIPT executable"
  chmod +x "$BUILD_SCRIPT"
fi

ORIG_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "Building production assets on branch: $ORIG_BRANCH"
"$BUILD_SCRIPT"

TMPDIR=$(mktemp -d)
echo "Using temp dir: $TMPDIR"

# Copy built output and deployment helpers into temp dir
cp -R dist/* "$TMPDIR/" || true
cp -f deployments/cpanel/.htaccess "$TMPDIR/.htaccess" 2>/dev/null || true
cp -f deployments/cpanel/.env.production "$TMPDIR/.env" 2>/dev/null || true
cp -f .cpanel.yml "$TMPDIR/.cpanel.yml" 2>/dev/null || true

echo "Creating orphan branch: $BRANCH"
git checkout --orphan "$BRANCH"
git reset --hard

# Copy assembled package into repo root and commit
cp -R "$TMPDIR/"* . || true
git add -A
if git commit -m "chore: deploy-ready cPanel package"; then
  echo "Committed deploy package on branch $BRANCH"
else
  echo "No changes to commit (maybe identical)."
fi

echo "Pushing $BRANCH to origin"
git push -u origin "$BRANCH" --force

echo "Switching back to original branch: $ORIG_BRANCH"
git checkout "$ORIG_BRANCH"

# Cleanup
rm -rf "$TMPDIR"

echo "Done. Deploy branch '$BRANCH' is ready on origin."

exit 0
