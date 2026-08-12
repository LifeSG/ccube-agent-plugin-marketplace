# Agent-Centric SDLC: The 80/20 Strategy

**Author:** Leong Wei Jian
**Date:** 20 April 2026
**Status:** Draft — Pending Director Approval

---

## Executive Summary

We have built an AI-agent orchestration system that enables anyone — regardless of technical background — to produce a functional, deployable web application at 80% of enterprise quality. The system, called **WAI Maestro**, coordinates specialised AI agents across the full software development lifecycle: requirements, architecture review, frontend, backend, testing, and deployment. To bridge the remaining 20% to production-grade, domain experts (Product Managers, UX Designers, Developers) use dedicated specialist agents that accelerate their craft. This strategy document explains the vision, the current state of implementation, and the path forward.

---

## 1. The Vision: 80/20 Agent-Centric Development

### The Core Premise

No single person possesses 100% expertise across Product, Design, and Development — the "golden triangle" of software delivery. Traditional approaches require either a full cross-functional team or accept that a solo builder's output will have significant gaps.

**Our approach inverts this constraint.** Instead of requiring expertise upfront, we use AI agents to provide 80% of each discipline's capability to any individual, then bring in domain experts only for the final 20%.

### What 80% Looks Like

An application produced at the 80% level through Maestro is:

- **Functional** — core features work end-to-end
- **Designed** — uses a consistent design system (Flagship Design System) with acceptable layout and UX
- **Coded** — follows established patterns, type-safe, with basic test coverage
- **Deployable** — ready for demos, pilot testing, or small production workloads to gauge interest

This is not a throwaway prototype. It is a working application that other roles can build upon without having to start from scratch.

### What 80% Means for the Codebase

From a technical perspective, the 80% codebase is production-capable at small scale and team-ready for continued development. Specifically:

**Backend — Production-Ready Foundations:**
- Layered architecture with clear separation: routes (controllers) → service logic → database access — following the standard controller/service/repository pattern that any backend developer expects
- Working database schema with versioned migration files and seed data — not mock data, in-memory stores, or inline `IF NOT EXISTS` scripts; migration history is traceable and rollback-safe for multi-developer workflows
- UUIDs for all resource primary keys — no sequential integers that leak record count or enable enumeration attacks
- PostgreSQL with parameterized queries throughout — no SQL string concatenation, no injection risk
- Centralised error handling middleware — consistent error response shape across all routes, no stack traces or internal details leaked to the client
- Structured logging via Pino — JSON-formatted request/response logs with log levels, searchable and parseable in any log aggregator
- Health check endpoint — verifiable liveness for deployment environments
- Input validation at every route handler — type checking, format enforcement, and rejection of unknown fields at the API boundary
- Environment-based configuration — all secrets, connection strings, and environment-specific values read from environment variables, never hardcoded
- Security headers via koa-helmet — CSP, X-Frame-Options, HSTS set by default
- Graceful shutdown handling — in-flight requests drain on SIGTERM before process exits
- Build output that produces a single deployable server artifact (`dist/index.js`)

**Frontend — Production-Ready Foundations:**
- Component-based architecture using the Flagship Design System exclusively — consistent tokens, components, and theming throughout with no arbitrary CSS
- Page-level routing with clean URL structure
- Type-safe API client layer — frontend-to-backend communication uses shared TypeScript interfaces, reducing integration bugs
- Responsive layout built on design system grid and spacing tokens
- Error boundaries for graceful UI failure handling
- Vite build pipeline that produces optimised, cache-busted static assets (`dist/client/`)

**Shared Foundations (Backend + Frontend):**
- TypeScript throughout — type-safe interfaces between frontend and backend via a `shared/types.ts` contract
- Clear project structure with separated concerns (`src/` for frontend, `server/` for backend, `shared/` for type definitions only)
- Modular architecture that a team can extend without stepping on each other's work — each route, component, and page is independently modifiable
- Basic test coverage for routes and components — enough to catch regressions when modifying code
- ESLint configuration for consistent code style enforcement across the team
- Colima + Docker Compose configuration for reproducible local development (PostgreSQL container)
- Pre-commit secret scanning (gitleaks) — prevents accidental credential commits
- End-to-end feature flows that work in a real browser against a real database
- Deployable to a hosting environment for real user traffic at small scale

