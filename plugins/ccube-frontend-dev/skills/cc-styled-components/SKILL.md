---
name: cc-styled-components
description: >-
  styled-components API patterns for React — basic components,
  pseudo-classes, props-based styling, extending, theming,
  TypeScript typed theme, global styles, keyframes, attrs, and
  common mistakes. Use when writing or reviewing component styles
  with styled-components in a React project.
user-invocable: false
---

# styled-components Patterns

Quick-reference for styled-components v5/v6 API patterns in
React + TypeScript projects. This skill covers the library API
only — for CSS fundamentals (box model, flexbox, grid, units,
specificity, responsive design), see the `cc-css-essentials`
skill.

**Version note:** Examples target styled-components v5 (React
18) and v6 (React 19). v6 drops IE11 support and requires React
16.8+. Check `package.json` for the project version.

---

## Setup

```bash
# Install runtime + TypeScript types
npm install styled-components
npm install -D @types/styled-components
```

---

## Basic Component

A styled component is a React component with styles attached.
Use it exactly like a regular HTML element.

```tsx
import styled from "styled-components";

const Button = styled.button`
  padding: 8px 16px;
  background: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  /* Pseudo-classes use & to refer to the component itself */
  &:hover {
    background: #0051a2;
  }

  &:focus-visible {
    outline: 2px solid #0070f3;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Usage — same as a regular React component
<Button type="submit">Save</Button>
<Button disabled>Processing...</Button>
```

**Key points:**

- `&` refers to the generated class — use it for pseudo-classes,
  pseudo-elements, and nested selectors
- `&:hover`, `&::before`, `& + &` are all valid
- styled-components forwards all valid HTML attributes to the
  underlying element automatically
- Pass `as` prop to render as a different element:
  `<Button as="a" href="/home">Home</Button>`

---

## Props-Based Styling

Pass custom props to drive conditional styles. Declare
non-HTML props in the TypeScript generic to prevent them from
being forwarded to the DOM.

```tsx
interface ButtonProps {
  $variant?: "primary" | "secondary" | "danger";
  $size?: "sm" | "md" | "lg";
}

const Button = styled.button<ButtonProps>`
  padding: ${({ $size }) =>
    $size === "sm" ? "4px 8px" : $size === "lg" ? "12px 24px" : "8px 16px"};
  background: ${({ $variant }) => {
    if ($variant === "secondary") return "#fff";
    if ($variant === "danger") return "#e53e3e";
    return "#0070f3";
  }};
  color: ${({ $variant }) =>
    $variant === "secondary" ? "#0070f3" : "#fff"};
  border: 2px solid
    ${({ $variant }) =>
      $variant === "danger" ? "#e53e3e" : "#0070f3"};
  border-radius: 4px;
  cursor: pointer;
`;

// Usage
<Button $variant="secondary" $size="sm">Cancel</Button>
<Button $variant="danger">Delete</Button>
```

**Key points:**

- In v5, any prop not listed in HTML spec leaks to the DOM and
  causes a warning; prefix transient props with `$` (v5.1+)
  to prevent forwarding
- In v6, `$`-prefix is the default convention — always use it
  for styling-only props
- Keep conditional logic readable — extract to a helper
  function when the ternary chain grows beyond 3 branches

---

## Extending Styles

Build on an existing styled component without rewriting shared
styles.

```tsx
const BaseButton = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
`;

// Inherits all BaseButton styles, then adds or overrides
const DangerButton = styled(BaseButton)`
  background: #e53e3e;
  color: white;
  border: none;

  &:hover {
    background: #c53030;
  }
`;

const OutlineButton = styled(BaseButton)`
  background: transparent;
  border: 2px solid #0070f3;
  color: #0070f3;
`;
```

---

## Styling Third-Party Components

Wrap any component that accepts and forwards a `className` prop.

```tsx
import { Link } from "react-router-dom";

// Link forwards className — safe to style
const NavLink = styled(Link)`
  color: #0070f3;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }

  &.active {
    color: #0051a2;
    font-weight: 700;
  }
`;
```

**Key point:** If a third-party component does not accept
`className`, it cannot be styled with styled-components.
Check its props interface first.

---

## Global Styles

Use `createGlobalStyle` for resets, root variables, and
body-level styles. Render it once at the app root.

```tsx
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
      Roboto, sans-serif;
    line-height: 1.5;
    color: #1a1a1a;
    -webkit-font-smoothing: antialiased;
  }

  img {
    max-width: 100%;
    display: block;
  }

  a {
    color: inherit;
  }
`;

// Render once in the app root — above all other components
function App() {
  return (
    <>
      <GlobalStyle />
      <Router />
    </>
  );
}
```

---

## Theming

`ThemeProvider` injects a theme object into every styled
component via the `theme` prop automatically. No manual prop
passing required.

```tsx
import { ThemeProvider } from "styled-components";

const theme = {
  colors: {
    primary: "#0070f3",
    primaryHover: "#0051a2",
    danger: "#e53e3e",
    text: "#1a1a1a",
    textMuted: "#6b7280",
    background: "#fff",
    surface: "#f5f5f5",
    border: "#e5e7eb",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
  },
  radii: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.05)",
    md: "0 4px 6px rgba(0,0,0,0.07)",
  },
};

