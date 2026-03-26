> **Selection and input** group — Buttons, checkboxes, radio buttons, toggles,
> file controls, calendar/date pickers, and scheduling components.
> For other groups see the other `resources/component-catalogue-*.md` files.
> For the cross-cutting Figma → FDS Quick Lookup table, see
> `resources/component-catalogue.md`.

---

## Selection and input

> User interaction controls that trigger actions or collect selections. Scan
> this group when the Figma frame contains buttons, checkboxes, radio buttons,
> grids.
### Button

**Import**: `import { Button } from "@lifesg/react-design-system/button"`

**Category**: Selection and input

**Decision rule**
> Use `Button` when the Figma frame shows a button with **text only and no
> icon** — if the button has an icon alongside text use `ButtonWithIcon`; if
> it shows an icon with no visible text label use `IconButton`.

**When to use**
- Any CTA, form submit, or action trigger that shows only a text label.
- Destructive actions (delete, remove) — add `danger={true}`.
- Async operations that need a loading indicator — add `loading={true}`.

**When NOT to use**
| Situation                                        | Use instead                                                          |
| ------------------------------------------------ | -------------------------------------------------------------------- |
| Button has an icon alongside the text label      | `ButtonWithIcon` from `@lifesg/react-design-system/button-with-icon` |
| Button shows only an icon, no visible text label | `IconButton` from `@lifesg/react-design-system/icon-button`          |
| In-line navigation link styled as a button       | `Button.Default` with `styleType="link"`                             |

**Key props**
| Prop                  | Type                                                  | Required | Notes                                                                                                                           |
| --------------------- | ----------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| styleType             | `"default"` \| `"secondary"` \| `"light"` \| `"link"` | no       | Visual style. `"default"` = filled primary. `"secondary"` = outlined. `"light"` = ghost/tonal. `"link"` = no border/background. |
| danger                | `boolean`                                             | no       | Applies red colour scheme — use for destructive actions. Works with all `styleType` values.                                     |
| loading               | `boolean`                                             | no       | Replaces button content with a loading spinner. Button is disabled while `loading={true}`.                                      |
| focusableWhenDisabled | `boolean`                                             | no       | Keeps the button in the tab order when `disabled`. Defaults to `false`.                                                         |
| disabled              | `boolean`                                             | no       | Disables the button — from `ButtonHTMLAttributes`.                                                                              |
| data-testid           | `string`                                              | no       | Test selector on the button element.                                                                                            |

**Canonical usage**
```tsx
// Primary CTA — default filled style
import { Button } from "@lifesg/react-design-system/button";

<Button.Default onClick={handleSubmit}>Submit</Button.Default>

// Secondary outlined button
<Button.Default styleType="secondary" onClick={handleCancel}>Cancel</Button.Default>

// Destructive action
<Button.Default danger onClick={handleDelete}>Delete</Button.Default>

// Loading state during async submission
<Button.Default loading={isSubmitting} onClick={handleSubmit}>Submit</Button.Default>

// Small and Large size variants
<Button.Small styleType="secondary">Save draft</Button.Small>
<Button.Large>Get started</Button.Large>
```
**Figma mapping hints**
| Figma element / layer pattern             | Map to           | Condition                           |
| Primary / filled CTA button (text only)   | `Button.Default` | `styleType` defaults to `"default"` |
| Secondary / outlined button (text only)   | `Button.Default` | Set `styleType="secondary"`         |
| Ghost / light button (text only)          | `Button.Default` | Set `styleType="light"`             |
| Link-style button (text only, borderless) | `Button.Default` | Set `styleType="link"`              |
| Small button (text only)                  | `Button.Small`   | Any `styleType` available           |
| Large button (text only)                  | `Button.Large`   | Any `styleType` available           |
| Red / destructive button                  | `Button.Default` | Add `danger={true}`                 |
| Button with spinner / loading state       | `Button.Default` | Add `loading={true}`                |

**Composition patterns**
- Pair with `ButtonWithIcon` (`@lifesg/react-design-system/button-with-icon`)
  in the same button group when some actions need an icon and others do not —


### ButtonWithIcon

**Import**:
`import { ButtonWithIcon } from "@lifesg/react-design-system/button-with-icon"`

**Category**: Selection and input

**Decision rule**
> Use `ButtonWithIcon` when the action needs both text and an icon in a
> single CTA; use `Button` for text-only actions and `IconButton` for
> icon-only actions.

**When to use**
- Primary/secondary CTAs where the icon improves scanability (download,
  continue, external action).
- Destructive or async actions that need icon+label plus `danger` or
  `loading` states.

**When NOT to use**
| Situation                     | Use instead  |
| ----------------------------- | ------------ |
| Text-only button              | `Button`     |
| Icon-only action with no text | `IconButton` |

**Key props**
| Prop                  | Type                                            | Required | Notes                                                        |
| --------------------- | ----------------------------------------------- | -------- | ------------------------------------------------------------ |
| icon                  | `JSX.Element`                                   | yes      | Icon rendered inside the button beside the label.            |
| styleType             | `"default" \| "secondary" \| "light" \| "link"` | no       | Visual button style variant.                                 |
| iconPosition          | `"left" \| "right"`                             | no       | Icon position relative to text; defaults to `"left"`.        |
| danger                | `boolean`                                       | no       | Applies red destructive colour scheme.                       |
| loading               | `boolean`                                       | no       | Replaces icon with loading spinner and disables interaction. |
| focusableWhenDisabled | `boolean`                                       | no       | Keeps disabled button focusable for accessibility flows.     |
| disabled              | `boolean`                                       | no       | Disables interaction (inherited button prop).                |

