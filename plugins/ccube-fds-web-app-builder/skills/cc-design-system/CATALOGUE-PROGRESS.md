# DS Component Catalogue — Documentation Progress

Track which FDS components have been documented in `resources/component-catalogue.md`.

To add a component, run the `Add DS Component to Catalogue` prompt.
To initialise the Token Reference and Known FDS Gaps sections, run `Initialise DS Catalogue`.

**Legend**: ✅ Documented | ⬜ Not yet documented

---

## Layout

| Component          | Sub-path                                                       | Status       |
| ------------------ | -------------------------------------------------------------- | ------------ |
| Layout (grid/flex) | `layout`                                                       | ⬜            |
| Layout.ColDiv      | `layout` (as `Layout.ColDiv`)                                  | ⬜            |
| Divider            | `divider`                                                      | ⬜            |
| Icon               | (no sub-path — use `@lifesg/react-design-system` icon exports) | ⬜            |
| Masonry            | `masonry`                                                      | 🚫 Deprecated |

## Typography

| Component  | Sub-path     | Status |
| ---------- | ------------ | ------ |
| Typography | `typography` | ✅      |
| Markup     | `markup`     | ⬜      |
| TextList   | `text-list`  | ⬜      |

## Navigation

| Component  | Sub-path     | Status |
| ---------- | ------------ | ------ |
| Breadcrumb | `breadcrumb` | ⬜      |
| LocalNav   | `local-nav`  | ⬜      |
| Navbar     | `navbar`     | ⬜      |
| Sidenav    | `sidenav`    | ⬜      |
| Tab        | `tab`        | ⬜      |
| Pagination | `pagination` | ⬜      |
| Footer     | `footer`     | ⬜      |
| Masthead   | `masthead`   | ⬜      |

## Button

| Component      | Sub-path           | Status |
| -------------- | ------------------ | ------ |
| Button         | `button`           | ✅      |
| ButtonWithIcon | `button-with-icon` | ⬜      |
| IconButton     | `icon-button`      | ⬜      |
| ImageButton    | `image-button`     | ⬜      |
| SingpassButton | `singpass-button`  | ⬜      |

## Form

| Component                                       | Sub-path                    | Status |
| ----------------------------------------------- | --------------------------- | ------ |
| Input                                           | `input`                     | ✅      |
| Form.Input                                      | `form`                      | ✅      |
| InputGroup                                      | `input-group`               | ⬜      |
| Form.Select (InputSelect)                       | `input-select`              | ✅      |
| Form.MultiSelect (InputMultiSelect)             | `input-multi-select`        | ⬜      |
| Form.NestedSelect (InputNestedSelect)           | `input-nested-select`       | ⬜      |
| Form.NestedMultiSelect (InputNestedMultiSelect) | `input-nested-multi-select` | ⬜      |
| Form.RangeSelect (InputRangeSelect)             | `input-range-select`        | ⬜      |
| Form.Slider (InputSlider)                       | `input-slider`              | ⬜      |
| Form.RangeSlider (InputRangeSlider)             | `input-range-slider`        | ⬜      |
| Form.Textarea (InputTextarea)                   | `input-textarea`            | ⬜      |
| Form.MaskedInput (MaskedInput)                  | `masked-input`              | ⬜      |
| Form.PhoneNumberInput                           | `phone-number-input`        | ⬜      |
| Form.PredictiveTextInput                        | `predictive-text-input`     | ⬜      |
| OtpInput                                        | `otp-input`                 | ⬜      |
| Form.OtpVerification                            | `otp-verification`          | ⬜      |
| Checkbox                                        | `checkbox`                  | ✅      |
| RadioButton                                     | `radio-button`              | ✅      |
| Toggle                                          | `toggle`                    | ⬜      |
| Calendar (date picker)                          | `calendar`                  | ⬜      |
| Form.DateInput                                  | `date-input`                | ⬜      |
| Form.DateRangeInput                             | `date-range-input`          | ⬜      |
| DateNavigator                                   | `date-navigator`            | ⬜      |
| Form.Timepicker                                 | `timepicker`                | ⬜      |
| Form.TimeRangePicker                            | `time-range-picker`         | ⬜      |
| Form.UnitNumberInput                            | `unit-number`               | ⬜      |
| Form.CustomField                                | `form`                      | ⬜      |
| Form.ESignature                                 | `e-signature`               | ⬜      |
| Form.HistogramSlider                            | `histogram-slider`          | ⬜      |
| Form.Label                                      | `form`                      | ⬜      |
| Form.SelectHistogram                            | `select-histogram`          | ⬜      |
| Filter                                          | `filter`                    | ⬜      |
| Filter.Addons (FilterItemCheckbox)              | `filter/addons`             | ⬜      |

