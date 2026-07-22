# FDS Theme Setup

> Reference this file when: setting up a new project, configuring a theme, switching themes,
> implementing dark mode, customising tokens, or overriding per-element colour schemes.
> Covers: installation, `ThemeProvider` vs `DSThemeProvider`, custom `ThemeSpec`, token overrides,
> dark mode extension, and migration from `ThemeProvider` to `DSThemeProvider`.

**Quick decision matrix for coding agents**

| Task                                              | Section to follow                          |
| ------------------------------------------------- | ------------------------------------------ |
| New project setup                                 | Installation — steps 1–4 in order          |
| Apply a named preset                              | Theme Presets table + DSThemeProvider      |
| Enable automatic dark mode                        | Dark Mode → Basic implementation           |
| Force light or dark mode                          | Dark Mode → Theme variants API             |
| Add a UI light/dark toggle                        | Dark Mode → Manual user toggle             |
| Build a custom theme from scratch                 | Advanced → Defining a custom theme         |
| Override specific tokens on a preset              | Advanced → Extending a preset              |
| Override colour scheme on one element             | Advanced → Per-element theme override      |
| Migrate from `ThemeProvider` to `DSThemeProvider` | Dark Mode → Migration from existing themes |

---

## Installation

> One-time project setup steps required before any FDS component can be used. Complete all steps in order.

### 1. Install the package

```bash
npm i @lifesg/react-design-system
```

**Required peer dependencies:**

```json
{
  "@floating-ui/react": ">=0.26.23 <1.0.0",
  "@lifesg/react-icons": "^1.5.0",
  "react": "^17.0.2 || ^18.0.0 || ^19.0.0",
  "react-dom": "^17.0.2 || ^18.0.0 || ^19.0.0",
  "styled-components": "^6.1.19"
}
```

### 2. Add the CSS stylesheet

Add to the `<head>` of your HTML file (swap the theme slug as needed):

**LifeSG (default)**
```html
<link rel="stylesheet" type="text/css" href="https://assets.life.gov.sg/react-design-system/v3/css/main.css" />
<link rel="stylesheet" type="text/css" href="https://assets.life.gov.sg/react-design-system/v3/css/open-sans.css" />
```

Or via CSS `@import`:
```css
@import url("https://assets.life.gov.sg/react-design-system/v3/css/main.css");
@import url("https://assets.life.gov.sg/react-design-system/v3/css/open-sans.css");
```

**Other themes** follow the pattern `https://assets.life.gov.sg/react-design-system/v3/css/[theme-slug].css`. Example for BookingSG:

```html
<link rel="stylesheet" type="text/css" href="https://assets.life.gov.sg/react-design-system/v3/css/bookingsg.css" />
```

