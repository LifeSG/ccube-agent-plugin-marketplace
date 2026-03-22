> **Content** group — Accordion, Card, DataTable, Table, and related display
> components.
> For other groups see the other `resources/component-catalogue-*.md` files.
> For the cross-cutting Figma → FDS Quick Lookup table, see
> `resources/component-catalogue.md`.

---

## Content

> Static and interactive content-display components. Scan this group when the
> Figma frame shows cards, tables, accordions, tab-switched content, or any
> component that presents data rather than collecting it.

### Accordion

**Import**: `import { Accordion } from "@lifesg/react-design-system/accordion"`

**Category**: Content

**Decision rule**
> Use `Accordion` when the Figma frame shows one or more collapsible content
> sections with individual expand/collapse controls — if the Figma shows tabs
> that swap visible content use `Tab`.

**When to use**
- FAQ lists, help content, or any group of expandable Q&A items.
- Multi-section forms or information pages where most sections start collapsed
  to reduce visual noise.

**When NOT to use**
| Situation                                        | Use instead                                          |
| ------------------------------------------------ | ---------------------------------------------------- |
| Switching between entirely different views/pages | `Tab` from `@lifesg/react-design-system/tab`         |
| Collapsible side navigation tree                 | `Sidenav` from `@lifesg/react-design-system/sidenav` |

**Key props (Accordion)**
| Prop              | Type                               | Required | Notes                                                                                  |
| ----------------- | ---------------------------------- | -------- | -------------------------------------------------------------------------------------- |
| children          | `JSX.Element \| JSX.Element[]`     | yes      | Must be one or more `Accordion.Item` elements.                                         |
| title             | `string`                           | no       | Section heading rendered above all items. Hidden on mobile unless `showTitleInMobile`. |
| enableExpandAll   | `boolean`                          | no       | Shows a "Show All" / "Hide All" toggle above all items.                                |
| initialDisplay    | `"collapse-all"` \| `"expand-all"` | no       | Starting state for all items. Defaults to `"collapse-all"`.                            |
| showTitleInMobile | `boolean`                          | no       | Whether to show the `title` on mobile viewports. Defaults to `false`.                  |
| headingLevel      | `number`                           | no       | Semantic heading level (`1`–6) for the section title element.                          |
| data-testid       | `string`                           | no       | Test selector on the accordion wrapper element.                                        |

**Key props (Accordion.Item)**
| Prop        | Type                           | Required | Notes                                                                                   |
| ----------- | ------------------------------ | -------- | --------------------------------------------------------------------------------------- |
| title       | `string \| JSX.Element`        | yes      | The clickable header text for this collapsible item.                                    |
| children    | `JSX.Element \| JSX.Element[]` | yes      | Content shown when the item is expanded.                                                |
| expanded    | `boolean`                      | no       | Controlled expanded state. Omit to let `Accordion`'s Show All/Hide All take precedence. |
| type        | `"default"` \| `"small"`       | no       | Visual size. `"small"` reduces padding and font size.                                   |
| collapsible | `boolean`                      | no       | If `false`, the item header is not clickable and content is always visible.             |
| data-testid | `string`                       | no       | Test selector on the item element.                                                      |

**Canonical usage**
```tsx
// FAQ accordion with Show All / Hide All control
import { Accordion } from "@lifesg/react-design-system/accordion";

<Accordion title="Frequently asked questions" enableExpandAll>
  <Accordion.Item title="What is this service?">
    <p>This service allows you to...</p>
  </Accordion.Item>
  <Accordion.Item title="How do I get started?">
    <p>To get started, you need to...</p>
  </Accordion.Item>
</Accordion>

// Controlled — always-visible first section, collapsible second
<Accordion>
  <Accordion.Item
    title="Step 1: Personal details"
    expanded={true}
    collapsible={false}
  >
    <p>Always visible content</p>
  </Accordion.Item>
  <Accordion.Item title="Step 2: Address">
    <p>Collapsible content</p>
  </Accordion.Item>
</Accordion>
```

