> **Form** group — Input, Form.Input, Form.Select, and all other form field
> and input wrapper components (MultiSelect, DateInput, Textarea, etc.).
> For other groups see the other `resources/component-catalogue-*.md` files.
> For buttons, checkboxes, and radio buttons see
> `resources/component-catalogue-selection-input.md`.
> For the cross-cutting Figma → FDS Quick Lookup table, see
> `resources/component-catalogue.md`.

---

## Form

> Single-value and multi-value user input controls rendered inside forms.
> Scan this group when the Figma frame contains a text input, select,
> date picker, masked field, OTP entry, or any field that collects user data
> inside a `<form>`.

### Input

**Import**: `import { Input } from "@lifesg/react-design-system/input"`

**Category**: Form

**Decision rule**
> Use `Input` when the Figma frame shows a single-line text field with NO
> visible label — otherwise use `Form.Input`.

**When to use**
- Standalone inline input without a label (e.g. search bar, filter chip,
  inline edit).
- Building a custom form layout where you control your own `<label>` and
  error display.

**When NOT to use**
| Situation                          | Use instead                                                 |
| ---------------------------------- | ----------------------------------------------------------- |
| Field has a visible label above it | `Form.Input`                                                |
| Field needs prefix/suffix addons   | `InputGroup` from `@lifesg/react-design-system/input-group` |
| Multiline text                     | `Form.Textarea` from `@lifesg/react-design-system/form`     |

**Key props**
| Prop        | Type                          | Required | Notes                                                                                 |
| ----------- | ----------------------------- | -------- | ------------------------------------------------------------------------------------- |
| styleType   | `"bordered"` \| `"no-border"` | no       | Visual style. Use `"no-border"` for search/filter contexts. Defaults to `"bordered"`. |
| error       | `boolean`                     | no       | Applies error state styling (red border).                                             |
| allowClear  | `boolean`                     | no       | Shows an × icon inside the input to clear the value.                                  |
| onClear     | `() => void`                  | no       | Fired when the × clear button is clicked.                                             |
| spacing     | `number`                      | no       | Auto-inserts a space every N characters. Only meaningful when `type="tel"`.           |
| placeholder | `string`                      | no       | Hint text shown when the input is empty — from `InputHTMLAttributes`.                 |
| disabled    | `boolean`                     | no       | Disables the input — from `InputHTMLAttributes`.                                      |
| data-testid | `string`                      | no       | Test selector on the input element.                                                   |

**Canonical usage**
```tsx
// Inline search box — no label, no border
import { Input } from "@lifesg/react-design-system/input";

<Input
  styleType="no-border"
  placeholder="Search..."
  allowClear
  onClear={() => setValue("")}
/>
```

**Figma mapping hints**
| Figma element / layer pattern        | Map to  | Condition                                              |
| ------------------------------------ | ------- | ------------------------------------------------------ |
| Search field / filter bar (no label) | `Input` | Any inline text input with no associated label element |
| Text field / Error (no label)        | `Input` | Set `error={true}`                                     |
| Tel / phone (standalone, no label)   | `Input` | Use `type="tel"` and `spacing` prop for auto-spacing   |

**Composition patterns**
- Wrap in `InputGroup` (`@lifesg/react-design-system/input-group`) to add
  prefix icons, suffix icons, or unit labels.
- Pair with `Form.Label` and an error `<span>` when building a fully custom
  labelled field without `Form.Input`.

---

### InputGroup

**Import**:
`import { InputGroup } from "@lifesg/react-design-system/input-group"`

**Category**: Form

**Decision rule**
> Use `InputGroup` when a single-line field requires an attached addon (label,
> list selector, or custom element) as part of the same input control; use
> `Form.Input` when no addon is needed.

**When to use**
- Monetary, unit, or prefixed value fields (e.g. `$`, `kg`) where addon and
  input must behave as one control.
- Form fields requiring a dropdown selector addon (e.g. country code,
  category selector) next to free text entry.

**When NOT to use**
| Situation                 | Use instead     |
| ------------------------- | --------------- |
| Plain labelled text input | `Form.Input`    |
| Multi-line free text      | `Form.Textarea` |

**Key props**
| Prop             | Type                                          | Required | Notes                                                               |
| ---------------- | --------------------------------------------- | -------- | ------------------------------------------------------------------- |
| addon            | `AddonProps<T, V>`                            | no       | Configures addon `type` (`label`, `list`, `custom`) and `position`. |
| noBorder         | `boolean`                                     | no       | Removes border wrapper around combined control.                     |
| allowClear       | `boolean`                                     | no       | Inherited from `Input`; shows clear action in text field.           |
| options          | `T[]`                                         | no       | List addon only; options shown in addon selector.                   |
| selectedOption   | `T`                                           | no       | List addon only; currently selected addon option.                   |
| onSelectOption   | `(option: T, extractedValue: T \| V) => void` | no       | List addon selection callback.                                      |
| enableSearch     | `boolean`                                     | no       | List addon only; enables text search in selector list.              |
| dropdownZIndex   | `number`                                      | no       | Overrides addon dropdown z-index in complex overlays.               |
| dropdownRootNode | `RefObject<HTMLElement>`                      | no       | Changes dropdown mount root for shared scroll contexts.             |

**Type-specific requirements**
| Type value | Extra requirement            | Notes                                                  |
| ---------- | ---------------------------- | ------------------------------------------------------ |
| `list`     | `options` + `onSelectOption` | Required to render and handle addon list interactions. |

**Canonical usage**
```tsx
// Label addon for amount input
import { Form } from "@lifesg/react-design-system/form";

<Form.InputGroup
  label="Amount"
  addon={{
    type: "label",
    position: "left",
    attributes: { value: "$" },
  }}
  placeholder="Enter amount"
/>
```

**Figma mapping hints**
| Figma element / layer pattern                  | Map to            | Condition                                                           |
| ---------------------------------------------- | ----------------- | ------------------------------------------------------------------- |
| Text input with fixed prefix/suffix unit addon | `Form.InputGroup` | Use `addon.type="label"` with `position="left"` or `"right"`.       |
| Text input with dropdown selector addon        | `Form.InputGroup` | Use `addon.type="list"` with addon options and extractor callbacks. |

**Composition patterns**
- Use standalone `InputGroup` for unlabelled widget composition; use
  `Form.InputGroup` when field label and error handling are needed.

---

### Form.CustomField

**Import**: `import { Form } from "@lifesg/react-design-system/form"` →
`<Form.CustomField />`

**Category**: Form

**Decision rule**
> Use `Form.CustomField` when you have a custom input element (not a standard
> FDS input) that still needs the FDS label, error message, and accessibility
> wrapper infrastructure.

**When to use**
- A third-party or bespoke input widget that lacks its own label/error
  handling.
- Any case where a Figma frame shows a labelled form field whose inner control
  is not covered by another `Form.*` component.

**When NOT to use**
| Situation                               | Use instead       | Reason                               |
| --------------------------------------- | ----------------- | ------------------------------------ |
| Standard single-line text input         | `Form.Input`      | Purpose-built with all required a11y |
| Date, select, checkbox, or radio inputs | Matching `Form.*` | Native wrappers already exist        |

**Key props**
| Prop           | Type                           | Notes                                                              |
| -------------- | ------------------------------ | ------------------------------------------------------------------ |
| `children`     | `JSX.Element \| JSX.Element[]` | Required. The custom input element(s) to wrap.                     |
| `id`           | `string`                       | Applied to the wrapper; also passed to child via `aria-labelledby` |
| `disabled`     | `boolean`                      | Disables the child element and dims label                          |
| `label`        | `FormLabelProps \| string`     | Field label configuration                                          |
| `errorMessage` | `string \| React.ReactNode`    | Triggers error display and injects `aria-invalid` into child       |

**Accessibility**
- Automatically injects `aria-describedby`, `aria-invalid`, and
  `aria-labelledby` into the wrapped child element.

**Composition patterns**
- Wrap any custom input in `Form.CustomField` to gain consistent label
  alignment, error display, and accessibility attributes without extra
  boilerplate.

---

### Form.DateInput

**Import**:
`import { DateInput } from "@lifesg/react-design-system/date-input"` *(or via
`Form.DateInput` from `@lifesg/react-design-system/form`)*

**Category**: Form

**Decision rule**
> Use `Form.DateInput` when the Figma frame shows a single date picker field
> that opens a calendar dropdown — use `Form.DateRangeInput` when both a
> start date and an end date are required.

**When to use**
- Any labelled form field that collects a single calendar date from the user.
- When the design shows a day / month / year segmented input with a calendar
  pop-up on interaction.

**When NOT to use**
| Situation                                      | Use instead                                                               |
| ---------------------------------------------- | ------------------------------------------------------------------------- |
| User must provide a start date AND an end date | `Form.DateRangeInput` from `@lifesg/react-design-system/date-range-input` |
| Always-visible calendar panel (no text input)  | `Calendar` from `@lifesg/react-design-system/calendar`                    |

**Key props**
| Prop                   | Type                          | Required | Notes                                                                                           |
| ---------------------- | ----------------------------- | -------- | ----------------------------------------------------------------------------------------------- |
| label                  | `string` \| `FormLabelProps`  | no       | Label above the field. Pass `FormLabelProps` to add a tooltip/popover addon.                    |
| errorMessage           | `string` \| `React.ReactNode` | no       | Error text shown below the field; also triggers red border styling.                             |
| value                  | `string`                      | no       | Controlled date in `"YYYY-MM-DD"` format.                                                       |
| minDate                | `string`                      | no       | Earliest selectable date in `"YYYY-MM-DD"` format (inclusive).                                  |
| maxDate                | `string`                      | no       | Latest selectable date in `"YYYY-MM-DD"` format (inclusive).                                    |
| disabledDates          | `string[]`                    | no       | Specific dates to grey out, each in `"YYYY-MM-DD"` format.                                      |
| allowDisabledSelection | `boolean`                     | no       | When `true`, visually disabled dates remain selectable.                                         |
| withButton             | `boolean`                     | no       | Shows "Done" and "Cancel" buttons in the dropdown. Defaults to `true`; always `true` on mobile. |
| disabled               | `boolean`                     | no       | Disables the field entirely.                                                                    |
| readOnly               | `boolean`                     | no       | Shows the value without allowing changes.                                                       |
| error                  | `boolean`                     | no       | Applies error styling when `errorMessage` is not set.                                           |
| hideInputKeyboard      | `boolean`                     | no       | Hides the software keyboard on field focus (useful on touch devices).                           |
| zIndex                 | `number`                      | no       | Custom z-index for the calendar dropdown (default `50`). Set when z-index conflicts occur.      |
| dropdownRootNode       | `RefObject<HTMLElement>`      | no       | Override mount point for the dropdown (default `document.body`); use to share scroll context.   |
| data-testid            | `string`                      | no       | Test selector on the input element.                                                             |
| data-error-testid      | `string`                      | no       | Test selector on the error message element.                                                     |

