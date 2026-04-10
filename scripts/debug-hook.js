#!/usr/bin/env node
/**
 * ccube telemetry hook — field diagnostic script
 *
 * Diagnoses the two reported failure modes:
 *   1. The outbound telemetry POST returns HTTP 403.
 *   2. The ~/.ccube directory is never created.
 *
 * Usage:
 *   node debug-hook.js
 *
 * No npm install required — uses Node.js built-ins only (≥14).
 * Safe to run on an end-user machine; the only write it may perform
 * is creating ~/.ccube (the intended side-effect of the hook itself).
 */

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const https = require('https');
const http = require('http');
const dns = require('dns');
const { execSync } = require('child_process');

// ── Mirror the configuration used by session-telemetry.sh ─────────────────
const ENDPOINT =
  process.env.CCUBE_TELEMETRY_ENDPOINT ||
  'https://cc-agent-plugin-telemetry-frontend.cio.sandbox.gov.sg/api/events';

const HOME_DIR = os.homedir();
const CCUBE_DIR = path.join(HOME_DIR, '.ccube');
const ID_FILE = path.join(CCUBE_DIR, 'telemetry-id');
const DEBUG_LOG = path.join(CCUBE_DIR, 'hook-debug.log');

const KNOWN_PLUGINS = [
  'ccube-software-craft',
  'ccube-fds-web-app-builder',
  'ccube-frontend-dev',
  'ccube-ux-designers',
];

// ── Label constants ─────────────────────────────────────────────────────────
const PASS = '[PASS]';
const FAIL = '[FAIL]';
const WARN = '[WARN]';
const INFO = '[INFO]';

// ── Output helpers ──────────────────────────────────────────────────────────
function section(title) {
  console.log('\n' + '='.repeat(64));
  console.log(`  ${title}`);
  console.log('='.repeat(64));
}

function check(label, message, details) {
  console.log(`${label} ${message}`);
  if (details) {
    const lines = Array.isArray(details) ? details : [details];
    for (const line of lines) {
      if (line) console.log(`       ${line}`);
    }
  }
}

// ── Section 1: Environment ──────────────────────────────────────────────────
function checkEnvironment() {
  section('1. Environment');

  check(INFO, `Node.js version : ${process.version}`);
  check(
    INFO,
    `OS              : ${process.platform} ${os.release()} (${os.arch()})`,
  );
  check(INFO, `Home directory  : ${HOME_DIR}`);
  check(INFO, `Endpoint        : ${ENDPOINT}`);

  // Opt-out flag
  if (process.env.CCUBE_TELEMETRY_DISABLED === '1') {
    check(
      WARN,
      'CCUBE_TELEMETRY_DISABLED=1 — the shell script exits 0 silently and sends nothing',
      [
        'Remove this variable from your shell profile (~/.zshrc, ~/.bashrc, etc.) and restart VS Code.',
      ],
    );
  } else {
    check(PASS, 'CCUBE_TELEMETRY_DISABLED is not set (telemetry enabled)');
  }

  // Endpoint override
  if (process.env.CCUBE_TELEMETRY_ENDPOINT) {
    check(
      WARN,
      `CCUBE_TELEMETRY_ENDPOINT is overridden to: ${process.env.CCUBE_TELEMETRY_ENDPOINT}`,
    );
  }

  // HTTPS guard (the shell script has the same check)
  if (!ENDPOINT.startsWith('https://')) {
    check(
      FAIL,
      'Endpoint is not HTTPS — the shell script will exit 0 silently without sending any data',
    );
  }

  // curl and bash are default installs on macOS and mainstream Linux —
  // log versions as informational context only.
  try {
    const curlVer = execSync('curl --version 2>/dev/null', { encoding: 'utf8' })
      .split('\n')[0]
      .trim();
    check(INFO, `curl: ${curlVer}`);
  } catch {
    check(WARN, 'curl not found (unexpected on this platform)');
  }

  try {
    const bashVer = execSync('bash --version 2>/dev/null', { encoding: 'utf8' })
      .split('\n')[0]
      .trim();
    check(INFO, `bash: ${bashVer}`);
  } catch {
    check(WARN, 'bash not found (unexpected on this platform)');
  }
}

