# MCP integrations (Jira / Confluence / GitLab)

These skills reach external systems through **MCP servers**, not CLIs. The skill
bodies are written at the capability level (`jira.*`, `confluence.*`, `gitlab.*`)
so they work with whichever approved MCP servers your environment provides. Only
`git` (version control) and `psql` (DB migration) remain as local commands.

## Servers to declare

| System | MCP server | Notes |
| --- | --- | --- |
| Jira | Atlassian MCP (or SHIP-HATS-hosted equivalent) | versions, JQL search, release |
| Confluence | Atlassian MCP (same server) | page read / create / update (storage body) |
| GitLab | GitLab-native MCP, or the SHIP-HATS GitLab MCP | pipelines, jobs, releases |

On a GovTech / SHIP-HATS setup, the exact endpoints and the auth method come from
the approved-MCP catalogue (the "sign up for agentic tools with MCP" docs,
login-gated). Point your project's copy of this file at that page and fill in the
endpoints. Getting the list:

- SHIP-HATS docs → *AI coding assistants* → *MCP servers* / *sign-up-for-agentic-tools-with-mcp*.
- In VS Code: Command Palette → **MCP: Add Server** → Browse (your org gallery).
- If SHIP-HATS ships a gateway, the catalogue usually gives a ready `mcpServers` block.

## Example manifest block

```jsonc
{
  "mcpServers": {
    "atlassian": { "type": "http", "url": "<ATLASSIAN_MCP_URL>" },
    "gitlab":    { "type": "http", "url": "<GITLAB_MCP_URL>" }
  }
}
```

The plugin standard allows a plugin to declare the MCP servers it needs so they
install alongside the skills. When the approved endpoints for this marketplace
are confirmed, add them here so `ccube-celerity` installs its integrations too.

## Capability → tool → REST reference

The `celerity-deploy-release` SKILL has the full capability table (each
`jira.*` / `confluence.*` / `gitlab.*` label plus the REST shape it maps to).
Confirm the actual tool names your MCP servers expose and use those; if a
capability has no tool, fall back to the REST shape over an authenticated
transport and log the gap for the catalogue.
