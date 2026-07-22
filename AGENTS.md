# AGENTS.md

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

This plugin also ships a code review capability: a set of specialized agents
and the `cc-review-mr` / `cc-code-review` skills that guide agents through
structured MR reviews covering architecture, security, business context,
production readiness, and code standards.

<!-- </project-overview> -->

<!-- <repo-context> -->
## Repository Structure

This repository follows a marketplace layout that supports multiple plugins in a
single repo. The top-level structure is:

```
.github/plugin/
  marketplace.json              ← VS Code marketplace registry

.claude-plugin/
  marketplace.json              ← Claude Code marketplace catalog (lists all plugins for /plugin marketplace add)

plugins/
  <plugin-name>/
    plugin.json                 ← Copilot plugin manifest (skills, agents, hooks — bump version on every capability change)
    .claude-plugin/
      plugin.json               ← Claude Code plugin manifest (bump version on every capability change)
    README.md                   ← human-readable description of the plugin
    hooks.json                  ← SessionStart + SubagentStart hook declarations (Copilot format, plugin root)
    docs/                       ← optional: supporting documentation for this plugin
    scripts/
      session-telemetry.sh      ← telemetry script fired on session start and subagent start
      validate-*.sh             ← optional: agent validation scripts
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

| File type                        | Location                                | Purpose                                                                                                            |
| -------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `marketplace.json`               | `.github/plugin/`                       | Registry of all plugins; each entry points to a `plugins/<name>` directory                                         |
| `README.md`                      | `plugins/<plugin-name>/`                | Human-readable description and skill inventory for the plugin                                                      |
| `plugin.json`                    | `plugins/<plugin-name>/`                | **Copilot** plugin manifest; declares `skills`, `agents`, `hooks` paths; bump `version` on every capability change |
| `hooks.json`                     | `plugins/<plugin-name>/`                | SessionStart + SubagentStart hook declarations (Copilot-format, VS Code auto-detected at root)                     |
| `session-telemetry.sh`           | `plugins/<plugin-name>/scripts/`        | Shell hook fired on session start and subagent start; shared contract across all plugins                           |
| `.instructions.md`               | `plugins/<plugin-name>/instructions/`   | Always-on coding standards that enforce FDS component usage and React conventions                                  |
| `.agent.md`                      | `plugins/<plugin-name>/agents/`         | Specialized agents that develop web applications within FDS constraints                                            |
| `SKILL.md`                       | `plugins/<plugin-name>/skills/<name>/`  | Domain-knowledge packages — FDS component catalog, theming, project scaffolding                                    |
| `.prompt.md`                     | `prompts/`                              | Slash-command workflows (e.g. scaffold a page, set up a project, build a form)                                     |
| `marketplace.json` (Claude Code) | `.claude-plugin/`                       | Claude Code marketplace catalog; lists plugins for `/plugin marketplace add`                                       |
| `plugin.json` (Claude Code)      | `plugins/<plugin-name>/.claude-plugin/` | **Claude Code** plugin manifest; bump `version` on every capability change                                         |

<!-- </repo-context> -->

<!-- <dual-platform> -->
## Dual-Platform Development

This repository ships customization files that must work correctly on **both**
GitHub Copilot (VS Code) and **Claude Code**. You MUST design every capability
you add or change with both platforms in mind.

### Platform discovery rules

| File type                   | GitHub Copilot discovers via                                                  | Claude Code discovers via                               |
| --------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------- |
| Always-on repo instructions | `AGENTS.md` (this file), `.github/copilot-instructions.md`                    | `AGENTS.md` (this file), `CLAUDE.md`                    |
| Plugin manifest             | `.github/plugin/marketplace.json`                                             | `.claude-plugin/marketplace.json`                       |
| Plugin definition           | `plugins/<name>/hooks.json` (Copilot format, auto-detected)                   | `plugins/<name>/.claude-plugin/plugin.json`             |
| Skills                      | Registered via `"skills"` directory path in `.github/plugin/marketplace.json` | Auto-discovered from `plugins/<name>/skills/*/SKILL.md` |
| Agents                      | Registered in `.github/plugin/marketplace.json` `"agents"` field              | Auto-discovered from `plugins/<name>/agents/*.agent.md` |
| Hooks                       | `plugins/<name>/hooks.json`                                                   | `.claude/settings.json` hooks block                     |

### Rules for dual-platform compatibility

- Every new skill, agent, or instruction file MUST be verified for correct
  discovery on both platforms before the task is considered complete.
- When adding a new plugin capability, you MUST:
  1. Register it in `.github/plugin/marketplace.json` (Copilot requirement).
  2. Bump the `"version"` in `plugins/<name>/.claude-plugin/plugin.json`
     (Claude Code update signal).
- When authoring a `SKILL.md` or `.agent.md`, you MUST NOT use platform-specific
  syntax or tool references that only resolve on one platform. Use portable
  Markdown and standard `#tool:<name>` references.
- Hooks are platform-specific by mechanism, but MUST be kept behaviourally
  in sync: Copilot hooks live in `plugins/<name>/hooks.json`; Claude Code
  hooks live in `.claude/settings.json`. When the underlying action they
  trigger changes, update both.
- YAML front matter MUST be valid for both platforms. When a field is supported
  by only one platform, document the asymmetry inline.

Reasoning: Shipping files that silently fail on one platform erodes trust and
creates a two-tier experience for users on different editors. Dual-platform
validation at authoring time is cheaper than diagnosing silent failures after
release. [CRITICAL]

<!-- </dual-platform> -->

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
(e.g. `wai`).

### Step 1.5 — Add the telemetry hook (MANDATORY)

Every plugin MUST include a telemetry hook at:

```
plugins/<plugin-name>/hooks.json
plugins/<plugin-name>/scripts/session-telemetry.sh
```

`hooks.json` MUST declare both `SessionStart` and `SubagentStart` events,
each calling `session-telemetry.sh`.

Copy `session-telemetry.sh` verbatim from an existing plugin (e.g.
`plugins/wai/scripts/session-telemetry.sh`).
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

> **Note — skills are directory-discovered:** The `"skills"` field in
> `marketplace.json` points to the skills directory (e.g. `"./skills"`). The
> loader discovers all skill folders within it automatically. You MUST ensure
> the skills directory path in `marketplace.json` is correct, but you do NOT
> need to list individual skill folders. For new plugins, verify this in Step 6.
> For existing plugins, follow the
> [Updating an Existing Plugin](#updating-an-existing-plugin) workflow instead.

### Step 5 — Add a README

Create `plugins/<plugin-name>/README.md` that describes:

- What the plugin does in one or two sentences.
- A `## Skills` section listing each skill name with a brief description of
  when it activates and what it provides.
- Optionally a `## Instructions` and `## Agents` section if the plugin
  includes those file types.

Use the existing plugin's README as your structural reference. Read
`plugins/wai/README.md` to see the expected level of
detail, tone, and section layout before writing.

### Step 5.5 — Update the root README (MANDATORY)

Open `README.md` at the repository root and add a row for the new plugin to
the `## Plugins` table:

```markdown
| [<plugin-name>](plugins/<plugin-name>/) | <one-sentence description> |
```

Use the `"description"` value from the plugin's `marketplace.json` entry as
the source of truth for the description text.

Do NOT update the `Plugins` badge count manually — the pre-commit hook
updates it automatically on the next commit.

Reasoning: The root `README.md` is the first thing contributors and users
read. A table that omits a plugin creates the false impression that the plugin
does not exist.

### Step 5.6 — Add Agents and Skills badges to the plugin README (MANDATORY)

The plugin's own `README.md` (created in Step 5) MUST include `Agents-N` and
`Skills-N` badges so the pre-commit hook can keep them in sync. Add a badge
block after the title or subtitle:

```html
<p align="center">
  <img src="https://img.shields.io/badge/Agents-0-555?style=for-the-badge&logo=githubactions&logoColor=white&labelColor=274183" alt="Agents">
  <img src="https://img.shields.io/badge/Skills-0-555?style=for-the-badge&logo=lightning&logoColor=white&labelColor=F6C063" alt="Skills">
</p>
```

The placeholder counts (`0`) will be corrected automatically on the next
commit by `scripts/update-counts.sh`.

### Step 5.7 — Verify pre-commit badge staging coverage (MANDATORY)

When a new plugin is added, you MUST verify that the pre-commit workflow
includes badge updates for both:

- `README.md` at the repository root, and
- `plugins/*/README.md` for plugin badge counts.

Required checks:

1. Read `.githooks/pre-commit` and confirm it stages plugin README files
  (not only root `README.md`).
2. Run the pre-commit hook once (`bash .githooks/pre-commit`) and confirm no
  badge-related README changes remain unstaged.

If plugin README badge updates are left unstaged, you MUST update
`.githooks/pre-commit` in the same change before committing.

### Step 6 — Register in marketplace.json (MANDATORY)

Open `.github/plugin/marketplace.json` and append a new entry to the
`"plugins"` array:

```json
{
  "name": "<plugin-name>",
  "source": "./plugins/<plugin-name>",
  "description": "<one-sentence description>",
  "version": "1.0.0",
  "skills": "./skills",
  "agents": "./agents",
  "hooks": "./hooks.json"
}
```

- `"source"` is resolved from the **repository root by the marketplace
  loader**, not relative to `marketplace.json` itself. The value MUST start
  with `./` (e.g. `"./plugins/wai"` is correct;
  omitting `./` will break resolution).
- `"skills"` is a **path to the skills directory**, not an array. The loader
  discovers all skill folders within that directory automatically.
- `"agents"` and `"instructions"` point to their respective folders; all files
  within are automatically included.
- `"hooks"` points to the plugin's `hooks.json` file.
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
   the script's `PLUGIN_NAME` variable matches the plugin's
   directory name, and `hooks.json` declares both `SessionStart` and
   `SubagentStart` events.
3. `plugins/<plugin-name>/README.md` exists and lists all skills (and
   any instructions or agents).
4. The plugin entry is present in `.github/plugin/marketplace.json`
   with `"skills"` pointing to the skills directory, `"hooks"` pointing
   to `hooks.json`, and `"agents"` / `"instructions"` set if those folders
   exist.
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

> **CRITICAL — new SKILL.md requires marketplace.json registration (Step U2).** Creating the
> file is only half the work. You MUST complete Step U2 immediately after creating any new
> skill folder. An unregistered `SKILL.md` silently fails to load with no VS Code diagnostic.

### Step U1.5 — Update the plugin's own README (MANDATORY)

Open `plugins/<plugin-name>/README.md` and update it to reflect every
change made in Step U1:

- **New skill added**: Add a `### <skill-name>` entry under `## Skills`
  describing what it does and when it activates. Use the same format as
  the adjacent skill entries.
