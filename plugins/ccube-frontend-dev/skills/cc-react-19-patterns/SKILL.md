---
name: cc-react-19-patterns
description: >-
  React 19.2 modern patterns reference — hooks, Actions API, Server
  Components, concurrent rendering, TypeScript integration, and
  quality-of-life improvements. Use when implementing, reviewing,
  or debugging React components in any React 19+ project.
user-invocable: false
---

# React Modern Patterns Reference

Authoritative quick-reference for React 19–19.2 patterns. This
skill is loaded automatically when the agent works on React code.
It covers hooks, APIs, and conventions introduced or stabilised in
React 19.0, 19.1, and 19.2.

**Version baseline**: Prefer latest React 19.x stable. For
React Server Components packages, known fixed backports for the
2025/2026 advisories include `19.0.4`, `19.1.5`, and `19.2.4`;
flag earlier patch versions.

**React Compiler**: v1.0+ is stable (October 2025). Prefer
compiler defaults for new code, but keep/remove existing manual
memoization only with measurement and profiling.

> **Note:** Code examples use vanilla React elements. When working
> in a design system context, substitute the corresponding design
> system components (e.g. FDS `Input`, `Button`, `Select`).

> **Version guard:** If both React 18 and React 19 skills are
> loaded, follow the skill matching the project's `react` version
> in `package.json`.

---

## Actions API

Actions are async functions used in transitions to handle pending
states, errors, forms, and optimistic updates automatically.

### `useActionState`

Manages form action state. Returns `[state, action, isPending]`.

```tsx
import { useActionState } from "react";

interface FormState {
  error?: string;
  success?: boolean;
}

async function updateName(
  prev: FormState,
  formData: FormData
): Promise<FormState> {
  const name = formData.get("name") as string;
  if (!name) return { error: "Name is required" };
  await saveToServer(name);
  return { success: true };
}

function NameForm() {
  const [state, submitAction, isPending] = useActionState(
    updateName,
    {}
  );

  return (
    <form action={submitAction}>
      <input type="text" name="name" />
      <button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Save"}
      </button>
      {state.error && <p>{state.error}</p>}
    </form>
  );
}
```

**Key points:**
- Wraps an async function and returns the last result as state
- The wrapped action is passed to `<form action={...}>`
- `isPending` is true while the action is in flight
- Previously named `useFormState` — that name is deprecated

### `useFormStatus`

Reads the status of a parent `<form>`. Import from `react-dom`.

```tsx
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "Submitting..." : "Submit"}
    </button>
  );
}
```

**Key points:**
- Must be rendered inside a `<form>` — reads the nearest parent
- Returns `{ pending, data, method, action }`
- Ideal for design system submit buttons that need loading state

### `useOptimistic`

Shows an optimistic value while an async action is in flight.

```tsx
import { useOptimistic } from "react";

function MessageList({
  messages,
  sendMessage,
}: {
  messages: Message[];
  sendMessage: (text: string) => Promise<void>;
}) {
  const [optimistic, addOptimistic] = useOptimistic(
    messages,
    (current, newText: string) => [
      ...current,
      { id: "temp", text: newText, sending: true },
    ]
  );

  const formAction = async (formData: FormData) => {
    const text = formData.get("text") as string;
    addOptimistic(text);
    await sendMessage(text);
  };

  return (
    <>
      {optimistic.map((m) => (
        <p key={m.id} style={{ opacity: m.sending ? 0.5 : 1 }}>
          {m.text}
        </p>
      ))}
      <form action={formAction}>
        <input name="text" />
        <button type="submit">Send</button>
      </form>
    </>
  );
}
```

**Key points:**
- Reverts to the real value automatically on success or error
- The reducer receives current state and the optimistic value
- Pair with `useActionState` for full form workflows

### `<form>` with Actions

React 19 supports passing functions to `action` and `formAction`
props. The form resets automatically on success for uncontrolled
components.

```tsx
<form action={async (formData) => {
  await submitData(formData);
}}>
  <input name="email" type="email" />
  <button type="submit">Subscribe</button>
</form>
```

---

## `use()` Hook

Reads a resource (promise or context) during render. Unlike other
hooks, `use()` can be called conditionally.

### Reading a Promise

```tsx
import { use, Suspense } from "react";

function UserProfile({
  userPromise,
}: {
  userPromise: Promise<User>;
}) {
  const user = use(userPromise);
  return <h2>{user.name}</h2>;
}

// Parent provides the promise and Suspense boundary
function Page({ userId }: { userId: string }) {
  const userPromise = fetchUser(userId);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfile userPromise={userPromise} />
    </Suspense>
  );
}
```

