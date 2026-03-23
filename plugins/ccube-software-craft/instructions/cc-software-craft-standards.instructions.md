---
description: >-
  Mandatory coding standards for naming, function design, error handling,
  constants, comments, testing, documentation, accessibility, and module
  design. Apply to ALL code generation and modification tasks across any
  language or framework — these are the minimum quality bar for any code
  written or changed.
applyTo: "**/*"
---

# Software Craft Coding Standards

These standards apply to all code in the workspace regardless of language,
framework, or file type. They express the minimum quality bar for any
production code.

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
- Avoid abbreviations unless the abbreviation is universal in the domain
  (`id`, `url`, `api` are acceptable; `usr`, `mgr`, `proc` are not).

---

## Functions and Methods

- A function does one thing. If a one-sentence description requires "and",
  it does too many things — split it.
- Target fewer than 20 lines. Treat 40+ lines as a hard signal to refactor.
- Limit parameters to three or fewer. If more are needed, group related
  parameters into a named object.
- No flag arguments (`sendEmail(user, true)`). Two boolean outcomes mean
  two functions.
- Side effects must be obvious from the function's name. Functions with
  hidden side effects are bugs waiting to be filed.
- Prefer pure functions (same inputs always produce same outputs, no side
  effects) wherever practical. They are trivially testable.
- Use early returns and guard clauses for preconditions and error cases.
  Surface failures at the top of a function so the happy path is visible
  without nesting. Avoid the `else` branch when the `if` already returns.

---

## Error Handling

- Handle errors explicitly. Do not catch and ignore exceptions unless the
  silence is intentional and documented with a comment explaining why.
- Fail fast at system boundaries: validate user input, external API
  responses, and environment configuration at entry points, not deep in
  the call stack.
- Do not use exceptions for control flow. Exceptions signal unexpected,
  exceptional conditions — not predictable business outcomes like "record
  not found."
- Errors returned from a function are part of its contract. Callers should
  not be surprised by what can fail.

## Constants and Magic Values

- Replace magic numbers and strings with named constants.
  `MAX_RETRY_ATTEMPTS = 3` communicates intent; `3` does not. Named
  constants also create a single place to change a value across the
  codebase.
- Co-locate constants with the code that owns them. A constant shared
  across many modules belongs at a shared boundary, not scattered.
- Boolean literals passed directly to functions are a form of magic value.
  Name the intent: `sendEmail(user, { includeWelcome: true })` is clearer
  than `sendEmail(user, true)`.

---

## Comments

- Comment why, not what. The what is visible from the code; the why often
  is not.
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
  break during refactoring and produce false negatives.
- Name tests to describe behaviour: what is being tested, under what
  condition, and what is expected. The test name should be readable as a
  specification.
- Tests must be deterministic. Flaky tests that pass sometimes and fail
  sometimes are worse than no test — they erode confidence in the suite.
- A failing test must fail for one clear reason. A test with 10 assertions
  testing 10 different things produces ambiguous failures.

---

## Documentation

- Document the public contract of every module, class, or function with
  external callers. The minimum: what it does, what it accepts, what it
  returns, and what can fail. In TypeScript, use JSDoc for this.
- Keep documentation co-located with code, not in a separate wiki.
  Documentation that drifts from the code it describes becomes
  misinformation.
- README files answer four questions in order: what is this, how do I
  set it up, how do I run it, how do I contribute.
- Delete or update documentation whenever the code it describes changes.
  Stale docs are worse than no docs — they actively mislead.

---

## Accessibility

- Use semantic HTML elements. A `<button>` communicates interactive intent
  to assistive technology; a `<div onClick>` does not.
- Every interactive element must be keyboard-navigable and have a
  discernible accessible name.
- Images and non-text content require descriptive `alt` text or
  `aria-label`. Empty `alt=""` is correct for decorative images.
- Colour alone must not convey meaning — pair it with text, icons, or
  patterns so the information survives colour-blindness or high-contrast
  mode.

---

## Module and File Design

- A module/file has one primary responsibility. If it is hard to name the
  file without using "and" or "or", it is doing too much.
- Imports/dependencies must be explicit. Do not rely on global state or
  implicit module side effects.
- Circular dependencies between modules signal a design boundary problem.
  Resolve by introducing an abstraction or reorganising the boundary.
- Public API surface should be minimal. Only export what external callers
  need.

---

## Security Baseline

- Never hardcode credentials, API keys, tokens, or secrets. Use environment
  variables or a secrets manager.
- Validate and sanitise all external input: user-supplied data, environment
  variables, third-party API responses.
- Do not log sensitive data: passwords, tokens, PII, financial data.
- Apply least privilege: code should only request and use the permissions
  it actually needs.

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
