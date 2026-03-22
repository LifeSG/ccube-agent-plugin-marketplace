> This file covers **component → Figma mapping** only.
> For token usage (Colour, Spacing, Font), see `resources/foundations-tokens.md`.
> For project setup, ThemeProvider, and theme presets, see `resources/theme-setup.md`.

---

## Typography

> Text rendering components for headings, body copy, and hyperlinks. Scan this section whenever the Figma frame contains any text layer that must match the FDS type scale.

### Typography

**Import**: `import { Typography } from "@lifesg/react-design-system/typography"`

**Category**: Typography

**Decision rule**
> Use `Typography.*` for ALL text rendering — never use raw `<h1>`–`<h6>` or `<p>` tags when FDS is available; every text layer in Figma maps to a specific `Typography.*` sub-component.

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
<Typography.BodyMD paragraph>This is the introductory paragraph text.</Typography.BodyMD>

{/* Semibold label */}
<Typography.BodySM weight="semibold">Reference number</Typography.BodySM>

{/* Truncated text */}
<Typography.BodyMD maxLines={2}>Long text that will be cut off after two lines...</Typography.BodyMD>

{/* Hyperlink with external indicator */}
<Typography.LinkMD href="https://example.gov.sg" external>Visit portal</Typography.LinkMD>
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
- `Typography.*` components are styled-components and cannot be extended with `as` prop to change the underlying HTML element; use `className` overrides only.

---

## Figma → FDS Quick Lookup

> Scan this table first. Find the Figma element type or layer name pattern, then jump to the named component entry for full props and usage details.

| Figma element / layer pattern                      | FDS Component    | Notes                                                            |
| -------------------------------------------------- | ---------------- | ---------------------------------------------------------------- |
| Filter bar / search box (no label)                 | `Input`          | Use `styleType="no-border"`                                      |
| Tel / phone field (standalone, no label)           | `Input`          | Use `type="tel"` and `spacing` prop                              |
| Text field with error state, no label              | `Input`          | Set `error={true}`                                               |
| Text field with label                              | `Form.Input`     | Default choice for any labelled single-line input                |
| Text field with label + tooltip icon               | `Form.Input`     | Pass `label` as `FormLabelProps` with `addon`                    |
| Text field in multi-column form grid               | `Form.Input`     | Add `layoutType="grid"` and col span props                       |
| Button — text only, any size or style              | `Button`         | Use `.Default`, `.Small`, or `.Large` sub-component              |
| Button — text + icon                               | `ButtonWithIcon` | Pass an `icon` JSX element and optional `iconPosition`           |
| Button — icon only, no visible text label          | `IconButton`     | Use `IconButton` from `@lifesg/react-design-system/icon-button`  |
| Destructive action button (delete, remove, cancel) | `Button`         | Add `danger={true}` to any `Button.*` variant                    |
| Button showing async loading state                 | `Button`         | Add `loading={true}` to any `Button.*` variant                   |
| Confirmation dialog / alert dialog                 | `ModalV2`        | Compose with `ModalV2.Card`, `ModalV2.Content`, `ModalV2.Footer` |
| Dialog with header, content, action buttons        | `ModalV2`        | Use `ModalV2.CloseButton` + `ModalV2.Footer` with button slots   |
| Bottom sheet that slides up                        | `ModalV2`        | Set `animationFrom="bottom"`                                     |
| Slide-in side panel (right or left)                | `ModalV2`        | Set `animationFrom="right"` or `animationFrom="left"`            |
| Modal footer with primary + secondary buttons      | `ModalV2.Footer` | Pass `primaryButton` and `secondaryButton` as `Button.*` nodes   |
| Accordion / collapsible section group              | `Accordion`      | Use `Accordion.Item` for each collapsible row                    |
| Single collapsible row (standalone, no group)      | `Accordion.Item` | Set `collapsible={true}` for always-visible non-collapsible rows |
| FAQ list / expandable Q&A items                    | `Accordion`      | Set `enableExpandAll` to show a Show All / Hide All control      |
| Card surface / elevated container                  | `Card`           | Any `<div>` with elevated shadow or rounded border in Figma      |
| Heading text (H1–H6)                               | `Typography`     | Use `Typography.HeadingXXL` → `Typography.HeadingXS` variants    |
| Body / paragraph text                              | `Typography`     | Use `Typography.BodyBL` → `Typography.BodyXS` variants           |
| Hyperlink / anchor                                 | `Typography`     | Use `Typography.LinkBL` → `Typography.LinkXS` variants           |
| Checkbox (single or group)                         | `Checkbox`       | Use `checked` + `indeterminate` for all selection states         |
| Indeterminate / partial select checkbox            | `Checkbox`       | Set `indeterminate={true}`                                       |
| Radio button / single-select option circle         | `RadioButton`    | Use `checked` + `name` to form a mutually exclusive group        |
| Dropdown / select field with label                 | `Form.Select`    | Wraps `InputSelect` with label and error message                 |
| Dropdown select (standalone, no label)             | `InputSelect`    | Use `valueExtractor` + `listExtractor` to map option objects     |
| Searchable dropdown / autocomplete select          | `InputSelect`    | Set `enableSearch={true}` and optionally `searchFunction`        |
| Alert banner (success, error, warning, info)       | `Alert`          | Set `type` to `"success"`, `"error"`, `"warning"`, or `"info"`   |
| Description / informational callout box            | `Alert`          | Set `type="description"`                                         |

