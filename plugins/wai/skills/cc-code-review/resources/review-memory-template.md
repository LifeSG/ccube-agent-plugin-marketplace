# Review Memory Template

Use this structure when persisting review learnings to
`.github/instructions/code-review-conventions.md`.

This file is a **consolidated living knowledge base** — not an append log.
When updating, merge each fact into the existing entry if it already exists;
add a new entry only if it is genuinely new. Keep the file compact.

```markdown
# Code Review Conventions
<!-- Last updated: <YYYY-MM-DD> by review: <REVIEW_SLUG> -->

## Instruction Files
<!-- Saves re-scanning .github/instructions/ on every run -->
- `<path>` — applyTo: `<glob>` — key rules: [one-line summary]

## Architectural Patterns
<!-- Stable patterns the orchestrator and subagents should assume -->
- [Pattern name]: [description] _(last confirmed: <YYYY-MM-DD>)_

## Test Conventions
<!-- Prevents Code Standards subagent from re-discovering framework every run -->
- Framework: [jest / vitest / playwright / etc.]
- Test dirs: [paths]

## Recurring Issues
<!-- Issues seen in 2+ reviews — flag automatically on next review -->
- [Issue pattern]: [N] occurrences (first: <YYYY-MM-DD>, last: <YYYY-MM-DD>)
```