// ── Section 2: Hook script file presence ────────────────────────────────────
function checkScriptFiles() {
  section('2. Hook script files');

  const pluginBase = path.join(
    HOME_DIR,
    '.vscode',
    'agent-plugins',
    'github.com',
    'LifeSG',
    'ccube-agent-plugin-marketplace',
    'plugins',
  );

  if (!fs.existsSync(pluginBase)) {
    check(FAIL, `Plugin base directory not found: ${pluginBase}`, [
      'The Copilot agent plugin may not be installed.',
      'Expected path: ~/.vscode/agent-plugins/github.com/LifeSG/ccube-agent-plugin-marketplace/',
    ]);
    return;
  }

  check(PASS, `Plugin base directory exists: ${pluginBase}`);

  for (const plugin of KNOWN_PLUGINS) {
    const scriptPath = path.join(
      pluginBase,
      plugin,
      'scripts',
      'session-telemetry.sh',
    );
    if (fs.existsSync(scriptPath)) {
      // Check it is readable and executable
      try {
        fs.accessSync(scriptPath, fs.constants.R_OK | fs.constants.X_OK);
        check(
          PASS,
          `${plugin}/scripts/session-telemetry.sh — readable & executable`,
        );
      } catch (err) {
        check(
          FAIL,
          `${plugin}/scripts/session-telemetry.sh — permission problem: ${err.code}`,
          [`Run: chmod +rx "${scriptPath}"`],
        );
      }
    } else {
      check(
        WARN,
        `${plugin}/scripts/session-telemetry.sh — not found (plugin may not be installed)`,
      );
    }
  }
}

// ── Section 3: ~/.ccube directory and files ─────────────────────────────────
function checkCcubeDir() {
  section('3. ~/.ccube directory');

  if (!fs.existsSync(CCUBE_DIR)) {
    check(FAIL, `${CCUBE_DIR} does not exist`);
    check(
      INFO,
      'Attempting to reproduce what the shell script does (mkdir -p ~/.ccube)...',
    );
    try {
      fs.mkdirSync(CCUBE_DIR, { recursive: true });
      check(PASS, `mkdir succeeded — ${CCUBE_DIR} now exists`);
      check(
        WARN,
        'The directory was missing before this run, which means the hook either never fired or failed silently before reaching the mkdir step',
      );
    } catch (err) {
      check(
        FAIL,
        `mkdir failed: [${err.code}] ${err.message}`,
        [
          err.code === 'EACCES'
            ? 'Permission denied — the parent directory may be owned by root or another user.'
            : '',
          err.code === 'ENOENT' ? 'A parent path segment does not exist.' : '',
          `Run manually: mkdir -p "${CCUBE_DIR}"`,
        ].filter(Boolean),
      );
    }
    return;
  }

  const stat = fs.statSync(CCUBE_DIR);
  if (!stat.isDirectory()) {
    check(FAIL, `${CCUBE_DIR} exists but is a FILE, not a directory`, [
      `Remove it and let the hook recreate it: rm "${CCUBE_DIR}"`,
    ]);
    return;
  }

  check(PASS, `${CCUBE_DIR} exists and is a directory`);

  // Writability probe
  try {
    const probe = path.join(CCUBE_DIR, '.write-probe');
    fs.writeFileSync(probe, 'ok');
    fs.unlinkSync(probe);
    check(PASS, `${CCUBE_DIR} is writable`);
  } catch (err) {
    check(FAIL, `${CCUBE_DIR} is NOT writable: [${err.code}] ${err.message}`, [
      `Run: chmod u+w "${CCUBE_DIR}"`,
    ]);
  }

  // Inventory
  const files = fs.readdirSync(CCUBE_DIR);
  if (files.length === 0) {
    check(
      WARN,
      'Directory is empty — no telemetry files have been written yet',
    );
  } else {
    check(INFO, `Contents: ${files.join(', ')}`);
  }

  // telemetry-id
  if (fs.existsSync(ID_FILE)) {
    const id = fs.readFileSync(ID_FILE, 'utf8').trim();
    const validFormat =
      /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{32}|unknown)$/.test(
        id,
      );
    if (validFormat) {
      check(PASS, `telemetry-id: ${id}`);
    } else {
      check(WARN, `telemetry-id has unexpected format: "${id}"`, [
        'The shell script will fall back to "unknown" for the anonymousId field.',
        `Delete the file to regenerate: rm "${ID_FILE}"`,
      ]);
    }
  } else {
    check(
      INFO,
      'telemetry-id not present — will be created on first successful hook execution',
    );
  }

  // Per-plugin install markers
  for (const plugin of KNOWN_PLUGINS) {
    const marker = path.join(CCUBE_DIR, `installed-${plugin}`);
    if (fs.existsSync(marker)) {
      const ts = fs.readFileSync(marker, 'utf8').trim();
      check(INFO, `Install marker ${plugin}: recorded at ${ts || '(empty)'}`);
    } else {
      check(
        INFO,
        `Install marker ${plugin}: not present (install event will fire next session)`,
      );
    }
  }

  // hook-debug.log
  if (fs.existsSync(DEBUG_LOG)) {
    const lines = fs.readFileSync(DEBUG_LOG, 'utf8').trim().split('\n');
    const tail = lines.slice(-15);
    check(
      PASS,
      `hook-debug.log exists (${lines.length} total lines) — last entries:`,
    );
    for (const line of tail) {
      console.log(`       ${line}`);
    }
  } else {
    check(WARN, 'hook-debug.log not found', [
      'Possible causes:',
      '  a) The VS Code hook has never fired (check hooks.json is installed).',
      '  b) ~/.ccube was not writable when the hook ran, so all writes silently failed.',
      '  c) The hook process was killed before it reached the log-write step.',
    ]);
  }
}

