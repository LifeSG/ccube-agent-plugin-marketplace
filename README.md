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

## Updating

To pull the latest version of installed plugins, open the Command Palette
(**⇧⌘P**) and run **Chat: Update Plugins**.

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

