# Severity Classification Matrix

This document provides comprehensive guidelines for classifying issues across all review domains (Security, Architecture, Production, Business, Strategic, Standards, Code Quality).

## Cross-Domain Severity Levels

### CRITICAL (Blocks Merge)

Issues at this level **MUST** be fixed before merge. Merging with CRITICAL issues would create immediate or near-immediate severe problems.

**Characteristics:**
- Causes production outages or data loss
- Creates severe security vulnerabilities (exploitable)
- Fundamentally violates architectural principles
- Completely misses business requirements
- Introduces unsustainable technical debt
- Violates "NEVER" or "CRITICAL" instruction file rules

**Examples:**
- **Security**: Verified SQL injection on user-accessible endpoint
- **Architecture**: Design that cannot scale beyond 2x current load
- **Production**: Deployment with no rollback strategy and high risk
- **Business**: Feature that doesn't solve the stated user problem
- **Strategic**: Introduces technical debt requiring immediate rewrite
- **Standards**: Uses deprecated API explicitly forbidden by instructions

**Action**: REQUIRES CHANGES recommendation, detailed fix plan required

---

### HIGH (Should Fix Before Merge)

Issues at this level **SHOULD** be fixed before merge but may be acceptable with documented trade-offs and mitigation plans.

**Characteristics:**
- Significant but not immediate risk
- Noticeable impact on quality/performance/maintainability
- Marked as "MUST" or "MANDATORY" in instruction files
- Concerning but not catastrophic

**Examples:**
- **Security**: Verified XSS vulnerability on authenticated page
- **Architecture**: Scalability concerns emerging at 3-5x scale
- **Production**: Missing monitoring for new critical functionality
- **Business**: Feature partially addresses requirements
- **Strategic**: Notable technical debt increase without payoff plan
- **Standards**: Violates MUST requirements in coding standards

**Action**: APPROVE WITH IMPROVEMENTS if risks accepted, detailed discussion needed

---

### MEDIUM (Recommended Improvements)

Issues at this level are **RECOMMENDED** to fix but not blocking. Improve quality without blocking delivery.

**Characteristics:**
- Quality or maintainability improvements
- Marked as "SHOULD" or "RECOMMENDED" in standards
- Nice-to-have enhancements
- Optimization opportunities

**Examples:**
- **Security**: Security improvement opportunity (not currently exploitable)
- **Architecture**: Design could be cleaner but works
- **Production**: Enhanced monitoring would be beneficial
- **Business**: Feature could be more complete
- **Strategic**: Some technical debt but manageable
- **Standards**: Violates SHOULD recommendations

**Action**: List in review, consider for follow-up work

---

### LOW (Future Enhancements)

Issues at this level are minor suggestions for future consideration.

**Characteristics:**
- Documentation improvements
- Code style preferences (not in standards)
- Optimization opportunities
- Feature expansions

**Examples:**
- **Security**: Additional defensive coding suggestion
- **Architecture**: Alternative pattern to consider
- **Production**: Nice-to-have operational improvements
- **Business**: Power user feature expansion ideas
- **Strategic**: Long-term refactoring opportunities
- **Standards**: Style improvements beyond requirements

**Action**: Note for future iterations, not blocking or urgent

---

## Domain-Specific Severity Guidelines

### Security Severity

**CRITICAL**: Exploitable vulnerability, data loss risk, privilege escalation
**HIGH**: Verified vulnerability with limited blast radius or mitigation complexity
**MEDIUM**: Security improvement opportunity, defense-in-depth enhancement
**LOW**: Additional hardening suggestions

**Key Decision Points:**
- **Exploitability**: Can this actually be exploited given mitigating controls?
- **Blast Radius**: How many users/systems affected?
- **Data Sensitivity**: Does this expose sensitive data?

### Architectural Severity

**CRITICAL**: Fundamentally flawed design, cannot scale, violates core principles
**HIGH**: Significant scalability/maintainability concerns
**MEDIUM**: Design could be improved but acceptable
**LOW**: Alternative patterns to consider

