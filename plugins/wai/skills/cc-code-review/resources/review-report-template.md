# Code Review: <Scope Description>

**Review Date:** <YYYY-MM-DD>
**Scope Type:** [DIFF / TOPIC / EXPLICIT]
**Reviewer:** GitHub Copilot (Code Review System)
**Review Method:** [2/5]-way parallel subagent analysis with strategic synthesis

---

## Executive Decision Summary

**Recommendation**: [APPROVE / APPROVE WITH IMPROVEMENTS / REQUIRES CHANGES / REQUIRES REDESIGN]

**Confidence**: [HIGH / MEDIUM / LOW]

**Key Decision Factors**:
1. [Most critical finding from any subagent with severity and domain]
2. [Second most critical finding]
3. [Third most critical finding or key strength]

**Quality Rating**: [Excellent / Good / Acceptable / Needs Improvement / Poor / Requires Rework]

**Strategic Assessment**: [Aligned / Mostly Aligned / Misaligned] with architecture and business goals

**Strengths**:
- [Key strength or good pattern observed — e.g., "Clean modular decomposition of X"]
- [Second strength if applicable]

**If you only read one section**: Jump to [most critical subagent section name]

**Analysis Execution**:
- Execution Mode: [2/4/5/6]-way parallel subagent analysis
- Scope Classification: [Trivial/Small/Medium/Large/Extra Large]
- Risk Profile: [LOW/MEDIUM/HIGH/CRITICAL]

---

## Findings by Priority

### CRITICAL Issues (BLOCKS APPROVAL) - [N issues]

[Aggregated from all subagents - group by domain]

#### Security (VERIFIED)
- **SEC-CRIT-01**: [Title] - [file:line] - [Brief description]

#### Architecture
- **ARCH-CRIT-01**: [Title] - [file:line] - [Brief description]

#### Standards
- **STD-CRIT-01**: [Title] - [file:line] - [Brief description]

#### Production Readiness
- **PROD-CRIT-01**: [Title] - [file:line] - [Brief description]

#### Strategic
- **STRAT-CRIT-01**: [Title] - [file:line] - [Brief description]

[If none: "No critical issues identified"]

---

### HIGH Priority (SHOULD FIX) - [N issues]

[Aggregated from all subagents - grouped by domain. Click domain sections below for details.]

#### Security
- **SEC-HIGH-01**: [Title] - [file:line]

#### Architecture
- **ARCH-HIGH-01**: [Title] - [file:line]

#### Standards
- **STD-HIGH-01**: [Title] - [file:line]

#### Production Readiness
- **PROD-HIGH-01**: [Title] - [file:line]

#### Strategic
- **STRAT-HIGH-01**: [Title] - [file:line]

[If none in a domain: omit that subsection]

---

### MEDIUM Priority (RECOMMENDED) - [N improvements]

<details>
<summary>View Medium Priority Items ([N] items)</summary>

- [Domain]-MED-01: [Title] - [file:line]
- [Domain]-MED-02: [Title] - [file:line]

</details>

---

### LOW Priority (OPTIONAL) - [N suggestions]

<details>
<summary>View Low Priority Suggestions ([N] items)</summary>

- [Domain]-LOW-01: [Title] - [file:line]
- [Domain]-LOW-02: [Title] - [file:line]

</details>

---

## Detailed Analysis by Domain

### Scope Overview & Metrics

**Scope Type:** [DIFF / TOPIC / EXPLICIT]
**Scope Description:** <feature branch pair, topic, file list, or path description>
**Total Files:** <count> (<M> modified, <A> added, <D> deleted, <R> renamed — DIFF only; or total for other scopes)
**Lines:** <total lines in scope>
**Commits:** <count — DIFF only, else N/A>
**Contributors:** <list — DIFF only, else N/A>

**Scope Complexity:** [Trivial/Small/Medium/Large/Extra Large]

**Files in Scope:**
```
<List of files reviewed>
```

**Review Objective:** <from description or inferred>
**Business Context:** <user impact, problem solved, target users — or N/A if not applicable>

---

<details>
<summary><strong>Security Analysis</strong> - [STATUS] - [N findings]</summary>

**Analysis Status:** [✓ Completed / — Skipped: <reason>]
**Risk Profile:** [HIGH / MEDIUM / LOW]
**Overall Assessment:** [PASS / FAIL / NEEDS REVIEW]
**Findings:** CRITICAL: N  HIGH: N  MEDIUM: N  LOW: N

[Paste security subagent output here]

