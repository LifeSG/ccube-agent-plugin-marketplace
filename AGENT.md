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

The plugin is responsible for authoring and maintaining the following file
types, located at the plugin root:

| File type          | Location         | Purpose                                                                           |
| ------------------ | ---------------- | --------------------------------------------------------------------------------- |
| `.instructions.md` | `instructions/`  | Always-on coding standards that enforce FDS component usage and React conventions |
| `.prompt.md`       | `prompts/`       | Slash-command workflows (e.g. scaffold a page, set up a project, build a form)    |
| `.agent.md`        | `agents/`        | Specialized agents that develop web applications within FDS constraints           |
| `SKILL.md`         | `skills/<name>/` | Domain-knowledge packages — FDS component catalog, theming, project scaffolding   |

<!-- </repo-context> -->

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
