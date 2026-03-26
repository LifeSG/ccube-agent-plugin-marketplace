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

### Animations

**Import**:
`import { LoadingDots, LoadingDotsSpinner, LoadingSpinner, ThemedLoadingSpinner } from "@lifesg/react-design-system/animations"`

**Category**: Feedback indicators

**Decision rule**
> Use `animations` exports when the interface needs a visual loading state
> without introducing a step model; use `ProgressIndicator` when users need
> explicit multi-step progress.

**When to use**
- Inline loading placeholders while asynchronous content is being fetched.
- Branded or themed spinner states where the loading indicator must match the
  active FDS theme.

**When NOT to use**
| Situation                                  | Use instead         |
| ------------------------------------------ | ------------------- |
| User needs to track current step in a flow | `ProgressIndicator` |
| Toast-like success/error message state     | `Toast`             |

**Key props**
| Prop        | Type     | Required | Notes                                                     |
| ----------- | -------- | -------- | --------------------------------------------------------- |
| id          | `string` | no       | Optional element id for animation root.                   |
| className   | `string` | no       | CSS hook for custom spacing or layout integration.        |
| data-testid | `string` | no       | Test selector on animation element.                       |
| color       | `string` | no       | Only for `LoadingDotsSpinner`; customises spinner colour. |

**Canonical usage**
```tsx
// Themed loading spinner in a pending state section
import { ThemedLoadingSpinner } from "@lifesg/react-design-system/animations";

<ThemedLoadingSpinner data-testid="loading-state" />
```

**Figma mapping hints**
| Figma element / layer pattern       | Map to                 | Condition                                                  |
| ----------------------------------- | ---------------------- | ---------------------------------------------------------- |
| Inline loading dots / spinner state | `LoadingDotsSpinner`   | Use when a compact in-context loading indicator is needed. |
| Branded circular loading indicator  | `ThemedLoadingSpinner` | Use theme-aware spinner for full-section loading states.   |

**Known limitations**
- API surface is intentionally minimal (`BaseAnimationProps`); size and
  advanced motion customisation should be handled via container CSS.

---

### Animations.Customisable

**Import**:
`import { LoadingDotsSpinner, ThemedLoadingSpinner } from "@lifesg/react-design-system/animations"`

**Category**: Feedback indicators

**Decision rule**
> Use `LoadingDotsSpinner` or `ThemedLoadingSpinner` when you need spinner
> visuals with explicit component-level customisation or branding.

**When to use**
- Inline loading states that need explicit spinner component selection.
- Theme-aware section/page loading indicators where brand styling matters.

**When NOT to use**
| Situation                                    | Use instead         |
| -------------------------------------------- | ------------------- |
| Loading state needs textual status messaging | `Alert` or `Toast`  |
| User needs explicit step-by-step progression | `ProgressIndicator` |

**Key props**
| Prop        | Type     | Required | Notes                                                       |
| ----------- | -------- | -------- | ----------------------------------------------------------- |
| id          | `string` | no       | Optional element id on spinner root.                        |
| className   | `string` | no       | Styling hook for placement/size wrappers.                   |
| data-testid | `string` | no       | Test selector on spinner root.                              |
| color       | `string` | no       | Available on `LoadingDotsSpinner`; overrides spinner color. |

**Canonical usage**
```tsx
// Inline custom-colour spinner
import {
  LoadingDotsSpinner,
  ThemedLoadingSpinner,
} from "@lifesg/react-design-system/animations";

<LoadingDotsSpinner color="#1c76d5" data-testid="inline-loading" />

// Theme-aware section loading
<ThemedLoadingSpinner data-testid="section-loading" />
```

**Figma mapping hints**
| Figma element / layer pattern                   | Map to                 | Condition                                     |
| ----------------------------------------------- | ---------------------- | --------------------------------------------- |
| Inline loading spinner with custom brand colour | `LoadingDotsSpinner`   | Spinner appears inside cards/forms/list rows. |
| Theme-aware section loading spinner             | `ThemedLoadingSpinner` | Loading state must follow active DS theme.    |

