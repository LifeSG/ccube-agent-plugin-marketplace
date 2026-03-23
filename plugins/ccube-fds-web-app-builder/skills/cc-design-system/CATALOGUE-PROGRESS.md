# DS Component Catalogue — Documentation Progress

Track which FDS components have been documented across the per-group catalogue
files under `resources/component-catalogue-*.md`.

| Group                | File                                                   |
| -------------------- | ------------------------------------------------------ |
| Index + quick lookup | `resources/component-catalogue.md`                     |
| Core                 | `resources/component-catalogue-core.md`                |
| Content              | `resources/component-catalogue-content.md`             |
| Selection and input  | `resources/component-catalogue-selection-input.md`     |
| Feedback indicators  | `resources/component-catalogue-feedback-indicators.md` |
| Overlays             | `resources/component-catalogue-overlays.md`            |
| Form                 | `resources/component-catalogue-form.md`                |

To add a component, run the `Add DS Component to Catalogue` prompt.
To initialise the Token Reference and Known FDS Gaps sections, run
`Initialise DS Catalogue`.

**Legend**: ✅ Documented | ⬜ Not yet documented

Groups mirror the Storybook left-hand sidebar at
https://designsystem.life.gov.sg/react/index.html

---

## Core

| Component          | Sub-path                                                       | Status |
| ------------------ | -------------------------------------------------------------- | ------ |
| Icon               | (no sub-path — use `@lifesg/react-design-system` icon exports) | ✅      |
| Typography         | `typography`                                                   | ✅      |
| Layout (grid/flex) | `layout`                                                       | ✅      |
| Layout.ColDiv      | `layout` (as `Layout.ColDiv`)                                  | ✅      |
| Divider            | `divider`                                                      | ✅      |
| Markup             | `markup`                                                       | ✅      |
| TextList           | `text-list`                                                    | ⬜      |
| ErrorDisplay       | `error-display`                                                | ⬜      |

## Content

| Component               | Sub-path                    | Status |
| ----------------------- | --------------------------- | ------ |
| Card                    | `card`                      | ✅      |
| Tab                     | `tab`                       | ✅      |
| Accordion               | `accordion`                 | ✅      |
| Table                   | `table`                     | ✅      |
| DataTable               | `data-table`                | ⬜      |
| UneditableSection       | `uneditable-section`        | ⬜      |
| BoxContainer            | `box-container`             | ⬜      |
| FullscreenImageCarousel | `fullscreen-image-carousel` | ⬜      |

## Navigation

| Component  | Sub-path     | Status |
| ---------- | ------------ | ------ |
| Breadcrumb | `breadcrumb` | ✅      |
| Navbar     | `navbar`     | ✅      |
| Pagination | `pagination` | ⬜      |
| Footer     | `footer`     | ⬜      |
| Masthead   | `masthead`   | ⬜      |
| Sidenav    | `sidenav`    | ⬜      |
| LocalNav   | `local-nav`  | ⬜      |
| LinkList   | `link-list`  | ⬜      |
| Avatar     | `avatar`     | ⬜      |

## Selection and input

| Component                          | Sub-path              | Status |
| ---------------------------------- | --------------------- | ------ |
| Button                             | `button`              | ✅      |
| Checkbox                           | `checkbox`            | ✅      |
| RadioButton                        | `radio-button`        | ✅      |
| Toggle                             | toggle                | ✅      |
| Calendar (date picker)             | `calendar`            | ✅      |
| FileUpload                         | `file-upload`         | ⬜      |
| FileDownload                       | `file-download`       | ⬜      |
| OtpInput                           | `otp-input`           | ⬜      |
| SingpassButton                     | `singpass-button`     | ⬜      |
| IconButton                         | `icon-button`         | ⬜      |
| ButtonWithIcon                     | `button-with-icon`    | ⬜      |
| Filter                             | `filter`              | ⬜      |
| Filter.Addons (FilterItemCheckbox) | `filter/addons`       | ⬜      |
| FeedbackRating                     | `feedback-rating`     | ⬜      |
| DateNavigator                      | `date-navigator`      | ⬜      |
| ImageButton                        | `image-button`        | ⬜      |
| Schedule                           | `schedule`            | ⬜      |
| TimeSlotBar                        | `time-slot-bar`       | ⬜      |
| TimeSlotBarWeek                    | `time-slot-bar-week`  | ⬜      |
| TimeSlotWeekView                   | `time-slot-week-view` | ⬜      |
| TimeTable                          | `timetable`           | ⬜      |

## Feedback indicators

| Component                                                          | Sub-path              | Status |
| ------------------------------------------------------------------ | --------------------- | ------ |
| Alert                                                              | `alert`               | ✅      |
| Toast                                                              | `toast`               | ✅      |
| Tag                                                                | `tag`                 | ✅      |
| Badge                                                              | `badge`               | ⬜      |
| ProgressIndicator                                                  | `progress-indicator`  | ⬜      |
| NotificationBanner                                                 | `notification-banner` | ⬜      |
| Timeline                                                           | `timeline`            | ⬜      |
| Pill                                                               | `pill`                | ⬜      |
| Animations                                                         | `animations`          | ⬜      |
| Animations.Customisable (LoadingDotsSpinner, ThemedLoadingSpinner) | `animations`          | ⬜      |
| CountdownTimer                                                     | `countdown-timer`     | ⬜      |
| SmartAppBanner                                                     | `smart-app-banner`    | ⬜      |

