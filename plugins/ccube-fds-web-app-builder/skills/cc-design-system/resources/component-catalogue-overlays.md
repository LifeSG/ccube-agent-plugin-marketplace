> **Overlays** group — ModalV2, Modal (legacy), Drawer, Menu, Overlay,
> PopoverInline, and PopoverV2.
> For other groups see the other `resources/component-catalogue-*.md` files.
> For inline feedback banners and badges see
> `resources/component-catalogue-feedback-indicators.md`.
> For the cross-cutting Figma → FDS Quick Lookup table, see
> `resources/component-catalogue.md`.

---

## Overlays

> Components that render above the page content. Scan this group when the
> Figma frame shows a dialog, bottom sheet, side panel, backdrop overlay,
> contextual popover, or dropdown menu.

### Drawer

**Import**: `import { Drawer } from "@lifesg/react-design-system/drawer"`

**Category**: Overlays

**Decision rule**
> Use `Drawer` for right-side panel overlays focused on supplemental
> task content; use `ModalV2` for centred dialogs or multi-direction slide
> overlays with broader modal composition needs.

**When to use**
- Side-panel experiences that keep users in context while viewing/editing
  related details.
- Overlay panels where a heading and close affordance are needed with
  straightforward open/close control.

**When NOT to use**
| Situation                                      | Use instead |
| ---------------------------------------------- | ----------- |
| Confirmation dialog with footer action buttons | `ModalV2`   |

**Key props**
| Prop           | Type              | Required | Notes                                       |
| -------------- | ----------------- | -------- | ------------------------------------------- |
| show           | `boolean`         | yes      | Controls drawer visibility.                 |
| heading        | `string`          | no       | Header text shown at the top of the drawer. |
| children       | `React.ReactNode` | no       | Drawer body content.                        |
| onClose        | `() => void`      | no       | Fired when close button is pressed.         |
| onOverlayClick | `() => void`      | no       | Fired when backdrop is clicked.             |
| className      | `string`          | no       | Custom class for styling hooks.             |
| data-testid    | `string`          | no       | Test selector on drawer root.               |

**Canonical usage**
```tsx
// Side panel for detail preview/editing
import { Drawer } from "@lifesg/react-design-system/drawer";

<Drawer
  show={isOpen}
  heading="Application details"
  onClose={() => setIsOpen(false)}
  onOverlayClick={() => setIsOpen(false)}
>
  <p>Drawer content goes here.</p>
</Drawer>
```

**Figma mapping hints**
| Figma element / layer pattern          | Map to   | Condition                                                    |
| -------------------------------------- | -------- | ------------------------------------------------------------ |
| Slide-in side panel overlay from right | `Drawer` | Context panel opens over page with backdrop and close action |

**Known limitations**
- Drawer orientation is right-side focused in current component behaviour.

---

### Menu

**Import**: `import { Menu } from "@lifesg/react-design-system/menu"`

**Category**: Overlays

**Decision rule**
> Use `Menu` when a Figma frame shows a dropdown that appears on click or
> hover of a specific trigger element — not a full-page blocking overlay.

**When to use**
- Contextual action menus attached to a trigger (avatar, icon button, inline
  button) that open on click or hover.
- Navigation bar user-account menus (profile, settings, logout).

**When NOT to use**
| Situation                                                         | Use instead     |
| ----------------------------------------------------------------- | --------------- |
| Full-page blocking overlay requiring user acknowledgement         | `ModalV2`       |
| Inline tooltip or contextual hint anchored to a text span or icon | `PopoverInline` |
| Persistent side panel coexisting with page content                | `Drawer`        |