**What 80% Deliberately Excludes (the 20% SMEs Complete):**
- CI/CD pipeline and automated deployment (added by SWE)
- Performance optimisation and caching strategies (added by SWE)
- Security hardening beyond baseline — authentication/authorisation flows, rate limiting, security headers (CSP, HSTS, CORS tightening), session management, CSRF protection, penetration testing (added by SWE)
- Pixel-perfect design refinement and micro-interactions (added by UX Designer)
- Analytics instrumentation and user behaviour tracking (added by PM)

The key distinction: the 80% codebase is not a proof-of-concept that needs to be thrown away. It is a functioning small-scale production application with clean enough architecture that a development team can onboard, understand the structure, and begin extending it on day one.

### What 100% Requires

To reach production-grade quality, the 80% output is handed off to subject matter experts who use their respective specialist agents to complete the remaining 20%:

| Role                  | Specialist Agent | What They Complete                                                                                                                                                 |
| --------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **UX Designer**       | Designer Agent   | Visual polish, interaction refinement, accessibility compliance, user research integration                                                                         |
| **Software Engineer** | SWE Agent        | Authentication/authorisation, test coverage hardening, CI/CD pipeline, performance optimisation, security hardening (rate limiting, security headers, pen testing) |
| **Product Manager**   | PM Agent         | Feature prioritisation refinement, analytics instrumentation, user story completeness, stakeholder alignment                                                       |

The critical design principle: **SME work is additive, not rework.** Designers enhance the existing design — they do not redesign from scratch. Developers refactor and extend the existing codebase — they do not rewrite it. Product managers refine scope — they do not restart discovery.

---

## 2. How It Works Today

### The WAI Agent Ecosystem

We have built and operational the following AI agent components:

**Orchestrator:**
- **WAI Maestro** — End-to-end delivery orchestrator that coordinates the full SDLC pipeline

**Specialist Agents (Subagents):**
- **WAI Product Manager** — Defines problems, scopes MVPs, writes user stories
- **WAI Software Engineer** — Architecture review, code review, security assessment
- **WAI FDS Engineer** — Frontend implementation using the Flagship Design System
- **WAI Backend Engineer** — Backend implementation (Koa, PostgreSQL, API routes)

**Supporting Skills (Reusable Capabilities):**
- Full-stack project scaffolding (Vite + React + Koa + PostgreSQL)
- Design system component library integration
- Enhancement proposal authoring
- Implementation planning with dependency analysis
- Git commit workflow automation
- Deployment automation (Rabbit Deploy)

### The Maestro SDLC Pipeline

When a user describes what they want to build, Maestro executes these phases automatically:

```
Phase 1 — Requirements        → WAI Product Manager scopes the MVP
Phase 1.5 — Architecture Review → WAI Software Engineer validates design
Phase 2 — Scaffold (new apps)  → Automated project setup
Phase 3 — Frontend             → WAI FDS Engineer builds UI
Phase 4 — Backend              → WAI Backend Engineer builds API & DB
Phase 5 — Build Verification   → Automated build checks
Phase 6 — Test Execution       → Automated test suite
Phase 7 — Code Review          → WAI Software Engineer reviews quality
Phase 8 — Deploy (on request)  → Automated deployment
```

Each phase delegates to the appropriate specialist, synthesises results, and keeps the user informed. The user makes key decisions (MVP scope approval, deployment confirmation) while the agents handle implementation.

---

## 3. Two Usage Modes

### Mode A: Maestro — For Anyone With an Idea

**Who:** Any person from any domain — policy officers, business analysts, managers, operations staff — who has an idea and wants to test it quickly.

**What they get:** A functional web application at 80% quality without needing software development skills.

**When to use:** Rapid idea validation, hackathon-style prototyping, proof-of-concept for stakeholder buy-in, small-scale production pilots.

**Value proposition:** Eliminates the bottleneck of waiting for engineering resources to validate ideas. A single person can go from concept to working application in hours, not weeks.

### Mode B: SME Agents — For Domain Experts

**Who:** Professional Product Managers, UX Designers, and Software Engineers.

**What they get:** AI-accelerated workflows that handle the repetitive parts of their craft so they can focus on high-judgment decisions.

**When to use:** Taking a Maestro prototype to production, or accelerating their daily work on any existing project.

**Value proposition:** Domain experts work faster without compromising quality standards. The agents handle boilerplate; the humans make the decisions that require expertise.

---

## 4. The Future Team Model

### From Large Teams to Smart Teams

The agent-centric SDLC shifts the minimum viable team composition:

| Model                      | Team Size                          | Coverage (how "enterprised" is the application )     |
| -------------------------- | ---------------------------------- | ---------------------------------------------------- |
| **Traditional**            | 5–8 (PM, UX, 2–3 Devs, QA, DevOps) | 100% coverage through hiring                         |
| **Agent-Augmented (Solo)** | 1 person + Maestro                 | 80% coverage — sufficient for prototyping and pilots |
| **Agent-Augmented (Full)** | 3 people (PM + UX + Dev) + agents  | 100% coverage — production-grade delivery            |

The ideal future team is **three domain experts, each augmented by their specialist agent.** This team can deliver enterprise-grade applications because:

- Each expert handles the 20% that requires human judgment in their domain
- Each expert is accelerated by an agent that handles the 80% of repetitive execution
- The combined output is production-ready without requiring large headcount

---

## 5. Why 80/20 — Not 100%

We deliberately do not claim that agents can fully replace human expertise. Our reasoning:

1. **Quality ceiling without domain expertise.** An agent workflow operated by someone without deep domain knowledge will always hit a ceiling. Product decisions require market understanding. Design decisions require user empathy. Engineering decisions require systems thinking. These cannot be fully automated.

2. **Safe exploration over reckless automation.** The 80% target is calibrated so that the output is useful and not harmful — it follows established patterns, uses a vetted design system, and passes automated quality checks. This is meaningfully better than the alternative of either (a) not building at all or (b) building without any guardrails.

3. **Additive path to production.** By constraining the 80% output to follow standard architecture patterns, design system conventions, and code quality baselines, we ensure that SME effort is additive rather than corrective. The 20% gap is polish and hardening, not rework.

4. **Honest capability framing.** Positioning the system as "80% capable" rather than "fully autonomous" builds trust with stakeholders and sets realistic expectations for adopters.

---

## 6. Risks and Mitigations

| Risk                                                                                                   | Likelihood | Impact | Mitigation                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------ | ---------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **80% output quality varies** — inconsistent results across different application types                | Medium     | High   | Architecture review phase (Phase 1.5) and automated build/test verification provide quality gates; design system constraint ensures visual consistency |
| **SMEs reject Maestro output** — domain experts find the 80% output requires more rework than expected | Medium     | High   | Define explicit handoff contracts specifying the artifact quality each SME role expects; pilot with internal teams and iterate                         |
| **Over-reliance on agents** — users treat 80% output as production-ready without SME review            | Low        | High   | Clear communication in tooling and documentation that 80% is for pilots, not production; automated warnings for deployment without review              |
| **AI capability regression** — model updates degrade agent performance                                 | Low        | Medium | Automated validation scripts for each agent; version-pinned model configurations with fallback options                                                 |
| **Adoption resistance** — staff unfamiliar with AI tooling avoid the system                            | Medium     | Medium | Phased training rollout; start with low-stakes use cases (hackathons, internal tools)                                                                  |

---

## 7. Next Steps

### Immediate (Current Quarter)

1. **Complete the Designer Agent** — create the UX Designer specialist agent to close the current gap in the SME agent lineup
2. **Define handoff contracts** — specify exactly what artifacts Maestro's 80% output must produce for each SME role to build upon without rework
3. **Add Maestro-to-SME transition workflow** — implement the handoff mechanism so experts can seamlessly pick up where Maestro left off

### Near-Term (Next Quarter)

4. **Internal pilot** — run 2–3 internal teams through the full 80% → 100% workflow and collect feedback
5. **Measure and report** — track time-to-prototype, rework ratio, and team satisfaction to validate the 80/20 hypothesis
6. **Iterate on quality gates** — refine the automated checks that ensure Maestro's 80% output meets the additive-enhancement threshold

### Medium-Term (6 Months)

7. **Expand application types** — extend beyond the current Vite + React + Koa stack to support additional frameworks and architectures
8. **Training programme** — roll out structured training for each usage mode (Maestro for generalists, SME agents for specialists)
9. **Publish as reusable plugin** — package the agent ecosystem for distribution across the organisation

---

## Appendix: Terminology

| Term                 | Definition                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------- |
| **Maestro**          | The orchestrator agent that coordinates the full SDLC pipeline                                |
| **SME Agent**        | A specialist agent designed for a specific domain expert (PM, UX, Dev)                        |
| **80% Output**       | A functional, deployable application produced by Maestro without domain expertise             |
| **Golden Triangle**  | The three disciplines required for complete software delivery: Product, Design, Development   |
| **WAI**              | Web Application Intelligence — the agent plugin ecosystem                                     |
| **FDS**              | Flagship Design System — the UI component library that ensures visual consistency             |
| **Handoff Contract** | The defined artifact shape that Maestro's output must conform to for SME agents to build upon |