- **Skill renamed or removed**: Update or delete the corresponding
  `### <skill-name>` entry.
- **New agent added**: Add a `### <Agent Name>` entry under `## Agents`
  with a one-paragraph description and example prompts.
- **Agent renamed or removed**: Update or delete the corresponding
  `### <Agent Name>` entry.
- **Instructions added or removed**: Update the `## What Gets Installed`
  table row for `.instructions.md` to reflect whether the folder now
  exists or not.

Do NOT edit the `Agents-N` or `Skills-N` badge counts manually — the
pre-commit hook updates them automatically.

Reasoning: The plugin README is the first thing a user reads after
installing. A README that does not reflect what is actually installed
leads to confusion and missed features.

### Step U2 — Sync marketplace.json (MANDATORY)

Open `.github/plugin/marketplace.json` and update the existing plugin entry:

- Confirm `"skills"` points to the skills directory (e.g. `"./skills"`). The
  loader auto-discovers all skill folders within it — no per-skill entries are
  needed.
- If an `instructions/` folder is added or removed, add or remove the
  `"instructions"` field accordingly.
- If an `agents/` folder is added or removed, add or remove the `"agents"`
  field accordingly.
- Confirm `"hooks": "./hooks.json"` is present.

**Self-verification (MANDATORY):** After saving `marketplace.json`, read it back
and confirm the `"skills"` path resolves to the directory that contains the
skill folders, and that `"hooks"` is present. Do NOT mark the task complete
until this check passes.

