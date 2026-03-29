---
name: cc-react-18-patterns
description: >-
  React 18 patterns reference — concurrent rendering, automatic
  batching, transitions, Suspense, new hooks (useId, useTransition,
  useDeferredValue, useSyncExternalStore), streaming SSR, and
  TypeScript integration. Use when implementing, reviewing, or
  debugging React components in any React 18.x project.
user-invocable: false
---

# React 18 Patterns Reference

Authoritative quick-reference for React 18.x patterns. This skill
is loaded automatically when the agent works on React 18 code. It
covers hooks, APIs, and conventions introduced or stabilised in
React 18.0–18.3.

**Version baseline**: React 18.2+ recommended (18.2 includes
important bug fixes for Suspense, `useSyncExternalStore`, and
streaming SSR). Check `package.json` for the project's exact
version before proceeding.

**Memoization**: React 18 does NOT include the React Compiler.
Manual `useMemo`, `useCallback`, and `React.memo` are still the
primary tools for avoiding unnecessary re-renders.

> **Note:** Code examples use vanilla React elements. When working
> in a design system context, substitute the corresponding design
> system components (e.g. FDS `Input`, `Button`, `Select`).

> **Version guard:** If both React 18 and React 19 skills are
> loaded, follow the skill matching the project's `react` version
> in `package.json`.

---

## Concurrent Rendering

React 18's core change: rendering is interruptible. Concurrent
features are opt-in — they activate only when you use APIs like
`startTransition`, `useDeferredValue`, or `<Suspense>`.

**Prerequisite**: The app must use `createRoot` (not the legacy
`ReactDOM.render`) for concurrent features to work.

```tsx
// index.tsx — React 18 entry point
import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
```

**Legacy API** (concurrent features disabled):

```tsx
// Still works but opt-out of all React 18 concurrent features
import ReactDOM from "react-dom";
ReactDOM.render(<App />, document.getElementById("root"));
```

---

## Automatic Batching

React 18 batches all state updates by default — including those
inside promises, `setTimeout`, and native event handlers. In
React 17, only updates inside React event handlers were batched.

```tsx
// React 18: single re-render for both updates
setTimeout(() => {
  setCount((c) => c + 1);
  setFlag((f) => !f);
  // React re-renders once (batched)
}, 1000);
```

### Opting Out

Use `flushSync` to force immediate re-renders when needed (rare).

```tsx
import { flushSync } from "react-dom";

function handleClick() {
  flushSync(() => {
    setCount((c) => c + 1);
  });
  // DOM updated here

  flushSync(() => {
    setFlag((f) => !f);
  });
  // DOM updated here
}
```

---

## Transitions

Transitions separate urgent updates (typing, clicking) from
non-urgent updates (rendering search results, navigating).

### `useTransition`

Returns `[isPending, startTransition]` for use inside components.

```tsx
import { useTransition, useState } from "react";

function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Urgent: update the input immediately
    setQuery(e.target.value);

    // Non-urgent: filter results in a transition
    startTransition(() => {
      setResults(filterData(e.target.value));
    });
  };

  return (
    <div>
      <input value={query} onChange={handleChange} />
      {isPending && <p>Updating...</p>}
      <ResultsList results={results} />
    </div>
  );
}
```

**Key points:**
- `isPending` is true while the transition is rendering
- Transitions are interruptible — new urgent updates cancel
  in-progress transition renders
- Transitions opt into concurrent rendering automatically

### `startTransition` (standalone)

Use when hooks are not available (e.g. outside components).

```tsx
import { startTransition } from "react";

function handleNavigation(url: string) {
  startTransition(() => {
    navigate(url);
  });
}
```

**Key points:**
- Does not provide `isPending` — use `useTransition` when you
  need pending state
- Useful in event handlers, utility functions, and libraries

---

## Suspense

React 18 expands Suspense beyond code splitting to support
concurrent rendering patterns and streaming SSR.

### Client-Side Suspense

```tsx
import { Suspense, lazy } from "react";

const Dashboard = lazy(() => import("./Dashboard"));

function App() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <Dashboard />
    </Suspense>
  );
}
```

### Nested Suspense Boundaries

Use multiple boundaries for granular loading states.

```tsx
function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Header />
      <Suspense fallback={<SidebarSkeleton />}>
        <Sidebar />
      </Suspense>
      <Suspense fallback={<ContentSkeleton />}>
        <MainContent />
      </Suspense>
    </Suspense>
  );
}
```

### Suspense With Transitions