**Canonical usage**
```tsx
// Labelled date field with date range constraint and error message
import { Form } from "@lifesg/react-design-system/form";

<Form.DateInput
  label="Date of birth"
  value={value}
  minDate="1900-01-01"
  maxDate="2024-12-31"
  errorMessage={errors.dob}
  onChange={(date) => setValue(date)}
  data-testid="dob-input"
/>
```

**Figma mapping hints**
| Figma element / layer pattern                | Map to           | Condition                                                                    |
| -------------------------------------------- | ---------------- | ---------------------------------------------------------------------------- |
| Date picker / date input field (single date) | `Form.DateInput` | Field has a label and opens a calendar dropdown; use via the `Form` wrapper. |
| Date input (standalone, no label)            | `DateInput`      | Use standalone import from `date-input` without the `Form` wrapper.          |
| Date field with restricted date range        | `Form.DateInput` | Set `minDate` and/or `maxDate` to match the design constraints.              |
| Date field with blackout / unavailable dates | `Form.DateInput` | Pass `disabledDates` array with each entry in `"YYYY-MM-DD"` format.         |

**Composition patterns**
- When the dropdown renders inside a scrollable container, pass
  `dropdownRootNode` pointing to that container to prevent scroll-behind
  clipping.
- Pair with a `zIndex` override if rendered inside `Modal` or `Overlay` and
  the default z-index auto-adjustment is insufficient.

---

### Form.DateRangeInput

**Import**:
`import { Form } from "@lifesg/react-design-system/form"` *(or standalone:
`import { DateRangeInput } from "@lifesg/react-design-system/date-range-input"`)*

**Category**: Form

**Decision rule**
> Use `Form.DateRangeInput` when the user must select both a start and end
> date in one field; use `Form.DateInput` when only one date is needed.

**When to use**
- From/to date windows such as booking periods and reporting ranges.
- Week-range or fixed-duration range selection using variant-driven behavior.

**When NOT to use**
| Situation                                        | Use instead      |
| ------------------------------------------------ | ---------------- |
| Field captures only one date                     | `Form.DateInput` |
| Always-visible calendar panel without text input | `Calendar`       |

**Key props**
| Prop                   | Type                                           | Required | Notes                                              |
| ---------------------- | ---------------------------------------------- | -------- | -------------------------------------------------- |
| label                  | `string \| FormLabelProps`                     | no       | Form label above the range field.                  |
| errorMessage           | `string \| React.ReactNode`                    | no       | Validation message shown below the field.          |
| value                  | `string`                                       | no       | Start date in `"YYYY-MM-DD"` or `"YYYY-M-D"`.      |
| valueEnd               | `string`                                       | no       | End date in `"YYYY-MM-DD"` or `"YYYY-M-D"`.        |
| variant                | `"range" \| "week" \| "fixed-range"`           | no       | Selection type. Defaults to `"range"`.             |
| numberOfDays           | `number`                                       | no       | Fixed-range duration in days. Defaults to `7`.     |
| disabledDates          | `string[]`                                     | no       | Unavailable dates in `"YYYY-MM-DD"` format.        |
| minDate / maxDate      | `string`                                       | no       | Inclusive allowed date window boundaries.          |
| allowDisabledSelection | `boolean`                                      | no       | Allows selecting dates that are visually disabled. |
| withButton             | `boolean`                                      | no       | Shows `Done`/`Cancel`; effectively true on mobile. |
| onChange               | `(startDate: string, endDate: string) => void` | no       | Returns selected start and end dates.              |

**Type-specific requirements**
| Type value      | Extra requirement | Notes                                              |
| --------------- | ----------------- | -------------------------------------------------- |
| `"fixed-range"` | `numberOfDays`    | Controls required fixed duration (default 7 days). |

**Canonical usage**
```tsx
// Labelled date range field in a form
import { Form } from "@lifesg/react-design-system/form";

<Form.DateRangeInput
  label="Travel period"
  value={startDate}
  valueEnd={endDate}
  minDate="2026-01-01"
  maxDate="2026-12-31"
  onChange={(start, end) => {
    setStartDate(start);
    setEndDate(end);
  }}
/>
```

**Figma mapping hints**
| Figma element / layer pattern                | Map to                | Condition                                       |
| -------------------------------------------- | --------------------- | ----------------------------------------------- |
| Date range input with `From` and `To` fields | `Form.DateRangeInput` | Two-date range selection in one control.        |
| Week range picker (Sun–Sat)                  | `Form.DateRangeInput` | Set `variant="week"`.                           |
| Fixed-duration range picker                  | `Form.DateRangeInput` | Set `variant="fixed-range"` and `numberOfDays`. |

**Composition patterns**
- Use standalone `DateRangeInput` import when label/error wrapper behavior is
  not needed.

**Known limitations**
- `value` and `valueEnd` must be managed together for controlled range state.

---

### Form.ESignature

**Import**: `import { Form } from "@lifesg/react-design-system/form"` →
`<Form.ESignature />`
*(or standalone:
`import { ESignature } from "@lifesg/react-design-system/e-signature"`)*

**Category**: Form

**Storybook**: `form-e-signature--docs`

**Decision rule**
> Use `Form.ESignature` whenever the Figma frame shows a drawing pad or
> signature capture area that saves a handwritten signature as an image.

**When to use**
- Legal or consent forms that require a captured signature.
- Any flow where the user must draw or handwrite their acceptance.

**When NOT to use**
| Situation                         | Use instead       | Reason                         |
| --------------------------------- | ----------------- | ------------------------------ |
| Typed name as signature           | `Form.Input`      | Text-only, no drawing required |
| Uploading an image of a signature | File upload input | User uploads existing image    |

**Key props**
| Prop              | Type                        | Default          | Notes                                           |
| ----------------- | --------------------------- | ---------------- | ----------------------------------------------- |
| `value`           | `string`                    | —                | PNG base64 string of the captured signature     |
| `description`     | `string`                    | —                | Instruction text shown above the drawing pad    |
| `disabled`        | `boolean`                   | `false`          | Prevents interaction with the pad               |
| `loadingLabel`    | `string`                    | `"Uploading..."` | Label shown during upload progress              |
| `loadingProgress` | `number`                    | —                | Upload progress (0–1); shows progress indicator |
| `label`           | `FormLabelProps \| string`  | —                | Field label configuration                       |
| `errorMessage`    | `string \| React.ReactNode` | —                | Error display below the pad                     |

**Composition patterns**
- Use `loadingProgress` (0–1) together with `loadingLabel` to show upload
  feedback after signature is captured.
- Use standalone `ESignature` import when the label/error wrapper is not
  needed.

---

### Form.HistogramSlider

**Import**: `import { Form } from "@lifesg/react-design-system/form"` →
`<Form.HistogramSlider />`
*(or standalone:
`import { HistogramSlider } from "@lifesg/react-design-system/histogram-slider"`)*

**Category**: Form

**Decision rule**
> Use `Form.HistogramSlider` when the Figma design shows an **always-visible**
> inline histogram chart with a two-thumb draggable range slider — the
> histogram and slider stay on the page, not inside a dropdown.

**When to use**
- Filter panels showing result distribution with a draggable range (e.g.,
  price filter with bar chart).
- Any inline numeric range picker paired with a frequency/count visualisation.

**When NOT to use**
| Situation                                       | Use instead            | Reason                                  |
| ----------------------------------------------- | ---------------------- | --------------------------------------- |
| Histogram hidden behind a dropdown trigger      | `Form.SelectHistogram` | Dropdown-based histogram range picker   |
| Range selection with no histogram visualisation | `Form.RangeSlider`     | Two-thumb slider without chart overhead |

**Key props**
| Prop               | Type                  | Notes                                                                 |
| ------------------ | --------------------- | --------------------------------------------------------------------- |
| `bins`             | `HistogramBinProps[]` | Required. Array of `{ count: number; minValue: number }` data points. |
| `interval`         | `number`              | Required. Width of each bin (e.g., `10` for bins 0–9, 10–19, …).      |
| `value`            | `[number, number]`    | Controlled selected range `[min, max]`                                |
| `disabled`         | `boolean`             | Disables both thumb interactions                                      |
| `readOnly`         | `boolean`             | Displays current value without allowing changes                       |
| `showRangeLabels`  | `boolean`             | Shows min/max range labels below the slider                           |
| `rangeLabelPrefix` | `string`              | Prepended to each range label (e.g., `"$"`)                           |
| `rangeLabelSuffix` | `string`              | Appended to each range label (e.g., `" km"`)                          |
| `renderRangeLabel` | `function`            | Custom render function for range label display                        |
| `ariaLabels`       | `[string, string]`    | Accessible labels for the two thumbs                                  |

**Composition patterns**
- Provide `bins` from your API's distribution data and set `interval` to match
  the bin width used server-side.
- Pair `rangeLabelPrefix`/`rangeLabelSuffix` with `showRangeLabels` for
  currency or unit display.

---

### Form.Input

**Import**:
`import { Form } from "@lifesg/react-design-system/form"` → `<Form.Input />`

**Category**: Form

**Decision rule**
> Use `Form.Input` whenever the Figma frame shows a single-line text field
> WITH a visible label — it is the default choice for all standard labelled
> form fields.

**When to use**
- Any labelled single-line free-text input in a form.
- When the design shows a label above the field and an optional error message
  below.

