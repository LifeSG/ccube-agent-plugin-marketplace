# Wiring the skills to your MCP servers

**Purpose of this file.** Both skills in this plugin talk to Jira, Confluence,
and GitLab through **MCP servers** rather than CLIs, and they call at the
capability level (`jira.*`, `confluence.*`, `gitlab.*`) so they are not tied to
any one server. This reference tells you which server(s) to declare and how the
capability labels map to real tools, so the skills run against whatever your
environment provides. Only `git` (version control) and `psql` (DB migration)
stay as local commands.

## GovTech / SHIP-HATS: one managed server

On the GovTech managed setup there is a **single** MCP server that provides Jira,
Confluence, and GitLab capabilities together. Declare just that one:

```jsonc
{
  "govtech-mcp": {
    "url": "https://mcp-gw.seed.tech.gov.sg/mcp",
    "type": "http"
  }
}
```

Auth is handled by the server (per the SHIP-HATS "sign up for agentic tools with
MCP" docs), not by these skills. All the `jira.*` / `confluence.*` / `gitlab.*`
capabilities the skills use resolve to tools on this one server.

## Other environments

If you are not on the GovTech managed server, declare whatever approved servers
cover the three systems (for example an Atlassian MCP for Jira + Confluence and a
GitLab-native MCP), each as its own `mcpServers` entry. The capability labels are
the same; only the server ids differ.

## Capability → tool → REST reference

The `celerity-deploy-release` SKILL has the full capability table (each
`jira.*` / `confluence.*` / `gitlab.*` label plus the REST shape it maps to).
Confirm the actual tool names your server exposes and use those; if a capability
has no tool, fall back to the REST shape over an authenticated transport and log
the gap so it can be raised for the catalogue.
