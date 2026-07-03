<div align="center">

# Celerity

*Release, deploy, and smoke-test knowledge for the Celerity pillar (SupportGoWhere)*

<p align="center">
  <img src="https://img.shields.io/badge/Agents-0-555?style=for-the-badge&logo=githubactions&logoColor=white&labelColor=274183" alt="Agents">
  <img src="https://img.shields.io/badge/Skills-2-555?style=for-the-badge&logo=lightning&logoColor=white&labelColor=F6C063" alt="Skills">
</p>

</div>

---

## What This Plugin Does

This plugin gives an agent the operational knowledge to ship a Celerity-style
release end to end and to verify a deployed site. It packages two skills: the
deploy + release runbook, and a read-only site smoke test used for post-deploy
verification.

The skills were generalised from an internal SupportGoWhere runbook. Any
project-specific identifiers (Jira / GitLab / Confluence IDs, hostnames) appear
as `<PLACEHOLDERS>` configured per deployment — see the release skill's
**Configuration** section before first use.

> **Portability note.** These skills reach Jira, Confluence, and GitLab through
> CLIs today, not approved MCP servers. See
> [`references/govtech-mcp-migration.md`](references/govtech-mcp-migration.md)
> for the CLI to approved-MCP migration path.

---

## What Gets Installed

| Type  | Name                     | Purpose                                                     |
| ----- | ------------------------ | ----------------------------------------------------------- |
| Skill | `celerity-deploy-release` | End-to-end deploy + release runbook (Jira, GitLab, Confluence) |
| Skill | `smoke-test-sgw`          | Read-only availability + render smoke test (headless Chrome) |

---

## Skills

### `celerity-deploy-release`

Activated when the user says "do the release", "deploy <fruit>", "release
management", or names a fruit / version to ship. Walks the agent through release
numbering and fruit naming, the Jira release, the GitLab `release/v<semver>`
branch + pipelines, security scans, the Confluence release document and tracker
row, the UI-gated deploy, and the final GitLab release. Pauses at the
inherently-manual gates (clicking deploy in the pipeline UI, file scans).

**Example prompts:**

- "Do the release for Marionberry."
- "Deploy the Digital Lobby hotfix to prod."
- "Walk me through the release management steps."

### `smoke-test-sgw`

Activated when the user says "smoke test", "health check", or "is the site up".
Runs one self-contained Rust binary that checks HTTP/headers/assets, renders every
URL in headless Chrome, classifies each page (OK / 404 / AUTH-GATE / broken), screenshots
failures, and sets a pass/fail exit code. Strictly read-only. Doubles as
post-deploy verification for the release skill (proves availability + render only;
functional QE stays with a human).

**Example prompts:**

- "Smoke test the SGW kiosk and main sites."
- "Is production up after the deploy?"
- "Health check these URLs and screenshot anything broken."

Build the binary once (`cd smoke-rs && CARGO_HOME=.cargo-home cargo build
--release`); requires Google Chrome or Chromium installed.
