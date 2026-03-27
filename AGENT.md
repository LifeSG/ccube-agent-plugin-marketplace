# AGENT.md

<!-- <project-overview> -->
## Project Overview

This repository is a VS Code chat plugin. Its purpose is to ship a curated set
of GitHub Copilot customization files — agents, instruction files, prompts, and
skills — that are installed into a user's VS Code workspace.

The customization files produced by this plugin turn Copilot into an AI web
application developer that builds React applications strictly following the
[Flagship Design System (FDS)](https://designsystem.life.gov.sg/react/index.html?path=/docs/getting-started-installation--docs)
React library. Every suggestion, scaffold, and code generation must use FDS
components, tokens, and theming patterns exclusively — no raw HTML/CSS
primitives or third-party UI libraries.

<!-- </project-overview> -->

<!-- <repo-context> -->
## Repository Structure

This repository follows a marketplace layout that supports multiple plugins in a
single repo. The top-level structure is:

```
.github/plugin/
  marketplace.json              ← registry listing every plugin in this repo

plugins/
  <plugin-name>/
    README.md                   ← human-readable description of the plugin
    hooks.json                  ← SessionStart hook declaration (Copilot format, plugin root)
    scripts/
      session-telemetry.sh      ← telemetry script fired on each session start
    instructions/
      *.instructions.md         ← always-on coding standards for this plugin
    agents/
      *.agent.md                ← specialized agents for this plugin
    skills/
      <skill-name>/
        SKILL.md                ← domain-knowledge package loaded on match
        ...                     ← supporting files (examples, scripts, etc.)

prompts/                        ← repo-wide slash-command prompt files
```

Each plugin is a self-contained subdirectory under `plugins/`. Skills are
co-located inside their owning plugin under `plugins/<plugin-name>/skills/`.

The file types this repo authors and maintains:

| File type              | Location                               | Purpose                                                                           |
| ---------------------- | -------------------------------------- | --------------------------------------------------------------------------------- |
| `marketplace.json`     | `.github/plugin/`                      | Registry of all plugins; each entry points to a `plugins/<name>` directory        |
| `README.md`            | `plugins/<plugin-name>/`               | Human-readable description and skill inventory for the plugin                     |
| `hooks.json`           | `plugins/<plugin-name>/`               | SessionStart hook declaration (Copilot-format, VS Code auto-detected at root)     |
| `session-telemetry.sh` | `plugins/<plugin-name>/scripts/`       | Shell hook fired on session start; shared contract across all plugins             |
| `.instructions.md`     | `plugins/<plugin-name>/instructions/`  | Always-on coding standards that enforce FDS component usage and React conventions |
| `.agent.md`            | `plugins/<plugin-name>/agents/`        | Specialized agents that develop web applications within FDS constraints           |
| `SKILL.md`             | `plugins/<plugin-name>/skills/<name>/` | Domain-knowledge packages — FDS component catalog, theming, project scaffolding   |
| `.prompt.md`           | `prompts/`                             | Slash-command workflows (e.g. scaffold a page, set up a project, build a form)    |

<!-- </repo-context> -->

<!-- <adding-plugins> -->
## Adding a New Plugin

> **CRITICAL — marketplace registration is MANDATORY**: Every new plugin MUST
> be registered in `.github/plugin/marketplace.json` (Step 6) before the work
> is considered complete. A plugin directory that exists on disk but is absent
> from `marketplace.json` will never load. Do NOT commit a new plugin without
> completing Step 6.
>
> This section is only for creating a **new plugin directory**. If you are
> adding or changing skills, instructions, or agents in an **existing plugin**,
> follow [Updating an Existing Plugin](#updating-an-existing-plugin) instead.

Follow these steps exactly when adding a new plugin to this marketplace.

### Step 0 — Clarify requirements then explore (MANDATORY)

You MUST complete two phases before creating any files.

**Phase A — Gather requirements**: If the plugin name, purpose, or skill
inventory has not been explicitly stated by the user, ask for them now.
Confirm all of the following before proceeding:

- Plugin name (lowercase, hyphen-separated)
- One-sentence description of what the plugin does
- List of skills to include: name and trigger condition for each
- Whether the plugin needs instruction files or agents

Do not invent requirements. Proceed to Phase B only after the user confirms.

**Phase B — Explore existing structure**: You MUST read and understand the
existing plugin layout before writing any files. This prevents deviation from
established naming and front matter conventions.

Execute these reads in order:

1. Read `.github/plugin/marketplace.json` to understand the registry schema
   and how existing plugins are registered.
2. List the `plugins/` directory to see all existing plugin names and layouts.
3. Pick the most complete existing plugin and read its full directory tree,
   including at least one `SKILL.md`, one `.instructions.md`, and one
   `.agent.md` if present.
4. Note the naming patterns, front matter conventions, folder layout, and
   `description` phrasing used in the existing plugin before writing a single
   file for the new one.

Only after completing all four reads should you proceed to Step 1.

### Step 1 — Create the plugin directory

Create the directory `plugins/<plugin-name>/` at the repo root. Use a
lowercase, hyphen-separated name that clearly describes the plugin's purpose
(e.g. `ccube-fds-web-app-builder`).

### Step 1.5 — Add the telemetry hook (MANDATORY)

Every plugin MUST include a telemetry hook at:

```
plugins/<plugin-name>/hooks.json
plugins/<plugin-name>/scripts/session-telemetry.sh
```

Copy `session-telemetry.sh` verbatim from an existing plugin (e.g.
`plugins/ccube-fds-web-app-builder/scripts/session-telemetry.sh`).
Change only the `PLUGIN_NAME` variable at the top to match the new
plugin's name.

> **IMPORTANT — cross-plugin consistency rule**: `session-telemetry.sh`
> is a shared contract. Any change to the script's logic, security
> controls, or behaviour MUST be applied to **every** plugin's copy in
> the same commit. See the [Telemetry](#telemetry) section for the
> full update protocol.

### Step 2 — Add instructions (optional)

For each always-on instruction the plugin enforces, create:

```
plugins/<plugin-name>/instructions/<name>.instructions.md
```

All files in the folder are automatically included. The `"instructions"`
field in this plugin's `marketplace.json` entry will be set to
`"./instructions"`. Do not edit `marketplace.json` now — all registration
is done in Step 6.

### Step 3 — Add agents (optional)

For each specialized agent the plugin provides, create:

```
plugins/<plugin-name>/agents/<name>.agent.md
```

All files in the folder are automatically included. The `"agents"` field in
this plugin's `marketplace.json` entry will be set to `"./agents"`. Do not
edit `marketplace.json` now — all registration is done in Step 6.

### Step 3.5 — Add prompts (optional)

Repo-wide slash-command prompts live at the **repo root** under `prompts/`,
not inside a plugin directory:

```
prompts/<name>.prompt.md
```

Prompt files are NOT registered in `marketplace.json`. Any `.prompt.md` file
placed in `prompts/` is automatically available as a slash command across all
plugins in this repo.

See the Canonical Front Matter Templates section for required fields.

### Step 4 — Add skills

For each skill the plugin provides, create:

```
plugins/<plugin-name>/skills/<skill-name>/SKILL.md
```

Include any supporting files (examples, scripts, references) as subdirectories
alongside `SKILL.md`. The `SKILL.md` body MUST be self-contained — it is only
loaded when matched and must not rely on external files being read first.

> **CRITICAL:** The `name` field in the `SKILL.md` front matter MUST exactly
> match the folder name (e.g. a skill in `skills/cc-vite-react-ds/` MUST have
> `name: "cc-vite-react-ds"`). A mismatch will cause the skill to fail to load.

### Step 5 — Add a README

Create `plugins/<plugin-name>/README.md` that describes:

- What the plugin does in one or two sentences.
- A `## Skills` section listing each skill name with a brief description of
  when it activates and what it provides.
- Optionally a `## Instructions` and `## Agents` section if the plugin
  includes those file types.

Use the existing plugin's README as your structural reference. Read
`plugins/ccube-fds-web-app-builder/README.md` to see the expected level of
detail, tone, and section layout before writing.

### Step 6 — Register in marketplace.json (MANDATORY)

Open `.github/plugin/marketplace.json` and append a new entry to the
`"plugins"` array:

```json
{
  "name": "<plugin-name>",
  "source": "./plugins/<plugin-name>",
  "description": "<one-sentence description>",
  "version": "1.0.0",
  "skills": [
    "./skills/<skill-name>"
  ],
  "instructions": "./instructions",
  "agents": "./agents"
}
```

- `"source"` is resolved from the **repository root by the marketplace
  loader**, not relative to `marketplace.json` itself. The value MUST start
  with `./` (e.g. `"./plugins/ccube-fds-web-app-builder"` is correct;
  omitting `./` will break resolution).
- All other paths (`"skills"`, `"instructions"`, `"agents"`) are relative to
  the plugin's `"source"` directory.
- `"instructions"` and `"agents"` point to their respective folders; all files
  within are automatically included.
- Omit `"instructions"` or `"agents"` if the plugin has none.
- New plugins MUST start at `"version": "1.0.0"`.
- Increment `"version"` using semantic versioning when updating an existing
  plugin.

### Acceptance checks for a new plugin

Before committing, verify:

1. `plugins/<plugin-name>/` exists with at least one
   `skills/<name>/SKILL.md`.
2. `plugins/<plugin-name>/hooks.json` and
   `plugins/<plugin-name>/scripts/session-telemetry.sh` both exist,
   and the script's `PLUGIN_NAME` variable matches the plugin's
   directory name.
3. `plugins/<plugin-name>/README.md` exists and lists all skills (and
   any instructions or agents).
4. The plugin entry is present in `.github/plugin/marketplace.json`
   with correct paths, AND every subdirectory under
   `plugins/<plugin-name>/skills/` has a corresponding entry in the
   `"skills"` array. An unregistered skill folder will silently fail
   to load.
5. All `SKILL.md` files pass the standard front matter and content
   checks listed in the
   [Acceptance Checks](#acceptance-checks-for-new-customization-files)
   section below.

<!-- </adding-plugins> -->

<!-- <updating-existing-plugin> -->
## Updating an Existing Plugin

Use this workflow when the plugin already exists and you are adding,
renaming, or removing skills, instruction files, or agent files.

> **CRITICAL — this is independent of new-plugin creation**: You MUST update
> `.github/plugin/marketplace.json` for existing-plugin capability changes even
> when no new plugin directory is being created.

### Step U1 — Make file changes in the existing plugin

Add, rename, or remove files under:

- `plugins/<plugin-name>/skills/`
- `plugins/<plugin-name>/instructions/`
- `plugins/<plugin-name>/agents/`

### Step U2 — Sync marketplace.json (MANDATORY)

Open `.github/plugin/marketplace.json` and update the existing plugin entry:

- Ensure every skill folder under `plugins/<plugin-name>/skills/` appears in
  the plugin's `"skills"` array.
- If an `instructions/` folder is added or removed, add or remove the
  `"instructions"` field accordingly.
- If an `agents/` folder is added or removed, add or remove the `"agents"`
  field accordingly.

### Step U3 — Bump plugin version (MANDATORY)

Increment the existing plugin's `"version"` using semantic versioning whenever
`marketplace.json` changes.

- `patch` for metadata-only corrections
- `minor` for additive capability changes (e.g., new skill)
- `major` for breaking changes

### Step U4 — Verify before commit

Before committing, verify:

1. `marketplace.json` matches the on-disk skill folders exactly.
2. `"instructions"` and `"agents"` fields match folder existence.
3. The plugin version was bumped correctly for the change type.

Reasoning: Existing-plugin changes can silently fail to load if
`marketplace.json` is not updated. This workflow prevents that drift even when
no new plugin is being created.

<!-- </updating-existing-plugin> -->

<!-- <authoring-rules> -->
## Rules for Authoring Customization Files

When creating or editing any customization file in this plugin, you MUST follow
these rules:

### Target audience

- You MUST write instructions, prompts, and skill guidance that are clear to
  users with varying technical backgrounds — from non-developers to experienced
  engineers.
- You MUST use plain language: avoid unexplained jargon, prefer concrete
  examples over abstract descriptions.
- You MUST include "why" reasoning behind any significant rule, so the end
  user's AI makes better decisions in edge cases.

### FDS alignment

- Every customization file you author MUST assume the consuming workspace uses
  the Flagship Design System React library (`@lifesg/react-design-system`).
- Instructions and skills MUST enforce exclusive use of FDS components, tokens,
  and theming patterns. The AI MUST NOT fall back to raw HTML/CSS primitives
  or third-party UI libraries.
- Web application concerns (routing, state management, API integration, form
  handling) MUST be addressed through the lens of FDS-compliant implementation
  — e.g. forms use FDS `Form` components, layouts use FDS `Layout` components.
- When referencing FDS setup, use the canonical documentation at:
  <https://designsystem.life.gov.sg/react/index.html?path=/docs/getting-started-installation--docs>

### File quality standards

- YAML front matter MUST be valid (quote strings that contain colons, use
  spaces not tabs, include `---` delimiters).
- `description` fields MUST use the "Use when: ..." pattern and contain
  specific trigger keywords so semantic matching works correctly.
- `applyTo` patterns in `.instructions.md` files MUST be as specific as
  possible; avoid `**` unless the instruction is truly universal.
- Prompt files MUST declare the correct `agent` mode (`ask`, `agent`, or
  `plan`).
- Skill `SKILL.md` bodies MUST be self-contained and complete — they are only
  loaded when matched, so they must not rely on external files being read
  first.
- The `name` field in a `SKILL.md` front matter MUST exactly match its
  containing folder name. This is required for the skill to be correctly
  identified and loaded (e.g. folder `cc-vite-react-ds/` → `name: "cc-vite-react-ds"`).
  A mismatch will silently prevent the skill from being invoked.

### File operations

- You MUST use VS Code built-in tools (create file, edit file, read file) for
  all file reads and writes.
- You MUST NOT use the terminal or shell commands to create, read, modify, or
  delete files.
- To read a file in full, use the built-in read file tool with `startLine: 1`
  and a sufficiently large `endLine` (e.g. 9999) — do not shell out to `cat`
  or similar commands.
- To inspect a file without knowing its length, read a large range first; the
  tool will return only the lines that exist.

Reasoning: Using VS Code built-in tools keeps file operations visible,
reversible, and consistent with the editor's undo history. Terminal-based file
reads and writes bypass these safeguards, can silently overwrite work, and may
fail unpredictably across operating systems (e.g. `cat -A` behaves differently
on macOS vs Linux).

### Marketplace sync

- You MUST update `.github/plugin/marketplace.json` whenever you **create a
  new plugin directory** or whenever you add, rename, or remove a skill
  folder, instructions folder, or agents folder in any existing plugin.
- The `"skills"` array in each plugin entry MUST exactly reflect the
  subdirectories present under `plugins/<plugin-name>/skills/`. An
  unregistered skill folder will silently fail to load with no error message.
- When adding or removing an `instructions/` or `agents/` folder, update the
  corresponding `"instructions"` or `"agents"` field in `marketplace.json`.
  Omit the field entirely when the folder does not exist.
- Increment the plugin `"version"` using semantic versioning for every change
  to `marketplace.json`.

Reasoning: `marketplace.json` is the single source of truth for what each
plugin exposes. Files that exist on disk but are not registered will load
silently with no diagnostic — keeping the registry in sync is the only
reliable way to catch drift.

### Content boundaries

- Customization files MUST NOT contain platform-agnostic general programming
  tutorials unrelated to building FDS-compliant web applications.
- Web application patterns (routing, state, API integration, testing) MUST be
  covered when they are necessary for building complete FDS applications, but
  always framed within FDS conventions.
- Each file MUST have a single, focused purpose. Split concerns into separate
  files rather than combining them.
- Instructions files MUST skip conventions already enforced by standard linters
  or formatters.

<!-- </authoring-rules> -->

<!-- <file-templates> -->
## Canonical Front Matter Templates

### `.instructions.md`

```markdown
---
name: 'Short Display Name'
description: 'Use when: <specific trigger phrase>. Applies <what it enforces>.'
applyTo: '**/*.tsx, **/*.jsx'
---
```

The `**/*.tsx, **/*.jsx` pattern is appropriate for FDS instructions because
FDS rules apply to all React component files regardless of directory depth.
For instructions scoped to a specific folder, use a more specific pattern
(e.g. `src/components/**/*.tsx`).

### `.prompt.md`

```markdown
---
name: 'Prompt Name'
description: 'Short description of what this prompt does.'
agent: agent
---
```

The `agent` field is required. Choose the correct mode: `ask` (chat only, no
file edits), `agent` (full agentic mode, can read and write files), or `plan`
(shows a plan for user confirmation before acting). Default to `agent` for
most FDS workflow prompts.

### `.agent.md`

```markdown
---
name: 'Agent Name'
description: 'Use when: <trigger>. Specializes in <domain>.'
---
```

The `tools` field is optional. Omit it to allow all available tools, or
declare a restricted list to scope the agent's capabilities and prevent
unintended actions (e.g. `tools: [readFile, codebase]`). Common tool names:
`readFile`, `createFile`, `editFile`, `codebase`, `search`, `runCommand`,
`fetch`.

### `SKILL.md`

```markdown
---
name: skill-name
description: 'Use when: <trigger>. Provides <what the skill does>.'
user-invocable: false
---
```

Set `user-invocable: false` when the skill should only activate automatically
via semantic matching and not appear in the skill picker list. Set `true` or
omit to allow manual invocation.

The `argument-hint` field is optional. Add it to display hint text in the
chat input when the skill is invoked. Example:
`argument-hint: 'Describe the component or page to build'`.

<!-- </file-templates> -->

<!-- <fds-reference> -->
## FDS Reference Points for Customization Authors

When writing instructions or skills that reference FDS, use these as
authoritative anchor points:

- Installation: `npm i @lifesg/react-design-system` plus peer deps
  (`styled-components`, `@lifesg/react-icons`, `@floating-ui/react`)
- CSS assets: load `main.css` and font stylesheet in the HTML head or global
  CSS file
- Default theme: `LifeSGTheme` from `@lifesg/react-design-system/theme`
- Theme provider: `DSThemeProvider` (supports auto dark mode) or
  `ThemeProvider` (baseline)
- Available themes: `LifeSGTheme`, `CCubeTheme`, `BookingSGTheme`, `PATheme`,
  `IMDATheme`, `SPFTheme`, and others
- Design tokens: import `Colour`, `Typography`, etc. from
  `@lifesg/react-design-system/theme`
- Full docs: <https://designsystem.life.gov.sg/react/>

Do not reproduce FDS documentation verbatim inside customization files.
Instead, link to the relevant Storybook page and provide concise usage notes.

<!-- </fds-reference> -->

<!-- <fds-v4-migration> -->
## FDS v4 Migration Checklist

> **Status (as of 2026-03)**: `@lifesg/react-design-system` v4 is in alpha
> (`4.0.0-alpha.1` is the current `latest` npm tag). All skills and scripts
> are intentionally pinned to `^3` until v4 reaches a stable release.

When v4 reaches stable, a maintainer MUST complete all steps below before
removing the version pins. Do not partially migrate — the skill and script
pins must be updated atomically with the `resources-v4/` folder population.

### v4 breaking changes (known at time of pin)

| Area               | v3                                          | v4                                                |
| ------------------ | ------------------------------------------- | ------------------------------------------------- |
| Peer dependency    | `styled-components` required                | `styled-components` removed — no peer dep needed  |
| Theme provider API | `<ThemeProvider>` accepts a theme object    | `<ThemeProvider theme="lifesg">` accepts a string |
| CSS import         | `main.css` loaded from package root         | Import `theme/styles/lifesg.css` from the package |
| Available at       | `designsystem.life.gov.sg/react/index.html` | `designsystem.life.gov.sg/react/v4/index.html`    |

### Migration steps

#### Step 1 — Populate `resources-v4/` in the `cc-design-system` skill

1. Create the folder
   `plugins/ccube-fds-web-app-builder/skills/cc-design-system/resources-v4/`.
2. Re-source and write `resources-v4/theme-setup.md` from the v4 Storybook
   installation page at
   <https://designsystem.life.gov.sg/react/v4/index.html?path=/docs/getting-started-installation--docs>.
   Document the new `<ThemeProvider theme="lifesg">` API and the new CSS
   import path.
3. Populate additional catalogue files under `resources-v4/` as needed,
   following the same naming convention as `resources/`.

#### Step 2 — Update the Version Context routing rule in `cc-design-system/SKILL.md`

In `plugins/ccube-fds-web-app-builder/skills/cc-design-system/SKILL.md`,
update the Version Context section so that `^4.x` projects are routed to
`resources-v4/` rather than showing a "not yet populated" warning:

```markdown
2. If the installed version is `^3.x` → use `resources/` and the v3
   Storybook URL.
3. If the installed version is `^4.x` → use `resources-v4/` and the v4
   Storybook at https://designsystem.life.gov.sg/react/v4/index.html.
   Do NOT use v3 resources for v4 projects.
```

Also update the version table to reflect v4's stable status.

#### Step 3 — Remove the `@^3` pin from `cc-vite-react-ds/SKILL.md`

In `plugins/ccube-fds-web-app-builder/skills/cc-vite-react-ds/SKILL.md`,
update the Manual Setup Step 2 install command:

```bash
# Remove the @^3 pin — v4 is now stable.
npm install @lifesg/react-design-system @lifesg/react-icons
# styled-components is no longer a peer dependency in v4.
```

Remove the comment block that explained the v4 alpha rationale.

#### Step 4 — Remove the `@^3` pin from `init-vite-react-project.sh`

In `plugins/ccube-fds-web-app-builder/skills/cc-vite-react-ds/scripts/init-vite-react-project.sh`,
update the install line that pins to `@^3` and remove the explanatory comment.

#### Step 5 — Update `theme-setup.md` in `resources/` (v3 resource)

No change needed — the existing `resources/theme-setup.md` remains the
authoritative reference for v3 projects. Do NOT modify it during v4 migration.

#### Step 6 — Verify and commit

Before committing:

1. Run the `init-vite-react-project.sh` script against a temp directory and
   confirm it installs the expected v4 stable version.
2. Confirm `npm ls @lifesg/react-design-system` in the created project shows
   a `4.x` version.
3. Confirm the dev server starts cleanly (`npm run dev`) with no
   `styled-components` or `ThemeProvider` errors.
4. Confirm both `cc-design-system/SKILL.md` version tables no longer describe
   v4 as alpha.

Commit all changed files atomically. Increment all affected plugin versions
in `.github/plugin/marketplace.json`.

<!-- </fds-v4-migration> -->

<!-- <telemetry> -->
## Telemetry

Every plugin ships an identical telemetry hook at
`hooks/scripts/session-telemetry.sh`. The only intentional difference
between copies is the `PLUGIN_NAME` variable at the top of each file.

The hook is responsible for:

- Firing a `session_start` event to the configured telemetry endpoint
  when a session begins.
- Firing a one-time `install` event the first time a plugin is used
  on a machine.
- Generating and persisting an anonymous, per-machine installation ID
  in `~/.ccube/telemetry-id`.

### Cross-plugin update protocol

Because all copies of `session-telemetry.sh` must stay in sync, you
MUST follow this protocol whenever the script changes:

1. **Identify all copies.** Locate every
   `plugins/*/hooks/scripts/session-telemetry.sh` file in the repo.
2. **Apply the change to every copy.** The same logical change MUST
   appear in all copies in the same commit. Partial updates — where
   one plugin's copy differs in logic, security controls, or
   behaviour from another's — are not acceptable.
3. **Preserve per-plugin identity.** The only value that MUST differ
   between copies is `PLUGIN_NAME`. Do not change it when syncing.
4. **Run a quick sanity check.** After editing, compare the files
   (excluding the `PLUGIN_NAME` line) and confirm they are identical:

   ```bash
   diff \
     <(grep -v PLUGIN_NAME \
         plugins/ccube-fds-web-app-builder/hooks/scripts/session-telemetry.sh) \
     <(grep -v PLUGIN_NAME \
         plugins/ccube-software-craft/hooks/scripts/session-telemetry.sh)
   ```

   The diff MUST produce no output.
5. **Stage all copies together.** Commit all changed telemetry files
   as a single atomic commit so the repo is never in an inconsistent
   state.

### Endpoint and opt-out

- The default endpoint (`CCUBE_TELEMETRY_ENDPOINT`) is set at the top
  of the script. Replace the placeholder URL with a self-hosted
  endpoint before shipping to production.
- Users can opt out by setting `CCUBE_TELEMETRY_DISABLED=1` in their
  shell profile.
- All endpoints MUST use HTTPS. The script enforces this and will
  exit silently if a non-HTTPS URL is supplied.

### Privacy contract

The script collects only:

- A random, anonymous, per-machine installation ID (no PII).
- The plugin name and agent name (from stdin, sanitised to
  `[a-zA-Z0-9_-]` before use).
- A UTC timestamp.

No file contents, workspace paths, user identifiers, or environment
variables are ever collected or transmitted.

<!-- </telemetry> -->

<!-- <acceptance-checks> -->
## Acceptance Checks for New Customization Files

Before committing a new or updated customization file, verify:

1. Front matter is valid YAML and all required fields are present.
2. `description` contains concrete trigger phrases for reliable semantic
   matching. A concrete trigger phrase names the user's stated goal or the
   artefact being worked on. Good: `"Use when: user asks to scaffold a new
   Vite + React project"`. Bad: `"Helps with React setup"` — too vague,
   will not reliably match.
3. Language is clear enough for users with varying technical backgrounds to
   follow without reference to external documentation during the task.
4. FDS references point to official documentation links, not inline
   reproductions of docs.
5. Scope is focused — one file, one concern.
6. No instructions duplicate what a linter, formatter, or TypeScript already
   enforces.
7. `.github/plugin/marketplace.json` accurately reflects the current state of
   the plugin — every skill folder under `plugins/<plugin-name>/skills/` has
   a corresponding entry in the `"skills"` array, and `"instructions"` /
   `"agents"` fields are present only if the corresponding folders exist.

<!-- </acceptance-checks> -->
