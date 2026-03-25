> **Navigation** group — navigation and wayfinding components.
> For other groups see the other `resources/component-catalogue-*.md` files.
> For the cross-cutting Figma → FDS Quick Lookup table, see
> `resources/component-catalogue.md`.

---

## Navigation

> Components for navigating between pages, sections, and app states.

---

### Breadcrumb

**Import**: `import { Breadcrumb } from "@lifesg/react-design-system/breadcrumb"`

**Category**: Navigation

**Decision rule**
> Use `Breadcrumb` when showing the user's location within a page hierarchy to
> enable navigation back to any ancestor page.

**When to use**
- The app has two or more levels of page hierarchy and users need to retrace
  their path.
- The current page is deep within a nested section where path context aids
  orientation.

**When NOT to use**
| Situation                                                      | Use instead  |
| -------------------------------------------------------------- | ------------ |
| Primary site-level navigation bar at the top of every page     | `Navbar`     |
| Section-level navigation in a side panel                       | `Sidenav`    |
| Moving between numbered pages of a data list or search results | `Pagination` |

**Key props**
| Prop           | Type                                              | Required | Notes                                                                                                                                                    |
| -------------- | ------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| links          | `React.AnchorHTMLAttributes<HTMLAnchorElement>[]` | yes      | Array of link objects; each supports `children` (label), `href`, and `onClick`. The last item is always rendered as non-interactive (current page).      |
| separatorStyle | `"chevron" \| "slash"`                            | no       | Separator between breadcrumb items. Default: `"chevron"`.                                                                                                |
| fadeColor      | `string[] \| FadeColorSet`                        | no       | Gradient fade color at overflow edges. `FadeColorSet`: `{ left?: string[], right?: string[] }`. Only visible when breadcrumbs overflow on tablet/mobile. |
| fadePosition   | `"left" \| "right" \| "both"`                     | no       | Which overflow edge(s) display the fade gradient. Default: `"both"`.                                                                                     |
| itemStyle      | `CSSProperties`                                   | no       | Inline styles applied to each breadcrumb item.                                                                                                           |
| id             | `string`                                          | no       | Unique HTML id for the component root.                                                                                                                   |
| className      | `string`                                          | no       | CSS class selector for the component root.                                                                                                               |
| data-testid    | `string`                                          | no       | Test identifier for automated testing.                                                                                                                   |

**Canonical usage**
```tsx
// Basic breadcrumb with chevron separators (default)
import { Breadcrumb } from "@lifesg/react-design-system/breadcrumb";

<Breadcrumb
  links={[
    { children: "Home", href: "/" },
    { children: "Services", href: "/services" },
    { children: "Current page" }, // last item — no href; always non-interactive
  ]}
/>
```

**Figma mapping hints**
| Figma element / layer pattern         | Map to       | Condition                                 |
| ------------------------------------- | ------------ | ----------------------------------------- |
| Breadcrumb trail / page location path | `Breadcrumb` | Any multi-level hierarchy navigation path |
| Breadcrumb with slash separators      | `Breadcrumb` | Set `separatorStyle="slash"`              |

**Known limitations**
- Each link item renders as a plain `<a>` element; client-side router `Link`
  components (e.g., Next.js `<Link>`) must be integrated via `onClick` +
  `href`, or by passing router-aware `children` — there is no built-in `as`
  prop for router adapter integration.

---

### Footer

**Import**: `import { Footer } from "@lifesg/react-design-system/footer"`

**Category**: Navigation

**Decision rule**
> Use `Footer` for the mandatory site-wide bottom section with directory
> links, disclaimer links, and copyright information; use `Navbar` for all
> top-of-page primary navigation.

**When to use**
- Full-page layouts requiring directory navigation, mandated disclaimer
  links (Privacy Statement, Terms of Use, Report Vulnerability), and
  copyright information at the bottom of the page.
- Dedicated app pages where only the minimal, disclaimer-links-only version
  is needed (omit `links`, `showDownloadAddon`, and `showResourceAddon`).

