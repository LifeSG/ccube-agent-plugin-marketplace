<div align="center">

<h1>
  <img src="docs/assets/Citizen-collective-logo.png" alt="Citizen Collective logo" height="48">
  CCube Copilot Plugin Marketplace
</h1>

*A curated collection of GitHub Copilot agent plugins for the Singapore Government digital ecosystem*

<img src="docs/assets/hero.jpg" alt="CCube mascots" width="280">

<p align="center">
  <a href="plugins/"><img src="https://img.shields.io/badge/Plugins-4-555?style=for-the-badge&logo=visualstudiocode&logoColor=white&labelColor=3c873a" alt="Plugins"></a>
</p>

</div>

---

## About

This repository is a marketplace of GitHub Copilot agent plugins. Each plugin
ships a curated set of customization files — agents, instruction files, prompts,
and skills — that are installed directly into a user's VS Code workspace.

Plugins are independent and self-contained. Install only the ones relevant to
your project.

---

## Plugins

| Plugin                                                          | Description                                                                                                                                                                                                                      |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ccube-fds-web-app-builder](plugins/ccube-fds-web-app-builder/) | Turns Copilot into an AI web app developer that builds React applications strictly following the [Flagship Design System (FDS)](https://designsystem.life.gov.sg/react/index.html?path=/docs/getting-started-installation--docs) |
| [ccube-frontend-dev](plugins/ccube-frontend-dev/)               | VS Code agent plugin for frontend development knowledge — React 18/19 patterns, React fundamentals, CSS essentials, and styled-components best practices                                                                         |
| [ccube-software-craft](plugins/ccube-software-craft/)           | Brings principal-level software engineering knowledge into Copilot — architecture decisions, system design, clean code, git workflow, EP authoring, and markdown standards                                                       |
| [ccube-ux-designers](plugins/ccube-ux-designers/)               | Gives Copilot the knowledge to create validated `DESIGN.md` files by browsing live design system documentation directly in the integrated browser                                                                                |

---

## Installation

**Step 1 — Register this marketplace in VS Code**

Open your VS Code **User Settings JSON** (**⇧⌘P** → `Open User Settings (JSON)`) and add this repository URL to the `chat.extensionAgentPlugins` array:

```json
{
  "chat.extensionAgentPlugins": [
    "https://sgts.gitlab-dedicated.com/wog/gvt/lifesg/gvt-lifesg/ccubesg/libraries/ccube-vsc-agent-plugin-marketplace.git"
  ]
}
```

**Step 2 — Install individual plugins**

> **Note:** The Agent Plugins section requires the agent plugins experimental
> feature to be enabled in VS Code. If you do not see the section, open
> **User Settings JSON** and add:
> ```json
> "chat.plugins.enabled": true
> ```

VS Code does not install all plugins automatically. To install a specific plugin:

1. Open the **Extensions** view (**⇧⌘X**)
2. Locate the plugin under the **Agent Plugins** section
3. Click **Install** on the plugin you want

For more details on agent plugins, see the [VS Code Agent Plugins documentation](https://code.visualstudio.com/docs/copilot/customization/agent-plugins).

---

## Quick Start — Product Manager

Get from zero to a working React app in under five minutes.

1. Install the **ccube-fds-web-app-builder** and **ccube-software-craft** plugins (see [Installation](#installation))
   — the software craft plugin enables code quality checks and commit automation behind the scenes
2. Open Copilot Chat (**⌃⌘I**)
3. Switch to the **Product Manager** agent mode from the agent picker dropdown
4. Paste this prompt and hit Enter:

   ```
   I want to build a citizen feedback portal. It should have a home page
   and a feedback form page. This is a new project.
   ```

5. The agent will ask a few clarifying questions, scaffold the project, and build the pages — all using the [Flagship Design System](https://designsystem.life.gov.sg)

No coding knowledge required. The agent explains every decision in plain language.

---

## Quick Start — Software Engineer

Add principal-level engineering knowledge to your Copilot workflow.

1. Install the **ccube-software-craft** and **ccube-frontend-dev** plugins (see [Installation](#installation))
2. Open Copilot Chat (**⌃⌘I**) in any project
3. 3. Switch to the **CC Software Engineer** agent mode from the agent picker dropdown


**Draft an Enhancement Proposal** — use the `/cc-create-ep` slash command:

```
/cc-create-ep Add a notification service that sends email and push
notifications when a citizen's application status changes.
```

**Plan an implementation** — use the `/cc-plan-implementation` slash command:

```
/cc-plan-implementation Plan the implementation for the notification
service EP.
```

**Get architecture advice** — switch to the **CC Software Engineer** agent mode, then paste:

```
We're scaling from 1k to 100k users — what needs to change
in our current monolith?
```

**Commit your work** — use the `/cc-git-commit` slash command:

```
/cc-git-commit
```

The skill groups your changed files into logical atomic commits and proposes Conventional Commit messages — nothing is staged without your approval.

---

## Updating

To pull the latest version of installed plugins, open the Command Palette
(**⇧⌘P**) and run **Chat: Update Plugins**.

---



## Contributing

### Prerequisites

- VS Code with the [GitHub Copilot extension](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)
- [Node.js](https://nodejs.org/en/download) (LTS recommended)
- Familiarity with [Copilot customization file formats](https://code.visualstudio.com/docs/copilot/copilot-customization)

### First-time setup

After cloning, run the setup script to install dependencies and activate
the committed git hooks:

```bash
npm run setup
```

This installs `git-cliff` (the changelog generator) and wires up the
pre-commit hook that keeps README badge counts in sync automatically.

To update the badge counts manually at any time without committing:

```bash
bash scripts/update-counts.sh
```

### Updating the changelog

The correct time to update `CHANGELOG.md` depends on the branch you are
working on.

**Working directly on `main`** — every commit is a release:

Update `CHANGELOG.md` as part of every commit to `main`. The changelog
entry must be included in the same commit as the code change.

**Working on a feature branch** — changes are batched before release:

Do not update `CHANGELOG.md` during development on the branch. Update it
as the final step before merging back to `main`.

In both cases, generate entries automatically from commits since the last
release tag, then edit as needed:

```bash
npm run changelog
```

To regenerate the full `CHANGELOG.md` from scratch:

```bash
npm run changelog:init
```

Changelog entries are grouped by plugin scope (e.g. `ccube-software-craft`).
This works automatically when commits follow the
[scope conventions in AGENT.md](AGENT.md#git-commit-conventions).

### Adding a new plugin

See the step-by-step guide in [AGENT.md](AGENT.md#adding-a-new-plugin).

### Submitting changes

1. Clone the repository and create a feature branch
2. Author or update the relevant customization files following the standards in [AGENT.md](AGENT.md)
3. Open a merge request with a clear description of what changed and why

---

## Repository Governance

Detailed authoring rules, canonical front matter templates, and AI agent
guidance live in [AGENT.md](AGENT.md). That file is the authoritative source of
truth for anyone (human or AI) contributing to this marketplace.

---

<div align="center">

Built with care for the Singapore Government digital ecosystem.

</div>