> **Claude Code:** Skills under `plugins/<plugin-name>/skills/` and agents under
> `plugins/<plugin-name>/agents/` are auto-discovered — no changes to
> `.claude-plugin/marketplace.json` are needed when adding or removing skills or
> agents. Proceed to Step U3 to run the release script.

### Step U3 — Release the plugin (MANDATORY)

Choose the correct semantic version increment:

- `patch` — metadata-only corrections or bug fixes
- `minor` — additive capability changes (e.g., new skill, new agent)
- `major` — breaking changes

Run the release script from the repository root:

```bash
./scripts/release.sh <plugin-name> <version>
# Example:
./scripts/release.sh wai 1.6.0
```

You MUST NOT manually edit `plugin.json` or any `marketplace.json` file to
bump a version — always use the release script. [CRITICAL]

> **Prerequisite:** The working tree must be clean (no uncommitted changes)
> before running the script. Commit or stash all in-progress work first.

### Step U3.5 — Update the root README if the description or plugin set changed

If you renamed, removed, or updated the description of the plugin in
`marketplace.json`, open `README.md` at the repository root and update the
corresponding row in the `## Plugins` table to match. If a plugin was removed,
delete its row and decrement the `Plugins` badge count.

Reasoning: The root `README.md` is the authoritative plugin listing for
contributors and users. Keeping it in sync with `marketplace.json` prevents
stale or missing entries.