// ── Section 4: DNS + TLS reachability ────────────────────────────────────────
function checkNetwork() {
  return new Promise((resolve) => {
    section('4. Network reachability');

    let endpointUrl;
    try {
      endpointUrl = new URL(ENDPOINT);
    } catch {
      check(FAIL, `Endpoint URL is malformed: ${ENDPOINT}`);
      resolve();
      return;
    }

    const hostname = endpointUrl.hostname;
    const port = parseInt(endpointUrl.port || '443', 10);
    check(INFO, `Target: ${hostname}:${port}`);

    dns.lookup(hostname, (dnsErr, address, family) => {
      if (dnsErr) {
        check(
          FAIL,
          `DNS lookup failed for "${hostname}": ${dnsErr.code}`,
          [
            dnsErr.code === 'ENOTFOUND'
              ? 'Hostname does not resolve — possible DNS block, corporate filter, or typo.'
              : '',
            dnsErr.code === 'ETIMEOUT'
              ? 'DNS query timed out — possible network issue or DNS server unreachable.'
              : '',
          ].filter(Boolean),
        );
        resolve();
        return;
      }

      check(PASS, `DNS resolved ${hostname} → ${address} (IPv${family})`);

      // TLS connectivity probe (HEAD /)
      const req = https.request(
        { hostname, port, path: '/', method: 'HEAD', timeout: 6000 },
        (res) => {
          check(PASS, `TLS handshake succeeded to ${hostname}:${port}`);
          check(
            INFO,
            `HEAD / → HTTP ${res.statusCode} (TLS connectivity probe only)`,
          );
          res.resume();
          resolve();
        },
      );

      req.on('timeout', () => {
        check(
          FAIL,
          `TCP connection to ${hostname}:${port} timed out after 6 s`,
          [
            'A firewall or outbound proxy may be blocking HTTPS traffic.',
            'Try: curl -v --max-time 6 https://' + hostname + '/',
          ],
        );
        req.destroy();
        resolve();
      });

      req.on('error', (err) => {
        const hints = [];
        if (err.code === 'ECONNREFUSED')
          hints.push('Connection refused — server port may be down.');
        if (err.code === 'CERT_HAS_EXPIRED')
          hints.push('TLS certificate has expired on the server.');
        if (err.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE')
          hints.push(
            'TLS certificate could not be verified — likely a corporate MITM/SSL-inspection proxy.',
          );
        if (err.code === 'DEPTH_ZERO_SELF_SIGNED_CERT')
          hints.push(
            'Self-signed certificate detected — corporate SSL inspection is active.',
          );
        if (hints.length === 0) hints.push(`Error code: ${err.code}`);

        check(FAIL, `TLS/TCP error: ${err.message}`, hints);
        resolve();
      });

      req.end();
    });
  });
}

// ── Section 5: Replicate the telemetry POST ──────────────────────────────────
function replicatePost() {
  return new Promise((resolve) => {
    section('5. Replicate telemetry POST request');

    let endpointUrl;
    try {
      endpointUrl = new URL(ENDPOINT);
    } catch {
      check(FAIL, `Endpoint URL is malformed: ${ENDPOINT}`);
      resolve();
      return;
    }

    const anonId = fs.existsSync(ID_FILE)
      ? fs.readFileSync(ID_FILE, 'utf8').trim()
      : 'diagnostic-test-id';

    const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const payload = JSON.stringify({
      event: 'SessionStart',
      anonymousId: anonId,
      plugin: 'ccube-software-craft',
      agentType: 'UNDEFINED',
      chatSessionId: 'debug-run',
      ts: now,
    });

    const requestHeaders = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    };

    check(INFO, `POST ${ENDPOINT}`);
    check(
      INFO,
      'Request headers:',
      Object.entries(requestHeaders).map(([k, v]) => `  ${k}: ${v}`),
    );
    check(INFO, `Request body: ${payload}`);
    console.log('');

    function doPost(extraHeaders, label, onDone) {
      const mergedHeaders = { ...requestHeaders, ...extraHeaders };

      const transport = endpointUrl.protocol === 'https:' ? https : http;
      const req = transport.request(
        {
          hostname: endpointUrl.hostname,
          port:
            endpointUrl.port || (endpointUrl.protocol === 'https:' ? 443 : 80),
          path: endpointUrl.pathname + endpointUrl.search,
          method: 'POST',
          headers: mergedHeaders,
          timeout: 10000,
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => {
            body += chunk;
          });
          res.on('end', () => {
            const status = res.statusCode;
            const statusLabel = status >= 200 && status < 300 ? PASS : FAIL;

            check(
              statusLabel,
              `${label} — HTTP ${status} ${res.statusMessage || ''}`,
            );
            check(
              INFO,
              'Response headers:',
              Object.entries(res.headers).map(([k, v]) => `  ${k}: ${v}`),
            );

            const bodyPreview =
              body.length > 800
                ? body.slice(0, 800) + '…(truncated)'
                : body || '(empty)';
            check(INFO, `Response body: ${bodyPreview}`);

            // Cloud/WAF fingerprinting
            if (res.headers['cf-ray']) {
              check(WARN, 'Cloudflare cf-ray header detected in response', [
                `HTTP ${status} is being issued via Cloudflare, not the origin server.`,
                status === 403
                  ? "The server's IP allowlist or WAF rule is blocking requests from this network."
                  : 'The origin server returned the error (request reached origin).',
                `cf-ray: ${res.headers['cf-ray']}`,
              ]);
            }
            if (
              res.headers['x-request-id'] ||
              res.headers['x-amzn-requestid']
            ) {
              check(
                INFO,
                'AWS / API Gateway request-id detected — request reached the origin',
              );
            }

            onDone(status);
          });
        },
      );

      req.on('timeout', () => {
        check(FAIL, `${label} — request timed out after 10 s`);
        req.destroy();
        onDone(null);
      });

      req.on('error', (err) => {
        check(FAIL, `${label} — request error: ${err.message}`);
        onDone(null);
      });

      req.write(payload);
      req.end();
    }

    // Attempt 1: bare request (mirrors what curl sends by default)
    doPost({}, 'Attempt 1 (no User-Agent, mirrors curl default)', (status1) => {
      if (status1 !== 403) {
        if (status1 >= 200 && status1 < 300) {
          check(
            PASS,
            'Request succeeded — telemetry endpoint is reachable from this machine',
          );
        }
        resolve();
        return;
      }

      // 403 received — try with a User-Agent to rule out UA filtering
      console.log('');
      doPost(
        { 'User-Agent': 'ccube-telemetry/1.0' },
        'Attempt 2 (with User-Agent header)',
        (status2) => {
          if (status2 !== 403) {
            check(
              WARN,
              'Adding User-Agent changed the response — the WAF or server filters by User-Agent',
            );
          } else {
            check(
              INFO,
              'User-Agent did not change the response — UA is not the blocking factor',
            );
          }

          // Summarise 403 diagnostic advice
          check(
            WARN,
            'HTTP 403 diagnosis — most likely causes in order of probability:',
            [
              '1. IP-based allowlist: the endpoint only accepts requests from specific networks',
              "   (e.g. gov.sg intranet, GCC). The user's machine IP is outside that range.",
              '2. WAF geographic or ASN block: Cloudflare or AWS WAF is blocking the source IP.',
              '3. Missing API key / auth header: check if the endpoint recently started requiring',
              '   a bearer token or x-api-key header.',
              '4. CORS preflight rejected (browser only — not applicable to curl/Node).',
              '',
              'Next steps:',
              '  a) Check the response body and cf-ray header above for WAF details.',
              '  b) Share this output with the endpoint owner to check IP allowlist.',
              '  c) Try from a different network (e.g. mobile hotspot) to confirm IP block.',
            ],
          );

          resolve();
        },
      );
    });
  });
}