## Overlays

| Component     | Sub-path     | Status |
| ------------- | ------------ | ------ |
| ModalV2       | `modal-v2`   | ✅      |
| Modal         | `modal`      | ✅      |
| Menu          | `menu`       | ✅      |
| Drawer        | `drawer`     | ⬜      |
| PopoverV2     | `popover-v2` | ⬜      |
| PopoverInline | `popover-v2` | ⬜      |
| Overlay       | `overlay`    | ⬜      |

## Form

| Component                                       | Sub-path                    | Status |
| ----------------------------------------------- | --------------------------- | ------ |
| Form.Input                                      | `form`                      | ✅      |
| Input                                           | `input`                     | ✅      |
| Form.Select (InputSelect)                       | `input-select`              | ✅      |
| Form.Textarea (InputTextarea)                   | `input-textarea`            | ✅      |
| Form.Label                                      | `form`                      | ⬜      |
| Form.DateInput                                  | `date-input`                | ⬜      |
| Form.MultiSelect (InputMultiSelect)             | `input-multi-select`        | ⬜      |
| Form.PhoneNumberInput                           | `phone-number-input`        | ⬜      |
| Form.MaskedInput (MaskedInput)                  | `masked-input`              | ⬜      |
| InputGroup                                      | `input-group`               | ⬜      |
| Form.DateRangeInput                             | `date-range-input`          | ⬜      |
| Form.Timepicker                                 | `timepicker`                | ⬜      |
| Form.OtpVerification                            | `otp-verification`          | ⬜      |
| Form.UnitNumberInput                            | `unit-number`               | ⬜      |
| Form.PredictiveTextInput                        | `predictive-text-input`     | ⬜      |
| Form.TimeRangePicker                            | `time-range-picker`         | ⬜      |
| Form.Slider (InputSlider)                       | `input-slider`              | ⬜      |
| Form.RangeSlider (InputRangeSlider)             | `input-range-slider`        | ⬜      |
| Form.NestedSelect (InputNestedSelect)           | `input-nested-select`       | ⬜      |
| Form.NestedMultiSelect (InputNestedMultiSelect) | `input-nested-multi-select` | ⬜      |
| Form.RangeSelect (InputRangeSelect)             | `input-range-select`        | ⬜      |
| Form.CustomField                                | `form`                      | ⬜      |
| Form.SelectHistogram                            | `select-histogram`          | ⬜      |
| Form.HistogramSlider                            | `histogram-slider`          | ⬜      |
| Form.ESignature                                 | `e-signature`               | ⬜      |

## Deprecated

> These components appear under the Deprecated section in Storybook.
> Do not document them; use the recommended replacement instead.

| Component     | Sub-path  | Notes                       |
| ------------- | --------- | --------------------------- |
| Masonry       | `masonry` | No replacement              |
| Popover (old) | `popover` | Use `PopoverInline` instead |
| Tooltip       | `tooltip` | No direct replacement in v3 |

---

## Foundation

> Topics documented in `resources/foundations-tokens.md` and
> `resources/theme-setup.md`.
> To add a section, run the `Add DS Foundation to Catalogue` prompt.

| Topic                        | File                    | Status                               |
| ---------------------------- | ----------------------- | ------------------------------------ |
| Installation                 | `theme-setup.md`        | ✅                                    |
| Theme Presets & ThemeSpec    | `theme-setup.md`        | ✅                                    |
| DSThemeProvider              | `theme-setup.md`        | ✅                                    |
| Advanced Theme Customisation | `theme-setup.md`        | ⬜                                    |
| Dark Mode                    | `theme-setup.md`        | ⬜                                    |
| Colour tokens                | `foundations-tokens.md` | ✅ (semantic + primitive + overrides) |
| Spacing tokens               | `foundations-tokens.md` | ✅                                    |
| Font tokens                  | `foundations-tokens.md` | ✅ (basic usage + overrides)          |
| Breakpoints / MediaQuery     | `foundations-tokens.md` | ✅                                    |
| Shadow                       | `foundations-tokens.md` | ✅                                    |
| Border                       | `foundations-tokens.md` | ✅                                    |
| Border Radius                | `foundations-tokens.md` | ✅                                    |
| Z-index                      | `foundations-tokens.md` | ⬜                                    |
| Motion                       | `foundations-tokens.md` | ✅                                    |

---

**Progress**: 26 / 90 components documented (3 deprecated excluded from count)

> New sub-components confirmed via Storybook full expansion:
> `Layout.ColDiv`, `Filter.Addons`, `Animations.Customisable`.