---

## Button

> Action trigger controls. Scan this section when the Figma frame contains a button, CTA, or icon trigger.

### Button

**Import**: `import { Button } from "@lifesg/react-design-system/button"`

**Category**: Button

**Decision rule**
> Use `Button` when the Figma frame shows a button with **text only and no icon** — if the button has an icon alongside text use `ButtonWithIcon`; if it shows an icon with no visible text label use `IconButton`.

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
| ----------------------------------------- | ---------------- | ----------------------------------- |
| Primary / filled CTA button (text only)   | `Button.Default` | `styleType` defaults to `"default"` |
| Secondary / outlined button (text only)   | `Button.Default` | Set `styleType="secondary"`         |
| Ghost / light button (text only)          | `Button.Default` | Set `styleType="light"`             |
| Link-style button (text only, borderless) | `Button.Default` | Set `styleType="link"`              |
| Small button (text only)                  | `Button.Small`   | Any `styleType` available           |
| Large button (text only)                  | `Button.Large`   | Any `styleType` available           |
| Red / destructive button                  | `Button.Default` | Add `danger={true}`                 |
| Button with spinner / loading state       | `Button.Default` | Add `loading={true}`                |

**Composition patterns**
- Pair with `ButtonWithIcon` (`@lifesg/react-design-system/button-with-icon`) in the same button group when some actions need an icon and others do not — they share the same `styleType` API.
---

## Form

> Single-value and multi-value user input controls rendered inside forms. Scan this section when the Figma frame contains a text input, select, date picker, or any field that accepts user data.

### Checkbox

**Import**: `import { Checkbox } from "@lifesg/react-design-system/checkbox"`

**Category**: Form

**Decision rule**
> Use `Checkbox` when the Figma frame shows a square tick-box selection control — use `RadioButton` for mutually exclusive single-select options shown as circles.