// Wrap the entire app
function Root() {
  return (
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  );
}

// Consume theme values in any styled component
const Card = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: ${({ theme }) => theme.shadows.sm};
`;
```

---

## TypeScript: Typed Theme

Extend the `DefaultTheme` interface so theme values are
type-safe throughout the project.

```tsx
// theme.ts — define the theme object
export const theme = { /* ...as above... */ };
export type AppTheme = typeof theme;

// styled.d.ts — augment styled-components module
import "styled-components";
import type { AppTheme } from "./theme";

declare module "styled-components" {
  export interface DefaultTheme extends AppTheme {}
}
```

After this, `${({ theme }) => theme.}` in any styled component
gives full autocomplete and type checking.

---

## Keyframe Animations

Use the `keyframes` helper to create reusable animation
definitions.

```tsx
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const Modal = styled.div`
  animation: ${fadeIn} 200ms ease-out;
`;

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid #e5e7eb;
  border-top-color: #0070f3;
  border-radius: 50%;
  animation: ${spin} 600ms linear infinite;
`;
```

---

## `attrs` — Static and Default Attributes

Use `attrs` to attach static HTML attributes or default prop
values without repeating them at every call site.

```tsx
// Always sets type="button" — prevents accidental form submission
const Button = styled.button.attrs({ type: "button" })`
  padding: 8px 16px;
  cursor: pointer;
`;

// Default size with override support
const Input = styled.input.attrs<{ $size?: string }>((props) => ({
  type: "text",
  $size: props.$size ?? "md",
}))`
  padding: ${({ $size }) => ($size === "lg" ? "12px" : "8px")};
  border: 1px solid #e5e7eb;
  border-radius: 4px;
`;
```

**Key point:** Use `attrs` for attributes that are constant or
have meaningful defaults. Do NOT use `attrs` for styles that
change frequently — it triggers re-renders for every prop
change because a new component class is generated per unique
`attrs` result.

---

## Common Mistakes to Flag

1. **Defining styled components inside a React component** —
   a styled component defined inside another component is
   recreated on every render, causing full unmount/remount
   cycles, lost state, and broken focus; always define styled
   components at the module level

   ```tsx
   // Wrong — StyledBox recreated on every List render
   function List({ items }) {
     const StyledBox = styled.div`padding: 8px;`;
     return items.map((i) => <StyledBox key={i.id}>{i.name}</StyledBox>);
   }

   // Correct — defined once at module scope
   const StyledBox = styled.div`padding: 8px;`;
   function List({ items }) {
     return items.map((i) => <StyledBox key={i.id}>{i.name}</StyledBox>);
   }
   ```

2. **Forgetting `$` prefix on transient props (v5)** —
   custom props without `$` prefix are forwarded to the DOM,
   causing React warnings and potential HTML attribute errors;
   use `$variant`, `$size`, etc.
3. **Deeply nested selectors** — `& .child .grandchild` in
   a styled component creates high-specificity rules that are
   hard to override; prefer composing separate styled
   components instead
4. **Inline `style` mixed with styled-components** —
   `style={{color: "red"}}` on a styled component bypasses
   the theme and creates specificity conflicts; move all
   styles into the template literal
5. **Not using theme tokens** — hardcoding `#0070f3` instead
   of `${({ theme }) => theme.colors.primary}` means a single
   color change requires a global find-and-replace
6. **Missing `ThemeProvider` at the root** — accessing
   `theme` in a styled component without a wrapping
   `ThemeProvider` returns an empty object; all theme values
   are `undefined` and styles silently fall back to nothing
7. **Using `createGlobalStyle` inside a component** —
   global styles are injected on every render; render
   `<GlobalStyle />` once at the app root, outside loops
   or conditional rendering
8. **Over-relying on `!important` to beat specificity** —
   styled-components generates unique class names; if you are
   fighting specificity, the component tree is likely
   structured incorrectly

<!-- This skill is part of the ccube-frontend-dev plugin. -->
