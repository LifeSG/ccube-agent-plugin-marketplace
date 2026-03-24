> **Feedback indicators** group — Alert, Animations, Badge, Pill, Tag,
> Timeline, Toast, NotificationBanner, ProgressIndicator, and related
> components.
> For other groups see the other `resources/component-catalogue-*.md` files.
> For modals, drawers, and overlays see
> `resources/component-catalogue-overlays.md`.
> For the cross-cutting Figma → FDS Quick Lookup table, see
> `resources/component-catalogue.md`.

---

## Feedback indicators

> Components that communicate status, progress, or system messages to the
> user. Scan this group when the Figma frame shows coloured banners, toasts,
> badges, pills, tags, timelines, or any non-modal notification UI.

### Alert

**Import**: `import { Alert } from "@lifesg/react-design-system/alert"`

**Category**: Feedback indicators

**Decision rule**
> Use `Alert` when the Figma frame shows an inline coloured banner conveying
> status (success, error, warning, info, or description) — use
> `NotificationBanner` for full-width page-level banners or `Toast` for
> transient dismissable pop-ups.

**When to use**
- Inline form validation summaries (error type) shown above or below a form.
- Status messages after an action (success or warning) that remain visible on
  the page.
- Informational callout boxes (description type) that provide contextual
  guidance.

**When NOT to use**
| Situation                              | Use instead                                                                 |
| -------------------------------------- | --------------------------------------------------------------------------- |
| Transient message that auto-dismisses  | `Toast` from `@lifesg/react-design-system/toast`                            |
| Full-width page-level notification bar | `NotificationBanner` from `@lifesg/react-design-system/notification-banner` |

**Key props**
| Prop               | Type                                                                   | Required | Notes                                                                                                         |
| ------------------ | ---------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------- |
| type               | `"success"` \| `"warning"` \| `"error"` \| `"info"` \| `"description"` | yes      | Determines the colour scheme, default icon, and semantic role. `"description"` = neutral grey callout.        |
| showIcon           | `boolean`                                                              | no       | Whether to render the status icon. Defaults to `true`.                                                        |
| customIcon         | `JSX.Element`                                                          | no       | Replaces the default status icon with a custom element.                                                       |
| sizeType           | `"default"` \| `"small"`                                               | no       | Visual size variant. `"small"` reduces padding and font size. Defaults to `"default"`.                        |
| actionLink         | `AnchorHTMLAttributes<HTMLAnchorElement>`                              | no       | Renders a hyperlink inside the alert (e.g. "Learn more" or "View details").                                   |
| actionLinkIcon     | `JSX.Element`                                                          | no       | Icon rendered alongside `actionLink`.                                                                         |
| maxCollapsedHeight | `number`                                                               | no       | Content height (px) at which the alert collapses with a "Show more" toggle. Useful for verbose error details. |
| data-testid        | `string`                                                               | no       | Test selector on the alert element.                                                                           |

**Canonical usage**
```tsx
import { Alert } from "@lifesg/react-design-system/alert";

{/* Success confirmation */}
<Alert type="success" data-testid="submission-success">
  Your application has been submitted successfully.
</Alert>

{/* Error summary with action link */}
<Alert
  type="error"
  actionLink={{ href: "#errors", children: "View all errors" }}
>
  There are 3 errors in your form. Please review and correct them.
</Alert>

{/* Informational callout (neutral) */}
<Alert type="description" showIcon={false}>
  This information is used to verify your identity.
</Alert>

{/* Small warning inline */}
<Alert type="warning" sizeType="small">
  This action cannot be undone.
</Alert>
```

**Figma mapping hints**
| Figma element / layer pattern                | Map to  | Condition                                                    |
| -------------------------------------------- | ------- | ------------------------------------------------------------ |
| Alert banner (success, error, warning, info) | `Alert` | Inline coloured banner with icon and message text            |
| Description / informational callout box      | `Alert` | Set `type="description"` for neutral grey callout            |
| Alert with a "Learn more" or action link     | `Alert` | Pass `actionLink` prop with `href` and `children`            |
| Collapsed alert with "Show more" toggle      | `Alert` | Set `maxCollapsedHeight` to desired collapse threshold in px |
| Small compact alert row                      | `Alert` | Set `sizeType="small"`                                       |

---

### Badge

**Import**: `import { Badge } from "@lifesg/react-design-system/badge"`

**Category**: Feedback indicators

**Decision rule**
> Use `Badge` for compact notification indicators (dot or count), especially
> when anchored to another UI element; use `Tag` when status text labels are
> required.