**When to use**
- Any multi-select option group where zero or more items can be selected simultaneously.
- A single opt-in toggle (e.g. "I agree to the terms") that needs a checkbox UI rather than a toggle switch.

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
```tsx
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
- No built-in label or error message — wrap with a `<label>` element and handle error display manually.

---

### Form.Select (InputSelect)

**Import**: `import { InputSelect } from "@lifesg/react-design-system/input-select"` or via `import { Form } from "@lifesg/react-design-system/form"` as `<Form.Select />`

**Category**: Form

**Decision rule**
> Use `Form.Select` (or `InputSelect` standalone) when the Figma frame shows a dropdown selector that picks one option from a list — use `Form.MultiSelect` when multiple items can be selected simultaneously.

**When to use**
- Any single-select dropdown in a form where options are an array of objects.
- Dropdowns with async-loaded options (use `optionsLoadState` to show loading/error states).
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
- Use via `Form.Select` (from `@lifesg/react-design-system/form`) to get a label and `errorMessage` prop automatically.
- Pair with `optionsLoadState="loading"` and retry handling (`onRetry`) for API-driven option lists.

**Known limitations**
- `valueExtractor` and `listExtractor` are required in practice when options are objects — without them the component cannot display meaningful labels.
- No built-in multi-line option rendering — use `renderListItem` for custom option layouts.

---

### RadioButton

**Import**: `import { RadioButton } from "@lifesg/react-design-system/radio-button"`

**Category**: Form

**Decision rule**
> Use `RadioButton` when the Figma frame shows circular single-select option controls where exactly one option must be chosen — use `Checkbox` for square tick-box controls where zero or more options can be selected.

**When to use**
- Mutually exclusive option groups where only one choice is valid at a time (e.g. gender, payment method, delivery type).
- 2–4 options that benefit from being scannable side-by-side rather than hidden in a dropdown.

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
- No built-in label or error message — wrap each radio in a `<label>` and use a `<fieldset>` + `<legend>` for group semantics.


**Import**: `import { Input } from "@lifesg/react-design-system/input"`

**Category**: Form

**Decision rule**
> Use `Input` when the Figma frame shows a single-line text field with NO visible label — otherwise use `Form.Input`.

**When to use**
- Standalone inline input without a label (e.g. search bar, filter chip, inline edit).
- Building a custom form layout where you control your own `<label>` and error display.

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
- Wrap in `InputGroup` (`@lifesg/react-design-system/input-group`) to add prefix icons, suffix icons, or unit labels.
- Pair with `Form.Label` and an error `<span>` when building a fully custom labelled field without `Form.Input`.

---

### Form.Input

**Import**: `import { Form } from "@lifesg/react-design-system/form"` → `<Form.Input />`

**Category**: Form

**Decision rule**
> Use `Form.Input` whenever the Figma frame shows a single-line text field WITH a visible label — it is the default choice for all standard labelled form fields.

**When to use**
- Any labelled single-line free-text input in a form.
- When the design shows a label above the field and an optional error message below.

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
- Use inside a `Layout` grid (`@lifesg/react-design-system/layout`) with `layoutType="grid"` and col span props for responsive multi-column forms.
- Use `Form.CustomField` wrapping `InputGroup` instead when prefix/suffix addons are required.

**Known limitations**
- No built-in character counter — add one manually below the field.
- Prefix/suffix addons not supported — use `Input` inside `Form.CustomField` + `InputGroup` instead.

---

## Feedback & Overlays

> Dialogs, overlays, notifications, and loading states. Scan this section when the Figma frame shows a modal, alert, banner, or any UI that renders above the page content.

### Alert

**Import**: `import { Alert } from "@lifesg/react-design-system/alert"`

**Category**: Feedback & Overlays

**Decision rule**
> Use `Alert` when the Figma frame shows an inline coloured banner conveying status (success, error, warning, info, or description) — use `NotificationBanner` for full-width page-level banners or `Toast` for transient dismissable pop-ups.

**When to use**
- Inline form validation summaries (error type) shown above or below a form.
- Status messages after an action (success or warning) that remain visible on the page.
- Informational callout boxes (description type) that provide contextual guidance.

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

### Modal (Legacy)

**Import**: `import { Modal, ModalBox } from "@lifesg/react-design-system/modal"`

**Category**: Feedback & Overlays

**Decision rule**
> Prefer `ModalV2` for all new implementations — `Modal` is the legacy API; only use it when maintaining existing code that already uses `Modal` + `ModalBox`.

**When NOT to use**
| Situation                         | Use instead                                           |
| --------------------------------- | ----------------------------------------------------- |
| Any new dialog or overlay feature | `ModalV2` from `@lifesg/react-design-system/modal-v2` |

**Key props (Modal)**
| Prop               | Type                                           | Required | Notes                                                      |
| ------------------ | ---------------------------------------------- | -------- | ---------------------------------------------------------- |
| show               | `boolean`                                      | yes      | Controls visibility.                                       |
| animationFrom      | `"top"` \| `"bottom"` \| `"left"` \| `"right"` | no       | Slide-in direction for open/close animation.               |
| enableOverlayClick | `boolean`                                      | no       | If `true`, clicking the backdrop fires `onOverlayClick`.   |
| rootComponentId    | `string`                                       | no       | ID of element to portal into. Defaults to `document.body`. |
| zIndex             | `number`                                       | no       | Overrides default z-index.                                 |

**Key props (ModalBox)**
| Prop            | Type         | Required | Notes                                      |
| --------------- | ------------ | -------- | ------------------------------------------ |
| showCloseButton | `boolean`    | no       | Renders the × close button inside the box. |
| onClose         | `() => void` | no       | Fired when the × button is clicked.        |

**Canonical usage**
```tsx
// Legacy API — prefer ModalV2 for new code
import { Modal, ModalBox } from "@lifesg/react-design-system/modal";

<Modal show={isOpen} enableOverlayClick onOverlayClick={() => setIsOpen(false)}>
  <ModalBox showCloseButton onClose={() => setIsOpen(false)}>
    <p>Modal content here</p>
  </ModalBox>
