> This file is the **index and cross-cutting reference** for the FDS component
> catalogue. It contains:
> 1. A directory of per-group catalogue files (load the relevant file first).
> 2. The Figma → FDS Quick Lookup table (cross-cutting, all documented
>    components).
> 3. Known FDS Gaps.
>
> For token usage (Colour, Spacing, Font), see `resources/foundations-tokens.md`.
> For project setup and ThemeProvider, see `resources/theme-setup.md`.

---

## Catalogue File Directory

Load the file for the Storybook group that contains the component you need.
Groups mirror the left-hand sidebar at
https://designsystem.life.gov.sg/react/index.html

| Group               | File                                                   | Documented so far                            |
| ------------------- | ------------------------------------------------------ | -------------------------------------------- |
| Core                | `resources/component-catalogue-core.md`                | Layout, Typography                           |
| Content             | `resources/component-catalogue-content.md`             | Accordion, Card, Tab                         |
| Navigation          | `resources/component-catalogue-navigation.md`          | Breadcrumb                                   |
| Selection and input | `resources/component-catalogue-selection-input.md`     | Button, Checkbox, RadioButton, Toggle        |
| Feedback indicators | `resources/component-catalogue-feedback-indicators.md` | Alert, Toast                                 |
| Overlays            | `resources/component-catalogue-overlays.md`            | Menu, Modal (legacy), ModalV2                |
| Form                | `resources/component-catalogue-form.md`                | Input, Form.Input, Form.Select (InputSelect) |

---

## Figma → FDS Quick Lookup

> Scan this table first. Find the Figma element type or layer name pattern,
> then load the group file listed above for full props and usage details.

