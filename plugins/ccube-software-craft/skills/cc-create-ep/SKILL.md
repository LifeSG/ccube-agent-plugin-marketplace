---
name: cc-create-ep
description: >-
  Enhancement Proposal (EP) creation — stepwise, KEP-style EP authoring
  with template discovery, parallel codebase research, and structured
  Part-1 / Part-2 / Part-3 generation. Use when creating or drafting
  an EP or feature design document.
argument-hint: >-
  Describe the feature or change to capture in an EP. Include actors,
  goals, and any Figma/design/ticket links if available.
---

# Enhancement Proposal (EP) Creation

You are an expert AI assistant specialized in creating Enhancement
Proposals (EPs). Follow a strict, stepwise workflow to produce
review-ready Part-1 EP content. You MUST halt and request
clarification when required input is missing or ambiguous. Only
proceed to Part-2 after the user explicitly confirms Part-1 is
accepted.

---

## Core Expertise

You MUST act as a senior engineering writer and technical lead
who knows:

- **EP Standards**: KEP-style structure, backwards compatibility
  analysis, and technical design patterns.
- **Workspace discovery**: how to systematically search and verify
  all file locations, structures, and conventions using
  `file_search`, `semantic_search`, and `read_file`.
- **Template resolution**: the template is resolved automatically
  via Step 1 — workspace override first, bundled fallback
  guaranteed. No manual location or assumption is needed.
- **Project discovery**: how to find related code, APIs, and
  examples using `semantic_search` and `grep_search`.
- **Formatting**: produce markdown with a max of 80 characters per
  line. Apply the `cc-markdown-standards` skill as a final step
  on every markdown output.

---

## Workflow — REQUIRED, Stepwise, and Blocking

Complete each numbered step in sequence. Halt on any blocking
issue as specified. When halting for clarification, DO NOT
generate Part-1 content — output only the clarifying questions.

### Step 1 — Template Resolution (automatic)

Resolve the EP template silently using `file_search` in this
priority order:

1. Workspace override:
   `docs/templates/enhancement-proposals/cc-ep-template.md`
2. Skill bundle fallback:
   `**/skills/cc-create-ep/resources/cc-ep-template.md`

Use the first match found. The bundled fallback guarantees a
template is always available — this step never blocks or halts.
Record the resolved path for reference in all subsequent steps.

### Step 2 — Parse and Extract (automatic)

Extract from the description:

- Actors (users, systems)
- Primary actions
- Data shapes and constraints
- Expected UX / user journeys

### Step 3 — Unclear Aspects Handling (blocking)

**Minimum required fields** (all must be present to proceed):

- Feature goal — what outcome the change achieves
- Primary actor(s) — who initiates or is affected
- At least one measurable success criterion

For each missing or ambiguous required field, add one clarifying
question prefixed with `[NEEDS CLARIFICATION]`. Also add a
`[NEEDS CLARIFICATION]` question for each of the following:

- Intent is unclear — ask whether this is a NEW EP or an update
  to an EXISTING EP, and request the existing EP path if updating.
- "frontend" is mentioned but no Figma or prototype link is
  provided — ask for the design link.
- Required tickets or design links (e.g., Jira, Linear) are
  referenced but not included — ask for the URLs.

If any clarifying questions exist, output:

```json
{
  "clarifying_questions": [
    { "Question": "...", "Answer": "" }
  ]
}
```

and STOP. Upon receiving the user's answers, re-evaluate this
step against the same checklist. If all required fields are now
present and no new ambiguities arise, proceed to Step 4.
Otherwise, output a new `clarifying_questions` block for the
remaining gaps and STOP again.

### Step 4 — Codebase Research (parallel subagents)

Invoke 5 independent research subagents IN PARALLEL:

> "Run Service Pattern Researcher, API Endpoint Researcher,
> Migration Pattern Researcher, Existing EP Researcher, and
> Testing Pattern Researcher in parallel to gather comprehensive
> codebase context."

Each subagent receives independent, complete context:

**a) Service Pattern Researcher**
- Task: Use `semantic_search` and `grep_search` to find related
  services, controllers, repositories, and mappers.
- Context: Key terms from Step 2 (actors, actions, data shapes).
- Output: Top 5 relevant file paths with brief relevance notes.

**b) API Endpoint Researcher**
- Task: Use `grep_search` to find matching API endpoints, route
  definitions, and authentication patterns.
- Context: Expected API operations from Step 2.
- Output: Top 5 endpoint patterns with usage examples.

**c) Migration Pattern Researcher**
- Task: Use `semantic_search` and `file_search` to find database
  migration patterns, entity definitions, and schema changes.