</Modal>
```

---

### ModalV2

**Import**: `import { ModalV2 } from "@lifesg/react-design-system/modal-v2"`

**Category**: Feedback & Overlays

**Decision rule**
> Use `ModalV2` for all new overlay/dialog implementations — it provides structured slots (`ModalV2.Card`, `ModalV2.Content`, `ModalV2.Footer`) and supersedes the legacy `Modal` + `ModalBox` API.

**When to use**
- Any dialog, confirmation, alert, or modal overlay in a Figma frame.
- Bottom sheets (`animationFrom="bottom"`) or side panels (`animationFrom="right"`) that overlay the full viewport.

**When NOT to use**
| Situation                                          | Use instead                                                   |
| -------------------------------------------------- | ------------------------------------------------------------- |
| Persistent side panel coexisting with page content | `Drawer` from `@lifesg/react-design-system/drawer`            |
| Inline tooltip or contextual popover               | `PopoverInline` from `@lifesg/react-design-system/popover-v2` |
| Maintaining legacy modal code                      | `Modal` from `@lifesg/react-design-system/modal`              |

**Key props (ModalV2)**
| Prop                  | Type                                           | Required | Notes                                                                  |
| --------------------- | ---------------------------------------------- | -------- | ---------------------------------------------------------------------- |
| show                  | `boolean`                                      | yes      | Controls whether the modal is visible.                                 |
| animationFrom         | `"top"` \| `"bottom"` \| `"left"` \| `"right"` | no       | Direction the modal slides in from.                                    |
| enableOverlayClick    | `boolean`                                      | no       | If `true`, clicking the backdrop fires `onOverlayClick`.               |
| onClose               | `() => void`                                   | no       | Called on ESC key press or `ModalV2.CloseButton` click.                |
| onOverlayClick        | `() => void`                                   | no       | Called on backdrop click. Only fires when `enableOverlayClick={true}`. |
| rootComponentId       | `string`                                       | no       | ID of element to portal into. Defaults to `document.body`.             |
| zIndex                | `number`                                       | no       | Overrides default z-index.                                             |
| dismissKeyboardOnShow | `boolean`                                      | no       | Dismisses the mobile soft keyboard when the modal opens.               |
| data-testid           | `string`                                       | no       | Test selector on the modal wrapper element.                            |

**Key props (ModalV2.Footer)**
| Prop            | Type        | Required | Notes                                     |
| --------------- | ----------- | -------- | ----------------------------------------- |
| primaryButton   | `ReactNode` | no       | Primary action — rendered right-aligned.  |
| secondaryButton | `ReactNode` | no       | Secondary action — rendered left-aligned. |

**Canonical usage**
```tsx
// Standard confirmation dialog
import { ModalV2 } from "@lifesg/react-design-system/modal-v2";
import { Button } from "@lifesg/react-design-system/button";

<ModalV2
  show={isOpen}
  onClose={() => setIsOpen(false)}
  enableOverlayClick
  onOverlayClick={() => setIsOpen(false)}
  data-testid="confirm-modal"
>
  <ModalV2.Card>
    <ModalV2.CloseButton data-testid="confirm-modal-close" />
    <ModalV2.Content>
      <p>Are you sure you want to delete this item?</p>
    </ModalV2.Content>
    <ModalV2.Footer
      primaryButton={
        <Button.Default danger onClick={handleDelete}>Delete</Button.Default>
      }
      secondaryButton={
        <Button.Default styleType="secondary" onClick={() => setIsOpen(false)}>Cancel</Button.Default>
      }
    />
  </ModalV2.Card>
</ModalV2>

// Bottom sheet variant
<ModalV2 show={isOpen} animationFrom="bottom" onClose={() => setIsOpen(false)}>
  <ModalV2.Card>
    <ModalV2.Content>{/* sheet content */}</ModalV2.Content>
  </ModalV2.Card>