| Figma element / layer pattern                                  | FDS Component             | Group file          | Notes                                                                          |
| -------------------------------------------------------------- | ------------------------- | ------------------- | ------------------------------------------------------------------------------ |
| Filter bar / search box (no label)                             | `Input`                   | form                | Use `styleType="no-border"`                                                    |
| Tel / phone field (standalone, no label)                       | `Input`                   | form                | Use `type="tel"` and `spacing` prop                                            |
| Text field with error state, no label                          | `Input`                   | form                | Set `error={true}`                                                             |
| Text field with label                                          | `Form.Input`              | form                | Default choice for any labelled single-line input                              |
| Standalone form label with helper icon/addon                   | `Form.Label`              | form                | Use when label and field are rendered separately in custom layouts             |
| Text field with label + tooltip icon                           | `Form.Input`              | form                | Pass `label` as `FormLabelProps` with `addon`                                  |
| Text field in multi-column form grid                           | `Form.Input`              | form                | Add `layoutType="grid"` and col span props                                     |
| Textarea (standalone, no label)                                | `Textarea`                | form                | Use standalone import for label-free usage                                     |
| Textarea with character counter                                | `Form.Textarea`           | form                | Set `maxLength` to the limit shown in the design                               |
| Textarea with prefix line                                      | `Form.Textarea`           | form                | Set `prefix` to the fixed non-editable leading text                            |
| Button — text only, any size or style                          | `Button`                  | selection-input     | Use `.Default`, `.Small`, or `.Large` sub-component                            |
| Button — text + icon                                           | `ButtonWithIcon`          | selection-input     | Pass an `icon` JSX element and optional `iconPosition`                         |
| Button — icon only, no visible text label                      | `IconButton`              | selection-input     | Use `IconButton` from `@lifesg/react-design-system/icon-button`                |
| Destructive action button (delete, remove, cancel)             | `Button`                  | selection-input     | Add `danger={true}` to any `Button.*` variant                                  |
| Button showing async loading state                             | `Button`                  | selection-input     | Add `loading={true}` to any `Button.*` variant                                 |
| Confirmation dialog / alert dialog                             | `ModalV2`                 | overlays            | Compose with `ModalV2.Card`, `ModalV2.Content`, `ModalV2.Footer`               |
| Dialog with header, content, action buttons                    | `ModalV2`                 | overlays            | Use `ModalV2.CloseButton` + `ModalV2.Footer` with button slots                 |
| Bottom sheet that slides up                                    | `ModalV2`                 | overlays            | Set `animationFrom="bottom"`                                                   |
| Breadcrumb trail / page location path                          | `Breadcrumb`              | navigation          | Any multi-level hierarchy; last item is always non-interactive                 |
| Breadcrumb with slash separators                               | `Breadcrumb`              | navigation          | Set `separatorStyle="slash"`                                                   |
| Footer — minimal, disclaimer links only                        | `Footer`                  | navigation          | Omit `links`; disclaimer links are always rendered by default                  |
| Footer with App Store / Google Play download badges            | `Footer`                  | navigation          | Set `showDownloadAddon={true}`                                                 |
| Footer with full-width stretched layout                        | `Footer`                  | navigation          | Set `layout="stretch"` to ignore masthead width constraint                     |
| Site footer with logo, link columns, and disclaimer bar        | `Footer`                  | navigation          | Full-width bottom section with directory navigation and legal links            |
| Fullscreen image carousel / zoomable gallery overlay           | `FullscreenImageCarousel` | content             | Full-screen image viewer with optional thumbnail row and magnifier controls    |
| Header navigation bar with brand, links, and utility actions   | `Navbar`                  | navigation          | Desktop links collapse into a drawer on mobile/tablet                          |
| Icon-only circular action button                                | `IconButton`              | selection-input     | Icon-only CTA with accessible icon/alt labelling                               |
| Pagination controls below a list/table                         | `Pagination`              | navigation          | Numbered page navigation with previous/next movement                           |
| Pagination with page-size dropdown                             | `Pagination`              | navigation          | Enable `showPageSizeChanger` and optional custom `pageSizeOptions`             |
| Phone number field with country code selector                  | `Form.PhoneNumberInput`   | form                | Labelled field with code dropdown and value object `{ countryCode, number }`   |
| Process timeline / chronological step list                     | `Timeline`                | feedback-indicators | Vertical step tracker with completed/current/upcoming variants                 |
| Slide-in side panel (right or left)                            | `ModalV2`                 | overlays            | Set `animationFrom="right"` or `animationFrom="left"`                          |
| Slide-in side panel overlay from right                         | `Drawer`                  | overlays            | Context panel with heading, backdrop, and close action                         |
| Masked / partially hidden sensitive value with eye-icon toggle | `UneditableSection.Item`  | content             | Set `maskState` and masking props (`maskRange`, `maskRegex`, etc.)             |
| Modal footer with primary + secondary buttons                  | `ModalV2.Footer`          | overlays            | Pass `primaryButton` and `secondaryButton` as `Button.*` nodes                 |
| Avatar / user-profile menu in navbar                           | `Menu`                    | overlays            | Pass `Avatar` as the trigger element; group items in `Menu.Section`            |
| Contextual action menu (click or hover trigger)                | `Menu`                    | overlays            | Compose with `Menu.Content`, `Menu.Section`, `Menu.Item`, `Menu.Link`          |
| Contextual information bubble anchored to a trigger            | `PopoverTrigger`          | overlays            | Click- or hover-activated floating content panel anchored to a UI element      |
| Hover tooltip anchored to trigger element                      | `PopoverTrigger`          | overlays            | Set `trigger="hover"` for hover-activated popover content                      |
| Multi-line text area / textarea field                          | `Form.Textarea`           | form                | Any textarea with a visible label above it                                     |
| Multi-select dropdown field with selected-count label          | `Form.MultiSelect`        | form                | User can select multiple items from one dropdown                               |
| Multi-step wizard form progress                                | `ProgressIndicator`       | feedback-indicators | Horizontal numbered step chain; set `currentIndex` to the 0-based active step  |
| Accordion / collapsible section group                          | `Accordion`               | content             | Use `Accordion.Item` for each collapsible row                                  |
| Single collapsible row (standalone, no group)                  | `Accordion.Item`          | content             | Set `collapsible={true}` for always-visible non-collapsible rows               |
| FAQ list / expandable Q&A items                                | `Accordion`               | content             | Set `enableExpandAll` to show a Show All / Hide All control                    |
| Card surface / elevated container                              | `Card`                    | content             | Any `<div>` with elevated shadow or rounded border in Figma                    |
| Data table with sortable headers and status rows               | `DataTable`               | content             | Built-in sorting indicators with structured row rendering                      |
| Data grid with merged cells or custom row/col spans            | `Table`                   | content             | Use low-level table structure; choose `DataTable` for sorting/selection        |
| Selectable table with bulk action bar                          | `DataTable`               | content             | Enable row selection and selected-items action controls                        |
| Horizontal tab bar / selector strip                            | `Tab`                     | content             | Multiple label tabs that switch which content panel is visible                 |
| Individual label-value field row in a read-only section        | `UneditableSection.Item`  | content             | One per field; pass through the `items` array                                  |
| Individual tab panel / content section                         | `Tab.Item`                | content             | One `Tab.Item` per panel; tab order mirrors JSX order                          |
| Tab selector with numeric badge / count                        | `Tab.Item`                | content             | Set `titleAddon` with badge content; `position` defaults to `"right"`          |
| Horizontal rule / separator line layer                         | `Divider`                 | core                | Default; renders as a solid 1px line                                           |
| Horizontal separator spanning a grid row                       | `Divider`                 | core                | Set `layoutType="grid"` with `desktopCols`, `tabletCols`, `mobileCols`         |
| Heading text (H1–H6)                                           | `Typography`              | core                | Use `Typography.HeadingXXL` → `Typography.HeadingXS` variants                  |
| Body / paragraph text                                          | `Typography`              | core                | Use `Typography.BodyBL` → `Typography.BodyXS` variants                         |
| Bulleted text list / checklist group                           | `TextList.Ul`             | core                | Unordered list bullets with `bulletType` options                               |
| Hyperlink / anchor                                             | `Typography`              | core                | Use `Typography.LinkBL` → `Typography.LinkXS` variants                         |
| HTML / rich text content block (bold, links, lists)            | `Markup`                  | core                | Use for CMS/HTML-rich content; plain text should use `Typography.*`            |
| Numbered step list / ordered process                           | `TextList.Ol`             | core                | Ordered counters via `counterType`, `counterSeparator`, and `start`            |
| Page-dimming backdrop overlay layer                            | `Overlay`                 | overlays            | Dimmed full-page backdrop that blocks background interaction                   |
| Section-level local navigation menu                            | `LocalNavMenu`            | navigation          | In-page section navigation list; pair with dropdown on smaller screens          |
| Boxed content section with title and chevron toggle            | `BoxContainer`            | content             | Header controls expand/collapse of body block                                  |
| Borderless calendar panel                                      | `Calendar`                | selection-input     | Set `styleType="no-border"`                                                    |
| Borderless downloadable file attachment area                   | `FileDownload`            | selection-input     | Set `styleType="no-border"`                                                    |
| Calendar with blackout / unavailable dates                     | `Calendar`                | selection-input     | Pass `disabledDates`, `minDate`, or `maxDate`                                  |
| Calendar with multiple selected dates                          | `Calendar`                | selection-input     | Set `variant="multi"`                                                          |
| Inline / always-visible date picker panel                      | `Calendar`                | selection-input     | Always-on display, no input field trigger                                      |
| Checkbox (single or group)                                     | `Checkbox`                | selection-input     | Use `checked` + `indeterminate` for all selection states                       |
| Downloadable file list / attachment panel                      | `FileDownload`            | selection-input     | Pass `fileItems` array and `onDownload` handler                                |
| File item in generating / not-ready state                      | `FileDownload`            | selection-input     | Set `ready={false}` on `FileItemDownloadProps` entry                           |
| File upload dropzone with attachment list                      | `FileUpload`              | selection-input     | Drag/drop or click upload with managed file items                              |
| Icon symbol — filled / solid variant                           | `{Name}FillIcon`          | core                | Append `Fill` before `Icon` in the name; import from `@lifesg/react-icons`     |
| Icon symbol — outline / stroke variant                         | `{Name}Icon`              | core                | Import from `@lifesg/react-icons/{kebab-name}` for tree-shaking                |
| Indeterminate / partial select checkbox                        | `Checkbox`                | selection-input     | Set `indeterminate={true}`                                                     |
| Government banner at page top for .gov.sg services             | `Masthead`                | navigation          | Mandatory official banner above page content                                   |
| Inline text with contextual info bubble                        | `PopoverInline`           | overlays            | Trigger is embedded directly in sentence flow                                  |
| Inline OTP code entry with resend cooldown                     | `OtpInput`                | selection-input     | Fixed-length OTP boxes with built-in cooldown behavior                         |
| Radio button / single-select option circle                     | `RadioButton`             | selection-input     | Use `checked` + `name` to form a mutually exclusive group                      |
| Read-only data section / pre-filled personal info block        | `UneditableSection`       | content             | Grey-background section with label-value field rows                            |
| Toggle / switch card (on/off)                                  | `Toggle`                  | selection-input     | Binary immediate-effect control; `type` defaults to `"checkbox"`               |
| Toggle group (select one, no deselect)                         | `Toggle`                  | selection-input     | Set `type="radio"` with shared `name`; `"yes"`/`"no"` for pairs                |
| Toggle with description text below label                       | `Toggle`                  | selection-input     | Set `subLabel`                                                                 |
| Toggle without visible border                                  | `Toggle`                  | selection-input     | Set `styleType="no-border"`                                                    |
| Toggle with remove / dismiss button                            | `Toggle`                  | selection-input     | Set `removable={true}` and handle `onRemove`                                   |
| Transparent read-only section (no background)                  | `UneditableSection`       | content             | Set `background={false}`                                                       |
| Sortable uploaded file gallery/list                            | `FileUpload`              | selection-input     | Set `sortable={true}` and handle reorder via `onSort`                          |
| Dropdown / select field with label                             | `Form.Select`             | form                | Wraps `InputSelect` with label and error message                               |
| Dropdown select (standalone, no label)                         | `InputSelect`             | form                | Use `valueExtractor` + `listExtractor` to map option objects                   |
| Searchable dropdown / autocomplete select                      | `InputSelect`             | form                | Set `enableSearch={true}` and optionally `searchFunction`                      |
| Side navigation rail with nested flyout subitems               | `Sidenav`                 | navigation          | Left-side grouped navigation with optional drawer subitems                     |
| Sensitive text field with reveal/hide eye icon                 | `Form.MaskedInput`        | form                | Masked value display with controlled unmask behavior                           |
| Singpass login CTA button                                      | `SingpassButton`          | selection-input     | Use official white-filled or red-filled variant only                           |
| Static status/category pill chip                               | `Pill`                    | feedback-indicators | Non-interactive compact status/category chip                                   |
| Alert banner (success, error, warning, info)                   | `Alert`                   | feedback-indicators | Set `type` to `"success"`, `"error"`, `"warning"`, or `"info"`                 |
| Notification count badge on icon/avatar                        | `Badge`                   | feedback-indicators | Number badge with optional anchored offset                                     |
| Notification dot indicator                                     | `Badge`                   | feedback-indicators | Dot-style attention indicator without text                                     |
| Auto-dismissing notification pop-up                            | `Toast`                   | feedback-indicators | Set `autoDismiss={true}`; default dismiss time is 4 s                          |
| Dashed separator line                                          | `Divider`                 | core                | Set `lineStyle="dashed"`                                                       |
| Date field with blackout / unavailable dates                   | `Form.DateInput`          | form                | Pass `disabledDates` array with each entry in `"YYYY-MM-DD"` format            |
| Date field with restricted date range                          | `Form.DateInput`          | form                | Set `minDate` and/or `maxDate` to match design constraints                     |
| Date input (standalone, no label)                              | `DateInput`               | form                | Use standalone import from `date-input` without the `Form` wrapper             |
| Date picker / date input field (single date)                   | `Form.DateInput`          | form                | Field has a label and opens a calendar dropdown                                |
| Description / informational callout box                        | `Alert`                   | feedback-indicators | Set `type="description"`                                                       |
| Status pop-up with title and description text                  | `Toast`                   | feedback-indicators | Set both `title` and `label` props                                             |
| Sticky top-of-page announcement banner                         | `NotificationBanner`      | feedback-indicators | Persistent page-level notice above main content                                |
| Toast / snackbar notification (success, warning, error, info)  | `Toast`                   | feedback-indicators | Floating fixed message; use `type` to set colour scheme                        |
| Coloured label chip / category tag                             | `Tag`                     | feedback-indicators | Static text label with colour; use `type="outline"` or `type="solid"`          |
| Interactive filter chip (tappable)                             | `Tag`                     | feedback-indicators | Set `interactive={true}`; larger touch target on mobile                        |
| Status chip with icon                                          | `Tag`                     | feedback-indicators | Pass `icon` JSX element; use `iconPosition` for placement                      |
| Status indicator tag (text-only, coloured)                     | `Tag`                     | feedback-indicators | Use `colorType` to match the status colour                                     |
| Step indicator / progress steps (horizontal)                   | `ProgressIndicator`       | feedback-indicators | Any horizontal labelled step nav showing current position in a multi-step flow |
| Error / 404 full-page frame                                    | `ErrorDisplay`            | core                | Set `type="404"`                                                               |
| Full-page maintenance / downtime screen                        | `ErrorDisplay`            | core                | Set `type="maintenance"`; pass `additionalProps={{ dateString: "..." }}`       |
| Full-width section / page band                                 | `Layout.Section`          | core                | Outermost wrapper spanning the full viewport width                             |
| Session timeout / inactivity warning screen                    | `ErrorDisplay`            | core                | Set `type="inactivity"`; pass `additionalProps={{ secondsLeft: n }}`           |
| Grid column span cell (responsive)                             | `Layout.ColDiv`           | core                | Direct child of `type="grid"` container; set col props per breakpoint          |
| Page content area (max-width 1440px)                           | `Layout.Container`        | core                | Default `type="flex"` for centred constrained-width content                    |
| Page grid layout (12-column responsive)                        | `Layout.Container`        | core                | Set `type="grid"` for responsive 12/8-column layout                            |