**When to use**
- Unread count indicators on icons, avatars, or menu triggers.
- Minimal status signalling with dot-style badges where text is unnecessary.

**When NOT to use**
| Situation                               | Use instead |
| --------------------------------------- | ----------- |
| Status requires visible text label/chip | `Tag`       |

**Key props**
| Prop        | Type                                                                                | Required | Notes                                                                               |
| ----------- | ----------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| variant     | `"number" \| "number-with-border" \| "dot" \| "dot-with-border" \| "square-number"` | no       | Visual badge style; defaults to `"number"`.                                         |
| count       | `number`                                                                            | no       | Numeric value for number-based variants; values >= 1000 are truncated (e.g. `1K+`). |
| color       | `"default" \| "important"`                                                          | no       | Colour tone for emphasis.                                                           |
| children    | `JSX.Element`                                                                       | no       | Anchor target when badge is overlaid at corner position.                            |
| badgeOffset | `[string, string]`                                                                  | no       | Top-right offset tuple `[left, top]` using CSS lengths.                             |
| data-testid | `string`                                                                            | no       | Test identifier; defaults to `"badge"`.                                             |

**Canonical usage**
```tsx
// Anchored notification count badge on an icon button
import { Badge } from "@lifesg/react-design-system/badge";

<Badge
  variant="number-with-border"
  color="important"
  count={12}
  badgeOffset={["-4px", "2px"]}
>
  <button type="button">Inbox</button>
</Badge>
```

**Figma mapping hints**
| Figma element / layer pattern           | Map to  | Condition                                                         |
| --------------------------------------- | ------- | ----------------------------------------------------------------- |
| Notification count badge on icon/avatar | `Badge` | Use number variants and optional `badgeOffset` when anchored      |
| Notification dot indicator              | `Badge` | Use `variant="dot"` or `"dot-with-border"` for non-numeric alerts |

**Known limitations**
- Intended for short counts/indicators only; long textual statuses should use
  `Tag`.

---

### NotificationBanner

**Import**:
`import { NotificationBanner } from "@lifesg/react-design-system/notification-banner"`

**Category**: Feedback indicators

**Decision rule**
> Use `NotificationBanner` for persistent page-level notices at the top of the
> viewport; use `Toast` for transient overlays and `Alert` for inline messages.

**When to use**
- Service-wide announcements that must stay visible across page scroll.
- Important notices requiring optional dismissal or CTA actions.

**When NOT to use**
| Situation                                   | Use instead |
| ------------------------------------------- | ----------- |
| Temporary message that should auto-dismiss  | `Toast`     |
| Inline message embedded in page flow        | `Alert`     |

**Key props**
| Prop               | Type                                           | Required | Notes                                               |
| ------------------ | ---------------------------------------------- | -------- | --------------------------------------------------- |
| children           | `string \| JSX.Element \| JSX.Element[]`      | yes      | Banner content, including styled text and links.    |
| sticky             | `boolean`                                      | no       | Keeps banner fixed at top during scroll.            |
| dismissible        | `boolean`                                      | no       | Enables close control for user dismissal.           |
| icon               | `JSX.Element`                                  | no       | Renders a custom icon in the banner.                |
| actionButton       | `React.ButtonHTMLAttributes<HTMLButtonElement>` | no       | Adds action button below long or actionable content. |
| maxCollapsedHeight | `number`                                       | no       | Collapses long content and shows expand affordance. |
| visible            | `boolean`                                      | no       | Controls whether the banner is rendered.            |

**Canonical usage**
```tsx
// Sticky, dismissible page-level notice with CTA
import { NotificationBanner } from "@lifesg/react-design-system/notification-banner";

<NotificationBanner
  sticky
  dismissible
  actionButton={{ children: "View details" }}
>
  Service maintenance is scheduled tonight from 11:00 PM to 1:00 AM.
</NotificationBanner>
```

**Figma mapping hints**
| Figma element / layer pattern               | Map to               | Condition                                 |
| ------------------------------------------- | -------------------- | ----------------------------------------- |
| Sticky top-of-page announcement banner      | `NotificationBanner` | Persistent page-level notice above content |

**Composition patterns**
- Use `NotificationBanner.Link` for external links that require link icon
  affordance.

---

### ProgressIndicator

**Import**: `import { ProgressIndicator } from "@lifesg/react-design-system/progress-indicator"`

**Category**: Feedback indicators