### Reading Context Conditionally

```tsx
import { use } from "react";

function Heading({ children }: { children?: React.ReactNode }) {
  if (!children) return null;

  // use() works after early returns — useContext() does not
  const theme = use(ThemeContext);
  return <h1 style={{ color: theme.color }}>{children}</h1>;
}
```

**Key points:**
- Suspends rendering until the promise resolves
- Do NOT create promises inside render — pass them from a parent
  or use a Suspense-compatible data fetching library
- For context, `use()` replaces `useContext()` when conditional
  reading is needed

---

## React 19.2 Features

### `<Activity>`

Controls UI visibility and state preservation. Two modes:
`visible` and `hidden`.

```tsx
import { Activity } from "react";

function TabPanel({
  isActive,
  children,
}: {
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <Activity mode={isActive ? "visible" : "hidden"}>
      {children}
    </Activity>
  );
}
```

**Key points:**
- `hidden` — hides children, unmounts effects, defers updates
- `visible` — shows children, mounts effects, processes updates
- Preserves component state across visibility toggles
- Use for tab panels, navigation pre-rendering, back-navigation
  state preservation
- Replaces conditional rendering (`{show && <Page />}`) when
  state preservation is needed

### `useEffectEvent()`

Extracts non-reactive logic from effects so that "event" values
do not cause the effect to re-run.

```tsx
import { useEffect, useEffectEvent } from "react";

function ChatRoom({
  roomId,
  theme,
}: {
  roomId: string;
  theme: string;
}) {
  // theme changes should NOT reconnect the chat
  const onConnected = useEffectEvent(() => {
    showNotification("Connected!", theme);
  });

  useEffect(() => {
    const conn = createConnection(roomId);
    conn.on("connected", () => onConnected());
    conn.connect();
    return () => conn.disconnect();
  }, [roomId]);
  // onConnected is NOT a dependency
}
```

**Key points:**
- Always reads the latest props/state (like a DOM event handler)
- Must NOT appear in dependency arrays
- Must be declared in the same component or hook as the effect
- Requires `eslint-plugin-react-hooks@latest` (v6+) for correct
  linting
- Use when an effect needs to "fire an event" that reads reactive
  values without re-running the effect

### `cacheSignal`

Allows aborting cached fetch calls when the cache lifetime ends.
**RSC-only** — not applicable to client-side Vite projects.

```tsx
import { cache, cacheSignal } from "react";

const dedupedFetch = cache(fetch);

async function ServerComponent() {
  await dedupedFetch(url, { signal: cacheSignal() });
}
```

### Performance Tracks

React 19.2 adds custom tracks to Chrome DevTools performance
profiles:
- **Scheduler track** — shows priority scheduling (blocking vs
  transition)
- **Components track** — shows mount/render/effect timing per
  component

Use the React DevTools Profiler alongside Performance Tracks for
comprehensive performance analysis.

---

## React 19 Quality-of-Life Improvements

### Ref as Prop

Pass `ref` directly as a prop — `forwardRef` is no longer needed.

```tsx
function TextInput({
  ref,
  ...props
}: {
  ref?: React.Ref<HTMLInputElement>;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return <input ref={ref} {...props} />;
}

// Usage
<TextInput ref={inputRef} placeholder="Type here" />
```

### Context Without Provider

Render context directly as JSX instead of `<Context.Provider>`.

```tsx
const ThemeContext = createContext("light");

function App({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext value="dark">
      {children}
    </ThemeContext>
  );
}
```

### Ref Callbacks With Cleanup

Return a cleanup function from ref callbacks.

```tsx
<div
  ref={(node) => {
    if (node) {
      const observer = new ResizeObserver(handleResize);
      observer.observe(node);
      return () => observer.disconnect();
    }
  }}
/>
```

**Note:** Do not use implicit returns in ref callbacks —
TypeScript will reject them. Use explicit `return`.

### Document Metadata in Components

Place `<title>`, `<meta>`, and `<link>` directly in components.
React hoists them to `<head>` automatically.