**Figma mapping hints**
| Figma element / layer pattern            | Map to           | Condition                                                      |
| ---------------------------------------- | ---------------- | -------------------------------------------------------------- |
| Accordion / collapsible section group    | `Accordion`      | One or more rows each with a chevron expand/collapse indicator |
| Single collapsible row inside a group    | `Accordion.Item` | One per collapsible row                                        |
| FAQ list / expandable Q&A                | `Accordion`      | Set `enableExpandAll` to add Show All / Hide All control       |
| Collapsible section locked open (always) | `Accordion.Item` | Set `collapsible={false}` and `expanded={true}`                |
| Compact accordion with small row height  | `Accordion.Item` | Set `type="small"` on each item                                |

**Composition patterns**
- Place `Form.*` fields inside `Accordion.Item` children for collapsible form
  sections in multi-step flows.
- Use `ref` on `Accordion.Item` to call `ref.current.expand()` or
  `ref.current.collapse()` imperatively from external controls.

---

### Card

**Import**: `import { Card } from "@lifesg/react-design-system/card"`

**Category**: Content

**Decision rule**
> Use `Card` when the Figma frame shows a visually elevated container with a
> shadow or rounded border that groups related content — if the Figma shows a
> container with a collapsible header use `Accordion` instead.

**When to use**
- Any content grouping surface: summary cards, info panels, list item
  containers, feature tiles.
- When the Figma layer has an elevated `box-shadow` or a rounded, bordered
  card container.

**When NOT to use**
| Situation                                        | Use instead                                                     |
| ------------------------------------------------ | --------------------------------------------------------------- |
| Container that collapses / expands               | `Accordion` from `@lifesg/react-design-system/accordion`        |
| Bordered section with a title bar (no elevation) | `BoxContainer` from `@lifesg/react-design-system/box-container` |

**Key props**
| Prop        | Type     | Required | Notes                                      |
| ----------- | -------- | -------- | ------------------------------------------ |
| data-testid | `string` | no       | Test selector on the card wrapper element. |

> All standard `HTMLDivAttributes` (e.g. `className`, `onClick`, `style`) are
> also accepted.

**Canonical usage**
```tsx
// Basic elevated card container
import { Card } from "@lifesg/react-design-system/card";
import { Typography } from "@lifesg/react-design-system/typography";

<Card data-testid="summary-card">
  <Typography.HeadingMD>Card title</Typography.HeadingMD>
  <Typography.BodyMD>Card body content here.</Typography.BodyMD>
</Card>
```

**Figma mapping hints**
| Figma element / layer pattern     | Map to | Condition                                                   |
| --------------------------------- | ------ | ----------------------------------------------------------- |
| Card surface / elevated container | `Card` | Any `<div>` with elevated shadow or rounded border in Figma |
| Info panel / summary box          | `Card` | Static grouped content with card-style visual treatment     |
| Clickable card / navigable tile   | `Card` | Add `onClick` and `role="button"` or wrap with a `<Link>`   |

**Composition patterns**
- Nest `Typography.*` components inside `Card` for consistent heading and body
  text styling.
- Nest `Button.*` at the bottom of `Card` for action cards with a CTA.

---

### Tab

**Import**: `import { Tab } from "@lifesg/react-design-system/tab"`

**Category**: Content

**Decision rule**
> Use `Tab` when the Figma frame shows a horizontal selector strip that
> toggles which single content panel is visible; for sections that need to
> be independently expandable side by side, use `Accordion` instead.

**When to use**
- Organising content into distinct categories where only one panel is shown
  at a time (e.g., Overview / Details / History).
- Page sections where switching between mutually exclusive views is the
  primary interaction and a flat, horizontal navigation strip fits the layout.

**When NOT to use**
| Situation                                                        | Use instead                                              |
| ---------------------------------------------------------------- | -------------------------------------------------------- |
| Multiple sections that can be visible or collapsed independently | `Accordion` from `@lifesg/react-design-system/accordion` |
| Top-level page navigation routing between URLs                   | `Navbar` or `Sidenav` from the Navigation group          |