When an update is wrapped in `startTransition`, Suspense will
not replace already-visible content with a fallback. Instead,
React continues showing the current content until the new content
is ready.

```tsx
function TabContainer() {
  const [tab, setTab] = useState("home");
  const [isPending, startTransition] = useTransition();

  const selectTab = (nextTab: string) => {
    startTransition(() => {
      setTab(nextTab);
    });
  };

  return (
    <div>
      <TabBar
        selectedTab={tab}
        onSelect={selectTab}
        isPending={isPending}
      />
      <Suspense fallback={<TabSkeleton />}>
        <TabContent tab={tab} />
      </Suspense>
    </div>
  );
}
```

---

## New Hooks

### `useId`

Generates stable unique IDs that are consistent across server
and client rendering. Primarily for accessibility attributes.

```tsx
import { useId } from "react";

function EmailField() {
  const id = useId();

  return (
    <div>
      <label htmlFor={id}>Email</label>
      <input id={id} type="email" />
    </div>
  );
}
```

**Key points:**
- Do NOT use `useId` for list keys — keys should come from data
- Each call produces a unique ID; use suffixes for related
  elements: `${id}-label`, `${id}-input`, `${id}-error`
- Works correctly with streaming SSR (no hydration mismatches)

### `useDeferredValue`

Defers a value to avoid blocking urgent updates. The deferred
value lags behind the actual value during re-renders.

```tsx
import { useDeferredValue, useMemo } from "react";

function SearchResults({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  const results = useMemo(
    () => filterLargeList(deferredQuery),
    [deferredQuery]
  );

  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      {results.map((r) => (
        <ResultItem key={r.id} item={r} />
      ))}
    </div>
  );
}
```

**Key points:**
- Similar to debouncing but with no fixed delay — React defers
  until after urgent updates are painted
- The deferred render is interruptible
- Pair with `useMemo` to avoid re-computing derived data on
  every render (React 18 does not have the compiler)

### `useSyncExternalStore`

Subscribes to external stores with concurrent-safe reads.
Intended for **library authors** (state management, browser
APIs).

```tsx
import { useSyncExternalStore } from "react";

function useOnlineStatus() {
  return useSyncExternalStore(
    // subscribe
    (callback) => {
      window.addEventListener("online", callback);
      window.addEventListener("offline", callback);
      return () => {
        window.removeEventListener("online", callback);
        window.removeEventListener("offline", callback);
      };
    },
    // getSnapshot (client)
    () => navigator.onLine,
    // getServerSnapshot (SSR)
    () => true
  );
}

function StatusBar() {
  const isOnline = useOnlineStatus();
  return <p>{isOnline ? "Online" : "Offline"}</p>;
}
```

**Key points:**
- Prevents "tearing" — ensures all components see the same
  store snapshot during a concurrent render
- The `getServerSnapshot` parameter is required for SSR
- Prefer this over `useEffect` + `useState` for external
  subscriptions (avoids race conditions)

### `useInsertionEffect`

Intended for **CSS-in-JS library authors** only — application
code should use `useEffect` or `useLayoutEffect`. It runs
before layout effects, but may run either before or after DOM
updates, so do not rely on exact DOM timing.

```tsx
import { useInsertionEffect } from "react";

// Library code only
function useCSS(rule: string) {
  useInsertionEffect(() => {
    const style = document.createElement("style");
    style.textContent = rule;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  });
}
```

**Timing note:** This hook is for style insertion use cases and
fires before layout effects. Do not depend on exact ordering
relative to DOM updates.

---

## Streaming SSR

React 18 adds streaming server rendering with Suspense support.

### `renderToPipeableStream` (Node.js)

```tsx
import { renderToPipeableStream } from "react-dom/server";

app.get("/", (req, res) => {
  const { pipe } = renderToPipeableStream(<App />, {
    bootstrapScripts: ["/client.js"],
    onShellReady() {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html");
      pipe(res);
    },
    onShellError(error) {
      res.statusCode = 500;
      res.send("<!doctype html><p>Server error</p>");
    },
    onError(error) {
      console.error(error);
    },
  });
});
```

### `renderToReadableStream` (Edge runtimes)

```tsx
import { renderToReadableStream } from "react-dom/server";

async function handler(request: Request) {
  const stream = await renderToReadableStream(<App />, {
    bootstrapScripts: ["/client.js"],
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/html" },
  });
}
```

### Selective Hydration