**Key props (Menu)**
| Prop         | Type                                                                                                                                                                                       | Required | Notes                                                                           |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------- |
| children     | `ReactNode`                                                                                                                                                                                | yes      | Trigger element — what the user clicks or hovers to open the menu.              |
| menuContent  | `FunctionComponentElement<MenuContentProps>`                                                                                                                                               | yes      | Must be `<Menu.Content>` wrapping one or more `Menu.Section` children.          |
| trigger      | `"click"` \| `"hover"`                                                                                                                                                                     | no       | How the menu opens. Defaults to `"click"`.                                      |
| position     | `"top"` \| `"top-start"` \| `"top-end"` \| `"bottom"` \| `"bottom-start"` \| `"bottom-end"` \| `"left"` \| `"left-start"` \| `"left-end"` \| `"right"` \| `"right-start"` \| `"right-end"` | no       | Menu position relative to the trigger. Default `"bottom-start"`.                |
| enableFlip   | `boolean`                                                                                                                                                                                  | no       | Flip to the opposite side when the menu would overflow the viewport.            |
| enableResize | `boolean`                                                                                                                                                                                  | no       | Resize menu height to fit remaining vertical space; content becomes scrollable. |
| delay        | `{ open?: number; close?: number }`                                                                                                                                                        | no       | Open/close delay in milliseconds — useful for `trigger="hover"`.                |
| zIndex       | `number`                                                                                                                                                                                   | no       | Overrides the default z-index of the menu popover.                              |
| data-testid  | `string`                                                                                                                                                                                   | no       | Test selector on the menu wrapper. Defaults to `"menu"`.                        |

**Key props (Menu.Section)**
| Prop        | Type                            | Required | Notes                                               |
| ----------- | ------------------------------- | -------- | --------------------------------------------------- |
| children    | `MenuItem \| MenuLink \| array` | yes      | One or more `Menu.Item` or `Menu.Link` children.    |
| label       | `string`                        | no       | Optional section heading displayed above the items. |
| showDivider | `boolean`                       | no       | Renders a horizontal divider above the section.     |

**Key props (Menu.Item)**
| Prop     | Type     | Required | Notes                                          |
| -------- | -------- | -------- | ---------------------------------------------- |
| label    | `string` | no       | Primary text label for the item.               |
| subLabel | `string` | no       | Secondary text displayed below the main label. |

**Key props (Menu.Link)**

Extends `AnchorHTMLAttributes<HTMLAnchorElement>` — use standard anchor
props (`href`, `target`) plus `data-testid`.

**Canonical usage**
```tsx
// User-account menu in a navbar — opens on click
import { Menu } from "@lifesg/react-design-system/menu";

<Menu
  trigger="click"
  position="bottom-end"
  menuContent={
    <Menu.Content>
      <Menu.Section label="John Doe">
        <Menu.Item label="email@email.sg" />
      </Menu.Section>
      <Menu.Section label="Category 1" showDivider>
        <Menu.Item label="My Profile" onClick={handleProfile} />
        <Menu.Link href="/settings">Settings</Menu.Link>
      </Menu.Section>
      <Menu.Section showDivider>
        <Menu.Item label="Log out" onClick={handleLogout} />
      </Menu.Section>
    </Menu.Content>
  }
>
  <Avatar />
</Menu>
```

**Figma mapping hints**
| Figma element / layer pattern                   | Map to | Condition                                             |
| ----------------------------------------------- | ------ | ----------------------------------------------------- |
| Contextual action menu (click or hover trigger) | `Menu` | Any dropdown anchored to a specific trigger element   |
| Avatar / user-profile menu in navbar            | `Menu` | Pass `Avatar` as the trigger; group items in sections |

**Composition patterns**
- Pair with `Avatar` or `IconButton` as the trigger — the most common FDS
  entrypoints for `Menu` per Storybook examples.
- Use `Menu.Section` with `label` to show the signed-in user's name or email
  at the top of an account menu.
- `Menu.Link` renders an `<a>` element; use for navigation items.
  `Menu.Item` renders as `<li>`; use for action items with `onClick`.

---

### Modal (Legacy)

**Import**:
`import { Modal, ModalBox } from "@lifesg/react-design-system/modal"`

**Category**: Overlays

**Decision rule**
> Prefer `ModalV2` for all new implementations — `Modal` is the legacy API;
> only use it when maintaining existing code that already uses `Modal` +
> `ModalBox`.

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

<Modal
  show={isOpen}
  enableOverlayClick
  onOverlayClick={() => setIsOpen(false)}