**Key props (Tab)**
| Prop                   | Type                                     | Required | Notes                                                                                                                                            |
| ---------------------- | ---------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| children               | `JSX.Element \| JSX.Element[]`           | yes      | One or more `Tab.Item` elements; tab order mirrors JSX order.                                                                                    |
| initialActive          | `number`                                 | no       | Zero-based index of the tab shown on first render. Defaults to `0`.                                                                              |
| currentActive          | `number`                                 | no       | Controlled mode: specifying this takes full control of which tab is active.                                                                      |
| onTabClick             | `(title: string, index: number) => void` | no       | Fires when a tab selector is clicked; receives the tab title and its zero-based index.                                                           |
| fullWidthIndicatorLine | `boolean`                                | no       | Extends the active-tab bottom border to the full container width.                                                                                |
| fadeColor              | `string[] \| FadeColorSet`               | no       | Gradient fade at scroll edges on smaller viewports. Pass `string[]` for symmetric ends, or `{ left: string[], right: string[] }` for asymmetric. |
| headingLevel           | `number`                                 | no       | Semantic heading level applied to the selector strip. Defaults to `2`.                                                                           |
| id                     | `string`                                 | no       | Unique id on the root element.                                                                                                                   |
| data-testid            | `string`                                 | no       | Test selector on the wrapper element.                                                                                                            |

**Key props (Tab.Item)**
| Prop        | Type                           | Required | Notes                                                                                                                                          |
| ----------- | ------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| title       | `string`                       | yes      | Label shown in the selector strip; truncated at 20 characters on tablet and mobile viewports.                                                  |
| children    | `JSX.Element \| JSX.Element[]` | yes      | Content rendered when this tab panel is active.                                                                                                |
| titleAddon  | `TitleAddonProps`              | no       | Custom addon beside the title (e.g., a badge count). `content: JSX.Element` (required); `position: "left" \| "right"` — defaults to `"right"`. |
| width       | `string`                       | no       | Fixed CSS width for this tab in the selector strip.                                                                                            |
| data-testid | `string`                       | no       | Test selector on the panel element.                                                                                                            |

**Canonical usage**
```tsx
// Tabs switching between content sections
import { Tab } from "@lifesg/react-design-system/tab";

<Tab initialActive={0} onTabClick={(title, index) => console.log(title, index)}>
  <Tab.Item title="Section A">
    <p>Content for section A</p>
  </Tab.Item>
  <Tab.Item title="Section B">
    <p>Content for section B</p>
  </Tab.Item>
  <Tab.Item title="Section C">
    <p>Content for section C</p>
  </Tab.Item>
</Tab>

// Controlled mode — manage active index externally
const [active, setActive] = React.useState(0);
<Tab
  currentActive={active}
  onTabClick={(_title, index) => setActive(index)}
>
  <Tab.Item title="Overview">...</Tab.Item>
  <Tab.Item title="Details">...</Tab.Item>
</Tab>
```

**Figma mapping hints**
| Figma element / layer pattern           | Map to     | Condition                                                             |
| --------------------------------------- | ---------- | --------------------------------------------------------------------- |
| Horizontal tab bar / selector strip     | `Tab`      | Multiple label tabs that switch which content panel is visible        |
| Individual tab panel / content section  | `Tab.Item` | One per panel; tab order mirrors JSX order                            |
| Tab selector with numeric badge / count | `Tab.Item` | Set `titleAddon` with badge content; `position` defaults to `"right"` |

**Composition patterns**
- Nest `Typography.*` or `Card` inside each `Tab.Item` for consistent
  spacing and type hierarchy within panels.
- In controlled mode, pair `currentActive` with a `useState` hook and pass
  the index setter directly to `onTabClick`.

**Known limitations**
- Tab labels exceeding 20 characters are truncated on tablet and mobile
  viewports with no built-in tooltip to reveal the full text.
