---
name: cc-create-mai-agent
description: >-
  Create a project-local (MAI) agent for BYOA — generates a
  properly-structured agent file at wai/byoa/ that Maestro
  discovers by filename and routes to instead of WAI defaults.
  Use when: user wants to add their own frontend or backend
  specialist, says "create a MAI agent", "add my own agent",
  "bring my own agent", "set up BYOA", or wants Maestro to use
  their project's stack instead of FDS/Koa defaults.
argument-hint: >-
  Which category (frontend, backend, or both) and optionally
  the project path.
user-invocable: true
---

# Create MAI Agent

Generate a project-local (MAI) agent that Maestro can discover
and route to. MAI agents live in `wai/byoa/` in the project
workspace and take precedence over WAI plugin defaults.

Maestro discovers MAI agents by **strict filename** — not by
description matching. The file MUST be named exactly:

| Category | Required filename |
|----------|-------------------|
| FRONTEND | `wai/byoa/mai-frontend.agent.md` |
| BACKEND | `wai/byoa/mai-backend.agent.md` |
| PRODUCT | `wai/byoa/mai-product.agent.md` |

> **V1 scope:** Only frontend, backend, and product categories
> are supported. This matches Maestro's current routing table.

---

## When to Use

Use this skill when:

- User wants to add a custom frontend or backend specialist
  for their project
- User says "create a MAI agent", "add my own agent", "bring
  my own agent", or "set up BYOA"
- User wants Maestro to use their project's stack instead of
  FDS/Koa defaults

Do NOT use when:

- User wants to create a WAI plugin agent (use
  `cc-contribute-wai` instead)
- User wants to edit an existing MAI agent (edit the file
  directly)
- The project has no `package.json` or detectable stack — ask
  the user to scaffold first

---

## Workflow

### Step 1: Detect Project Stack

Read the workspace to infer the project's technology stack.
Do NOT ask the user for information you can detect.

**Frontend detection:**
- Read `package.json` → extract: React/Next/Angular/Vue,
  UI library (MUI, Chakra, shadcn, Ant Design, etc.),
  CSS approach (Tailwind, styled-components, CSS modules)
- Read `tsconfig.json` → extract: path aliases, strict mode
- Scan directory structure → infer: where components live,
  where pages live, naming conventions

**Backend detection:**
- Read `package.json` → extract: framework (Express, Fastify,
  Koa, Nest), ORM/DB (Prisma, TypeORM, Drizzle, raw SQL),
  database (PostgreSQL, MongoDB, MySQL)
- Scan `server/` or `src/` → infer: route patterns, middleware
  structure, migration approach

**Build/test detection:**
- Read `package.json` scripts → extract: build command, test
  command, lint command
- Detect test runner (vitest, jest, mocha, playwright)

Present the detected stack to the user for confirmation before
proceeding.

### Step 2: Ask Category

Ask the user which category their agent should cover:

> Which specialist do you want to create?
> 1. **Frontend** — handles UI components, pages, and
>    frontend features
> 2. **Backend** — handles API endpoints, database, and
>    server-side logic
> 3. **Both** — creates two agents (one frontend, one backend)

### Step 3: Generate Agent File

Create the agent file at the **required filename** for the
chosen category:

- Frontend → `wai/byoa/mai-frontend.agent.md`
- Backend → `wai/byoa/mai-backend.agent.md`
- Both → create both files

The agent MUST follow this structure:

```markdown
---
name: "<Project Name> <Category> Engineer"
description: >-
  <Category> specialist for this project. Uses [detected stack].
  Invoke when: [trigger signals matching Maestro's Step 1 table
  for the chosen category].
---

# <Project Name> <Category> Engineer

<One paragraph describing the agent's role.>

---

## Priority Hierarchy

1. Follow project conventions detected in the workspace over
   generic patterns.
2. Use only the project's declared dependencies — do NOT
   introduce new libraries without explicit user approval.
3. Maintain consistency with existing code style and patterns.

---

## Core Directives

### Stack

- [Framework]: [version]
- [UI Library]: [version] (frontend only)
- [Database/ORM]: [version] (backend only)
- [Test runner]: [version]

### Conventions

- Components location: [detected path]
- Pages/routes location: [detected path]
- Naming convention: [detected pattern]
- Import style: [detected pattern]

### Completion Protocol

Before reporting your work as done, you MUST:

1. Run `[detected build command]` in the project root.
   - If build errors reference files you created or modified,
     fix them and re-run.
   - Maximum 3 build-fix attempts.
   - Do NOT fix errors in files you did not modify.

2. Run `[detected test command]` in the project root.
   - If test failures are in test files for code you wrote,
     fix them and re-run.
   - Maximum 2 test-fix attempts.

3. Report done only after both pass (or after reporting
   unfixable pre-existing failures).

---

## Workflow

1. Read the task description from the invoking agent or user.
2. Explore relevant existing code to understand patterns.
3. Implement the requested changes following project
   conventions.
4. Run the Completion Protocol.
5. Report what was created/modified.
```

### Step 4: Description Quality Check

The `description` field in the agent frontmatter is for human
readability and tooling display. Maestro routes by filename,
not description — but a good description helps users understand
what the agent does when browsing the agents list.

**For FRONTEND agents, the description SHOULD contain at least
3 of these terms** (from Maestro's Step 1 classification
signals):
- "page", "pages"
- "component", "components"
- "UI feature"
- "frontend"
- "build errors" (frontend context)
- The framework name (React, Next.js, Angular, Vue)

**For BACKEND agents, the description SHOULD contain at least
3 of these terms:**
- "endpoint", "endpoints"
- "API"
- "route", "routes"
- "database"
- "migration", "migrations"
- "server-side"
- The framework name (Express, Koa, Fastify, Nest)

After generating the description, verify it contains sufficient
terms. If fewer than 3 are present, revise the description to
include more.

### Step 5: Create Directory and Write File

1. Create `wai/byoa/` directory if it doesn't exist
2. Write the agent file at the required filename
3. Confirm creation to the user

### Step 6: Verify (Optional)

If the user asks to verify, confirm:
- The file exists at the correct path
  (`wai/byoa/mai-frontend.agent.md` or
  `wai/byoa/mai-backend.agent.md`)
- Maestro's Step 2a would find it during filename lookup
- The agent frontmatter is valid YAML

---

## Rules

- You MUST detect the stack automatically — do NOT ask the
  user for information available in `package.json` or the
  filesystem.
- You MUST use the exact required filename for the category
  (`mai-frontend.agent.md`, `mai-backend.agent.md`, or
  `mai-product.agent.md`). No other filenames will be
  discovered by Maestro.
- You MUST include a Completion Protocol with the project's
  actual build and test commands.
- You MUST NOT generate an agent that references dependencies
  not present in the project.
- You MUST create the file in `wai/byoa/`, NOT in
  `.claude/agents/` or `plugins/wai/agents/`.
- If the project already has a MAI agent for the chosen
  category in `wai/byoa/`, warn the user and ask whether to
  replace it.

---

## Error Handling

**No `package.json` found:**
- Ask the user whether to scaffold the project first (suggest
  `cc-vite-react-ds` or `cc-fullstack-vite`) or provide the
  stack details manually.

**Cannot detect framework or database:**
- Report what was detected and what was not. Ask the user to
  confirm the missing details before generating the agent.

**`wai/byoa/` directory creation fails:**
- Check filesystem permissions. Report the error and suggest
  the user create the directory manually.

**Agent file already exists for category:**
- Show the existing file path and ask whether to replace or
  abort. Do NOT silently overwrite.

**Build/test commands not found in `package.json` scripts:**
- Use placeholder comments in the Completion Protocol:
  `# TODO: add build command` and `# TODO: add test command`.
  Warn the user that the agent will not self-verify until
  these are filled in.

---

## Example Output

For a Next.js + shadcn + Prisma project named "acme-portal":

**`wai/byoa/mai-frontend.agent.md`:**

