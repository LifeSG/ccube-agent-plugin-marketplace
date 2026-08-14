# Changelog

All notable changes to this marketplace are documented here.
Entries are grouped by plugin.

## 2.1.0 — 2026-08-14
### wai `v2.1.0`

BYOA (Bring Your Own Agent) support, evaluation harness, and
skill improvements.

#### Added

- **feat**: BYOA routing — Maestro checks `wai/byoa/` for
  project-local MAI agents before falling back to WAI defaults
  (EP-0003 Part B)
- **feat**: `/create-mai-agent` skill — guided generation of
  project-local agents with stack detection, trigger signal
  alignment, and completion protocol
- **feat**: Maestro eval harness — Claude Code workflow with 3
  smoke-test cases for classification regression testing
  (EP-0003 Part A)
- **feat**: `cc-swe-coach` skill migrated from community to
  WAI plugin
- **docs**: EP-0003 enhancement proposal documenting eval,
  BYOA, MAI naming, and create-mai-agent skill

#### Changed

- **refactor**: Maestro Step 2 simplified — strict filename
  discovery (`mai-frontend.agent.md`, `mai-backend.agent.md`,
  `mai-product.agent.md`) replaces description matching
- **refactor**: WAI agents are unconditional fallback — no
  project context check needed when MAI agents are absent
- **refactor**: Dispatch table references "agent resolved in
  Step 2" instead of hardcoding WAI agent names
- **refactor**: MAI references confined to the override
  section of Maestro only
- **fix**: `cc-create-mai-agent` skill aligned with WAI
  conventions — added YAML frontmatter, fixed example
  filenames, added Acceptance Criteria and Error Handling
- **fix**: Cross-platform `sed -i` in fullstack scaffold
  script (BSD vs GNU detection)
- **fix**: Eval `setsEqual` treats `null` and `[]` as
  equivalent for dispatch comparison

### community `v1.1.0`

#### Added

- **feat**: `draw-io` skill for diagram creation
- **feat**: Automated vendored skill update workflow
- **feat**: Auto-bump plugin version on skill add/update
- **fix**: Remove unsupported `--quiet` flag from
  sparse-checkout

## 2.0.0 — 2026-08-11
### wai `v2.0.0`

**BREAKING**: Replaced the 650-line Maestro orchestrator with a
lightweight routing architecture (EP-0002). The old multi-phase
workflow (brief generation, review cycles, SWE delegation) is
removed. Users now interact with specialist agents directly via
a thin intent-classification router.

#### Added

- **feat**: Lightweight Maestro router agent — classifies intent
  and dispatches to specialists without generating briefs or
  adding workflow phases
- **feat**: Scaffold type disambiguation — Maestro asks
  frontend-only vs full-stack when persistence is implied
- **feat**: CSP dev-server headers in both scaffold templates —
  fixes HMR preamble blocked by strict proxy CSP
- **feat**: FDS Engineer promoted to user-invocable with direct
  prompt handling (no upstream brief required)
- **feat**: Backend Engineer promoted to user-invocable with
  direct prompt handling

#### Changed

- **refactor**: All agents aligned for Maestro dispatch
  compatibility (descriptions enriched with routing signals)
- **refactor**: Backend Engineer slimmed — generic OWASP rules
  deferred to `cc-code-review` skill
- **refactor**: Backend Engineer brief handling removed (accepts
  plain-language prompts only)
- **fix**: Scaffold switched from `@vitejs/plugin-react` to
  `@vitejs/plugin-react-swc` (avoids CSP inline script issues)
- **fix**: Added `server.allowedHosts: true` to scaffold configs
  (fixes Vite host-check blocking in proxy environments)
- **fix**: Corrected `Text.H1`/`Text.Body` references to
  `Typography.HeadingXL`/`Typography.BodyBL` (FDS v3)

#### Removed

- **breaking**: Removed WAI Designer agent (Figma-to-FDS spec
  workflow unused; DESIGN prompts handled by Maestro directly)
- **breaking**: Removed `docs/cc-designer-integration.md`
- **breaking**: Removed WAI SWE agent (replaced by direct
  specialist dispatch)
- **breaking**: Removed Prompt Refiner subagent
- **breaking**: Removed multi-phase orchestration workflow
  (brief generation, brief review, architecture review phases)
- **refactor**: Removed `plugins/wai/settings.json` (users
  activate Maestro via `claude --agent wai:Maestro`)
- **docs**: Removed stale phase and SWE references from README

## 1.5.0 — 2026-05-05
### wai `v1.5.0`

- **feat**: Add new e2e skill

## 1.4.0 — 2026-05-03
### .claude `v1.4.0`

- **chore**: Allow read access to wai-work workspace