**When NOT to use**
| Situation                               | Use instead                                      |
| --------------------------------------- | ------------------------------------------------ |
| No label on the field                   | `Input`                                          |
| Multiline text area                     | `Form.Textarea`                                  |
| Phone number with country code selector | `Form.PhoneNumberInput`                          |
| Masked input (NRIC, card number)        | `Form.MaskedInput`                               |
| Field needs prefix/suffix addons        | `Input` inside `Form.CustomField` + `InputGroup` |

**Key props**
| Prop                                  | Type                                | Required | Notes                                                                                                                                                            |
| ------------------------------------- | ----------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| label                                 | `string` \| `FormLabelProps`        | no       | Label above the input. Pass a string for plain labels. Pass `FormLabelProps` to add a tooltip/popover addon (`addonType: "tooltip" \| "popover"`) or a subtitle. |
| errorMessage                          | `string` \| `ReactNode`             | no       | Error text shown below the input. Also triggers red border styling on the input.                                                                                 |
| styleType                             | `"bordered"` \| `"no-border"`       | no       | Passed through to the underlying `Input`. Defaults to `"bordered"`.                                                                                              |
| allowClear                            | `boolean`                           | no       | Shows an × clear button inside the input.                                                                                                                        |
| onClear                               | `() => void`                        | no       | Fired when × is clicked.                                                                                                                                         |
| disabled                              | `boolean`                           | no       | Disables the input and dims the label.                                                                                                                           |
| layoutType                            | `"flex"` \| `"grid"` \| `"v2-grid"` | no       | How the label and input are arranged. Use `"grid"` when the field sits inside a `Layout` grid.                                                                   |
| mobileCols / tabletCols / desktopCols | `number`                            | no       | Responsive column span for use inside a `Layout` grid.                                                                                                           |
| data-testid                           | `string`                            | no       | Test selector on the input element.                                                                                                                              |
| data-error-testid                     | `string`                            | no       | Test selector on the error message element.                                                                                                                      |

**Canonical usage**
```tsx
// Standard labelled text field with validation error
import { Form } from "@lifesg/react-design-system/form";

<Form.Input
  label="Full name"
  placeholder="Enter your full name"
  errorMessage={errors.name}
  data-testid="name-input"
/>
```

**Figma mapping hints**
| Figma element / layer pattern     | Map to       | Condition                                                                           |
| --------------------------------- | ------------ | ----------------------------------------------------------------------------------- |
| Text field with label (any state) | `Form.Input` | Label is above the input in the Figma layer                                         |
| Text field / Error with label     | `Form.Input` | Set `errorMessage` to the error string                                              |
| Multi-column form grid field      | `Form.Input` | Add `layoutType="grid"` + col span props                                            |
| Label with tooltip icon           | `Form.Input` | Pass `label` as `{ children: "Label", addon: { content: "...", type: "tooltip" } }` |

**Composition patterns**
- Use inside a `Layout` grid (`@lifesg/react-design-system/layout`) with
  `layoutType="grid"` and col span props for responsive multi-column forms.
- Use `Form.CustomField` wrapping `InputGroup` instead when prefix/suffix
  addons are required.

**Known limitations**
- No built-in character counter — add one manually below the field.
- Prefix/suffix addons not supported — use `Input` inside `Form.CustomField`
  + `InputGroup` instead.

---

### Form.Label

**Import**:
`import { Form } from "@lifesg/react-design-system/form"` → `<Form.Label />`

**Category**: Form

**Decision rule**
> Use `Form.Label` when you need a standalone form label (with optional
> tooltip/popover addon and subtitle) in custom layouts; use `Form.Input` or
> other `Form.*` wrappers when label and control should be rendered together.

**When to use**
- Custom form compositions where label placement is decoupled from the input
  component.
- Labels that need helper addon bubbles (`tooltip`/`popover`) or subtitles.

**When NOT to use**
| Situation                           | Use instead  |
| ----------------------------------- | ------------ |
| Standard labelled single-line field | `Form.Input` |

**Key props**
| Prop                  | Type                     | Required | Notes                                                          |
| --------------------- | ------------------------ | -------- | -------------------------------------------------------------- |
| children              | `React.ReactNode`        | yes      | Main label content text/elements.                              |
| addon                 | `FormLabelAddonProps`    | no       | Helper addon configuration for tooltip/popover bubble content. |
| subtitle              | `string \| JSX.Element`  | no       | Secondary descriptive text below main label.                   |
| disabled              | `string`                 | no       | Applies disabled-style display state for label presentation.   |
| data-testid *(addon)* | `string`                 | no       | Test selector for addon trigger.                               |
| type *(addon)*        | `"tooltip" \| "popover"` | no       | Addon interaction style; defaults to `"popover"`.              |
| icon *(addon)*        | `JSX.Element`            | no       | Custom addon icon; default is info-circle icon.                |
| zIndex *(addon)*      | `number`                 | no       | Custom z-index for popover addon layer.                        |

**Canonical usage**
```tsx
// Standalone label with helper addon and subtitle in custom field layout
import { Form } from "@lifesg/react-design-system/form";

<Form.Label
  subtitle="Shown on your public profile"
  addon={{
    type: "tooltip",
    content: "Choose a clear label that users can easily identify.",
  }}
>
  Profile name
</Form.Label>
```

**Figma mapping hints**
| Figma element / layer pattern                | Map to       | Condition                                                           |
| -------------------------------------------- | ------------ | ------------------------------------------------------------------- |
| Standalone form label with helper icon/addon | `Form.Label` | Label rendered independently of input with tooltip/popover guidance |

**Composition patterns**
- Pair `Form.Label` with `Input`, `InputSelect`, or `FileUpload` for bespoke
  form layouts where wrappers like `Form.Input` are too opinionated.

---

### Form.MaskedInput

**Import**:
`import { Form } from "@lifesg/react-design-system/form"` →
`<Form.MaskedInput />`

**Category**: Form

**Decision rule**
> Use `Form.MaskedInput` when sensitive values must be partially masked and
> revealable; use `Form.Input` for ordinary plain-text fields.

**When to use**
- NRIC/ID, card-like identifiers, or other sensitive values requiring masked
  display.
- Read-only screens that need controlled mask/unmask behavior, including
  async unmask loading state.

**When NOT to use**
| Situation                        | Use instead  |
| -------------------------------- | ------------ |
| Plain text input without masking | `Form.Input` |

**Key props**
| Prop            | Type                               | Required | Notes                                                           |
| --------------- | ---------------------------------- | -------- | --------------------------------------------------------------- |
| label           | `string \| FormLabelProps`         | no       | Label above field; supports tooltip/popover addons.             |
| value           | `string`                           | no       | Controlled input value before masking transformation.           |
| maskChar        | `string`                           | no       | Character used for masked output; defaults to `•`.              |
| maskRange       | `number[]`                         | no       | Index range to mask in the input value.                         |
| unmaskRange     | `number[]`                         | no       | Index range to keep visible while masking remaining characters. |
| maskRegex       | `RegExp`                           | no       | Pattern matching characters to mask.                            |
| maskTransformer | `(value: string) => string`        | no       | Custom mask function for advanced masking logic.                |
| loadState       | `"loading" \| "fail" \| "success"` | no       | Read-only mode state for async unmask flows.                    |
| transformInput  | `"uppercase" \| "lowercase"`       | no       | Transforms user input case while typing.                        |
| errorMessage    | `string \| React.ReactNode`        | no       | Validation message shown below the field.                       |
| onMask          | `() => void`                       | no       | Called when value is masked.                                    |
| onUnmask        | `() => void`                       | no       | Called when value is unmasked.                                  |
| onTryAgain      | `() => void`                       | no       | Called from retry CTA when `loadState="fail"` in read-only.     |

**Type-specific requirements**
| Type value  | Extra requirement | Notes                                                        |
| ----------- | ----------------- | ------------------------------------------------------------ |
| `loadState` | `readOnly`        | Loading/fail/success display applies only in read-only mode. |

**Canonical usage**
```tsx
// Masked NRIC-style field with configurable masking range
import { Form } from "@lifesg/react-design-system/form";

<Form.MaskedInput
  label="Identification number"
  value={value}
  maskRange={[2, 5]}
  errorMessage={errors.idNumber}
  onChange={(e) => setValue(e.target.value)}
/>
```

**Figma mapping hints**
| Figma element / layer pattern                  | Map to             | Condition                                          |
| ---------------------------------------------- | ------------------ | -------------------------------------------------- |
| Sensitive text field with reveal/hide eye icon | `Form.MaskedInput` | Value is masked on blur with controlled unmasking. |

**Composition patterns**
- Use standalone `MaskedInput` from `masked-input` when form wrapper props
  (`label`, `errorMessage`) are not needed.

---

### Form.MultiSelect (InputMultiSelect)

**Import**:
`import { Form } from "@lifesg/react-design-system/form"`

**Category**: Form

**Decision rule**
> Use `Form.MultiSelect` when users must choose multiple options from one
> dropdown field; use `Form.Select` when only one option is allowed.

**When to use**
- Multi-choice filters and preference forms with shared option lists.
- Large option sets that benefit from built-in search and virtualised lists.

**When NOT to use**
| Situation                                | Use instead              |
| ---------------------------------------- | ------------------------ |
| User can select only one option          | `Form.Select`            |
| Option hierarchy needs parent/child tree | `Form.NestedMultiSelect` |

**Key props**
| Prop             | Type                                 | Required | Notes                                              |
| ---------------- | ------------------------------------ | -------- | -------------------------------------------------- |
| options          | `T[]`                                | yes      | Source option objects rendered in dropdown.        |
| selectedOptions  | `T[]`                                | no       | Controlled selected option objects.                |
| valueExtractor   | `(option: T) => V`                   | no       | Derives option value key from each option object.  |
| listExtractor    | `(option: T) => string`              | no       | Derives display label for each option row.         |
| enableSearch     | `boolean`                            | no       | Enables text search input within dropdown.         |
| maxSelectable    | `number`                             | no       | Caps the number of selections allowed.             |
| optionsLoadState | `"success" \| "loading" \| "failed"` | no       | Shows loading/fail state for async option fetches. |
| variant          | `"default" \| "small"`               | no       | Controls field size style.                         |
| customLabels     | `DropdownCustomLabelProps`           | no       | Overrides select-all and multi-selected labels.    |
| dropdownZIndex   | `number`                             | no       | Overrides dropdown stacking order for conflicts.   |
| errorMessage     | `string \| React.ReactNode`          | no       | Form-level validation message below the field.     |

