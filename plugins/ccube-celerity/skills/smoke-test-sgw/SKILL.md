---
name: smoke-test-sgw
description: 'Use when: the user says "smoke test", "health check", "is the site up", or wants a read-only availability + render check of a website or web app (e.g. SupportGoWhere kiosk + main sites). Provides one Rust binary that checks HTTP/headers/assets, renders every URL in headless Chrome, classifies each page, screenshots failures, and sets a pass/fail exit code.'
user-invocable: true
---

# Skill: Smoke Test (read-only)

A single self-contained Rust binary does everything. It launches and manages its
own headless Chrome via **chromiumoxide** (the Rust equivalent of Playwright:
same Chrome DevTools Protocol architecture), so there is no external webdriver,
no Firefox, no Python, no manual orchestration. **Do not** hand-drive a browser
or parse JSON yourself: run the binary and read the printed summary.

Crate: `smoke-rs/` (bin name `smoke`). HTTP via `ureq` (native-tls, so it trusts
the OS store incl. any corporate proxy CA); render via `chromiumoxide`; pure
logic in `src/logic.rs` is unit-tested.

## Build (once; cached thereafter)

```bash
cd <skill>/smoke-rs
CARGO_HOME=.cargo-home cargo build --release      # produces target/release/smoke
CARGO_HOME=.cargo-home cargo test --lib           # unit tests: classify, asset-extraction, report
```

Cache `CARGO_HOME=.cargo-home` and `target/` so only the first build pays the
compile cost. Requires Google Chrome (or Chromium) installed; chromiumoxide
auto-detects it.

## Run

```bash
<skill>/smoke-rs/target/release/smoke \
  https://example.gov.sg/ https://example.gov.sg/about
# or from a file (one URL per line, # comments allowed):
<skill>/smoke-rs/target/release/smoke --file routes.txt
```

Exit code is `0` when every URL is OK / a clean 404 / an auth gate, `1` if any
URL errored, broke images, or returned an empty body. So `&& echo PASS` works.

### Flags

| Flag | Purpose |
|---|---|
| `--file PATH` | read newline-separated URLs (in addition to positional args) |
| `--shots DIR` | screenshot flagged (failing) pages into DIR |
| `--json PATH` | full results JSON (default `./smoke-results.json`) |
| `--report PATH` | Markdown smoke-test report (default `./smoke-report.md`) |
| `--wait SECS` | per-page settle *ceiling* (default 2.5); pages exit early once their body text stabilizes, so this only bounds slow pages |

Render concurrency is a fixed constant (6): the run is network-bound, so tuning
it gave no measurable benefit. The HTTP/asset check always runs.

Every run finishes by writing a Markdown report (`--report`, default
`smoke-report.md`): a PASS/FAIL verdict, a status breakdown, a render table, an
HTTP/asset table, and a Findings list of anything that failed (with screenshot
paths). That report file is the shareable artifact of a run; `Read` it (or the
flagged screenshots via `--shots`) to inspect results.

## Status classification

| Status | Meaning | Pass? |
|---|---|---|
| `OK` | renders with healthy body, 0 broken images | yes |
| `404` | graceful not-found page (gated/unpublished route) | yes |
| `AUTH-GATE` | redirected to a login provider / OTP / Singpass wall | yes |
| `BROKEN-IMG` | one or more images failed to load | no |
| `EMPTY?` | body too short; SPA likely didn't hydrate | no |
| `ERR` | JS error page, navigation/eval failure, or timeout | no |

The HTTP pass also flags any first-party asset (`/static/*`, js/css/icon/
manifest) that doesn't return 200, and records security headers in the JSON.
Asset checks run concurrently and use `HEAD` (GET fallback if the origin rejects
HEAD) so multi-MB bundles aren't downloaded just to read a status code. Watch the
served HTML for placeholder leaks worth a manual glance (e.g. a literal `MOCKID`
GTM id).

## STRICT read-only

Navigate and observe only. Never submit forms, log in, enter PINs/OTPs, or click
Apply/Submit/Save unless the user explicitly authorizes a specific write. An
`AUTH-GATE` or clean `404` is a PASS, not a failure.

## Example target: SupportGoWhere

Enumerate routes from the codebase, don't guess. For SGW specifically (all URLs
below are public production endpoints):

- **Main** `https://supportgowhere.life.gov.sg/`
  - Content scheme pages: `/schemes/<UPPER-CODE>/<slug>` (public). Bare
    `/schemes/<CODE>` 302s to the slug for published schemes; unpublished /
    feature-gated codes fall through to a clean 404 (expected).
  - `/topics/<topic>`, `/budget/support-calculator`, `/chat`, `/my-applications`.
  - **Application flows:** `/grants/<schemeCode>` -> `/grants/<schemeCode>/apply`,
    hard-gated to Singpass (`AUTH-GATE`).
  - Authoritative app-scheme list comes from the backend schema JSON
    (`schemeCode` + `schemeName`); embeddings JSON can be stale, don't use it for
    route enumeration.
- **Kiosk** `https://kiosk.supportgowhere.life.gov.sg/` -> `/admin` (PIN gate).
  - **DL Call Monitor:** `/admin/monitor` (email -> OTP gate), same-origin as the
    kiosk app.

## Gotchas

- An HTTP 200 on an SPA only proves the HTML shell loaded; the render check is
  what confirms the app mounts. Both run by default.
- Widgets in shadow DOM (chat widgets, etc.) won't show up in a top-level
  `querySelectorAll`; confirm those visually via `--shots`.
- Slow pages: raise `--wait` (it caps the settle wait; fast pages aren't slowed by
  a high value since they exit as soon as their body stabilizes).
- On a network with a TLS-intercepting proxy, the binary already uses native-tls
  (OS trust store), so HTTPS asset checks work where a webpki-only client fails.

## Release verification: ticking Confluence release-doc checkboxes

After a release deploy, this smoke test can satisfy a subset of the "Deployment
verification" checkboxes in the release doc (see the `celerity-deploy-release`
skill). It only proves **availability + render**, so tick ONLY the checks it
actually covers, and leave functional QE checks (Singpass login, MyInfo
retrieval, file upload, happy-flow journeys, accessibility scan) for the human QE
pass.

- **CMS** ("Schemes/Services can be retrieved on main site") -> a green smoke run
  over several `/schemes/<CODE>` pages (rendered titles, 0 failing) proves this.
  Tick it.
- **General** ("Site is up" + "Login through Singpass" + accessibility scan) ->
  only "site is up" is proven; do NOT tick.
- Interactive flows (Budget / Appgen / SAF / Sequential) -> smoke cannot prove
  them. Leave for QE.
- The Deployment-Summary **"Tagged"** checkbox is ticked once the git tag + GitLab
  release exist (a release-step fact, not a smoke result).

Editing the checkboxes: fetch
`GET /rest/api/content/<id>?expand=body.storage,version`, string-replace the
`<ac:task-status>` inside the target `<ac:task>` block, PUT back with
`version.number + 1`. When filling a "Verified by" cell from an automated run,
prefix the note with `Agent:` per the identity rule, never assert a human
verified it.