### agents `v1.4.0`

- **fix**: Replace hardcoded tool budgets with injected placeholder
- **refactor**: Remove business context subagent and clean up matrices

### skill `v1.4.0`

- **refactor**: Align orchestrator and resources with 5-way dispatch
- **docs**: Rewrite README for 2-mode workflow

## 1.3.0 — 2026-04-30
### AGENT.md `v1.3.0`

- **docs**: Add updating existing plugin workflow; fix user-invocable typo in skill template

### agent `v1.3.0`

- **feat**: Add product manager guided web app builder agent
- **docs**: Improve plugin authoring guidelines
- **feat**: Add mandatory instruction loading to principal engineer
- **refactor**: Use markdown links for instruction loading
- **feat**: Delegate Phase 3 implementation to PSE V2 subagent
- **feat**: Add code generation rules and close V1 parity gaps in PSE V2
- **feat**: Delegate error diagnosis and bug fixing to PSE V2 subagent
- **docs**: Reflow cc-principal-software-engineerV2 to 80 columns
- **feat**: Add graceful fallback mode to cc-product-manager
- **docs**: Add fds v4 migration checklist to AGENT.md
- **docs**: Add steps and rules for keeping root README in sync
- **docs**: Enforce hook checks
- **docs**: Add shared-agents cross-plugin consistency protocol
- **docs**: Add changelog update cadence guidance

### agent-md `v1.3.0`

- **docs**: Add critical SKILL.md marketplace.json registration warnings

### agents `v1.3.0`

- **feat**: Delegate git operations from PM to PSE V2 via cc-git-commit
- **docs**: Update AGENT.md with telemetry structure and authoring protocol
- **fix**: Align Product Manager agent references to correct Software Engineer name
- **refactor**: Rename cc-principal-software-engineerV2 to cc-software-engineer
- **fix**: Resolve all validation issues in Product Manager agent (H1-H3, M1-M4, L1-L4)
- **style**: Reformat vocabulary table column widths in Product Manager agent
- **feat**: Add react engineer and react pattern skills
- **fix**: Delegate prompt-refiner contract to single source of truth

### catalogue `v1.3.0`

- **feat**: Document 10 fds components

### cc-design-system `v1.3.0`

- **feat**: Add FDS knowledge skill with component catalogue, tokens, and theme setup resources
- **docs**: Expand foundations-tokens reference
- **docs**: Update catalogue progress tracker
- **feat**: Split component catalogue into per-group files
- **docs**: Add next catalogue component entries
- **docs**: Refine ErrorDisplay documentation
- **docs**: Add six catalogue component entries
- **style**: Normalize markdown table alignment
- **docs**: Add six ds catalogue updates
- **style**: Fix markdown table alignment in resource docs
- **docs**: Add Animations, ButtonWithIcon, InputGroup, LinkList
- **docs**: Document 15 components in selection-input and form groups
- **docs**: Remove z-index stub (not an FDS token)
- **docs**: Correct progress count to 90/90
- **docs**: Add Claude Code runtime detection section

### cc-fullstack-vite `v1.3.0`

- **fix**: Remove JSONC comment stripping from tsconfig parse

### cc-plan-implementation `v1.3.0`

- **feat**: Add standalone implementation planning skill

### cc-product-manager `v1.3.0`

- **chore**: Update tool names and remove tools block
- **fix**: Use deterministic path to locate prompt-refiner config
- **refactor**: Simplify agent workflow instructions
- **refactor**: Remove skill invocation rules section
- **feat**: Add product thinking workflow to PM agent
- **feat**: Add product thinking workflow to PM agent

### cc-rabbit-deploy `v1.3.0`

- **feat**: Add GCC deployment skill to fds-web-app-builder
- **docs**: Update GitLab URL examples to sgts.gitlab-dedicated.com

### cc-software-engineer `v1.3.0`

- **feat**: Rename agent display name to CC Software Engineer
- **feat**: Add FDS skill guidance to prevent node_modules inspection
- **refactor**: Simplify prompt refiner invocation
- **chore**: Ban terminal file read, search, and edit commands
- **feat**: Add LLM operational constraints section

### cc-vite-react-ds `v1.3.0`

- **fix**: Update script hint paths to reflect plugin install structure
- **fix**: Run init script as background process to prevent npm install timeout
- **style**: Enforce 80-char line wrap on prose in SKILL.md
- **refactor**: Remove file generation from init script, delegate to Copilot file setup
- **fix**: Fix incorrect ThemeProvider import, delegate theme wiring to cc-design-system skill
- **chore**: Fix --no-interactive flag and clean up echo messages
- **refactor**: Replace file_search with deterministic path derivation
- **fix**: Correct script path discovery guidance