```markdown
---
name: "Acme Portal Frontend Engineer"
description: >-
  Frontend specialist for the Acme Portal project. Uses
  Next.js 14 App Router with shadcn/ui and Tailwind CSS.
  Invoke when: building pages, creating components, fixing
  frontend build errors, or implementing UI features.
---

# Acme Portal Frontend Engineer

Hands-on frontend implementation specialist for the Acme
Portal. Builds pages and components using Next.js App Router,
shadcn/ui, and Tailwind CSS. Self-verifies with the project's
build and test commands before reporting done.

---

## Priority Hierarchy

1. Follow existing patterns in src/components/ and src/app/.
2. Use shadcn/ui components before building custom ones.
3. Never introduce new dependencies without user approval.

---

## Core Directives

### Stack

- Next.js: 14.2 (App Router)
- UI: shadcn/ui + Tailwind CSS 3.4
- State: Zustand 4.5
- Testing: Vitest + Testing Library

### Conventions

- Components: src/components/<feature>/<Component>.tsx
- Pages: src/app/<route>/page.tsx
- Hooks: src/hooks/use<Name>.ts
- Naming: PascalCase for components, camelCase for hooks

### Completion Protocol

Before reporting your work as done, you MUST:

1. Run `pnpm build` in the project root.
   - Fix build errors in files you modified. Max 3 attempts.
2. Run `pnpm test` in the project root.
   - Fix test failures for code you wrote. Max 2 attempts.
3. Report done only after both pass.
```

---

## Acceptance Criteria

### Feedforward Assertions (MUST-contain)

Every generated MAI agent MUST contain:
- Agent file at `wai/byoa/mai-<category>.agent.md` using the
  exact required filename
- Valid YAML frontmatter with `name` and `description` fields
  between `---` delimiters
- Description containing ≥3 category-relevant terms
- A `## Priority Hierarchy` section with at least one rule
- A `## Core Directives` section with Stack, Conventions, and
  Completion Protocol subsections
- Stack section reflecting actual project dependencies
  (versions from `package.json`)
- Conventions section reflecting actual directory structure
- Completion Protocol using the project's real build/test
  commands (or explicit TODOs if not detected)
- A `## Workflow` section with numbered steps

### Feedback Sensors (MUST-NOT-contain)

Every generated MAI agent MUST NOT contain:
- A filename other than `mai-frontend.agent.md`,
  `mai-backend.agent.md`, or `mai-product.agent.md`
- References to dependencies not present in the project's
  `package.json`
- Hardcoded paths that do not exist in the workspace
- Missing `---` delimiters in frontmatter
- The file placed in `.claude/agents/` or
  `plugins/wai/agents/` instead of `wai/byoa/`

**PASS example:**
> Input: "Create a MAI agent for my Next.js frontend"
>
> Output: Detects Next.js 14, shadcn/ui, Tailwind from
> package.json. Creates `wai/byoa/mai-frontend.agent.md` with
> correct stack, conventions matching `src/app/` structure, and
> `pnpm build` / `pnpm test` in Completion Protocol.

**FAIL example:**
> Output: Creates `wai/byoa/frontend-engineer.agent.md`
> (wrong filename — Maestro will never find it). Stack lists
> "React 18" but project uses Next.js 14.
> *(Fails: wrong filename; inaccurate stack detection)*

### Test Cases

| Feature | Scenario | Persona | Expected behaviour |
|---------|----------|---------|-------------------|
| Frontend MAI | Next.js + shadcn project | Engineer | Creates `mai-frontend.agent.md` with Next.js stack, `pnpm build` in protocol |
| Backend MAI | Express + Prisma + PostgreSQL | Engineer | Creates `mai-backend.agent.md` with Express/Prisma stack, correct migration patterns |
| Both categories | Full-stack Vite + Koa project | Engineer | Creates both `mai-frontend.agent.md` and `mai-backend.agent.md` |
| Existing agent | `mai-frontend.agent.md` already exists | Any | Warns user, asks whether to replace before overwriting |
| No package.json | Empty workspace | Any | Asks user to scaffold or provide stack details manually |
| Missing build script | package.json has no `build` script | Any | Uses TODO placeholder in Completion Protocol, warns user |