**Decision rule**
> Use `ProgressIndicator` when the Figma frame shows a horizontal multi-step
> process indicator with labelled steps — use `Timeline` for vertical
> chronological event sequences or history logs.

**When to use**
- Multi-step form wizards or application flows where the user needs to see
  their current position and total step count at a glance.
- Onboarding flows or checkout processes with a fixed number of sequential,
  named steps.

**When NOT to use**
| Situation                                                     | Use instead                                                |
| ------------------------------------------------------------- | ---------------------------------------------------------- |
| Vertical list of past or future events in chronological order | `Timeline` from `@lifesg/react-design-system/timeline`     |
| Animated loading / spinner state with no discrete steps       | `Animations` from `@lifesg/react-design-system/animations` |

**Key props**
| Prop             | Type                  | Required | Notes                                                                                                  |
| ---------------- | --------------------- | -------- | ------------------------------------------------------------------------------------------------------ |
| steps            | `T[]`                 | yes      | Array of step items; may be plain strings or objects.                                                  |
| currentIndex     | `number`              | yes      | 0-based index of the currently active step.                                                            |
| displayExtractor | `(item: T) => string` | no       | Derives the display label from each step item; required when `steps` holds objects instead of strings. |
| id               | `string`              | no       | Unique DOM id for the component.                                                                       |
| data-testid      | `string`              | no       | Test selector.                                                                                         |

**Canonical usage**
```tsx
// String steps — displayExtractor not needed
import { ProgressIndicator } from "@lifesg/react-design-system/progress-indicator";

const steps = ["Application", "Review", "Decision", "Completion"];

<ProgressIndicator steps={steps} currentIndex={1} />

// Object steps — provide displayExtractor
const objectSteps = [
  { id: 1, label: "Application" },
  { id: 2, label: "Review" },
  { id: 3, label: "Decision" },
];

<ProgressIndicator
  steps={objectSteps}
  currentIndex={0}
  displayExtractor={(item) => item.label}
/>
```

**Figma mapping hints**
| Figma element / layer pattern                | Map to              | Condition                                                                      |
| -------------------------------------------- | ------------------- | ------------------------------------------------------------------------------ |
| Multi-step wizard form progress              | `ProgressIndicator` | Horizontal numbered step chain; set `currentIndex` to the 0-based active step  |
| Step indicator / progress steps (horizontal) | `ProgressIndicator` | Any horizontal labelled step nav showing current position in a multi-step flow |

**Known limitations**
- The deprecated `fadeColor` and `fadePosition` props have no visual effect
  and will be removed in v3.0.0; do not use them.

---

### Tag

**Import**: `import { Tag } from "@lifesg/react-design-system/tag"`

**Category**: Feedback indicators

**Decision rule**
> Use `Tag` when the Figma frame shows a small coloured chip communicating a
> category, status, or selection label — use `Badge` for numeric count
> indicators or `Pill` for dismissable filter chips.

**When to use**
- Category or classification labels on list items, cards, or tables (e.g.,
  "Draft", "Approved", "Pending").
- Colour-coded status indicators where text must accompany the colour cue.
- Interactive filter chips that users can tap to trigger an action, especially
  when a larger touch target on mobile is needed.

**When NOT to use**
| Situation                                             | Use instead                                      |
| ----------------------------------------------------- | ------------------------------------------------ |
| Numeric count / unread indicator next to an icon      | `Badge` from `@lifesg/react-design-system/badge` |
| Removable filter pill with a dismiss/close button     | `Pill` from `@lifesg/react-design-system/pill`   |
| Persistent inline status banner with descriptive text | `Alert` from `@lifesg/react-design-system/alert` |

**Key props**
| Prop         | Type                                                                                   | Required | Notes                                                                                 |
| ------------ | -------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------- |
| type         | `"solid"` \| `"outline"`                                                               | yes      | Display format. `"solid"` = filled background; `"outline"` = border-only.             |
| colorType    | `"black"` \| `"grey"` \| `"green"` \| `"yellow"` \| `"red"` \| `"blue"` \| `"primary"` | no       | Colour scheme. Defaults to `"black"`.                                                 |
| interactive  | `boolean`                                                                              | no       | Makes the tag tappable; touch target increases on tablet/mobile. Defaults to `false`. |
| icon         | `JSX.Element`                                                                          | no       | Icon element rendered alongside the label text.                                       |
| iconPosition | `"left"` \| `"right"`                                                                  | no       | Position of the icon relative to the label. Defaults to `"left"`.                     |

