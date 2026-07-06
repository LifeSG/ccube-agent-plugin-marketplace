---
name: celerity-deploy-release
description: 'Use when: the user says "do the release", "deploy <fruit>", "release management", or names a fruit / DL version to ship for a Celerity / SupportGoWhere-style repo set. Provides the end-to-end deploy + release process: release numbering, Jira release, GitLab release branch + pipelines, security scans, Confluence release doc, deploy, and the GitLab release.'
user-invocable: true
---

# Skill: Celerity Deploy + Release

End-to-end deploy + release process for a Celerity-style repo set (a web
frontend, an API backend, and a CMS). It is a runbook, not an automation: the
agent drives Jira, GitLab, and Confluence steps in order and pauses at the
inherently-manual gates (clicking deploy in the pipeline UI, file scans).

> **Configure before first use.** This skill was generalised from an internal
> SupportGoWhere runbook. The project-specific identifiers (Jira project + version
> IDs, GitLab project IDs, Confluence space + page IDs, tooling hostnames) are
> shown as `<PLACEHOLDERS>`. Fill them in from your own project, ideally via the
> environment variables listed in **Configuration** below, before running any
> step. Do not commit real internal IDs back to a public plugin.

## Integrations (MCP-first)

This skill reaches Jira, Confluence, and GitLab through **MCP servers**, not
CLIs. It is written at the capability level ("use the Jira MCP to rename the
version") so it works with whichever approved MCP servers your environment
provides; the REST shapes are kept only as a reference for what each capability
maps to. Only `git` and `psql` remain as local commands (version control and DB
migration are not integration concerns).

Declare the servers your environment approves. On a GovTech / SHIP-HATS setup
these come from the approved-MCP catalogue (the sign-up-for-agentic-tools-with-MCP
docs). A plugin can ship this block in its manifest so the servers install with
it. Example shape (fill in the endpoints your catalogue gives you):

```jsonc
{
  "mcpServers": {
    // Jira + Confluence: Atlassian MCP (or your SHIP-HATS-hosted equivalent)
    "atlassian": {
      "type": "http",
      "url": "<ATLASSIAN_MCP_URL>"        // e.g. https://mcp.atlassian.com/v1/sse
    },
    // GitLab: GitLab-native MCP, or the SHIP-HATS GitLab MCP endpoint
    "gitlab": {
      "type": "http",
      "url": "<GITLAB_MCP_URL>"           // e.g. https://<GITLAB_HOST>/api/v4/mcp
    }
  }
}
```

Auth is handled by the MCP server (OAuth / token per your catalogue), not by
this skill. Confirm the exact server ids and tool names your servers expose and
use those; the capability names below (`jira.*`, `confluence.*`, `gitlab.*`) are
generic labels for "the tool on that server that does X".

Set these project values once (shell env, a local `.env`, or MCP config):

| Variable | Meaning | Example shape |
| --- | --- | --- |
| `JIRA_PROJECT_KEY` | Jira project key for releases | `ABC` |
| `JIRA_PROJECT_ID` | Numeric Jira project id | `10000` |
| `GITLAB_HOST` | GitLab host | `gitlab.example.com` |
| `GITLAB_PID_WEB` / `GITLAB_PID_API` / `GITLAB_PID_CMS` | GitLab numeric project ids | `12345` |
| `CONFLUENCE_SPACE` | Confluence space key for release docs | `RELEASES` |
| `CONFLUENCE_RELEASES_PARENT_ID` | Parent page id ("<YEAR> Releases") | `<id>` |
| `CONFLUENCE_TRACKER_ID` | Combined Release Management tracker page id | `<id>` |
| `CONFLUENCE_SCAN_LOG_ID` | OSS / SAST Reports Log page id | `<id>` |

The two Confluence guides that this process must stay consistent with (the
Release Management Guide and the Combined Release Management tracker) live in
your project's Confluence space; link them at the top of your own copy.

### Capability → MCP tool → REST reference

| Capability | MCP server | REST shape it maps to (reference only) |
| --- | --- | --- |
| `jira.listVersions` | Atlassian/Jira | `GET /rest/api/3/project/<KEY>/versions` |
| `jira.renameVersion` / `jira.createVersion` | Atlassian/Jira | `PUT` / `POST /rest/api/3/version/<id>` |
| `jira.searchByFixVersion` | Atlassian/Jira | `GET /rest/api/3/search/jql?jql=fixVersion=<id>` |
| `jira.releaseVersion` | Atlassian/Jira | `PUT /rest/api/3/version/<id>` `{released,releaseDate}` |
| `confluence.getPage` (storage) | Atlassian/Confluence | `GET /rest/api/content/<id>?expand=body.storage,version` |
| `confluence.createPage` / `confluence.updatePage` | Atlassian/Confluence | `POST` / `PUT /rest/api/content` |
| `gitlab.listPipelines` | GitLab | `GET /projects/<pid>/pipelines?ref=<branch>` |
| `gitlab.getPipelineJobs` | GitLab | `GET /projects/<pid>/pipelines/<id>/jobs` |
| `gitlab.createRelease` | GitLab | `POST /projects/<pid>/releases` |

If a tool for a capability is not exposed by your MCP server, fall back to the
REST shape via whatever authenticated transport your environment allows, and log
the gap so it can be raised for the catalogue.

## Concepts (read first)

- **Release number** (e.g. 178): canonical, incremental, monotonic. The primary
  identifier: it titles the Confluence doc (`<Project> Release <NNN>`) and leads
  the tracker's `Release no./Fruit` cell. A hotfix takes the next number (a fruit
  hotfixing 177 = 178).