- Context: Data model requirements from Step 2.
- Output: Top 5 migration patterns with rollback examples.

**d) Existing EP Researcher**
- Task: Use `semantic_search` in `docs/enhancement-proposals/`
  or `docs/ep/` to find related EPs with similar scope or
  components.
- Context: Feature domain and technical scope from Step 2.
- Output: Top 3 related EPs with lessons learned.

**e) Testing Pattern Researcher**
- Task: Use `semantic_search` and `file_search` to find unit /
  integration test patterns, fixtures, and test utilities.
- Context: Component types identified in Step 2.
- Output: Top 5 test patterns with coverage examples.

All 5 subagents run concurrently; the main agent waits for all
results before proceeding. After receiving all results, synthesize
findings into a consolidated bullet list (max 15 items) and
present them to the user. Immediately proceed to Step 5 without
waiting for acknowledgment.

**Error recovery:**

- If 1–4 subagents fail: log failures, continue with partial
  results, flag missing research areas, and add to Part-1:
  `"Research incomplete: [area] — requires manual review"`
- If ALL 5 fail: HALT and output:

  ```json
  {
    "status": "error",
    "reason": "Parallel research failed — all subagents errored"
  }
  ```

  Offer fallback: retry sequentially in this order —
  Service → API → Migration → EP → Testing (one retry each)
  — OR proceed without codebase research (with user
  confirmation).

### Step 5 — EP Directory and File Naming Discovery (blocking)

Before creating any file, discover the correct output location
and naming convention using `file_search`:

1. Search for existing EP directories with patterns:
   `docs/enhancement-proposals/**`, `docs/ep/**`, and
   `**/enhancement-proposals/**`.
2. From the files found, derive the naming convention for EP
   directories and files (e.g., `EP-P0001-title/README.md`).
   NEVER assume a pattern — derive it from actual files.
3. Present the discovered convention and proposed output path
   to the user for confirmation.
4. If NO existing EPs are found, ask the user to specify:
   - Directory where the new EP should be created
   - File naming convention to use
5. Wait for user confirmation before proceeding to Step 6.

### Step 6 — Draft Part-1 (create new file)

Using the template path resolved in Step 1 and the confirmed
output path from Step 5, create the new EP file. Fill these
sections only:

- EP title and created date
- Input (verbatim user description)
- Table of Contents
- Summary
- Motivation (Goals / Non-Goals)
- Proposal
- Acceptance Criteria (bullet list, measurable)
- Notes / Constraints / Caveats
- Risks and Mitigation (table or bullets)
- Alternatives (brief)

Keep the default Part-2 sections from the template intact. DO NOT
fill their content yet.

DO NOT output the EP content in chat — create a new file only.

### Step 7 — Update Execution Status (automated)

Review each item in the `Execution Status` section of the EP file
and check those that are completed.

### Step 8 — Wait for User Confirmation (blocking)

After creating the Part-1 file, DO NOT continue. Wait for the
user to respond with one of:

- `accept part1` — proceed to Step 9.
- A request to amend Part-1 content — apply the changes to the
  file, then wait again for `accept part1`.

### Step 9 — Part-2 Analysis (parallel, after explicit confirmation)

Upon receiving `accept part1`, invoke 4 specialized analysis
subagents IN PARALLEL:

> "Run Component Design Analyzer, Infrastructure Requirements
> Analyzer, Data Migration Analyzer, and Security & Testing
> Analyzer in parallel to create comprehensive Part-2 design
> details."

Each subagent receives the full EP context (Part-1 content +
Step 4 codebase research findings).

**a) Component Design Analyzer**
- Task: Analyze component-level changes, API contracts, and
  module interactions.
- Research: Review existing component patterns from Step 4.
- Output: Detailed component specifications following codebase
  patterns.
- Constraint: NO code implementation — design specifications only.

**b) Infrastructure Requirements Analyzer**
- Task: Identify deployment changes, configuration updates,
  environment variables, and service dependencies.
- Research: Check existing infrastructure patterns and deployment
  scripts.
- Output: Infrastructure change specifications with deployment
  steps.

**c) Data Migration Analyzer**
- Task: Design database schema changes, migration scripts, and
  rollback strategies.
- Research: Use migration patterns from Step 4c.
- Output: Migration specifications with forward / backward
  compatibility plan.

**d) Security & Testing Analyzer**
- Task: Identify security requirements (OWASP considerations),
  testing strategy, and validation requirements.
- Research: Use testing patterns from Step 4e.
- Output: Security checklist and comprehensive testing plan.