**Canonical usage**
```tsx
// CTA with trailing icon
import { ButtonWithIcon } from "@lifesg/react-design-system/button-with-icon";
import { ArrowRightIcon } from "@lifesg/react-icons/arrow-right";

<ButtonWithIcon.Default
  icon={<ArrowRightIcon />}
  iconPosition="right"
  onClick={handleContinue}
>
  Continue
</ButtonWithIcon.Default>
```

**Figma mapping hints**
| Figma element / layer pattern       | Map to           | Condition                                                  |
| ----------------------------------- | ---------------- | ---------------------------------------------------------- |
| Button with label and trailing icon | `ButtonWithIcon` | Set `iconPosition="right"` when icon is on the right side. |

**Known limitations**
- `focusableWhenDisabled` keeps the button in tab order, but other event
  handlers may still fire on parent containers.


### Calendar

**Import**: `import { Calendar } from "@lifesg/react-design-system/calendar"`

**Category**: Selection and input

**Decision rule**
> Use `Calendar` when the Figma frame shows an **always-visible inline date
> picker panel** — use `Form.DateInput` when the date picker should surface
> only when the user activates a form input field.

**When to use**
- An embedded date selection UI where the calendar grid is always rendered
  (not hidden behind a text input).
- Multi-date selection scenarios (booking, scheduling) where users need to
  toggle individual dates on and off.

**When NOT to use**
| Situation                                                   | Use instead                                                               |
| ----------------------------------------------------------- | ------------------------------------------------------------------------- |
| Date input inside a labelled form with a text field trigger | `Form.DateInput` from `@lifesg/react-design-system/date-input`            |
| Date range selection in a form (start date + end date)      | `Form.DateRangeInput` from `@lifesg/react-design-system/date-range-input` |

**Key props**
| Prop                    | Type                          | Required | Notes                                                                                                   |
| ----------------------- | ----------------------------- | -------- | ------------------------------------------------------------------------------------------------------- |
| variant                 | `"single"` \| `"multi"`       | no       | Selection mode. `"single"` allows one date; `"multi"` allows toggling multiple. Defaults to `"single"`. |
| value                   | `string`                      | no       | Selected date in `YYYY-MM-DD`. Applies to `variant="single"` only.                                      |
| values                  | `string[]`                    | no       | Array of selected dates in `YYYY-MM-DD`. Applies to `variant="multi"` only.                             |
| minDate                 | `string`                      | no       | Earliest selectable date, inclusive. Format `YYYY-MM-DD`.                                               |
| maxDate                 | `string`                      | no       | Latest selectable date, inclusive. Format `YYYY-MM-DD`.                                                 |
| disabledDates           | `string[]`                    | no       | Individual dates to disable, each in `YYYY-MM-DD` format. E.g. `["2026-03-25"]`.                        |
| allowDisabledSelection  | `boolean`                     | no       | Visually marks dates as disabled but still allows them to be selected.                                  |
| showActiveMonthDaysOnly | `boolean`                     | no       | Hides days from adjacent months in the grid. Defaults to `false`.                                       |
| styleType               | `"bordered"` \| `"no-border"` | no       | Adds or removes the outer border. Defaults to `"bordered"`.                                             |
| minSelectable           | `number`                      | no       | `variant="multi"` only — minimum number of dates that must be selected.                                 |
| maxSelectable           | `number`                      | no       | `variant="multi"` only — maximum number of dates selectable at once.                                    |
| id                      | `string`                      | no       | Unique identifier on the root element.                                                                  |
| data-testid             | `string`                      | no       | Test selector on the root element.                                                                      |

**Canonical usage**
```tsx
// Single-date inline calendar (default)
import { Calendar } from "@lifesg/react-design-system/calendar";

  value={selectedDate}
  onChange={(date) => setSelectedDate(date)}
/>
// Multi-date selection — toggle individual dates on and off
  variant="multi"
  values={selectedDates}
  maxSelectable={5}
  onChange={(dates) => setSelectedDates(dates)}
/>

// Constrained range with blackout dates
<Calendar
  value={selectedDate}
  minDate="2026-01-01"
  maxDate="2026-12-31"
  disabledDates={["2026-03-25", "2026-03-26"]}
  onChange={(date) => setSelectedDate(date)}
/>

| Figma element / layer pattern              | Map to     | Condition                                           |
| ------------------------------------------ | ---------- | --------------------------------------------------- |
| Inline / always-visible date picker panel  | `Calendar` | Always-on display, no input field trigger           |
| Calendar with visible outer border         | `Calendar` | Default `styleType="bordered"`                      |
| Borderless calendar panel                  | `Calendar` | Set `styleType="no-border"`                         |
| Calendar with multiple selected dates      | `Calendar` | Set `variant="multi"`                               |
| Calendar with blackout / unavailable dates | `Calendar` | Pass `disabledDates`, `minDate`, or `maxDate` props |

**Known limitations**
- Week-range and fixed-range selection modes (`variant="week"`,
  `variant="fixed-range"`) are internal variants used by `Form.DateInput`
  and are not part of the public `Calendar` API.

---

### Checkbox

**Import**: `import { Checkbox } from "@lifesg/react-design-system/checkbox"`

**Category**: Selection and input

**Decision rule**
> Use `Checkbox` when the Figma frame shows a square tick-box selection
> control — use `RadioButton` for mutually exclusive single-select options
> shown as circles.

**When to use**
- Any multi-select option group where zero or more items can be selected
  simultaneously.
- A single opt-in toggle (e.g. "I agree to the terms") that needs a checkbox
  UI rather than a toggle switch.

**When NOT to use**
| Situation                                          | Use instead                                                   |
| -------------------------------------------------- | ------------------------------------------------------------- |
| Only one option can be selected from a group       | `RadioButton` from `@lifesg/react-design-system/radio-button` |
| Binary on/off toggle (not a form field)            | `Toggle` from `@lifesg/react-design-system/toggle`            |
| Labelled checkbox inside a form with error message | `Form` (check if `Form.Checkbox` exists) or wrap manually     |

**Key props**
| Prop          | Type                     | Required | Notes                                                                               |
| ------------- | ------------------------ | -------- | ----------------------------------------------------------------------------------- |
| checked       | `boolean`                | no       | Controlled checked state — from `InputHTMLAttributes`.                              |
| disabled      | `boolean`                | no       | Disables the checkbox — from `InputHTMLAttributes`.                                 |
| indeterminate | `boolean`                | no       | Renders the checkbox in a partial/indeterminate state (dash instead of tick).       |
| displaySize   | `"default"` \| `"small"` | no       | Visual size. `"small"` renders a compact checkbox. Defaults to `"default"`.         |
| id            | `string`                 | no       | Associates with a `<label>` element for accessibility — from `InputHTMLAttributes`. |

**Canonical usage**
// Controlled multi-select checkbox
import { Checkbox } from "@lifesg/react-design-system/checkbox";

<>
  <label htmlFor="terms">
    <Checkbox
      id="terms"
      checked={isChecked}
      onChange={(e) => setIsChecked(e.target.checked)}
    />
    I agree to the terms and conditions
  </label>

  {/* Indeterminate state — parent of partially selected children */}
  <Checkbox
    indeterminate={someChecked && !allChecked}
    checked={allChecked}
    onChange={handleSelectAll}
  />

  {/* Small size variant */}
  <Checkbox displaySize="small" checked={isChecked} />
</>
```