**Canonical usage**
```tsx
// Multi-select field with search and selection limit
import { Form } from "@lifesg/react-design-system/form";

<Form.MultiSelect
  label="Notification channels"
  options={channelOptions}
  selectedOptions={selectedChannels}
  valueExtractor={(option) => option.value}
  listExtractor={(option) => option.label}
  enableSearch
  maxSelectable={3}
  onSelectOptions={(options) => setSelectedChannels(options)}
/>
```

**Figma mapping hints**
| Figma element / layer pattern                         | Map to             | Condition                              |
| ----------------------------------------------------- | ------------------ | -------------------------------------- |
| Multi-select dropdown field with selected-count label | `Form.MultiSelect` | User can select multiple items at once |

**Composition patterns**
- Use `InputMultiSelect` standalone import when label/error wrapping is not
  needed.

---

### Form.NestedMultiSelect (InputNestedMultiSelect)

**Import**: `import { Form } from "@lifesg/react-design-system/form"` *(or standalone: `import { InputNestedMultiSelect } from "@lifesg/react-design-system/input-nested-multi-select"`)*

**Category**: Form

**Decision rule**
> Use `Form.NestedMultiSelect` when the Figma design shows a **labelled hierarchical dropdown where multiple options across levels can be selected** — use `Form.NestedSelect` for single-selection.

**When to use**
- Category and subcategory multi-selection (e.g. choosing several topic areas from a taxonomy).
- Any hierarchical multi-option picker that needs a visible label, error message, and Select-All / Clear-All affordances.

**When NOT to use**
| Situation                                        | Use instead                                                                |
| ------------------------------------------------ | -------------------------------------------------------------------------- |
| Only one item can be selected from the hierarchy | `Form.NestedSelect` from `@lifesg/react-design-system/input-nested-select` |
| Flat (non-hierarchical) multi-selection          | `Form.MultiSelect` from `@lifesg/react-design-system/form`                 |

**Key props**
| Prop                  | Type                                                            | Required | Notes                                                                                     |
| --------------------- | --------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------- |
| options               | `L1OptionProps<V1, V2, V3>[]`                                   | yes      | Hierarchical option tree; each `L1OptionProps` may nest `L2` and `L3` entries.            |
| selectedKeyPaths      | `string[][]`                                                    | no       | Array of key-path arrays indicating each currently selected option.                       |
| mode                  | `"default" \| "expand" \| "collapse"`                           | no       | Controls initial expand/collapse state. `"default"` expands the already-selected subtree. |
| enableSearch          | `boolean`                                                       | no       | Enables in-dropdown text search. Defaults to `false`.                                     |
| optionTruncationType  | `"end" \| "middle"`                                             | no       | Truncation type for long option labels. Defaults to `"end"`.                              |
| optionsLoadState      | `"success" \| "loading" \| "failed"`                            | no       | Async load state indicator. Defaults to `"success"`.                                      |
| variant               | `"default" \| "small"`                                          | no       | `"small"` reduces the component height. Defaults to `"default"`.                          |
| disabled              | `boolean`                                                       | no       | Disables all interaction.                                                                 |
| readOnly              | `boolean`                                                       | no       | Shows selections without allowing changes.                                                |
| placeholder           | `string`                                                        | no       | Placeholder text when nothing is selected. Defaults to `"Select"`.                        |
| customLabels          | `DropdownCustomLabelProps`                                      | no       | Overrides default UI strings (e.g. `multiSelectedLabel`, `clearAllButtonLabel`).          |
| dropdownZIndex        | `number`                                                        | no       | Custom z-index for the dropdown. Defaults to `50`.                                        |
| valueToStringFunction | `(value: V1 \| V2 \| V3) => string`                             | no       | Converts a value to a display string.                                                     |
| onSelectOptions       | `(keyPaths: string[][], values: Array<V1 \| V2 \| V3>) => void` | no       | Fires when selection changes.                                                             |

**Canonical usage**
```tsx
// Hierarchical multi-select for topic categories
import { Form } from "@lifesg/react-design-system/form";

<Form.NestedMultiSelect
  label="Topics"
  options={[
    {
      label: "Science",
      key: "science",
      subItems: [
        { label: "Biology", key: "biology", value: "biology" },
        { label: "Physics", key: "physics", value: "physics" },
      ],
    },
  ]}
  selectedKeyPaths={selectedKeyPaths}
  enableSearch
  onSelectOptions={(keyPaths, values) => setSelectedKeyPaths(keyPaths)}
/>
```

**Figma mapping hints**
| Figma element / layer pattern                        | Map to                   | Condition                                      |
| ---------------------------------------------------- | ------------------------ | ---------------------------------------------- |
| Hierarchical dropdown with multi-tick selection      | `Form.NestedMultiSelect` | Multiple options selectable across tree levels |
| Category picker with Select All / Clear All controls | `Form.NestedMultiSelect` | Default label controls rendered automatically  |
| Hierarchical search-enabled multi-select dropdown    | `Form.NestedMultiSelect` | Set `enableSearch={true}`                      |

**Composition patterns**
- Use `customLabels.multiSelectedLabel` to replace the default "N selected" label with context-specific wording.
- Use standalone `InputNestedMultiSelect` import when building a layout without the `Form` wrapper.

---

### Form.NestedSelect (InputNestedSelect)

**Import**: `import { Form } from "@lifesg/react-design-system/form"` *(or standalone: `import { InputNestedSelect } from "@lifesg/react-design-system/input-nested-select"`)*

**Category**: Form

**Decision rule**
> Use `Form.NestedSelect` when the Figma design shows a **labelled hierarchical dropdown where exactly one leaf option can be selected** — use `Form.NestedMultiSelect` for multiple selections.

**When to use**
- Category → subcategory drill-down pickers (e.g. selecting a single service type from a two or three-level taxonomy).
- Any single-selection hierarchical field with a visible label and error state in a form.

**When NOT to use**
| Situation                                         | Use instead                                                                           |
| ------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Multiple options can be selected                  | `Form.NestedMultiSelect` from `@lifesg/react-design-system/input-nested-multi-select` |
| Flat (non-hierarchical) single-selection dropdown | `Form.Select` from `@lifesg/react-design-system/input-select`                         |

**Key props**
| Prop                  | Type                                                 | Required | Notes                                                                                       |
| --------------------- | ---------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------- |
| options               | `L1OptionProps<V1, V2, V3>[]`                        | yes      | Hierarchical option tree; each level may nest deeper entries.                               |
| selectedKeyPath       | `string[]`                                           | no       | Key path of the currently selected option (e.g. `["science", "biology"]`).                  |
| mode                  | `"default" \| "expand" \| "collapse"`                | no       | Controls initial expand/collapse state. Defaults to `"default"` (expands selected subtree). |
| selectableCategory    | `boolean`                                            | no       | Allows intermediate category nodes (not just leaf nodes) to be selected.                    |
| enableSearch          | `boolean`                                            | no       | Enables in-dropdown text search; requires at least 3 characters to trigger.                 |
| optionTruncationType  | `"end" \| "middle"`                                  | no       | Truncation style for long option labels. Defaults to `"end"`.                               |
| optionsLoadState      | `"success" \| "loading" \| "failed"`                 | no       | Async load state. Defaults to `"success"`.                                                  |
| variant               | `"default" \| "small"`                               | no       | `"small"` reduces the component height. Defaults to `"default"`.                            |
| disabled              | `boolean`                                            | no       | Disables all interaction.                                                                   |
| readOnly              | `boolean`                                            | no       | Shows selection without allowing changes.                                                   |
| placeholder           | `string`                                             | no       | Placeholder text when nothing is selected. Defaults to `"Select"`.                          |
| dropdownZIndex        | `number`                                             | no       | Custom z-index for the dropdown. Defaults to `50`.                                          |
| valueToStringFunction | `(value: V1 \| V2 \| V3) => string`                  | no       | Converts the selected value to a display string.                                            |
| onSelectOption        | `(keyPath: string[], value: V1 \| V2 \| V3) => void` | no       | Fires when an option is selected.                                                           |

**Canonical usage**
```tsx
// Hierarchical single-select for service type
import { Form } from "@lifesg/react-design-system/form";

<Form.NestedSelect
  label="Service type"
  options={[
    {
      label: "Healthcare",
      key: "healthcare",
      subItems: [
        { label: "Dental", key: "dental", value: "dental" },
        { label: "General Practice", key: "gp", value: "gp" },
      ],
    },
  ]}
  selectedKeyPath={selectedKeyPath}
  enableSearch
  onSelectOption={(keyPath, value) => setSelectedKeyPath(keyPath)}
/>

// With selectable intermediate categories
<Form.NestedSelect
  label="Department"
  options={departmentOptions}
  selectableCategory
  onSelectOption={(keyPath, value) => setDepartment(keyPath)}
/>
```

**Figma mapping hints**
| Figma element / layer pattern                    | Map to              | Condition                            |
| ------------------------------------------------ | ------------------- | ------------------------------------ |
| Hierarchical dropdown with single-tick selection | `Form.NestedSelect` | Only one leaf option selectable      |
| Category → subcategory drill-down picker         | `Form.NestedSelect` | Multiple levels with expand/collapse |
| Searchable nested dropdown (≥3 chars to search)  | `Form.NestedSelect` | Set `enableSearch={true}`            |

**Composition patterns**
- Use standalone `InputNestedSelect` import when building a layout without the `Form` label wrapper.
- Set `selectableCategory={true}` when the Figma design allows selecting a parent category node directly.

---

### Form.OtpVerification

**Import**:
`import { Form } from "@lifesg/react-design-system/form"` *(or standalone:
`import { OtpVerification } from "@lifesg/react-design-system/otp-verification"`)*

**Category**: Form

**Decision rule**
> Use `Form.OtpVerification` when the field must handle end-to-end OTP send,
> verify, resend, and verified-state transitions for phone or email.

