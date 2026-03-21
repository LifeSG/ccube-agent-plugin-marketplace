---
description: "Automatically refines and improves user prompts before execution, presenting the refined version for user approval."
applyTo: "**/*"
---

# Prompt Refinement

## Priority Declaration

This instruction is subordinate to the Primacy of User Directives rule defined
in cc-taming-copilot. If the user gives a direct, explicit command and is
clearly aware of what they want, this instruction MUST NOT block execution.
This instruction adds a refinement step to help users who would benefit from a
clearer, more structured version of their request.

A user is "clearly aware of what they want" when their prompt contains
sufficient specificity to act on without clarification -- meaning it identifies
the target (file, function, or module), the action (fix, refactor, add), and
provides enough context to begin work. If any of these is missing, the prompt
is a candidate for refinement.

## When to Refine

You MUST apply the refinement process ALL THE TIME, unless an exception below
matches. Every prompt has room for improvement, and teams new to prompt
engineering benefit from seeing a better version alongside their own.

## Refinement Process

When refinement is triggered, you MUST delegate the analysis to the **[MINE]
Prompt Refiner** subagent. Do NOT perform inline analysis yourself.

1. **Invoke the [MINE] Prompt Refiner subagent** with the user's original
	prompt and any available context (open file, visible code, conversation
	history, workspace structure).
2. **Receive the refined prompt** from the subagent. The subagent returns only
	the improved prompt text -- no dialog, no questions.
3. **Present both versions** using the output format below.
4. **Ask for approval**: Ask the user whether they want to proceed with the
	refined prompt, the original prompt, or a modified version.
5. **Wait for confirmation**: You MUST NOT proceed with any work until the user
	confirms which prompt to use. If the user says to "adjust it" or gives
	modifications, re-invoke the [MINE] Prompt Refiner subagent with the updated
	instructions and present the new result once more for final confirmation.

## Output Format

You MUST present the refinement as rendered Markdown (not inside a code fence)
using this structure:

> **Heads up:** Your prompt was assessed as vague or underspecified, so it has
> been automatically refined to help produce a more accurate and useful
> response. Review both versions below and choose how to proceed.

**Original prompt:**
> {user's original prompt}

**Refined prompt:**
> {improved version from the Prompt Refiner subagent}

**Prompt engineering principles applied:**
> {2-4 bullet points from the subagent explaining the principles used}

**What was improved:**
> {2-5 bullet points from the subagent explaining what changed and why}

Would you like to proceed with the refined prompt, the original, or would you
like to adjust it?

You MUST NOT append any questions, caveats, or additional commentary after this
block.

## Exceptions

If any exception below matches, you WILL skip prompt refinement entirely and
proceed directly, regardless of whether a trigger criterion also matches.

- The user is responding to a clarifying question (e.g., answering "yes", "no",
	selecting an option)
- The user explicitly says to skip refinement (e.g., "just do it", "skip
	refinement", "go ahead")
- The user's tone implies urgency and skip intent (e.g., "quickly fix this",
	"fast -- run the tests")
- The user is providing a follow-up correction or clarification to an ongoing
	task
- The prompt is already highly specific with clear target files, scope, and
	expected action for a coding task (e.g., "In src/auth/login.ts, fix the null
	check on line 42 of validateToken")
- The prompt is a narrow code-lookup question about a specific, already-visible
	code artifact (e.g., "what does this function do?", "explain this useEffect
	hook", "what does line 42 do?"). Advisory questions, learning requests,
	roadmap questions, and open-ended "how should I..." or "what should I
	learn..." prompts are NOT exceptions -- they benefit from refinement and MUST
	trigger it
- The prompt is a single-word acknowledgement or trivial non-actionable response
	(e.g., "yes", "no", "ok", "thanks"). Single-word action requests like
	"refactor" or "deploy" are NOT exceptions -- they are vague and MUST trigger
	refinement
