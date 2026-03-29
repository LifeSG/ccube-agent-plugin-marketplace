<div align="center">

# CCube Frontend Dev

*React and CSS knowledge — directly in Copilot chat*

<p align="center">
  <img src="https://img.shields.io/badge/Skills-5-555?style=for-the-badge&logo=lightning&logoColor=white&labelColor=F6C063" alt="Skills">
</p>

</div>

---

## What This Plugin Does

This plugin brings frontend development best practices directly into
Copilot chat. Once installed, skills are loaded automatically when
semantically matched to the current task — no manual invocation needed.

The result: An AI pair programmer that guards against common React
rookie mistakes, applies the correct React 18 or React 19 pattern for
concurrent rendering and new hooks, writes correct and maintainable
CSS, and uses styled-components patterns correctly — from theming and
typed props to global styles and keyframe animations.

---

## What Gets Installed

| File       | Location         | What it does                                               |
| ---------- | ---------------- | ---------------------------------------------------------- |
| `SKILL.md` | `skills/<name>/` | Domain-knowledge packages — React patterns, CSS essentials |

---

## Skills

### cc-react-beginner

React fundamentals for developers new to React. Covers JSX, functional
components, props, state, conditional rendering, list rendering,
`useEffect`, data fetching, component composition, lifting state, and
the 10 most common rookie mistakes with code examples.

**Invoke when:** implementing basic React features, onboarding to
React, or when rookie mistakes are suspected.

### cc-react-18-patterns

React 18 quick-reference covering concurrent rendering, automatic
batching, `useTransition`, `startTransition`, Suspense, `useId`,
`useDeferredValue`, `useSyncExternalStore`, streaming SSR, Strict Mode
behaviour, `forwardRef`, context patterns, performance memoisation, and
TypeScript integration. Includes 10 common-mistake flags and migration
notes for upgrading to React 19.

**Invoke when:** implementing, reviewing, or debugging React 18.x
components.

### cc-react-19-patterns

React 19.2 modern patterns reference covering the Actions API,
`useActionState`, `useFormStatus`, `useOptimistic`, `use()` hook,
Server Components, `forwardRef` removal, React Compiler, and
`<Activity>`. Includes decision trees, code examples, and
common-mistake flags.

**Invoke when:** implementing, reviewing, or debugging React 19+
components.

### cc-css-essentials

CSS fundamentals and styled-components patterns. Covers the box model,
`box-sizing` global reset, flexbox alignment, CSS Grid, units (`rem`
vs `px` vs `vw`), specificity, positioning, z-index stacking context,
responsive (mobile-first) design, and a full styled-components
section — basic usage, props-based styling, extending, theming with
TypeScript, global styles, and keyframe animations. Includes a 9-row
common layout bugs table and 10 common-mistake flags.

**Invoke when:** writing, reviewing, or debugging component styles.

---

## Telemetry

This plugin collects anonymous usage data to help understand how
many people install it. No PII, file contents, or workspace data
is ever collected.

**What is sent on each session start:**

- A random anonymous ID (generated locally at
  `~/.ccube/telemetry-id`, reused across sessions)
- The plugin name
- A UTC timestamp

**How to opt out:**

Add the following to your shell profile (`~/.zshrc`, `~/.bashrc`,
or `~/.profile`) and restart VS Code:

```bash
export CCUBE_TELEMETRY_DISABLED=1
```

See [docs/telemetry/DESIGN.md](../../docs/telemetry/DESIGN.md) for
the full privacy and data schema documentation.

---

## Requirements

No additional installations required. This plugin operates entirely
through Copilot chat.
