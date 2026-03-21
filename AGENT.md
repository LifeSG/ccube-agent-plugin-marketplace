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

| File type          | Location                               | Purpose                                                                           |
| ------------------ | -------------------------------------- | --------------------------------------------------------------------------------- |
| `marketplace.json` | `.github/plugin/`                      | Registry of all plugins; each entry points to a `plugins/<name>` directory        |
| `README.md`        | `plugins/<plugin-name>/`               | Human-readable description and skill inventory for the plugin                     |
| `.instructions.md` | `plugins/<plugin-name>/instructions/`  | Always-on coding standards that enforce FDS component usage and React conventions |
| `.agent.md`        | `plugins/<plugin-name>/agents/`        | Specialized agents that develop web applications within FDS constraints           |
| `SKILL.md`         | `plugins/<plugin-name>/skills/<name>/` | Domain-knowledge packages — FDS component catalog, theming, project scaffolding   |
| `.prompt.md`       | `prompts/`                             | Slash-command workflows (e.g. scaffold a page, set up a project, build a form)    |

<!-- </repo-context> -->

<!-- <adding-plugins> -->
## Adding a New Plugin

Follow these steps exactly when adding a new plugin to this marketplace.

### Step 1 — Create the plugin directory

Create the directory `plugins/<plugin-name>/` at the repo root. Use a
lowercase, hyphen-separated name that clearly describes the plugin's purpose
(e.g. `ccube-fds-web-app-builder`).

### Step 2 — Add instructions (optional)

For each always-on instruction the plugin enforces, create:

```
plugins/<plugin-name>/instructions/<name>.instructions.md
```

All files in the folder are automatically included. Register the folder in `marketplace.json`:

```json
"instructions": "./instructions"
```

### Step 3 — Add agents (optional)

For each specialized agent the plugin provides, create:

```
plugins/<plugin-name>/agents/<name>.agent.md
```

All files in the folder are automatically included. Register the folder in `marketplace.json`:

```json
"agents": "./agents"
```

### Step 4 — Add skills

For each skill the plugin provides, create:

```
plugins/<plugin-name>/skills/<skill-name>/SKILL.md
```

Include any supporting files (examples, scripts, references) as subdirectories
alongside `SKILL.md`. The `SKILL.md` body MUST be self-contained — it is only
loaded when matched and must not rely on external files being read first.

### Step 5 — Add a README

Create `plugins/<plugin-name>/README.md` that describes:

- What the plugin does in one or two sentences.
- A `## Skills` section listing each skill name with a brief description of
  when it activates and what it provides.
- Optionally a `## Instructions` and `## Agents` section if the plugin
  includes those file types.

### Step 6 — Register in marketplace.json

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

- `"source"` MUST be a path relative to the repo root pointing to the plugin
  directory.
- All paths are relative to the plugin's `source` directory.
- `"instructions"` and `"agents"` point to their respective folders; all files
  within are automatically included.
- Omit `"instructions"` or `"agents"` if the plugin has none.
- Increment `"version"` using semantic versioning when updating an existing
  plugin.

### Acceptance checks for a new plugin

Before committing, verify:

1. `plugins/<plugin-name>/` exists with at least one `skills/<name>/SKILL.md`.
2. `plugins/<plugin-name>/README.md` exists and lists all skills (and any
   instructions or agents).
3. The plugin entry is present in `.github/plugin/marketplace.json` with
   correct `"source"`, `"skills"`, `"instructions"`, and `"agents"` paths.
4. All `SKILL.md` files pass the standard front matter and content checks
   listed in the [Acceptance Checks](#acceptance-checks-for-new-customization-files)
   section below.

<!-- </adding-plugins> -->

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
applyTo: '**/*.tsx'
---
```

### `.prompt.md`

```markdown
---
name: 'Prompt Name'
description: 'Short description of what this prompt does.'
agent: agent
---
```

### `.agent.md`

```markdown
---
name: 'Agent Name'
description: 'Use when: <trigger>. Specializes in <domain>.'
tools: [readFile, createFile, codebase]
---
```

### `SKILL.md`

```markdown
---
name: skill-name
description: 'Use when: <trigger>. Provides <what the skill does>.'
---
```

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

<!-- <acceptance-checks> -->
## Acceptance Checks for New Customization Files

Before committing a new or updated customization file, verify:

1. Front matter is valid YAML and all required fields are present.
2. `description` contains concrete trigger phrases for reliable semantic
   matching.
3. Language is clear enough for users with varying technical backgrounds to
   follow without external help.
4. FDS references point to official documentation links, not inline
   reproductions of docs.
5. Scope is focused — one file, one concern.
6. No instructions duplicate what a linter, formatter, or TypeScript already
   enforces.

<!-- </acceptance-checks> -->