- **Fruit** (e.g. Rose Apple, Marionberry): ephemeral mnemonic for a release,
  secondary to the number. Lives in the Jira version name and the tracker cell
  (under the number), NOT the doc title. Fruits may repeat if previously
  discarded, so "Apple" (177) and "Rose Apple" (178) are distinct fruits.
- **Release version**: repo-specific, semver-ish (web `v8.69.2`, api `v2.44.0`,
  cms `v4.27.0`). Watch for a repo whose API package is renamed to avoid a clash
  with the CMS's own api package.
- Gitflow with **only `master`** (no develop). The release number is NOT the
  `release/v…` branch name.
- Map fruit <-> version(s) via Jira releases. If you cannot map, ASK.

## Prerequisites

1. Work tagged with Jira "Affected version" + "Fix version" as it goes (create
   versions following semver as needed).
2. Work is Done.

## Step 1: Choose release number + fruit name

- **Release number**: the next monotonic integer after the last released number
  (check the tracker / recent doc titles; e.g. 177 -> 178). Titles the Confluence
  doc.
- **Fruit**: pick one NOT currently in use in Jira releases (a long-discarded one
  is fine to reuse). Verify with `jira.listVersions` on `JIRA_PROJECT_KEY` and
  scan the names.

## Step 2: Jira release

Create (or, if a matching version already exists, **rename**) the Jira version to
`[<Fruit>] <Description>` form, e.g. `[Rose Apple] Digital Lobby 1.1.1`.

- Rename with `jira.renameVersion` (set the new `name`), or `jira.createVersion`
  if none exists.
- Find issues in a version with `jira.searchByFixVersion` (a JQL
  `fixVersion=<id>` search; the old non-JQL search endpoint is deprecated and
  returns empty).

## Step 3: GitLab release branch + pipelines

- **Branch naming is versioned, NOT fruit**: `release/v<semver>` (e.g.
  `release/v8.69.2`). The fruit lives in Jira/Confluence, not the branch.
- Branch from **master** where possible, OR from the **previous release commit**
  when isolating a hotfix.
- **Hotfix pattern (important):** branch from the previous release's tagged
  commit, then **cherry-pick** the specific fix commit(s). Do NOT branch directly
  from the fix commit on master if master has later unscheduled commits:
  ```bash
  # <PREV_RELEASE_COMMIT> = tag of the release you are patching.
  # <FIX_COMMIT> = the commit to ship.
  WT=/tmp/rel-<fruit>-web
  git worktree add -b release/v<semver> $WT <PREV_RELEASE_COMMIT>
  git -C $WT cherry-pick <FIX_COMMIT>          # keeps original author
  git -C $WT push -u origin release/v<semver>  # triggers pipeline
  git worktree remove $WT --force
  ```
  Always use a worktree, never the main checkout.
- Tags: the web repo uses **bare** `X.Y.Z` tags (no `v`); branches use
  `release/vX.Y.Z`. With Lerna independent-versioning (root `package.json` at
  `0.0.0`), the release version comes from the tag/branch name.
- Pushing a `release/*` branch triggers CI. Typically `release/*` and `master`
  get build + UAT-track deploy jobs; prod jobs are `when: manual`. Deploys to UAT
  unless instructed otherwise. Release ALL packages unless told otherwise.
- Check a pipeline with `gitlab.listPipelines` on `GITLAB_PID_WEB` filtered by
  `ref=<branch>` (take the most recent). Get its failed jobs with
  `gitlab.getPipelineJobs`.
- When UAT deploy is green, run regression on UAT (async; QE may own it). Asking a
  person is an external message in the user's identity: get exact wording approval
  first, do not auto-send.

## Step 4: Security scans (skip if already done for the base release today)

Per release, before release: SAST (e.g. Fortify) + OSS/dependency scan (e.g.
Nexus IQ), results into the OSS/SAST Reports Log (`CONFLUENCE_SCAN_LOG_ID`).
Report name `YYYYMMDD-reponame`, "Static Issue Detail" template, PDF. If your
SAST create call is non-blocking, loop then poll.

## Step 5: Confluence release document

- Clone the most recent comparable release doc (a single-repo release is the
  cleanest template). Space `CONFLUENCE_SPACE`, parent
  `CONFLUENCE_RELEASES_PARENT_ID` ("<YEAR> Releases"). **Title by release NUMBER:
  `<Project> Release <NNN>`.** Only use a fruit-titled doc as a fallback when no
  number is assigned yet; rename it once the number is allocated.
