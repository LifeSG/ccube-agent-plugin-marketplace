---
name: cc-fullstack-vite
description: >-
  Create a new full-stack application with Vite + React + Flagship
  Design System frontend and Koa + PostgreSQL backend, all in a single
  project folder. Use when the user wants a full-stack app with a
  database, or asks for a project with both frontend and backend.
user-invocable: false
---

# Full-Stack Vite Project Skill

## Purpose

This skill creates a single-folder full-stack application with:

- **Frontend** — Vite + React + TypeScript with Flagship Design System
  (@lifesg/react-design-system)
- **Backend** — Koa + TypeScript (compiled separately via
  `tsconfig.server.json`)
- **Database** — PostgreSQL accessed through the `postgres` driver
  (raw SQL, code-level migrations)
- **Shared types** — A `shared/` directory containing compile-time-only
  type definitions consumed by both frontend and backend
- **Docker** — `docker-compose.local.yml` for local PostgreSQL,
  `Dockerfile.local` for containerised local development
- **Secret scanning** — gitleaks pre-commit hook to block commits
  containing secrets, API keys, or credentials

The architecture is modelled on a proven reference implementation and
follows strict build-output constraints required by the production
Dockerfile.

## When to Use This Skill

Use this skill when:

- User asks to "create a full-stack project" or "project with a
  backend and database"
- User wants a web app with both a frontend UI and an API server
- User mentions Koa, Express-like backend, or PostgreSQL together
  with Vite or React
- User wants a monorepo-style layout with frontend and backend in one
  folder

Do NOT use when:

- User only wants a frontend app without a backend (use
  `cc-vite-react-ds` instead)
- User wants Next.js or another full-stack framework
- User wants a microservices architecture with separate repos
- User only wants database setup without a web frontend

---

## Prerequisites

- **Node.js 18+** and **npm** — verify with `node -v` before executing
- **Docker** and **Docker Compose** — required for the local PostgreSQL
  container. Verify with `docker --version` and
  `docker compose version`.
- **gitleaks** — pre-commit secret scanner. Install via
  `brew install gitleaks` (macOS) or download from
  https://github.com/gitleaks/gitleaks/releases. Verify with
  `gitleaks version`.
- **pre-commit** — hook framework. Install via
  `brew install pre-commit` or `pip install pre-commit`. Verify with
  `pre-commit --version`.

## Required Information

Before executing, gather the following. If any required input is
missing, collect all missing fields in a single message.

1. **Project name** (required, kebab-case)
   - If missing, ask: "What should the project be named? Use
     kebab-case, e.g., `my-app`."
2. **Target directory** (required, absolute path where the project
   folder will be created)
   - If the user provides `~`, resolve to absolute path via
     `echo $HOME`
3. **Database name** (optional, default: same as project name with
   hyphens replaced by underscores)
4. **Backend port** (optional, default: `3333`)

---

## Architecture Overview

The final project structure follows this layout:

```
<project-name>/
├── index.html                  # Vite HTML entry point
├── package.json                # Unified dependencies and scripts
├── tsconfig.json               # Project references root
├── tsconfig.app.json           # Frontend TypeScript config
├── tsconfig.node.json          # Vite config TypeScript config
├── tsconfig.server.json        # Server TypeScript config
├── vite.config.ts              # Vite config with proxy and alias
├── eslint.config.js            # Shared ESLint config
├── docker-compose.local.yml    # Local PostgreSQL service
├── Dockerfile.local            # Local development container
├── .env.example                # Environment variable template
├── .pre-commit-config.yaml     # gitleaks secret scanning hook
├── server/
│   ├── index.ts                # Server entry point (startup, graceful shutdown)
│   ├── app.ts                  # Koa app factory (middleware, routes, static serving)
│   ├── db/
│   │   ├── client.ts           # PostgreSQL connection (postgres driver)
│   │   ├── migrate.ts          # Code-level schema migrations
│   │   └── seed.ts             # Optional seed data
│   ├── middleware/
│   │   ├── errorHandler.ts     # Centralised error handling
│   │   └── requestLogger.ts    # Request/response logging
│   └── routes/
│       ├── health.ts           # GET /api/health
│       └── api.ts              # Application API routes
├── shared/
│   └── types.ts                # Type definitions only (interfaces, type aliases)
├── src/                        # Vite + React frontend
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/               # API client functions
│   └── providers/
└── public/                     # Static assets
```

### Critical Build Constraints

These constraints are enforced by the production Dockerfile's
auto-detection logic and MUST NOT be violated:

| Constraint            | Required value       | Why                                                           |
| --------------------- | -------------------- | ------------------------------------------------------------- |
| Server build output   | `dist/index.js`      | Dockerfile checks `[ -f dist/index.js ]` for `nodejs-backend` |
| Frontend build output | `dist/client/`       | Must NOT be `dist/` or `dist/public/`                         |
| `npm start` script    | `node dist/index.js` | Invoked by Dockerfile `nodejs-backend` entrypoint             |

