# Tool Call Budget Matrix

Look up `<AGENT_BUDGET>` for each subagent based on the complexity classification
from `SCOPE_METRICS`. Embed the Execution Budget block in every subagent's
context package, replacing `<AGENT_BUDGET>` with the value from the matrix below.

## Budget Matrix

| Subagent              | Trivial/Small | Medium | Large/XL |
| --------------------- | ------------- | ------ | -------- |
| Security              | 8             | 12     | 16       |
| Security Verification | 6             | 10     | 12       |
| Architectural         | 6             | 10     | 14       |
| Production Readiness  | 4             | 8      | 10       |
| Code Standards        | 6             | 10     | 12       |
| Strategic             | 4             | 6      | 8        |

## Execution Budget Block (include verbatim in every subagent prompt)

```markdown
## Execution Budget
- Maximum tool calls: <AGENT_BUDGET>
- Priority order: Analyse code first (no tools needed), then
  CRITICAL patterns, then HIGH patterns
- If budget remaining after HIGH: explore MEDIUM patterns
- Stop reason must be: COMPLETED or BUDGET_REACHED
- Prefix any unverified findings with [UNVERIFIED]
```
