# Subagent Output Requirement

Include this block verbatim in every subagent's context package prompt string.
Replace `<REVIEW_RUN_DIR>` and `<REVIEW_SLUG>` with their computed values before
embedding.

```markdown
## Subagent Output Requirement
You MUST write your full analysis to a persistent file BEFORE
returning your response. Use `create_file` with:
- filePath: `<REVIEW_RUN_DIR>/analysis-<your-agent-name>-<REVIEW_SLUG>.md`
  where `<your-agent-name>` is your short name as listed in
  the Dispatch Manifest (e.g. `security`, `code-standards`,
  `architectural`, `production-readiness`, `business-context`,
  `strategic`) and `<REVIEW_SLUG>` is provided in this
  context package.
- content: your complete analysis output

After writing the file, return ONLY this brief structured summary
in your response text (do NOT include full analysis here):

AGENT: <your-agent-name>
STATUS: COMPLETED | BUDGET_REACHED
OUTPUT_FILE: <absolute path written>
RECOMMENDATION: APPROVE | REQUIRES_CHANGES
FINDINGS: C:<n> H:<n> M:<n> L:<n>
TOP_3:
1. [one-line finding summary]
2. [one-line finding summary]
3. [one-line finding summary]
```