- Procedure that works: read the model doc's storage XHTML with
  `confluence.getPage` (storage body), do targeted string replacements
  (description/tickets, Jira `versions/<id>`, version-change cells prev/new,
  branch, pipeline id), then `confluence.createPage` the new doc.
  - GOTCHA: version-change cells are `vX.Y.Z</p>`. Replace the **new-version**
    value before the **previous-version** value (or use ordered placeholders) so
    you don't collapse both cells to the same number.
- Fill: which repos to deploy, pre/deploy/post details, db migrations if appgen,
  release branch, pipelines, Jira release link, Jira tickets + descriptions.

### Step 5b: Add a row to the Combined Release Management tracker

The master tracker (`CONFLUENCE_TRACKER_ID`) is an 8-column table:
`Release no./Fruit | Year | Release Date | Features | Release document | PIC |
Versioning | Status`. Add a row in date order (a hotfix goes right after the
release it patches).

- Read the tracker storage XHTML with `confluence.getPage` on
  `CONFLUENCE_TRACKER_ID`, insert a `<tr>` right after the closing `</tr>` of the
  row you're following, and write it back with `confluence.updatePage`
  (`version.number + 1`).
- Cell 1 holds the release number AND fruit on separate `<p>` lines; features as
  `<strong>REPO</strong>` + `<ul><li>` ticket lines; release-doc cell links the
  Confluence doc; versioning like `web v8.69.2`.
- Status uses a `status` structured-macro: `RELEASED`/`Green` when live,
  `IN PROGRESS`/`Blue` while deploying, `PLANNING`/`Purple` when future.
- Leave PIC empty unless told who it is (do not assert an identity unasked).

## Step 6: Deploy

**CRITICAL (web): the deploy must run from a UI ("Run pipeline") pipeline, NOT
the auto push pipeline.** Deploy jobs are typically gated
`if: $CI_PIPELINE_SOURCE == "web" && $DEPLOY_<X> == "true"`. A `push` pipeline
(auto-triggered when you push `release/*`) contains NO deploy jobs. The "Run
pipeline" UI preselects the deploy vars to `"false"`; set the right one(s) to
`"true"`, e.g.:

- `DEPLOY_WEB`: main web app
- `DEPLOY_DIGITAL_LOBBY`: the kiosk app (easy to miss when shipping a DL release)
- `DEPLOY_DIGITAL_LOBBY_SCANNER`: the softcopy-upload scanner app
- `RUN_SECURITY_SCANS`: official SAST + OSS scan on a manual pipeline

Flow: Build > Pipelines > Run pipeline > pick `release/v<semver>` > flip the
needed `DEPLOY_*` var(s) to `true` > Run. Prod jobs are then `when: manual` (press
the buttons). UAT deploy auto-runs in that web pipeline once the build passes.
Ensure the image-push job completed before deploy; on a registry 403, rerun the
get-token job. DB migrations are manual on the deploy tooling server
(`cat file.sql | psql -h <host> -p <port> -U <user> -d <db>`).

## Step 6b: Post-deploy verification (smoke test + tick release-doc checkboxes)

After prod is live, run the **[[smoke-test-sgw]]** skill against the deployed
sites (routes enumerated from the codebase, not guessed). A green run (0 failing;
AUTH-GATE and clean 404 both count as PASS) lets you tick the release doc's
"Deployment verification" checkboxes that smoke actually proves: availability +
render only. Do NOT tick checks that bundle interactive QE (Singpass login,
happy-flows, MyInfo, file upload, accessibility scan); leave those for the human
QE pass. Checkboxes are `<ac:task>` items: flip
`<ac:task-status>incomplete</ac:task-status>` to `complete` via storage-edit + PUT
(`version + 1`). When filling a "Verified by" cell from an automated run, prefix
it `Agent:`, never assert a human verified it.

## Step 7: GitLab release

On release day (or backdate `released_at` to the Jira/Confluence date): use
`gitlab.createRelease` on the existing tag, blank/default title (= tag), notes
from the Jira fix version, links to the Jira release + Confluence doc. Then mark
the Jira fix version released with `jira.releaseVersion` (`released: true`,
`releaseDate: YYYY-MM-DD`).

## Worked example (shape, IDs redacted)

Release **178** (hotfix following 177), fruit "Rose Apple", single-repo web only:
- Jira version renamed `Digital Lobby 1.1.1` -> `[Rose Apple] Digital Lobby 1.1.1`.
- Branched `release/v8.69.2` from the 177 tag commit, cherry-picked the one fix
  commit, pushed.
- **Deploy gotcha hit:** the push pipeline carried no DL deploy jobs; deploy needed
  a UI "Run pipeline" with `DEPLOY_DIGITAL_LOBBY=true`. The API cannot produce a
  `source: web` pipeline.
- Confluence doc cloned from Release 177, titled "<Project> Release 178" once the
  number was assigned; tracker row shows `#178 / ROSE APPLE`.
- Scans skipped (done for 177 the same day). Tag `8.69.2` + GitLab release created,
  Jira version marked released, tracker row -> RELEASED/Green, smoke test green ->
  ticked "Tagged" + CMS checks.