</ModalV2>
```

**Figma mapping hints**
| Figma element / layer pattern                 | Map to           | Condition                                                                         |
| --------------------------------------------- | ---------------- | --------------------------------------------------------------------------------- |
| Confirmation dialog / alert dialog            | `ModalV2`        | Any full-viewport overlay with a content card                                     |
| Dialog with header, content, action buttons   | `ModalV2`        | Use `ModalV2.Card` + `ModalV2.CloseButton` + `ModalV2.Content` + `ModalV2.Footer` |
| Bottom sheet that slides up                   | `ModalV2`        | Set `animationFrom="bottom"`                                                      |
| Side panel that slides in from right          | `ModalV2`        | Set `animationFrom="right"`                                                       |
| Modal footer with primary + secondary buttons | `ModalV2.Footer` | Pass `primaryButton` and `secondaryButton` as `Button.*` nodes                    |

**Composition patterns**
- Pass `Button.Default` into `ModalV2.Footer`'s `primaryButton` and `secondaryButton` slots — they share the same `styleType` API for visual consistency.
- Use `Form.*` components inside `ModalV2.Content` for input dialogs — the modal provides the scrollable container.

**Known limitations**
- `ModalV2.Card` has no built-in title/header slot — add a heading element manually at the top of `ModalV2.Content`.

---

## Display & Data

> Static and interactive content display components. Scan this section when the Figma frame shows cards, tables, tags, accordions, timelines, or any component that presents data rather than collecting it.

### Accordion

**Import**: `import { Accordion } from "@lifesg/react-design-system/accordion"`

**Category**: Display & Data

**Decision rule**
> Use `Accordion` when the Figma frame shows one or more collapsible content sections with individual expand/collapse controls — if the Figma shows only tabs that swap visible content use `Tab`.

**When to use**
- FAQ lists, help content, or any group of expandable Q&A items.
- Multi-section forms or information pages where most sections start collapsed to reduce visual noise.

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
  <Accordion.Item title="Step 1: Personal details" expanded={true} collapsible={false}>
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
- Place `Form.*` fields inside `Accordion.Item` children for collapsible form sections in multi-step flows.
- Use `ref` on `Accordion.Item` to call `ref.current.expand()` or `ref.current.collapse()` imperatively from external controls.

---

### Card

**Import**: `import { Card } from "@lifesg/react-design-system/card"`

**Category**: Display & Data

**Decision rule**
> Use `Card` when the Figma frame shows a visually elevated container with a shadow or rounded border that groups related content — if the Figma shows a container with a collapsible header use `Accordion` instead.

**When to use**
- Any content grouping surface: summary cards, info panels, list item containers, feature tiles.
- When the Figma layer has an elevated `box-shadow` or a rounded, bordered card container.

**When NOT to use**
| Situation                                        | Use instead                                                     |
| ------------------------------------------------ | --------------------------------------------------------------- |
| Container that collapses / expands               | `Accordion` from `@lifesg/react-design-system/accordion`        |
| Bordered section with a title bar (no elevation) | `BoxContainer` from `@lifesg/react-design-system/box-container` |

**Key props**
| Prop        | Type     | Required | Notes                                      |
| ----------- | -------- | -------- | ------------------------------------------ |
| data-testid | `string` | no       | Test selector on the card wrapper element. |

> All standard `HTMLDivAttributes` (e.g. `className`, `onClick`, `style`) are also accepted.

**Canonical usage**
```tsx
// Basic elevated card container
import { Card } from "@lifesg/react-design-system/card";

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
- Nest `Typography.*` components inside `Card` for consistent heading and body text styling.
- Nest `Button.*` at the bottom of `Card` for action cards with a CTA.

---

## Known FDS Gaps

> These UI capabilities have no FDS component. When the Figma design requires one of these,
> classify the element as **Custom** in the DS Coverage Plan and note the suggested library.
>
> To add an entry here when a component is not found, run the `Add DS Component to Catalogue`
> prompt — it will automatically write a gap row if the component is missing from FDS.

| UI Capability                       | Why it is a gap                                                                           | Suggested library                                                                       |
| ----------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Charts / data visualisation         | No chart component in FDS; `data-table` covers tabular data only                          | `recharts` — use FDS `Colour` tokens for a consistent palette                           |
| Stepper / wizard progress indicator | `progress-indicator` exists for linear progress bars only; no multi-step wizard component | Build with `ProgressIndicator` for linear flows; custom with tokens for stepped wizards |
| Rich text editor                    | No WYSIWYG/RTE component in FDS                                                           | `@tiptap/react` or `react-quill` — style with FDS tokens                                |
| Drag and drop                       | No DnD primitive or sortable list component                                               | `@dnd-kit/core`                                                                         |
| Image cropper                       | No image crop or upload editor component                                                  | `react-image-crop`                                                                      |
| Map / geolocation                   | No map or location picker component                                                       | Google Maps JS API or `react-leaflet`                                                   |
| Multi-day calendar / scheduler      | `calendar/` is a date picker only; no weekly/monthly agenda view                          | `react-big-calendar` or `@fullcalendar/react` — use FDS `Colour` tokens                 |