>
  <ModalBox showCloseButton onClose={() => setIsOpen(false)}>
    <p>Modal content here</p>
  </ModalBox>
</Modal>
```

---

### ModalV2

**Import**: `import { ModalV2 } from "@lifesg/react-design-system/modal-v2"`

**Category**: Overlays

**Decision rule**
> Use `ModalV2` for all new overlay/dialog implementations — it provides
> structured slots (`ModalV2.Card`, `ModalV2.Content`, `ModalV2.Footer`) and
> supersedes the legacy `Modal` + `ModalBox` API.

**When to use**
- Any dialog, confirmation, alert, or modal overlay in a Figma frame.
- Bottom sheets (`animationFrom="bottom"`) or side panels
  (`animationFrom="right"`) that overlay the full viewport.

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
        <Button.Default
          styleType="secondary"
          onClick={() => setIsOpen(false)}
        >
          Cancel
        </Button.Default>
      }
    />
  </ModalV2.Card>
</ModalV2>

// Bottom sheet variant
<ModalV2
  show={isOpen}
  animationFrom="bottom"
  onClose={() => setIsOpen(false)}
>
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
- Pass `Button.Default` into `ModalV2.Footer`'s `primaryButton` and
  `secondaryButton` slots — they share the same `styleType` API for visual
  consistency.
- Use `Form.*` components inside `ModalV2.Content` for input dialogs — the
  modal provides the scrollable container.

**Known limitations**
- `ModalV2.Card` has no built-in title/header slot — add a heading element
  manually at the top of `ModalV2.Content`.

---

### Overlay

**Import**: `import { Overlay } from "@lifesg/react-design-system/overlay"`

**Category**: Overlays

**Decision rule**
> Use `Overlay` when you only need a dimmed backdrop layer and custom content
> control; use `ModalV2` when you need a full dialog structure with card,
> close controls, and footer slots.

**When to use**
- Custom overlay experiences requiring just backdrop + click-dismiss behavior.
- Transitional states where background interaction must be blocked.

**When NOT to use**
| Situation                                    | Use instead |
| -------------------------------------------- | ----------- |
| Standard dialog with built-in content layout | `ModalV2`   |
| Right-side panel with predefined shell       | `Drawer`    |

**Key props**
| Prop               | Type         | Required | Notes                                                      |
| ------------------ | ------------ | -------- | ---------------------------------------------------------- |
| show               | `boolean`    | yes      | Controls overlay visibility.                               |
| rootId             | `string`     | no       | Portal target element id; defaults to `body` when omitted. |
| backgroundBlur     | `boolean`    | no       | Enables background blur effect; defaults to `true`.        |
| disableTransition  | `boolean`    | no       | Disables show/hide animation transitions.                  |
| zIndex             | `number`     | no       | Custom stacking level for layered overlays/modals.         |
| enableOverlayClick | `boolean`    | no       | Enables callback when user clicks on dimmed backdrop.      |
| onOverlayClick     | `() => void` | no       | Called on backdrop click when `enableOverlayClick={true}`. |
| id                 | `string`     | no       | Unique element identifier for the overlay root.            |

**Canonical usage**
```tsx
// Backdrop overlay with click-to-dismiss behavior
import { Overlay } from "@lifesg/react-design-system/overlay";

<Overlay
  show={isOpen}
  enableOverlayClick
  onOverlayClick={() => setIsOpen(false)}
  zIndex={70}
