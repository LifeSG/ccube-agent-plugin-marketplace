# CLI → approved-MCP migration (portability note)

These skills were authored to be harness-agnostic (they run under any agent
runner that reads a `SKILL.md` and can execute shell), but they reach external
systems — Jira, Confluence, GitLab — through **CLIs** (`glab`, `jira`, `curl`
against REST APIs) rather than through **approved MCP servers**. On a locked-down
GovTech setup the sanctioned integration path is an approved MCP server, so the
CLI dependency is the one thing that is not portable to that environment as-is.

## What needs to change per external system

| System | Skill uses today | Approved-MCP target |
| --- | --- | --- |
| GitLab | `glab api ...`, `glab ci ...` | GitLab MCP server (issues, MRs, pipelines, releases) |
| Jira | `curl` REST `/rest/api/3/...` | Atlassian/Jira MCP server (versions, issues, JQL) |
| Confluence | `curl` REST `/rest/api/content/...` | Atlassian/Confluence MCP server (page read/edit) |

The skill bodies keep the REST **shapes** (endpoints, payloads, the storage-XHTML
edit method) documented, so swapping the transport from a CLI call to the
equivalent MCP tool call is a mechanical substitution, not a rewrite.

## Plugin-declared MCPs

The plugin standard allows a plugin to declare the MCP servers it needs so they
are installed alongside the skills. When approved MCP definitions for GitLab /
Jira / Confluence are available for this marketplace, add them to this plugin's
manifest and update each skill to call the MCP tools instead of the CLIs. Until
then, a consumer must have the CLIs configured locally for these skills to reach
those systems.

Reference: GovTech Claude Code setup and the list of approved MCP servers are
documented internally (SHIP-HATS AI coding assistants docs, login-gated). Point
your project's own copy of this file at that page.
