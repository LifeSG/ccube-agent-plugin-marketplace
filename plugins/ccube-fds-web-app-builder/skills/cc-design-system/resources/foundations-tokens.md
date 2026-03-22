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
> Prefer semantic tokens (below) over primitive colour tokens.
> Semantic tokens adapt to theme and dark mode automatically.
> For cases where no semantic token applies, use the primitive escape hatch:
> `Colour.Primitive["neutral-100"]`

### Text colours

| Token key                | Use for                                    |
| ------------------------ | ------------------------------------------ |
| `text`                   | Default body text                          |
| `text-subtle`            | Secondary / supporting text                |
| `text-subtler`           | Tertiary / caption-like text               |
| `text-subtlest`          | Weakest text — muted labels, hints         |
| `text-primary`           | Brand-coloured text (links, active labels) |
| `text-hover`             | Text colour on hover states                |
| `text-selected`          | Text in selected / active state            |
| `text-selected-hover`    | Text in selected state on hover            |
| `text-disabled`          | Disabled state text                        |
| `text-disabled-subtle`   | Subtle disabled text                       |
| `text-disabled-subtlest` | Faintest disabled text                     |
| `text-selected-disabled` | Text in selected + disabled state          |
| `text-success`           | Success state text                         |
| `text-warning`           | Warning state text                         |
| `text-error`             | Inline validation error text               |
| `text-info`              | Informational state text                   |
| `text-inverse`           | Text on dark / inverted backgrounds        |

### Icon colours

| Token key                | Use for                           |
| ------------------------ | --------------------------------- |
| `icon`                   | Default icon fill                 |
| `icon-subtle`            | Subdued / secondary icon          |
| `icon-strongest`         | Highest-contrast icon (very dark) |
| `icon-primary`           | Brand-coloured icon               |
| `icon-primary-subtle`    | Muted brand icon                  |
| `icon-primary-subtlest`  | Faintest brand icon               |
| `icon-hover`             | Icon on hover                     |
| `icon-selected`          | Icon in selected state            |
| `icon-selected-hover`    | Icon in selected state on hover   |
| `icon-disabled`          | Disabled icon                     |
| `icon-disabled-subtle`   | Subtle disabled icon              |
| `icon-selected-disabled` | Icon in selected + disabled state |
| `icon-success`           | Success state icon                |
| `icon-warning`           | Warning state icon                |
| `icon-error`             | Error state icon                  |
| `icon-error-strong`      | Strong / filled error icon        |
| `icon-info`              | Informational icon                |
| `icon-inverse`           | Icon on dark background           |
| `icon-primary-inverse`   | Brand icon on inverted background |

### Border colours

| Token key                  | Use for                                     |
| -------------------------- | ------------------------------------------- |
| `border`                   | Default input / card / divider borders      |
| `border-strong`            | Stronger divider or emphasis border         |
| `border-stronger`          | Strongest border emphasis                   |
| `border-primary`           | Brand-coloured border                       |
| `border-primary-subtle`    | Muted brand-coloured border                 |
| `border-focus`             | Focus ring on interactive elements          |
| `border-focus-strong`      | Strong focus ring (accessibility highlight) |
| `border-hover`             | Border on hover                             |
| `border-hover-strong`      | Strong border on hover                      |
| `border-selected`          | Selected / active state border              |
| `border-selected-subtle`   | Subtle selected state border                |
| `border-selected-subtlest` | Faintest selected state border              |
| `border-selected-hover`    | Selected state border on hover              |
| `border-disabled`          | Disabled state border                       |
| `border-selected-disabled` | Selected + disabled state border            |
| `border-error`             | Error state border                          |
| `border-error-focus`       | Focus ring inside error state               |
| `border-error-strong`      | Strong error state border                   |
| `border-success`           | Success state border                        |
| `border-warning`           | Warning state border                        |
| `border-info`              | Informational border                        |

### Background colours

