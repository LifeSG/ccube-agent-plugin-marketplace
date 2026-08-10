# Software Craft Coding Standards

These standards apply to all code regardless of language,
framework, or file type. They express the minimum quality bar for
any production code. Use these as review criteria when assessing
implementation quality.

## Naming

- Names reveal intent. A name that requires an inline comment to
  explain it is too short or too vague — rename it.
- Use domain language: `invoice`, `shipment`, `customer` — not
  `data`, `obj`, `temp`, `info`.
- Boolean identifiers assert a state: `isActive`,
  `hasPermission`, `shouldRetry`. Never `flag`, `status`, or
  `check`.
- Functions use verb phrases: `calculateTotal()`,
  `sendWelcomeEmail()`, `validateAddress()`.
- Avoid abbreviations unless universal in the domain (`id`,
  `url`, `api` acceptable; `usr`, `mgr`, `proc` are not).
- Avoid misleading names: `accountList` should be a `List`, not
  a map or set.
- Name length scales with scope: short names (`i`, `n`) are
  acceptable in tiny scopes; wider scopes demand longer, more
  descriptive names.

## Functions and Methods

- A function does one thing. If a one-sentence description
  requires "and", split it.
- Target fewer than 20 lines. Treat 40+ lines as a hard signal
  to refactor.
- Limit parameters to three or fewer. If more are needed, group
  related parameters into a named object.
- No flag arguments (`sendEmail(user, true)`). Two boolean
  outcomes mean two functions.
- Use early returns and guard clauses. Avoid the `else` branch
  when the `if` already returns.
- Side effects must be obvious from the function name. Hidden
  side effects are one of the most common sources of bugs.
- Prefer pure functions wherever practical. When purity is not
  practical, the function name must expose its side effects.
  Purity is the ideal; explicit naming is the fallback.

## Error Handling

- Handle errors explicitly. Do not catch and ignore exceptions
  unless intentional and documented.
- Fail fast at system boundaries: validate at entry points, not
  deep in the call stack.
- Return types and exceptions should not both encode failure —
  pick one mechanism per function and be consistent.
- Do not use exceptions for control flow.

## Constants and Magic Values

- Replace magic numbers and strings with named constants.
- Co-locate constants with the code that owns them.

## Comments

- Comment why, not what. The what is visible from the code.
- Delete commented-out code. Version history exists for recovery.
- `TODO` and `FIXME` comments must include a reference (issue
  number or owner). Unattributed TODOs are permanent.
- The best comment is a better name or a smaller function.

## Testing

- New behaviour requires a test.
- Tests verify behaviour, not implementation.
- Name tests to describe behaviour: what, under what condition,
  expected outcome.
- Tests must be deterministic.

## Documentation

- Document the public contract of every module, class, or
  function.
- Keep documentation co-located with code.
- README files answer: what is this, how do I set it up, how do
  I run it, how do I contribute.
- Delete or update documentation whenever the code it describes
  changes.

## Accessibility

- Use semantic HTML elements.
- Every interactive element must be keyboard-navigable with an
  accessible name.
- Images require descriptive `alt` text. Empty `alt=""` is
  correct for decorative images.
- Colour alone must not convey meaning.

## Module and File Design

- A module/file has one primary responsibility.
- Imports/dependencies must be explicit.
- Circular dependencies signal a design boundary problem.
- Public API surface should be minimal.

## Security Baseline

- Never hardcode credentials, API keys, tokens, or secrets. Use
  environment variables or a secrets manager.
- Validate and sanitise all external input.
- Do not log sensitive data: passwords, tokens, PII, financial
  data.
- Apply least privilege.

## Code Review Readiness

Before submitting code for review, verify:

- [ ] The code does what it is described as doing
- [ ] No debug statements, temporary hacks, or commented-out
      code
- [ ] New behaviour has test coverage
- [ ] No secrets or sensitive values are present
- [ ] Naming follows the standards above
- [ ] Functions are under 40 lines
- [ ] The PR description answers "what" and "why"
