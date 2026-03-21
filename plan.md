# FDS Web App Builder -- Plugin Roadmap

## Current State

| Category     | Count | Files                                    |
| ------------ | ----- | ---------------------------------------- |
| Agents       | 1     | `prompt-refiner.sub.agent.md` (subagent) |
| Instructions | 1     | `prompt-refinement.instructions.md`      |
| Skills       | 0     | --                                       |
| Prompts      | 0     | --                                       |

---

## Tier 1 -- Foundation

These files make the pivot real. Without them the plugin cannot claim to build
web applications using FDS.

### T1.1 -- Primary Agent: FDS Web Developer

- [ ] Create `agents/fds-web-developer.agent.md`

The plugin's core persona. Defines a web application developer that builds
React applications strictly following the Flagship Design System.

Must include:

- Persona: "You are a web application developer that builds React applications
  strictly following the Flagship Design System"
- Tool restrictions: file operations, codebase search, terminal (for package
  installs)
- Hard constraint: every UI element must use an FDS component -- no raw HTML,
  no third-party UI libraries
- Reference the FDS component catalog skill for component resolution
- Reference the theming skill for token/theme decisions
- Escalation rule: when no FDS component exists for a requirement, ask the
  user -- never invent a custom workaround silently

### T1.2 -- Instruction: FDS Coding Standards

- [ ] Create `instructions/fds-coding-standards.instructions.md`

Always-on enforcement layer. Applied to `**/*.tsx, **/*.ts, **/*.jsx, **/*.js`.

Must cover:

- **Component imports:** Always import from
  `@lifesg/react-design-system/<component>`, never fabricate import paths
- **No raw HTML for UI:** Do not use `<button>`, `<input>`, `<select>`,
  `<table>` etc. when an FDS equivalent exists
- **No third-party UI:** Do not introduce Material UI, Chakra, Ant Design,
  Radix, or similar
- **Token usage:** Use `Colour`, `Typography`, `MediaQuery` tokens from FDS
  theme -- no hardcoded hex colours, pixel font sizes, or media query
  breakpoints
- **Theme provider:** Every app root must be wrapped in `DSThemeProvider` or
  `ThemeProvider`
- **Styled-components:** FDS uses `styled-components`; do not introduce CSS
  modules, Tailwind, or other CSS-in-JS alternatives

### T1.3 -- Skill: FDS Component Catalog

- [ ] Create `skills/fds-component-catalog/SKILL.md`

Structured mapping of common UI needs to FDS components. The agent and
instructions reference this skill when resolving "I need a date picker" to the
correct FDS component.

Must include:

- Component name, import path, key props, and Storybook link
- Grouped by domain: Layout, Navigation, Forms & Inputs, Data Display,
  Feedback, Overlays
- Coverage of most-used components: Button, Input, Select, DateInput,
  Accordion, Card, Layout, Navbar, Sidenav, Modal, Toast, Table, etc.
- Explicit "no FDS equivalent" markers for patterns requiring third-party
  libraries (charting, maps) with guidance to wrap those in FDS containers

---

## Tier 2 -- Core Workflows

These files enable the most common web application development tasks.

### T2.1 -- Instruction: React Project Conventions

- [ ] Create `instructions/react-project-conventions.instructions.md`

Applied to `**/*.tsx, **/*.ts`. Covers:

- Vite + React + TypeScript project structure conventions
- File naming: PascalCase for components, camelCase for utilities
- Folder structure: `src/pages/`, `src/components/`, `src/hooks/`,
  `src/services/`, `src/types/`
- Component pattern: named exports, props interface above component, no
  default exports
- Routing: `react-router-dom` as default (or defer to project's existing
  router)

### T2.2 -- Prompt: `/setup-project`

- [ ] Create `prompts/setup-project.prompt.md`

Slash command that initialises a complete Vite + React + FDS project:

1. Scaffold a Vite React-TS project (or detect existing one)
2. Install FDS and peer dependencies
3. Set up `DSThemeProvider` at the app root with a user-chosen theme
4. Load CSS assets (main.css, fonts)
5. Create the canonical folder structure
6. Add a placeholder home page using FDS `Layout` components
7. Configure routing with `react-router-dom`

### T2.3 -- Prompt: `/scaffold-page`

- [ ] Create `prompts/scaffold-page.prompt.md`

Slash command that creates a new page:

- Ask for page name and route path
- Ask for layout type (full-width, sidebar, centred content)
- Scaffold using FDS `Layout` components
- Add route entry
- Create the file

### T2.4 -- Prompt: `/create-form`

- [ ] Create `prompts/create-form.prompt.md`

Slash command that builds a form using FDS form components:

- Field definitions (name, type, validation rules)
- FDS form component mapping (text -> `Form.Input`, dropdown ->
  `Form.Select`, date -> `Form.DateInput`, etc.)
- Client-side validation with error messages using FDS error patterns
- Submit handler skeleton

### T2.5 -- Skill: FDS Theming Guide

- [ ] Create `skills/fds-theming/SKILL.md`

Domain knowledge for theme setup and token usage:

- How to set up `DSThemeProvider` vs `ThemeProvider`
- Available themes and when to use each
- How to access tokens (`Colour`, `Typography`, `MediaQuery`, `Spacing`)
- How to create a custom theme by extending an existing one
- Dark mode setup via `DSThemeProvider` auto mode

---

## Tier 3 -- Enhanced Capabilities

### T3.1 -- Instruction: Accessibility Standards

- [ ] Create `instructions/accessibility-standards.instructions.md`

Applied to `**/*.tsx, **/*.jsx`. Covers:

- WCAG 2.1 AA compliance patterns
- ARIA attributes on interactive elements
- Keyboard navigation support
- Focus management for modals and navigation
- Colour contrast enforcement (via FDS tokens)
- Semantic HTML structure within FDS component usage

### T3.2 -- Prompt: `/create-component`

- [ ] Create `prompts/create-component.prompt.md`

Slash command for scaffolding a reusable component composed from FDS
primitives:

- Component name, props interface
- Which FDS components it wraps or composes
- Optional: Storybook story file alongside it

### T3.3 -- Skill: Project Scaffolding Blueprint

- [ ] Create `skills/project-scaffolding/SKILL.md`

Canonical Vite + React + FDS project skeleton:

- Full folder tree
- Boilerplate files (App.tsx with theme provider, router setup, index.html
  with CSS assets)
- Package.json dependencies list with version ranges
- tsconfig recommendations

---

## Tier 4 -- Polish

### T4.1 -- Update README & Badges

- [ ] Run `bash scripts/update-counts.sh`
- [ ] Update Features section in README.md to document each new prompt,
  instruction, and skill

### T4.2 -- Validation with Configuration Tester

- [ ] Run `[MINE] Copilot Configuration Tester` subagent against the full file
  set to catch ambiguities, conflicts, and broken semantic triggers

---

## Dependency Graph

```
T1.3 (Component Catalog) ─────┐
                               ├──> T1.1 (Primary Agent) ──> T2.2 (/setup-project)
T1.2 (FDS Coding Standards) ──┘                          ──> T2.3 (/scaffold-page)
                                                          ──> T2.4 (/create-form)
T2.1 (React Conventions) ── independent                   ──> T3.2 (/create-component)
T2.5 (Theming Skill) ── feeds into T1.1 and T2.2
T3.1 (Accessibility) ── independent
T3.3 (Scaffolding Blueprint) ── feeds into T2.2
T4.1 (README) ── after everything
T4.2 (Validation) ── after everything
```

**Recommended execution order:**
T1.2 -> T1.3 -> T2.5 -> T1.1 -> T2.1 -> T2.2 -> T2.3 -> T2.4 -> T3.1 ->
T3.2 -> T3.3 -> T4.1 -> T4.2
