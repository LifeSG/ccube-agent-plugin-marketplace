---
name: cc-css-essentials
description: >-
  CSS fundamentals — box model, flexbox, grid, units, specificity,
  positioning, z-index, and responsive design. Library-agnostic.
  Use when writing, reviewing, or debugging styles in any web
  project regardless of CSS library or framework.
user-invocable: false
---

# CSS Essentials

Quick-reference for CSS fundamentals. This skill is
library-agnostic — all examples use plain CSS. For
styled-components API patterns, see the `cc-styled-components`
skill.

---

## The Box Model

Every HTML element is a rectangular box. From inside out:
**content → padding → border → margin**.

```
+---------------------------+
|         margin            |
|  +---------------------+  |
|  |       border        |  |
|  |  +---------------+  |  |
|  |  |    padding    |  |  |
|  |  |  +---------+  |  |  |
|  |  |  | content |  |  |  |
|  |  |  +---------+  |  |  |
|  |  +---------------+  |  |
|  +---------------------+  |
+---------------------------+
```

### `box-sizing: border-box`

By default, `width` sets only the content box. Padding and
border are added on top, making the element larger than its
declared width. **Always apply globally:**

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

With `border-box`, `width` includes padding and border — far
more intuitive.

**Common bug:** An element is wider than expected. Almost always
caused by missing `box-sizing: border-box`.

---

## Flexbox

Flexbox is a one-dimensional layout model (row or column). It
is the right tool for most component-level layouts.

```css
.row {
  display: flex;
  flex-direction: row;      /* default: row | column */
  justify-content: center;  /* main axis alignment */
  align-items: center;      /* cross axis alignment */
  gap: 16px;                /* space between items */
  flex-wrap: wrap;          /* allow items to wrap */
}
```

### Alignment Quick Reference

| Property          | Axis                    | Common values                                                       |
| ----------------- | ----------------------- | ------------------------------------------------------------------- |
| `justify-content` | Main (row = horizontal) | `flex-start`, `flex-end`, `center`, `space-between`, `space-evenly` |
| `align-items`     | Cross (row = vertical)  | `flex-start`, `flex-end`, `center`, `stretch`, `baseline`           |
| `align-self`      | Cross — one item only   | Same as `align-items`                                               |

### Common Patterns

```css
/* Centre a single item horizontally and vertically */
.centre {
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Space items apart (e.g. nav bar) */
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Sticky footer layout */
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1; /* pushes footer to the bottom */
}
```

### Flex Item Properties

```css
.item {
  flex: 1;           /* shorthand: flex-grow: 1 */
  flex-shrink: 0;    /* prevent shrinking below flex-basis */
  flex-basis: 200px; /* starting size before flex algorithm */
  min-width: 0;      /* fix text overflow in flex items */
}
```

**Common bug:** Text inside a flex item overflows or does not
wrap. Add `min-width: 0` — flex items default to
`min-width: auto`, which prevents shrinking below content size.

---

## CSS Grid

Grid is a two-dimensional layout model. Use it for page-level
and complex layouts.

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 equal columns */
  gap: 16px;
}
```

### Common Column Patterns

```css
/* Responsive: as many columns as fit at min 200px each */
grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

/* Fixed sidebar + flexible main content */
grid-template-columns: 250px 1fr;

/* 12-column grid */
grid-template-columns: repeat(12, 1fr);
```

### Placing Items

```css
.hero {
  grid-column: 1 / -1; /* span all columns */
}

.sidebar {
  grid-column: 1 / 2;
  grid-row: 1 / 3;
}
```

### Flexbox vs Grid

- **Flexbox**: One direction — navbars, button groups, card
  rows where items wrap naturally
- **Grid**: Two directions — page layouts, image galleries,
  dashboards, anything requiring explicit row + column alignment

---

## Units

| Unit        | What it is                                | When to use                   |
| ----------- | ----------------------------------------- | ----------------------------- |
| `px`        | Fixed pixels                              | Borders, shadows, `min-width` |
| `rem`       | Relative to root font-size (default 16px) | Font sizes, spacing, sizing   |
| `em`        | Relative to parent font-size              | Padding tied to text size     |
| `%`         | Relative to parent dimension              | Fluid widths                  |
| `vw` / `vh` | 1% of viewport width / height             | Full-viewport sections        |
| `fr`        | Fraction unit in grid                     | Grid column widths            |
| `ch`        | Width of the `0` character                | Constraining text line width  |

**Recommendation:**

- Use `rem` for most sizing — respects the user's browser font
  setting, making the UI accessible
- `1rem` = `16px` by default; `1.5rem` = `24px`
- Avoid `px` for font sizes — it overrides user accessibility
  preferences
- Avoid `vw` for widths — on desktop, `100vw` includes the
  scrollbar, causing horizontal overflow; use `100%` instead

---

## Specificity

Specificity determines which CSS rule wins when multiple rules
target the same element. Higher specificity wins.

**Specificity order** (lowest to highest):

1. Element selector: `p`, `div` → 0,0,1
2. Class selector: `.btn` → 0,1,0
3. ID selector: `#main` → 1,0,0
4. Inline style: `style="..."` → overrides all selectors
5. `!important` — avoid; breaks the cascade

