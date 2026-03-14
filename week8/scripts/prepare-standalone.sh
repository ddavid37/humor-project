#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SOURCE="$REPO_ROOT/week8"
TARGET="${1:-$REPO_ROOT/../prompt-chain-tool}"

echo "Copying week8 to $TARGET (excluding .next, node_modules, .env)..."
mkdir -p "$TARGET"
rsync -a \
  --exclude='.next' \
  --exclude='node_modules' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='.git' \
  "$SOURCE/" "$TARGET/"

echo "Running npm install in $TARGET..."
(cd "$TARGET" && npm install)

echo "Running git init in $TARGET..."
(cd "$TARGET" && git init)

echo ""
echo "Done. Standalone app is at: $TARGET"
echo "Next steps:"
echo "  1. cd $TARGET"
echo "  2. cp .env.example .env  &&  edit .env (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)"
echo "  3. git add . && git commit -m 'Initial commit: Prompt Chain Tool'"
echo "  4. Create a new repo on GitHub, then: git remote add origin <url> && git push -u origin main"
echo "  5. In Vercel: New Project → Import repo, set Root Directory to '.', add the two env vars, Deploy."