**Known limitations**
- Only `LoadingDotsSpinner` accepts `color`; `ThemedLoadingSpinner` uses theme
  colours.

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

### CountdownTimer

**Import**:
`import { CountdownTimer } from "@lifesg/react-design-system/countdown-timer"`

**Category**: Feedback indicators

**Decision rule**
> Use `CountdownTimer` when the UI must display a live countdown with optional
> sticky positioning and threshold notifications.

**When to use**
- Session expiry, OTP validity, or task window countdowns where users need
  active remaining-time visibility.
- Sticky timers that should stay visible after scrolling past their original
  position.

**When NOT to use**
| Situation                                   | Use instead         |
| ------------------------------------------- | ------------------- |
| Multi-step process progress                 | `ProgressIndicator` |
| Static deadline text with no live countdown | `Typography`        |

**Key props**
| Prop             | Type                                              | Required | Notes                                                          |
| ---------------- | ------------------------------------------------- | -------- | -------------------------------------------------------------- |
| show             | `boolean`                                         | yes      | Starts/shows the countdown timer.                              |
| timer            | `number`                                          | yes*     | Countdown duration in seconds. Required if `timestamp` absent. |
| timestamp        | `number`                                          | yes*     | End timestamp (ms since epoch). Takes precedence over `timer`. |
| fixed            | `boolean`                                         | no       | Enables sticky behavior when timer scrolls out of view.        |
| align            | `"left" \| "right"`                               | no       | Sticky alignment. Defaults to `"right"`.                       |
| offset           | `{ top?: number; left?: number; right?: number }` | no       | Desktop/tablet sticky offset.                                  |
| mobileOffset     | `{ top?: number }`                                | no       | Mobile sticky top offset.                                      |
| notifyTimer      | `number`                                          | no       | Threshold (seconds) that triggers notify/tick callbacks.       |
| reminderInterval | `number`                                          | no       | Screen-reader reminder interval in seconds.                    |
| onTick           | `(seconds: number) => void`                       | no       | Called during threshold window as time counts down.            |

**Type-specific requirements**
| Type value  | Extra requirement | Notes                                      |
| ----------- | ----------------- | ------------------------------------------ |
| `timer`     | `timer`           | Required when `timestamp` is not provided. |
| `timestamp` | `timestamp`       | Required when `timer` is not provided.     |

**Canonical usage**
```tsx
// Countdown with threshold notifications
import { CountdownTimer } from "@lifesg/react-design-system/countdown-timer";

<CountdownTimer
  show={true}
  timer={300}
  notifyTimer={60}
  onNotify={handleNotify}
  onFinish={handleFinish}
/>
```

**Figma mapping hints**
| Figma element / layer pattern             | Map to           | Condition                                               |
| ----------------------------------------- | ---------------- | ------------------------------------------------------- |
| Session timeout countdown strip           | `CountdownTimer` | Use sticky mode when timer must stay visible on scroll. |
| Live countdown for expiring action/window | `CountdownTimer` | Drive value via `timer` or `timestamp`.                 |

**Known limitations**
- Storybook notes that scroll detection may appear less accurate in the docs
  environment than in real app pages.

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
| Situation                                  | Use instead |
| ------------------------------------------ | ----------- |
| Temporary message that should auto-dismiss | `Toast`     |
| Inline message embedded in page flow       | `Alert`     |

**Key props**
| Prop               | Type                                            | Required | Notes                                                |
| ------------------ | ----------------------------------------------- | -------- | ---------------------------------------------------- |
| children           | `string \| JSX.Element \| JSX.Element[]`        | yes      | Banner content, including styled text and links.     |
| sticky             | `boolean`                                       | no       | Keeps banner fixed at top during scroll.             |
| dismissible        | `boolean`                                       | no       | Enables close control for user dismissal.            |
| icon               | `JSX.Element`                                   | no       | Renders a custom icon in the banner.                 |
| actionButton       | `React.ButtonHTMLAttributes<HTMLButtonElement>` | no       | Adds action button below long or actionable content. |
| maxCollapsedHeight | `number`                                        | no       | Collapses long content and shows expand affordance.  |
| visible            | `boolean`                                       | no       | Controls whether the banner is rendered.             |

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
| Figma element / layer pattern          | Map to               | Condition                                  |
| -------------------------------------- | -------------------- | ------------------------------------------ |
| Sticky top-of-page announcement banner | `NotificationBanner` | Persistent page-level notice above content |

