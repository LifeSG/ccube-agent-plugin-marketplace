#!/bin/bash

# Initialize Vite + React + TypeScript + Flagship Design System Project
# Usage: bash init-vite-react-project.sh <project-name> <target-directory>

set -e  # Exit on error

PROJECT_NAME=$1
TARGET_DIR=$2

if [ -z "$PROJECT_NAME" ]; then
  echo "❌ Error: Project name is required"
  echo "Usage: bash init-vite-react-project.sh <project-name> <target-directory>"
  exit 1
fi

if [ -z "$TARGET_DIR" ]; then
  echo "❌ Error: Target directory is required"
  echo "Usage: bash init-vite-react-project.sh <project-name> <target-directory>"
  exit 1
fi

PROJECT_PATH="$TARGET_DIR/$PROJECT_NAME"

echo "🚀 Creating Vite + React + TypeScript project: $PROJECT_NAME"
echo "📁 Target location: $PROJECT_PATH"

# Check if directory already exists
if [ -d "$PROJECT_PATH" ]; then
  echo "⚠️  Warning: Directory $PROJECT_PATH already exists — continuing anyway"
fi

# Navigate to target directory
cd "$TARGET_DIR"

# Create Vite project with React + TypeScript template
echo "📦 Creating Vite project..."
npm create --yes vite@latest "$PROJECT_NAME" -- --template react-ts

# Navigate to project directory
cd "$PROJECT_NAME"

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Install Flagship Design System and dependencies
echo "🎨 Installing Flagship Design System..."
npm install @lifesg/react-design-system @lifesg/react-icons styled-components
npm install -D @types/styled-components

# Create directory structure
echo "📂 Creating project structure..."
mkdir -p src/components
mkdir -p src/pages
mkdir -p src/providers
mkdir -p src/utils

# Create ThemeProvider
echo "⚙️  Setting up theme provider..."
cat > src/providers/ThemeProvider.tsx << 'EOF'
import { ThemeProvider as FDSThemeProvider } from '@lifesg/react-design-system/theme';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function ThemeProvider({ children }: Props) {
  return <FDSThemeProvider>{children}</FDSThemeProvider>;
}
EOF

# Update main.tsx
echo "🔧 Updating main entry point..."
cat > src/main.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './providers/ThemeProvider';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
EOF

# Update App.tsx with FDS components
echo "📝 Creating initial App component..."
cat > src/App.tsx << 'EOF'
import { Layout } from '@lifesg/react-design-system/layout';
import { Text } from '@lifesg/react-design-system/text';

function App() {
  return (
    <Layout.Container>
      <Layout.Content>
        <Text.H1>Welcome to Your App</Text.H1>
        <Text.Body>Built with Flagship Design System</Text.Body>
      </Layout.Content>
    </Layout.Container>
  );
}

export default App;
EOF

# Create README
echo "📄 Creating README..."
cat > README.md << EOF
# $PROJECT_NAME

Frontend web application built with:
- Vite + React 18 + TypeScript
- Flagship Design System (@lifesg/react-design-system)

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

## Build

\`\`\`bash
npm run build
\`\`\`

## Design System

This project uses LifeSG's Flagship Design System. See:
- [Component Documentation](https://designsystem.life.gov.sg/)
- [Storybook](https://react.designsystem.life.gov.sg/)

## Project Structure

\`\`\`
src/
├── components/        # Reusable UI components
├── pages/             # Page components
├── providers/         # Context providers (Theme, etc.)
├── utils/             # Utility functions
├── App.tsx            # Root component
└── main.tsx           # Entry point
\`\`\`
EOF

echo ""
echo "✅ Project created successfully!"
echo ""
echo "📁 Location: $PROJECT_PATH"
echo ""
echo "🚀 Next steps:"
echo "   1. cd $PROJECT_PATH"
echo "   2. npm run dev"
echo "   3. Open browser to http://localhost:5173"
echo ""
