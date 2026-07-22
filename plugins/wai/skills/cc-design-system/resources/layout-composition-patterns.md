# FDS Layout & Composition Patterns

> Reference this file **after** selecting components (from the component
> catalogue) and **before** delegating page implementation.
> These patterns describe how to combine FDS components and tokens
> into visually polished, aesthetically pleasing layouts that
> **delight stakeholders**.
>
> This file contains **design decisions**, not code. Use the pattern
> descriptions to populate the "Layout & composition requirements"
> section of the implementation brief. The implementer (CC Software
> Engineer or fallback mode) uses the component catalogue and token
> reference files for implementation details.
>
> **What makes an app feel delightful?** Four things beyond static
> layout: (1) responsive feedback after every user action,
> (2) graceful handling of loading, empty, and error states,
> (3) consistent navigation that orients users at all times, and
> (4) smooth transitions between content states. The patterns below
> cover all of these.

---

## Page Shell — Every Page Starts Here

Every page MUST be wrapped in the standard FDS page shell:
`Layout.Section` > `Layout.Container` > `Layout.Content`.

Omitting this is the most common cause of pages looking unfinished.
Without it, content fills the full viewport width with no max-width
constraint (1440px), no responsive side margins, and no readable
line length on wide screens.

**Include in every brief:**
"Wrap all page content in `Layout.Section` > `Layout.Container` >
`Layout.Content`."

---

## Vertical Spacing Rhythm

Consistent vertical spacing is the single biggest factor in making
a page look designed rather than assembled. Specify these token
values in the brief for each page:

| Between…                                    | Token        | Why                                             |
| ------------------------------------------- | ------------ | ----------------------------------------------- |
| Page title and first content section        | `spacing-32` | Clear separation without excessive gap          |
| Major page sections (e.g. cards → table)    | `spacing-48` | Creates distinct visual groups                  |
| Cards in a grid row (gap)                   | `spacing-24` | Tight enough to group, loose enough to breathe  |
| Heading and its body text within a section  | `spacing-8`  | Keeps heading visually bound to its content     |
| Form fields within a group                  | `spacing-24` | Standard form rhythm                            |
| Form field groups (e.g. personal → address) | `spacing-32` | Distinguishes groups without needing a divider  |
| Button row and the content above it         | `spacing-32` | Gives actions visual weight and breathing room  |
| Last content section and page bottom        | `spacing-64` | Prevents content from feeling cramped at bottom |

**Include in every brief:**
"Use `spacing-48` gap between major page sections, `spacing-64`
padding at page bottom. See spacing table in
layout-composition-patterns for all inter-element gaps."

---

## Visual Hierarchy — Text Levels

Flat text (all the same size and weight) makes pages look like
documents rather than applications. Every page MUST use at least
three distinct text levels from this table:

| Level   | Component              | Colour token   | Use for                                 |
| ------- | ---------------------- | -------------- | --------------------------------------- |
| Primary | `Typography.HeadingXL` | `text`         | Page title — one per page               |
| Section | `Typography.HeadingMD` | `text`         | Section headings within the page        |
| Card    | `Typography.HeadingSM` | `text`         | Card titles, panel headers              |
| Body    | `Typography.BodyMD`    | `text`         | Default body text, descriptions         |
| Support | `Typography.BodySM`    | `text-subtle`  | Secondary info, timestamps, helper text |
| Caption | `Typography.BodyXS`    | `text-subtler` | Footnotes, disclaimers, metadata        |

### Heading + Subtitle Pattern

A page title or section heading followed by a supporting description
in `text-subtle` creates instant visual hierarchy. Use this for every
page title:
- `Typography.HeadingXL` for the title
- `Typography.BodyMD` in `Colour["text-subtle"]` for the subtitle

**Include in every brief:**
"Page title uses `HeadingXL` with a `BodyMD` subtitle in
`text-subtle`. Use at least 3 distinct Typography sizes on the page."

---

## Navigation Shell — App-Level Wrapping

A page without navigation looks like an orphaned fragment.
Every application page MUST be wrapped in a navigation shell
that provides orientation and wayfinding.

### Minimum Navigation Shell

Outside the page shell (`Layout.Section` > `Layout.Container` >
`Layout.Content`), every app MUST render:
1. `Navbar` at the top — with brand, primary links, and optional
   user `Avatar` + `Menu` for account actions.
