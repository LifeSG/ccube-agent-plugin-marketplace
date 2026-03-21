<div align="center">

<h1>
  <img src="docs/assets/Citizen-collective-logo.png" alt="Citizen Collective logo" height="48">
  FDS Web App Builder
</h1>

<img src="docs/assets/hero.jpg" alt="CCube mascots with a piggy bank" width="280">

*Build web applications with AI — strictly following the Flagship Design System*

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

This plugin turns GitHub Copilot into an **AI web application developer** that
builds React applications strictly following the
[Flagship Design System (FDS)](https://designsystem.life.gov.sg/react/index.html?path=/docs/getting-started-installation--docs).
Once installed, every Copilot suggestion — from a single component to a full
page scaffold — uses FDS components, tokens, and theming patterns exclusively.
No configuration required from the end user.

The result: An AI pair programmer that can develop production-ready web
applications using FDS, enforces accessibility best practices, prompt-refines
vague requests into actionable FDS-compliant plans, and ensures your codebase
never drifts from the design system.

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

| File               | Location         | What it does                                                                                      |
| ------------------ | ---------------- | ------------------------------------------------------------------------------------------------- |
| `.instructions.md` | `instructions/`  | Always-on coding standards that enforce FDS component usage, React conventions, and accessibility |
| `.prompt.md`       | `prompts/`       | Slash-command workflows — scaffold a page, set up a project, build a form, and more               |
| `.agent.md`        | `agents/`        | Specialized AI agents that develop web applications within FDS constraints                        |
| `SKILL.md`         | `skills/<name>/` | Domain-knowledge packages — FDS component catalog, theming guidance, project scaffolding          |

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

**Example** — a user types `build me a login page`:

> **Heads up:** Your prompt was assessed as vague or underspecified, so it has
> been automatically refined to help produce a more accurate and useful
> response. Review both versions below and choose how to proceed.
>
> **Original prompt:**
> build me a login page
>
> **Refined prompt:**
> In the current React project (Vite + FDS), create a login page at
> `src/pages/LoginPage.tsx` with the following:
> 1. Use `Layout.Content` from `@lifesg/react-design-system/layout` as the
>    page wrapper.
> 2. Add a `Form` with `Form.Input` for email, `Form.Input` (masked) for
>    password, and a `Button` (styleType `primary`) for submission.
> 3. Include client-side validation: required fields and email format check.
> 4. Export the page as a named export and add a route entry in the app
>    router.
>
> **Prompt engineering principles applied:**
> - **Application-level scope**: Frames the task as a full page with routing,
>   not an isolated component
> - **FDS constraint anchoring**: Names specific FDS components (`Layout`,
>   `Form`, `Button`) instead of allowing generic HTML form elements
> - **Multi-step structure**: Breaks the task into ordered steps so Copilot
>   works through layout, form, validation, and routing sequentially
>
> **What was improved:**
> - Specified the target file path and page-level FDS layout component
> - Named exact FDS form components instead of leaving input choice open
> - Added validation requirements to define the expected behaviour
> - Included routing integration so the page is immediately reachable
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

- Write all instructions and prompts for clarity — plain language, concrete
  examples, and the "why" behind every rule
- All generated code MUST use FDS components and tokens exclusively; do not
  suggest custom CSS primitives or third-party UI libraries
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