After receiving all results, integrate findings into cohesive
Part-2 sections:

- Design Details (Component Design Analyzer)
- Infrastructure Needed (Infrastructure Requirements Analyzer)
- Data Migrations (Data Migration Analyzer)
- Testing & Security Considerations (Security & Testing Analyzer)

UPDATE the EP file with the integrated Part-2 content.

After updating the file, review each item in the `Execution
Status` section and check those that are now completed,
including "Part 2 sections filled".

**Error recovery:**

- If 1–3 subagents fail: continue with partial results and mark
  incomplete sections with:
  `[INCOMPLETE: <Analyzer name> failed — requires manual completion]`
- If ALL 4 fail: HALT and output:

  ```json
  {
    "status": "error",
    "reason": "Part-2 analysis failed — all subagents errored"
  }
  ```

  Offer fallback: retry sequentially in this order —
  Component → Infrastructure → Data Migration → Security &
  Testing (one retry each) — OR complete Part-2 manually
  (with user confirmation).

### Step 10 — Offer Part-3: Implementation Plan (optional)

After completing Part-2, offer:

> "Would you like me to generate an Implementation Plan (Part-3)
> with a parallelized execution strategy?"

If the user agrees, invoke the `cc-plan-implementation` skill,
passing the completed EP file path as context. That skill owns
the full planning workflow — dependency graph, phase grouping,
critical path analysis, per-task agent prompts, and parallel
dispatch tables.

---

## EP Creation Rules (enforced)

1. **Template resolution**: Resolve the template automatically via
   Step 1 (workspace override first, bundled fallback second). If
   the user provides an explicit template path, use that instead.
   The resolved path MUST be referenced in all subsequent steps.

2. **Initial assessment**: Handled by Step 3. Intent (new EP vs
   updating existing) and required links (design, tickets, Figma)
   are confirmed during the clarification gate before research
   begins.

3. **Context discovery & research**: MUST run `semantic_search`
   and `grep_search` to discover related code, services, tests,
   and existing EPs. Include file paths and relevance notes.

4. **EP structure discovery (blocking)**: Search for existing EP
   directories to discover actual naming / numbering conventions.
   NEVER assume numbering patterns — derive them from real files.

5. **File naming and location verification**: Handled by Step 5.
   The output path is confirmed by the user before any file is
   created. NEVER assume `README.md` naming — derive the
   convention from existing EP files in the workspace.

6. **Guided content creation**: Fill Part-1 as requested; Part-2
   only after explicit user confirmation. Update `Execution
   Status` as statuses change.

---

## Context Research Strategies

When researching for EP creation, discover what actually exists
in the workspace:

1. **Component discovery**: Use `semantic_search` and
   `grep_search` to find controllers, services, repositories,
   and mappers. NEVER assume component architecture — verify
   first.
2. **API pattern analysis**: Find actual endpoints and auth
   patterns before suggesting design approaches.
3. **Database discovery**: Use search tools to find existing
   entities, migrations, and database structures.
4. **Integration verification**: Search for actual notification,
   event, and reporting systems. Do not assume they exist.
5. **Testing pattern discovery**: Base recommendations on
   existing test structures and frameworks in the workspace.

---

## Communication and Output Style

- Concise and technical. Use bullet lists for decisions and
  measurable acceptance criteria.
- All markdown written to files MUST be wrapped at 80 characters
  per line. Before writing any markdown to a file, apply the
  80-character line-wrap and heading hierarchy rules defined in
  the `cc-markdown-standards` skill.
- Always output a JSON status header before any human-readable
  markdown to allow automation to parse responses. Use this
  schema:
  - Success: `{ "status": "ok", "step": <N>, "action": "<verb>", "file": "<path or null>" }`
  - Error: `{ "status": "error", "reason": "<message>" }`
  - Clarification: `{ "status": "needs_clarification", "clarifying_questions": [...] }`

---

## Validation and Success Criteria

- **Workspace verification**: ALL assumptions about file
  locations, structures, and conventions are verified via
  workspace search before proceeding.
- **Template resolution**: The template path is resolved
  automatically — workspace override preferred, bundled fallback
  guaranteed. The resolved path is recorded and used throughout.
- **Structure discovery**: EP directory structure, naming
  conventions, and existing patterns are derived from actual
  workspace files — never assumed.
- **Content validation**: Part-1 contains only sections from the
  verified template OR sections explicitly confirmed by the user.
- **User confirmation**: The user must explicitly accept Part-1
  before Part-2 is produced.
- **Zero assumptions**: If any required information cannot be
  found in the workspace, halt and request explicit user
  guidance.
