# FDS Foundations — Design Tokens

> Reference this file when writing custom `styled-components` that need colours, spacing, fonts, shadows,
> breakpoints, or motion values from FDS. Do NOT hardcode hex, px, or rem values — use tokens so they
> resolve correctly for the active theme.
>
> Import path for all tokens: `import { Colour, Spacing, Font } from "@lifesg/react-design-system/theme"`

---

## Token Usage Basics

### How to use tokens in styled-components

`Colour`, `Spacing`, and `Font` values are **styled-components interpolation functions** — interpolate them
directly inside tagged template literals. They resolve to the correct CSS value for the active `ThemeProvider` theme.

```ts
import { Colour, Spacing, Font } from "@lifesg/react-design-system/theme";
import styled from "styled-components";

const Card = styled.div`
  background: ${Colour["bg-stronger"]};
  padding: ${Spacing["spacing-16"]};
  ${Font["body-md-regular"]}
`;
```

### How to use tokens as constants (outside styled-components)

```ts
import { Colour, LifeSGTheme } from "@lifesg/react-design-system/theme";
import { useTheme } from "styled-components";

// In a React component — resolves based on current theme
const Component = () => {
  const theme = useTheme();
  const colour = Colour["text"]({ theme });
};

// With a fixed theme object (not reactive to theme switching)
const colour = Colour["text"]({ theme: LifeSGTheme });
```

### styled-components TypeScript setup (required once per project)

`Colour` and `Spacing` functions are typed to expect `ThemeSpec` in `props.theme`. Without this file,
every `${Colour[...]}` or `${Spacing[...]}` interpolation in a styled-component will emit a TypeScript error.

```ts
// src/styled.d.ts — create this file once at project root
import "styled-components";
import { ThemeSpec } from "@lifesg/react-design-system/theme/types";

declare module "styled-components" {
  export interface DefaultTheme extends ThemeSpec {
    maxColumns?: {
      xxs: 8; xs: 8; sm: 8; md: 8; lg: 12; xl: 12; xxl: 12;
    };
  }
}
```

---

## Anti-patterns — never do these

**CRITICAL: Never create a local token proxy file.**

A common mistake is creating a hand-rolled wrapper (e.g. `src/theme/tokens.ts`) that re-exports FDS tokens:

```ts
// WRONG — do not do this
export const Colors = {
  primary: 'var(--color-primary)',
  background: 'var(--color-bg)',
};
```

This is harmful because local constants are plain strings — they do not resolve theme overrides, and the app silently breaks when the theme changes.

**Other anti-patterns:**

| Anti-pattern                                              | Why it fails                                                            | Correct alternative                                            |
| --------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------- |
| `const bg = Colour['bg']` outside a template literal      | `Colour['bg']` is a function — renders as `[object Object]` in CSS      | Interpolate directly: `${Colour['bg']}`                        |
| Accessing `props.theme.colourScheme` in styled-components | Does not work without the `styled.d.ts` augmentation                    | Use `Colour[...]` / `Spacing[...]` interpolations instead      |
| Hardcoding `var(--color-*)` CSS variables                 | FDS internal variable names may change; do not adapt to theme switching | Use `Colour[...]` tokens                                       |
| Using `SpacingValues`                                     | This export does not exist                                              | Use `Spacing`                                                  |
| Using `Theme` (named export)                              | This export does not exist in `@lifesg/react-design-system/theme`       | Use a named preset: `LifeSGTheme`, `SupportGoWhereTheme`, etc. |

---

## Colour Tokens

> Import: `import { Colour } from "@lifesg/react-design-system/theme"`
> Prefer semantic tokens (below) over primitive colour tokens. Semantic tokens adapt to theme and dark mode automatically.

### Text colours

