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