**When NOT to use**
| Situation                                         | Use instead |
| ------------------------------------------------- | ----------- |
| Primary navigation bar at the top of every page   | `Navbar`    |
| Section-level vertical navigation in a side panel | `Sidenav`   |

**Key props**
| Prop              | Type                           | Required | Notes                                                                                                                                   |
| ----------------- | ------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| links             | `FooterLinkProps<T>[][]`       | no       | Multi-array of link objects; each inner array renders as a separate column in the footer.                                               |
| disclaimerLinks   | `DisclaimerLinks`              | no       | Override `href`, `rel`, or `external` on the three mandated links (`privacy`, `termsOfUse`, `reportVulnerability`). Link text is fixed. |
| lastUpdated       | `Date`                         | no       | Last updated date shown in the footer bottom. Ignored when `copyrightInfo` is set.                                                      |
| copyrightInfo     | `string`                       | no       | Replaces the auto-generated copyright line; setting this makes `lastUpdated` irrelevant.                                                |
| logoSrc           | `string`                       | no       | Custom logo image source. Defaults to the active theme service logo.                                                                    |
| hideLogo          | `boolean`                      | no       | Hides the logo and aligns links to the leftmost position.                                                                               |
| layout            | `"default" \| "stretch"`       | no       | `"stretch"` expands footer content to full width, ignoring masthead alignment. Default: `"default"`.                                    |
| showDownloadAddon | `boolean`                      | no       | Shows App Store / Google Play download buttons in the footer.                                                                           |
| showResourceAddon | `boolean`                      | no       | Shows theme-specific resource content in the right section. `showDownloadAddon` takes precedence if both are `true`.                    |
| children          | `JSX.Element \| JSX.Element[]` | no       | Custom content for the top section, overriding the default logo, links, and download section.                                           |

**Canonical usage**
```tsx
// Standard site footer with directory link columns and default disclaimer links
import { Footer } from "@lifesg/react-design-system/footer";

<Footer
  links={[
    [
      { children: "Home", href: "/" },
      { children: "Services", href: "/services" },
    ],
    [
      { children: "About us", href: "/about" },
      { children: "Contact", href: "/contact" },
    ],
  ]}
  lastUpdated={new Date()}
/>
```

**Figma mapping hints**
| Figma element / layer pattern                           | Map to   | Condition                                                     |
| ------------------------------------------------------- | -------- | ------------------------------------------------------------- |
| Footer — minimal, disclaimer links only                 | `Footer` | Omit `links`; disclaimer links are always rendered by default |
| Footer with App Store / Google Play download badges     | `Footer` | Set `showDownloadAddon={true}`                                |
| Footer with full-width stretched layout                 | `Footer` | Set `layout="stretch"` to ignore masthead width constraint    |
| Site footer with logo, link columns, and disclaimer bar | `Footer` | Full-width bottom section with directory and legal links      |

**Composition patterns**
- Pair with `Navbar` at page level: `Navbar` at the top, `Footer` at the
  bottom, with `Layout.Container` wrapping the page body between them.

**Known limitations**
- Disclaimer link text (Privacy Statement, Terms of Use, Report
  Vulnerability) is fixed and cannot be customised; only `href`, `rel`, and
  `external` attributes are overridable via `disclaimerLinks`.
- `showResourceAddon` content is theme-specific (e.g., MyLegacy agency
  logos); it is not configurable via props beyond toggling visibility.

---

### LocalNav

**Import**:
`import { LocalNavMenu, LocalNavDropdown } from "@lifesg/react-design-system/local-nav"`

**Category**: Navigation

**Decision rule**
> Use `LocalNavMenu`/`LocalNavDropdown` for in-page section navigation within
> a single page; use `Navbar` for site-level page-to-page navigation.

**When to use**
- Long pages with multiple anchored sections that need a local table of
  contents.
- Responsive layouts that show a vertical local menu on desktop and switch to
  a sticky dropdown on smaller screens.

**When NOT to use**
| Situation                                 | Use instead |
| ----------------------------------------- | ----------- |
| Global app navigation across routes/pages | `Navbar`    |