```tsx
function BlogPost({ post }: { post: Post }) {
  return (
    <article>
      <title>{post.title}</title>
      <meta name="author" content={post.author} />
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

### `useDeferredValue` With Initial Value

Provide an initial value for the first render.

```tsx
const deferredQuery = useDeferredValue(query, "");
// First render: ""
// Background re-render: actual query value
```

---

## Concurrent Rendering Patterns

### `startTransition`

Mark updates as non-urgent to keep the UI responsive.

```tsx
import { startTransition } from "react";

function handleSearch(query: string) {
  // Urgent: update the input
  setInput(query);

  // Non-urgent: update the filtered results
  startTransition(() => {
    setResults(filterData(query));
  });
}
```

### `useDeferredValue`

Defer a value to avoid blocking urgent updates.

```tsx
import { useDeferredValue } from "react";

function SearchResults({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <div style={{ opacity: isStale ? 0.5 : 1 }}>
      <Results query={deferredQuery} />
    </div>
  );
}
```

### Suspense Boundaries

Wrap async components with `<Suspense>` for graceful loading.

```tsx
<Suspense fallback={<Skeleton />}>
  <AsyncComponent />
</Suspense>
```

**Key points:**
- Nest multiple boundaries for granular loading states
- In React 19.2, SSR Suspense boundaries are batched for
  smoother reveals
- Pair with `React.lazy()` for code splitting at route
  boundaries

---

## Server Components and Server Actions

### Server Components (RSC)

- Run on the server, not bundled to the client
- Can `async/await` directly for data fetching
- No directive needed — components are server by default in RSC
  frameworks
- Mark client components with `"use client"` when they need
  interactivity

### Server Actions

- Defined with `"use server"` directive
- Called from client components as regular async functions
- Framework handles the server request transparently

```tsx
// actions.ts
"use server";

export async function saveUser(formData: FormData) {
  const name = formData.get("name") as string;
  await db.users.update({ name });
}
```

```tsx
// UserForm.tsx
"use client";

import { saveUser } from "./actions";

export function UserForm() {
  return (
    <form action={saveUser}>
      <input name="name" />
      <button type="submit">Save</button>
    </form>
  );
}
```

### Security Note

React Server Components had critical and follow-up advisories in
December 2025 and January 2026. For impacted RSC packages,
upgrade to fixed patch lines such as `19.0.4`, `19.1.5`,
`19.2.4`, or newer. Apps not using server/RSC paths are not
affected.

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

### Discriminated Unions for Variants

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

---

## Decision Trees

### State Management

| Scenario                       | Solution                |
| ------------------------------ | ----------------------- |
| Local UI state (toggle, input) | `useState`              |
| Form submission state          | `useActionState`        |
| Derived/computed value         | Compute in render       |
| Shared across siblings         | Lift state up           |
| Shared across tree             | Context + `use()`       |
| Complex state logic            | `useReducer`            |
| Global client state            | Zustand / Redux Toolkit |
| Server state / caching         | TanStack Query / SWR    |

### Form Handling

| Scenario                    | Solution                           |
| --------------------------- | ---------------------------------- |
| Simple client form          | `useActionState` + `<form action>` |
| Loading indicator in form   | `useFormStatus` in submit button   |
| Optimistic UI during submit | `useOptimistic`                    |
| Server-side validation      | Server Action + `useActionState`   |
| Multi-step wizard           | `useReducer` + `startTransition`   |

### Effect Patterns

| Scenario                    | Solution                      |
| --------------------------- | ----------------------------- |
| Sync with external system   | `useEffect`                   |
| Event in effect (no re-run) | `useEffectEvent`              |
| Derived from props/state    | Compute in render (no effect) |
| One-time setup              | `useEffect` with `[]` deps    |
| Subscription with cleanup   | `useSyncExternalStore`        |

---

## Common Mistakes to Flag

1. **Creating promises in render** — pass promises from parents
   or use data fetching libraries with `use()`
2. **Manual memoization with React Compiler** — `useMemo` and
   `useCallback` are rarely needed when the compiler is active
3. **`forwardRef` in new code** — use ref as a regular prop
4. **Using legacy `<Context.Provider>` in new React 19 code** —
  valid but verbose; prefer `<Context value={...}>`
5. **`useContext` for conditional reads** — use `use()` instead
6. **`useEffect` for derived state** — compute in render
7. **`eslint-plugin-react-hooks` < v6** — upgrade to support
   `useEffectEvent` and React Compiler rules
8. **Outdated RSC patch levels** — use fixed patch lines (for
  example `19.0.4`, `19.1.5`, `19.2.4`) or newer

<!-- This skill is part of the ccube-frontend-dev plugin. -->
