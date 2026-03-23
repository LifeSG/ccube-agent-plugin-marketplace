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