### ccube-fds-web-app-builder `v1.3.0`

- **chore**: Remove duplicate PSEv2 agent

### ccube-software-craft `v1.3.0`

- **feat**: Add ccube-software-craft plugin
- **feat**: Package instructions as distributable skills
- **feat**: Inline instructions and add markdown skill to PSE V2
- **chore**: Remove instructions inlined into PSE V2 agent

### claude `v1.3.0`

- **feat**: Add root CLAUDE.md and hook settings for Claude Code
- **feat**: Add WAI plugin CLAUDE.md with agent personas and skill index

### css `v1.3.0`

- **fix**: Update docs

### debug `v1.3.0`

- **feat**: Add telemetry hook field diagnostic script

### design `v1.3.0`

- **docs**: Add DESIGN.md system references

### design-system `v1.3.0`

- **feat**: Add component catalogue entries
- **feat**: Add layout composition guidance

### ds-catalogue `v1.3.0`

- **docs**: Add markup table navbar entries
- **docs**: Add seven component catalogue entries

### fds `v1.3.0`

- **docs**: Add 4 catalogue component entries

### fds-builder `v1.3.0`

- **fix**: Prevent fds search false negatives

### fds-skill `v1.3.0`

- **feat**: Add delight patterns to layout-composition-patterns

### fds-web-app-builder `v1.3.0`

- **chore**: Delete dead prompt-refinement instruction file

### frontend-dev `v1.3.0`

- **fix**: Fix readme and skill plugin attribution

### git-commit `v1.3.0`

- **refactor**: Improve staging command formatting

### hooks `v1.3.0`

- **fix**: Move hooks.json to plugin root for Copilot-format detection
- **fix**: Revert to Claude format (hooks/hooks.json) for CLAUDE_PLUGIN_ROOT expansion
- **fix**: Revert to Claude format and update AGENT.md docs
- **chore**: Add systemMessage debug output to SessionStart hooks
- **fix**: Resolve session-telemetry.sh path using assumed $HOME install location
- **fix**: Stage readmes

### maestro `v1.3.0`

- **refactor**: Merge Phase 3/4, linearise phase numbering, integrate SWE Brief Generation and Brief Review

### marketplace `v1.3.0`

- **fix**: Register ccube-ux-designers plugin and enforce sync rule
- **feat**: Add claude code plugin marketplace structure

### mkt `v1.3.0`

- **feat**: Move react skills

### plugins `v1.3.0`

- **docs**: Add telemetry disclosure section to plugin READMEs
- **docs**: Add agents and skills count badges to plugin READMEs
- **docs**: Align ccube-software-craft README structure with fds-web-app-builder
- **docs**: Move key capabilities into agent and skill entries

### pm-agent `v1.3.0`

- **feat**: Narrow audience to PMs, consolidate delegation rules, fix validation findings

### prompt-refiner `v1.3.0`

- **feat**: Add Prompt Refiner subagent to ccube-software-craft
- **feat**: Wire Prompt Refiner delegation into gateway agents and sync canonical policy
- **fix**: Simplify confirmation to yes/no prompt
- **fix**: Sync confirmation wording to canonical version
- **fix**: Enforce full output in caller agents

### react `v1.3.0`

- **fix**: Update docs

### readme `v1.3.0`

- **style**: Normalize markdown table spacing
- **docs**: Add missing plugins and update installation guidance
- **docs**: Sync badges

### repo `v1.3.0`

- **chore**: Add git-cliff changelog generation tooling
- **docs**: Add changelog and update setup instructions
- **docs**: Add git commit scope conventions to AGENT.md
- **chore**: Reset all plugin versions to 1.0.0
- **docs**: Add PM and SWE quick start sections to README
- **docs**: Remove frontend dev skills section from SWE quick start
- **docs**: Document claude code marketplace structure in AGENT.md

### scripts `v1.3.0`

- **chore**: Split badge updates — plugins in root, agents/skills per plugin
- **feat**: Add build-wai-claude.sh and install-claude.sh
- **feat**: Add automated release script
- **fix**: Fix portable sed for macOS

### skill `v1.3.0`

- **feat**: Add version context and v3/v4 routing to cc-design-system
- **chore**: Pin fds install to @^3 and scaffold resources-v4/

### skills `v1.3.0`

- **chore**: Remove validate.sh scripts from all skills

### software-craft `v1.3.0`

- **feat**: Add cc-git-commit atomic commit skill
- **feat**: Add enhancement proposal creation skill
- **docs**: Align readme with plugin ground truth
- **feat**: Register cc-create-ep skill and bump version to 1.2.0

### styled `v1.3.0`

- **fix**: Update docs

