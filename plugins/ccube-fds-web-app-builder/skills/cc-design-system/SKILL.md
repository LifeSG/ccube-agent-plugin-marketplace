---
name: "cc-design-system"
description: "Flagship Design System (FDS) knowledge for @lifesg/react-design-system — component catalogue, token reference, and Figma-to-FDS mapping heuristics. Use when implementing UI with FDS components or analysing which Figma elements can be fulfilled by FDS."
argument-hint: "Ask about specific FDS components, token usage, or Figma element mapping"
user-invocable: false
---

# Flagship Design System Knowledge Skill

This skill provides structured knowledge about the LifeSG Flagship Design System (FDS) for use during Figma-to-code translation and frontend implementation.

## Version Context

This skill targets **`@lifesg/react-design-system` v3.x** (current stable).

| Version                        | npm tag                | Storybook                                            |
| ------------------------------ | ---------------------- | ---------------------------------------------------- |
| **v3 (stable, this skill)**    | `^3`                   | https://designsystem.life.gov.sg/react/index.html    |
| v4 (alpha — not yet supported) | `latest` as of 2026-03 | https://designsystem.life.gov.sg/react/v4/index.html |

**Before using this skill, determine the installed FDS version:**

1. Read `package.json` in the project root.
2. If the installed version is `^3.x` (or no version specifier on an older
   project) → use `resources/` (this skill's default folder) and the
   v3 Storybook URL above.
3. If the installed version is `^4.x` → the `resources-v4/` folder is not
   yet populated. Inform the user, then refer directly to the v4 Storybook
   at https://designsystem.life.gov.sg/react/v4/index.html for component
   API details. Do NOT use v3 resources for v4 projects — the
   `ThemeProvider` API, CSS import steps, and `styled-components` peer
   dependency have all changed.

## Package

```
@lifesg/react-design-system
```

Online reference: https://designsystem.life.gov.sg/react/index.html

## Resources in This Skill

### Component catalogue (split by Storybook group)

The component catalogue is split into one file per group, mirroring the
Storybook left-hand sidebar. Load only the file(s) relevant to the components
you need.

| Group                | File                                                   | Contains (documented so far)                   |
| -------------------- | ------------------------------------------------------ | ---------------------------------------------- |
| Index + quick lookup | `resources/component-catalogue.md`                     | Figma → FDS quick lookup table, Known FDS Gaps |
| Core                 | `resources/component-catalogue-core.md`                | Layout, Typography                             |
| Content              | `resources/component-catalogue-content.md`             | Accordion, Card                                |
| Selection and input  | `resources/component-catalogue-selection-input.md`     | Button, Checkbox, RadioButton                  |
| Feedback indicators  | `resources/component-catalogue-feedback-indicators.md` | Alert                                          |
| Overlays             | `resources/component-catalogue-overlays.md`            | Modal (legacy), ModalV2                        |
| Form                 | `resources/component-catalogue-form.md`                | Input, Form.Input, Form.Select (InputSelect)   |

### Other resources

- **`resources/foundations-tokens.md`**: Design token reference — `Colour`,
  `Spacing`, `Font`, and other foundation tokens for use in custom
  `styled-components`.
- **`resources/theme-setup.md`**: Project setup, `ThemeProvider` wiring,
  available theme presets, `DSThemeProvider`, and theme customisation.
- **`resources/layout-composition-patterns.md`**: Page-level aesthetic
  patterns — page shell structure, spacing rhythm, visual hierarchy,
  card composition, dashboard grids, table polish, and form layout
  recipes. Read this **after** selecting components and **before**
  writing or delegating page implementation.

## How to Use This Skill

### When mapping Figma elements to FDS components

1. Read `resources/component-catalogue.md` — scan the
   `## Figma → FDS Quick Lookup` table first to identify the candidate
   component and its group.
2. Load the group file for that component (see table above).
3. Check the component's props and variants to confirm it can satisfy the
   design.
4. If no direct match exists, check the Composition Patterns section in the
   group file for multi-component combinations.
5. If no composition covers the need, fall back to
   `resources/foundations-tokens.md` for token-based styling.

### When writing custom styled-components (tokens needed)

1. Read `resources/foundations-tokens.md` — look up the `Colour`, `Spacing`,
   or `Font` token table.
2. Use `${Colour["token-key"]}` or `${Spacing["token-key"]}` directly in
   styled-components template literals.
3. Never hardcode hex, px, or rem values — always use tokens.

### When composing visually polished page layouts

1. Read `resources/layout-composition-patterns.md` — identify the page
   recipe that best matches the type of page being built (dashboard,
   form, list/transaction).
2. Apply the page shell pattern (every page starts with
   `Layout.Section` > `Layout.Container` > `Layout.Content`).
3. Apply the spacing rhythm table for consistent vertical gaps.
4. Apply the visual hierarchy text levels (at least three distinct
   Typography sizes per page).
5. Apply the relevant composition patterns (card grids, table cards,
   form grouping) from the recipes.
6. Cross-check against the anti-patterns table — fix any matches.

### When setting up a new project or configuring a theme

1. Read `resources/theme-setup.md` — follow the four installation steps in
   order.
2. **To force light mode**, pass `LifeSGTheme.light` (not the bare
   `LifeSGTheme`) to `DSThemeProvider` — the bare theme follows the user's
   system `prefers-color-scheme`. There is **no `colorScheme` prop**.
3. For dark mode, runtime user toggle, or `useDSTheme` hook usage, refer to
   the Dark Mode section in `resources/theme-setup.md`.

### When looking up a specific component

1. Check the table above to identify the correct group file.
2. Read that group file and search for the component name. Each entry
   includes:
   - Import path
   - Key props/variants
   - When to use vs. when to compose instead
   - Notes on known limitations

### When verifying coverage

The FDS decision order is:
1. Direct component use
2. Props / variant customisation
3. Composing multiple FDS components
4. FDS tokens + primitive HTML (`resources/foundations-tokens.md`)
5. Fully custom (last resort)

Any element that reaches step 4 or 5 MUST be flagged in the DS Coverage Plan.
