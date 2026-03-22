> **Core** group — Typography, Layout, and related primitives.
> For other groups see the other `resources/component-catalogue-*.md` files.
> For token usage (Colour, Spacing, Font), see `resources/foundations-tokens.md`.
> For setup and ThemeProvider, see `resources/theme-setup.md`.
> For the cross-cutting Figma → FDS Quick Lookup table, see
> `resources/component-catalogue.md`.

---

## Core

> Foundational rendering components used on every page: layout scaffolding,
> typography, icons, and text utilities. Scan this group whenever the Figma
> frame contains page-wrapper structures, text layers, or icon references.

### Divider

**Import**: `import { Divider } from "@lifesg/react-design-system/divider"`

**Category**: Core

**Decision rule**
> Use `Divider` whenever a Figma frame contains a horizontal rule or separator
> line — it is the only FDS component for rendering a visible horizontal
> divider.

**When to use**
- A standalone horizontal rule separating distinct content sections within a
  page, card, or form.
- Any "separator" or "divider" layer in a Figma design that renders as a
  visible solid or dashed line.

**When NOT to use**
| Situation                                              | Use instead |
| ------------------------------------------------------ | ----------- |
| Divider is inside markdown / HTML content from a CMS   | `Markup`    |
| Visual break between accordion items (built-in border) | `Accordion` |

**Key props**
| Prop        | Type                                             | Required | Notes                                                                                        |
| ----------- | ------------------------------------------------ | -------- | -------------------------------------------------------------------------------------------- |
| lineStyle   | `"solid" \| "dashed"`                            | no       | Line display style; defaults to `"solid"`.                                                   |
| layoutType  | `"flex" \| "grid"`                               | no       | Layout context; defaults to `"flex"`. Set to `"grid"` inside `Layout.Container type="grid"`. |
| color       | `string \| ((props: ThemeStyleProps) => string)` | no       | Line colour as a CSS string or a theme token function.                                       |
| thickness   | `number`                                         | no       | Line height in px; defaults to `1`.                                                          |
| desktopCols | `number \| number[]`                             | no       | Grid column span at desktop; default `12`. Effective only when `layoutType="grid"`.          |
| tabletCols  | `number \| number[]`                             | no       | Grid column span at tablet; default `8`. Effective only when `layoutType="grid"`.            |
| mobileCols  | `number \| number[]`                             | no       | Grid column span at mobile; default `4`. Effective only when `layoutType="grid"`.            |

**Canonical usage**
```tsx
// Standard solid divider between page sections
import { Divider } from "@lifesg/react-design-system/divider";

<Divider />

// Dashed divider with a custom colour
<Divider lineStyle="dashed" color="#c8cdd3" />

// Divider spanning all columns inside a grid layout
<Layout.Container type="grid">
  <Divider layoutType="grid" desktopCols={12} tabletCols={8} mobileCols={4} />
</Layout.Container>
```

**Figma mapping hints**
| Figma element / layer pattern            | Map to    | Condition                                                              |
| ---------------------------------------- | --------- | ---------------------------------------------------------------------- |
| Dashed separator line                    | `Divider` | Set `lineStyle="dashed"`                                               |
| Horizontal rule / separator line layer   | `Divider` | Default; renders as a solid 1px line                                   |
| Horizontal separator spanning a grid row | `Divider` | Set `layoutType="grid"` with `desktopCols`, `tabletCols`, `mobileCols` |

**Composition patterns**
- Use inside `Layout.Container type="grid"` with `layoutType="grid"` and col
  props to span a full grid row without breaking column flow.
- Pass a theme token function to `color` (e.g.,
  `(props) => props.theme.Divider_Color`) for theme-aware separator colours.

**Known limitations**
- Only horizontal — no vertical divider support.
- `lineStyle` supports only `"solid"` and `"dashed"` — no dotted or double
  styles.
- Grid col span props (`desktopCols`, `tabletCols`, `mobileCols`) are ignored
  when `layoutType="flex"`.

---

### Icon

**Import**: `import { BookmarkIcon } from "@lifesg/react-icons/bookmark"` *(or
barrel: `import { BookmarkIcon } from "@lifesg/react-icons"`)*

**Category**: Core