**When to use**
- Identity verification fields requiring OTP send/verify flow in a single form
  component.
- Phone or email contact verification with countdown-based resend behavior.

**When NOT to use**
| Situation                                               | Use instead  |
| ------------------------------------------------------- | ------------ |
| Plain OTP digit entry without contact verification flow | `OtpInput`   |
| Standard text/email input with no OTP step              | `Form.Input` |

**Key props**
| Prop                    | Type                                                      | Required | Notes                                             |
| ----------------------- | --------------------------------------------------------- | -------- | ------------------------------------------------- |
| type                    | `"phone-number" \| "email"`                               | yes      | Verification channel type.                        |
| otpState                | `"default" \| "sent" \| "verified"`                       | yes      | Current verification state.                       |
| onOtpStateChange        | `(otpState: OtpVerificationState) => void`                | no       | Called when component transitions OTP state.      |
| onSendOtp               | `() => Promise<void>`                                     | no       | Triggered when user requests OTP send.            |
| onVerifyOtp             | `(otp: string) => Promise<void>`                          | no       | Triggered when user submits OTP for verification. |
| onResendOtp             | `() => Promise<void>`                                     | no       | Triggered on resend action after cooldown.        |
| verifyOtpCountdownTimer | `number`                                                  | no       | Resend cooldown seconds. Defaults to `60`.        |
| otpValue                | `{ prefix?: string; separator?: string; value?: string }` | no       | Current OTP value model.                          |
| onOtpChange             | `(value: string) => void`                                 | no       | Called when OTP value changes.                    |
| sendOtpError            | `string`                                                  | no       | Error message for send OTP step.                  |
| verifyOtpError          | `string`                                                  | no       | Error message for verify OTP step.                |
| showVerifyOtpThumbnail  | `boolean`                                                 | no       | Shows verification thumbnail in verify state.     |

**Type-specific requirements**
| Type value       | Extra requirement                         | Notes                                                   |
| ---------------- | ----------------------------------------- | ------------------------------------------------------- |
| `"phone-number"` | `phoneNumberValue`, `onPhoneNumberChange` | Uses `PhoneNumberInputValue` (`countryCode`, `number`). |
| `"email"`        | `emailValue`, `onEmailChange`             | Uses email string field for contact input.              |

**Canonical usage**
```tsx
// Phone OTP verification field in form context
import { Form } from "@lifesg/react-design-system/form";

<Form.OtpVerification
  label="Mobile number"
  type="phone-number"
  otpState={otpState}
  phoneNumberValue={phoneNumberValue}
  onPhoneNumberChange={setPhoneNumberValue}
  onSendOtp={sendOtp}
  onVerifyOtp={verifyOtp}
  onResendOtp={resendOtp}
  onOtpStateChange={setOtpState}
  verifyOtpCountdownTimer={60}
  sendOtpError={sendOtpError}
  verifyOtpError={verifyOtpError}
/>
```

**Figma mapping hints**
| Figma element / layer pattern                    | Map to                 | Condition                                          |
| ------------------------------------------------ | ---------------------- | -------------------------------------------------- |
| OTP verification field with Send/Verify states   | `Form.OtpVerification` | Use when design includes contact input + OTP flow. |
| Phone verification block with country code input | `Form.OtpVerification` | Set `type="phone-number"`.                         |
| Email verification block with OTP step           | `Form.OtpVerification` | Set `type="email"`.                                |

**Composition patterns**
- Use standalone `OtpVerification` import when form label/error wrapper props
  are not needed.

**Known limitations**
- Verification flow is state-driven (`otpState`); parent state orchestration
  is required for async send/verify transitions.

---

### Form.PhoneNumberInput

**Import**:
`import { Form } from "@lifesg/react-design-system/form"` →
`<Form.PhoneNumberInput />`

**Category**: Form

**Decision rule**
> Use `Form.PhoneNumberInput` for labelled phone number capture with country
> code selection; use `Form.Input` only when phone formatting/country handling
> is not needed.

**When to use**
- Any form field collecting mobile or contact numbers with selectable country
  code.
- Flows requiring optional fixed country and searchable country options.

**When NOT to use**
| Situation                           | Use instead        |
| ----------------------------------- | ------------------ |
| Plain labelled text input           | `Form.Input`       |
| Standalone no-label phone input row | `PhoneNumberInput` |

**Key props**
| Prop                    | Type                                     | Required | Notes                                                         |
| ----------------------- | ---------------------------------------- | -------- | ------------------------------------------------------------- |
| label                   | `string \| FormLabelProps`               | no       | Label above the field; supports tooltip/popover addon config. |
| value                   | `PhoneNumberInputValue`                  | no       | Controlled value object with `countryCode` and `number`.      |
| onChange                | `(value: PhoneNumberInputValue) => void` | no       | Fires when country code or number input changes.              |
| errorMessage            | `string \| React.ReactNode`              | no       | Validation message below the field.                           |
| fixedCountry            | `boolean`                                | no       | Locks selection to provided `value.countryCode`.              |
| enableSearch            | `boolean`                                | no       | Enables text search in country code dropdown.                 |
| allowClear              | `boolean`                                | no       | Shows clear icon to reset the input value.                    |
| optionPlaceholder       | `string`                                 | no       | Placeholder text in country selector field.                   |
| optionSearchPlaceholder | `string`                                 | no       | Placeholder text in country search input.                     |
| noBorder                | `boolean`                                | no       | Removes border wrapper style around input area.               |
| disabled                | `boolean`                                | no       | Disables country selection and number entry.                  |
| readOnly                | `boolean`                                | no       | Displays value without permitting edits.                      |

**Type-specific requirements**
| Type value     | Extra requirement   | Notes                                                  |
| -------------- | ------------------- | ------------------------------------------------------ |
| `fixedCountry` | `value.countryCode` | Required to render and lock the selected country code. |

**Canonical usage**
```tsx
// Labelled phone input with country selector and validation
import { Form } from "@lifesg/react-design-system/form";

<Form.PhoneNumberInput
  label="Mobile number"
  value={phoneValue}
  enableSearch
  allowClear
  errorMessage={errors.mobileNumber}
  onChange={(value) => setPhoneValue(value)}
/>
```

**Figma mapping hints**
| Figma element / layer pattern                 | Map to                  | Condition                                               |
| --------------------------------------------- | ----------------------- | ------------------------------------------------------- |
| Phone number field with country code selector | `Form.PhoneNumberInput` | Labelled form field with selectable international code. |

**Composition patterns**
- Use standalone `PhoneNumberInput` from `phone-number-input` when label and
  form error wrapper are not required.

---

### Form.PredictiveTextInput

**Import**:
`import { Form } from "@lifesg/react-design-system/form"` *(or standalone:
`import { PredictiveTextInput } from "@lifesg/react-design-system/predictive-text-input"`)*

**Category**: Form

**Decision rule**
> Use `Form.PredictiveTextInput` when the field must fetch and suggest options
> dynamically from user-typed input.

**When to use**
- Typeahead inputs that query remote option sources after a minimum character
  threshold.
- Forms where users pick a canonical option object instead of free text.

**When NOT to use**
| Situation                                   | Use instead   |
| ------------------------------------------- | ------------- |
| Fixed local option list with no async fetch | `Form.Select` |
| Free-text entry with no suggested options   | `Form.Input`  |

**Key props**
| Prop                  | Type                                          | Required | Notes                                                        |
| --------------------- | --------------------------------------------- | -------- | ------------------------------------------------------------ |
| fetchOptions          | `(input: string) => Promise<T[]>`             | yes      | Async callback that returns candidate options.               |
| minimumCharacters     | `number`                                      | no       | Minimum input length before options are shown (default `3`). |
| selectedOption        | `T`                                           | no       | Controlled selected option object.                           |
| displayValueExtractor | `(option: T) => string`                       | no       | Derives value shown in input after selection.                |
| listExtractor         | `(option: T) => string`                       | no       | Derives primary text shown in options list.                  |
| valueExtractor        | `(option: T) => V`                            | no       | Derives machine value passed to selection callback.          |
| onSelectOption        | `(option: T, extractedValue: T \| V) => void` | no       | Called when a suggested option is selected.                  |
| placeholder           | `string`                                      | no       | Placeholder text (default `Enter here...`).                  |
| disabled              | `boolean`                                     | no       | Disables typing and selection.                               |
| readOnly              | `boolean`                                     | no       | Displays value without allowing selection changes.           |

**Canonical usage**
```tsx
// Async predictive selector for address search
import { Form } from "@lifesg/react-design-system/form";

<Form.PredictiveTextInput
  label="Postal address"
  fetchOptions={fetchAddressOptions}
  minimumCharacters={3}
  selectedOption={selectedAddress}
  listExtractor={(option) => option.label}
  valueExtractor={(option) => option.id}
  displayValueExtractor={(option) => option.label}
  onSelectOption={(option) => setSelectedAddress(option)}
/>
```

**Figma mapping hints**
| Figma element / layer pattern                     | Map to                     | Condition                                         |
| ------------------------------------------------- | -------------------------- | ------------------------------------------------- |
| Search field with predictive dropdown suggestions | `Form.PredictiveTextInput` | Use when options are fetched from typed input.    |
| Typeahead field with primary and secondary labels | `Form.PredictiveTextInput` | Configure extractors for richer option rendering. |

**Composition patterns**
- Use standalone `PredictiveTextInput` import when label/error wrapper behavior
  is not needed.

**Known limitations**
- Option loading and request cancellation are consumer-managed within
  `fetchOptions`.

---

### Form.RangeSelect (InputRangeSelect)

**Import**: `import { Form } from "@lifesg/react-design-system/form"` *(or standalone: `import { InputRangeSelect } from "@lifesg/react-design-system/input-range-select"`)*

**Category**: Form

**Decision rule**
> Use `Form.RangeSelect` when the Figma design shows a **labelled pair of dropdown selects for a From / To range** — use `Form.RangeSlider` when the range is numeric and draggable.

**When to use**
- Category-based range pickers (e.g. alphabetical range "A" to "M", or year "2020" to "2025").
- Any from-and-to selection pair where each side draws from a separate or shared options list.