**Key props**
| Prop              | Type                                                                                                  | Required | Notes                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------ |
| items             | `LocalNavItemProps[]`                                                                                 | yes      | Local section entries rendered in menu/dropdown. |
| selectedItemIndex | `number`                                                                                              | no       | Sets current active section index.               |
| onNavItemSelect   | `(e: React.MouseEvent \| React.KeyboardEvent, item: LocalNavItemProps, index: number) => void`        | no       | Called when user selects a local nav item.       |
| renderItem        | `(item: LocalNavItemProps, renderProps: { selected: boolean; stickied: boolean }) => React.ReactNode` | no       | Custom renderer for nav item display.            |
| id                | `string`                                                                                              | no       | Unique identifier on menu/dropdown root.         |
| className         | `string`                                                                                              | no       | Custom class selector for styling hooks.         |
| data-testid       | `string`                                                                                              | no       | Test selector for root element.                  |

**Canonical usage**
```tsx
// Local section navigation: menu on desktop, sticky dropdown on mobile
import {
  LocalNavDropdown,
  LocalNavMenu,
} from "@lifesg/react-design-system/local-nav";

const items = [
  { id: "overview", title: "Overview" },
  { id: "requirements", title: "Requirements" },
  { id: "faq", title: "FAQ" },
];

<LocalNavMenu
  items={items}
  selectedItemIndex={selectedIndex}
  onNavItemSelect={(_e, _item, index) => setSelectedIndex(index)}
/>
```

**Figma mapping hints**
| Figma element / layer pattern                    | Map to             | Condition                                             |
| ------------------------------------------------ | ------------------ | ----------------------------------------------------- |
| Section-level local navigation menu              | `LocalNavMenu`     | Vertical in-page section navigation list.             |
| Sticky local section dropdown on smaller screens | `LocalNavDropdown` | Compact sticky selector for the same local nav items. |

**Composition patterns**
- Pair `LocalNavMenu` (desktop) with `LocalNavDropdown` (mobile/tablet) using
  one shared `items` source and selected index state.

**Known limitations**
- Storybook examples note demo-only code for responsive switching; production
  implementations should use project breakpoints and layout wrappers.

---

### Masthead

**Import**: `import { Masthead } from "@lifesg/react-design-system/masthead"`

**Category**: Navigation

**Decision rule**
> Use `Masthead` for the mandatory official government banner at the top of
> `.gov.sg` pages; do not use it as a primary navigation bar.

**When to use**
- Every `.gov.sg` page that must display the official Singapore Government
  banner.
- Layouts that need masthead spacing aligned with FDS `Layout` containers.

**When NOT to use**
| Situation                                      | Use instead |
| ---------------------------------------------- | ----------- |
| Primary site navigation with links and actions | `Navbar`    |

**Key props**
| Prop    | Type      | Required | Notes                                                        |
| ------- | --------- | -------- | ------------------------------------------------------------ |
| stretch | `boolean` | no       | Stretches masthead full width with fixed horizontal padding. |

**Canonical usage**
```tsx
// Mandatory government banner at page top
import { Masthead } from "@lifesg/react-design-system/masthead";

<Masthead />
```

**Figma mapping hints**
| Figma element / layer pattern                                 | Map to     | Condition                                  |
| ------------------------------------------------------------- | ---------- | ------------------------------------------ |
| Official Singapore Government banner at top of page (.gov.sg) | `Masthead` | Mandatory banner above page content header |

**Known limitations**
- Requires a SGDS masthead script; strict CSP setups must allow the documented
  script URL.

---

### Navbar

**Import**: `import { Navbar } from "@lifesg/react-design-system/navbar"`

**Category**: Navigation

**Decision rule**
> Use `Navbar` for top-of-page primary navigation that combines branding,
> nav links, and action buttons across responsive viewports; use `Breadcrumb`
> only for hierarchical wayfinding inside a page path.

**When to use**
- Site-level navigation bars with brand logo, top-level links, and
  utility/action controls.
- Responsive headers where desktop links collapse into a mobile drawer.

**When NOT to use**
| Situation                                              | Use instead  |
| ------------------------------------------------------ | ------------ |
| User only needs page-path context (Home > Section > …) | `Breadcrumb` |
| Vertical side navigation for section-level IA          | `Sidenav`    |

