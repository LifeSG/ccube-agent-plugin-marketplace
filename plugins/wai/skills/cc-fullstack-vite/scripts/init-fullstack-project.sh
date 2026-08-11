#!/bin/bash

# Initialize a Full-Stack Vite + React + Koa + PostgreSQL Project
# Usage: bash init-fullstack-project.sh <project-name> <target-directory> [--db-name <name>] [--port <port>]

set -e

# ── Resolve template directory (sibling of scripts/) ───────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_DIR="$SCRIPT_DIR/../templates"

if [ ! -d "$TEMPLATE_DIR" ]; then
  echo "Error: Template directory not found at $TEMPLATE_DIR"
  exit 1
fi

# ── Parse arguments ─────────────────────────────────────────────
PROJECT_NAME=""
TARGET_DIR=""
DB_NAME=""
BACKEND_PORT="3333"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --db-name)
      DB_NAME="$2"
      shift 2
      ;;
    --port)
      BACKEND_PORT="$2"
      shift 2
      ;;
    *)
      if [ -z "$PROJECT_NAME" ]; then
        PROJECT_NAME="$1"
      elif [ -z "$TARGET_DIR" ]; then
        TARGET_DIR="$1"
      else
        echo "Error: Unknown argument '$1'"
        exit 1
      fi
      shift
      ;;
  esac
done

if [ -z "$PROJECT_NAME" ]; then
  echo "Error: Project name is required"
  echo "Usage: bash init-fullstack-project.sh <project-name> <target-directory> [--db-name <name>] [--port <port>]"
  exit 1
fi

if [ -z "$TARGET_DIR" ]; then
  echo "Error: Target directory is required"
  echo "Usage: bash init-fullstack-project.sh <project-name> <target-directory> [--db-name <name>] [--port <port>]"
  exit 1
fi

# Default DB name: project name with hyphens replaced by underscores
if [ -z "$DB_NAME" ]; then
  DB_NAME="${PROJECT_NAME//-/_}"
fi

PROJECT_PATH="$TARGET_DIR/$PROJECT_NAME"

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  Full-Stack Project Initializer                             ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Project:    $PROJECT_NAME"
echo "Location:   $PROJECT_PATH"
echo "Database:   $DB_NAME"
echo "Port:       $BACKEND_PORT"
echo "Templates:  $TEMPLATE_DIR"
echo ""

# ── Step 1: Create Vite project ────────────────────────────────
echo "Step 1/9: Creating Vite project..."
cd "$TARGET_DIR"
npm create --yes vite@latest "$PROJECT_NAME" -- --template react-ts --no-interactive
cd "$PROJECT_NAME"

# ── Step 2: Install dependencies ───────────────────────────────
echo "Step 2/9: Installing base dependencies..."
npm install

# Switch from @vitejs/plugin-react (Babel — injects inline script blocked by
# CSP) to @vitejs/plugin-react-swc (SWC — no inline preamble).
echo "  Switching to @vitejs/plugin-react-swc..."
npm uninstall @vitejs/plugin-react
npm install --save-dev @vitejs/plugin-react-swc

echo "Step 3/9: Installing Flagship Design System..."
npm install @lifesg/react-design-system@^3 @lifesg/react-icons styled-components
npm install --save-dev @types/styled-components

echo "Step 4/9: Installing backend dependencies..."
npm install koa @koa/router @koa/cors koa-helmet @koa/bodyparser \
  koa-static postgres dotenv
npm install --save-dev @types/koa @types/koa__router @types/koa__cors \
  @types/koa-helmet @types/koa-static \
  @types/node concurrently tsx

# ── Step 5: Copy template files ────────────────────────────────
echo "Step 5/9: Copying template files..."
mkdir -p src/components src/pages src/providers src/hooks src/services