### Shared Directory Constraint

The `shared/` directory MUST contain only TypeScript type definitions
(`interface`, `type`, `const enum`) and compile-time-only exports. It
MUST NOT contain runtime code, value exports, or environment-specific
imports.

**Why**: The server `tsconfig.server.json` uses `rootDir: "server"` so
that `server/index.ts` compiles to `dist/index.js`. TypeScript enforces
`rootDir` at file inclusion level — even `import type` from a file
outside `rootDir` causes TS6059. The workaround is to inline minimal
type definitions in server files rather than importing from `shared/`.

The frontend `tsconfig.app.json` includes both `src` and `shared` in
its `include` array and uses a path alias (`@shared/*`) to import
shared types.

---

## Automated Setup (Recommended)

**Script location**: `scripts/init-fullstack-project.sh`

**Finding the script**: Replace `SKILL.md` at the end of this skill's
path with `scripts/init-fullstack-project.sh`. Do NOT use file search
— the script is outside the workspace.

> **CRITICAL — run as background process**: This script runs multiple
> `npm install` steps that take 2–5 minutes. You MUST launch it with
> `isBackground: true`. After starting it, poll with
> `get_terminal_output` every 30 seconds until the output contains
> `✅ Full-stack project created successfully!`. Do NOT run as
> foreground.

**Usage** (background — required):
```bash
bash "<absolute-path-to-script>" "<project-name>" "<target-directory>" [--db-name <name>] [--port <port>]
```

**Arguments**:

| Argument             | Required | Default                    | Description                        |
| -------------------- | -------- | -------------------------- | ---------------------------------- |
| `<project-name>`     | Yes      | —                          | Kebab-case project name            |
| `<target-directory>` | Yes      | —                          | Absolute path for project creation |
| `--db-name <name>`   | No       | Project name (underscored) | PostgreSQL database name           |
| `--port <port>`      | No       | `3333`                     | Backend server port                |

**Example**:
```bash
bash "/path/to/skills/cc-fullstack-vite/scripts/init-fullstack-project.sh" \
  "my-fullstack-app" "/Users/username/projects"
```

**What the script does**:

1. Creates Vite project with React + TypeScript template
2. Installs Flagship Design System and peer dependencies
3. Installs backend dependencies (koa, postgres, etc.)
4. Copies template files (`server/`, `shared/`, configs, Docker
   files) from the skill's `templates/` directory
5. Substitutes placeholder tokens (`__BACKEND_PORT__`, `__DB_NAME__`)
   with user-provided values via `sed`
6. Updates `tsconfig.app.json` with shared path alias
7. Updates `package.json` with full-stack scripts
8. Initialises git and configures `.gitignore`
9. Sets up gitleaks pre-commit hook

## Post-Script File Setup

After the script completes (confirmed via `get_terminal_output`),
you MUST create or update these files:

### 1. Frontend entry files

Read `resources/theme-setup.md` from the `cc-design-system` skill
and follow **Installation Step 3** to set up
`src/providers/ThemeProvider.tsx` and `src/main.tsx`.

### 2. `src/services/api.ts`

Create an API client module that calls backend endpoints:

```typescript
const API_BASE = '/api';

export async function fetchHealth(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.data;
}
```

### 3. `src/App.tsx`

Replace the default Vite App with a layout that demonstrates the
frontend-to-backend connection (e.g., displays health status or
a data list from the API). Use FDS components (`Layout`, `Text`,
etc.) for the UI.

### 4. `README.md`

Create a README documenting:
- Stack overview (Vite + React + FDS + Koa + PostgreSQL)
- Prerequisites (Node.js, Docker)
- Quick start (`docker compose -f docker-compose.local.yml up -d`,
  copy `.env.example` to `.env`, `npm run dev`)
- Available scripts (`dev`, `dev:frontend`, `dev:server`, `build`,
  `start`)
- Project structure overview

---
## Verification Steps

After project creation, verify:

1. ✅ Start PostgreSQL: `docker compose -f docker-compose.local.yml up -d`
2. ✅ Copy env: `cp .env.example .env`
3. ✅ `npm run dev` starts both frontend and backend without errors
4. ✅ `curl http://localhost:3333/api/health` returns
   `{"data":{"status":"healthy",...}}`
5. ✅ Browser at `http://localhost:5173` shows the frontend
6. ✅ Frontend can reach backend through the Vite proxy
   (e.g., `fetch('/api/health')` works)
7. ✅ `npm run build` completes without errors
8. ✅ `dist/index.js` exists (server build output)
9. ✅ `dist/client/` exists (frontend build output)
10. ✅ `npm start` serves the built app on the configured port
11. ✅ `pre-commit run gitleaks --all-files` passes with no secrets
    detected

## Error Handling

### Script Execution Errors

