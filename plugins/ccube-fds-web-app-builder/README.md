<div align="center">

# FDS Web App Builder

<img src="./docs/hero.jpg" alt="CCube mascots with a piggy bank" width="280">

*Build web applications with AI — strictly following the Flagship Design System*

<p align="center">
  <a href="https://designsystem.life.gov.sg/react/index.html?path=/docs/getting-started-installation--docs"><img src="https://img.shields.io/badge/Flagship_Design_System-FD8A65?style=for-the-badge&logo=storybook&logoColor=white" alt="Flagship Design System"></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Agents-2-555?style=for-the-badge&logo=githubactions&logoColor=white&labelColor=274183" alt="Agents">
  <img src="https://img.shields.io/badge/Skills-3-555?style=for-the-badge&logo=lightning&logoColor=white&labelColor=F6C063" alt="Skills">
</p>

</div>

---

## What This Plugin Does

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

## What Gets Installed

| File        | Location         | What it does                                                                             |
| ----------- | ---------------- | ---------------------------------------------------------------------------------------- |
| `.agent.md` | `agents/`        | Specialized AI agents that develop web applications within FDS constraints               |
| `SKILL.md`  | `skills/<name>/` | Domain-knowledge packages — FDS component catalog, theming guidance, project scaffolding |

---

## Agents

### Product Manager

Guided web application builder for product managers. Translates product goals
and requirements into working React applications using FDS — no coding
experience required.

**Example prompts:**

- "Build me a dashboard that shows monthly active users."
- "Create a contact form page with validation."
- "Add a settings page to the existing app."

### Prompt Refiner

Specialist subagent that rewrites vague prompts into specific, FDS-compliant,
execution-ready instructions before Copilot acts. Not user-facing — invoked
automatically by the Product Manager agent when needed.

---

## Skills

### `cc-design-system`

Activated when Copilot needs to look up FDS component usage, tokens, theming,
or accessibility patterns. Routes to the correct version of the FDS Storybook
(v3 or v4) based on the installed package version.

---

### `cc-rabbit-deploy`

Activated when a user wants to deploy their project to GCC using Rabbit Deploy
(GovTech CIO Office). Covers git initialisation, Project Access Token setup,
configuring the Rabbit Deploy GitLab remote, and pushing code to trigger
automatic CI/CD deployment.

---

### `cc-vite-react-ds`

Activated when a user wants to create or build a new web application using the
Flagship Design System. Provides guidance on:

- Tech stack — Vite, React, TypeScript
- Design system — FDS components, design tokens, spacing, colour, and typography
- Accessibility — WCAG compliance patterns enforced by default
- Component patterns — FDS-compliant compositions and usage patterns

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

### FDS Project Scaffolding

This plugin provides a guided scaffolding workflow that initialises a
production-ready React project pre-wired for the Flagship Design System.
Simply describe what you want to build and Copilot automatically invokes the
scaffolding skill — setting up Vite + React, installing and configuring FDS
packages, routing, theming, and a base layout — so you start inside a
correctly structured codebase rather than retrofitting FDS onto a blank
project.

The scaffolding skill checks whether an FDS-compatible project already exists
before making any changes. If a valid setup is detected it adds only the
missing pieces, so running it on an existing project is safe.

**What gets created:**

| Output                    | Description                                                     |
| ------------------------- | --------------------------------------------------------------- |
| Vite + React project      | TypeScript template with path aliases configured                |
| FDS packages              | `@lifesg/react-design-system` and peer dependencies installed   |
| Theme provider            | `ThemeProvider` wrapping the app root with the Life SG theme    |
| Global CSS reset          | FDS-compatible baseline styles applied                          |
| App router                | `react-router-dom` with a root layout and a sample home route   |
| `src/` folder conventions | `pages/`, `components/`, `hooks/`, `utils/` directories created |

---

## Telemetry

This plugin collects anonymous usage data to help understand how
many people install it and which agents are used most. No PII,
file contents, or workspace data is ever collected.

**What is sent on each session start:**

- A random anonymous ID (generated locally at
  `~/.ccube/telemetry-id`, reused across sessions)
- The plugin name
- The agent name (e.g. `cc-product-manager`)
- A UTC timestamp

**How to opt out:**

Add the following to your shell profile (`~/.zshrc`, `~/.bashrc`,
or `~/.profile`) and restart VS Code:

```bash
export CCUBE_TELEMETRY_DISABLED=1
```

See [docs/telemetry/DESIGN.md](../../docs/telemetry/DESIGN.md) for
the full privacy and data schema documentation.