### telemetry `v1.3.0`

- **feat**: Add SessionStart hooks and scripts to both plugins
- **fix**: Switch curl to synchronous and add debug logging
- **fix**: Make session-telemetry.sh executable
- **feat**: Add SubagentStart hook to track agent usage
- **fix**: Read full stdin and default missing fields to UNDEFINED
- **chore**: Log stdin to debug file and generalise event dispatch
- **chore**: Sync fds-web-app-builder script with software-craft
- **fix**: Correct hook_event_name key to snake_case
- **chore**: Update endpoint to slack webhook url
- **fix**: Track per-plugin installs with markers
- **docs**: Add EP-0001 per-plugin install proposal
- **feat**: Add Claude Code hook event mapping and UserPromptSubmit dedup guard

### ux-designers `v1.3.0`

- **feat**: Add cc-design-md plugin scaffolding

### wai `v1.3.0`

- **fix**: Replace unresolved CLAUDE_PLUGIN_ROOT token with hardcoded install path
- **fix**: Strip JSONC comments before parsing tsconfig.app.json in scaffold script
- **fix**: Enforce concurrent Phase 3+4 subagent dispatch in Maestro
- **feat**: Add cc-contribute-wai skill
- **fix**: Improve cc-contribute-wai skill with collaborative model, own-workspace path, and updated QRC
- **fix**: Update contribute skills to include agent
- **feat**: Add claude code subagent dispatch guidance to maestro
- **docs**: Update contribute-wai skill with claude code registration rules
- **chore**: Bump plugin version to 1.2.0

### wai-designer `v1.3.0`

- **style**: Normalise markdown table column widths

### wai-pm `v1.3.0`

- **refactor**: Remove implementation briefs from Product Brief output

### wai-swe `v1.3.0`

- **feat**: Add Brief Generation, Brief Review, and Architecture Review modes

### wai/agents `v1.3.0`

- **feat**: Apply harness engineering improvements to all 7 agents

### wai/skills `v1.3.0`

- **feat**: Apply harness engineering improvements to all 9 skills

## 1.0.0 — 2026-03-30

Initial release of the CCube Copilot Plugin Marketplace with four plugins.

### ccube-fds-web-app-builder `v1.0.0`

- Added **Product Manager** agent — guided, phase-by-phase web app builder
  for product managers; no coding experience required
- Added **Prompt Refiner** subagent — rewrites vague prompts into specific,
  FDS-compliant instructions before any code is generated
- Added **cc-design-system** skill — full FDS component catalogue (90
  components), design tokens, theming setup, and layout composition patterns
- Added **cc-vite-react-ds** skill — guided scaffolding for a new Vite +
  React + TypeScript project pre-wired for FDS
- Added **cc-rabbit-deploy** skill — GCC deployment workflow via Rabbit
  Deploy, covering git init, Project Access Token setup, and CI/CD push
- Added SessionStart telemetry hook

### ccube-software-craft `v1.0.0`

- Added **CC Software Engineer** agent — principal-level guidance on
  architecture decisions, system design, and technical debt strategy
- Added **cc-create-ep** skill — KEP-style Enhancement Proposal authoring
  with 5 parallel codebase research subagents
- Added **cc-plan-implementation** skill — decomposes an EP into a
  parallelised workplan with Mermaid dependency graph, critical path
  analysis, and per-task agent prompts
- Added **cc-git-commit** skill — atomic commit workflow with
  Conventional Commit message generation and plugin-aware scope resolution
- Added **cc-markdown-standards** skill — 80-char line wrap, heading
  hierarchy, and table alignment enforcement

### ccube-frontend-dev `v1.0.0`

- Added **cc-react-beginner** skill — React fundamentals with 10
  common-mistake flags
- Added **cc-react-18-patterns** skill — concurrent rendering, automatic
  batching, new hooks, and React 19 migration notes
- Added **cc-react-19-patterns** skill — Actions API, Server Components,
  React Compiler, and `forwardRef` removal patterns
- Added **cc-css-essentials** skill — box model, flexbox, Grid, specificity,
  z-index stacking context, and 9 common-mistake flags
- Added **cc-styled-components** skill — ThemeProvider, typed props,
  `DefaultTheme` extension, and 8 common-mistake flags

### ccube-ux-designers `v1.0.0`

- Added **cc-design-md** skill — creates validated `DESIGN.md` files by
  browsing live design system documentation directly in the integrated
  browser; all token values verified against the live page

### marketplace

- Added `npm run changelog` and `npm run changelog:init` scripts powered
  by `git-cliff` for automated, scope-grouped changelog generation
- Added pre-commit hook that keeps README agent and skill badge counts
  in sync automatically