React 18 hydrates Suspense boundaries independently. Users can
interact with already-hydrated parts while other sections are
still loading. React prioritises hydrating the boundary the user
is interacting with.

---

## Strict Mode (Development)

React 18 Strict Mode double-invokes effects in development to
surface bugs with non-idempotent effects. This helps prepare for
future features that may unmount and remount components.

**Effect lifecycle in Strict Mode (dev only):**

1. Component mounts
2. Effects created
3. React simulates unmount (effects destroyed)
4. React simulates remount (effects recreated)

**Production behaviour is unchanged** — effects run once.

### Writing Resilient Effects

```tsx
useEffect(() => {
  const controller = new AbortController();
  fetch("/api/data", { signal: controller.signal })
    .then((res) => res.json())
    .then(setData)
    .catch((err) => {
      if (err.name !== "AbortError") throw err;
    });

  // Cleanup: abort on unmount
  return () => controller.abort();
}, []);
```

**Key points:**
- Always return cleanup functions from effects that create
  subscriptions, timers, or network requests
- Effects must be idempotent — running setup + cleanup + setup
  should produce the same result as running setup once
- Do not suppress Strict Mode — fix the underlying issue

---

## Error Boundaries

React 18 uses class components for error boundaries. There is no
hook equivalent.

```tsx
import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Uncaught error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
```

**Usage:**

```tsx
<ErrorBoundary fallback={<p>Something went wrong.</p>}>
  <Dashboard />
</ErrorBoundary>
```

**Key points:**
- Wrap route-level components and independent widgets
- Error boundaries do NOT catch errors in event handlers,
  async code, or SSR — only in the render tree
- Libraries like `react-error-boundary` provide a function
  component wrapper with retry support
- React 19 adds `onCaughtError`/`onUncaughtError` on
  `createRoot` for reporting; these do NOT replace error
  boundaries for fallback UI

---

## `forwardRef`

React 18 requires `forwardRef` to pass refs to child components.
(React 19 removes this requirement.)

```tsx
import { forwardRef } from "react";

interface InputProps {
  label: string;
  type?: string;
}

const TextInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, type = "text" }, ref) => {
    const id = useId();
    return (
      <div>
        <label htmlFor={id}>{label}</label>
        <input ref={ref} id={id} type={type} />
      </div>
    );
  }
);
TextInput.displayName = "TextInput";
```

**Key points:**
- Always set `displayName` for better DevTools readability
- Type the ref as the first generic parameter of `forwardRef`
- In React 19, `ref` becomes a regular prop — plan for
  migration by keeping ref-forwarding components simple

---

## Context Pattern

React 18 uses `<Context.Provider>`. (React 19 allows rendering
context directly as JSX.)

```tsx
import { createContext, useContext, useState } from "react";

interface ThemeContextValue {
  theme: "light" | "dark";
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const toggle = () =>
    setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
```

**Key points:**
- Always provide a custom hook with a null check for type safety
- Context value should be stable — memoize if the object is
  created on every render
- Split read-heavy and write-heavy contexts to avoid unnecessary
  re-renders

---

## Performance Patterns

### `React.memo`

Skips re-rendering when props haven't changed.

```tsx
import { memo } from "react";

interface ItemProps {
  id: string;
  name: string;
  onClick: (id: string) => void;
}

const ListItem = memo(function ListItem({
  id,
  name,
  onClick,
}: ItemProps) {
  return (
    <li onClick={() => onClick(id)}>
      {name}
    </li>
  );
});
```

### `useMemo` and `useCallback`

Memoize expensive computations and callback references.

```tsx
import { useMemo, useCallback } from "react";

function ProductList({
  products,
  category,
  onSelect,
}: {
  products: Product[];
  category: string;
  onSelect: (id: string) => void;
}) {
  const filtered = useMemo(
    () => products.filter((p) => p.category === category),
    [products, category]
  );

  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id);
    },
    [onSelect]
  );

  return (
    <ul>
      {filtered.map((p) => (
        <ListItem
          key={p.id}
          id={p.id}
          name={p.name}
          onClick={handleSelect}
        />
      ))}
    </ul>
  );
}
```

**When to memoize:**
- `useMemo`: expensive computations, reference-stable objects
  passed to memoized children
- `useCallback`: callbacks passed to memoized children or used
  in dependency arrays
- `React.memo`: components that re-render often with the same
  props
- Do NOT memoize everything — measure first with React DevTools
  Profiler

### Code Splitting