**Key props**
| Prop                      | Type                                        | Required | Notes                                                                       |
| ------------------------- | ------------------------------------------- | -------- | --------------------------------------------------------------------------- |
| items                     | `NavItemsProps<T>`                          | yes      | Desktop/mobile nav item definitions; mobile defaults to desktop if omitted. |
| actionButtons             | `NavbarActionButtonsProps`                  | no       | Right-side action buttons; supports button, download, or custom components. |
| selectedId                | `string`                                    | no       | Current selected navigation item id.                                        |
| resources                 | `NavbarResourcesProps`                      | no       | Primary and secondary branding configuration.                               |
| masthead                  | `boolean`                                   | no       | Shows SG masthead section; defaults to `true`.                              |
| fixed                     | `boolean`                                   | no       | Keeps navbar fixed at top; defaults to `true`.                              |
| layout                    | `"default" \| "stretch"`                    | no       | `"stretch"` expands navbar content to full width with fixed padding.        |
| hideNavBranding           | `boolean`                                   | no       | Hides brand logos and aligns nav items left on desktop.                     |
| hideLinkIndicator         | `boolean`                                   | no       | Hides selected-link indicator styling.                                      |
| drawerDismissalExclusions | `DrawerDismissalMethod[]`                   | no       | Prevents drawer auto-dismiss for selected actions in mobile/tablet.         |
| onItemClick               | `(item: NavItemProps<T>) => void`           | no       | Called when a navigation link item is clicked.                              |
| onActionButtonClick       | `(actionButton: NavbarButtonProps) => void` | no       | Called when an action button is clicked.                                    |

**Canonical usage**
```tsx
// Primary website navigation with desktop + mobile item sets
import { Navbar } from "@lifesg/react-design-system/navbar";

<Navbar
  items={{
    desktop: [
      { id: "home", children: "Home", href: "/" },
      { id: "services", children: "Services", href: "/services" },
    ],
  }}
  actionButtons={{
    desktop: [
      {
        type: "button",
        args: { children: "Logout", styleType: "secondary" },
      },
    ],
  }}
  selectedId="services"
  onItemClick={(item) => console.log(item.id)}
/>
```

**Figma mapping hints**
| Figma element / layer pattern                     | Map to   | Condition                                                  |
| ------------------------------------------------- | -------- | ---------------------------------------------------------- |
| Top app/site navigation bar with logo and links   | `Navbar` | Includes primary branding and top-level navigation items   |
| Mobile nav drawer triggered from header menu icon | `Navbar` | Same nav IA must collapse into drawer on smaller viewports |

**Composition patterns**
- Add `Avatar` as an uncollapsible custom action button for signed-in user
  profile access in desktop and mobile layouts.

**Known limitations**
- Drawer dismissal animation takes about 550ms on mobile/tablet; defer
  post-click scroll/focus transitions until dismissal completes.
- Uses an SG masthead web-component script; strict CSP setups may need to
  whitelist `https://cdn.jsdelivr.net/npm/@govtechsg/sgds-web-component@3/components/Masthead/index.umd.js`.

---

### Pagination

**Import**: `import { Pagination } from "@lifesg/react-design-system/pagination"`

**Category**: Navigation

**Decision rule**
> Use `Pagination` when users must navigate across numbered result pages;
> use infinite-scroll patterns only when explicit page position and jump
> controls are not required.

**When to use**
- List or table views split across pages where users need predictable
  next/previous navigation and current-page visibility.
- Data-heavy screens where changing page size improves scanning and task speed.

**When NOT to use**
| Situation                                         | Use instead  |
| ------------------------------------------------- | ------------ |
| Hierarchical navigation path (Home > Section > …) | `Breadcrumb` |

