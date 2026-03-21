<div align="center">

<h1>
  <img src="docs/assets/Citizen-collective-logo.png" alt="Citizen Collective logo" height="48">
  VS Code Agent plugin for Flagship Design System
</h1>

<img src="docs/assets/hero.jpg" alt="CCube mascots with a piggy bank" width="280">

*What if you can vibecode, but using Flagship Design System*

<p align="center">
  <a href="https://designsystem.life.gov.sg/react/index.html?path=/docs/getting-started-installation--docs"><img src="https://img.shields.io/badge/Flagship_Design_System-FD8A65?style=for-the-badge&logo=storybook&logoColor=white" alt="Flagship Design System"></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"></a>
</p>

<p align="center">
  <a href="agents/"><img src="https://img.shields.io/badge/Agents-1-555?style=for-the-badge&logo=githubactions&logoColor=white&labelColor=274183" alt="Agents"></a>
  <a href="instructions/"><img src="https://img.shields.io/badge/Instructions-1-555?style=for-the-badge&logo=readthedocs&logoColor=white&labelColor=2E8F81" alt="Instructions"></a>
  <a href="skills/"><img src="https://img.shields.io/badge/Skills-0-555?style=for-the-badge&logo=lightning&logoColor=white&labelColor=F6C063" alt="Skills"></a>
  <a href="prompts/"><img src="https://img.shields.io/badge/Prompts-0-555?style=for-the-badge&logo=openai&logoColor=white&labelColor=FD7C53" alt="Prompts"></a>
</p>

</div>

---

## What This Agent Plugin Does

This repository authors and ships a curated set of **GitHub Copilot agent
plugin customizations** that add specialized commands, skills, and agents to
GitHub Copilot in VS Code. Once installed, the plugin automatically integrates
with Copilot — no configuration required from the end user.

The result: An AI pair programmer that already knows
the Flagship Design System inside-out, follows accessibility best practices,
prompt-refines vague requests, and can scaffold production-ready frontend based on
Flagship Design System (FDS).

---

## Installation

### Install from GitLab Repository

1. Open the Command Palette (**⇧⌘P**)
2. Search for and select **Chat: Install Plugin From Source**
3. Enter your GitLab repository URL: `https://sgts.gitlab-dedicated.com/wog/gvt/lifesg/gvt-lifesg/ccubesg/libraries/ccube-vsc-agent-plugin-fds.git`
4. VS Code clones and installs the plugin automatically
5. The plugin is now active and ready to use

### Verify Installation

Once installed, you'll see:
- New slash commands in the Chat view (if configured)
- Updated agent skills and customizations
- Instructions automatically applied to all Copilot suggestions
- Prompt refinement for vague requests

For more details on agent plugins, see the [VS Code Agent Plugins documentation](https://code.visualstudio.com/docs/copilot/customization/agent-plugins).

---

## Updating the Plugin

To get the latest version of this plugin:

1. Open the Command Palette (**⇧⌘P**)
2. Run **Extensions: Check for Extension Updates**
3. VS Code pulls the latest changes from the GitLab repository automatically

Alternatively, updates are checked automatically every 24 hours if **Auto Update** is enabled in your VS Code settings.

---

## What Gets Installed

When installed, the plugin provides the following customizations:

| File               | Location         | What it does                                                                           |
| ------------------ | ---------------- | -------------------------------------------------------------------------------------- |
| `.instructions.md` | `instructions/`  | Always-on coding standards scoped to FDS patterns and React conventions                |
| `.prompt.md`       | `prompts/`       | Reusable slash-command workflows — scaffold a page, create a component, and more       |
| `.agent.md`        | `agents/`        | Specialized AI agents with scoped personas and restricted tool sets                    |
| `SKILL.md`         | `skills/<name>/` | Self-contained domain-knowledge packages, optionally bundled with scripts and examples |

---

## Features

### Prompt Refinement

Before Copilot acts on your request, this plugin automatically evaluates
whether your prompt follows good prompting practices — specificity, clear
scope, and actionable intent. If the prompt is vague or under-specified,
Copilot presents a refined version alongside your original, explains what was
improved and why, then asks for your approval before proceeding.

This means even users unfamiliar with prompt engineering get consistently
high-quality Copilot responses, without needing to learn prompting techniques
themselves.

**Example** — a user types `make me a button`:

> **Heads up:** Your prompt was assessed as vague or underspecified, so it has
> been automatically refined to help produce a more accurate and useful
> response. Review both versions below and choose how to proceed.
>
> **Original prompt:**
> make me a button
>
> **Refined prompt:**
> In the current React project (Vite + FDS), create a new component file at
> `src/components/SubmitButton.tsx`. Use the `Button` component from
> `@lifesg/react-design-system/button` with the `primary` styleType. The
> button should display the label "Submit" and accept an `onClick` prop of type
> `() => void`.
>
> **Prompt engineering principles applied:**
> - **Specificity**: Identifies the exact target file, component library, and
>   variant instead of leaving it open to interpretation
> - **Constraint anchoring**: Binds the output to FDS components and project
>   conventions rather than allowing generic HTML or third-party alternatives
> - **Scope definition**: Limits the task to a single component file with a
>   clear, testable interface
>
> **What was improved:**
> - Added a target file path so Copilot doesn't have to guess where to create
>   the file
> - Specified the FDS `Button` component and import path instead of a generic
>   button
> - Defined the component's props contract (`onClick: () => void`) for type
>   safety
> - Named the variant (`primary`) to avoid a random style choice
>
> Would you like to proceed with the refined prompt, the original, or would
> you like to adjust it?

---

## Contributing

### Prerequisites

- VS Code with the [GitHub Copilot extension](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)
- Familiarity with [Copilot customization file formats](https://code.visualstudio.com/docs/copilot/copilot-customization)

### First-time setup

After cloning, activate the committed git hooks so badge counts stay in sync
automatically:

```bash
git config core.hooksPath .githooks
```

To update the counts manually at any time without committing:

```bash
bash scripts/update-counts.sh
```

### Authoring rules

- Write all instructions and prompts **for non-developers** — plain language,
  concrete examples, and the "why" behind every rule
- Always target FDS components and tokens; do not suggest custom CSS
  primitives or third-party UI libraries
- Use VS Code built-in file tools for all reads and writes — never use
  terminal commands to create or modify files

### Submitting changes

1. Clone the repository and create a feature branch
2. Author or update the relevant customization files following the standards
  above
3. Open a merge request with a clear description of what changed and why

---

## Repository Governance

Detailed authoring rules, canonical front matter templates, and AI agent
guidance live in [AGENT.md](AGENT.md). That file is the authoritative source of
truth for anyone (human or AI) contributing to this plugin.

---

<div align="center">

Built with care for the Singapore Government digital ecosystem.

</div>