</details>

---

<details>
<summary><strong>Architectural Analysis</strong> - [STATUS] - [N findings]</summary>

**System Design Quality:** [rating]
**Scalability Rating:** [rating]
**Service Boundary Health:** [rating]
**Data Flow Architecture:** [rating]
**Pattern Consistency:** [rating]
**Overall Assessment:** [SOUND/ACCEPTABLE/CONCERNING/FLAWED]

[Paste architectural subagent output here]

</details>

---

<details>
<summary><strong>Production Readiness Analysis</strong> - [STATUS] - [N findings]</summary>

**Deployment Risk:** [HIGH/MEDIUM/LOW/MINIMAL]
**Rollback Readiness:** [READY/NEEDS PLAN/COMPLEX/BLOCKED]
**Monitoring Adequacy:** [EXCELLENT/ADEQUATE/INSUFFICIENT/ABSENT]
**Operational Complexity:** [LOW/MODERATE/HIGH/PROHIBITIVE]
**Overall Assessment:** [READY/NEEDS WORK/NOT READY]

[Paste production readiness subagent output here]

</details>

---

<details>
<summary><strong>Strategic Analysis</strong> - [STATUS] - [N findings]</summary>

**Technical Debt Impact:** [rating]
**Long-term Maintainability:** [rating]
**Extensibility:** [rating]
**Evolution Path:** [rating]
**Strategic Alignment:** [rating]
**Overall Assessment:** [STRATEGIC WIN/ACCEPTABLE/CONCERNING/STRATEGIC MISTAKE]

[Paste strategic subagent output here]

</details>

---

<details>
<summary><strong>Code Standards Compliance</strong> - [STATUS] - [N violations]</summary>

**Overall Compliance:** [PASS / FAIL / NEEDS REVIEW]
**Instruction Files Applied:** <count>

[Paste code standards subagent output here]

</details>

---

<details>
<summary><strong>Code Quality & Testing</strong> - [Main Agent Assessment]</summary>

[Main agent direct analysis of code quality, testing, API design, etc.]

</details>

---

## Engineering Perspective

[Synthesized strategic commentary connecting findings across domains]

### Cross-Cutting Concerns
[Issues that span multiple domains or architectural layers]

### Trade-off Analysis
**Current Approach**:
- **Optimizes for**: [strength]
- **Sacrifices**: [weakness]
- **Rationale**: [why this is right/wrong choice]

**Alternative Approaches Considered**:
1. **[Approach Name]**
   - Pros: [advantages]
   - Cons: [disadvantages]
   - Why not chosen: [analysis]

### Long-term Implications
[6-12 month strategic assessment]
- [Strategic consideration 1]
- [Strategic consideration 2]

### Learning Opportunities *(if applicable)*
[Teaching moments, good patterns to learn, anti-patterns explained. Omit if none identified.]

---

## Recommendations Summary

### Immediate Actions (Must Fix)
1. [Action from CRITICAL findings]
2. [Action from CRITICAL findings]

### High Priority (Should Fix)
1. [Action from HIGH findings]
2. [Action from HIGH findings]

### Medium Priority (Recommended)
1. [Action from MEDIUM findings]

### Strategic Considerations (Future Work)
1. [Long-term improvement]
2. [Technical debt payoff opportunity]

---

## Review Metrics

**Subagents Executed**:
- [COMPLETED / SKIPPED] Security Analysis (+ Exploitability Verification)
- [COMPLETED / SKIPPED] Architectural Analysis
- [COMPLETED / SKIPPED] Strategic Analysis
- [COMPLETED / SKIPPED] Code Standards Compliance
- [COMPLETED / SKIPPED] Production Readiness

**Finding Distribution**:
| Domain              | CRITICAL  | HIGH      | MEDIUM    | LOW       |
| ------------------- | --------- | --------- | --------- | --------- |
| Security (Verified) | <count>   | <count>   | <count>   | <count>   |
| Architecture        | <count>   | <count>   | <count>   | <count>   |
| Production          | <count>   | <count>   | <count>   | <count>   |
| Standards           | <count>   | <count>   | <count>   | <count>   |
| Strategic           | <count>   | <count>   | <count>   | <count>   |
| **TOTAL**           | **<sum>** | **<sum>** | **<sum>** | **<sum>** |

---

## Next Steps

1. [Primary action from overall recommendation]
2. [Secondary action]
3. [Tertiary consideration]

---

*Generated by Code Review System*
*Review completed in <Xm Ys> (end-to-end wall time)*
