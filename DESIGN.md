# Design System

## Overview

A professional, accessible government design system for Singapore's digital services.
Clean lines, generous whitespace, and high information density.
Accessibility-first with WCAG AA contrast ratios and generous touch targets.
Supports light (day) and dark (night) themes through unified semantic tokens.

## Colors

- **Primary** (#6b4feb): CTAs, active states, key interactive elements — purple product palette:
  - `100` (#f4f2fe): Muted backgrounds, subtle highlights
  - `200` (#e1dbfb): Muted borders, hover backgrounds
  - `300` (#c8bdf7): Decorative accents
  - `400` (#a999f3): Fixed light-mode accent
  - `500` (#8a72ef): Mid-range interactive
  - `600` (#6b4feb): Default interactive surfaces and text
  - `700` (#523abc): Emphasis states, filled backgrounds
  - `800` (#3c2b8a): Deep accents
  - `900` (#2a1e61): Darkest primary

- **Accent** (#0269d0): Links, focus rings, informational states — blue palette:
  - `100` (#ecf5fe) → `900` (#012a54)
  - Day link: blue-600 (#0269d0), night link: blue-400 (#60aaf4)

- **Success** (#0e7c3d): Positive feedback, completion indicators — green palette:
  - `100` (#e3f9ed) → `900` (#063119)

- **Danger** (#cf2323): Validation errors, destructive actions — red palette:
  - `100` (#fcf1f1) → `900` (#550e0e)

- **Warning** (#7e6917): Cautionary states, attention indicators — yellow palette:
  - `100` (#fef4cb) → `900` (#322909)

- **Neutral**: Body text, borders, subtle UI — 13-step gray scale:
  - `000` (#ffffff) → `50` (#f7f7f7) → `100` (#f3f3f3) → `200` (#dfdfdf) → `300` (#c6c6c6) → `400` (#a5a5a5) → `500` (#868686) → `600` (#6b6b6b) → `700` (#525252) → `800` (#3b3b3b) → `900` (#2a2a2a) → `1000` (#1a1a1a) → `1100` (#0e0e0e)

- **Additional palettes**: Purple (#ac1cdb), Cyan (#00758d) — each with 100–900 scales for extended data visualization and status use cases

Day mode uses light backgrounds (gray-000 #ffffff) with dark text (gray-1000 #1a1a1a).
Night mode inverts to dark backgrounds (gray-1100 #0e0e0e) with light text (gray-100 #f3f3f3).
Semantic token names stay the same across themes — only values change.

## Typography

- **Font Family**: `"Inter", system-ui, sans-serif` — single brand typeface for all text
- **Font Weights**:
  - `light` (300): Minimal use, decorative large text
  - `regular` (400): Body text, paragraphs, default
  - `semibold` (600): Labels, headings, interactive elements
  - `bold` (700): Display headings, strong emphasis
- **Display** (responsive):
  - `display-sm`: 32px (mobile) → 36px (tablet) → 40px (desktop)
  - `display-md`: 36px (mobile) → 44px (tablet) → 48px (desktop)
  - `display-lg`: 40px (mobile) → 52px (tablet) → 56px (desktop)
- **Headings** (responsive):
  - `heading-sm` (H4): 20px (mobile) → 22px (tablet) → 24px (desktop)
  - `heading-md` (H3): 24px (mobile) → 26px (tablet) → 28px (desktop)
  - `heading-lg` (H2): 28px (mobile) → 30px (tablet) → 32px (desktop)
  - `heading-xl` (H1): 32px (mobile) → 36px (tablet) → 40px (desktop)
- **Body**:
  - `body-sm`: 14px (all viewports)
  - `body-md`: 16px (all viewports)
  - `body-lg`: 18px (mobile) → 20px (tablet/desktop)
- **Labels**:
  - `label-xs`: 12px | `label-sm`: 14px | `label-md`: 16px
  - `label-lg`: 18px (mobile) → 20px (tablet/desktop)
- **Captions**: 14px, medium weight
- **Links**:
  - `link-xs`: 12px | `link-sm`: 14px | `link-md`: 16px
  - `link-lg`: 18px (mobile) → 20px (tablet/desktop)
- **Letter Spacing**:
  - `tracking-tighter` (-1px): Condensed display headlines
  - `tracking-tight` (-0.4px): Large headings and prominent text
  - `tracking-normal` (0px): Default for all body text
  - `tracking-wide` (1px): Uppercase section labels and overlines
  - `tracking-wider` (2px): Uppercase labels requiring maximum readability
- **Line Heights**: Scale from 16px (`3-xs`) through 64px (`3-xl`), proportional to font size

Responsive breakpoints scale typography automatically:
mobile (0px+), tablet (1024px+), desktop (1440px+).

## Spacing

- **Spacer Scale** (base unit 2px):
  - `0`: 0rem | `1`: 0.125rem (2px) | `2`: 0.25rem (4px) | `3`: 0.5rem (8px)
  - `4`: 0.75rem (12px) | `5`: 1rem (16px) | `6`: 1.25rem (20px) | `7`: 1.5rem (24px)
  - `8`: 2rem (32px) | `9`: 3rem (48px) | `10`: 4rem (64px) | `11`: 6rem (96px) | `12`: 8rem (128px)
- **Semantic Sizes** (padding, margin, gap share the same t-shirt scale):
  - `none` (0) | `3-xs` (2px) | `2-xs` (4px) | `xs` (8px) | `sm` (12px) | `md` (16px)
  - `lg` (20px) | `xl` (24px) | `2-xl` (32px) | `3-xl` (48px) | `4-xl` (64px) | `5-xl` (96px)
- **Gutters**: `sm` 16px | `md` 24px | `lg` 32px
- **Paragraph Spacing**: `sm` 0.5rem | `md` 1rem | `lg` 1.5rem | `xl` 2rem

## Border

- **Border Width**:
  - `0`: 0px | `1`: 1px (default) | `2`: 2px (thick/focus) | `3`: 3px | `4`: 4px
  - Form default: 1px, form thick: 2px
- **Border Radius**:
  - `none`: 0px | `xs`: 2px | `sm`: 4px | `md`: 8px (standard) | `lg`: 12px
  - `xl`: 16px | `2-xl`: 24px | `3-xl`: 32px | `full`: 999px (pill)
  - Forms and buttons default to `md` (8px); pill badges/tags use `full` (999px)

## Elevation

Flat design by default. Shadows appear only on interaction, not at rest.

- **Resting state**: No shadow — depth conveyed through border contrast and surface color
- **Navigation shadow**: `0px 2px 2px 0px rgba(14,14,14,0.08)` — subtle bottom edge for sticky navbars
- **Dropdown shadow**: `0px 0px 1px 0px rgba(14,14,14,0.12), 0px 4px 8px 0px rgba(14,14,14,0.12)` — menus, popovers
- **Toast/tooltip shadow**: `0px 0px 2px 0px rgba(0,0,0,0.12), 0px 8px 16px 0px rgba(0,0,0,0.14)` — floating overlays
- **Focus outline**: 2px solid blue-400 (#60aaf4), -2px inset offset
- **Motion**:
  - Easing: `enter` cubic-bezier(0.1,0,0.5,0) | `exit` cubic-bezier(0.15,0.6,0.6,1) | `standard` cubic-bezier(0.25,0,0.25,1)
  - Duration: `faster` 100ms | `fast` 200ms | `standard` 300ms | `slow` 400ms | `slower` 500ms

## Grid

- **Breakpoints**:
  - `xs`: 320px | `sm`: 512px | `md`: 768px | `lg`: 1024px | `xl`: 1280px | `2-xl`: 1440px
- **Container Max Widths**:
  - `md`: 768px | `lg`: 888px | `xl`: 1168px | `2-xl`: 1312px | `3-xl`: 1440px
- **Columns**: 4 (xs) → 8 (sm/md) → 12 (lg/xl/2-xl)
- **Text Max Width**: 864px — prevents overly long lines for readability
- **Sidebar Container**: Narrower max-widths for layouts with a sidebar alongside main content

## Components

- **Buttons**: Rounded (8px), four variants — Primary (filled), Outline (border), Ghost (transparent), Danger (red):
  - Heights: `xs` 32px | `sm` 40px | `md` 48px (default) | `lg` 56px
  - Padding: `form-padding-x` 1rem, `form-padding-y` 0.75rem
  - Icon sizes: `sm` 16px | `md` 20px | `lg` 24px
- **Inputs**: 1px border (form-border-width-default), white background (form-surface-default), 8px radius:
  - Heights: from `3-xs` 12px through `2-xl` 56px
  - Padding: x-axis 1rem, y-axis 0.75rem
  - Focus: 2px blue-400 outline, -2px inset offset
  - Validation states: success (green-600 #0e7c3d), danger (red-600 #cf2323)
- **Cards**: 8px radius, 1px muted border, no resting shadow — shadow on hover for interaction feedback; vertical or horizontal orientation
- **Badges**: Semantic color backgrounds, compact 8px radius
- **Modals**: 8px radius, overlay with translucent background
- **Tables**: Light striping, 1px borders
- **Icons**: Six sizes — `xs` 12px | `sm` 16px | `md` 20px | `lg` 24px | `xl` 32px | `2-xl` 48px | `3-xl` 64px

All interactive elements share a consistent 8px border radius.

## Do's and Don'ts

- Do use the primary purple only for the most important action per screen
- Do maintain WCAG AA contrast ratios (4.5:1 for text, 3:1 for components)
- Do use semantic color tokens (`--sgds-*`) instead of raw hex values
- Do rely on the responsive type scale — no manual media queries for font sizes
- Do use the spacer scale for consistent spacing — avoid arbitrary pixel values
- Do use `tracking-wide` or `tracking-wider` for uppercase labels
- Don't mix rounded and sharp corners in the same view
- Don't apply resting shadows — use flat surfaces with border contrast
- Don't use more than two font weights on a single screen
- Don't override night-mode tokens with hardcoded light-mode colors
- Don't skip the gray scale — use semantic tokens (default, subtle, muted) not raw gray-NNN
