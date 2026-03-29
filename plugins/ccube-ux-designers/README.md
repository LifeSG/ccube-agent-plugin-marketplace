<div align="center">

# UX Designers

*AI-powered design system documentation — from live docs to DESIGN.md*

<p align="center">
  <img src="https://img.shields.io/badge/Agents-0-555?style=for-the-badge&logo=githubactions&logoColor=white&labelColor=274183" alt="Agents">
  <img src="https://img.shields.io/badge/Skills-1-555?style=for-the-badge&logo=lightning&logoColor=white&labelColor=F6C063" alt="Skills">
</p>

</div>

---

## What This Plugin Does

This plugin gives GitHub Copilot the knowledge and workflow to create
accurate, validated `DESIGN.md` files by browsing live design system
documentation directly in the integrated browser.

A `DESIGN.md` is a plain-text design system document readable by both
humans and AI design agents (such as Google Stitch). It captures a
project's visual identity — colours, typography, spacing, elevation, and
component patterns — in technology-agnostic design language with no code.

---

## Key Capabilities

### Live Documentation Browsing — No Guessing

Instead of relying on training data, the `cc-design-md` skill opens
and navigates your design system's live Storybook (or equivalent
docs) directly inside the VS Code integrated browser. Colour hex
values, typography scales, spacing units, border radii, and
elevation levels are extracted from what the page actually shows —
not estimated from memory.

### Validated Token Extraction

Every design value written into the `DESIGN.md` is verified against
what the live documentation displays. The skill will never output a
`#hex` colour or spacing value it has not seen on-screen. The result
is a `DESIGN.md` that accurately reflects the current state of your
design system — not a cached snapshot from months ago.

---

## What Gets Installed

| Type  | Name           | Purpose                                        |
| ----- | -------------- | ---------------------------------------------- |
| Skill | `cc-design-md` | Workflow for creating a validated DESIGN.md by |
|       |                | browsing live design system documentation      |

---

## Skills

### `cc-design-md`

Activated when a user wants to create or update a `DESIGN.md` file from
a design system's online documentation. The skill guides the agent to:

- Open and navigate the design system's Storybook (or equivalent docs)
  inside the integrated browser
- Extract exact colour hex values, typography scales, spacing systems,
  border radius tokens, and elevation descriptions directly from the
  live documentation
- Write a `DESIGN.md` in the correct Stitch format: design intent only,
  no code, no framework references
- Validate every value against what the browser shows — never rely on
  memory or assumptions

**Example prompts:**

- "Create a DESIGN.md for our design system from the Storybook docs."
- "Generate a DESIGN.md based on the FDS documentation."
- "Update our DESIGN.md to match the latest design tokens."

---

## Format Reference

The `DESIGN.md` format follows the
[Google Stitch DESIGN.md specification](https://stitch.withgoogle.com/docs/design-md/format).
Key rules:

- Plain markdown — no YAML front matter, no code blocks
- Sections in order: Overview, Colors, Typography, Elevation, Spacing,
  Components, Do's and Don'ts
- Hex values must be exact (sourced from live docs, not guessed)
- No framework component names, import paths, or token variable names