**Composition patterns**
- Use `NotificationBanner.Link` for external links that require link icon
  affordance.

---

### Pill

**Import**: `import { Pill } from "@lifesg/react-design-system/pill"`

**Category**: Feedback indicators

**Decision rule**
> Use `Pill` for static, compact status/category chips; use `Tag` when you
> need interactive/tappable chip behavior.

**When to use**
- Read-only status labels in timelines, cards, and list metadata.
- Category markers where a compact, non-interactive visual token is needed.

**When NOT to use**
| Situation                             | Use instead                                  |
| ------------------------------------- | -------------------------------------------- |
| Chip must be interactive or clickable | `Tag` from `@lifesg/react-design-system/tag` |

**Key props**
| Prop      | Type                                                                       | Required | Notes                                                        |
| --------- | -------------------------------------------------------------------------- | -------- | ------------------------------------------------------------ |
| type      | `"solid" \| "outline"`                                                     | yes      | Display format for pill style.                               |
| colorType | `"black" \| "grey" \| "green" \| "yellow" \| "red" \| "blue" \| "primary"` | no       | Color variant; defaults to `"black"`.                        |
| icon      | `JSX.Element`                                                              | no       | Optional icon shown with the text content.                   |
| id        | `string`                                                                   | no       | Unique identifier on the root element (from div attributes). |
| className | `string`                                                                   | no       | Custom class selector for styling hooks.                     |

**Canonical usage**
```tsx
// Static status pill for metadata display
import { Pill } from "@lifesg/react-design-system/pill";

<Pill type="outline" colorType="green">Approved</Pill>
```

**Figma mapping hints**
| Figma element / layer pattern    | Map to | Condition                                |
| -------------------------------- | ------ | ---------------------------------------- |
| Static status/category pill chip | `Pill` | Non-interactive compact chip with label. |

**Known limitations**
- `Pill` is static by design and does not provide interactive/tappable
  behavior.

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

### SmartAppBanner

**Import**:
`import { SmartAppBanner } from "@lifesg/react-design-system/smart-app-banner"`

**Category**: Feedback indicators

**Decision rule**
> Use `SmartAppBanner` for sticky app-promo style banners that summarise a
> destination and redirect users via a primary CTA and banner click.

**When to use**
- App promotion strips with title, short message, star rating, and download CTA.
- Persistent top-of-page promotional notices that can be dismissed.

**When NOT to use**
| Situation                                          | Use instead          |
| -------------------------------------------------- | -------------------- |
| Generic system status notice with no app-promo CTA | `NotificationBanner` |
| Temporary success/error message                    | `Toast`              |

**Key props**
| Prop      | Type                         | Required | Notes                                                               |
| --------- | ---------------------------- | -------- | ------------------------------------------------------------------- |
| show      | `boolean`                    | yes      | Controls whether the banner is shown.                               |
| href      | `string`                     | yes      | Destination URL opened by default when non-dismiss area is clicked. |
| content   | `SmartAppBannerContentProps` | yes      | Content object containing title/message/button/stars metadata.      |
| onDismiss | `() => void`                 | yes      | Called when dismiss action is triggered.                            |
| onClick   | `() => void`                 | no       | Optional override/additional behavior for non-dismiss clicks.       |
| icon      | `string`                     | no       | Icon URL. Defaults to LifeSG app icon URL.                          |
| animated  | `boolean`                    | no       | Enables slide-down appearance animation. Defaults to `false`.       |
| offset    | `number`                     | no       | Top offset in pixels for sticky placement. Defaults to `0`.         |

