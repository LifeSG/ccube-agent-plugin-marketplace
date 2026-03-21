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
  <a href=".github/agents/"><img src="https://img.shields.io/badge/Agents-1-555?style=for-the-badge&logo=githubactions&logoColor=white&labelColor=274183" alt="Agents"></a>
  <a href=".github/instructions/"><img src="https://img.shields.io/badge/Instructions-1-555?style=for-the-badge&logo=readthedocs&logoColor=white&labelColor=2E8F81" alt="Instructions"></a>
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

## Features

### Prompt Refinement

Before Copilot acts on your request, this plugin automatically evaluates whether your prompt follows good
prompting practices — specificity, clear scope, and actionable intent. If the prompt is vague or
under-specified, Copilot presents a refined version alongside your original, explains what was improved and
why, then asks for your approval before proceeding.

This means even users unfamiliar with prompt engineering get consistently high-quality Copilot responses,
without needing to learn prompting techniques themselves.

**Example** — a user types `make me a button`:

> **Heads up:** Your prompt was assessed as vague or underspecified, so it has been automatically refined to help produce a more accurate and useful response. Review both versions below and choose how to proceed.
>
> **Original prompt:**
> make me a button
>
> **Refined prompt:**
> In the current React project (Vite + FDS), create a new component file at `src/components/SubmitButton.tsx`. Use the `Button` component from `@lifesg/react-design-system/button` with the `primary` styleType. The button should display the label "Submit" and accept an `onClick` prop of type `() => void`.
>
> **Prompt engineering principles applied:**
> - **Specificity**: Identifies the exact target file, component library, and variant instead of leaving it open to interpretation
> - **Constraint anchoring**: Binds the output to FDS components and project conventions rather than allowing generic HTML or third-party alternatives
> - **Scope definition**: Limits the task to a single component file with a clear, testable interface
>
> **What was improved:**
> - Added a target file path so Copilot doesn't have to guess where to create the file
> - Specified the FDS `Button` component and import path instead of a generic button
> - Defined the component's props contract (`onClick: () => void`) for type safety
> - Named the variant (`primary`) to avoid a random style choice
>
> Would you like to proceed with the refined prompt, the original, or would you like to adjust it?

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

1. Clone the repository and create a feature branch
2. Author or update the relevant customization files following the standards above
3. Open a merge request with a clear description of what changed and why

---

## Repository Governance

Detailed authoring rules, canonical front matter templates, and AI agent guidance live in [AGENT.md](AGENT.md).
That file is the authoritative source of truth for anyone (human or AI) contributing to this plugin.

---

<div align="center">

Built with care for the Singapore Government digital ecosystem.

</div>

