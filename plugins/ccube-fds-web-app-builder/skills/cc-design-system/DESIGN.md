# Design System

## Overview

A calm, professional, and accessibility-first interface for Singapore
Government digital services. The aesthetic is trustworthy and restrained —
high contrast, generous whitespace, and clear information hierarchy. Visual
noise is low. Every screen should feel consistent, legible, and purposeful
at any viewport size.

The palette is predominantly white with a government blue primary, supported
by semantic status colours (success green, warning amber, error red). Rounded
corners and subtle elevation give depth without decoration. Typography is
clean sans-serif throughout.

---

## Colors

- **Primary** (#1768BE): CTAs, active states, focus rings, key interactive
  elements, brand accent text and icons
- **Secondary** (#5B62A7): Supporting actions, chips, toggle states,
  secondary interactive elements
- **Surface** (#FFFFFF): Default page background and card surfaces
- **On-surface** (#282828): Primary body text on light backgrounds
- **Neutral** (#DDE1E2): Input borders, divider lines, non-chromatic UI,
  card outlines
- **Success** (#257645): Confirmation messages, success banners, positive
  status indicators
- **Warning** (#D07A13): Cautionary alerts and warning banners
- **Error** (#9E130F): Validation errors, destructive actions, error states
- **Info** (#06547B): Informational banners and contextual hints
- **Inverse surface** (#282828): Dark backgrounds for inverted regions
  such as the site masthead and footer

---

## Typography

- **Headline Font**: Open Sans
- **Body Font**: Open Sans
- **Label Font**: Open Sans

Page titles use semi-bold weight at 32–40px. Section headings use semi-bold
at 22–26px. Card and panel headings use semi-bold at 18–22px. Body text uses
regular weight at 16px. Supporting and secondary text uses regular at 14px.
Captions, footnotes, and metadata use regular at 12px. Links use semi-bold
with a primary blue underline style.

Every screen should use at least three distinct text sizes to establish
visual hierarchy. Supporting text should appear visually lighter than primary
text by using the neutral secondary colour rather than extra weight.

---

## Elevation

Depth is conveyed through surface colour variation and a subtle diffuse
box-shadow on raised containers. There are no heavy drop-shadows or hard
borders used for elevation.

- **Page background**: flat, zero elevation — white surface
- **Cards and panels**: slightly elevated with a soft 4–8px diffuse shadow
  and a light (#E2E8F0) 1px border
- **Modals and dialogs**: rendered above the page with a semi-transparent
  dark backdrop to dim background content
- **Popovers and menus**: floating layer above content with a compact shadow
  and rounded 8px corners

---

## Spacing

Based on a 4px grid. Spacing increases in multiples of 4.

| Gap  | Use for                                                  |
| ---- | -------------------------------------------------------- |
| 4px  | Tight intra-element gaps (icon-to-label, badge-to-text)  |
| 8px  | Binding a heading to its immediate body text             |
| 12px | Inner padding on compact inputs and chips                |
| 16px | Default component padding and card insets                |
| 24px | Between related form fields and items in a card grid     |
| 32px | Between form field groups and between the action row and |
|      | content above it                                         |
| 48px | Between major page sections                              |
| 64px | Page bottom padding and hero-level structural spacing    |

Page content is constrained to a 1440px maximum width with responsive side
margins. Content never stretches edge-to-edge on wide viewports.

---

## Components

- **Buttons**: 8px corner radius. Primary uses solid government blue fill
  (#1768BE) with white label. Secondary uses an outlined style with blue
  border and no fill. Destructive actions use error red. Buttons support
  a loading spinner state and icon-left or icon-right variants.
- **Inputs**: 1px neutral border (#CBD5E0), white background, 12px inner
  padding. Error state shows a red border and an inline error message below
  the field. All fields show a distinct focus ring for keyboard accessibility.
  Labelled fields display the label above and helper text below the input.
- **Checkboxes and radio buttons**: 16px touch target. Brand blue fill on
  selected state. Indeterminate state supported for checkboxes.
- **Cards**: white surface with subtle shadow and 8px corner radius. 16px
  internal padding on all sides. No sharp corners.
- **Navigation bar**: brand logo on the left, navigation links centre or
  right, collapses to a full-screen drawer on mobile. Always accompanied by
  the Singapore Government masthead strip above it on government-facing pages.
- **Breadcrumbs**: small text, chevron separators, last item non-interactive.
- **Alerts and banners**: full-width coloured strip with a left-aligned icon,
  title, and optional description. Variants for success, warning, error, and
  info use the respective semantic colours.
- **Tags and badges**: small rounded pills. Tags are text labels; badges
  show numeric counts. Both use subdued background tints of their semantic
  colour.
- **Modals**: centred dialog with heading, scrollable content area, and a
  footer with one or two action buttons. Bottom-sheet variant slides up from
  the bottom edge on mobile.
- **Side panels (Drawer)**: slides in from the right over the page content
  with a dimmed backdrop. Contains a heading and a close button.
- **Menus and popovers**: compact floating panels with 8px corner radius,
  subtle shadow, and grouped item rows. Popovers can be click- or
  hover-triggered.
- **Progress indicator**: horizontal numbered step chain for multi-step
  flows. Completed steps are filled blue; upcoming steps are neutral grey.
- **Pagination**: numbered page controls with previous/next arrows,
  positioned below lists and tables.
- **Data tables**: sortable column headers with a sort direction indicator.
  Optional row selection with a bulk-action bar.

---

## Do's and Don'ts

- Do use the primary blue only for the single most important action per
  screen — overusing it dilutes its signal value
- Do maintain WCAG AA contrast ratios: 4.5:1 for normal text, 3:1 for
  large text and UI components
- Do use at least three distinct text sizes on every screen to establish
  visual hierarchy
- Do include the Singapore Government masthead at the very top of every
  government-facing page
- Do use generous whitespace between sections — the design should feel
  spacious, not cramped
- Don't mix rounded and sharp corner treatments on the same screen
- Don't use more than two font weights (regular and semi-bold) within a
  single view
- Don't rely on colour alone to convey status — always pair colour with an
  icon or text label
- Don't use decorative or display font styles — Open Sans throughout