> For the full list of theme-specific CSS filenames, see the
> [official installation docs](https://designsystem.life.gov.sg/react/index.html?path=/docs/getting-started-installation--docs).

### 3. Set up the theme provider

Wrap the app with `ThemeProvider` from `styled-components` in
`src/main.tsx`. This is the standard approach per the FDS Introduction
docs and works for all projects.

```tsx
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "styled-components";
import { LifeSGTheme } from "@lifesg/react-design-system/theme";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={LifeSGTheme}>
      <App />
    </ThemeProvider>
  </StrictMode>
);
```

> If a theme is not specified, FDS components default to LifeSG.

**Upgrade to `DSThemeProvider` for dark mode support (optional)**

`DSThemeProvider` is exported from `@lifesg/react-design-system/theme`
and adds automatic `prefers-color-scheme` switching. Use it instead of
`ThemeProvider` when the project requires dark mode. See the
[Dark Mode](#dark-mode) section and the DSThemeProvider section below.

```tsx
// src/main.tsx — use this variant for dark mode support
import { DSThemeProvider, LifeSGTheme }
  from "@lifesg/react-design-system/theme";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DSThemeProvider theme={LifeSGTheme}>
      <App />
    </DSThemeProvider>
  </StrictMode>
);
```

> Never use `ThemeProvider` and `DSThemeProvider` simultaneously.

### 4. Augment theme types (TypeScript — optional, recommended)

Create a `src/styled.d.ts` declaration file so `Colour[...]` and `Spacing[...]` tokens resolve correctly in TypeScript:

```ts
// src/styled.d.ts
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

> Without this file every `${Colour[...]}` or `${Spacing[...]}` interpolation in a styled-component will emit a TypeScript error.

---

## Theme Presets

All preset themes are exported from `@lifesg/react-design-system/theme`.

| Export name            | Use for                                            |
| ---------------------- | -------------------------------------------------- |
| `LifeSGTheme`          | LifeSG / general government applications (default) |
| `SupportGoWhereTheme`  | SupportGoWhere portal                              |
| `BookingSGTheme`       | BookingSG facility booking                         |
| `CCubeTheme`           | CCube internal tools                               |
| `MyLegacyTheme`        | MyLegacy                                           |
| `OneServiceTheme`      | OneService                                         |
| `PATheme`              | People's Association                               |
| `IMDATheme`            | IMDA                                               |
| `RBSTheme`             | RBS                                                |
| `SPFTheme`             | Singapore Police Force                             |
| `A11yPlaygroundTheme`  | Accessibility playground / testing                 |
| `SGWDigitalLobbyTheme` | SGW Digital Lobby variant                          |

### ThemeSpec structure

A `ThemeSpec` object is composed of several scheme keys:

```ts
// ThemeSpec
{
  colourScheme: "lifesg",
  fontScheme: "default",
  motionScheme: "default",
  borderScheme: "default",
  spacingScheme: "default",
  radiusScheme: "default",
  breakpointScheme: "default",
  resourceScheme: "lifesg"
}
```

---

## DSThemeProvider

> FDS convenience wrapper around styled-components `ThemeProvider`. Use this instead of
> `ThemeProvider` directly when working within the FDS component ecosystem.

**Import**: `import { DSThemeProvider } from "@lifesg/react-design-system/theme"`

**Decision rule**
> Use `DSThemeProvider` for all new projects and any project that requires dark mode token switching.
> `ThemeProvider` from styled-components remains valid for light-only or custom `ThemeSpec` configurations — see Advanced Theme Customisation.
> Never use both providers simultaneously, and never import `Theme` from `@lifesg/react-design-system/theme` (that export does not exist).

**When to use**
- Once, at the root of the React application (`main.tsx` or equivalent), wrapping all children.
- When targeting a specific government agency brand (e.g. LifeSG, SupportGoWhere, BookingSG).

**When NOT to use**

| Situation                                               | Use instead                                                                         |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Wrapping only a subtree of components                   | Always wrap at root — `DSThemeProvider` must be an ancestor of all FDS components   |
| Using styled-components `ThemeProvider` for FDS colours | `DSThemeProvider` handles FDS tokens natively — no second `ThemeProvider` is needed |

**Key props**

| Prop     | Type        | Required | Notes                                                                                                                                    |
| -------- | ----------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| theme    | `ThemeSpec` | yes      | A preset theme object exported from `@lifesg/react-design-system/theme`. Pass `LifeSGTheme.light` or `LifeSGTheme.dark` to force a mode. |
| children | `ReactNode` | yes      | The entire React component tree.                                                                                                         |

**Canonical usage**
```tsx
// main.tsx — auto mode (follows system prefers-color-scheme)
import { DSThemeProvider, LifeSGTheme } from "@lifesg/react-design-system/theme";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <DSThemeProvider theme={LifeSGTheme}>
    <App />
  </DSThemeProvider>
);

// Force light mode regardless of system preference
<DSThemeProvider theme={LifeSGTheme.light}>
  <App />
</DSThemeProvider>

// Force dark mode regardless of system preference
<DSThemeProvider theme={LifeSGTheme.dark}>
  <App />
</DSThemeProvider>

// Switch to SupportGoWhere theme, forced light
import { DSThemeProvider, SupportGoWhereTheme } from "@lifesg/react-design-system/theme";

<DSThemeProvider theme={SupportGoWhereTheme.light}>
  <App />
</DSThemeProvider>
```

**Known limitations**
- When using `DSThemeProvider`, prefer `Colour[]` and `Spacing[]` interpolation functions over accessing FDS tokens via `props.theme` directly — `DSThemeProvider` does not guarantee a fully resolved `ThemeObject` on `props.theme`.
- The per-element `modifiedProps` override pattern (see Advanced Theme Customisation) spreads `props.theme` and is valid only when using `ThemeProvider` directly, not with `DSThemeProvider`.
- There is no export named `Theme` from `@lifesg/react-design-system/theme` — using it will throw a runtime error.

---

## Advanced Theme Customisation

> Reference: https://designsystem.life.gov.sg/react/index.html?path=/docs/foundations-themes-advanced-usage--docs

### Defining a custom theme

Mix and match scheme values to construct a `ThemeSpec` from scratch. Each scheme key maps to a set of design tokens. Use when no preset matches the required brand.

```tsx
// app.tsx
import { ThemeSpec } from "@lifesg/react-design-system/theme";
import { ThemeProvider } from "styled-components";
import { Component } from "./index";

const myTheme: ThemeSpec = {
  colourScheme: "bookingsg",
  fontScheme: "default",
  motionScheme: "default",
  borderScheme: "default",
  spacingScheme: "default",
  radiusScheme: "default",
  breakpointScheme: "default",
  resourceScheme: "mylegacy",
};

const App = () => (
  <ThemeProvider theme={myTheme}>
    <Component />
  </ThemeProvider>
);

export default App;
```

### Extending a preset

Spread an existing preset and add an `overrides` object to modify individual tokens. Use when the target brand is a minor variation of an existing preset. Refer to each design token's documentation for valid override keys.

```tsx
// app.tsx
import { LifeSGTheme, ThemeSpec } from "@lifesg/react-design-system/theme";
import { ThemeProvider } from "styled-components";
import { Component } from "./index";

const customTheme: ThemeSpec = {
  ...LifeSGTheme,
  overrides: {
    primitiveColour: {
      "primary-10": "#F3C85C",
    },
    font: {
      "heading-size-xxl": "4rem",
      "heading-lh-xxl": "4.5rem",
      "heading-ls-xxl": "0.056rem",
    },
  },
};

const App = () => (
  <ThemeProvider theme={customTheme}>
    <Component />
  </ThemeProvider>
);

export default App;
```

### Per-element theme override

> Applies when using `ThemeProvider` directly. Not supported with `DSThemeProvider` — when using `DSThemeProvider`, apply overrides via the `overrides` prop at the root level instead.

Apply a different colour scheme to a single styled-component without affecting the rest of the UI. Pass modified `props` containing the overridden `colourScheme` to the `Colour` interpolation function.

> Decision rule: Use `Colour[token]` directly when the element should follow the active root theme.
> Use the `modifiedProps` pattern only when a single element must deviate from the root theme in isolation.

**Standard — element uses the active root theme:**

```tsx
import { Colour } from "@lifesg/react-design-system/theme";
import styled from "styled-components";

const SomeComponent = styled.div`
  background: ${Colour["background-error"]};
`;
```

**Per-element override — different scheme for one component only:**

```tsx
import { Colour } from "@lifesg/react-design-system/theme";
import styled, { css } from "styled-components";

const SomeComponent = styled.div`
  ${(props) => {
    const modifiedProps = {
      ...props,
      theme: {
        ...props.theme,
        colourScheme: "bookingsg",
      },
    };
    return css`
      background: ${Colour["background-error"](modifiedProps)};
    `;
  }}
`;
```

---

## Dark Mode

> Reference: https://designsystem.life.gov.sg/react/index.html?path=/docs/foundations-themes-dark-mode--docs

### Default colour scheme behaviour

Passing a bare theme object (e.g. `LifeSGTheme`) enables **automatic mode** — FDS reads the user's `prefers-color-scheme` system preference and applies tokens accordingly. There is no explicit `colorScheme` prop on `DSThemeProvider`.

### Theme variants API

Light/dark control is handled via **theme variant properties**, not a prop:

| Theme passed        | Behaviour                                    |
| ------------------- | -------------------------------------------- |
| `LifeSGTheme`       | Auto — follows system `prefers-color-scheme` |
| `LifeSGTheme.light` | Always light, ignores system preference      |
| `LifeSGTheme.dark`  | Always dark, ignores system preference       |

The same `.light` / `.dark` sub-properties exist on every theme preset (e.g. `SupportGoWhereTheme.light`).

### Forcing light mode

For applications that require light mode regardless of the user's system setting:

```tsx
// Always light mode
<DSThemeProvider theme={LifeSGTheme.light}>
  <App />
</DSThemeProvider>
```

### Forcing dark mode

For applications that require dark mode regardless of the user's system setting:

```tsx
// Always dark mode
<DSThemeProvider theme={LifeSGTheme.dark}>
  <App />
</DSThemeProvider>
```

### Manual user toggle

When there is a light/dark toggle in the UI:

```tsx
const [preference, setPreference] = useState<"light" | "dark" | "auto">("auto");

const currentTheme =
  preference === "dark" ? LifeSGTheme.dark
  : preference === "light" ? LifeSGTheme.light
  : LifeSGTheme; // auto

<DSThemeProvider theme={currentTheme}>
  <App />
</DSThemeProvider>
```

### Accessing the active colour mode in a component

Use the `useDSTheme` hook:

```tsx
import { useDSTheme } from "@lifesg/react-design-system/theme";

const MyComponent = () => {
  const { colourMode, theme } = useDSTheme();
  return <div>Current mode: {colourMode}</div>;
};
```

### Decision rule

> For citizen-facing government applications where design explicitly requires light mode, pass `LifeSGTheme.light` rather than the bare `LifeSGTheme`. This makes the intent explicit and prevents the UI from shifting to dark when users have a dark system preference.

### Extending dark mode themes

When using `overrides`, add a parallel `semanticColourDark` (and optionally `primitiveColourDark`) key to supply dark-mode-specific token values. Without this key, the light-mode `overrides` values are used in both modes.

```tsx
// app.tsx
import { LifeSGTheme, ThemeSpec } from "@lifesg/react-design-system/theme";

const customTheme: ThemeSpec = {
  ...LifeSGTheme,
  overrides: {
    // Light mode overrides
    primitiveColour: { "primary-50": "#0066cc" },
    semanticColour: {
      text: "#2c2c2c",
      "bg-primary": "#0066cc",
    },
    // Dark mode counterparts
    primitiveColourDark: { "primary-50": "#4d94ff" },
    semanticColourDark: {
      text: "#f0f0f0",
      "bg-primary": "#4d94ff",
    },
  },
};
```

---

## Migration from `ThemeProvider` to `DSThemeProvider`

> Reference: https://designsystem.life.gov.sg/react/index.html?path=/docs/foundations-themes-dark-mode--docs

Follow these steps when upgrading an existing project to use `DSThemeProvider` for automatic dark mode support. The previous `ThemeProvider` approach still works but does not activate dark mode token switching.

### Step 1 — Replace the root provider

```tsx
// Before — basic theme usage (still works, no dark mode)
import { ThemeProvider } from "styled-components";
import { LifeSGTheme } from "@lifesg/react-design-system/theme";

<ThemeProvider theme={LifeSGTheme}>
  <App />
</ThemeProvider>;

// After — recommended; enables automatic dark mode
import { DSThemeProvider, LifeSGTheme } from "@lifesg/react-design-system/theme";

<DSThemeProvider theme={LifeSGTheme}>
  <App />
</DSThemeProvider>;
```

### Step 2 — Add dark mode overrides (if you have custom colours)

```tsx
// Before — single override block (still works)
const customTheme = {
  ...LifeSGTheme,
  overrides: {
    semanticColour: { text: "#custom-light" },
    primitiveColour: { "primary-50": "#0066cc" },
  },
};

// After — explicit light + dark overrides
const customTheme = {
  ...LifeSGTheme,
  overrides: {
    primitiveColour: { "primary-50": "#0066cc" },
    primitiveColourDark: { "primary-50": "#4d94ff" },
    semanticColour: { text: "#custom-light" },
    semanticColourDark: { text: "#custom-dark" },
  },
};
```

### Step 3 — Test both modes

Verify the migration by toggling system preference or using browser DevTools to simulate `prefers-color-scheme: dark`. Existing styled-components using `Colour` and `Spacing` interpolation functions will adapt automatically.
