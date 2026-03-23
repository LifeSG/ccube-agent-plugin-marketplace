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