**Decision rule**
> Use a named `{Name}Icon` component from `@lifesg/react-icons` for every
> standalone icon layer in Figma — choose `{Name}FillIcon` for filled / solid
> variants.

**When to use**
- Any standalone decorative or informational icon layer in a Figma frame.
- Inline icons inside text, cards, or status labels where no interactive
  behaviour is needed.

**When NOT to use**
| Situation                                          | Use instead      |
| -------------------------------------------------- | ---------------- |
| Clickable icon with no visible text label          | `IconButton`     |
| Labeled button that includes an icon               | `ButtonWithIcon` |
| Status banner with a built-in icon (alert/success) | `Alert`          |

**Key props**

All icon components inherit props from `SVGElement`; there are no custom FDS
props.

| Prop      | Type               | Required | Notes                                                                                              |
| --------- | ------------------ | -------- | -------------------------------------------------------------------------------------------------- |
| className | `string`           | no       | CSS class for color and sizing; icons use `currentColor` — set `color` on the element or a parent. |
| style     | `CSSProperties`    | no       | Inline style override; prefer a `styled-components` wrapper for reusable size / color.             |
| width     | `string \| number` | no       | SVG width attribute; prefer CSS `width` for responsive scaling.                                    |
| height    | `string \| number` | no       | SVG height attribute; prefer CSS `height` for responsive scaling.                                  |

**Canonical usage**
```tsx
// Sized and coloured via styled-components
import styled from "styled-components";
import { BookmarkIcon } from "@lifesg/react-icons/bookmark";

const StyledBookmark = styled(BookmarkIcon)`
    color: #1c76d5;
    width: 1.5rem;
    height: 1.5rem;
`;

<StyledBookmark />

// Filled variant — append Fill before Icon in the import name
import { TickCircleFillIcon } from "@lifesg/react-icons/tick-circle";

<TickCircleFillIcon className="status-icon" />
```

**Figma mapping hints**
| Figma element / layer pattern          | Map to                                      | Condition                                                     |
| -------------------------------------- | ------------------------------------------- | ------------------------------------------------------------- |
| Icon symbol — outline / stroke variant | `{Name}Icon` from `@lifesg/react-icons`     | Match name in the react-icons collection; use sub-path import |
| Icon symbol — filled / solid variant   | `{Name}FillIcon` from `@lifesg/react-icons` | Append `Fill` before `Icon` in the component name             |

**Known limitations**
- No `size` or `color` prop — all sizing and colouring is done through CSS
  or a `styled-components` wrapper.
- Icon component names differ from Figma layer names; verify the name in the
  react-icons collection at
  `https://designsystem.life.gov.sg/reacticons/index.html?path=/docs/collection--docs`.

---

### Layout

**Import**: `import { Layout } from "@lifesg/react-design-system/layout"`

**Category**: Core

**Decision rule**
> Use `Layout.Container` as the primary page wrapper — add `type="grid"` for
> multi-column layouts and nest `Layout.ColDiv` children to control
> per-breakpoint column spans; use `Layout.Section` only when you need a
> full-viewport-width band that bleeds to the page edges.

**When to use**
- Any Figma frame where page content sits inside a centred, max-width-1440px
  column.
- Multi-column card or form grids that must reflow across breakpoints.

**When NOT to use**
| Situation                                          | Use instead                               |
| -------------------------------------------------- | ----------------------------------------- |
| Component-level flex/grid unrelated to page layout | Plain `div` with CSS or styled-components |
| Full-bleed hero that needs no constrained column   | `Layout.Section` with `stretch` directly  |

**Sub-components**
| Sub-component      | Role                                                                                |
| ------------------ | ----------------------------------------------------------------------------------- |
| `Layout.Section`   | Full-viewport-width band; `stretch` removes horizontal insets.                      |
| `Layout.Container` | Max-width 1440px wrapper with responsive margins; set `type` for layout mode.       |
| `Layout.Content`   | Same API as `Container`; semantic alias for the primary page body area.             |
| `Layout.ColDiv`    | CSS Grid child — controls column span per breakpoint inside a `type="grid"` parent. |