**Figma mapping hints**
| Figma element / layer pattern        | Map to     | Condition                             |
| ------------------------------------ | ---------- | ------------------------------------- |
| Checkbox (single or group)           | `Checkbox` | Any square tick-box selection control |
| Indeterminate / partial select state | `Checkbox` | Set `indeterminate={true}`            |
| Small compact checkbox               | `Checkbox` | Set `displaySize="small"`             |

**Known limitations**
- No built-in label or error message — wrap with a `<label>` element and
  handle error display manually.

---

### DateNavigator

**Import**:
`import { DateNavigator } from "@lifesg/react-design-system/date-navigator"`

**Category**: Selection and input

**Decision rule**
> Use `DateNavigator` when users need arrow-based day/week navigation around a
> current date with optional calendar jump.

**When to use**
- Date browsing controls above schedules, slots, or date-filtered lists.
- Week strip navigation with bounded `minDate` / `maxDate` constraints.

**When NOT to use**
| Situation                                         | Use instead      |
| ------------------------------------------------- | ---------------- |
| User needs to pick and edit a form date field     | `Form.DateInput` |
| User needs always-visible month calendar browsing | `Calendar`       |

**Key props**
| Prop                   | Type                            | Required | Notes                                                |
| ---------------------- | ------------------------------- | -------- | ---------------------------------------------------- |
| selectedDate           | `string`                        | yes      | Current displayed date in `YYYY-MM-DD` format.       |
| onLeftArrowClick       | `(currentDate: string) => void` | yes      | Called when user navigates backward.                 |
| onRightArrowClick      | `(currentDate: string) => void` | yes      | Called when user navigates forward.                  |
| onCalendarDateSelect   | `(currentDate: string) => void` | no       | Enables calendar dropdown date selection.            |
| view                   | `"day" \| "week"`               | no       | Display mode for single day or week range.           |
| minDate                | `string`                        | no       | Inclusive lower date bound for arrows/calendar.      |
| maxDate                | `string`                        | no       | Inclusive upper date bound for arrows/calendar.      |
| loading                | `boolean`                       | no       | Disables navigation while async updates are running. |
| showDateAsShortForm    | `boolean`                       | no       | Displays date in short form (e.g. `26 Mar 2026`).    |
| showCurrentDateAsToday | `boolean`                       | no       | Shows system today label as `Today`.                 |

**Canonical usage**
```tsx
// Date header navigation with calendar jump
import { DateNavigator } from "@lifesg/react-design-system/date-navigator";

<DateNavigator
  selectedDate={selectedDate}
  onLeftArrowClick={handlePrevDate}
  onRightArrowClick={handleNextDate}
  onCalendarDateSelect={setSelectedDate}
  minDate="2026-01-01"
  maxDate="2026-12-31"
/>
```

**Figma mapping hints**
| Figma element / layer pattern        | Map to          | Condition                                              |
| ------------------------------------ | --------------- | ------------------------------------------------------ |
| Date header with left/right chevrons | `DateNavigator` | Use for day-by-day navigation around a selected date.  |
| Week range navigator strip           | `DateNavigator` | Set `view="week"` for week-range display and movement. |

**Known limitations**
- Date selection/formatting logic is consumer-managed through callbacks and
  external state.

---

### FileDownload

**Import**: `import { FileDownload } from "@lifesg/react-design-system/file-download"`

**Category**: Selection and input

**Decision rule**
> Use `FileDownload` when the Figma frame shows a list of files the user
> should **download** — use `FileUpload` when the user needs to supply files
> to the application.

**When to use**
- A panel that lists one or more downloadable files (attachments, generated
  reports, exported documents).
- Scenarios where a file requires server-side generation before it becomes
  available — use the `ready` flag on each item to block the download until
  the file is ready.

