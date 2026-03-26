---
name: cc-design-md
description: >-
  Create or update a DESIGN.md file by browsing a design system's live
  online documentation (Storybook or equivalent) using the integrated
  browser. Use when the user asks to generate or update a DESIGN.md from
  a design system's documentation URL.
---

# Create DESIGN.md from Live Design System Documentation

## Purpose

This skill produces a validated `DESIGN.md` file by reading values directly
from a design system's live online documentation using the integrated browser.

A `DESIGN.md` is a plain-text design system document readable by both humans
and AI design agents (such as Google Stitch). It encodes a project's visual
identity — colours, typography, spacing, elevation, and component patterns —
in technology-agnostic design language with no code, no framework component
names, and no token variable syntax.

---

## Format Reference — DESIGN.md Sections

Every `DESIGN.md` follows this section order. Omit sections not covered by
the design system being documented, but preserve the order for sections that
are included.

| Section         | What it contains                                                |
| --------------- | --------------------------------------------------------------- |
| Overview        | Personality and aesthetic intent in plain prose                 |
| Colors          | Named colours with exact hex values and their semantic roles    |
| Typography      | Font families, size scale, weight usage per level               |
| Elevation       | How depth is conveyed — shadows, borders, surface layering      |
| Spacing         | Base grid and spacing scale in px with usage guidance           |
| Components      | Visual traits of key UI atoms (radius, border, padding, states) |
| Do's and Don'ts | Guardrails and common pitfalls                                  |

**Critical format rules** (MUST follow):

- Plain markdown — no YAML front matter, no code blocks, no backticks around
  values
- No framework component names (e.g. `Button.Default`, `Form.Input`)
- No token variable names (e.g. `Colour["text-primary"]`, `spacing-16`)
- No import paths or build-tool references
- Hex values must use `#RRGGBB` uppercase notation and be sourced from the
  live documentation — never guessed or approximated
- Font sizes in px (convert from rem if the docs use rem: multiply by 16)

---

## Execution Workflow

### Step 1 — Gather Requirements

Collect the following before proceeding. Ask for any that are missing:

1. **Documentation URL** — the Storybook or design system docs URL to browse
2. **Output file path** — where to write the `DESIGN.md`
3. **Theme** — if the design system supports multiple themes (e.g. LifeSG,
   BookingSG), confirm which theme to document

---

### Step 2 — Open the Documentation in the Integrated Browser

Open the provided URL in the integrated browser. Wait for the page to fully
load before proceeding.

If the page renders inside an iframe (common in Storybook), extract the
iframe content using Playwright:

```
const iframe = page.frameLocator('iframe').first();
const content = await iframe.locator('body').innerText();
```

---

### Step 3 — Discover Navigation Structure

Before extracting values, map the available documentation sections to know
which URLs to visit. Extract sidebar links from the navigation:

```
const links = await page.locator('nav a').all();
```

For Storybook sites, the story ID pattern is
`/docs/<group>-<sub-group>--docs`. Expand collapsed sections in the sidebar
by clicking their toggle buttons if links are not yet visible.

If a URL returns "Couldn't find story matching", the story ID is incorrect —
go back to the sidebar and find the correct link by clicking through the
navigation.

---

### Step 4 — Extract Colours

Navigate to the colours documentation for the target theme. Look for:

- **Primitive colour palette** — the source-of-truth hex swatches
  (labels like "primary-50", "neutral-20", "error-40")
- **Semantic colour roles** — which primitive maps to which role
  (labels like "text", "bg-inverse", "border-error")

Extract the hex values for these roles at minimum:

| Role            | What to look for in docs                            |
| --------------- | --------------------------------------------------- |
| Primary         | The main brand / CTA colour (e.g. `primary-50`)     |
| Secondary       | Supporting interactive colour                       |
| Surface         | Default page/card background (usually `bg` → white) |
| On-surface      | Primary text colour on the surface                  |
| Neutral         | Border and divider colour                           |
| Success         | Positive state text or fill colour                  |
| Warning         | Cautionary state text or fill colour                |
| Error           | Error state text or fill colour                     |
| Info            | Informational state text or fill colour             |
| Inverse surface | Dark background for inverted regions                |

**Validation rule**: Every hex value in the DESIGN.md Colors section MUST
appear verbatim in the browser-extracted text from the live documentation.
Do not substitute values from memory.

---

### Step 5 — Extract Typography

Navigate to the font/typography documentation. Extract:

- Font family names (e.g. "Open Sans", "Inter")
- Size scale in px for each typographic level (headlines, body, labels)
  - If sizes are in rem, multiply by 16 to convert to px
- Weight usage per level (regular, medium, semi-bold, bold)
- Line height where available

Map the extracted scale to these levels:

| Level           | Typical size range |
| --------------- | ------------------ |
| Page title      | 32–48px            |
| Section heading | 20–32px            |
| Card heading    | 16–22px            |
| Body            | 14–16px            |
| Support text    | 12–14px            |
| Caption/label   | 10–12px            |

---

### Step 6 — Extract Spacing

Navigate to the spacing documentation. Extract:

- Base grid unit (commonly 4px or 8px)
- Named spacing scale tokens and their px values
- Common usage descriptions if provided

Present as a table in the DESIGN.md with columns: px value, use case.

---

### Step 7 — Extract Border Radius

Navigate to the radius/border documentation. Extract:

- Named radius tokens and their px values (e.g. sm=4px, md=8px, full=9999px)
- Which components use which radius sizes

---

### Step 8 — Extract Elevation / Shadow

Navigate to the shadow documentation if available. Extract:

- Whether the design system uses shadows or flat treatment
- Shadow blur, spread, and colour for each elevation level

If no shadow docs exist, infer from card/modal component documentation.

---

### Step 9 — Survey Key Component Patterns

Browse the component documentation for the following component groups and
note visual traits (sizes, border widths, padding, corner radius, state
colours). Do NOT note any code or prop names.

Priority component groups to check:

1. Buttons — corner radius, fill vs. outline, sizes
2. Inputs / form fields — border width, padding, error state treatment
3. Cards — corner radius, shadow, internal padding
4. Navigation bar — structure, mobile behaviour
5. Alerts / banners — colour variants, icon treatment
6. Modals / drawers — backdrop, animation direction
7. Tags / badges — shape, colour tinting

---

### Step 10 — Write the DESIGN.md

Compose the file following the section order in the Format Reference above.

**For each section:**

- **Overview**: 2–4 sentences describing the aesthetic personality. Mention
  the colour mood, spacing feel, corner philosophy, and target audience.
- **Colors**: Bullet list. Each entry: `**Name** (#HEX): role description`.
  Include all roles identified in Step 4.
- **Typography**: Font family declarations followed by prose describing the
  size scale and weight usage for each level.
- **Elevation**: Prose + bullet list of elevation levels with shadow/border
  descriptions.
- **Spacing**: Prose introducing the base grid, followed by the spacing table
  from Step 6.
- **Components**: Bullet list per component. Each entry describes only visual
  traits — radius, border, padding px, fill/outline, state colours.
- **Do's and Don'ts**: 4–8 paired rules as a flat bullet list.

---

### Step 11 — Validate Before Writing

Before writing the file, verify:

- [ ] Every hex value in Colors appears verbatim in the extracted browser text
- [ ] Font family names match what the documentation states
- [ ] Font sizes have been converted from rem to px if needed
- [ ] Border radius values (px) match the radius token table
- [ ] No code, import paths, or token variable names appear anywhere
- [ ] No framework component names appear anywhere
- [ ] All six required sections are present (Overview through Do's and Don'ts)

If any check fails, return to the relevant step and re-extract from the
browser before writing.

---

## Example Output Shape

The output should read like this (excerpt):

```
# Design System

## Overview
A calm, professional interface for Singapore Government digital services.
...

## Colors
- **Primary** (#1768BE): CTAs, active states, key interactive elements
- **Error** (#9E130F): Validation errors, destructive actions
...

## Typography
- **Headline Font**: Open Sans
- **Body Font**: Open Sans

Page titles use semi-bold at 40px. Section headings use semi-bold at 26px.
Body text uses regular at 16px. ...

## Elevation
Cards use a soft 4–8px diffuse shadow with a 1px light border (#E2E8F0).
...

## Spacing
Based on a 4px grid.

| Gap  | Use for                        |
| ---- | ------------------------------ |
| 8px  | Icon-to-label, heading binding |
| 16px | Card internal padding          |
...

## Components
- **Buttons**: 8px corner radius. Primary uses solid brand blue fill
  with white label. ...
...

## Do's and Don'ts
- Do use the primary colour only for the single most important action
  per screen
- Don't mix rounded and sharp corner treatments on the same screen
```

---

## Common Pitfalls

| Pitfall                                           | How to avoid                                              |
| ------------------------------------------------- | --------------------------------------------------------- |
| Using Tailwind CSS or Material palette hex values | Always source hex from the live browser output            |
| Quoting React/Vue component names                 | Describe visual traits in plain English only              |
| Using token variable syntax like `spacing-16`     | Write "16px" instead                                      |
| Storybook story ID 404 errors                     | Click through the sidebar to find the correct URL         |
| rem values left unconverted                       | Multiply rem × 16 to get px before writing                |
| Iframe content not loading                        | Wait 3–4 seconds after navigation before extracting text  |
| Collapsed sidebar sections missing links          | Click the section toggle button first, then re-read links |