**Key Decision Points:**
- **Scalability**: Will this work at 10x scale?
- **Maintainability**: Can team maintain this?
- **Pattern Consistency**: Does this violate established patterns?

### Production Readiness Severity

**CRITICAL**: High risk of outage, no rollback, missing critical monitoring
**HIGH**: Medium risk without mitigation, complex rollback, insufficient monitoring
**MEDIUM**: Low risk but could be safer, monitoring improvements
**LOW**: Operational quality-of-life improvements

**Key Decision Points:**
- **Deployment Risk**: What's the likelihood of failure?
- **Blast Radius**: How many users affected if it fails?
- **Recovery**: Can we rollback quickly?

### Strategic Severity

**CRITICAL**: Unsustainable technical debt, blocks roadmap, unmaintainable
**HIGH**: Significant debt, maintainability concerns, limits extensibility
**MEDIUM**: Some debt but manageable, could be more maintainable
**LOW**: Minor improvements, optimization opportunities

**Key Decision Points:**
- **Technical Debt Trajectory**: Is codebase health improving or degrading?
- **Long-term Maintainability**: Can we maintain this in 6-12 months?
- **Extensibility**: Does this enable or block future features?

### Standards Compliance Severity

**CRITICAL**: Violates "NEVER"/"CRITICAL" rules in instruction files
**HIGH**: Violates "MUST"/"MANDATORY" requirements
**MEDIUM**: Violates "SHOULD"/"RECOMMENDED" guidelines
**LOW**: Style improvements, suggestions

**Key Decision Points:**
- **Instruction Language**: What imperative terms are used?
- **Consistency**: Does this break established patterns?
- **Rationale**: Is there reasoning behind the rule?

---

## Severity Escalation Rules

An issue's severity may be **escalated** (by one level) if:

1. **Multiple subagents flag the same issue** (cross-domain concern)
   - Example: Both Security and Architecture flag the same design flaw
   - Action: Escalate to higher severity

2. **Issue has compounding effects**
   - Example: Technical debt that will multiply quickly
   - Action: Escalate Strategic concern to HIGH/CRITICAL

3. **Verification reveals worse impact than initially assessed**
   - Example: Security false positive turns out to be true positive
   - Action: Escalate to appropriate severity

4. **Issue blocks critical roadmap items**
   - Example: Design that prevents planned features
   - Action: Escalate Strategic to HIGH/CRITICAL

---

## Severity Downgrade Rules

An issue's severity may be **downgraded** if:

1. **Mitigating controls exist**
   - Example: Security pattern flagged but proper validation exists
   - Action: Downgrade or classify as false positive

2. **Limited scope/blast radius**
   - Example: Issue only affects admin-only feature
   - Action: Consider downgrading one level

3. **Documented temporary trade-off with payoff plan**
   - Example: Intentional technical debt with clear payoff timeline
   - Action: Downgrade Strategic severity

4. **Issue is cosmetic/style preference without technical justification**
   - Action: Downgrade to LOW or remove from review

**Precedence**: When both escalation and downgrade rules apply to
the same finding, apply the **downgrade first** (because mitigating
controls are concrete evidence), then evaluate whether escalation
still applies.

---

## Overall Recommendation Mapping

Based on the highest severity issues found:

| Highest Severity Found | Overall Recommendation    | Condition                                       |
| ---------------------- | ------------------------- | ----------------------------------------------- |
| CRITICAL               | REQUIRES CHANGES          | Any CRITICAL (verified) issue present           |
| CRITICAL (multiple)    | REQUIRES REDESIGN         | 3+ CRITICAL issues across 2+ domains            |
| HIGH                   | APPROVE WITH IMPROVEMENTS | No CRITICAL, but HIGH issues need addressing    |
| MEDIUM only            | APPROVE                   | Quality improvements recommended (non-blocking) |
| None or LOW only       | APPROVE                   | Minor suggestions only                          |

**Exception**: If HIGH issues have documented mitigations and acceptance, may still APPROVE.

---

*This severity matrix ensures consistent issue classification across all review subagents and the orchestrator, enabling accurate prioritization and clear recommendation logic.*