### Step U4 — Verify before release

Before running the release script, verify:

1. `marketplace.json` `"skills"` path points to the skills directory and
   `"hooks"` points to `hooks.json`.
2. `"instructions"` and `"agents"` fields match folder existence.
3. The plugin's own `README.md` lists every skill and agent currently
   present on disk — no entry is missing, stale, or references a
   removed file.
4. Running `bash .githooks/pre-commit` does not leave badge-related README
   edits unstaged.
5. The working tree is clean — all file changes are committed before
   invoking `./scripts/release.sh`.

The release script handles version bumping across all four manifests and
the `CHANGELOG.md` update automatically. Do NOT edit those files manually
before running it.

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

### FDS alignment (for web application skills and agents)

- Customization files authored for web application development MUST assume the
  consuming workspace uses the Flagship Design System React library
  (`@lifesg/react-design-system`).
- Instructions and skills targeting frontend development MUST enforce exclusive
  use of FDS components, tokens, and theming patterns. The AI MUST NOT fall
  back to raw HTML/CSS primitives or third-party UI libraries.
- Web application concerns (routing, state management, API integration, form
  handling) MUST be addressed through the lens of FDS-compliant implementation
  — e.g. forms use FDS `Form` components, layouts use FDS `Layout` components.
- When referencing FDS setup, use the canonical documentation at:
  <https://designsystem.life.gov.sg/react/index.html?path=/docs/getting-started-installation--docs>
- Code review skills and agents are NOT subject to FDS constraints — they
  operate on the code under review, not on a target UI framework.

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
- The `"skills"` field in each plugin entry is a **directory path** (e.g.
  `"./skills"`). The loader discovers all skill folders within it automatically.
  You do NOT need to list individual skills.
- After creating any `SKILL.md` file, verify the skills directory path in
  `marketplace.json` still points to the correct folder. Because the loader
  auto-discovers from the directory, no per-skill registration is needed.
- When adding or removing an `instructions/` or `agents/` folder, update the
  corresponding `"instructions"` or `"agents"` field in `marketplace.json`.
  Omit the field entirely when the folder does not exist.
- Increment the plugin `"version"` using semantic versioning for every change
  to `marketplace.json`.
- (Claude Code) You MUST bump the `"version"` in
  `plugins/<plugin-name>/.claude-plugin/plugin.json` on every capability change
  (added, renamed, or removed skill, agent, or instruction folder). Skills and
  agents are auto-discovered by Claude Code from the plugin root — no changes
  to `.claude-plugin/marketplace.json` are required for individual file
  additions or removals.

Reasoning: `marketplace.json` is the single source of truth for VS Code plugin
discovery. For Claude Code, auto-discovery handles individual files, but the
`plugin.json` version is the only signal that triggers updates for installed
users — omitting the bump means existing installs never receive the change.

### Root README sync

- You MUST update the `## Plugins` table in the root `README.md` whenever
  you **add or remove a plugin**, or whenever a plugin's one-sentence
  description changes in `marketplace.json`.
- You MUST NOT defer root README table updates to a separate commit — they
  MUST be included in the same commit as the `marketplace.json` change.
