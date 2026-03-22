---
name: "cc-design-system"
description: "Flagship Design System (FDS) knowledge for @lifesg/react-design-system — component catalogue, token reference, and Figma-to-FDS mapping heuristics. Use when implementing UI with FDS components or analysing which Figma elements can be fulfilled by FDS."
argument-hint: "Ask about specific FDS components, token usage, or Figma element mapping"
user-invokable: false
---

# Flagship Design System Knowledge Skill

This skill provides structured knowledge about the LifeSG Flagship Design System (FDS) for use during Figma-to-code translation and frontend implementation.

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