| Token key                      | Use for                                     |
| ------------------------------ | ------------------------------------------- |
| `bg`                           | Default surface background                  |
| `bg-strong`                    | Slightly elevated surface                   |
| `bg-stronger`                  | Card / panel surface                        |
| `bg-strongest`                 | Highest elevation surface                   |
| `bg-hover`                     | Background on hover                         |
| `bg-hover-strong`              | Strong hover background                     |
| `bg-hover-subtle`              | Subtle hover background                     |
| `bg-hover-neutral`             | Neutral hover (non-primary elements)        |
| `bg-hover-neutral-strong`      | Strong neutral hover background             |
| `bg-selected`                  | Selected item background                    |
| `bg-selected-hover`            | Selected item background on hover           |
| `bg-selected-strong`           | Strong selected state                       |
| `bg-selected-strongest`        | Strongest selected fill                     |
| `bg-selected-strongest-hover`  | Strongest selected fill on hover            |
| `bg-disabled`                  | Disabled element background                 |
| `bg-selected-disabled`         | Selected + disabled background              |
| `bg-primary`                   | Brand-coloured fill                         |
| `bg-primary-subtle`            | Subtle brand tint                           |
| `bg-primary-subtler`           | Lighter brand tint                          |
| `bg-primary-subtlest`          | Faintest brand tint                         |
| `bg-primary-hover`             | Brand background on hover                   |
| `bg-primary-subtlest-hover`    | Faintest brand tint on hover                |
| `bg-primary-subtlest-selected` | Faintest brand tint in selected state       |
| `bg-success`                   | Success state background                    |
| `bg-success-hover`             | Success background on hover                 |
| `bg-success-strong`            | Strong success fill (badges, chips)         |
| `bg-success-strong-hover`      | Strong success fill on hover                |
| `bg-warning`                   | Warning state background                    |
| `bg-warning-hover`             | Warning background on hover                 |
| `bg-warning-strong`            | Strong warning fill                         |
| `bg-warning-strong-hover`      | Strong warning fill on hover                |
| `bg-error`                     | Error state background                      |
| `bg-error-hover`               | Error background on hover                   |
| `bg-error-strong`              | Strong error fill                           |
| `bg-error-strong-hover`        | Strong error fill on hover                  |
| `bg-info`                      | Informational background                    |
| `bg-info-hover`                | Informational background on hover           |
| `bg-info-strong`               | Strong informational fill                   |
| `bg-info-strong-hover`         | Strong informational fill on hover          |
| `bg-inverse`                   | Dark / inverted background                  |
| `bg-inverse-subtle`            | Subtle inverted background                  |
| `bg-inverse-subtler`           | Lighter inverted background                 |
| `bg-inverse-subtlest`          | Faintest inverted background                |
| `bg-inverse-hover`             | Inverted background on hover                |
| `bg-available`                 | Available / open slot (scheduling contexts) |
| `overlay-strong`               | Modal / drawer backdrop                     |
| `overlay-subtle`               | Soft overlay                                |

### Hyperlink colours

| Token key           | Use for                 |
| ------------------- | ----------------------- |
| `hyperlink`         | Default link colour     |
| `hyperlink-inverse` | Link on dark background |

### Focus

| Token key            | Use for                           |
| -------------------- | --------------------------------- |
| `focus-ring`         | Keyboard focus outline colour     |
| `focus-ring-inverse` | Focus outline on dark backgrounds |

### Overriding

Override primitive tokens to cascade to all semantic tokens that reference them.
Override semantic tokens individually for targeted changes.

```ts
import { Colour, LifeSGTheme } from "@lifesg/react-design-system/theme";

const customTheme: ThemeSpec = {
  ...LifeSGTheme,
  overrides: {
    primitiveColour: {
      "primary-50": "#1768BE",
    },
    semanticColour: {
      "text-warning": Colour.Primitive["warning-10"],
      "text-error": "#A04747",
    },
  },
};
```

> For dark mode, use `primitiveColourDark` / `semanticColourDark` keys instead.

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

> Use `MediaQuery` for responsive styled-components rules and `Breakpoint` to read
> pixel values at runtime.
> Import:
> `import { MediaQuery, Breakpoint } from "@lifesg/react-design-system/theme"`

### Usage

`MediaQuery.MaxWidth.<tier>` and `MediaQuery.MinWidth.<tier>` inject a full
`@media` rule into a styled-component template literal.
Use `Breakpoint["<tier>-min"]` / `Breakpoint["<tier>-max"]` to access the raw
pixel value at runtime (e.g. for JS conditional logic).

```ts
import { Breakpoint, MediaQuery } from "@lifesg/react-design-system/theme";
import styled from "styled-components";
import { useTheme } from "styled-components";

// Desktop-first: hide on xs and below
const Panel = styled.div`
  display: block;
  ${MediaQuery.MaxWidth.xs} {
    display: none;
  }