| Token key              | Use for                                    |
| ---------------------- | ------------------------------------------ |
| `text`                 | Default body text                          |
| `text-subtle`          | Secondary / supporting text                |
| `text-subtler`         | Tertiary / caption-like text               |
| `text-subtlest`        | Weakest text — muted labels, hints         |
| `text-primary`         | Brand-coloured text (links, active labels) |
| `text-hover`           | Text colour on hover states                |
| `text-selected`        | Text in selected/active state              |
| `text-disabled`        | Disabled state text                        |
| `text-disabled-subtle` | Subtle disabled text                       |
| `text-success`         | Success state text                         |
| `text-warning`         | Warning state text                         |
| `text-error`           | Inline validation error text               |
| `text-info`            | Informational state text                   |
| `text-inverse`         | Text on dark/inverted backgrounds          |

### Icon colours

| Token key             | Use for                 |
| --------------------- | ----------------------- |
| `icon`                | Default icon fill       |
| `icon-subtle`         | Subdued/secondary icon  |
| `icon-primary`        | Brand-coloured icon     |
| `icon-primary-subtle` | Muted brand icon        |
| `icon-hover`          | Icon on hover           |
| `icon-selected`       | Icon in selected state  |
| `icon-disabled`       | Disabled icon           |
| `icon-success`        | Success state icon      |
| `icon-warning`        | Warning state icon      |
| `icon-error`          | Error state icon        |
| `icon-info`           | Informational icon      |
| `icon-inverse`        | Icon on dark background |

### Border colours

| Token key             | Use for                                     |
| --------------------- | ------------------------------------------- |
| `border`              | Default input/card/divider borders          |
| `border-strong`       | Stronger divider or emphasis border         |
| `border-primary`      | Brand-coloured border                       |
| `border-focus`        | Focus ring on interactive elements          |
| `border-focus-strong` | Strong focus ring (accessibility highlight) |
| `border-hover`        | Border on hover                             |
| `border-selected`     | Selected/active state border                |
| `border-disabled`     | Disabled state border                       |
| `border-error`        | Error state border                          |
| `border-error-focus`  | Focus ring inside error state               |
| `border-success`      | Success state border                        |
| `border-warning`      | Warning state border                        |
| `border-info`         | Informational border                        |

### Background colours

| Token key             | Use for                                   |
| --------------------- | ----------------------------------------- |
| `bg`                  | Default surface background                |
| `bg-strong`           | Slightly elevated surface                 |
| `bg-stronger`         | Card/panel surface                        |
| `bg-hover`            | Background on hover                       |
| `bg-hover-neutral`    | Neutral hover (non-primary elements)      |
| `bg-selected`         | Selected item background                  |
| `bg-selected-strong`  | Strong selected state                     |
| `bg-disabled`         | Disabled element background               |
| `bg-primary`          | Brand-coloured fill                       |
| `bg-primary-subtle`   | Light brand tint                          |
| `bg-primary-subtlest` | Faintest brand tint                       |
| `bg-success`          | Success state background                  |
| `bg-success-strong`   | Strong success fill (badges, chips)       |
| `bg-warning`          | Warning state background                  |
| `bg-warning-strong`   | Strong warning fill                       |
| `bg-error`            | Error state background                    |
| `bg-error-strong`     | Strong error fill                         |
| `bg-info`             | Informational background                  |
| `bg-inverse`          | Dark/inverted background                  |
| `bg-available`        | Available/open slot (scheduling contexts) |
| `overlay-strong`      | Modal/drawer backdrop                     |
| `overlay-subtle`      | Soft overlay                              |

### Hyperlink colours

| Token key           | Use for                 |
| ------------------- | ----------------------- |
| `hyperlink`         | Default link colour     |
| `hyperlink-hover`   | Link on hover           |
| `hyperlink-visited` | Visited link            |
| `hyperlink-inverse` | Link on dark background |

### Focus

| Token key            | Use for                           |
| -------------------- | --------------------------------- |
| `focus-ring`         | Keyboard focus outline colour     |
| `focus-ring-inverse` | Focus outline on dark backgrounds |

---

## Spacing Tokens

> Import: `import { Spacing } from "@lifesg/react-design-system/theme"`
> Usage: `${Spacing["spacing-16"]}` — interpolate directly in a styled-components template literal.