**Canonical usage**
```tsx
// Solid status tag
import { Tag } from "@lifesg/react-design-system/tag";

<Tag type="solid" colorType="green">Active</Tag>

// Outline category tag
<Tag type="outline" colorType="blue">Pending review</Tag>

// Interactive tag with left icon
<Tag type="solid" colorType="primary" interactive icon={<FilterIcon />}>
  Filter
</Tag>
```

**Figma mapping hints**
| Figma element / layer pattern              | Map to | Condition                                                             |
| ------------------------------------------ | ------ | --------------------------------------------------------------------- |
| Coloured label chip / category tag         | `Tag`  | Static text label with colour; use `type="outline"` or `type="solid"` |
| Interactive filter chip (tappable)         | `Tag`  | Set `interactive={true}`; larger touch target on mobile               |
| Status chip with icon                      | `Tag`  | Pass `icon` JSX element; use `iconPosition` for placement             |
| Status indicator tag (text-only, coloured) | `Tag`  | Use `colorType` to match the status colour                            |

---

### Toast

**Import**: `import { Toast } from "@lifesg/react-design-system/toast"`

**Category**: Feedback indicators

**Decision rule**
> Use `Toast` for transient, dismissable pop-up notifications about system
> status changes — use `Alert` for persistent inline messages that remain
> visible on the page.

**When to use**
- Confirming a background action (save, update, delete) with a brief status
  message that can auto-dismiss.
- Surfacing non-critical warnings or info updates that do not block the user.
- Showing a dismissable error that the user can acknowledge and continue
  working.

**When NOT to use**
| Situation                                           | Use instead                                                                 |
| --------------------------------------------------- | --------------------------------------------------------------------------- |
| Persistent inline validation or status message      | `Alert` from `@lifesg/react-design-system/alert`                            |
| Full-width page-level notification bar              | `NotificationBanner` from `@lifesg/react-design-system/notification-banner` |
| Action requires user confirmation before proceeding | `ModalV2` from `@lifesg/react-design-system/modal-v2`                       |

**Key props**
| Prop            | Type                                                | Required | Notes                                                                                       |
| --------------- | --------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| type            | `"success"` \| `"warning"` \| `"error"` \| `"info"` | yes      | Controls colour scheme and status icon.                                                     |
| label           | `string` \| `JSX.Element`                           | yes      | Main content. When `title` is also set, renders as a description sub-label below it.        |
| title           | `string` \| `JSX.Element`                           | no       | Optional heading rendered above `label`.                                                    |
| autoDismiss     | `boolean`                                           | no       | Automatically dismisses after `autoDismissTime` ms. Defaults to `false`.                    |
| autoDismissTime | `number`                                            | no       | Milliseconds until auto-dismissal. Requires `autoDismiss={true}`. Defaults to `4000` (4 s). |
| fixed           | `boolean`                                           | no       | Keeps the Toast fixed at the top of the page on scroll. Defaults to `true`.                 |
| actionButton    | `{ label: string; onClick: () => void }`            | no       | Renders a call-to-action button inside the Toast.                                           |

**Canonical usage**
```tsx
// Success toast with auto-dismiss
import { Toast } from "@lifesg/react-design-system/toast";

<Toast
  type="success"
  label="Your bookings have been updated."
  autoDismiss
/>

// Warning toast with title, custom dismiss time, and action button
<Toast
  type="warning"
  title="Unknown characters"
  label="The template contains characters that cannot be updated. Please remove them and try again."
  autoDismiss
  autoDismissTime={8000}
  actionButton={{ label: "Review", onClick: handleReview }}
  onDismiss={handleClose}
/>

// Error toast — persists until manually dismissed
<Toast
  type="error"
  title="System error"
  label="An internal system error has occurred. Please log out and try again."
  onDismiss={handleClose}
/>
```

**Figma mapping hints**
| Figma element / layer pattern                                 | Map to  | Condition                                                           |
| ------------------------------------------------------------- | ------- | ------------------------------------------------------------------- |
| Toast / snackbar notification (success, warning, error, info) | `Toast` | Floating overlay-style status message, not inline in page flow      |
| Status pop-up with title and description text                 | `Toast` | Set both `title` and `label` props                                  |
| Auto-dismissing notification pop-up                           | `Toast` | Set `autoDismiss={true}` and optional `autoDismissTime`             |
| Toast with "Undo" or CTA button                               | `Toast` | Pass `actionButton` with `label` and `onClick`                      |
| Sticky top-of-page notification that persists on scroll       | `Toast` | `fixed` defaults to `true`; set `fixed={false}` to scroll with page |