**When NOT to use**
| Situation                                           | Use instead                                                 |
| --------------------------------------------------- | ----------------------------------------------------------- |
| User needs to select and upload files to the server | `FileUpload` from `@lifesg/react-design-system/file-upload` |

**Key props**

*`FileDownloadProps`*
| Prop        | Type                                                     | Required | Notes                                                                                    |
| ----------- | -------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| fileItems   | `FileItemDownloadProps[]`                                | yes      | Array of file items to display; each item requires `id`, `name`, `mimeType`, `filePath`. |
| onDownload  | `(file: FileItemDownloadProps) => void \| Promise<void>` | yes      | Called when a file row is clicked — perform the fetch/save logic here.                   |
| title       | `string \| JSX.Element`                                  | no       | Heading above the file list. Supports bold, links, and list markup.                      |
| description | `string \| JSX.Element`                                  | no       | Supporting text below the title. Accepts the same markup as `title`.                     |
| styleType   | `"bordered" \| "no-border"`                              | no       | Outer container border variant. Defaults to `"bordered"`.                                |
| id          | `string`                                                 | no       | Unique identifier on the root element.                                                   |
| data-testid | `string`                                                 | no       | Test selector on the root element.                                                       |

*`FileItemDownloadProps`*
| Prop                  | Type                        | Required | Notes                                                                                         |
| --------------------- | --------------------------- | -------- | --------------------------------------------------------------------------------------------- |
| id                    | `string`                    | yes      | Unique identifier for this file entry.                                                        |
| name                  | `string`                    | yes      | Display file name including extension, e.g. `"report.pdf"`.                                   |
| mimeType              | `string`                    | yes      | MIME type, e.g. `"application/pdf"` or `"image/jpeg"`.                                        |
| filePath              | `string`                    | yes      | Remote URL passed to `onDownload` as `file.filePath`.                                         |
| size                  | `number`                    | no       | File size in bytes; rendered as a human-readable label next to the name.                      |
| ready                 | `boolean`                   | no       | Whether the file is available for download. Defaults to `true`; set `false` while generating. |
| errorMessage          | `string \| React.ReactNode` | no       | Custom message to show when the download fails.                                               |
| thumbnailImageDataUrl | `string`                    | no       | Base64 or URL thumbnail displayed alongside the file entry.                                   |
| truncateText          | `boolean`                   | no       | Truncates long file names. Defaults to `true`.                                                |

**Canonical usage**
```tsx
// Bordered file download panel (default)
import { FileDownload } from "@lifesg/react-design-system/file-download";

<FileDownload
  title="Downloads"
  description="Click a file to save it to your device."
  fileItems={[
    {
      id: "file-1",
      name: "report.pdf",
      mimeType: "application/pdf",
      size: 149504,
      filePath: "https://example.com/files/report.pdf",
    },
    {
      id: "file-2",
      name: "summary.txt",
      mimeType: "text/plain",
      size: 1024,
      filePath: "https://example.com/files/summary.txt",
    },
  ]}
  onDownload={async (file) => {
    const res = await fetch(file.filePath);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }}
/>

// File not yet ready — blocked until server-side generation completes
<FileDownload
  title="Generated report"
  fileItems={[
    {
      id: "gen-1",
      name: "export.pdf",
      mimeType: "application/pdf",
      filePath: "/api/exports/gen-1",
      ready: isReady,
    },
  ]}
  onDownload={handleDownload}
/>
```

**Figma mapping hints**
| Figma element / layer pattern                | Map to         | Condition                                       |
| -------------------------------------------- | -------------- | ----------------------------------------------- |
| Downloadable file list / attachment panel    | `FileDownload` | Pass `fileItems` array and `onDownload` handler |
| Borderless downloadable file attachment area | `FileDownload` | Set `styleType="no-border"`                     |
| File item in generating / not-ready state    | `FileDownload` | Set `ready={false}` on `FileItemDownloadProps`  |

**Composition patterns**
- Pair with `FileUpload` from `@lifesg/react-design-system/file-upload` in
  upload-then-download workflows — show `FileUpload` for the input step and
  `FileDownload` to present the processed result for retrieval.

---

### Filter

**Import**: `import { Filter } from "@lifesg/react-design-system/filter"`

**Category**: Selection and input

**Decision rule**
> Use `Filter` when the UI needs grouped, collapsible filtering controls that
> switch automatically between sidebar (desktop) and modal (mobile/tablet)
> layouts.

**When to use**
- Results pages with multi-section filters that should collapse by panel.
- Responsive layouts where filter controls move from sidebar to fullscreen
  modal in smaller viewports.

**When NOT to use**
| Situation                                          | Use instead |
| -------------------------------------------------- | ----------- |
| Single-field quick filter with no grouped sections | `Input`     |
| Status/category chips used as tappable selectors   | `Tag`       |

**Key props**
| Prop                    | Type                                                               | Required | Notes                                                       |
| ----------------------- | ------------------------------------------------------------------ | -------- | ----------------------------------------------------------- |
| children                | `ReactNode \| ((mode: Mode) => ReactNode)`                         | yes      | Filter items/content; supports render-prop mode access.     |
| clearButtonDisabled     | `boolean`                                                          | no       | Disables clear action in header controls.                   |
| customLabels            | `FilterModalCustomLabelProps \| FilterSidebarCustomLabelProps`     | no       | Overrides default labels (e.g. `Clear`, `Done`, `Filters`). |
| toggleFilterButtonStyle | `"default" \| "secondary" \| "light" \| "link"`                    | no       | Mobile toggle button style. Defaults to `"light"`.          |
| insets                  | `{ top?: number; bottom?: number; left?: number; right?: number }` | no       | Mobile safe-area offsets for header/footer.                 |
| onClear                 | `() => void`                                                       | no       | Called when clear is pressed.                               |
| onDismiss               | `() => void`                                                       | no       | Mobile only; called when modal is dismissed.                |
| onDone                  | `() => void`                                                       | no       | Mobile only; called when done is pressed.                   |