2. `Breadcrumb` below the `Navbar` (when page depth ≥ 2) — shows
   the user's location within the hierarchy.
3. `Footer` at the bottom — with disclaimer links and optional
   app-download badges (`showDownloadAddon`).

### Breadcrumb Placement

Place `Breadcrumb` inside `Layout.Content`, above the page title
block, with `spacing-16` below the breadcrumb and before the
`HeadingXL`.

**Include in every brief:**
"Wrap app in `Navbar` (top) + `Footer` (bottom). Add `Breadcrumb`
inside `Layout.Content` above the page title when page depth ≥ 2."

---

## Card Composition — Elevation & Grouping

Bare content without visual containers looks flat and unstructured.
Wrap related content groups in `Card` components with consistent
internal padding.

### Basic Card Styling

Every `Card` MUST have:
- `spacing-24` internal padding
- A vertical flex layout with `spacing-16` gap between content items

The `Card` component provides built-in elevation (box-shadow). Do not
add `Shadow` tokens to `Card` — they are only needed for custom
containers that are not `Card`.

### Colour-Accented Category Cards

When cards represent different categories (e.g. spending categories,
status groups), differentiate them visually using one of these
approaches:

**Option A — Coloured top border (preferred):**
Add a 3px solid top border using semantic border tokens:
- `border-primary` for the primary/default category
- `border-success` for positive/completed categories
- `border-warning` for attention/pending categories
- `border-error` for negative/overdue categories

**Option B — Subtle background tint:**
Apply a semantic background token to the entire card:
- `bg-primary-subtlest` for primary
- `bg-success` for positive
- `bg-warning` for attention

Option A is preferred because it adds visual distinction without
reducing text contrast.

**Include in brief when cards represent categories:**
"Style each category card with a 3px top border using
`border-primary` / `border-success` / `border-warning` tokens.
All cards have `spacing-24` padding."

---

## Dashboard Layout — Summary Card Grids

Dashboard pages with summary cards MUST use a responsive grid so
cards sit side-by-side on desktop and stack on mobile.

**Two approaches:**

1. **CSS Grid with auto-fill** — cards automatically reflow based
   on available width (minimum 280px per card). Best for a variable
   number of cards.

2. **FDS Grid** (`Layout.Container type="grid"` with
   `Layout.ColDiv`) — precise column control per breakpoint. For
   3 cards: use `lgCols={4}` (3 across on 12-column desktop),
   `mdCols={4}` (2 across on 8-column tablet), `smCols={8}`
   (full-width stacked on mobile).

Use `spacing-24` as the gap between cards in either approach.

**Include in brief for dashboard pages:**
"Place summary cards in a responsive grid (3 across on desktop,
stacked on mobile) with `spacing-24` gap. Use `Layout.ColDiv` with
`lgCols={4}` / `mdCols={4}` / `smCols={8}` for precise control."

---

## Table Layout — Polished Data Display

Raw tables without elevation or spacing look like spreadsheets.

**Rules:**
- ALWAYS prefer `DataTable` over `Table` — it includes built-in
  header styling, row hover states, sort indicators, loading
  skeletons, and empty-state messaging.
- ALWAYS wrap `DataTable` inside a `Card` with `spacing-24` padding
  for elevation and visual distinction.
- Add a `Typography.HeadingMD` section heading above the table
  inside the same `Card`, with `spacing-16` gap between heading
  and table.

**Include in brief for pages with tables:**
"Use `DataTable` (not `Table`), wrapped in a `Card` with
`spacing-24` padding. Add a `HeadingMD` title above the table."

---

## Loading States — Perceived Performance

A page that shows nothing while fetching data feels broken.
Every data-dependent section MUST show a loading indicator that
matches its eventual layout shape.

### DataTable Loading

`DataTable` has a built-in loading skeleton — set the `loadState`
prop to `"loading"`. The skeleton automatically matches column
count and row height. No additional work needed.

### Card Grid Loading

While summary cards fetch data, render placeholder `Card`
components at the same grid dimensions. Inside each placeholder
card, use `LoadingDotsSpinner` (from
`@lifesg/react-design-system/animations`) centred vertically and
horizontally. Keep the same grid layout and `spacing-24` gap so
the page does not reflow when real data arrives.