- **Do NOT manually edit badge counts anywhere.** The pre-commit hook
  (`scripts/update-counts.sh`) recomputes and updates them automatically on
  every commit. Manual edits will be overwritten.
  - The `Plugins` badge in the root `README.md` is updated from the count of
    `hooks.json` files across all plugin directories.
  - The `Agents` and `Skills` badges in each plugin's `README.md` are updated
    from the count of `*.agent.md` files and `SKILL.md` sentinels within that
    plugin directory.
- If adding a plugin causes badge updates in `plugins/*/README.md` to remain
  unstaged after running the hook, you MUST update `.githooks/pre-commit` in
  the same commit.

### AGENTS.md maintenance

- You MUST update this file (`AGENTS.md`) whenever a structural change is made
  to the repository that an agent working here needs to know about. Changes that
  require an `AGENTS.md` update include:
  - New plugin directories added or removed
  - New file-type conventions introduced or deprecated
  - New mandatory steps added to the plugin creation or update workflows
  - Changes to marketplace registration schemas for either platform
  - New cross-platform compatibility rules or asymmetries discovered
- You MUST NOT defer `AGENTS.md` updates to a separate commit — they MUST be
  included in the same commit as the structural change that triggered them.
- Before marking any task complete, ask: "Does `AGENTS.md` accurately reflect
  the current state of this repository?" If not, update it first.

Reasoning: `AGENTS.md` is the primary always-on context file read by both
GitHub Copilot and Claude Code. A stale `AGENTS.md` causes agents to generate
work that mismatches the repo's actual structure, resulting in broken
registrations, missed workflow steps, and inconsistent file layouts. [CRITICAL]

### Plugin README sync

- You MUST update `plugins/<plugin-name>/README.md` whenever you add,
  rename, or remove a skill, agent, or instruction file in that plugin.
- The `## Skills` section MUST list every folder under
  `plugins/<plugin-name>/skills/` that contains a `SKILL.md`.
- The `## Agents` section MUST list every `*.agent.md` file under
  `plugins/<plugin-name>/agents/` that is user-facing (i.e. not a
  `*.sub.agent.md` subagent-only file).
- The `## What Gets Installed` table MUST reflect the actual file types
  present (`.instructions.md`, `.agent.md`, `SKILL.md`) — omit rows for
  types that do not exist in the plugin.
- You MUST NOT defer plugin README updates to a separate commit — they
  MUST be included in the same commit as the capability change.

Reasoning: The root `README.md` is the first thing contributors and users
read. A stale or incomplete Plugins table gives a false picture of what the
marketplace contains. Badge counts are kept in sync automatically by the
commit hook so contributors never need to count manually.

### Content boundaries

- Each file MUST have a single, focused purpose. Split concerns into separate
  files rather than combining them.
- Instructions files MUST skip conventions already enforced by standard linters
  or formatters.
- Web application customization files MUST NOT contain general programming
  tutorials unrelated to building FDS-compliant web applications.
- Code review customization files MUST NOT contain web application scaffolding
  or FDS-specific guidance — they are scoped to reviewing code, not building it.

<!-- </authoring-rules> -->

<!-- <git-conventions> -->
## Git Commit Conventions

When using the `cc-git-commit` skill in this repository, apply the
following scope rules in addition to the skill's standard grouping
and message format.

### Authority Hierarchy

When instructions in `AGENTS.md` and the `cc-contribute-wai` skill
conflict, apply this rule:

- **`AGENTS.md` wins** on repo-level concerns: marketplace.json,
  badge counts, CHANGELOG, git commit conventions, and branching
  policy.
- **`cc-contribute-wai` wins** on WAI plugin contribution workflow
  steps: file creation, front matter validation, naming conventions,
  and testing.

### Branching Policy

WAI plugin contributions (new agents, skills, or instruction files)
MUST be made on a feature branch, not directly on `main`:

```
git checkout main && git pull
git checkout -b feature/<descriptive-name>
```

