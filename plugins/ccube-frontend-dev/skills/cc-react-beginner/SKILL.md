---
name: cc-react-beginner
description: >-
  React beginner fundamentals — JSX, functional components, props,
  state, conditional rendering, list rendering, useEffect, data
  fetching, component composition, and common rookie mistakes. Use
  when implementing basic React features or when the user is new
  to React.
user-invocable: false
---

# React Beginner Patterns

Quick-reference for React fundamentals. This skill covers the
building blocks every React developer must know before writing
production code.

**Version baseline**: Targets React 18.x. Hooks require React
16.8+. See `cc-react-18-patterns` for React 18-specific
concurrent rendering patterns.

---

## JSX

JSX is syntactic sugar for `React.createElement`. It looks like
HTML but has key differences:

- Use `className` instead of `class`
- Self-close void elements: `<br />`, `<img />`
- Expressions go inside `{curly braces}`
- A component must return a single root element — wrap siblings
  in `<>...</>` (Fragment) to avoid adding extra DOM nodes

```tsx
function Greeting({ name }: { name: string }) {
  const isLoggedIn = true;

  return (
    <>
      <h1>Hello, {name}!</h1>
      {isLoggedIn && <p>Welcome back.</p>}
    </>
  );
}
```

**Key point:** JSX attributes use camelCase:
`onClick`, `onChange`, `htmlFor`, `tabIndex`.

---

## Functional Components

A component is a function that accepts props and returns JSX.

```tsx
// Named function (recommended — better stack traces)
function Badge({ label }: { label: string }) {
  return <span className="badge">{label}</span>;
}

// Arrow function variant (equivalent)
const Badge = ({ label }: { label: string }) => (
  <span className="badge">{label}</span>
);
```

**Rules:**

- Component names MUST start with a capital letter —
  `<badge />` is treated as a DOM element; `<Badge />` is a
  component
- Components must be pure — given the same props, they must
  return the same JSX (no side effects in the render body)

---

## Props

Props are read-only inputs passed from parent to child.

```tsx
interface UserCardProps {
  name: string;
  role: string;
  avatarUrl?: string; // optional prop
}

function UserCard({ name, role, avatarUrl }: UserCardProps) {
  return (
    <div>
      {avatarUrl && <img src={avatarUrl} alt={name} />}
      <h2>{name}</h2>
      <p>{role}</p>
    </div>
  );
}

// Usage
<UserCard name="Alice" role="Engineer" />
```

**Key points:**

- Never mutate props — they flow one way, parent to child
- Provide defaults with destructuring: `{ size = "md" }`
- Pass functions as props for child-to-parent communication

### Passing Children

```tsx
function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

// Usage
<Card>
  <h2>Title</h2>
  <p>Content goes here.</p>
</Card>
```

---

## State (`useState`)

State is local, mutable data that causes a re-render when it
changes.

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
    </div>
  );
}
```

**Rules:**

- NEVER directly mutate state: `count++` — always call the
  setter: `setCount(count + 1)`
- When new state depends on old state, use the functional form:
  `setCount(prev => prev + 1)`
- Objects and arrays must be replaced, not mutated:

```tsx
// Wrong — mutates existing object
user.name = "Alice";
setUser(user);

// Correct — creates a new object
setUser({ ...user, name: "Alice" });

// Wrong — mutates existing array
items.push(newItem);
setItems(items);

// Correct — creates a new array
setItems([...items, newItem]);
```

---

## Conditional Rendering

```tsx
function Status({ isLoggedIn }: { isLoggedIn: boolean }) {
  // if/else for complex conditions
  if (!isLoggedIn) {
    return <p>Please log in.</p>;
  }

  return (
    <div>
      {/* && for "show if true" */}
      {isLoggedIn && <p>Welcome!</p>}

      {/* Ternary for "show A or B" */}
      {isLoggedIn ? <Dashboard /> : <LoginPage />}
    </div>
  );
}
```

**Key points:**

- `{count && <p>Count: {count}</p>}` is a **trap** when
  `count` is `0` — React renders `0` (falsy number) as a
  visible character. Use `{count > 0 && ...}` or a ternary.
- Returning `null` renders nothing: `if (!data) return null;`

---

## List Rendering

Use `.map()` to render lists. Every item needs a unique `key`.

```tsx
interface Product {
  id: string;
  name: string;
  price: number;
}

function ProductList({ products }: { products: Product[] }) {
  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          {product.name} — ${product.price}
        </li>
      ))}
    </ul>
  );
}
```

**Key rules:**

- `key` must be unique among siblings, stable, and from your
  data (e.g., a database ID)
- NEVER use array index as key when the list can be reordered,
  filtered, or have items added/removed — causes rendering bugs
- Index as key is only safe for static, never-reordered lists
- `key` is not accessible as a prop inside the component

---

## Side Effects (`useEffect`)

`useEffect` runs code after render — use it to sync with
external systems (APIs, subscriptions, DOM manipulation).

```tsx
import { useEffect, useState } from "react";