### Full-Page Loading

For initial page loads where the entire content depends on an
API call, render the page shell and `Navbar` immediately, then
show `ThemedLoadingSpinner` (from
`@lifesg/react-design-system/animations`) centred inside
`Layout.Content` with `spacing-64` top margin. This component
follows the active theme automatically. Keep the navigation
usable while the user waits.

### Button Loading

When a button triggers an async action (form submit, API call),
set `loading={true}` on the `Button` component. The button
automatically shows a spinner and disables re-clicks.

**Include in every brief:**
"Show `DataTable` loading skeleton (`loadState="loading"`).
Use `LoadingDotsSpinner` inside placeholder cards for card
grids. Set `loading={true}` on submit buttons during async
operations."

---

## Empty States — First Impressions Matter

An empty table or card grid with no guidance makes users think
the app is broken. Every data-dependent section MUST have an
empty state that (a) explains why there is no data and (b)
provides a call-to-action when appropriate.

### DataTable Empty State

`DataTable` supports an `emptyView` prop of type
`ErrorDisplayAttributes` — pass an object with `title` and
`description` fields to customise the empty-state message.
For richer empty states, compose a custom component placed
above or below the `DataTable` (conditionally rendered when
`rows` is empty) with this structure:
1. An icon or illustration (optional) — centred above the message.
2. `Typography.BodyMD` with a clear explanation
   (e.g. "No transactions found").
3. `Typography.BodySM` in `text-subtle` with guidance
   (e.g. "Try adjusting your filters").
4. A `Button.Small styleType="light"` CTA if the user can act
   (e.g. "Create new entry").

Wrap the custom empty state block in a `div` with `spacing-48`
vertical padding and centre-align.

### Card Grid Empty State

When the card grid has no items, replace the grid with a single
full-width `Card` containing the same structure as above.

**Include in every brief:**
"Define empty states for every table and card grid. Use
`emptyView` for `DataTable`. Show explanation + guidance +
optional CTA."

---

## Error States — Graceful Degradation

Uncaught errors that show raw error text or a blank screen
destroy stakeholder confidence. Every page MUST handle errors
gracefully.

### Inline Section Error

When a single section fails to load but the rest of the page is
fine, replace that section's content with an `Alert` of
`type="error"` inside its `Card`. Include:
- A user-friendly message (never raw error codes).
- An `actionLink` to retry or contact support.

### Full-Page Error

When the entire page fails, render the page shell and `Navbar`,
then show a centred error block inside `Layout.Content`:
1. `Alert` with `type="error"` containing the error summary.
2. `Button.Default` to retry the failed operation.
3. `spacing-48` top margin to centre visually.

### Form Validation Error

After form submission fails validation, show an `Alert` of
`type="error"` with `sizeType="default"` above the form `Card`,
summarising all errors. Individual field errors use each
`Form.*` component's built-in `errorMessage` prop.

**Include in every brief:**
"Handle section-level errors with `Alert type="error"` inside
the section `Card`. Handle full-page errors with a centred
`Alert` + retry `Button`. Show validation errors both inline
and in a summary `Alert` above the form."

---

## Feedback & Notifications — Action Confirmation

Users who perform an action and see no response feel uncertain.
Every user-initiated action MUST produce visible feedback.

### Success Confirmation

After a successful form submission or action:
- Show a `Toast` with `autoDismiss={true}` (defaults to 4
  seconds; set `autoDismissTime` for custom duration) for
  non-critical confirmations (e.g. "Settings saved").
- Show an `Alert` of `type="success"` at the top of the page
  (persistent, inside `Layout.Content`) for important
  confirmations (e.g. "Application submitted").

### Warning Notifications