/>
```

**Figma mapping hints**
| Figma element / layer pattern       | Map to    | Condition                                            |
| ----------------------------------- | --------- | ---------------------------------------------------- |
| Page-dimming backdrop overlay layer | `Overlay` | Dimmed background that blocks page interaction only. |

**Known limitations**
- `backgroundOpacity` is deprecated and has no effect.

---

### PopoverInline

**Import**:
`import { PopoverInline } from "@lifesg/react-design-system/popover-v2"`

**Category**: Overlays

**Decision rule**
> Use `PopoverInline` when inline text or icon inside body copy should open a
> contextual popover; use `PopoverTrigger` for standalone button/icon triggers.

**When to use**
- Explanatory hints embedded directly inside sentences or labels.
- Inline terms needing quick contextual clarification without page navigation.

**When NOT to use**
| Situation                              | Use instead      |
| -------------------------------------- | ---------------- |
| Trigger is a standalone button or icon | `PopoverTrigger` |
| Dropdown-style action list             | `Menu`           |

**Key props**
| Prop                | Type                                                                                                                                                                 | Required | Notes                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------- |
| content             | `React.ReactNode`                                                                                                                                                    | yes      | Inline trigger content rendered in text flow.       |
| popoverContent      | `string \| JSX.Element \| ((renderProps: PopoverRenderProps) => React.ReactNode)`                                                                                    | yes      | Floating content shown on trigger interaction.      |
| trigger             | `"click" \| "hover"`                                                                                                                                                 | no       | Chooses interaction model for opening popover.      |
| position            | `"top" \| "top-start" \| "top-end" \| "bottom" \| "bottom-start" \| "bottom-end" \| "left" \| "left-start" \| "left-end" \| "right" \| "right-start" \| "right-end"` | no       | Places popover relative to inline trigger.          |
| underlineStyle      | `"default" \| "underline" \| "underline-dashed"`                                                                                                                     | no       | Controls resting underline style of inline trigger. |
| underlineHoverStyle | `"default" \| "underline" \| "underline-dashed"`                                                                                                                     | no       | Controls underline style on hover.                  |
| icon                | `React.ReactNode`                                                                                                                                                    | no       | Displays an inline icon beside content.             |
| isModal             | `boolean`                                                                                                                                                            | no       | Traps focus when true; non-modal when false.        |

**Canonical usage**
```tsx
// Inline explanatory popover in sentence copy
import { PopoverInline } from "@lifesg/react-design-system/popover-v2";

<p>
  Collection is available on
  <PopoverInline
    content=" Fridays"
    popoverContent="Only selected outlets support Friday collection."
    trigger="hover"
    underlineStyle="underline"
  />