**Canonical usage**
```tsx
// Responsive filter with collapsible items
import { Filter } from "@lifesg/react-design-system/filter";

<Filter onClear={handleClear} onDone={handleDone} onDismiss={handleDismiss}>
  <Filter.Item title="Search" collapsible>
    <Input placeholder="Search" />
  </Filter.Item>
  <Filter.Item title="Date" collapsible showDivider>
    <Calendar value={date} onChange={setDate} />
  </Filter.Item>
</Filter>
```

**Figma mapping hints**
| Figma element / layer pattern            | Map to   | Condition                                         |
| ---------------------------------------- | -------- | ------------------------------------------------- |
| Filter sidebar with collapsible panels   | `Filter` | Desktop/tablet result pages with grouped filters. |
| Fullscreen filter editor with done/clear | `Filter` | Mobile flow using modal presentation.             |

**Composition patterns**
- Use `Filter.Item` for grouped sections and move advanced child controls
  inside each panel.
- Use `Filter.Modal` or `Filter.Sidebar` directly only when you need to force
  one mode regardless of viewport.

**Known limitations**
- `onDone`, `onDismiss`, and `onModalOpen` are mobile-mode behaviors.

---

### Filter.Addons (FilterItemCheckbox)

**Import**: `import { Filter } from "@lifesg/react-design-system/filter"`

**Category**: Selection and input

**Decision rule**
> Use `Filter.Checkbox` (tracked as `Filter.Addons`) when a filter section
> needs grouped checkbox options (including nested options) inside a filter
> panel.

**When to use**
- Multi-select filter categories in a `Filter.Item` section (e.g. service type,
  status, or agency).
- Nested filter trees where parent/child checkbox options need consistent
  extraction and selection handling.

**When NOT to use**
| Situation                                    | Use instead   |
| -------------------------------------------- | ------------- |
| Single-value selection within a filter group | `RadioButton` |
| Free-text filtering without option lists     | `Input`       |

**Key props**
| Prop                   | Type                           | Required | Notes                                                       |
| ---------------------- | ------------------------------ | -------- | ----------------------------------------------------------- |
| options                | `T[]`                          | yes      | Filter option list (supports nested option trees).          |
| selectedOptions        | `T[]`                          | no       | Controlled selected options.                                |
| onSelect               | `(options: T[]) => void`       | no       | Called when selected options change.                        |
| labelExtractor         | `(item: T) => React.ReactNode` | no       | Derives display label; defaults to `item.label` when valid. |
| valueExtractor         | `(item: T) => string`          | no       | Derives stable option value key; defaults to `item.value`.  |
| showAsCheckboxInMobile | `boolean`                      | no       | Forces checkbox-list rendering in mobile mode.              |
| minimisableOptions     | `boolean`                      | no       | Enables option list minimisation (`View more`).             |
| useToggleContentWidth  | `boolean`                      | no       | Fits mobile toggle width to content.                        |

**Canonical usage**
```tsx
// Checkbox addon section inside Filter panel
import { Filter } from "@lifesg/react-design-system/filter";

<Filter.Item title="Category" collapsible>
  <Filter.Checkbox
    options={categoryOptions}
    selectedOptions={selectedCategories}
    onSelect={setSelectedCategories}
    labelExtractor={(item) => item.label}
    valueExtractor={(item) => item.value}
  />
</Filter.Item>
```

**Figma mapping hints**
| Figma element / layer pattern            | Map to            | Condition                                                |
| ---------------------------------------- | ----------------- | -------------------------------------------------------- |
| Filter panel with checkbox option list   | `Filter.Checkbox` | Use within `Filter.Item` section for multi-select input. |
| Filter panel with nested checkbox groups | `Filter.Checkbox` | Pass tree-structured `options` and extractors.           |

**Composition patterns**
- Compose inside `Filter.Item` to keep collapsible panel heading and divider
  behavior.

**Known limitations**
- No dedicated Storybook docs page was found for `Filter.Checkbox`; API is
  sourced from package type exports.

---

### FeedbackRating

**Import**:
`import { FeedbackRating } from "@lifesg/react-design-system/feedback-rating"`

**Category**: Selection and input

**Decision rule**
> Use `FeedbackRating` when users must submit a 1–5 star sentiment rating with
> an explicit submit action.

**When to use**
- Post-task feedback prompts where users rate experience quality using stars.
- Flows that require a controlled rating state and explicit submit callback.

**When NOT to use**
| Situation                                      | Use instead   |
| ---------------------------------------------- | ------------- |
| Binary like/dislike or yes/no sentiment        | `Toggle`      |
| Multi-question satisfaction survey form fields | `Form.Select` |

**Key props**
| Prop           | Type                      | Required | Notes                                                              |
| -------------- | ------------------------- | -------- | ------------------------------------------------------------------ |
| rating         | `number`                  | yes      | Current selected star rating (1 to 5).                             |
| onRatingChange | `(value: number) => void` | yes      | Called when a star option is selected.                             |
| onSubmit       | `() => void`              | yes      | Called when the submit button is pressed.                          |
| buttonLabel    | `string`                  | no       | Submit button text. Defaults to `"Submit"`.                        |
| description    | `string`                  | no       | Prompt text shown above stars. Defaults to "Rate your experience". |
| imgSrc         | `string`                  | no       | Optional banner image URL; pass empty string to hide image.        |
| id             | `string`                  | no       | Unique id on component root.                                       |
| className      | `string`                  | no       | CSS hook on component root.                                        |
| data-testid    | `string`                  | no       | Test selector on component root.                                   |

