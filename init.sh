#!/bin/bash
set -e

# Parse arguments
MULTI_TENANT=false
POSITIONAL=()
for arg in "$@"; do
  case $arg in
    --with-multi-tenant) MULTI_TENANT=true ;;
    -h|--help)
      echo "Usage: ./init.sh <project-name> [options]"
      echo ""
      echo "Options:"
      echo "  --with-multi-tenant  Include organization-based multi-tenancy"
      echo ""
      echo "Example:"
      echo "  ./init.sh myapp"
      echo "  ./init.sh myapp --with-multi-tenant"
      echo ""
      echo "This will replace:"
      echo "  dyz-bunstack     → <project-name>"
      echo "  dyz-bunstack-app → <project-name>-app"
      exit 0
      ;;
    *) POSITIONAL+=("$arg") ;;
  esac
done

NAME="${POSITIONAL[0]}"

if [ -z "$NAME" ]; then
  echo "Usage: ./init.sh <project-name> [--with-multi-tenant]"
  echo "Run ./init.sh --help for more info."
  exit 1
fi

SCOPE="${NAME}-app"

echo "Initializing project: $NAME (scope: @${SCOPE})"

# Find-and-replace in all project files (scope first, then base name)
find . -type f \
  \( -name '*.ts' -o -name '*.tsx' -o -name '*.json' -o -name '*.css' \
     -o -name '*.html' -o -name '*.md' -o -name '*.yml' -o -name '*.yaml' \
     -o -name 'Makefile' \) \
  -not -path '*/node_modules/*' \
  -not -path '*/.git/*' \
  -not -name 'bun.lock' \
  -not -name 'init.sh' | while read -r f; do
  if grep -q 'dyz-bunstack' "$f" 2>/dev/null; then
    sed -i '' "s/dyz-bunstack-app/${SCOPE}/g" "$f"
    sed -i '' "s/dyz-bunstack/${NAME}/g" "$f"
    echo "  updated $f"
  fi
done

# --- Multi-tenancy markers ---
# Source files use // @mt-start / // @mt-end and // @no-mt-start / // @no-mt-end
# CLAUDE.md uses <!-- @mt-start --> / <!-- @mt-end -->
# Default: strip multi-tenant code. --with-multi-tenant: keep it, strip simple-only code.

MARKER_FILES=(
  apps/server/src/auth.ts
  apps/server/src/db/schema.ts
  apps/server/src/seed.ts
  apps/dashboard/src/libs/auth.ts
  apps/dashboard/src/components/app-sidebar.tsx
  apps/web/src/libs/auth.ts
  CLAUDE.md
)

if [ "$MULTI_TENANT" = true ]; then
  echo "  enabling multi-tenancy..."
  for f in "${MARKER_FILES[@]}"; do
    if [ -f "$f" ]; then
      # Remove @no-mt blocks (simple-only code)
      sed -i '' '/@no-mt-start/,/@no-mt-end/d' "$f"
      # Strip @mt marker lines (keep the code between them)
      sed -i '' '/@mt-start/d' "$f"
      sed -i '' '/@mt-end/d' "$f"
    fi
  done
else
  echo "  simple mode (no multi-tenancy)..."
  for f in "${MARKER_FILES[@]}"; do
    if [ -f "$f" ]; then
      # Remove @mt blocks (multi-tenant code)
      sed -i '' '/@mt-start/,/@mt-end/d' "$f"
      # Strip @no-mt marker lines (keep the code between them)
      sed -i '' '/@no-mt-start/d' "$f"
      sed -i '' '/@no-mt-end/d' "$f"
    fi
  done

  # Delete multi-tenant directories and route files
  rm -rf apps/dashboard/src/modules/organizations
  rm -rf apps/dashboard/src/modules/members
  rm -f apps/dashboard/src/routes/_authenticated/organizations.tsx
  rm -rf apps/dashboard/src/routes/_authenticated/orgs
fi

# Remove CTA metadata if present
rm -f apps/web/.cta.json

# Generate BETTER_AUTH_SECRET in .env.example
SECRET=$(openssl rand -base64 32)
sed -i '' "s/BETTER_AUTH_SECRET=your-secret-key-min-32-chars/BETTER_AUTH_SECRET=${SECRET}/" apps/server/.env.example
echo "  generated BETTER_AUTH_SECRET"

# Clean up this init script
rm -f init.sh

# Re-init git
rm -rf .git
git init
git add -A
git commit -m "Initial commit from dyz-bunstack template"
echo "  initialized git"

# Reinstall to regenerate lockfile
rm -f bun.lock
bun install
echo ""
echo "Done! Project '$NAME' is ready."
if [ "$MULTI_TENANT" = true ]; then
  echo "  Multi-tenancy: enabled"
fi
echo ""
echo "Next steps:"
echo "  git remote add origin <your-repo-url>"
echo "  make setup        — copy .env, start Docker (Postgres + MinIO), push schema, seed DB"
echo "  make dev          — start web + server"
echo "  make dev-all      — start all apps"