**Rules:**

- Prefer class selectors over ID selectors for styling
- Never use `!important` to fix a specificity problem —
  restructure your selectors instead
- Flat selectors (`.card-title`) are easier to override than
  deeply nested ones (`.card .header .title`)

---

## Positioning

```css
position: static;   /* default — stays in normal document flow */
position: relative; /* offsets from its normal position */
position: absolute; /* removed from flow; positioned relative to
                       nearest non-static ancestor */
position: fixed;    /* relative to the viewport; stays on scroll */
position: sticky;   /* normal flow until scroll threshold, then
                       sticks to top/bottom */
```

**Key rules:**

- `absolute` positioning is relative to the nearest ancestor
  with `position: relative` (or `absolute`/`fixed`). If none
  exists, it is relative to the document.
- Always set `position: relative` on the parent when using
  `position: absolute` on a child.
- `sticky` requires a defined `top`/`bottom` value and a
  a parent that actually scrolls with a constrained height.

```css
/* Overlay a badge on a card */
.card-wrapper {
  position: relative;
}

.badge {
  position: absolute;
  top: 8px;
  right: 8px;
}
```

---

## Z-index and Stacking Context

`z-index` controls the vertical stacking order of overlapping
elements. **It only works on positioned elements**
(`position` other than `static`).

### Stacking Context Rules

A new stacking context is created by any of:

- `position` (not `static`) + `z-index` (not `auto`)
- `opacity` less than `1`
- `transform`, `filter`, `will-change`

`z-index` only competes within the same stacking context. A
`z-index: 9999` child cannot escape its parent's stacking
context.

**Common bug:** A modal with `z-index: 9999` disappears behind
a navigation bar. The modal's parent likely has `transform` or
`opacity` set, trapping the modal inside a lower context.

```css
/* Define a z-index scale — never scatter magic numbers */
:root {
  --z-base:          0;
  --z-dropdown:    100;
  --z-sticky:      200;
  --z-modal-bg:    300;
  --z-modal:       400;
  --z-toast:       500;
}

.modal {
  z-index: var(--z-modal);
  position: fixed;
}
```

---

## Responsive Design

**Mobile-first approach**: write base styles for mobile, then
override with `min-width` media queries for larger screens.
This ensures the smallest, simplest layout is the default.

```css
.container {
  padding: 16px; /* base — mobile */
}

@media (min-width: 768px) {
  .container {
    padding: 24px; /* tablet and up */
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 32px;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Common Breakpoints

| Name          | Min-width |
| ------------- | --------- |
| Mobile (base) | 0         |
| Tablet        | 768px     |
| Desktop       | 1024px    |
| Wide          | 1280px    |

**Key points:**

- Always add `max-width` on page containers to prevent content
  from stretching too wide on large screens
- Images: `max-width: 100%` prevents overflow; use
  `object-fit: cover` on fixed-size image containers
- Test at 375px (iPhone SE) and 768px (tablet) regularly

---

## Common Layout Bugs

| Bug                                | Cause                                 | Fix                                   |
| ---------------------------------- | ------------------------------------- | ------------------------------------- |
| Element wider than container       | Missing `box-sizing: border-box`      | Apply global `box-sizing` reset       |
| Text overflows flex item           | `min-width: auto` default             | Add `min-width: 0` to the flex item   |
| `absolute` child in wrong position | No `position: relative` on parent     | Add `position: relative` to parent    |
| `z-index` has no effect            | Element not positioned                | Add `position: relative`              |
| `sticky` not sticking              | No `top` value or parent lacks height | Add `top: 0`; ensure parent scrolls   |
| Horizontal scroll on mobile        | `100vw` includes scrollbar            | Use `width: 100%` instead of `100vw`  |
| Image stretches in flex/grid       | Default `align-items: stretch`        | Add `align-self: flex-start` on image |
| Margins between siblings merge     | Adjacent block margins collapse       | Use `gap` or `padding` instead        |
| Modal behind nav bar               | Parent has `transform`/`opacity`      | Render modal at the document root     |

---

## Common Mistakes to Flag

1. **No global `box-sizing: border-box`** — elements will be
   larger than their declared width
2. **Using `px` for font sizes** — overrides the user's
   accessibility font preferences; use `rem` instead
3. **Using `!important`** — creates a specificity arms race;
   restructure selectors to fix the real cause
4. **Hardcoded magic numbers** — `margin-top: 37px`;
   extract values into CSS variables or design tokens
5. **`absolute` child without `relative` parent** — element
   jumps to an unexpected ancestor or the document root
6. **`z-index` arms race** — `z-index: 9999` scattered
   everywhere; define a z-index scale with CSS variables
7. **Using `width: 100vw`** — includes the scrollbar on
   desktop, causing horizontal scroll; use `width: 100%`
8. **Not testing on mobile** — always test at 375px width;
   desktop-only development produces broken mobile layouts
9. **Forgetting `min-width: 0` on flex items** — text and
   long words will not wrap or truncate as expected

<!-- This skill is part of the ccube-frontend-dev plugin. -->