**Canonical usage**
```tsx
// 1–5 star feedback with explicit submit
import { FeedbackRating } from "@lifesg/react-design-system/feedback-rating";

<FeedbackRating
  rating={rating}
  onRatingChange={setRating}
  onSubmit={handleSubmitFeedback}
  buttonLabel="Submit"
  description="Rate your experience"
/>
```

**Figma mapping hints**
| Figma element / layer pattern                  | Map to           | Condition                                           |
| ---------------------------------------------- | ---------------- | --------------------------------------------------- |
| Star rating block with submit CTA              | `FeedbackRating` | Use when design shows 1–5 stars plus submit button. |
| Experience rating card with optional top image | `FeedbackRating` | Use `imgSrc` when a header/banner image is present. |

**Known limitations**
- Submit is intended to be enabled only after a rating value is set.

---

### IconButton

**Import**: `import { IconButton } from "@lifesg/react-design-system/icon-button"`

**Category**: Selection and input

**Decision rule**
> Use `IconButton` when the action is represented by an icon without visible
> text; use `ButtonWithIcon` when the action must show both icon and label.

**When to use**
- Compact toolbar, card, or list actions such as archive, close, delete, or
  settings.
- Cases where icon-only affordance is visually required and an accessible name
  can be provided via `aria-label` or `alt`.

**When NOT to use**
| Situation                                      | Use instead                                                          |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| Action requires visible text label for clarity | `ButtonWithIcon` from `@lifesg/react-design-system/button-with-icon` |

**Key props**
| Prop                  | Type                                  | Required | Notes                                                  |
| --------------------- | ------------------------------------- | -------- | ------------------------------------------------------ |
| styleType             | `"primary" \| "secondary" \| "light"` | no       | Visual style; defaults to `"primary"`.                 |
| sizeType              | `"large" \| "default" \| "small"`     | no       | Size variant; defaults to `"default"`.                 |
| focusableWhenDisabled | `boolean`                             | no       | Keeps disabled control focusable; defaults to `false`. |
| disabled              | `boolean`                             | no       | Disables click behavior (inherited button prop).       |
| data-testid           | `string`                              | no       | Test selector on the button element.                   |

**Canonical usage**
```tsx
// Icon-only archive action with accessible name
import { IconButton } from "@lifesg/react-design-system/icon-button";
import { BoxIcon } from "@lifesg/react-icons/box";

<IconButton styleType="secondary" sizeType="default">
  <BoxIcon aria-label="Archive item" />
</IconButton>
```

**Figma mapping hints**
| Figma element / layer pattern    | Map to       | Condition                                            |
| -------------------------------- | ------------ | ---------------------------------------------------- |
| Icon-only circular action button | `IconButton` | No visible text label; icon communicates the action. |

**Known limitations**
- Accessible name must be provided on icon/image content (e.g. `aria-label`
  or `alt`) for screen-reader clarity.

---

### ImageButton

**Import**:
`import { ImageButton } from "@lifesg/react-design-system/image-button"`

**Category**: Selection and input

**Decision rule**
> Use `ImageButton` when the CTA is represented by an image tile plus label
> and needs selectable/pressed states.

**When to use**
- Option pickers where each choice is a visual tile (room type, category, etc.).
- Selectable image actions that need `selected`, `error`, or disabled states.

**When NOT to use**
| Situation                               | Use instead                 |
| --------------------------------------- | --------------------------- |
| Action is icon-only with no image tile  | `IconButton`                |
| Action is text-only or text+icon button | `Button` / `ButtonWithIcon` |

**Key props**
| Prop                  | Type      | Required | Notes                                                     |
| --------------------- | --------- | -------- | --------------------------------------------------------- |
| imgSrc                | `string`  | yes      | Source image rendered above/beside label content.         |
| selected              | `boolean` | no       | Shows active/selected state styling.                      |
| error                 | `boolean` | no       | Shows error visual styling.                               |
| disabled              | `boolean` | no       | Disables interaction and default focusability.            |
| focusableWhenDisabled | `boolean` | no       | Keeps disabled control focusable for accessibility modes. |

**Canonical usage**
```tsx
// Selectable image tile option
import { ImageButton } from "@lifesg/react-design-system/image-button";

<ImageButton
  imgSrc="https://cdn-icons-png.flaticon.com/512/4401/4401459.png"
  selected={isSelected}
  aria-pressed={isSelected}
  onClick={toggleSelection}
>
  Office Equipment
</ImageButton>
```

**Figma mapping hints**
| Figma element / layer pattern                | Map to        | Condition                                              |
| -------------------------------------------- | ------------- | ------------------------------------------------------ |
| Image tile CTA with label and selected state | `ImageButton` | Use when option card is image-led and toggleable.      |
| Disabled image choice tile                   | `ImageButton` | Use `disabled` and optionally `focusableWhenDisabled`. |

**Known limitations**
- `onClick` does not fire when disabled, but other handlers on ancestors may
  still receive bubbled events.

---

### OtpInput

**Import**: `import { OtpInput } from "@lifesg/react-design-system/otp-input"`

**Category**: Selection and input

**Decision rule**
> Use `OtpInput` for one-time-password verification code entry with built-in
> resend cooldown behavior; use regular text fields for non-OTP input.

**When to use**
- MFA verification steps where users enter fixed-length OTP codes.
- Flows that need built-in resend action and cooldown handling.