---

## Known FDS Gaps

> These UI capabilities have no FDS component. When the Figma design requires
> one of these, classify the element as **Custom** in the DS Coverage Plan and
> note the suggested library.
>
> To add an entry here when a component is not found, run the
> `Add DS Component to Catalogue` prompt — it will automatically write a gap
> row if the component is missing from FDS.

| UI Capability                       | Why it is a gap                                                                           | Suggested library                                                                       |
| ----------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Charts / data visualisation         | No chart component in FDS; `data-table` covers tabular data only                          | `recharts` — use FDS `Colour` tokens for a consistent palette                           |
| Stepper / wizard progress indicator | `progress-indicator` exists for linear progress bars only; no multi-step wizard component | Build with `ProgressIndicator` for linear flows; custom with tokens for stepped wizards |
| Rich text editor                    | No WYSIWYG/RTE component in FDS                                                           | `@tiptap/react` or `react-quill` — style with FDS tokens                                |
| Drag and drop                       | No DnD primitive or sortable list component                                               | `@dnd-kit/core`                                                                         |
| Image cropper                       | No image crop or upload editor component                                                  | `react-image-crop`                                                                      |
| Map / geolocation                   | No map or location picker component                                                       | Google Maps JS API or `react-leaflet`                                                   |
| Multi-day calendar / scheduler      | `calendar/` is a date picker only; no weekly/monthly agenda view                          | `react-big-calendar` or `@fullcalendar/react` — use FDS `Colour` tokens                 |

---

## (Removed — content migrated to group files)

> The per-component documentation that was previously in this file has been
> moved to the group files listed in the Catalogue File Directory above.
> Update `CATALOGUE-PROGRESS.md` to track which group files have been
> populated when new components are documented.