**Key props**
| Prop                | Type                                       | Required | Notes                                           |
| ------------------- | ------------------------------------------ | -------- | ----------------------------------------------- |
| activePage          | `number`                                   | yes      | Current page number.                            |
| totalItems          | `number`                                   | yes      | Total result count used to compute page ranges. |
| pageSize            | `number`                                   | no       | Items per page; defaults to `10`.               |
| showFirstAndLastNav | `boolean`                                  | no       | Shows jump-to-first and jump-to-last controls.  |
| showPageSizeChanger | `boolean`                                  | no       | Shows desktop page-size dropdown.               |
| pageSizeOptions     | `PageSizeItemProps<T>[]`                   | no       | Custom page-size options (`value`, `label`).    |
| onPageChange        | `(page: number) => void`                   | no       | Fired when a new page is selected.              |
| onPageSizeChange    | `(page: number, pageSize: number) => void` | no       | Fired when page size changes.                   |
| data-testid         | `string`                                   | no       | Test selector on the component root.            |

**Canonical usage**
```tsx
// Paginated result navigation with page-size changer
import { Pagination } from "@lifesg/react-design-system/pagination";

<Pagination
  activePage={currentPage}
  totalItems={totalItems}
  pageSize={20}
  showFirstAndLastNav
  showPageSizeChanger
  pageSizeOptions={[
    { value: 10, label: "10 / page" },
    { value: 20, label: "20 / page" },
    { value: 50, label: "50 / page" },
  ]}
  onPageChange={(page) => setCurrentPage(page)}
  onPageSizeChange={(page, size) => handlePageSizeChange(page, size)}
/>
```

**Figma mapping hints**
| Figma element / layer pattern          | Map to       | Condition                                                            |
| -------------------------------------- | ------------ | -------------------------------------------------------------------- |
| Pagination controls below a list/table | `Pagination` | Numbered page navigation with previous/next movement                 |
| Pagination with page-size dropdown     | `Pagination` | `showPageSizeChanger` and optional custom `pageSizeOptions` required |

**Known limitations**
- Page-size changer is desktop-only per component behaviour.

---

### Sidenav

**Import**: `import { Sidenav } from "@lifesg/react-design-system/sidenav"`

**Category**: Navigation

**Decision rule**
> Use `Sidenav` when navigation is presented as a persistent left rail with
> optional nested subitems; use `Navbar` when top horizontal navigation is
> required.

**When to use**
- Section-level navigation on desktop layouts with many related pages.
- Information architectures that need grouped items and expandable subitems.

**When NOT to use**
| Situation                                    | Use instead  |
| -------------------------------------------- | ------------ |
| Top-of-page primary site navigation          | `Navbar`     |
| Breadcrumb path context for current location | `Breadcrumb` |

**Key props**
| Prop        | Type              | Required | Notes                                              |
| ----------- | ----------------- | -------- | -------------------------------------------------- |
| children    | `React.ReactNode` | yes      | One or more `Sidenav.Group` sections.              |
| fixed       | `boolean`         | no       | Fixes the sidenav to the left; defaults to `true`. |
| aria-label  | `string`          | no       | Accessibility label; defaults to `"Sidebar"`.      |
| className   | `string`          | no       | Custom class selector on root container.           |
| data-testid | `string`          | no       | Test selector on component root.                   |
| id          | `string`          | no       | Unique identifier for the root element.            |

**Canonical usage**
```tsx
// Left-rail navigation with grouped items and nested drawer subitems
import { Sidenav } from "@lifesg/react-design-system/sidenav";

<Sidenav>
  <Sidenav.Group label="Application">
    <Sidenav.Item selected>Overview</Sidenav.Item>
    <Sidenav.Item>
      Services
      <Sidenav.DrawerItem>
        <Sidenav.DrawerSubitem>Housing</Sidenav.DrawerSubitem>
        <Sidenav.DrawerSubitem>Health</Sidenav.DrawerSubitem>
      </Sidenav.DrawerItem>
    </Sidenav.Item>
  </Sidenav.Group>
</Sidenav>
```

**Figma mapping hints**
| Figma element / layer pattern                    | Map to    | Condition                                          |
| ------------------------------------------------ | --------- | -------------------------------------------------- |
| Side navigation rail with nested flyout subitems | `Sidenav` | Left-side grouped nav with optional drawer subnav. |

**Composition patterns**
- Use with `Layout.Container` page shells where the content area sits beside
  the fixed left navigation rail.