| Token key     | Value | Common use                             |
| ------------- | ----- | -------------------------------------- |
| `spacing-0`   | 0px   | Reset / collapse                       |
| `spacing-4`   | 4px   | Tight intra-element gaps               |
| `spacing-8`   | 8px   | Icon-to-label gap, tight padding       |
| `spacing-12`  | 12px  | Input inner padding                    |
| `spacing-16`  | 16px  | Default component padding, card insets |
| `spacing-20`  | 20px  | Section gap within a panel             |
| `spacing-24`  | 24px  | Between related form fields            |
| `spacing-32`  | 32px  | Between form sections                  |
| `spacing-40`  | 40px  | Large section gap                      |
| `spacing-48`  | 48px  | Page section spacing                   |
| `spacing-64`  | 64px  | Hero / top-level spacing               |
| `spacing-72`  | 72px  | Extra-large structural spacing         |
| `layout-xs`   | —     | Layout grid gutter xs breakpoint       |
| `layout-sm`   | —     | Layout grid gutter sm breakpoint       |
| `layout-md`   | —     | Layout grid gutter md breakpoint       |
| `layout-lg`   | —     | Layout grid gutter lg breakpoint       |
| `layout-xl`   | —     | Layout grid gutter xl breakpoint       |
| `layout-xxl`  | —     | Layout grid gutter xxl breakpoint      |
| `layout-xxxl` | —     | Layout grid gutter xxxl breakpoint     |

---

## Font Tokens

> Import: `import { Font } from "@lifesg/react-design-system/theme"`
> `Font[key]` injects a full set of CSS font properties (family, size, weight, line-height, letter-spacing) as a styled-components CSS block.
> Use `Font.Spec[key]` to access individual font spec values (e.g. just the font size).

### When to use Font tokens vs Typography components

- Use `Typography.*` components (from `@lifesg/react-design-system/typography`) for all **rendered text content** in JSX.
- Use `Font[...]` tokens only when you need to **initialise text styles in a styled-component container** (e.g. to inherit to child elements, or to match an icon size to adjacent text).

```ts
import { Font } from "@lifesg/react-design-system/theme";
import styled from "styled-components";

// Apply font style to a container so child elements inherit it
const Container = styled.div`
  ${Font["heading-xxl-bold"]}
`;

// Match an inline icon height to the text size
const Icon = styled.svg`
  height: ${Font.Spec["heading-size-xxl"]};
`;
```

### Overriding font tokens

Font tokens can be overridden via the theme's `overrides.fontSpec` and `overrides.font` keys.
Font spec tokens should be `rem`-based to scale with the user's preferred font size.

```ts
import { LifeSGTheme } from "@lifesg/react-design-system/theme";
import { css } from "styled-components";

const customTheme: ThemeSpec = {
  ...LifeSGTheme,
  overrides: {
    fontSpec: {
      "heading-size-xxl": "5rem",
    },
    font: {
      "heading-body-light": css`
        font-family: serif;
        font-size: 1rem;
        font-weight: 300;
        line-height: 1.4rem;
        letter-spacing: 0;
      `,
    },
  },
};
```

> When overriding a font spec token, all font tokens that reference it will also reflect the new value.
> Use longhand CSS properties (e.g. `font-size`, not `font`) to avoid overwriting unrelated font values.

---

## Breakpoint / Media Query Tokens

> ⬜ Not yet documented — run `Add DS Foundation to Catalogue` with topic `Breakpoints` to add this section.

---

## Shadow Tokens

> ⬜ Not yet documented — run `Add DS Foundation to Catalogue` with topic `Shadow` to add this section.

---

## Border Radius Tokens

> ⬜ Not yet documented — run `Add DS Foundation to Catalogue` with topic `BorderRadius` to add this section.

---

## Z-index Tokens

> ⬜ Not yet documented — run `Add DS Foundation to Catalogue` with topic `ZIndex` to add this section.

---

## Motion Tokens

> ⬜ Not yet documented — run `Add DS Foundation to Catalogue` with topic `Motion` to add this section.
