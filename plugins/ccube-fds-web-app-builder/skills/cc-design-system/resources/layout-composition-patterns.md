# FDS Layout & Composition Patterns

> Reference this file **after** selecting components (from the component
> catalogue) and **before** delegating page implementation.
> These patterns describe how to combine FDS components and tokens
> into visually polished, aesthetically pleasing layouts.
>
> This file contains **design decisions**, not code. Use the pattern
> descriptions to populate the "Layout & composition requirements"
> section of the implementation brief. The implementer (CC Software
> Engineer or fallback mode) uses the component catalogue and token
> reference files for implementation details.

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

**Spacing:** `spacing-32` between title and filters. `spacing-16`
between filters and table. `spacing-48` between table and back
navigation. `spacing-64` page-bottom padding.

---

## Common Anti-Patterns

| Anti-pattern                        | Why it looks bad                               | What to specify in the brief instead                                |
| ----------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------- |
| No `Layout.Container` wrapping      | Content stretches full-width on desktop        | "Wrap in `Layout.Section` > `Layout.Container`"                     |
| All text same size and colour       | No visual hierarchy — looks like a document    | "Use at least 3 Typography sizes; `text-subtle` for secondary text" |
| Cards without padding               | Content touches card edges — feels cramped     | "All cards have `spacing-24` padding"                               |
| No spacing between page sections    | Everything runs together                       | "Use `spacing-48` between major sections"                           |
| Summary cards stacked vertically    | Wastes space; dashboard looks like a list      | "Responsive grid: 3 across on desktop, stacked on mobile"           |
| Raw `Table` for sortable data       | Missing hover, sort indicators, loading states | "Use `DataTable` instead of `Table`"                                |
| Form fields without visual grouping | Long list of inputs with no structure          | "Wrap in `Card`, add `Divider` between groups"                      |
| Buttons touching content above      | Actions feel glued to content                  | "Add `spacing-32` above button row"                                 |
| All cards visually identical        | No way to distinguish categories at a glance   | "Add colour-coded top borders using `border-*` tokens"              |
| Missing page-bottom spacing         | Content ends abruptly at viewport edge         | "Add `spacing-64` padding-bottom on page wrapper"                   |
