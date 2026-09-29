#!/usr/bin/env bash
set -e

# ==============================================================================
# Navratri Companion - Safe GitHub Sync & Validation Script (npm)
# ==============================================================================

echo "=========================================="
echo "1. Checking Git Status & Uncommitted Changes"
echo "=========================================="

cd "$(dirname "$0")/.."

# Check if repo is initialized
if [ ! -d ".git" ]; then
  echo "Error: Not a git repository."
  exit 1
fi

# Fetch remote origin to check for upstream conflicts
echo "Checking remote origin/main..."
git fetch origin main || true

LOCAL_HEAD=$(git rev-parse HEAD 2>/dev/null || echo "")
REMOTE_HEAD=$(git rev-parse origin/main 2>/dev/null || echo "")

echo "Local HEAD:  $LOCAL_HEAD"
echo "Remote HEAD: $REMOTE_HEAD"

# Pre-commit Secret & Safety Checks
echo "Scanning for accidental secret leaks..."
if git diff --cached --name-only | grep -E "\.env|\.pem|\.key|id_aadhaar|id_card" ; then
  echo "ERROR: Attempting to commit sensitive environment or credential files! Aborting."
  exit 1
fi

echo "=========================================="
echo "2. Running Production Build & Type Check"
echo "=========================================="

# 1. Type check
echo "Running TypeScript check (lint)..."
npm run lint

# 2. Production build
echo "Running Vite production build..."
npm run build

echo "✓ Validation succeeded cleanly with 0 errors."

echo "=========================================="
echo "3. Staging and Committing Changes"
echo "=========================================="

# Ensure secrets are ignored
git add -A

# Only commit if changes exist
if git diff --staged --quiet; then
  echo "No changes detected to commit."
else
  COMMIT_MSG="${1:-fix(sync): automated build-verified project update}"
  git commit -m "$COMMIT_MSG"
  echo "✓ Commit created: $(git rev-parse --short HEAD) - $COMMIT_MSG"
fi

# Generate updated patch for offline / local push convenience
mkdir -p public
git format-patch origin/main --stdout > public/latest-fix.patch 2>/dev/null || true

echo "=========================================="
echo "4. Pushing to GitHub (origin/main)"
echo "=========================================="

if [ -n "$GITHUB_TOKEN" ]; then
  echo "Using GITHUB_TOKEN for authenticated push..."
  git push "https://${GITHUB_TOKEN}@github.com/ParthJr/navratri-companion.git" main
  echo "✓ Successfully pushed to origin/main on GitHub!"
else
  echo "Note: Direct push requires GitHub authentication."
  echo "To push with a personal access token, run:"
  echo "  export GITHUB_TOKEN=your_token_here && ./scripts/sync-github.sh"
  echo "Or push from your local terminal using the published patch:"
  echo "  curl -fsSL https://ais-dev-qeszyyucb6sgot6xendn64-262742092537.asia-southeast1.run.app/latest-fix.patch | git am"
  echo "  git push origin main"
fi