**When NOT to use**
| Situation                                    | Use instead                                                    |
| -------------------------------------------- | -------------------------------------------------------------- |
| Numeric range with a draggable slider        | `Form.RangeSlider` from `@lifesg/react-design-system/form`     |
| Single dropdown (not a range pair)           | `Form.Select` from `@lifesg/react-design-system/input-select`  |
| Time-range selection (start time + end time) | `Form.TimeRangePicker` from `@lifesg/react-design-system/form` |

**Key props**
| Prop                       | Type                                                 | Required | Notes                                                                               |
| -------------------------- | ---------------------------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| options                    | `{ from: T[], to: T[] }`                             | yes      | Separate option arrays for the From and To selectors.                               |
| selectedOption             | `{ from: T, to: T }`                                 | no       | Currently selected option objects for both selectors.                               |
| placeholders               | `{ from: string, to: string }`                       | no       | Placeholder text for each selector. Defaults to `{ from: "Select", to: "Select" }`. |
| listExtractor              | `(option: T) => string`                              | no       | Derives the display label for each dropdown list item.                              |
| valueExtractor             | `(option: T) => V`                                   | no       | Derives the underlying value from an option object.                                 |
| displayValueExtractor      | `(option: T) => string`                              | no       | Derives the display value shown in the selector when an option is selected.         |
| enableSearch               | `boolean`                                            | no       | Enables in-dropdown text search. Defaults to `false`.                               |
| optionTruncationType       | `"end" \| "middle"`                                  | no       | Truncation style for long option labels. Defaults to `"middle"`.                    |
| optionsLoadState           | `{ from: T, to: T }`                                 | no       | Async load state per selector (`"success"`, `"loading"`, `"failed"`).               |
| disabled                   | `boolean`                                            | no       | Disables both selectors.                                                            |
| readOnly                   | `boolean`                                            | no       | Renders both selectors as read-only.                                                |
| dropdownZIndex             | `number`                                             | no       | Custom z-index for both dropdowns. Defaults to `50`.                                |
| renderListItem             | `(item: T, args: ListItemRenderArgs) => JSX.Element` | no       | Custom renderer for dropdown list items.                                            |
| renderCustomSelectedOption | `(option: T) => JSX.Element`                         | no       | Custom renderer for the selected value display in the selector.                     |
| onSelectOption             | `(option: T, extractedValue: T \| V) => void`        | no       | Fires when an option is selected in either selector.                                |

**Canonical usage**
```tsx
// Alphabetical range selector: A – Z
import { Form } from "@lifesg/react-design-system/form";

const alphaOptions = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((c) => ({ label: c, value: c }));

<Form.RangeSelect
  label="Alphabetical range"
  options={{ from: alphaOptions, to: alphaOptions }}
  selectedOption={selectedRange}
  listExtractor={(o) => o.label}
  valueExtractor={(o) => o.value}
  onSelectOption={(option) => updateRange(option)}
/>
```

**Figma mapping hints**
| Figma element / layer pattern                       | Map to             | Condition                                                   |
| --------------------------------------------------- | ------------------ | ----------------------------------------------------------- |
| Two side-by-side dropdowns labelled "From" and "To" | `Form.RangeSelect` | Options are categorical or non-numeric                      |
| Alphabetical / year range picker pair               | `Form.RangeSelect` | Each selector draws from the same or a related options list |
| Range dropdowns with searchable items               | `Form.RangeSelect` | Set `enableSearch={true}`                                   |

**Composition patterns**
- Use `renderListItem` to display rich option rows (e.g. with description text) and `renderCustomSelectedOption` for a custom selected-value display.
- Use standalone `InputRangeSelect` import when building a custom form layout without the `Form` wrapper.

---

### Form.RangeSlider (InputRangeSlider)

**Import**: `import { Form } from "@lifesg/react-design-system/form"` *(or standalone: `import { InputRangeSlider } from "@lifesg/react-design-system/input-range-slider"`)*

**Category**: Form

**Decision rule**
> Use `Form.RangeSlider` when the Figma design shows a **labelled numeric range control with two or more thumbs** — use `Form.Slider` for a single-value slider.

**When to use**
- Price range / distance filters where users set a minimum and maximum value.
- Any bounded numeric range input that needs a label and error messaging.

**When NOT to use**
| Situation                       | Use instead                                           |
| ------------------------------- | ----------------------------------------------------- |
| Single-value slider (one thumb) | `Form.Slider` from `@lifesg/react-design-system/form` |
| Text-based numeric entry        | `Form.Input` from `@lifesg/react-design-system/form`  |

**Key props**
| Prop               | Type                                                 | Required | Notes                                                                |
| ------------------ | ---------------------------------------------------- | -------- | -------------------------------------------------------------------- |
| value              | `number[]`                                           | no       | Current thumb values; length must equal `numOfThumbs`.               |
| numOfThumbs        | `number`                                             | no       | Number of thumb controls. Defaults to `2`.                           |
| min                | `number`                                             | no       | Start of the range. Defaults to `0`.                                 |
| max                | `number`                                             | no       | End of the range. Defaults to `100`.                                 |
| step               | `number`                                             | no       | Interval between values. Defaults to `1`.                            |
| minRange           | `number`                                             | no       | Minimum allowed difference between adjacent thumb values.            |
| disabled           | `boolean`                                            | no       | Disables all interaction.                                            |
| readOnly           | `boolean`                                            | no       | Renders in read-only state.                                          |
| colors             | `(string \| ((props: ThemeStyleProps) => string))[]` | no       | Track segment colours; length must equal `numOfThumbs + 1`.          |
| showSliderLabels   | `boolean`                                            | no       | Shows min and max value labels at the track ends.                    |
| sliderLabelPrefix  | `string`                                             | no       | Text prepended to the min/max labels (e.g. `"$"`).                   |
| sliderLabelSuffix  | `string`                                             | no       | Text appended to the min/max labels (e.g. `" km"`).                  |
| showIndicatorLabel | `boolean`                                            | no       | Shows a label above each thumb indicating the current selection.     |
| ariaLabels         | `string[]`                                           | no       | Screen-reader label for each thumb; length must equal `numOfThumbs`. |
| onChange           | `(value: number[]) => void`                          | no       | Fires on every thumb move.                                           |
| onChangeEnd        | `(value: number[]) => void`                          | no       | Fires when a thumb is released.                                      |

**Canonical usage**
```tsx
// Price range filter with labelled min/max
import { Form } from "@lifesg/react-design-system/form";

<Form.RangeSlider
  label="Price range"
  min={0}
  max={1000}
  step={10}
  value={[priceMin, priceMax]}
  showSliderLabels
  sliderLabelPrefix="$"
  showIndicatorLabel
  onChange={([min, max]) => setPriceRange([min, max])}
/>
```

**Figma mapping hints**
| Figma element / layer pattern            | Map to             | Condition                                      |
| ---------------------------------------- | ------------------ | ---------------------------------------------- |
| Range slider with two draggable handles  | `Form.RangeSlider` | Default `numOfThumbs=2`                        |
| Range slider with three handles          | `Form.RangeSlider` | Set `numOfThumbs=3`                            |
| Price / distance range filter with label | `Form.RangeSlider` | Set `sliderLabelPrefix` or `sliderLabelSuffix` |

**Composition patterns**
- Use standalone `InputRangeSlider` (`@lifesg/react-design-system/input-range-slider`) when building a custom form layout without the `Form` wrapper.

---

### Form.Select (InputSelect)

**Import**:
`import { InputSelect } from "@lifesg/react-design-system/input-select"`
or via `import { Form } from "@lifesg/react-design-system/form"` as
`<Form.Select />`

**Category**: Form

**Decision rule**
> Use `Form.Select` (or `InputSelect` standalone) when the Figma frame shows
> a dropdown selector that picks one option from a list — use
> `Form.MultiSelect` when multiple items can be selected simultaneously.

**When to use**
- Any single-select dropdown in a form where options are an array of objects.
- Dropdowns with async-loaded options (use `optionsLoadState` to show
  loading/error states).
- Searchable selects where the user can type to filter options.

**When NOT to use**
| Situation                                            | Use instead                                                                |
| ---------------------------------------------------- | -------------------------------------------------------------------------- |
| Multiple items can be selected simultaneously        | `Form.MultiSelect` from `@lifesg/react-design-system/input-multi-select`   |
| Options are hierarchical / nested categories         | `Form.NestedSelect` from `@lifesg/react-design-system/input-nested-select` |
| Mutually exclusive group of 2–4 options shown inline | `RadioButton` (more scannable for small option sets)                       |

**Key props**
| Prop             | Type                                   | Required | Notes                                                                                                        |
| ---------------- | -------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------ |
| options          | `T[]`                                  | yes      | Array of option objects. Shape is generic — use `valueExtractor` and `listExtractor` to derive display text. |
| selectedOption   | `T`                                    | no       | Controlled selected item. Pass the full option object, not just the value.                                   |
| valueExtractor   | `(item: T) => V`                       | no       | Derives the machine value from an option object (e.g. `(o) => o.id`).                                        |
| listExtractor    | `(item: T) => string`                  | no       | Derives the display label for each option in the dropdown list (e.g. `(o) => o.label`).                      |
| placeholder      | `string`                               | no       | Hint text shown when no option is selected.                                                                  |
| disabled         | `boolean`                              | no       | Disables the select control.                                                                                 |
| error            | `boolean`                              | no       | Applies error state styling (red border).                                                                    |
| enableSearch     | `boolean`                              | no       | Renders a search input inside the dropdown to filter options.                                                |
| searchFunction   | `(searchValue: string) => T[]`         | no       | Custom filter function. If omitted, built-in label matching is used.                                         |
| optionsLoadState | `"loading"` \| `"fail"` \| `"success"` | no       | Shows a loading spinner or retry button when options are fetched asynchronously.                             |
| variant          | `"default"` \| `"small"`               | no       | Visual size of the dropdown control. Defaults to `"default"`.                                                |
| data-testid      | `string`                               | no       | Test selector on the select control.                                                                         |

