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
