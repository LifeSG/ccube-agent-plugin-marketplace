# Telemetry Design

This document covers the full telemetry architecture for the
ccube VS Code plugin marketplace — what data is collected, the
backend design, and how to deploy and operate it.

---

## Privacy Principles

The following constraints are non-negotiable:

- No PII is ever collected — no usernames, email addresses, file
  paths, workspace names, or any identifying information
- An anonymous UUID is generated locally on first use and stored at
  `~/.ccube/telemetry-id`; the same ID is reused across all plugins
- Users can opt out completely by setting
  `CCUBE_TELEMETRY_DISABLED=1` in their shell profile
- Users can self-host the endpoint and point plugins at it via
  `CCUBE_TELEMETRY_ENDPOINT=https://your-host/event`
- Events are fire-and-forget; network failures are silent

---

## What Is Collected

Two event types are fired by the `SessionStart` hook in each plugin.

### `install` event

Fired on the very first session start after the plugin is installed
(determined by the absence of `~/.ccube/telemetry-id`).

```json
{
  "event": "install",
  "anonymousId": "a8f3c2d1-...",
  "plugin": "ccube-fds-web-app-builder",
  "ts": "2026-03-25T08:00:00Z"
}
```

### `session_start` event

Fired every time a Copilot chat session starts while the plugin is
active.

```json
{
  "event": "session_start",
  "anonymousId": "a8f3c2d1-...",
  "plugin": "ccube-fds-web-app-builder",
  "agent": "cc-product-manager",
  "ts": "2026-03-25T08:00:00Z"
}
```

### What the `agent` field contains

The hook reads the session context from stdin (a JSON payload
provided by the VS Code hooks runtime). If the agent name can be
parsed from that payload, it is included. If not, the field is set
to `"unknown"`. This field is never derived from user input.

---

## Backend Architecture

Recommended stack: **Cloudflare Worker + Cloudflare KV**

| Attribute  | Detail                                           |
| ---------- | ------------------------------------------------ |
| Hosting    | Cloudflare Workers (edge, globally replicated)   |
| Storage    | Cloudflare KV (key-value, eventually consistent) |
| Free tier  | 100k requests/day, 1GB KV storage                |
| Cold start | None (always-warm at edge)                       |

### Why Cloudflare Workers

- No infrastructure to manage
- Free tier comfortably covers personal marketplace usage
- Built-in DDoS protection and rate limiting at the network layer
- Workers are stateless; KV provides the persistence layer

---

## KV Store Design

All keys follow this schema:

```
count:{event}:{plugin}:{agent}:{YYYY-MM-DD}  →  integer (daily count)
seen:{anonymousId}                           →  "{plugin}:{YYYY-MM-DD}" (first-seen)
```

Examples:

```
count:session_start:ccube-fds-web-app-builder:cc-product-manager:2026-03-25  →  42
count:install:ccube-software-craft:unknown:2026-03-25                         →  7
seen:a8f3c2d1-4b5e-...                                                        →  "ccube-fds-web-app-builder:2026-03-25"
```

TTL policy:

- `count:*` keys expire after 400 days (~13 months of rolling data)
- `seen:*` keys expire after 730 days (2 years, to avoid re-counting
  the same installation as new)

---

## Cloudflare Worker Implementation

### Ingest endpoint — `POST /event`

```javascript
// worker.js
export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return corsResponse("", 204);
    }

    if (request.method === "GET") {
      return handleAdmin(request, env);
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Bad request", { status: 400 });
    }

    const { event, anonymousId, plugin, agent, ts } = body;

    // Validate required fields
    if (!event || !anonymousId || !plugin) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Allowlist event types — reject anything unexpected
    const ALLOWED_EVENTS = ["install", "session_start"];
    if (!ALLOWED_EVENTS.includes(event)) {
      return new Response("Invalid event type", { status: 400 });
    }

    // Sanitize to safe KV key characters — prevents key injection
    const safePlugin = String(plugin)
      .replace(/[^a-zA-Z0-9-]/g, "")
      .slice(0, 64);
    const safeAgent = String(agent || "unknown")
      .replace(/[^a-zA-Z0-9-_.]/g, "")
      .slice(0, 64) || "unknown";
    const safeId = String(anonymousId)
      .replace(/[^a-f0-9-]/g, "")
      .slice(0, 36);

    if (!safePlugin || !safeId) {
      return new Response("Bad request", { status: 400 });
    }

    const date = new Date().toISOString().split("T")[0];

    // Increment daily count for this event/plugin/agent combination
    const countKey =
      `count:${event}:${safePlugin}:${safeAgent}:${date}`;
    const current = parseInt(
      (await env.TELEMETRY.get(countKey)) || "0"
    );
    await env.TELEMETRY.put(countKey, String(current + 1), {
      expirationTtl: 60 * 60 * 24 * 400,
    });

    // Track unique installs (first seen per anonymousId)
    if (event === "install") {
      const seenKey = `seen:${safeId}`;
      const alreadySeen = await env.TELEMETRY.get(seenKey);
      if (!alreadySeen) {
        await env.TELEMETRY.put(
          seenKey,
          `${safePlugin}:${date}`,
          { expirationTtl: 60 * 60 * 24 * 730 }
        );
      }
    }

    return corsResponse('{"ok":true}', 200);
  },
};
```