**When NOT to use**
| Situation                                               | Use instead            |
| ------------------------------------------------------- | ---------------------- |
| Normal text or numeric data entry in forms              | `Form.Input`           |
| Full verification workflow with channel UI and wrappers | `Form.OtpVerification` |

**Key props**
| Prop              | Type                                   | Required | Notes                                                   |
| ----------------- | -------------------------------------- | -------- | ------------------------------------------------------- |
| numOfInput        | `number`                               | yes      | Number of OTP boxes to render.                          |
| value             | `string[]`                             | no       | Controlled OTP value as one character per index.        |
| cooldownDuration  | `number`                               | no       | Cooldown in seconds before resend action is re-enabled. |
| actionButtonProps | `ButtonProps`                          | no       | Customises the built-in resend/action button.           |
| otpOnly           | `boolean`                              | no       | Hides built-in action button for external UI control.   |
| prefix            | `{ value: string; separator: string }` | no       | Shows and strips prefix during paste/autofill handling. |
| errorMessage      | `string \| React.ReactNode`            | no       | Displays validation feedback below the OTP field.       |
| data-testid       | `string`                               | no       | Test selector on the component root.                    |

**Canonical usage**
```tsx
// OTP field with resend cooldown and validation
import { OtpInput } from "@lifesg/react-design-system/otp-input";

<OtpInput
  numOfInput={6}
  value={otpValue}
  cooldownDuration={60}
  errorMessage={otpError}
  actionButtonProps={{ children: "Resend OTP" }}
  onChange={(value) => setOtpValue(value)}
/>
```

**Figma mapping hints**
| Figma element / layer pattern                | Map to     | Condition                                   |
| -------------------------------------------- | ---------- | ------------------------------------------- |
| One-time-password code input with resend CTA | `OtpInput` | Fixed-length OTP boxes with cooldown action |

**Known limitations**
- `otpOnly` removes the built-in button; cooldown UI must then be rendered by
  the consumer.

---

### RadioButton

**Import**:
`import { RadioButton } from "@lifesg/react-design-system/radio-button"`

**Category**: Selection and input

**Decision rule**
> Use `RadioButton` when the Figma frame shows circular single-select option
> controls where exactly one option must be chosen — use `Checkbox` for square
> tick-box controls where zero or more options can be selected.

**When to use**
- Mutually exclusive option groups where only one choice is valid at a time
  (e.g. gender, payment method, delivery type).
- 2–4 options that benefit from being scannable side-by-side rather than
  hidden in a dropdown.

**When NOT to use**
| Situation                                            | Use instead                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------- |
| Zero or more options can be selected simultaneously  | `Checkbox` from `@lifesg/react-design-system/checkbox`        |
| Many options (5+) where a compact selector is needed | `InputSelect` from `@lifesg/react-design-system/input-select` |
| Binary on/off toggle (not a form field)              | `Toggle` from `@lifesg/react-design-system/toggle`            |

**Key props**
| Prop        | Type                     | Required | Notes                                                                                   |
| ----------- | ------------------------ | -------- | --------------------------------------------------------------------------------------- |
| checked     | `boolean`                | no       | Controlled checked state — from `InputHTMLAttributes`.                                  |
| disabled    | `boolean`                | no       | Disables this radio option — from `InputHTMLAttributes`.                                |
| name        | `string`                 | no       | Groups radio buttons together so only one can be selected — from `InputHTMLAttributes`. |
| value       | `string`                 | no       | Machine value for this option — from `InputHTMLAttributes`.                             |
| displaySize | `"default"` \| `"small"` | no       | Visual size. `"small"` renders a compact radio button. Defaults to `"default"`.         |
| id          | `string`                 | no       | Associates with a `<label>` element for accessibility — from `InputHTMLAttributes`.     |

**Canonical usage**
```tsx
// Mutually exclusive radio group
import { RadioButton } from "@lifesg/react-design-system/radio-button";

<fieldset>
  <legend>Select your preferred contact method</legend>
  {["Email", "Phone", "Post"].map((option) => (
    <label key={option} htmlFor={`contact-${option}`}>
      <RadioButton
        id={`contact-${option}`}
        name="contact-method"
        value={option.toLowerCase()}
        checked={selected === option.toLowerCase()}
        onChange={() => setSelected(option.toLowerCase())}
      />
      {option}
    </label>
  ))}
</fieldset>
```

**Figma mapping hints**
| Figma element / layer pattern              | Map to        | Condition                                                 |
| ------------------------------------------ | ------------- | --------------------------------------------------------- |
| Radio button / single-select option circle | `RadioButton` | Circular indicator with mutually exclusive selection      |
| Radio group (2–4 labelled options)         | `RadioButton` | One `RadioButton` per option, all sharing the same `name` |
| Small compact radio button                 | `RadioButton` | Set `displaySize="small"`                                 |

**Known limitations**
- No built-in label or error message — wrap each radio in a `<label>` and use
  a `<fieldset>` + `<legend>` for group semantics.

---

### SingpassButton

**Import**: `import { SingpassButton } from "@lifesg/react-design-system/singpass-button"`

**Category**: Selection and input

**Decision rule**
> Use `SingpassButton` when the action is specifically Singpass login; use
> standard `Button` variants for all non-Singpass actions.

**When to use**
- Login and identity-verification entry points that route users to Singpass.
- Screens that must follow official Singpass button branding guidance.

**When NOT to use**
| Situation                               | Use instead |
| --------------------------------------- | ----------- |
| Generic primary or secondary app action | `Button`    |

