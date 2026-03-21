---
name: "cc-vite-react-ds"
description: "Initialize a new Vite + React + TypeScript frontend project with Flagship Design System (@lifesg/react-design-system) pre-configured. Use when user wants to scaffold a new web application using FDS components."
user-invokable: false
---

# Create Vite React Design System Project

## Purpose

This skill automates the creation of a new frontend web application using:
- **Vite** (fast build tool)
- **React 18+** with TypeScript
- **Flagship Design System** (@lifesg/react-design-system)
- Standard project structure with routing, styling, and FDS theme setup

## When to Use This Skill

Use this skill when:
- User asks to "create a new frontend project"
- User wants to build a web app using the Flagship Design System
- User needs to scaffold a React application quickly
- User mentions Vite + React + Design System together

Do NOT use when:
- User wants to add FDS to an existing project (use different guidance)
- User asks for Next.js or other frameworks
- User only wants component examples without full project setup

## Prerequisites

- **Node.js 18+** and **npm** must be installed and available in PATH. Verify with `node -v` before executing.

## Required Information

Before executing, gather the following. If any required input is missing, ask the user — collect all missing fields in a single message before proceeding.

1. **Project name** (required, kebab-case)
   - If missing, ask: "What should the project be named? Use kebab-case, e.g., `my-app`."
2. **Target directory** (required, absolute path where the project folder will be created)
   - If missing, ask: "Where should the project be created? Provide an absolute path (e.g., `/Users/username/projects`). If you want to use your home directory, I will resolve it to its absolute path for you."
   - If the user provides `~`, resolve it to an absolute path before proceeding: run `echo $HOME` in terminal and use the output.
3. **Initial features** (optional — proceed without asking if not mentioned)

> Monorepo setup is out of scope for this skill. If the user explicitly requests a monorepo integration, advise them to scaffold the standalone project first using this skill, then integrate it manually into their workspace.

## Execution Steps

> This skill creates standalone Vite + React apps only. Monorepo integration is out of scope — see Required Information above.

### Automated Setup (Recommended)

The initialization script performs ALL steps automatically. This is the recommended approach.

**Script Location**: `scripts/init-vite-react-project.sh`

**Before running**: Verify Node.js is available by running `node -v` in terminal. If the command fails, install Node.js 18+ from nodejs.org before proceeding.

> **CRITICAL — run as background process**: This script runs multiple `npm install` steps that can take 2-5 minutes. You MUST launch it with `isBackground: true`. After starting it, poll with `get_terminal_output` every 30 seconds until the output contains `✅ Project created successfully!`. Do NOT run it as a foreground command — it will be killed before completion.

**Finding the script**:
1. Use `file_search` with pattern `init-vite-react-project.sh` — this is the primary and most reliable discovery method across environments.
2. If `file_search` returns no results, the skill is not installed in this environment. Fall back to the Manual Setup steps below.
3. Known hint paths (verify with `file_search` first — paths may differ per environment):
   - Plugin install (macOS): `~/Library/Application Support/Code/agentPlugins/<marketplace-org-path>/plugins/ccube-fds-web-app-builder/skills/cc-vite-react-ds/scripts/init-vite-react-project.sh`
   - Workspace source: `<workspace-root>/plugins/ccube-fds-web-app-builder/skills/cc-vite-react-ds/scripts/init-vite-react-project.sh`

**Usage** (background — required):
```bash
bash "<absolute-path-to-script>" "<project-name>" "<target-directory>"
```
Launch with `isBackground: true`. Then poll `get_terminal_output` until you see `✅ Project created successfully!`.

**Example** (path shown is illustrative — use `file_search` to obtain your actual path):
```bash
bash "~/Library/Application Support/Code/agentPlugins/<marketplace-org-path>/plugins/ccube-fds-web-app-builder/skills/cc-vite-react-ds/scripts/init-vite-react-project.sh" "my-chatbot-app" "/Users/username/projects"
```

**What the script does automatically**:
1. Creates Vite project with React + TypeScript template
2. Installs @lifesg/react-design-system and peer dependencies
3. Creates directory structure (components/, pages/, providers/, utils/)
4. Configures ThemeProvider wrapper for FDS
5. Updates main.tsx with theme provider
6. Creates initial App.tsx with FDS components
7. Generates project README.md

**After script completes** (confirmed via `get_terminal_output` showing `✅ Project created successfully!`), verify:
- ✅ `npm run dev` starts without errors
- ✅ Browser shows FDS-styled content
- ✅ No console errors related to styled-components or FDS

---

### Manual Setup (Fallback)

If the automated script cannot be located or fails, execute these steps manually:

#### Step 1: Create Vite Project