**Key props — Layout.Section / Layout.Container / Layout.Content**
| Prop        | Type                                    | Required | Notes                                                                                                                                  |
| ----------- | --------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| type        | `"flex"` \| `"flex-column"` \| `"grid"` | no       | Layout mode. `"flex"` (default) = horizontal row. `"flex-column"` = vertical stack. `"grid"` = CSS Grid with breakpoint column counts. |
| stretch     | `boolean`                               | no       | Removes horizontal insets so children span the full container width. Defaults to `false`.                                              |
| data-testid | `string`                                | no       | Test selector on the wrapper element.                                                                                                  |

**Key props — Layout.ColDiv**
| Prop    | Type                         | Required | Notes                                                   |
| ------- | ---------------------------- | -------- | ------------------------------------------------------- |
| xxlCols | `number \| [number, number]` | no       | Span (or [start, end]) at ≥1441px — 12-column grid.     |
| xlCols  | `number \| [number, number]` | no       | Span (or [start, end]) at 1201–1440px — 12-column grid. |
| lgCols  | `number \| [number, number]` | no       | Span (or [start, end]) at 769–1200px — 12-column grid.  |
| mdCols  | `number \| [number, number]` | no       | Span (or [start, end]) at 481–768px — 8-column grid.    |
| smCols  | `number \| [number, number]` | no       | Span (or [start, end]) at 376–480px — 8-column grid.    |
| xsCols  | `number \| [number, number]` | no       | Span (or [start, end]) at 321–375px — 8-column grid.    |
| xxsCols | `number \| [number, number]` | no       | Span (or [start, end]) at 0–320px — 8-column grid.      |

**Canonical usage**
```tsx
// Centred page with a responsive 12-column grid
import { Layout } from "@lifesg/react-design-system/layout";

<Layout.Section>
  <Layout.Container type="grid">
    <Layout.ColDiv xxlCols={6} lgCols={6} mdCols={8} smCols={8}>
      Left column
    </Layout.ColDiv>
    <Layout.ColDiv xxlCols={6} lgCols={6} mdCols={8} smCols={8}>
      Right column
    </Layout.ColDiv>
  </Layout.Container>
</Layout.Section>

// Vertical flex-column layout for stacked page sections
<Layout.Section>
  <Layout.Container type="flex-column">
    <Header />
    <MainContent />
    <Footer />
  </Layout.Container>
</Layout.Section>
```

**Figma mapping hints**
| Figma element / layer pattern           | Map to             | Condition                                                               |
| --------------------------------------- | ------------------ | ----------------------------------------------------------------------- |
| Full-width section / page band          | `Layout.Section`   | Outermost wrapper spanning the full viewport width                      |
| Grid column span cell (responsive)      | `Layout.ColDiv`    | Direct child of a `type="grid"` container; set col props per breakpoint |
| Page content area (max-width 1440px)    | `Layout.Container` | Default `type="flex"` for centred constrained-width content             |
| Page grid layout (12-column responsive) | `Layout.Container` | Set `type="grid"` for responsive 12/8-column layout                     |

**Composition patterns**
- Nest `Layout.Container type="grid"` inside `Layout.Section` to combine a
  full-width background band with a constrained column grid.
- Use `Layout.ColDiv` with `[startCol, endCol]` to position items at a
  specific grid line rather than just spanning N columns.
- Place `Form.Input` with `layoutType="grid"` inside `Layout.ColDiv` for
  responsive multi-column form rows.

**Known limitations**
- `Layout.ColDiv` is only meaningful as a direct child of a `type="grid"`
  container — outside grid context it renders as a plain `div`.
- No built-in `gap` prop on `Layout.Container`; apply row/column gap via
  `style` or a styled-components wrapper.

---

### Typography

**Import**: `import { Typography } from "@lifesg/react-design-system/typography"`

**Category**: Core

**Decision rule**
> Use `Typography.*` for ALL text rendering — never use raw `<h1>`–`<h6>` or
> `<p>` tags when FDS is available; every text layer in Figma maps to a
> specific `Typography.*` sub-component.

**When to use**
- Any heading text layer (H1–H6 equivalents in Figma).
- Any body text, caption, or paragraph copy in a Figma frame.
- Any anchor/link text that should follow the FDS type scale.

**When NOT to use**
| Situation                                      | Use instead                                             |
| ---------------------------------------------- | ------------------------------------------------------- |
| Inline rich text / markdown content from a CMS | `Markup` from `@lifesg/react-design-system/markup`      |
| Ordered or unordered list with FDS list styles | `TextList` from `@lifesg/react-design-system/text-list` |