## Feedback & Overlays

| Component                                                          | Sub-path              | Status |
| ------------------------------------------------------------------ | --------------------- | ------ |
| Alert                                                              | `alert`               | ✅      |
| Animations                                                         | `animations`          | ⬜      |
| Animations.Customisable (LoadingDotsSpinner, ThemedLoadingSpinner) | `animations`          | ⬜      |
| Modal                                                              | `modal`               | ✅      |
| Modal V2                                                           | `modal-v2`            | ✅      |
| Toast                                                              | `toast`               | ⬜      |
| ErrorDisplay                                                       | `error-display`       | ⬜      |
| NotificationBanner                                                 | `notification-banner` | ⬜      |
| ProgressIndicator                                                  | `progress-indicator`  | ⬜      |
| CountdownTimer                                                     | `countdown-timer`     | ⬜      |
| Overlay                                                            | `overlay`             | ⬜      |
| Drawer                                                             | `drawer`              | ⬜      |

## Display & Data

| Component               | Sub-path                    | Status                             |
| ----------------------- | --------------------------- | ---------------------------------- |
| Accordion               | `accordion`                 | ✅                                  |
| Avatar                  | `avatar`                    | ⬜                                  |
| Badge                   | `badge`                     | ⬜                                  |
| Card                    | `card`                      | ✅                                  |
| BoxContainer            | `box-container`             | ⬜                                  |
| DataTable               | `data-table`                | ⬜                                  |
| Table                   | `table`                     | ⬜                                  |
| Tag                     | `tag`                       | ⬜                                  |
| Pill                    | `pill`                      | ⬜                                  |
| Tooltip                 | `tooltip`                   | 🚫 Deprecated                       |
| PopoverInline           | `popover-v2`                | ⬜                                  |
| Popover V2              | `popover-v2`                | ⬜                                  |
| Popover (old)           | `popover`                   | 🚫 Deprecated — use `PopoverInline` |
| Timeline                | `timeline`                  | ⬜                                  |
| LinkList                | `link-list`                 | ⬜                                  |
| UneditableSection       | `uneditable-section`        | ⬜                                  |
| FileDownload            | `file-download`             | ⬜                                  |
| FileUpload              | `file-upload`               | ⬜                                  |
| FeedbackRating          | `feedback-rating`           | ⬜                                  |
| FullscreenImageCarousel | `fullscreen-image-carousel` | ⬜                                  |
| Menu                    | `menu`                      | ⬜                                  |

## Scheduling

| Component        | Sub-path              | Status |
| ---------------- | --------------------- | ------ |
| Schedule         | `schedule`            | ⬜      |
| TimeSlotBar      | `time-slot-bar`       | ⬜      |
| TimeSlotBarWeek  | `time-slot-bar-week`  | ⬜      |
| TimeSlotWeekView | `time-slot-week-view` | ⬜      |
| TimeTable        | `timetable`           | ⬜      |

## Platform

| Component      | Sub-path           | Status |
| -------------- | ------------------ | ------ |
| SmartAppBanner | `smart-app-banner` | ⬜      |

---

## Foundation

> Topics documented in `resources/foundations-tokens.md` and `resources/theme-setup.md`.
> To add a section, run the `Add DS Foundation to Catalogue` prompt.

| Topic                        | File                    | Status                      |
| ---------------------------- | ----------------------- | --------------------------- |
| Installation                 | `theme-setup.md`        | ✅                           |
| Theme Presets & ThemeSpec    | `theme-setup.md`        | ✅                           |
| DSThemeProvider              | `theme-setup.md`        | ✅                           |
| Advanced Theme Customisation | `theme-setup.md`        | ⬜                           |
| Dark Mode                    | `theme-setup.md`        | ⬜                           |
| Colour tokens                | `foundations-tokens.md` | ✅                           |
| Spacing tokens               | `foundations-tokens.md` | ✅                           |
| Font tokens                  | `foundations-tokens.md` | ✅ (basic usage + overrides) |
| Breakpoints / MediaQuery     | `foundations-tokens.md` | ⬜                           |
| Shadow                       | `foundations-tokens.md` | ⬜                           |
| Border Radius                | `foundations-tokens.md` | ⬜                           |
| Z-index                      | `foundations-tokens.md` | ⬜                           |
| Motion                       | `foundations-tokens.md` | ⬜                           |

---

**Progress**: 12 / 77 components documented (3 deprecated excluded from count)

> New sub-components confirmed via Storybook full expansion: `Layout.ColDiv`, `Filter.Addons`, `Animations.Customisable`.