**Error: "npm: command not found" or "node: command not found"**
- **Cause**: Node.js or npm not installed or not in PATH
- **Solution**: Install Node.js 18+ from nodejs.org

**Error: "Docker is not running" or "docker compose: command not found"**
- **Cause**: Docker not installed or Docker daemon not started
- **Solution**: Install Docker Desktop and start it, or use
  `brew install docker` on macOS

**Error: "port 5555 already in use"**
- **Cause**: Another PostgreSQL instance or process using port 5555
- **Solution**: Stop the other process, or change the port mapping in
  `docker-compose.local.yml` and update `DATABASE_URL` in `.env`

**Error: "DATABASE_URL is not set"**
- **Cause**: `.env` file missing or `DATABASE_URL` not defined
- **Solution**: Copy `.env.example` to `.env` and verify the
  connection string

**Error: "connection refused" from postgres driver**
- **Cause**: PostgreSQL container not running
- **Solution**: Run
  `docker compose -f docker-compose.local.yml up -d` and wait for the
  health check to pass

**Error: Script not found**
- **Cause**: Skill not installed or path derivation failed
- **Solution**: Tell the user the task has failed because the
  `init-fullstack-project.sh` script could not be located. The skill
  package may not be installed correctly. Do NOT attempt to recreate
  the project manually.

### Build Errors

**Error: `dist/index.js` not found after `npm run build`**
- **Cause**: `tsconfig.server.json` `rootDir` or `outDir` misconfigured
- **Solution**: Verify `rootDir` is `"server"` and `outDir` is `"dist"`

**Error: TS6059 — File is not under rootDir**
- **Cause**: Server code imports from `shared/` directory
- **Solution**: Inline the types in the server file instead of
  importing from `shared/`. See the Shared Directory Constraint above.

**Error: Vite proxy returns 504 Gateway Timeout**
- **Cause**: Backend server not running
- **Solution**: Ensure `npm run dev:server` is running (check the
  `concurrently` output)

## Resources

- Vite documentation: https://vite.dev/
- Koa documentation: https://koajs.com/
- postgres (driver) documentation: https://github.com/porsager/postgres
- Docker Compose documentation:
  https://docs.docker.com/compose/
- Flagship Design System:
  https://designsystem.life.gov.sg/

---

## Acceptance Criteria

### Feedforward Assertions (MUST-contain)

After script execution, the project directory MUST contain:
- `package.json` with `dev`, `dev:frontend`, `dev:server`, `build`,
  and `start` scripts
- `server/index.ts`, `server/app.ts`, `server/db/client.ts`,
  `server/db/migrate.ts`
- `server/routes/health.ts` with a `GET /api/health` endpoint
- `server/middleware/errorHandler.ts` and `requestLogger.ts`
- `shared/types.ts` (compile-time-only type definitions)
- `docker-compose.local.yml` with a PostgreSQL service
- `Dockerfile.local` referencing the configured backend port
- `.env.example` with `DATABASE_URL` and `PORT` placeholders
- `.pre-commit-config.yaml` with gitleaks hook
- `tsconfig.server.json` with `rootDir: "server"` and
  `outDir: "dist"`
- `vite.config.ts` with proxy to the configured backend port

### Feedback Sensors (MUST-NOT-contain)

After script execution, the project MUST NOT contain:
- Hardcoded secrets or credentials in any file
- Runtime imports from `shared/` in `server/` files
- Build output in `dist/` (no pre-built artefacts)
- `node_modules` committed to version control (`.gitignore` must
  exclude it)

**PASS example:**
> Input: `cc-fullstack-vite my-app /Users/dev/projects`
>
> Output: Script completes; `npm run dev` starts both frontend and
> server; `GET /api/health` returns `{ status: "ok" }`;
> `.env.example` present with `DATABASE_URL` placeholder; no
> hardcoded secrets found.

**FAIL example:**
> Output: Project created but `server/db/client.ts` contains
> `const db = new Pool({ password: 'secret123' })`.
> *(Fails: hardcoded credential in server file)*

### Test Cases (features × scenarios × personas)

| Feature            | Scenario                            | Persona               | Expected behaviour                                                      |
| ------------------ | ----------------------------------- | --------------------- | ----------------------------------------------------------------------- |
| Full scaffold      | First-time project, default options | Non-technical founder | Script completes with ✅ message; all files present; `npm run dev` works |
| Custom port        | `--port 4000` flag provided         | DevOps engineer       | `vite.config.ts` proxy and `Dockerfile.local` use port 4000             |
| Custom DB name     | `--db-name my_app_db` flag provided | Backend developer     | `docker-compose.local.yml` and `.env.example` use `my_app_db`           |
| Build verification | `npm run build` after scaffold      | CI pipeline           | `dist/index.js` exists; `dist/client/` exists; exit code 0              |
| Secret scanning    | Commit with hardcoded API key       | Any developer         | `pre-commit` gitleaks hook blocks the commit                            |