**Key props**
| Prop       | Type                              | Required | Notes                                               |
| ---------- | --------------------------------- | -------- | --------------------------------------------------- |
| styleType  | `"red-filled" \| "white-filled"`  | no       | Visual variant; defaults to `"white-filled"`.       |
| disabled   | `boolean`                         | no       | Disables click interaction (inherited button prop). |
| onClick    | `() => void`                      | no       | Click handler to start Singpass auth flow.          |
| type       | `"button" \| "submit" \| "reset"` | no       | Native button type for form behavior control.       |
| aria-label | `string`                          | no       | Accessibility label for screen-reader clarity.      |

**Canonical usage**
```tsx
// Official Singpass login call-to-action
import { SingpassButton } from "@lifesg/react-design-system/singpass-button";

<SingpassButton
  styleType="white-filled"
  aria-label="Log in with Singpass"
  onClick={startSingpassLogin}
/>
```

**Figma mapping hints**
| Figma element / layer pattern | Map to           | Condition                                           |
| ----------------------------- | ---------------- | --------------------------------------------------- |
| Singpass login CTA button     | `SingpassButton` | Use only official white-filled or red-filled style. |

**Known limitations**
- Intended only for Singpass-auth actions; do not repurpose as a generic CTA.

---

### Toggle

**Import**: `import { Toggle } from "@lifesg/react-design-system/toggle"`

**Category**: Selection and input

**Decision rule**
> Use `Toggle` when the user interaction takes **immediate effect** (like a
> switch) — use `Checkbox` when the state is collected in a form and applied
> only on submit.

**When to use**
- Binary on/off settings that apply immediately without a form submission
  (e.g. "Enable notifications", "Dark mode").
- Single or grouped selection controls that need a card-like toggle button
  appearance rather than a bare checkbox or radio circle.

**When NOT to use**
| Situation                                        | Use instead   |
| ------------------------------------------------ | ------------- |
| Simple square tick-box for form field opt-in     | `Checkbox`    |
| Mutually exclusive option group shown as circles | `RadioButton` |

**Key props**
| Prop             | Type                                               | Required | Notes                                                                                                                           |
| ---------------- | -------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------- |
| children         | `string`                                           | yes      | Main selector label displayed inside the toggle.                                                                                |
| checked          | `boolean`                                          | no       | Controlled selected state.                                                                                                      |
| type             | `"checkbox"` \| `"radio"` \| `"yes"` \| `"no"`     | no       | Determines deselection behaviour. `"checkbox"` allows deselection; `"radio"`, `"yes"`, `"no"` do not. Defaults to `"checkbox"`. |
| styleType        | `"default"` \| `"no-border"`                       | no       | `"default"` renders with a border; `"no-border"` removes it. Defaults to `"default"`.                                           |
| disabled         | `boolean`                                          | no       | Disables the toggle.                                                                                                            |
| error            | `boolean`                                          | no       | Shows the error visual state.                                                                                                   |
| subLabel         | `string` \| `JSX.Element` \| `(() => JSX.Element)` | no       | Description text rendered below the main label.                                                                                 |
| indicator        | `boolean`                                          | no       | Displays an indicator icon alongside the label.                                                                                 |
| removable        | `boolean`                                          | no       | Renders a remove button on the toggle. Defaults to `false`.                                                                     |
| useContentWidth  | `boolean`                                          | no       | Shrinks the container minimum width to fit its content.                                                                         |
| childrenMaxLines | `{ desktop: number; mobile: number }`              | no       | Truncates the main label after the specified number of lines per breakpoint.                                                    |
| compositeSection | `CompositeSectionProps`                            | no       | Expands the toggle with a collapsible subsection below the label.                                                               |
| name             | `string`                                           | no       | Groups toggles for radio-style behaviour — all sharing the same `name` act as a set.                                            |
| id               | `string`                                           | no       | Unique identifier on the underlying input element.                                                                              |
| data-testid      | `string`                                           | no       | Test selector.                                                                                                                  |

**Canonical usage**
```tsx
// Binary on/off toggle — immediate effect, allows deselection
import { Toggle } from "@lifesg/react-design-system/toggle";

<Toggle
  checked={isEnabled}
  onChange={(e) => setIsEnabled(e.target.checked)}
>
  Enable notifications
</Toggle>

// Radio-style toggle group — deselection not allowed
{["Email", "Phone", "Post"].map((option) => (
  <Toggle
    key={option}
    type="radio"
    name="contact-method"
    checked={selected === option}
    onChange={() => setSelected(option)}
  >
    {option}
  </Toggle>
))}

// Toggle with sub-label description
<Toggle
  checked={isEnabled}
  subLabel="You will receive email alerts for new activity."
  onChange={(e) => setIsEnabled(e.target.checked)}
>
  Enable notifications
</Toggle>
```

**Figma mapping hints**
| Figma element / layer pattern            | Map to   | Condition                                                               |
| ---------------------------------------- | -------- | ----------------------------------------------------------------------- |
| Toggle / switch card (on/off)            | `Toggle` | Binary immediate-effect control; `type` defaults to `"checkbox"`        |
| Toggle group (select one, no deselect)   | `Toggle` | Set `type="radio"` and shared `name`; `"yes"` / `"no"` for yes/no pairs |
| Toggle with description text below label | `Toggle` | Set `subLabel`                                                          |
| Toggle without visible border            | `Toggle` | Set `styleType="no-border"`                                             |
| Toggle with remove / dismiss button      | `Toggle` | Set `removable={true}` and handle `onRemove`                            |

**Composition patterns**
- Use `compositeSection` to nest a collapsible subsection (e.g. extra fields
  or helper content) directly inside a toggle — pass `CompositeSectionProps`
  with `children` and optionally `collapsible`, `initialExpanded`, and
  `errors`.