**Canonical usage**
```tsx
// Standalone InputSelect with object options
import { InputSelect } from "@lifesg/react-design-system/input-select";

const options = [
  { id: "sg", label: "Singapore" },
  { id: "my", label: "Malaysia" },
];

<InputSelect
  options={options}
  selectedOption={selected}
  valueExtractor={(o) => o.id}
  listExtractor={(o) => o.label}
  placeholder="Select a country"
  onSelectOption={(option, value) => setSelected(option)}
  data-testid="country-select"
/>

// Searchable select
<InputSelect
  options={options}
  selectedOption={selected}
  valueExtractor={(o) => o.id}
  listExtractor={(o) => o.label}
  enableSearch
  placeholder="Search and select"
  onSelectOption={(option, value) => setSelected(option)}
/>
```

**Figma mapping hints**
| Figma element / layer pattern             | Map to        | Condition                                           |
| ----------------------------------------- | ------------- | --------------------------------------------------- |
| Dropdown / select field with label        | `Form.Select` | Use inside `Form` wrapper for label + error message |
| Dropdown select (standalone, no label)    | `InputSelect` | Direct usage without `Form` wrapper                 |
| Searchable dropdown / autocomplete select | `InputSelect` | Set `enableSearch={true}`                           |
| Dropdown with async-loaded options        | `InputSelect` | Set `optionsLoadState` based on fetch state         |

**Composition patterns**
- Use via `Form.Select` (from `@lifesg/react-design-system/form`) to get a
  label and `errorMessage` prop automatically.
- Pair with `optionsLoadState="loading"` and retry handling (`onRetry`) for
  API-driven option lists.

**Known limitations**
- `valueExtractor` and `listExtractor` are required in practice when options
  are objects — without them the component cannot display meaningful labels.
- No built-in multi-line option rendering — use `renderListItem` for custom
  option layouts.

---

### Form.SelectHistogram

**Import**: `import { Form } from "@lifesg/react-design-system/form"` →
`<Form.SelectHistogram />`
*(or standalone:
`import { SelectHistogram } from "@lifesg/react-design-system/select-histogram"`)*

**Category**: Form

**Decision rule**
> Use `Form.SelectHistogram` when the Figma design shows a **dropdown field**
> where the user opens a panel to see a histogram and select a numeric range —
> the histogram is hidden until the user interacts with the trigger.

**When to use**
- Compact filter areas where the histogram should only appear on demand.
- Dropdown-style range picker that shows distribution data inside the panel.

**When NOT to use**
| Situation                                       | Use instead            | Reason                            |
| ----------------------------------------------- | ---------------------- | --------------------------------- |
| Histogram is always visible on the page         | `Form.HistogramSlider` | Inline histogram without dropdown |
| Range selection with no histogram visualisation | `Form.RangeSlider`     | Simpler two-thumb slider          |

**Key props**
| Prop               | Type                         | Notes                                                                        |
| ------------------ | ---------------------------- | ---------------------------------------------------------------------------- |
| `histogramSlider`  | `SelectHistogramSliderProps` | Required. Contains `bins` (`HistogramBinProps[]`) and `interval` (`number`). |
| `value`            | `[number, number]`           | Controlled selected range                                                    |
| `placeholder`      | `string`                     | Trigger display text when no value is selected                               |
| `rangeLabelPrefix` | `string`                     | Prepended to range display in the trigger                                    |
| `rangeLabelSuffix` | `string`                     | Appended to range display in the trigger                                     |
| `renderRangeLabel` | `function`                   | Custom render function for the selected range label                          |
| `disabled`         | `boolean`                    | Disables the dropdown trigger                                                |
| `readOnly`         | `boolean`                    | Shows current value without allowing change                                  |
| `error`            | `boolean`                    | Applies error styling to the trigger                                         |
| `alignment`        | `"left" \| "right"`          | Alignment of the dropdown panel relative to the trigger                      |
| `dropdownZIndex`   | `number`                     | Z-index for the dropdown panel (for stacking context control)                |

**Composition patterns**
- Pass `histogramSlider.bins` from server-side distribution data and
  `histogramSlider.interval` matching the bin width used in the query.
- Use `renderEmptyView` inside `histogramSlider` to handle zero-data states.

---

### Form.Slider (InputSlider)

**Import**: `import { Form } from "@lifesg/react-design-system/form"` *(or standalone: `import { InputSlider } from "@lifesg/react-design-system/input-slider"`)*

**Category**: Form

**Decision rule**
> Use `Form.Slider` for a labelled **single-value numeric slider** — use `Form.RangeSlider` when two or more values (a range) are needed.

**When to use**
- Any single numeric value that maps naturally to a drag gesture (volume, zoom level, item count).
- Cases where a designer shows a single-thumb draggable track alongside a form label and error state.

**When NOT to use**
| Situation                              | Use instead                                                |
| -------------------------------------- | ---------------------------------------------------------- |
| Two-thumb range selection              | `Form.RangeSlider` from `@lifesg/react-design-system/form` |
| Text entry for a precise numeric value | `Form.Input` from `@lifesg/react-design-system/form`       |

**Key props**
| Prop                 | Type                                                 | Required | Notes                                                       |
| -------------------- | ---------------------------------------------------- | -------- | ----------------------------------------------------------- |
| value                | `number`                                             | no       | Current slider value.                                       |
| min                  | `number`                                             | no       | Start of the range. Defaults to `0`.                        |
| max                  | `number`                                             | no       | End of the range. Defaults to `100`.                        |
| step                 | `number`                                             | no       | Interval between values. Defaults to `1`.                   |
| disabled             | `boolean`                                            | no       | Disables all interaction.                                   |
| readOnly             | `boolean`                                            | no       | Renders in read-only state.                                 |
| colors               | `(string \| ((props: ThemeStyleProps) => string))[]` | no       | Track colours as `[leftTrack, rightTrack]`.                 |
| showSliderLabels     | `boolean`                                            | no       | Shows min and max labels at the track ends.                 |
| sliderLabelPrefix    | `string`                                             | no       | Text prepended to the min/max labels.                       |
| sliderLabelSuffix    | `string`                                             | no       | Text appended to the min/max labels.                        |
| showIndicatorLabel   | `boolean`                                            | no       | Shows a label above the thumb indicating the current value. |
| indicatorLabelPrefix | `string`                                             | no       | Prefix for the indicator label.                             |
| indicatorLabelSuffix | `string`                                             | no       | Suffix for the indicator label.                             |
| renderSliderLabel    | `(value: number) => React.ReactNode`                 | no       | Custom renderer for the min/max labels.                     |
| ariaLabel            | `string`                                             | no       | Screen-reader label for the thumb.                          |
| onChange             | `(value: number) => void`                            | no       | Fires on every thumb move.                                  |
| onChangeEnd          | `(value: number) => void`                            | no       | Fires when the thumb is released.                           |

**Canonical usage**
```tsx
// Photo count picker with unit suffix
import { Form } from "@lifesg/react-design-system/form";

<Form.Slider
  label="Max photos"
  min={1}
  max={10}
  step={1}
  value={photoCount}
  showSliderLabels
  sliderLabelSuffix=" photos"
  showIndicatorLabel
  onChange={(val) => setPhotoCount(val)}
/>
```

**Figma mapping hints**
| Figma element / layer pattern              | Map to        | Condition                                           |
| ------------------------------------------ | ------------- | --------------------------------------------------- |
| Single-thumb draggable track with label    | `Form.Slider` | Standard labelled single-value control              |
| Slider with custom coloured track segments | `Form.Slider` | Set `colors` as `[leftTrackColor, rightTrackColor]` |
| Slider showing current value above thumb   | `Form.Slider` | Set `showIndicatorLabel={true}`                     |

**Composition patterns**
- Use standalone `InputSlider` (`@lifesg/react-design-system/input-slider`) when rendering without the `Form` label wrapper.

---

### Form.Timepicker

**Import**:
`import { Form } from "@lifesg/react-design-system/form"` *(or standalone:
`import { Timepicker } from "@lifesg/react-design-system/timepicker"`)*

**Category**: Form

**Decision rule**
> Use `Form.Timepicker` when the user must enter/select a time value (12hr or
> 24hr) in a labelled form field.

**When to use**
- Appointment, slot, or cut-off-time fields where users pick a time via
  dropdown selector.
- Forms requiring explicit 12-hour (`AM/PM`) or 24-hour time format support.

**When NOT to use**
| Situation                                      | Use instead                               |
| ---------------------------------------------- | ----------------------------------------- |
| Field captures a date or date range            | `Form.DateInput` or `Form.DateRangeInput` |
| User picks from predefined textual time labels | `Form.Select`                             |

**Key props**
| Prop           | Type                        | Required | Notes                                                         |
| -------------- | --------------------------- | -------- | ------------------------------------------------------------- |
| label          | `string \| FormLabelProps`  | no       | Label above the field with optional tooltip/popover addon.    |
| value          | `string`                    | no       | Time value (`"hh:mm"` for 24hr, `"hh:mmA"` for 12hr).         |
| format         | `"12hr" \| "24hr"`          | no       | Time format. Defaults to `"24hr"`.                            |
| placeholder    | `string`                    | no       | Placeholder text in the field.                                |
| disabled       | `boolean`                   | no       | Disables entry and selection.                                 |
| readOnly       | `boolean`                   | no       | Displays value without allowing changes.                      |
| errorMessage   | `string \| React.ReactNode` | no       | Validation message shown below the field.                     |
| alignment      | `"left" \| "right"`         | no       | Dropdown alignment relative to field. Defaults to `"left"`.   |
| dropdownZIndex | `number`                    | no       | Custom popover z-index when overlay stacking conflicts occur. |
| onChange       | `(value: string) => void`   | no       | Called on confirm from time selection panel.                  |

**Canonical usage**
```tsx
// Labelled time field in 12-hour format
import { Form } from "@lifesg/react-design-system/form";

<Form.Timepicker
  label="Preferred callback time"
  format="12hr"
  value={timeValue}
  onChange={setTimeValue}
  errorMessage={errors.time}
/>
```

**Figma mapping hints**
| Figma element / layer pattern              | Map to            | Condition                                       |
| ------------------------------------------ | ----------------- | ----------------------------------------------- |
| Time picker field with dropdown clock list | `Form.Timepicker` | Labelled form field for selecting a time value. |
| 12-hour time field with AM/PM              | `Form.Timepicker` | Set `format="12hr"`.                            |
| Standalone time selector without label     | `Timepicker`      | Use standalone import from `timepicker`.        |