**Key props (all Typography text variants)**
| Prop      | Type                                                 | Required | Notes                                                                                               |
| --------- | ---------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| weight    | `"regular"` \| `"semibold"` \| `"bold"` \| `"light"` | no       | Font weight override. Each variant has a default weight; only override when the Figma spec differs. |
| inline    | `boolean`                                            | no       | Renders as `display: inline` instead of block. Useful for inline text spans.                        |
| paragraph | `boolean`                                            | no       | Adds a bottom margin to create paragraph spacing.                                                   |
| maxLines  | `number`                                             | no       | Truncates text to N lines with an ellipsis.                                                         |

**Key props (Typography.Link* variants only)**
| Prop           | Type                      | Required | Notes                                                         |
| -------------- | ------------------------- | -------- | ------------------------------------------------------------- |
| external       | `boolean`                 | no       | Shows an external link indicator icon after the link text.    |
| underlineStyle | `"none"` \| `"underline"` | no       | Toggles text underline decoration. Defaults to `"underline"`. |
| href           | `string`                  | no       | URL — from `AnchorHTMLAttributes`.                            |

**Sub-components and Figma size mapping**
| Sub-component           | Figma text style equivalent      | Renders as |
| ----------------------- | -------------------------------- | ---------- |
| `Typography.HeadingXXL` | Display / Hero heading           | `<h1>`     |
| `Typography.HeadingXL`  | Page title / Primary heading     | `<h1>`     |
| `Typography.HeadingLG`  | Section heading                  | `<h2>`     |
| `Typography.HeadingMD`  | Sub-section heading              | `<h3>`     |
| `Typography.HeadingSM`  | Card title / minor heading       | `<h4>`     |
| `Typography.HeadingXS`  | Label heading / smallest heading | `<h5>`     |
| `Typography.BodyBL`     | Body Large / intro paragraph     | `<p>`      |
| `Typography.BodyMD`     | Body Medium / default body text  | `<p>`      |
| `Typography.BodySM`     | Body Small / secondary text      | `<p>`      |
| `Typography.BodyXS`     | Caption / footnote               | `<p>`      |
| `Typography.LinkBL`     | Large hyperlink                  | `<a>`      |
| `Typography.LinkMD`     | Default hyperlink                | `<a>`      |
| `Typography.LinkSM`     | Small hyperlink                  | `<a>`      |
| `Typography.LinkXS`     | Tiny hyperlink                   | `<a>`      |

**Canonical usage**
```tsx
import { Typography } from "@lifesg/react-design-system/typography";

{/* Page heading */}
<Typography.HeadingLG>My service</Typography.HeadingLG>

{/* Body paragraph with spacing */}
<Typography.BodyMD paragraph>
  This is the introductory paragraph text.
</Typography.BodyMD>

{/* Semibold label */}
<Typography.BodySM weight="semibold">Reference number</Typography.BodySM>

{/* Truncated text */}
<Typography.BodyMD maxLines={2}>
  Long text that will be cut off after two lines...
</Typography.BodyMD>

{/* Hyperlink with external indicator */}
<Typography.LinkMD href="https://example.gov.sg" external>
  Visit portal
</Typography.LinkMD>
```

**Figma mapping hints**
| Figma element / layer pattern   | Map to                | Condition                                           |
| ------------------------------- | --------------------- | --------------------------------------------------- |
| Heading text (H1–H6)            | `Typography.Heading*` | Match Figma text style name to the size table above |
| Body / paragraph text (large)   | `Typography.BodyBL`   | Figma text style is Body Large or equivalent        |
| Body / paragraph text (default) | `Typography.BodyMD`   | Figma text style is Body Medium or default body     |
| Caption / supporting text       | `Typography.BodySM`   | Figma text style is Body Small or caption           |
| Footnote / hint text            | `Typography.BodyXS`   | Figma text style is smallest body or footnote       |
| Hyperlink / anchor text         | `Typography.Link*`    | Match size to surrounding body text size            |
| External link with icon         | `Typography.LinkMD`   | Set `external={true}`                               |

**Known limitations**
- `Typography.*` components are styled-components and cannot be extended with
  the `as` prop to change the underlying HTML element; use `className`
  overrides only.
