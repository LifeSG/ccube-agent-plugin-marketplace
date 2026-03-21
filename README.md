<div align="center">

<h1>
  <img src="docs/assets/Citizen-collective-logo.png" alt="Citizen Collective logo" height="48">
  VS Code copilot plugin for Flagship Design System
</h1>

<img src="docs/assets/hero.jpg" alt="CCube mascots with a piggy bank" width="280">

*What if you can vibecode, but using Flagship Design System*

<p align="center">
  <a href="https://designsystem.life.gov.sg/react/index.html?path=/docs/getting-started-installation--docs"><img src="https://img.shields.io/badge/Flagship_Design_System-FD8A65?style=for-the-badge&logo=storybook&logoColor=white" alt="Flagship Design System"></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"></a>
</p>

<p align="center">
  <a href=".github/agents/"><img src="https://img.shields.io/badge/Agents-0-555?style=for-the-badge&logo=githubactions&logoColor=white&labelColor=274183" alt="Agents"></a>
  <a href=".github/instructions/"><img src="https://img.shields.io/badge/Instructions-0-555?style=for-the-badge&logo=readthedocs&logoColor=white&labelColor=2E8F81" alt="Instructions"></a>
  <a href=".github/skills/"><img src="https://img.shields.io/badge/Skills-0-555?style=for-the-badge&logo=lightning&logoColor=white&labelColor=F6C063" alt="Skills"></a>
  <a href=".github/prompts/"><img src="https://img.shields.io/badge/Prompts-0-555?style=for-the-badge&logo=openai&logoColor=white&labelColor=FD7C53" alt="Prompts"></a>
</p>

</div>

---

## What This Plugin Does

This repository authors and ships a curated set of **GitHub Copilot customization files** that are installed into a
user's VS Code workspace. Once installed, GitHub Copilot automatically picks them up — no configuration required
from the end user.

The result: non-developer users get an AI pair programmer that already knows the Flagship Design System inside-out,
follows accessibility best practices, and can scaffold production-ready React components on demand.

---

## What Gets Installed

When deployed to a target workspace, the plugin places the following files under `.github/`:

| File               | Location                 | What it does                                                                           |
| ------------------ | ------------------------ | -------------------------------------------------------------------------------------- |
| `.instructions.md` | `.github/instructions/`  | Always-on coding standards scoped to FDS patterns and React conventions                |
| `.prompt.md`       | `.github/prompts/`       | Reusable slash-command workflows — scaffold a page, create a component, and more       |
| `.agent.md`        | `.github/agents/`        | Specialized AI agents with scoped personas and restricted tool sets                    |
| `SKILL.md`         | `.github/skills/<name>/` | Self-contained domain-knowledge packages, optionally bundled with scripts and examples |

---

## Flagship Design System Integration

All customization files are built around **`@lifesg/react-design-system`**

```bash
# Install FDS and its peer dependencies
npm i @lifesg/react-design-system
```

Available themes out of the box:

| Theme      | Token            |
| ---------- | ---------------- |
| Life SG    | `LifeSGTheme`    |
| CCube      | `CCubeTheme`     |
| Booking SG | `BookingSGTheme` |
| PA         | `PATheme`        |
| IMDA       | `IMDATheme`      |
| SPF        | `SPFTheme`       |

> Full component docs and Storybook: [designsystem.life.gov.sg](https://designsystem.life.gov.sg/react/index.html?path=/docs/getting-started-installation--docs)

---

## Plugin Standards

Every customization file in this plugin must pass these checks before merging:

- [ ] YAML front matter is valid — quoted strings, spaces (not tabs), `---` delimiters
- [ ] `description` contains concrete `Use when: ...` trigger phrases for reliable semantic matching
- [ ] Language is plain enough for a non-developer to follow without external help
- [ ] FDS references link to official documentation — no inline doc reproductions
- [ ] Scope is focused — one file, one concern
- [ ] No instructions duplicate what a linter, formatter, or TypeScript already enforces

---

## Contributing

### Prerequisites

- VS Code with the [GitHub Copilot extension](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)
- Familiarity with [Copilot customization file formats](https://code.visualstudio.com/docs/copilot/copilot-customization)

### First-time setup

After cloning, activate the committed git hooks so badge counts stay in sync automatically:

```bash
git config core.hooksPath .githooks
```

To update the counts manually at any time without committing:

```bash
bash scripts/update-counts.sh
```

### Authoring rules

- Write all instructions and prompts **for non-developers** — plain language, concrete examples, and the "why" behind every rule
- Always target FDS components and tokens; do not suggest custom CSS primitives or third-party UI libraries
- Use VS Code built-in file tools for all reads and writes — never use terminal commands to create or modify files

### Submitting changes

1. Fork the repository and create a feature branch
2. Author or update the relevant customization files following the standards above
3. Verify all acceptance checks pass
4. Open a merge request with a clear description of what changed and why

---

## Repository Governance

Detailed authoring rules, canonical front matter templates, and AI agent guidance live in [AGENT.md](AGENT.md).
That file is the authoritative source of truth for anyone (human or AI) contributing to this plugin.

---

<div align="center">

Built with care for the Singapore Government digital ecosystem.

</div>