`;

// Mobile-first: two columns from lg upward
const Grid = styled.div`
  columns: 1;
  ${MediaQuery.MinWidth.lg} {
    columns: 2;
  }
`;

// Runtime value — compare against current window width
const Component = () => {
  const theme = useTheme();
  const tabletMin = Breakpoint["md-min"]({ theme });
  return window.innerWidth > tabletMin ? <Wide /> : <Narrow />;
};
```

### Breakpoint tiers

| Tier  | Screen width   | `*-min` value | `*-max` value | Columns | Gutter | Margin |
| ----- | -------------- | ------------- | ------------- | ------- | ------ | ------ |
| `xxs` | 0 – 320 px     | —             | 320 px        | 8       | 16 px  | 24 px  |
| `xs`  | 321 – 375 px   | 321 px        | 375 px        | 8       | 16 px  | 24 px  |
| `sm`  | 376 – 480 px   | 376 px        | 480 px        | 8       | 16 px  | 24 px  |
| `md`  | 481 – 768 px   | 481 px        | 768 px        | 8       | 16 px  | 24 px  |
| `lg`  | 769 – 1200 px  | 769 px        | 1200 px       | 12      | 32 px  | 48 px  |
| `xl`  | 1201 – 1440 px | 1201 px       | 1440 px       | 12      | 32 px  | 48 px  |
| `xxl` | ≥ 1441 px      | 1441 px       | —             | 12      | 32 px  | 48 px  |

### `Breakpoint` token keys

Each key returns a raw `number` (pixels) when called with `{ theme }`.

| Token key    | Value | Use for                          |
| ------------ | ----- | -------------------------------- |
| `xxs-max`    | 320   | Max-width JS check for xxs       |
| `xs-min`     | 321   | Min-width JS check for xs        |
| `xs-max`     | 375   | Max-width JS check for xs        |
| `sm-min`     | 376   | Min-width JS check for sm        |
| `sm-max`     | 480   | Max-width JS check for sm        |
| `md-min`     | 481   | Min-width JS check for md        |
| `md-max`     | 768   | Max-width JS check for md        |
| `lg-min`     | 769   | Min-width JS check for lg        |
| `lg-max`     | 1200  | Max-width JS check for lg        |
| `xl-min`     | 1201  | Min-width JS check for xl        |
| `xl-max`     | 1440  | Max-width JS check for xl        |
| `xxl-min`    | 1441  | Min-width JS check for xxl       |
| `xxs-column` | 8     | Grid column count for xxs–md     |
| `xs-column`  | 8     | Grid column count for xs         |
| `sm-column`  | 8     | Grid column count for sm         |
| `md-column`  | 8     | Grid column count for md         |
| `lg-column`  | 12    | Grid column count for lg–xxl     |
| `xl-column`  | 12    | Grid column count for xl         |
| `xxl-column` | 12    | Grid column count for xxl        |
| `xxs-gutter` | 16    | Column gutter (px) for xxs–md    |
| `xs-gutter`  | 16    | Column gutter (px) for xs        |
| `sm-gutter`  | 16    | Column gutter (px) for sm        |
| `md-gutter`  | 16    | Column gutter (px) for md        |
| `lg-gutter`  | 32    | Column gutter (px) for lg–xxl    |
| `xl-gutter`  | 32    | Column gutter (px) for xl        |
| `xxl-gutter` | 32    | Column gutter (px) for xxl       |
| `xxs-margin` | 24    | Horizontal inset (px) for xxs–md |
| `xs-margin`  | 24    | Horizontal inset (px) for xs     |
| `sm-margin`  | 24    | Horizontal inset (px) for sm     |
| `md-margin`  | 24    | Horizontal inset (px) for md     |
| `lg-margin`  | 48    | Horizontal inset (px) for lg–xxl |
| `xl-margin`  | 48    | Horizontal inset (px) for xl     |
| `xxl-margin` | 48    | Horizontal inset (px) for xxl    |

### Overriding

Breakpoint values can be overridden via `ThemeSpec.overrides.breakpoint`.
All `MediaQuery` helpers automatically reflect the overridden values.