**Composition patterns**
- Use `dropdownRootNode`/`dropdownZIndex` when rendered inside modal/overlay
  containers with competing stacking contexts.

---

### Form.TimeRangePicker

**Import**: `import { Form } from "@lifesg/react-design-system/form"` *(or standalone: `import { TimeRangePicker } from "@lifesg/react-design-system/time-range-picker"`)*

**Category**: Form

**Decision rule**
> Use `Form.TimeRangePicker` when the Figma design shows a **labelled start-time + end-time pair** — use `Form.Timepicker` for a single time value.

**When to use**
- Booking forms where users define a meeting, appointment, or shift with a start and end time.
- Search/filter panels collecting an operating-hours window.

**When NOT to use**
| Situation                           | Use instead                                                     |
| ----------------------------------- | --------------------------------------------------------------- |
| Single time value only              | `Form.Timepicker` from `@lifesg/react-design-system/timepicker` |
| Date + time in one combined control | Pair `Form.DateInput` with `Form.Timepicker`                    |

**Key props**
| Prop             | Type                           | Required | Notes                                                                                             |
| ---------------- | ------------------------------ | -------- | ------------------------------------------------------------------------------------------------- |
| value            | `TimeRangePickerValue`         | no       | Object with `start` and `end` time strings; format depends on `format` and `variant`.             |
| variant          | `"dial" \| "combobox"`         | no       | `"dial"` uses a clock picker; `"combobox"` uses a dropdown with text entry. Defaults to `"dial"`. |
| format           | `"12hr" \| "24hr"`             | no       | Time display format. Defaults to `"24hr"`.                                                        |
| disabled         | `boolean`                      | no       | Disables all input.                                                                               |
| readOnly         | `boolean`                      | no       | Renders a read-only display.                                                                      |
| error            | `boolean`                      | no       | Applies error state styling (use when `errorMessage` is not needed).                              |
| alignment        | `"left" \| "right"`            | no       | Aligns the dropdown popover to the field. Defaults to `"left"`.                                   |
| dropdownZIndex   | `number`                       | no       | Custom z-index for the dropdown. Defaults to `50`; increase inside a modal.                       |
| dropdownRootNode | `React.RefObject<HTMLElement>` | no       | Portal root for the dropdown — use when parent has a higher z-index than the popover.             |

**Type-specific requirements**
| Variant      | Extra prop   | Notes                                                   |
| ------------ | ------------ | ------------------------------------------------------- |
| `"combobox"` | `startLimit` | Sets the earliest time shown in the dropdown list.      |
| `"combobox"` | `endLimit`   | Sets the latest time shown in the dropdown list.        |
| `"combobox"` | `interval`   | Minutes between each dropdown option. Defaults to `15`. |

**Canonical usage**
```tsx
// 24hr dial time range picker
import { Form } from "@lifesg/react-design-system/form";

<Form.TimeRangePicker
  label="Meeting time"
  format="24hr"
  value={{ start: "09:00", end: "10:00" }}
  onChange={(val) => setTimeRange(val)}
/>

// Combobox variant with 30-min intervals and limits
<Form.TimeRangePicker
  label="Operating hours"
  variant="combobox"
  format="24hr"
  interval={30}
  startLimit="08:00"
  endLimit="20:00"
  value={operatingHours}
  onChange={(val) => setOperatingHours(val)}
/>
```

**Figma mapping hints**
| Figma element / layer pattern               | Map to                 | Condition                                |
| ------------------------------------------- | ---------------------- | ---------------------------------------- |
| Start time + end time field pair with label | `Form.TimeRangePicker` | Two time inputs collected as one control |
| Time range with dropdown selection list     | `Form.TimeRangePicker` | Set `variant="combobox"`                 |
| Time range in 12-hour format                | `Form.TimeRangePicker` | Set `format="12hr"`                      |

**Composition patterns**
- Use `dropdownRootNode`/`dropdownZIndex` when rendered inside `ModalV2` or `Drawer` to avoid z-index clipping.

---

### Form.UnitNumberInput

**Import**:
`import { Form } from "@lifesg/react-design-system/form"` *(or standalone:
`import { UnitNumberInput } from "@lifesg/react-design-system/unit-number"`)*

**Category**: Form

**Decision rule**
> Use `Form.UnitNumberInput` when users enter Singapore-style unit values in
> floor-unit format with built-in formatting behavior.

**When to use**
- Address forms requiring unit capture in `floor-unit` format (for example
  `12-345`).
- Inputs where formatted and raw floor/unit values are both needed.

**When NOT to use**
| Situation                                      | Use instead   |
| ---------------------------------------------- | ------------- |
| Generic free-text address line input           | `Form.Input`  |
| Structured address from authoritative picklist | `Form.Select` |

**Key props**
| Prop        | Type                        | Required | Notes                                                      |
| ----------- | --------------------------- | -------- | ---------------------------------------------------------- |
| value       | `string`                    | no       | Unit value in string format (e.g. `00-8888`).              |
| placeholder | `string`                    | no       | Placeholder format hint; recommended `00-8888`.            |
| disabled    | `boolean`                   | no       | Disables entry.                                            |
| readOnly    | `boolean`                   | no       | Shows value without allowing entry changes.                |
| error       | `boolean`                   | no       | Applies error state when `errorMessage` is not provided.   |
| onChange    | `(value: string) => void`   | no       | Returns formatted value string during input.               |
| onChangeRaw | `(value: string[]) => void` | no       | Returns raw `[floor, unit]` values regardless of validity. |
| onBlur      | `(value: string) => void`   | no       | Returns normalized format on defocus.                      |
| onBlurRaw   | `(value: string[]) => void` | no       | Returns raw `[floor, unit]` values on defocus.             |

**Canonical usage**
```tsx
// Unit number field for address forms
import { Form } from "@lifesg/react-design-system/form";

<Form.UnitNumberInput
  label="Unit number"
  value={unitNumber}
  placeholder="00-8888"
  onChange={setUnitNumber}
  onChangeRaw={setUnitSegments}
  errorMessage={errors.unitNumber}
/>
```

**Figma mapping hints**
| Figma element / layer pattern              | Map to                 | Condition                                    |
| ------------------------------------------ | ---------------------- | -------------------------------------------- |
| Address unit input split by hash and dash  | `Form.UnitNumberInput` | Use for floor-unit formatted entry patterns. |
| Unit field with readonly formatted display | `Form.UnitNumberInput` | Use `readOnly` with prefilled value.         |

**Composition patterns**
- Use standalone `UnitNumberInput` import when label/error wrapper props are
  not required.

**Known limitations**
- Storybook explicitly notes this field does not fully validate semantic unit
  number correctness.

---

### Form.Textarea

**Import**:
`import { Textarea } from "@lifesg/react-design-system/input-textarea"`
or via `import { Form } from "@lifesg/react-design-system/form"` as
`<Form.Textarea />`

**Category**: Form

**Decision rule**
> Use `Form.Textarea` when the Figma frame shows a multi-line text input
> field — use `Form.Input` for all single-line fields.

**When to use**
- Multi-line free-text responses such as comments, descriptions, or notes.
- When the user is expected to enter more than one line of content.

**When NOT to use**
| Situation                                | Use instead                                                   |
| ---------------------------------------- | ------------------------------------------------------------- |
| Single-line text entry                   | `Form.Input`                                                  |
| Selecting one value from a list          | `Form.Select` from `@lifesg/react-design-system/input-select` |
| Rich formatted text (bold, lists, links) | Custom — no FDS component (see Known FDS Gaps)                |

**Key props**
| Prop                | Type                                                             | Required | Notes                                                                                   |
| ------------------- | ---------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------- |
| label               | `string` \| `FormLabelProps`                                     | no       | Label above the field. Pass `FormLabelProps` to add a tooltip/popover addon.            |
| errorMessage        | `string` \| `React.ReactNode`                                    | no       | Error text shown below the field. Also triggers red border styling.                     |
| error               | `boolean`                                                        | no       | Applies error state styling when no `errorMessage` is set.                              |
| prefix              | `string`                                                         | no       | Fixed non-editable text prepended to the first line. Does not count toward `maxLength`. |
| renderCustomCounter | `(maxLength: number, currentValueLength: number) => JSX.Element` | no       | Replaces the default "N characters left" counter with a custom render function.         |
| transformValue      | `(value: string) => string`                                      | no       | Formats or sanitises the value on each keystroke (e.g. strip special characters).       |
| maxLength           | `number`                                                         | no       | Inherited from `HTMLTextareaElement`. Enables the character counter when set.           |
| placeholder         | `string`                                                         | no       | Hint text shown when the field is empty — from `HTMLTextareaElement`.                   |
| disabled            | `boolean`                                                        | no       | Disables the field — from `HTMLTextareaElement`.                                        |
| readOnly            | `boolean`                                                        | no       | Makes the field read-only — from `HTMLTextareaElement`.                                 |
| data-testid         | `string`                                                         | no       | Test selector on the textarea element.                                                  |
| data-error-testid   | `string`                                                         | no       | Test selector on the error message element.                                             |

**Canonical usage**
```tsx
// Labelled textarea with character counter and error state
import { Form } from "@lifesg/react-design-system/form";

<Form.Textarea
  label="Description"
  placeholder="Enter a description"
  maxLength={100}
  errorMessage={errors.description}
  data-testid="description-textarea"
/>
```

**Figma mapping hints**
| Figma element / layer pattern         | Map to          | Condition                                           |
| ------------------------------------- | --------------- | --------------------------------------------------- |
| Multi-line text area / textarea field | `Form.Textarea` | Any textarea with a visible label above it          |
| Textarea (standalone, no label)       | `Textarea`      | Use standalone import from `input-textarea`         |
| Textarea with character counter       | `Form.Textarea` | Set `maxLength` to the limit shown in the design    |
| Textarea with prefix line             | `Form.Textarea` | Set `prefix` to the fixed non-editable leading text |

**Known limitations**
- No built-in auto-resize — height does not grow with content by default;
  requires custom CSS or a third-party wrapper.
