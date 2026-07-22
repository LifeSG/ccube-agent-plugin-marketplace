# Subagent Dispatch Decision Tree

Apply this decision tree at the Subagent Planning Checkpoint (end of Section 1) to
determine which subagents to invoke.

Modes: QUICK and STANDARD only.
Scope types: DIFF, TOPIC, EXPLICIT.
Always-on (cannot be user-skipped, all modes): Security Verification + second synthesis pass.
Security Verification auto-skips only when Security subagent returns zero CRITICAL/HIGH findings.

```
Review Mode = QUICK?
  YES → 2-way parallel: Security + Code Standards
        Skip: Architectural, Production Readiness, Strategic
        Always-on after parallel batch:
          Security Verification (auto-skip if 0 CRITICAL/HIGH from Security)
          Second synthesis pass
  NO → Continue to STANDARD logic...

Review Mode = STANDARD?

  Documentation/Test Only?
  (ALL in-scope files are .md/.txt/.rst/.adoc or *test* / *spec* files)
    YES → 2-way parallel: Code Standards + Strategic
          Skip: Security, Architectural, Production Readiness
    NO → Continue...

  Complexity = Trivial or Small?
    YES → 4-way parallel: Security, Code Standards, Architectural, Strategic
          Skip: Production Readiness
    NO → Continue...

  Complexity = Medium, Large, or Extra Large?
    YES → 5-way parallel: Security, Code Standards, Architectural,
                          Production Readiness, Strategic

  Always-on after parallel batch (all STANDARD paths):
    Security Verification (auto-skip if 0 CRITICAL/HIGH from Security)
    Second synthesis pass
```

## Per-Subagent Skip Keywords Override

After applying the tree above, check if the user provided explicit skip keywords
(from Section 1). A named subagent switches to SKIP regardless of tree outcome.
Security Verification and second synthesis pass are immune to skip keywords — ignore
any user instruction to skip them.