```ts
import { LifeSGTheme } from "@lifesg/react-design-system/theme";

const customTheme: ThemeSpec = {
  ...LifeSGTheme,
  overrides: {
    breakpoint: {
      "sm-max": 430,
      "md-min": 431,
      "xxs-column": 4,
      "xxs-gutter": 8,
      "xxs-margin": 20,
    },
  },
};
```

### Known limitations

- `MediaQuery` helpers are CSS-in-JS only — they cannot be used outside a
  styled-component template literal. For JS comparisons, use `Breakpoint[key]`.
- There is no built-in hook to reactively detect the current tier; wire
  `window.matchMedia` manually if needed.

---

## Shadow Tokens

> Use `Shadow` tokens to apply `box-shadow` values that convey elevation and state.
> Import: `import { Shadow } from "@lifesg/react-design-system/theme"`

### Usage

Interpolate directly inside a styled-component template literal.

```ts
import { Shadow } from "@lifesg/react-design-system/theme";
import styled from "styled-components";

// Card resting elevation
const Card = styled.div`
  box-shadow: ${Shadow["sm-subtle"]};
`;

// Focused input ring
const Input = styled.input`
  box-shadow: ${Shadow["xs-focus-strong"]};
`;
```

### Token Reference

Token keys follow the pattern `{size}-{variant}` where size implies spread/offset
and variant implies colour intensity.

| Token key         | Value                                  | Colour base  | Common use                            |
| ----------------- | -------------------------------------- | ------------ | ------------------------------------- |
| `xs-subtle`       | `0 0 4px 1px rgba(neutral-50 / 24%)`   | neutral-50   | Subtle glow / container resting state |
| `xs-strong`       | `0 0 4px 1px rgba(neutral-50 / 50%)`   | neutral-50   | Strong glow / hover or active state   |
| `xs-focus-strong` | `0 0 4px 1px rgba(border-focus / 50%)` | border-focus | Keyboard focus ring on inputs         |
| `xs-error-strong` | `0 0 4px 1px rgba(border-error / 50%)` | border-error | Error focus ring on inputs            |
| `sm-subtle`       | `0 2px 4px 0 rgba(neutral-50 / 24%)`   | neutral-50   | Card / panel resting elevation        |
| `sm-strong`       | `0 2px 4px 0 rgba(neutral-50 / 50%)`   | neutral-50   | Card hover / lifted state             |
| `md-subtle`       | `0 2px 8px 0 rgba(neutral-50 / 24%)`   | neutral-50   | Modal / drawer resting elevation      |
| `md-strong`       | `0 2px 8px 0 rgba(neutral-50 / 50%)`   | neutral-50   | Modal hover or prominent elevation    |

> Sizes beyond `md` (e.g. `lg-*`) may exist in future versions;
> check the Storybook default shadow page for the current full set.

### Overriding

Shadow values can be overridden via `ThemeSpec.overrides.shadow`.
Provide any valid CSS `box-shadow` string.

```ts
import { LifeSGTheme } from "@lifesg/react-design-system/theme";

const customTheme: ThemeSpec = {
  ...LifeSGTheme,
  overrides: {
    shadow: {
      "sm-subtle": "0 0 4px 1px rgba(0, 0, 0, 0.5)",
    },
  },
};
```

---

## Border Tokens

> Use `Border` tokens to define element border width and style.
> Import: `import { Border } from "@lifesg/react-design-system/theme"`

### Usage

Use `Border["width-*"]` for width values and `Border["solid"]` for border
style. `Border.Util["solid"]` and `Border.Util["dashed-default"]` are
shorthand utilities that inject a full border declaration in one line.

```ts
import { Border } from "@lifesg/react-design-system/theme";
import styled from "styled-components";

// Individual border properties
const Box = styled.div`
  border-width: ${Border["width-010"]};
  border-style: ${Border["solid"]};
`;

// Util shorthand — default settings
const Card = styled.div`
  ${Border.Util["solid"]};
`;

// Util with custom options
const Custom = styled.div`
  ${Border.Util["solid"]({ thickness: 2, colour: "red", radius: 8 })};
`;
```

### Token Reference

| Token key   | Value | Common use                     |
| ----------- | ----- | ------------------------------ |
| `width-005` | 0.5px | Hairline divider               |
| `width-010` | 1px   | Default input / card border    |
| `width-020` | 2px   | Emphasis / selected border     |
| `solid`     | solid | Border style for solid borders |

### Utilities

