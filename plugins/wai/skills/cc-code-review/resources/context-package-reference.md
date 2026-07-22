# Context Package Reference

## Per-Subagent Context Fields

| Subagent             | When to Invoke                             | Scope-Specific Context                                                                                                                                                                       |
| -------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Security             | All code changes                           | DIFF: branches, objective, risk classification per file, security-sensitive area flags. Non-DIFF: file paths, scope metrics, security-sensitive area flags inferred from file names/content. |
| Code Standards       | Always                                     | Matched instruction files + file mapping (if any). The subagent self-detects frontend context from in-scope file extensions and `package.json` — see below.                                  |
| Architectural        | All except doc/test-only                   | Complexity classification, architectural role per file, related pattern search results from Section 1. Non-DIFF: file paths for direct reading.                                              |
| Production Readiness | Medium/Large/XL complexity (STANDARD only) | Deployment context flags, deployment-relevant files.                                                                                                                                         |
| Strategic            | All changes                                | Complexity classification, codebase context from Section 1 searches, strategic significance per file.                                                                                        |

## Frontend Skill Detection (Code Standards Subagent)

The Code Standards subagent is responsible for self-detecting frontend context.
The orchestrator passes no frontend flags — the subagent MUST determine these itself.

1. Inspect the in-scope file list for `.tsx`, `.jsx`, `.ts`, `.js`, `.css`, `.scss`, `.less` extensions.
2. If any are present, use `file_search` to locate `package.json`; `read_file` to parse it.
3. Detect:
   - `REACT_VERSION`: `18` / `19` / `none` (from `react` version in `dependencies`)
   - `STYLED_COMPONENTS`: `true` / `false` (from `styled-components` in `dependencies`)
   - `CSS_FILES`: `true` / `false` (any `.css`/`.scss`/`.less` file in scope)
4. Load the relevant skill content based on detected flags:
   - `REACT_VERSION=18`: `file_search` `**/cc-react-18-patterns/SKILL.md` → `read_file`
   - `REACT_VERSION=19`: `file_search` `**/cc-react-19-patterns/SKILL.md` → `read_file`
   - `STYLED_COMPONENTS=true`: `file_search` `**/cc-styled-components/SKILL.md` → `read_file`
   - `CSS_FILES=true`: `file_search` `**/cc-css-essentials/SKILL.md` → `read_file`

If no frontend files are in scope, skip steps 2–4.

## Subagent Failure Handling

**Retry Protocol (3 attempts before escalation):**
1. First failure: Retry with same context
2. Second failure: Simplify context (reduce file content, summarise)
3. Third failure: Apply failure rules below

**Failure Rules:**
- Single non-critical failure: CONTINUE, log and note in report
- Security or Code Standards failure: CONTINUE but flag prominently
- 2+ failures: ABORT with message
