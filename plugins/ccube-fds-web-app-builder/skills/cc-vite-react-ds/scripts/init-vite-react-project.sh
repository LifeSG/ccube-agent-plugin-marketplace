#!/bin/bash

# Initialize Vite + React + TypeScript + Flagship Design System Project
# Usage: bash init-vite-react-project.sh <project-name> <target-directory>

set -e  # Exit on error

PROJECT_NAME=$1
TARGET_DIR=$2

if [ -z "$PROJECT_NAME" ]; then
  echo "Error: Project name is required"
  echo "Usage: bash init-vite-react-project.sh <project-name> <target-directory>"
  exit 1
fi

if [ -z "$TARGET_DIR" ]; then
  echo "Error: Target directory is required"
  echo "Usage: bash init-vite-react-project.sh <project-name> <target-directory>"
  exit 1
fi

PROJECT_PATH="$TARGET_DIR/$PROJECT_NAME"

echo "Creating Vite + React + TypeScript project: $PROJECT_NAME"
echo "Target location: $PROJECT_PATH"

# Check if directory already exists
if [ -d "$PROJECT_PATH" ]; then
  echo "Warning: Directory $PROJECT_PATH already exists -- continuing anyway"
fi

# Navigate to target directory
cd "$TARGET_DIR"

# Create Vite project with React + TypeScript template
# --no-interactive skips the "Install and start now?" prompt (create-vite v7+)
echo "Creating Vite project..."
npm create --yes vite@latest "$PROJECT_NAME" -- --template react-ts --no-interactive

# Navigate to project directory
cd "$PROJECT_NAME"

# Install dependencies
echo "Installing dependencies..."
npm install

# Install Flagship Design System and dependencies
# Pinned to ^3 — v4 is alpha and has breaking ThemeProvider API changes.
# Remove the @^3 pin once v4 reaches stable and resources-v4/ is populated.
echo "Installing Flagship Design System..."
npm install @lifesg/react-design-system@^3 @lifesg/react-icons styled-components
npm install --save-dev @types/styled-components

# Create directory structure
echo "Creating project structure..."
mkdir -p src/components
mkdir -p src/pages
mkdir -p src/providers
mkdir -p src/utils

echo ""
echo "Project created successfully."
echo ""
echo "Location: $PROJECT_PATH"
echo ""
echo "Next: Copilot must now generate ThemeProvider, main.tsx, App.tsx, and README.md"
echo "See SKILL.md -- File Setup section for required steps."
echo ""
