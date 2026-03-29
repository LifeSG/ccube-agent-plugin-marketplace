# Changelog

All notable changes to this marketplace are documented here.
Entries are grouped by plugin.

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