</p>
```

**Figma mapping hints**
| Figma element / layer pattern           | Map to          | Condition                        |
| --------------------------------------- | --------------- | -------------------------------- |
| Inline text with contextual info bubble | `PopoverInline` | Trigger is embedded in body copy |

**Known limitations**
- In mobile viewports, popover behavior is modal-style regardless of
  `isModal={false}`.

---

### PopoverV2

**Import**:
`import { PopoverV2, PopoverTrigger } from "@lifesg/react-design-system/popover-v2"`

**Category**: Overlays

**Decision rule**
> Use `PopoverTrigger` when a Figma element shows a floating info bubble or
> rich tooltip anchored to a specific trigger — not a full dropdown menu or
> inline underline trigger.

**When to use**
- Contextual information panels or rich tooltips that appear on click or
  hover of a button, icon, or interactive element.
- Floating UI (e.g. detail card, mini-form supplement) that is spatially
  anchored to a trigger and dismissed on outside interaction.

**When NOT to use**
| Situation                                               | Use instead     |
| ------------------------------------------------------- | --------------- |
| Inline text or icon trigger with underline styling      | `PopoverInline` |
| Contextual action list (menu items, navigation links)   | `Menu`          |
| Full-viewport blocking dialog requiring acknowledgement | `ModalV2`       |
| Persistent supplemental panel alongside the page        | `Drawer`        |

**Key props (PopoverTrigger)**
| Prop             | Type                                                                                                                                                                 | Required | Notes                                                                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------- |
| children         | `React.ReactNode`                                                                                                                                                    | yes      | The element the user clicks or hovers to open the popover.                                                       |
| popoverContent   | `string \| JSX.Element \| ((renderProps: PopoverRenderProps) => React.ReactNode)`                                                                                    | yes      | Popover body. Use a render function with `enableResize` to access `maxHeight` and `overflow`.                    |
| trigger          | `"click" \| "hover"`                                                                                                                                                 | no       | Interaction that opens the popover. Default `"click"`.                                                           |
| position         | `"top" \| "top-start" \| "top-end" \| "bottom" \| "bottom-start" \| "bottom-end" \| "left" \| "left-start" \| "left-end" \| "right" \| "right-start" \| "right-end"` | no       | Preferred placement relative to trigger. Default `"top"`. Auto-adjusts when space is limited.                    |
| zIndex           | `number`                                                                                                                                                             | no       | Override default z-index when stacking context conflicts arise.                                                  |
| rootNode         | `RefObject<HTMLElement>`                                                                                                                                             | no       | Host element for the portal. Use when the trigger's parent has a higher z-index.                                 |
| delay            | `{ open?: number; close?: number }`                                                                                                                                  | no       | Millisecond delays before open/close. Default `{ open: 0, close: 500 }`. Not applied for `trigger="click"`.      |
| enableFlip       | `boolean`                                                                                                                                                            | no       | Flip to opposite side when preferred position would overflow viewport. Default `true`.                           |
| enableResize     | `boolean`                                                                                                                                                            | no       | Resize popover height to fit remaining viewport space; content becomes scrollable. Default `false`.              |
| overflow         | `"visible" \| "hidden" \| "clip" \| "scroll" \| "auto"`                                                                                                              | no       | Overflow behaviour inside the popover. Use with `enableResize`. Default `"auto"`.                                |
| isModal          | `boolean`                                                                                                                                                            | no       | Traps focus inside popover when `true`. Set `false` for non-modal usage (e.g. navigation menus). Default `true`. |
| triggerOnFocus   | `boolean`                                                                                                                                                            | no       | Opens the popover when the trigger receives keyboard focus via Tab. Default `false`.                             |
| popoverAriaLabel | `string`                                                                                                                                                             | no       | Accessible label for the popover region. Default `"More information"`.                                           |

**Key props (PopoverV2)**
| Prop      | Type                                                    | Required | Notes                                                                |
| --------- | ------------------------------------------------------- | -------- | -------------------------------------------------------------------- |
| children  | `string \| JSX.Element`                                 | yes      | Content rendered inside the popover bubble.                          |
| visible   | `boolean`                                               | no       | Controls visibility when used standalone (without `PopoverTrigger`). |
| overflow  | `"visible" \| "hidden" \| "clip" \| "scroll" \| "auto"` | no       | Overflow behaviour of the popover container.                         |
| maxHeight | `number`                                                | no       | Maximum height in pixels; applies when `enableResize` is active.     |
| ariaLabel | `string`                                                | no       | Accessible label for the popover element.                            |

**Canonical usage**
```tsx
// Click-activated contextual popover anchored to a button
import { PopoverV2, PopoverTrigger } from "@lifesg/react-design-system/popover-v2";

<PopoverTrigger
  popoverContent={<PopoverV2>More details about this item.</PopoverV2>}
  position="top"
  trigger="click"
>
  <button>More info</button>
</PopoverTrigger>
```

**Figma mapping hints**
| Figma element / layer pattern                       | Map to           | Condition                                                           |
| --------------------------------------------------- | ---------------- | ------------------------------------------------------------------- |
| Contextual information bubble anchored to a trigger | `PopoverTrigger` | Any floating info panel opened by clicking or hovering a UI element |
| Hover tooltip anchored to trigger element           | `PopoverTrigger` | Set `trigger="hover"` for hover-activated content                   |

**Composition patterns**
- Use `PopoverTrigger` as the outer wrapper with `PopoverV2` as the
  `popoverContent` value for the standard styled popover appearance.
- With `enableResize`, pass `popoverContent` as a render function to receive
  `maxHeight` and `overflow` and apply them to a scrollable inner container.
- `PopoverInline` is also exported from the same `popover-v2` sub-path; it
  provides inline text/icon triggers with built-in underline styling and is
  documented separately.

**Known limitations**
- `PopoverV2` alone has no positioning logic; always pair it with
  `PopoverTrigger` (or manage `visible` and positioning manually).
- Mobile viewports automatically render the popover as a modal regardless of
  the `isModal` setting.