// ── Section 6: curl replication (closest to the shell script) ───────────────
function replicateCurl() {
  section('6. Replicate with curl (closest to the shell script behaviour)');

  try {
    execSync('which curl', { stdio: 'ignore' });
  } catch {
    check(WARN, 'curl not available — skipping curl replication');
    return;
  }

  const anonId = fs.existsSync(ID_FILE)
    ? fs.readFileSync(ID_FILE, 'utf8').trim()
    : 'diagnostic-test-id';

  const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  const payload = JSON.stringify({
    event: 'SessionStart',
    anonymousId: anonId,
    plugin: 'ccube-software-craft',
    agentType: 'UNDEFINED',
    chatSessionId: 'debug-run',
    ts: now,
  });

  // Escape payload for shell
  const escapedPayload = payload.replace(/'/g, "'\\''");

  const curlCmd = [
    'curl',
    '--silent',
    '--max-time',
    '10',
    '--write-out',
    "'---HTTPSTATUS:%{http_code}---'",
    '-H',
    '"Content-Type: application/json"',
    '-d',
    `'${escapedPayload}'`,
    `'${ENDPOINT}'`,
  ].join(' ');

  check(INFO, `Running: ${curlCmd}`);
  console.log('');

  try {
    const output = execSync(curlCmd, { encoding: 'utf8', timeout: 15000 });
    const SENTINEL = '---HTTPSTATUS:';
    const sentinelIdx = output.indexOf(SENTINEL);
    const body =
      sentinelIdx >= 0 ? output.slice(0, sentinelIdx).trim() : output.trim();
    const statusCode =
      sentinelIdx >= 0
        ? output
            .slice(sentinelIdx + SENTINEL.length)
            .replace(/---\s*$/, '')
            .trim()
        : 'unknown';

    const statusLabel = statusCode.startsWith('2') ? PASS : FAIL;
    check(statusLabel, `curl HTTP status: ${statusCode}`);
    if (body) {
      check(INFO, `curl response body: ${body.slice(0, 800)}`);
    }
  } catch (err) {
    check(FAIL, `curl command failed: ${err.message}`);
    if (err.stdout) check(INFO, `curl stdout: ${err.stdout.slice(0, 400)}`);
    if (err.stderr) check(INFO, `curl stderr: ${err.stderr.slice(0, 400)}`);
  }
}

// ── Summary ──────────────────────────────────────────────────────────────────
function printSummary() {
  section('Summary');
  console.log('Share the full output above with support.');
  console.log('');
  console.log('Key indicators:');
  console.log('  [FAIL] lines = confirmed problems requiring action.');
  console.log('  [WARN] lines = conditions that may explain the issue.');
  console.log(
    '  cf-ray header in 403 response = Cloudflare IP allowlist block.',
  );
  console.log(
    '  hook-debug.log absent = hook never fired, or ~/.ccube was not writable.',
  );
  console.log(
    '  CCUBE_TELEMETRY_DISABLED=1 = user opted out; no data is ever sent.',
  );
  console.log('');
}

// ── Entry point ──────────────────────────────────────────────────────────────
async function main() {
  console.log('ccube telemetry hook — field diagnostic');
  console.log(`Timestamp : ${new Date().toISOString()}`);
  console.log(`Node.js   : ${process.version}`);

  checkEnvironment();
  checkScriptFiles();
  checkCcubeDir();
  await checkNetwork();
  await replicatePost();
  replicateCurl();
  printSummary();
}

main().catch((err) => {
  console.error('\nUnexpected diagnostic error:', err);
  process.exit(1);
});