Use `Alert` with `type="warning"` inside `Layout.Content` for
persistent warnings that need user attention (e.g. "Your session
expires in 10 minutes").

Use `NotificationBanner` for full-width page-level banners
(e.g. system maintenance notice) placed above the `Navbar`.

### Progress Feedback

For multi-step workflows (wizards), place `ProgressIndicator`
above the form content, inside `Layout.Content`, with
`spacing-32` below it. Set `currentIndex` to the 0-based active
step. This shows users where they are and how much is left.

**Include in every brief:**
"Use `Toast` for transient success messages. Use `Alert
type="success"` for persistent confirmations. Add
`ProgressIndicator` above multi-step forms."

---

## Tab-Based Content Switching

When a page has multiple content views that share the same
context (e.g. "Overview" / "Details" / "History" tabs on a
record page), use `Tab` instead of stacking all sections
vertically.

### Tab Composition Rules

- Place `Tab` inside `Layout.Content`, below the page title
  block, with `spacing-32` above and below.
- Each `Tab` panel contains its own section content — apply the
  same spacing rhythm and card composition rules inside each
  panel as you would for a standalone page section.
- Tab labels use concise names (1–3 words).

**Include in brief when page has multiple views:**
"Use `Tab` below the page title for content switching. Apply
normal section patterns inside each tab panel."

---

## Confirmation & Destructive Actions

Destructive actions (delete, cancel, revoke) that execute
immediately without confirmation feel unsafe. Every destructive
action MUST show a confirmation dialog.

### Confirmation Dialog Pattern

Use `ModalV2` composed as a confirmation dialog:
1. `ModalV2.Card` with `spacing-24` padding.
2. `ModalV2.Content` containing:
   - `Typography.HeadingMD` with a clear question
     (e.g. "Delete this record?").
   - `Typography.BodyMD` in `text-subtle` explaining
     consequences (e.g. "This action cannot be undone.").
3. `ModalV2.Footer` with:
   - Primary: `Button.Default` with `danger` prop for the
     destructive action.
   - Secondary: `Button.Default styleType="light"` for cancel.

**Include in brief for destructive actions:**
"Show `ModalV2` confirmation before any destructive action.
Primary button uses `danger`. Secondary button is `styleType=
"light"` for cancel."

---

## Sticky Action Bar — Long Form Accessibility

When a form is longer than one viewport height, users must
scroll back up to find the submit button. Use a sticky action
bar at the bottom of the viewport for long forms.

### Sticky Bar Structure

A `div` fixed to the viewport bottom with:
- `bg-stronger` background for visual separation from content.
- `spacing-16` vertical padding, `spacing-24` horizontal padding.
- Buttons right-aligned: primary `Button.Default` + secondary
  `Button.Default styleType="light"` with `spacing-16` gap.
- A subtle `Shadow["lg"]` (or `box-shadow`) on the top edge to
  visually lift the bar above scrolling content.

The sticky bar replaces the in-card button row from the
Single-Group Form pattern. Do NOT show buttons in both places.

**Include in brief for long forms (> 1 viewport):**
"Use a sticky action bar fixed to the viewport bottom with
`bg-stronger` background. Right-align primary and secondary
buttons."

---

## Section Background Alternation

Pages with many sections that all share the same background
blend together. Alternate section backgrounds to create visual
rhythm.

### Alternation Pattern

For pages with 3+ major sections, alternate between:
- Default background (no explicit `bg` — inherits page default)
- `bg-neutral` on the `Layout.Section` wrapper

Apply the tinted background to the `Layout.Section` element
(not the `Card` inside it). This creates full-width colour
bands that separate logical groups.

Use this sparingly — 2–3 alternations per page maximum.
Dashboard and list pages benefit most.

**Include in brief when page has 3+ sections:**
"Alternate `Layout.Section` backgrounds between default and
`bg-neutral` to visually separate major sections."

---

## Form Layout — Grouped & Structured

Forms with fields stacked without grouping or spacing look like
endless lists.

### Single-Group Form

Wrap all fields inside a `Card` with this structure:
1. `Typography.HeadingMD` as the form title
2. `Divider` below the title
3. Form fields in a vertical stack with `spacing-24` gap
4. `Divider` above the button row
5. Button row: primary `Button.Default` + secondary
   `Button.Default styleType="light"`, with `spacing-16` gap
   between buttons

The `Card` has `spacing-24` internal padding.

### Multi-Group Form

When a form has distinct sections (e.g. personal details, address,
payment):
- Each section gets its own heading (`Typography.HeadingSM`)
- Use `spacing-32` between sections
- Use `Divider` between major groups

### Multi-Column Fields

For wider forms, use `Layout.Container type="grid"` with
`Layout.ColDiv` to place related fields side-by-side on desktop
(e.g. `lgCols={6}` for two fields in a row) while stacking on
mobile (`smCols={8}`).

**Include in brief for form pages:**
"Wrap form in a `Card` with `spacing-24` padding. Structure:
`HeadingMD` title → `Divider` → fields with `spacing-24` gap →
`Divider` → button row with `spacing-16` gap."

---

## Page Recipes — Complete Patterns

### Dashboard Page

A dashboard page combines: page title with subtitle, summary card
grid, and a recent-activity table.

**Structure:**
1. Page shell (`Layout.Section` > `Layout.Container` >
   `Layout.Content`)
2. Page title block (`HeadingXL` + `BodyMD` subtitle in
   `text-subtle`)
3. Summary cards in responsive grid (3 `Card` components with
   accent borders, each containing: `HeadingSM` category name,
   `BodySM` subtitle in `text-subtle`, `HeadingXL` for the large
   number, and a `Button.Small styleType="light"` CTA)
4. Recent activity section (`DataTable` wrapped in a `Card` with
   a `HeadingMD` title)

**Spacing:** `spacing-48` between the title block, card grid, and
table section. `spacing-24` gap between cards within the grid.
`spacing-64` page-bottom padding.

**States:** Use `LoadingDotsSpinner` inside placeholder cards
while summary data loads. Show `DataTable` loading skeleton
(`loadState="loading"`) for the activity table. Define `emptyView` for the table with a message
like "No recent activity". Show `Alert type="error"` inside the
relevant section `Card` if a data fetch fails.

### Form Page

A form page combines: page title, form card with grouped fields,
and an action button row.

**Structure:**
1. Page shell
2. Page title block (`HeadingXL` + `BodyMD` subtitle)
3. Form card (see Form Layout section above)

**Spacing:** `spacing-32` between title block and form card.
`spacing-24` between fields. `spacing-16` between buttons.
`spacing-64` page-bottom padding.

**States:** Set `loading={true}` on the submit `Button` during
async submission. Show `Toast` for transient success
confirmation. Show `Alert type="error"` above the form `Card`
for validation error summaries. Use `ProgressIndicator` above
the form when the page is part of a multi-step wizard.

### List / Transaction Page

A list page combines: page title, optional filter controls, a data
table, and back navigation.

**Structure:**
1. Page shell
2. Page title block with optional action button (`HeadingXL` +
   `Button.Small` aligned to the right)
3. Filter row (optional — `Input` with `styleType="no-border"` for
   search, or `Filter` for multi-faceted filtering)
4. Data table wrapped in a `Card` (`DataTable` with sortable
   headers and a `HeadingMD` section title)
5. Back navigation (`Button.Small styleType="light"` or
   `Breadcrumb`)

**States:** Show `DataTable` loading skeleton
(`loadState="loading"`) while fetching. Define `emptyView` with
explanation for zero results. Show `Alert type="error"` inside
the table `Card` if fetch fails.

**Spacing:** `spacing-32` between title and filters. `spacing-16`
between filters and table. `spacing-48` between table and back
navigation. `spacing-64` page-bottom padding.

### Detail / View Page

A detail page shows a single record with structured fields,
actions, and optional related data.

**Structure:**
1. Page shell
2. `Breadcrumb` (record sits inside a list hierarchy)
3. Page title block (`HeadingXL` record name + `BodyMD` subtitle
   with record ID or status in `text-subtle`)
4. Action button row aligned right (e.g. `Button.Small` "Edit",
   `Button.Small danger` "Delete")
5. `Tab` component (when record has multiple views:
   Overview / Details / History)
6. Primary info `Card` with key-value pairs:
   - Each pair: `Typography.BodySM` label in `text-subtle` +
     `Typography.BodyMD` value below it, `spacing-8` gap
   - Pairs laid out in a 2-column grid on desktop
     (`lgCols={6}` each) stacking on mobile (`smCols={8}`)
7. Related data section (`DataTable` in a `Card` with
   `HeadingMD` title) — e.g. transaction history, linked records

**States:** Use `ThemedLoadingSpinner` centred in
`Layout.Content` while the record loads. Show full-page error `Alert` if the
record fails to load. Use `ModalV2` confirmation before delete.

**Spacing:** `spacing-16` below breadcrumb. `spacing-32` between
title and action row. `spacing-32` between action row and tabs |
primary card. `spacing-48` between primary card and related data.
`spacing-64` page-bottom padding.

### Settings / Profile Page

A settings page combines: page title, grouped form sections in
separate cards, and a save action.

**Structure:**
1. Page shell
2. Page title block (`HeadingXL` + `BodyMD` subtitle)
3. Multiple `Card` components, one per settings group, each
   following the Single-Group Form pattern
4. Sticky action bar at viewport bottom (for pages with
   multiple groups that exceed one viewport height)

**States:** Use `Toast` for save confirmations. Use `Alert
type="error"` above the relevant `Card` for validation failures.

**Spacing:** `spacing-32` between title and first card.
`spacing-32` between cards. `spacing-64` page-bottom padding
(above the sticky bar if present).

---

## Responsive Breakpoint Quick Reference

FDS uses a 12-column grid on desktop and an 8-column grid on
mobile/tablet. The key breakpoints for `Layout.ColDiv`:

| Token    | Viewport             | Columns   | Typical use            |
| -------- | -------------------- | --------- | ---------------------- |
| `smCols` | ≤ 767 px (mobile)    | out of 8  | Full-width stacked     |
| `mdCols` | 768–1023 px (tablet) | out of 8  | 2-across or full-width |
| `lgCols` | ≥ 1024 px (desktop)  | out of 12 | 2, 3, or 4-across      |

**Common column formulas:**
- Full-width on all: `smCols={8} mdCols={8} lgCols={12}`
- 2-across on desktop, stacked on mobile:
  `smCols={8} mdCols={4} lgCols={6}`
- 3-across on desktop, 2 on tablet, stacked on mobile:
  `smCols={8} mdCols={4} lgCols={4}`

**Include in every brief with grids:**
"See responsive breakpoint table in layout-composition-patterns
for column values."

---

## Common Anti-Patterns

| Anti-pattern                           | Why it looks bad                               | What to specify in the brief instead                                                  |
| -------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------- |
| No `Layout.Container` wrapping         | Content stretches full-width on desktop        | "Wrap in `Layout.Section` > `Layout.Container`"                                       |
| All text same size and colour          | No visual hierarchy — looks like a document    | "Use at least 3 Typography sizes; `text-subtle` for secondary text"                   |
| Cards without padding                  | Content touches card edges — feels cramped     | "All cards have `spacing-24` padding"                                                 |
| No spacing between page sections       | Everything runs together                       | "Use `spacing-48` between major sections"                                             |
| Summary cards stacked vertically       | Wastes space; dashboard looks like a list      | "Responsive grid: 3 across on desktop, stacked on mobile"                             |
| Raw `Table` for sortable data          | Missing hover, sort indicators, loading states | "Use `DataTable` instead of `Table`"                                                  |
| Form fields without visual grouping    | Long list of inputs with no structure          | "Wrap in `Card`, add `Divider` between groups"                                        |
| Buttons touching content above         | Actions feel glued to content                  | "Add `spacing-32` above button row"                                                   |
| All cards visually identical           | No way to distinguish categories at a glance   | "Add colour-coded top borders using `border-*` tokens"                                |
| Missing page-bottom spacing            | Content ends abruptly at viewport edge         | "Add `spacing-64` padding-bottom on page wrapper"                                     |
| No loading state for data sections     | Page looks broken while data fetches           | "Use `loadState="loading"` on `DataTable`; `LoadingDotsSpinner` in card placeholders" |
| Empty table with no guidance           | User thinks the app is broken or data is lost  | "Define `emptyView` with explanation + CTA for each `DataTable`"                      |
| Raw error text shown to user           | Destroys confidence; looks like a crash        | "Use `Alert type="error"` with user-friendly message + retry CTA"                     |
| No feedback after form submission      | User unsure if action succeeded                | "Show `Toast` or `Alert type="success"` after submission"                             |
| Delete without confirmation dialog     | Data loss feels unsafe and accidental          | "Show `ModalV2` confirmation before any destructive action"                           |
| No navigation shell (Navbar/Footer)    | Page looks like an orphaned fragment           | "Wrap app in `Navbar` + `Footer`; add `Breadcrumb` when depth ≥ 2"                    |
| Submit button off-screen on long forms | User scrolls hunting for the action            | "Use sticky action bar for forms > 1 viewport height"                                 |