function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Runs after every render where userId changed
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then(setUser);

    // Cleanup runs before the next effect or on unmount
    return () => {
      // cancel requests, clear timers, remove listeners
    };
  }, [userId]); // dependency array

  if (!user) return <p>Loading...</p>;
  return <p>{user.name}</p>;
}
```

**Dependency array rules:**

- `[]` — run once on mount only
- `[userId]` — run when `userId` changes
- No array — run after every render (almost always a bug)
- Every value used inside the effect MUST be in the array —
  install `eslint-plugin-react-hooks` to catch violations

**Do NOT use `useEffect` for:**

- Derived/computed values (compute in render instead)
- Transforming data on load (compute in render)
- Responding to prop changes to update other state

---

## Data Fetching Pattern

Prefer a library (TanStack Query, SWR) for production. For
simple cases, use `useEffect` with abort cleanup:

```tsx
import { useEffect, useState } from "react";

function useUser(userId: string) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/users/${userId}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setUser)
      .catch((err) => {
        if (err.name !== "AbortError") setError(err);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [userId]);

  return { user, loading, error };
}
```

---

## Component Composition

Break UIs into small, focused components. Each component does
one thing.

```tsx
// Bad: one giant component does everything
function Page() {
  return (
    <div>
      {/* 200 lines of JSX */}
    </div>
  );
}

// Good: composed from smaller focused pieces
function Page() {
  return (
    <Layout>
      <Header />
      <main>
        <Sidebar />
        <ArticleList />
      </main>
      <Footer />
    </Layout>
  );
}
```

**When to split a component:**

- It has more than one responsibility
- Parts of it are reused elsewhere
- It is hard to read or test
- Conditional rendering makes it hard to follow

---

## Lifting State Up

When two siblings need to share state, lift it to their common
parent.

```tsx
function FilterableList() {
  // State lives here — shared between Filter and List
  const [filter, setFilter] = useState("");

  return (
    <div>
      <Filter value={filter} onChange={setFilter} />
      <ItemList filter={filter} />
    </div>
  );
}
```

---

## Common Rookie Mistakes

1. **Mutating state directly** — `state.value = x` instead of
   calling the setter; the component will not re-render
2. **Using index as list key** — causes ghost UI bugs when
   items are added, removed, or reordered
3. **Falsy number `0` in JSX** —
   `{count && <p>...</p>}` renders `0` to the screen when
   count is 0; use a ternary or `{count > 0 && ...}`
4. **Missing effect cleanup** — not returning a cleanup
   function causes memory leaks and stale data after unmount
5. **Missing deps in `useEffect`** — causes stale closures;
   always install `eslint-plugin-react-hooks`
6. **Fetching without abort** — if the component unmounts
   before the fetch resolves, it tries to setState on an
   unmounted component; always use `AbortController`
7. **Defining components inside other components** — a
   component defined inside render is recreated on every
   render, breaking keys, focus, and state; move it outside

   ```tsx
   // Wrong: ListItem is recreated on every render of List
   function List({ items }) {
     const ListItem = ({ item }) => <li>{item.name}</li>;
     return <ul>{items.map((i) => <ListItem key={i.id} item={i} />)}</ul>;
   }

   // Correct: define ListItem outside List
   const ListItem = ({ item }) => <li>{item.name}</li>;
   function List({ items }) { ... }
   ```

8. **Untyped props** — relying on implicit `any`; always
   define a TypeScript interface for props
9. **Prop drilling too deep** — passing props through 4+
   component layers; reach for Context or a state library
10. **Over-using `useEffect`** — most derived data should be
    computed directly in render, not synced via effect

---

## Decision Tree: Common Scenarios

| Scenario                      | Solution                                |
| ----------------------------- | --------------------------------------- |
| Show/hide an element          | Conditional rendering (`&&` or ternary) |
| Render a list                 | `.map()` with stable `key` from data    |
| Track user input              | `useState`                              |
| Fetch data on mount           | `useEffect(() => {...}, [])`            |
| Fetch when a value changes    | `useEffect(() => {...}, [value])`       |
| Share state between siblings  | Lift state to parent                    |
| Share state across the tree   | Context + `useContext`                  |
| Reuse logic across components | Custom hook (`useXxx`)                  |
| Avoid prop drilling           | Context or state library                |
| Complex state transitions     | `useReducer`                            |

<!-- This skill is part of the ccube-software-craft plugin. -->
