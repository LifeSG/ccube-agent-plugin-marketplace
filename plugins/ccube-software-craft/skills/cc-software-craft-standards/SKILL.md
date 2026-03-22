---
name: "cc-software-craft-standards"
description: >-
  Mandatory coding standards for naming, function design, error handling,
  constants, comments, testing, documentation, accessibility, and module
  design. Apply to ALL code generation and modification tasks across any
  language or framework — these are the minimum quality bar for any code
  written or changed. ALWAYS load when writing or editing any code.
user-invokable: false
---

# Software Craft Coding Standards

These standards apply to all code regardless of language, framework, or
file type. They express the minimum quality bar for any production code.

---

## Naming

- Names reveal intent. A name that requires an inline comment to explain
  it is too short or too vague — rename it.
- Use domain language. Name things after what they represent in the
  business domain (`invoice`, `shipment`, `customer`), not after their
  technical container (`data`, `obj`, `temp`, `info`).
- Boolean identifiers assert a state: `isActive`, `hasPermission`,
  `shouldRetry`. Never `flag`, `status`, or `check`.
- Functions use verb phrases that describe what they do:
  `calculateTotal()`, `sendWelcomeEmail()`, `validateAddress()`.
- Avoid abbreviations unless universal in the domain (`id`, `url`, `api`
  are acceptable; `usr`, `mgr`, `proc` are not).

---

## Functions and Methods

- A function does one thing. If a one-sentence description requires
  "and", it does too many things — split it.
- Target fewer than 20 lines. Treat 40+ lines as a hard signal to
  refactor.
- Limit parameters to three or fewer. If more are needed, group related
  parameters into a named object.
- No flag arguments (`sendEmail(user, true)`). Two boolean outcomes mean
  two functions.
- Side effects must be obvious from the function's name. Hidden side
  effects are bugs waiting to be filed.
- Prefer pure functions wherever practical — they are trivially testable.
- Use early returns and guard clauses for preconditions and error cases.
  Avoid the `else` branch when the `if` already returns.

---

## Error Handling

- Handle errors explicitly. Do not catch and ignore exceptions unless
  intentional and documented with a comment explaining why.
- Fail fast at system boundaries: validate user input, external API
  responses, and environment config at entry points, not deep in the
  call stack.
- Do not use exceptions for control flow. Exceptions signal unexpected
  conditions — not predictable outcomes like "record not found."
- Errors returned from a function are part of its contract. Callers
  should not be surprised by what can fail.

---

## Constants and Magic Values

- Replace magic numbers and strings with named constants.
  `MAX_RETRY_ATTEMPTS = 3` communicates intent; `3` does not.
- Co-locate constants with the code that owns them. Shared constants
  belong at a shared boundary, not scattered.
- Boolean literals passed directly to functions are a form of magic
  value. Name the intent: `sendEmail(user, { includeWelcome: true })`.

---

## Comments

- Comment why, not what. The what is visible from the code; the why
  often is not.
- Delete commented-out code. Version history exists for recovery.
- `TODO` and `FIXME` comments must include a reference (issue number or
  owner). Unattributed TODOs are permanent.
- If a comment is needed to explain a block of code, that block should
  likely be a named function instead.

---

## Testing

- New behaviour requires a test. Code without a test is an assumption
  waiting to be disproved in production.
- Tests verify behaviour, not implementation. Tests coupled to internals
  break during refactoring.
- Name tests to describe behaviour: what is being tested, under what
  condition, and what is expected.
- Tests must be deterministic. Flaky tests erode confidence in the suite.
- A failing test must fail for one clear reason.

---

## Documentation

- Document the public contract of every module, class, or function with
  external callers: what it does, what it accepts, what it returns, and
  what can fail. In TypeScript, use JSDoc.
- Keep documentation co-located with code, not in a separate wiki.
- README files answer four questions: what is this, how do I set it up,
  how do I run it, how do I contribute.
- Delete or update documentation whenever the code it describes changes.
  Stale docs actively mislead.

---

## Accessibility

- Use semantic HTML elements. A `<button>` communicates interactive
  intent; a `<div onClick>` does not.
- Every interactive element must be keyboard-navigable and have a
  discernible accessible name.
- Images and non-text content require descriptive `alt` text or
  `aria-label`. Empty `alt=""` is correct for decorative images.
- Colour alone must not convey meaning — pair it with text, icons, or
  patterns.

---

## Module and File Design

- A module/file has one primary responsibility. If it is hard to name
  without using "and" or "or", it is doing too much.
- Imports/dependencies must be explicit. Do not rely on global state or
  implicit side effects.
- Circular dependencies signal a design boundary problem.
- Public API surface should be minimal. Only export what external
  callers need.

---

## Security Baseline

- Never hardcode credentials, API keys, tokens, or secrets. Use
  environment variables or a secrets manager.
- Validate and sanitise all external input: user-supplied data,
  environment variables, third-party API responses.
- Do not log sensitive data: passwords, tokens, PII, financial data.
- Apply least privilege: code should only request the permissions it
  actually needs.

---

## Code Review Readiness

Before submitting code for review, verify:

- [ ] The code does what it is described as doing
- [ ] No debug statements, temporary hacks, or commented-out code remain
- [ ] New behaviour has test coverage
- [ ] No secrets or sensitive values are present
- [ ] Naming follows the standards above
- [ ] Functions are under 40 lines
- [ ] The PR description answers "what" and "why"