```tsx
import { lazy, Suspense } from "react";

// Split at route boundaries
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));

function Router() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {/* route logic renders Settings or Profile */}
    </Suspense>
  );
}
```

---

## TypeScript Patterns

### Component Props

```tsx
interface ButtonProps {
  variant: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  children: React.ReactNode;
}

function Button({
  variant,
  size = "md",
  onClick,
  children,
}: ButtonProps) {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

### Discriminated Unions

```tsx
type AlertProps =
  | { type: "success"; message: string }
  | { type: "error"; message: string; retry: () => void };

function Alert(props: AlertProps) {
  if (props.type === "error") {
    return (
      <div>
        <p>{props.message}</p>
        <button onClick={props.retry}>Retry</button>
      </div>
    );
  }
  return <div><p>{props.message}</p></div>;
}
```

### Generic Components

```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({
  items,
  renderItem,
  keyExtractor,
}: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```

### Hook Return Types

```tsx
function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = () => setValue((v) => !v);
  return [value, toggle] as const;
}
// Return type: readonly [boolean, () => void]
```

### Event Handler Typing

```tsx
function Form() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // process formData
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input onChange={handleChange} />
      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## Decision Trees

### State Management

| Scenario | Solution |
| --- | --- |
| Local UI state (toggle, input) | `useState` |
| Derived/computed value | Compute in render |
| Complex state logic | `useReducer` |
| Shared across siblings | Lift state up |
| Shared across tree | Context + `useContext` |
| External store subscription | `useSyncExternalStore` |
| Global client state | Zustand / Redux Toolkit |
| Server state / caching | TanStack Query / SWR |

### Effect Patterns

| Scenario | Solution |
| --- | --- |
| Sync with external system | `useEffect` with cleanup |
| DOM measurement before paint | `useLayoutEffect` |
| Derived from props/state | Compute in render (no effect) |
| One-time setup | `useEffect` with `[]` deps |
| External subscription | `useSyncExternalStore` |
| CSS injection (library) | `useInsertionEffect` |

### Performance Optimization

| Scenario | Solution |
| --- | --- |
| Expensive computation | `useMemo` |
| Stable callback for child | `useCallback` |
| Skip re-render (same props) | `React.memo` |
| Non-urgent update | `startTransition` |
| Debounce without delay | `useDeferredValue` |
| Code splitting at route | `React.lazy` + `Suspense` |

---

## Common Mistakes to Flag

1. **Using `ReactDOM.render` instead of `createRoot`** — disables
   all concurrent features including automatic batching in async
   contexts
2. **Missing cleanup in effects** — causes memory leaks and
   double-execution bugs under Strict Mode
3. **Over-memoizing** — wrapping every value in `useMemo` or
   `useCallback` without measuring; adds complexity for no gain
4. **Using `useEffect` for derived state** — compute in render
   instead; effects cause an extra render cycle
5. **Forgetting `displayName` on `forwardRef` components** —
   shows "Anonymous" in DevTools
6. **Creating unstable context values** — object literals in
   Provider `value` cause all consumers to re-render; memoize
   or split contexts
7. **Using `useId` for list keys** — `useId` is for accessibility
   attributes, not array rendering; keys must come from data
8. **Suppressing Strict Mode warnings** — fix the underlying
   effect issue instead of removing `<StrictMode>`
9. **Missing `getServerSnapshot` in `useSyncExternalStore`** —
   causes hydration failures when using SSR
10. **`eslint-plugin-react-hooks` not installed** — exhaustive
    deps rule prevents stale closure bugs; always enable it

---

## Migration Notes: React 18 → 19

When planning an upgrade to React 19, these are the key changes:

- `forwardRef` → ref as a regular prop
- `<Context.Provider>` → render Context directly as JSX
- `useContext` → `use()` for conditional reads
- Manual `useMemo`/`useCallback` → React Compiler (automatic)
- `useEffect` + onChange → `useActionState` for form handling
- Custom form state → `useFormStatus` + `useOptimistic`
- `createRoot` adds `onCaughtError`/`onUncaughtError` for
  reporting (error boundaries are still needed for fallback UI)
- Offscreen (experimental) → `<Activity>` (stable in 19.2)
- `useEvent` RFC → `useEffectEvent` (stable in 19.2)

**Tip:** Upgrade to React 18.3 first. It adds console warnings
for deprecated APIs that are removed in React 19, making the
migration smoother.

See the `cc-react-19-patterns` skill for React 19+ guidance.

<!-- This skill is part of the ccube-software-craft plugin. -->