```bash
cd "<target-directory>"
npm create vite@latest "<project-name>" -- --template react-ts
cd "<project-name>"
npm install
```

#### Step 2: Install Flagship Design System

```bash
npm install @lifesg/react-design-system @lifesg/react-icons styled-components
npm install -D @types/styled-components
```

#### Step 3: Create Directory Structure

```bash
mkdir -p src/components src/pages src/providers src/utils
```

#### Step 4: Configure Theme Provider

Create `src/providers/ThemeProvider.tsx`:

```typescript
import { ThemeProvider as FDSThemeProvider } from '@lifesg/react-design-system/theme';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function ThemeProvider({ children }: Props) {
  return <FDSThemeProvider>{children}</FDSThemeProvider>;
}
```

#### Step 5: Update Main Entry Point

Modify `src/main.tsx`:

```typescript
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
```

#### Step 6: Create Initial App Structure

Replace `src/App.tsx`:

```typescript
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
```

#### Step 7: Add Project Documentation

Create `README.md`:

```markdown
# [Project Name]

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
```

## Verification Steps

After project creation, verify:
1. ✅ `npm install` completes without errors
2. ✅ `npm run dev` starts development server
3. ✅ Browser shows FDS-styled content
4. ✅ Theme provider is correctly configured
5. ✅ No console errors related to styled-components or FDS

## Error Handling

### Script Execution Errors

**Error: "npm: command not found" or "node: command not found"**
- **Cause**: Node.js or npm not installed or not in PATH
- **Solution**: Install Node.js 18+ from nodejs.org, then retry

**Error: "Target directory does not exist"**
- **Cause**: Parent directory doesn't exist
- **Solution**: Create it first: `mkdir -p "<target-directory>"`, then retry

**Error: "Directory already exists"**
- **Cause**: Project folder already present
- **Solution**: Choose different project name, or delete existing folder, or proceed with existing project

**Error: npm create vite fails with network error**
- **Cause**: npm registry connectivity issue
- **Solution**: Check internet connection, verify npm registry access, or use manual setup steps

**Error: FDS installation fails**
- **Cause**: Private registry access issue or version mismatch
- **Solution**: Verify access to FDS package registry, check package.json for version conflicts

**Error: Script exits mid-execution**
- **Cause**: Partial failure (e.g., Vite created but FDS install failed)
- **Solution**: Navigate to the project folder and complete remaining steps manually from Step 2 onward

**Error: Script not found (`file_search` returns no results)**
- **Cause**: The skill is not installed in this environment, or the workspace structure does not match expected paths
- **Solution**: Use the Manual Setup steps below — they replicate every step the script performs

### Runtime Errors

**Issue: Styled-components version mismatch**
- **Symptoms**: Console errors mentioning styled-components version conflicts
- **Solution**: Ensure peer dependencies match FDS requirements:
  ```bash
  npm install styled-components@^6.0.0
  ```

**Issue: TypeScript errors with styled-components**
- **Symptoms**: Type errors in .tsx files using styled-components
- **Solution**: Install type definitions:
  ```bash
  npm install -D @types/styled-components
  ```

**Issue: Theme not applied**
- **Symptoms**: Components render but don't have FDS styling
- **Solution**: Verify ThemeProvider wraps the entire app in `main.tsx`

**Issue: Module not found: @lifesg/react-design-system**
- **Symptoms**: Import errors for FDS components
- **Solution**: Re-run `npm install` in the project directory

## Project Structure Convention

The created project follows this structure:

```
<project-name>/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page components
│   ├── providers/         # Context providers (Theme, etc.)
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Root component
│   └── main.tsx           # Entry point
├── public/                # Static assets
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## Integration with Figma-to-DS Workflow

This skill is typically used as the FIRST step in the Figma-to-DS workflow:

1. **Create Project** (this skill) → Creates base structure
2. **Fetch Figma Design** (cc-figma skill) → Gets design data
3. **Map Components** (cc-design-system skill) → Maps Figma to FDS
4. **Implement UI** (coding) → Builds the components

## Output Format

After successful execution, report:

```
✅ Project created: <project-name>
📁 Location: <absolute-path>
📦 Installed packages:
   - @lifesg/react-design-system
   - @lifesg/react-icons
   - styled-components
   
🚀 Next steps:
   1. cd <target-directory>/<project-name>
   2. npm run dev
   3. Open browser to http://localhost:5173
```

## Script Reference

### `scripts/init-vite-react-project.sh`

Automated project initialization script. Use `file_search` to locate the absolute path before running. Usage:
```bash
bash "<absolute-path-to-script>" "<project-name>" "<target-directory>"
```

See `scripts/` directory for implementation details.
