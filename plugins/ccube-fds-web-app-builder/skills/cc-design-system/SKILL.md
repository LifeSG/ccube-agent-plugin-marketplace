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

- **`resources/component-catalogue.md`**: Figma → FDS component mapping. Quick lookup table + per-component entries with import paths, props, and Figma layer patterns.
- **`resources/foundations-tokens.md`**: Design token reference — `Colour`, `Spacing`, `Font`, and other foundation tokens for use in custom `styled-components`.
- **`resources/theme-setup.md`**: Project setup, `ThemeProvider` wiring, available theme presets, `DSThemeProvider`, and theme customisation.

## How to Use This Skill

### When mapping Figma elements to FDS components

1. Read `resources/component-catalogue.md` — scan the `## Figma → FDS Quick Lookup` table first.
2. For each candidate component, check its props and variants to confirm it can satisfy the design.
3. If no direct match exists, check the Composition Patterns section for multi-component combinations.
4. If no composition covers the need, fall back to `resources/foundations-tokens.md` for token-based styling.

### When writing custom styled-components (tokens needed)

1. Read `resources/foundations-tokens.md` — look up the `Colour`, `Spacing`, or `Font` token table.
2. Use `${Colour["token-key"]}` or `${Spacing["token-key"]}` directly in styled-components template literals.
3. Never hardcode hex, px, or rem values — always use tokens.

### When setting up a new project or configuring a theme

1. Read `resources/theme-setup.md` — follow the four installation steps in order.
2. **To force light mode**, pass `LifeSGTheme.light` (not the bare `LifeSGTheme`) to `DSThemeProvider` — the bare theme follows the user's system `prefers-color-scheme`. There is **no `colorScheme` prop**.
3. For dark mode, runtime user toggle, or `useDSTheme` hook usage, refer to the Dark Mode section in `resources/theme-setup.md`.

### When looking up a specific component

Search `resources/component-catalogue.md` by component name. Each entry includes:
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