### Admin endpoint — `GET /event?prefix=count:`

Authenticated with a secret key stored in Worker environment secrets
(never hardcoded).

```javascript
async function handleAdmin(request, env) {
  const apiKey = request.headers.get("X-API-Key");
  if (!apiKey || apiKey !== env.ADMIN_API_KEY) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const prefix = url.searchParams.get("prefix") || "count:";
  const limit = Math.min(
    parseInt(url.searchParams.get("limit") || "100"),
    1000
  );

  const list = await env.TELEMETRY.list({ prefix, limit });
  const results = {};

  for (const key of list.keys) {
    results[key.name] = await env.TELEMETRY.get(key.name);
  }

  return new Response(JSON.stringify(results, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

function corsResponse(body, status) {
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    },
  });
}
```

---

## Deployment Guide

### 1. Create the Worker

```bash
# Install Wrangler CLI
npm install -g wrangler

# Authenticate
wrangler login

# Create the Worker project
mkdir ccube-telemetry && cd ccube-telemetry
wrangler init --yes
```

### 2. Configure `wrangler.toml`

```toml
name = "ccube-telemetry"
main = "worker.js"
compatibility_date = "2026-01-01"

[[kv_namespaces]]
binding = "TELEMETRY"
id = "<your-kv-namespace-id>"
```

### 3. Create KV namespace

```bash
wrangler kv:namespace create "TELEMETRY"
# Copy the returned id into wrangler.toml
```

### 4. Set the admin API key secret

```bash
wrangler secret put ADMIN_API_KEY
# Enter a strong random string when prompted — store it securely
```

### 5. Deploy

```bash
wrangler deploy
```

The Worker URL will be in the format
`https://ccube-telemetry.<your-subdomain>.workers.dev`. Update the
`TELEMETRY_ENDPOINT` default in both plugin shell scripts to this
URL before shipping.

---

## Reading Data

```bash
# Daily session counts for all plugins
curl -H "X-API-Key: <your-key>" \
  "https://ccube-telemetry.<subdomain>.workers.dev/event?prefix=count:session_start:"

# Daily install counts
curl -H "X-API-Key: <your-key>" \
  "https://ccube-telemetry.<subdomain>.workers.dev/event?prefix=count:install:"
```

The admin API key should be stored in your password manager and
never committed to source control.

---

## Opt-out Mechanism

Users opt out by setting an environment variable in their shell
profile:

```bash
# In ~/.zshrc, ~/.bashrc, or ~/.profile
export CCUBE_TELEMETRY_DISABLED=1
```

The hook script checks this variable before doing anything else.
No network call is ever made when this variable is set.

---

## Security Considerations

- The Worker performs input allowlisting on event types and
  character-class sanitization on all KV key components — this
  prevents key injection attacks
- The `anonymousId` from the client is sanitized to hex + hyphens
  only, so it cannot contain shell metacharacters or KV key
  separators
- The admin API key is stored as a Worker secret (not a plaintext
  env var) and never appears in responses
- Hook scripts run with the user's local permissions; they do not
  require elevated access
- Hook scripts do not read or transmit file contents, workspace
  paths, or any user data beyond the fields listed in the schema

---

## Files in This Repo

```
plugins/
  ccube-fds-web-app-builder/
    hooks/
      hooks.json                   ← SessionStart hook declaration
    scripts/
      session-telemetry.sh         ← Shell script that fires events
  ccube-software-craft/
    hooks/
      hooks.json                   ← SessionStart hook declaration
    scripts/
      session-telemetry.sh         ← Shell script that fires events
```

The Cloudflare Worker source lives outside this repository and
should be maintained in a separate private repo.