# Copy all template directories and files into the project
cp -r "$TEMPLATE_DIR/server" .
cp -r "$TEMPLATE_DIR/shared" .
cp "$TEMPLATE_DIR/tsconfig.json" .
cp "$TEMPLATE_DIR/tsconfig.server.json" .
cp "$TEMPLATE_DIR/vite.config.ts" .
cp "$TEMPLATE_DIR/docker-compose.local.yml" .
cp "$TEMPLATE_DIR/Dockerfile.local" .
cp "$TEMPLATE_DIR/.env.example" .
cp "$TEMPLATE_DIR/.pre-commit-config.yaml" .

# ── Step 6: Replace placeholder tokens ─────────────────────────
echo "Step 6/9: Substituting project values..."

# Cross-platform in-place sed (BSD vs GNU)
sedi() {
  if sed --version 2>/dev/null | grep -q GNU; then
    sed -i "$@"
  else
    sed -i '' "$@"
  fi
}

# Files with __BACKEND_PORT__
sedi "s/__BACKEND_PORT__/${BACKEND_PORT}/g" \
  vite.config.ts \
  server/index.ts \
  .env.example \
  Dockerfile.local

# Files with __DB_NAME__
sedi "s/__DB_NAME__/${DB_NAME}/g" \
  docker-compose.local.yml \
  .env.example

# ── Step 7: Update Vite-generated configs ──────────────────────
echo "Step 7/9: Updating TypeScript and package.json configs..."

# Update tsconfig.app.json — add paths and include shared
node -e "
const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync('tsconfig.app.json', 'utf8'));
if (!cfg.compilerOptions.paths) cfg.compilerOptions.paths = {};
cfg.compilerOptions.paths['@shared/*'] = ['./shared/*'];
if (!cfg.include) cfg.include = ['src'];
if (!cfg.include.includes('shared')) cfg.include.push('shared');
fs.writeFileSync('tsconfig.app.json', JSON.stringify(cfg, null, 2) + '\n');
"

# Update package.json with full-stack scripts
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.type = 'module';
pkg.scripts = {
  ...pkg.scripts,
  'dev': 'concurrently \"npm:dev:frontend\" \"npm:dev:server\"',
  'dev:frontend': 'vite',
  'dev:server': 'tsx watch server/index.ts',
  'build': 'npm run build:frontend && npm run build:server',
  'build:frontend': 'vite build',
  'build:server': 'tsc -p tsconfig.server.json',
  'start': 'node dist/index.js',
  'lint': 'eslint .',
  'preview': 'vite preview',
};
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# ── Step 8: Git init + gitignore ───────────────────────────────
echo "Step 8/9: Initialising git..."

git init 2>/dev/null || true

# Ensure .env is gitignored
if [ -f .gitignore ] && ! grep -q '^.env$' .gitignore; then
  printf '\n# Local environment variables\n.env\n' >> .gitignore
fi

# Ensure gitleaks report is gitignored
if [ -f .gitignore ] && ! grep -q 'gitleaks-report' .gitignore; then
  printf '\n# gitleaks secret scan report\ngitleaks-report.json\n' >> .gitignore
fi

# ── Step 9: Install pre-commit hook ───────────────────────────
echo "Step 9/9: Setting up gitleaks pre-commit hook..."

if command -v pre-commit &>/dev/null; then
  pre-commit install
  echo "  gitleaks pre-commit hook installed"
else
  echo "  Warning: pre-commit not found. Install it (brew install pre-commit"
  echo "  or pip install pre-commit) then run 'pre-commit install' manually."
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ Full-stack project created successfully!                 ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Location: $PROJECT_PATH"
echo ""
echo "Quick start:"
echo "  cd $PROJECT_PATH"
echo "  docker compose -f docker-compose.local.yml up -d"
echo "  cp .env.example .env"
echo "  npm run dev"
echo ""
echo "Next: Copilot must now generate ThemeProvider,                "
echo "  App.tsx, src/services/api.ts, and README.md.                "
echo "  See SKILL.md — Post-Script File Setup.                      "
echo ""