| Utility key      | Parameters                      | Use for                               |
| ---------------- | ------------------------------- | ------------------------------------- |
| `solid`          | `{ thickness, colour, radius }` | Solid border with optional overrides  |
| `dashed-default` | `{ thickness, colour, radius }` | Dashed border with optional overrides |

All parameters are optional — omit them to use the default token values.

### Overriding

```ts
import { LifeSGTheme } from "@lifesg/react-design-system/theme";

const customTheme: ThemeSpec = {
  ...LifeSGTheme,
  overrides: {
    border: {
      "width-010": 10,
      solid: "dotted",
    },
  },
};
```

---

## Border Radius Tokens

> Use `Radius` tokens to apply corner radius (`border-radius`) to elements.
> Import: `import { Radius } from "@lifesg/react-design-system/theme"`

### Usage

```ts
import { Radius } from "@lifesg/react-design-system/theme";
import styled from "styled-components";

const Button = styled.button`
  border-radius: ${Radius["sm"]};
`;

const Pill = styled.span`
  border-radius: ${Radius["full"]};
`;
```

### Token Reference

| Token key | Value  | Common use                              |
| --------- | ------ | --------------------------------------- |
| `none`    | 0px    | Sharp corners — tables, tiles           |
| `xs`      | 2px    | Tags, badges                            |
| `sm`      | 4px    | Buttons, inputs                         |
| `md`      | 8px    | Cards, panels                           |
| `lg`      | 12px   | Modals, large containers                |
| `full`    | 9999px | Pills, circular avatars, toggle handles |

### Overriding

```ts
import { LifeSGTheme } from "@lifesg/react-design-system/theme";

const customTheme: ThemeSpec = {
  ...LifeSGTheme,
  overrides: {
    radius: {
      sm: 6,
    },
  },
};
```

---

## Z-index Tokens

> ⬜ Not yet documented — run `Add DS Foundation to Catalogue` with topic `ZIndex` to add this section.

---

## Motion Tokens

> Use `Motion` tokens to control animation duration and easing in CSS
> transitions and animations.
> Import: `import { Motion } from "@lifesg/react-design-system/theme"`

### Usage

Combine a duration token and an easing token in a `transition` or `animation`
shorthand.

```ts
import { Motion } from "@lifesg/react-design-system/theme";
import styled from "styled-components";

// Hover colour transition
const Button = styled.button`
  background: lightgrey;
  transition: background ${Motion["duration-250"]} ${Motion["ease-default"]};
  &:hover {
    background: darkgrey;
  }
`;

// CSS animation
const Icon = styled.svg`
  animation: spin ${Motion["duration-350"]} ${Motion["ease-standard"]};
`;
```

> For elements with dynamic height or width (e.g. expandable panels), use
> `react-spring` instead of CSS transitions — it handles layout animation
> reliably where CSS transitions cannot.

### Token Reference

#### Duration

| Token key       | Value  | Use for                                       |
| --------------- | ------ | --------------------------------------------- |
| `duration-150`  | 150ms  | Very small interactions — checkboxes, toggles |
| `duration-250`  | 250ms  | Small interactions — buttons, fades           |
| `duration-350`  | 350ms  | Small expansions / short movements — icons    |
| `duration-500`  | 500ms  | Medium-area traversal — search bars, toasts   |
| `duration-800`  | 800ms  | Large expansions — notifications, cards       |
| `duration-1000` | 1000ms | Full-screen / large-scale transitions         |

#### Easing

| Token key       | Value                                  | Use for                               |
| --------------- | -------------------------------------- | ------------------------------------- |
| `ease-default`  | `cubic-bezier(0.45, 0.05, 0.55, 0.95)` | Non-moving elements — opacity, colour |
| `ease-standard` | `cubic-bezier(0.86, 0, 0.07, 1)`       | Visible throughout motion — dropdowns |

### Overriding

```ts
import { LifeSGTheme } from "@lifesg/react-design-system/theme";

const customTheme: ThemeSpec = {
  ...LifeSGTheme,
  overrides: {
    motion: {
      "duration-150": "1s",
      "ease-default": "steps(10, jump-both)",
    },
  },
};
```

### Known limitations

- The easing token list may extend beyond `ease-default` and `ease-standard`;
  verify the full set at the Storybook default motion page.
- For animated height / width, use `react-spring` — CSS `transition` on layout
  properties produces janky results with dynamic content.