The `main`-commit workflow in [Changelog Update Cadence](#changelog-update-cadence)
applies to root-level repo changes only (`README.md`, `scripts/`,
`package.json`, `marketplace.json` metadata corrections). Plugin
capability changes MUST go through a feature branch and MR.

### Scope Resolution

The `scope` in each commit message MUST identify the affected area
using these rules, in priority order:

1. **Single plugin** — all files in the group are under
   `plugins/<name>/`: use the plugin folder name as the scope.
   Example: `docs(wai): update readme`
2. **Root-level files** (`README.md`, `scripts/`, `package.json`,
   `.githooks/`, `.github/`, `changelog.config.js`): use `repo`.
   Example: `chore(repo): add changelog generation scripts`

This convention enables `conventional-changelog` to generate
accurate, plugin-scoped changelog entries automatically.

### Changelog Update Cadence

`CHANGELOG.md` is managed by `./scripts/release.sh` — you MUST NOT update
it manually. The script runs `npm run changelog` internally and prepends
the unreleased entries as part of the release commit.

**Working on a feature branch** (standard workflow):

1. Make commits freely on the branch — do not touch `CHANGELOG.md` or
   any version manifest during development.
2. When the branch is merged to `main` and a release is ready, run the
   release script from the repo root with a clean working tree:
   ```bash
   ./scripts/release.sh <plugin-name> <version>
   ```
3. The script commits the version bumps, the updated `CHANGELOG.md`,
   and applies the `v<version>` git tag in one atomic operation.

You MUST NOT run `npm run changelog` manually or edit `CHANGELOG.md`
directly — always use `./scripts/release.sh`. [CRITICAL]

<!-- </git-conventions> -->


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

<!-- <telemetry> -->
## Telemetry

Every plugin ships a telemetry hook at
`plugins/<plugin-name>/scripts/session-telemetry.sh`. The hook fires on
`SessionStart` and `SubagentStart` events.

The hook is responsible for:

- Firing a usage event to the configured telemetry endpoint.
- Firing a one-time `install` event the first time the plugin is used
  on a machine.
- Generating and persisting an anonymous, per-machine installation ID
  in `~/.ccube/telemetry-id`.

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

<!-- <community-plugin> -->
## Community Plugin

The `community` plugin (`plugins/community/`) is the curated vendor layer for
open-source community skills. Unlike the `wai` plugin — which contains
first-party agents and skills authored by the team — the community plugin
contains skills downloaded from external GitHub repositories and vendored
directly into this repo so employees get them with zero extra tooling.

### What is vendored vs. authored

| Source                                   | Plugin      | Maintained by          |
| ---------------------------------------- | ----------- | ---------------------- |
| Team-authored agents, skills, prompts    | `wai`       | Internal               |
| Open-source community skills (copied in) | `community` | Upstream + manual sync |

Skills in `community` are static copies. They do not auto-update from upstream;
an explicit sync step is required (see below).

### Directory layout

```
plugins/community/
  plugin.json                  ← Copilot plugin manifest
  .claude-plugin/plugin.json   ← Claude Code plugin manifest
  hooks.json                   ← SessionStart + SubagentStart telemetry
  README.md                    ← Skill inventory (update when skills change)
  scripts/
    session-telemetry.sh       ← Standard telemetry hook (PLUGIN_NAME="community")
    manage-skills.sh           ← CLI for add / update / delete / list
  skills/
    .manifest.json             ← Auto-managed provenance record (do NOT edit by hand)
    <skill-name>/
      SKILL.md                 ← Vendored skill content
      ...                      ← Supporting files from upstream
```

### Managing community skills — `manage-skills.sh`

All skill lifecycle operations go through
`plugins/community/scripts/manage-skills.sh`. Run it from the repository root.

**Add a new skill from GitHub:**

```bash
./plugins/community/scripts/manage-skills.sh add <owner/repo> <path/in/repo> [skill-name]

# Examples:
./plugins/community/scripts/manage-skills.sh add mattpocock/skills skills/productivity/grill-me
./plugins/community/scripts/manage-skills.sh add github/awesome-copilot skills/review-and-refactor review-refactor
```

- `skill-name` is optional and defaults to the last segment of `<path/in/repo>`.
- The script uses `git sparse-checkout --depth 1` so only the target folder is
  downloaded — the full upstream repo is never cloned.
- Provenance (repo, path, timestamps) is written to `skills/.manifest.json`
  automatically. Do NOT edit `.manifest.json` by hand.

**Update a single skill to the latest upstream commit:**

```bash
./plugins/community/scripts/manage-skills.sh update <skill-name>

# Example:
./plugins/community/scripts/manage-skills.sh update grill-me
```

**Update all vendored skills at once:**

```bash
./plugins/community/scripts/manage-skills.sh update --all
```

**Delete a skill:**

```bash
./plugins/community/scripts/manage-skills.sh delete <skill-name>

# Example:
./plugins/community/scripts/manage-skills.sh delete grill-me
```

**List all currently vendored skills:**

```bash
./plugins/community/scripts/manage-skills.sh list
```

### After any add / update / delete — mandatory follow-up steps

Every change to the skills directory requires these four steps before committing:

1. **Update `plugins/community/README.md`**
   - Add/remove the `### <skill-name>` entry under `## Skills`.
   - Badge counts are updated automatically by the pre-commit hook.

2. **Bump the plugin version in both manifests** (minor for add/delete, patch
   for update-only):
   - `plugins/community/plugin.json` → increment `"version"`
   - `plugins/community/.claude-plugin/plugin.json` → increment `"version"` to
     the same value

3. **Bump the version in both marketplace registries**:
   - `.github/plugin/marketplace.json` → update the `community` entry `"version"`
   - `.claude-plugin/marketplace.json` → update the `community` entry `"version"`

4. **Stage and commit** using the scope `community`:
   ```bash
   git add plugins/community/
   git commit -m "feat(community): add <skill-name> skill"   # for add
   git commit -m "chore(community): update <skill-name> to latest"  # for update
   git commit -m "feat(community): remove <skill-name> skill"  # for delete
   ```

### Agent auto-update rule

When a user asks to **add a community skill**, **refresh/update community
skills**, or **sync upstream skills**, you MUST:

1. Identify the target skill(s) — confirm the GitHub `owner/repo` and
   `path/in/repo` if not already known.
2. Run `manage-skills.sh` with the appropriate command (`add`, `update`, or
   `update --all`). Use `run_in_terminal` from the repo root.
3. Complete all four follow-up steps above (README, version bumps, commit).
4. Do NOT skip the version bump — a bump is required even for upstream-only
   content updates because installed users only receive updates when the
   version number changes.

When a user asks **"what community skills are installed?"**, run:

```bash
./plugins/community/scripts/manage-skills.sh list
```

Do NOT read the `skills/` directory directly — the manifest is the
authoritative source of provenance.

### What `skills/.manifest.json` contains

The manifest is written and updated exclusively by `manage-skills.sh`. It
records the upstream source for every vendored skill so `update` and `delete`
know where content came from without requiring the user to remember:

```json
{
  "skills": {
    "grill-me": {
      "source": "mattpocock/skills",
      "path": "skills/productivity/grill-me",
      "added": "2026-05-03T13:00:00Z",
      "updated": "2026-05-03T13:00:00Z"
    }
  }
}
```

Do NOT modify this file manually. All reads and writes go through the script.

<!-- </community-plugin> -->

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
   the plugin — `"skills"` points to the skills directory, `"hooks"` points to
   `hooks.json`, and `"instructions"` / `"agents"` fields are present only if
   the corresponding folders exist.
   (Claude Code: skills and agents are auto-discovered — no `.claude-plugin/`
   registration changes needed; confirm both `plugins/<plugin-name>/plugin.json`
   and `plugins/<plugin-name>/.claude-plugin/plugin.json` `"version"` were bumped
   to the same value.)
8. Root `README.md` `## Plugins` table is accurate — every plugin in
   `marketplace.json` has a corresponding row with an up-to-date description,
   and no removed plugin still appears.
9. Each plugin's `README.md` contains `Agents-N` and `Skills-N` badges so the
   pre-commit hook can keep them in sync. (All badge counts are updated
   automatically — do not edit them manually.)
10. Each plugin's `README.md` `## Skills` section lists every skill folder on
    disk that contains a `SKILL.md`, and `## Agents` lists every user-facing
    `.agent.md`. No stale entries remain for removed files.
11. `bash .githooks/pre-commit` stages all README badge updates (root and
    `plugins/*/README.md`) with no unstaged badge drift.
12. If a shared agent file (e.g. `prompt-refiner.sub.agent.md`) was modified,
    confirm every copy across all plugins is identical by running the diff
    command documented in the [Shared Agents](#shared-agents) section. No copy
    may differ.

<!-- </acceptance-checks> -->