**Type-specific requirements**
| Type value | Extra requirement                                          | Notes                    |
| ---------- | ---------------------------------------------------------- | ------------------------ |
| `content`  | `title`, `buttonLabel`, `buttonAriaLabel`, `numberOfStars` | Required content fields. |

**Canonical usage**
```tsx
// Sticky app promo banner with dismiss and destination link
import { SmartAppBanner } from "@lifesg/react-design-system/smart-app-banner";

<SmartAppBanner
  show={showBanner}
  href="https://go.gov.sg/lifesg-app"
  content={{
    title: "LifeSG App",
    message: "Report neighbourhood issues in 3 simple steps",
    numberOfStars: 4.8,
    buttonLabel: "Download",
    buttonAriaLabel: "Download LifeSG app",
  }}
  onDismiss={() => setShowBanner(false)}
/>
```

**Figma mapping hints**
| Figma element / layer pattern                     | Map to           | Condition                                        |
| ------------------------------------------------- | ---------------- | ------------------------------------------------ |
| Sticky app download banner with title/message/CTA | `SmartAppBanner` | Use for app-promo strip with destination URL.    |
| App promo banner with star rating display         | `SmartAppBanner` | Set `content.numberOfStars` (supports decimals). |

**Known limitations**
- `content.numberOfStars` hides stars when passed `NaN` or negative values.
- Default behavior opens the destination in a new tab for non-dismiss click
  areas.

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

### Timeline

**Import**: `import { Timeline } from "@lifesg/react-design-system/timeline"`

**Category**: Feedback indicators

**Decision rule**
> Use `Timeline` when the UI must show ordered process steps with per-step
> status indicators; use `ProgressIndicator` for compact horizontal wizard
> progress.

**When to use**
- Process journeys where each step has rich content (links, actions, tags).
- Vertical step-by-step tracking with completed/current/upcoming states.

**When NOT to use**
| Situation                                   | Use instead         |
| ------------------------------------------- | ------------------- |
| Compact horizontal multi-step wizard header | `ProgressIndicator` |

**Key props**
| Prop          | Type                  | Required | Notes                                                             |
| ------------- | --------------------- | -------- | ----------------------------------------------------------------- |
| items         | `TimelineItemProps[]` | yes      | Timeline entries with `title`, `content`, and optional `variant`. |
| title         | `string`              | no       | Header text shown above the timeline list.                        |
| counterOffset | `number`              | no       | Numeric-mode start offset; default is `0` (starts from 1).        |
| className     | `string`              | no       | Custom class selector on timeline container.                      |
| startCol      | `number`              | no       | Grid start column when used in a CSS grid layout.                 |
| colSpan       | `number`              | no       | Grid column span when used in a CSS grid layout.                  |
| data-testid   | `string`              | no       | Test selector on component root.                                  |

**Type-specific requirements**
| Type value  | Extra requirement | Notes                                                              |
| ----------- | ----------------- | ------------------------------------------------------------------ |
| `"numeric"` | `counterOffset`   | Optional when timeline numbering should continue from prior steps. |

**Canonical usage**
```tsx
// Vertical process timeline with mixed item variants
import { Timeline } from "@lifesg/react-design-system/timeline";

<Timeline
  title="What happens next"
  items={[
    {
      title: "Submit application",
      content: <>We received your documents.</>,
      variant: "completed",
    },
    {
      title: "Review in progress",
      content: <>We will notify you when review is complete.</>,
      variant: "current",
    },
    {
      title: "Collection",
      content: <>Collect at your selected service centre.</>,
      variant: "upcoming-active",
    },
  ]}
/>
```

**Figma mapping hints**
| Figma element / layer pattern              | Map to     | Condition                                          |
| ------------------------------------------ | ---------- | -------------------------------------------------- |
| Process timeline / chronological step list | `Timeline` | Vertical list with per-step state and rich content |

**Composition patterns**
- Use `Pill` values inside `TimelineItemProps.statuses` to show compact status
  tags on each step.

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
