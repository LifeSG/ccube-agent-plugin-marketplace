//! Read-only web smoke test (Rust / chromiumoxide, a Playwright-equivalent
//! Chrome DevTools Protocol driver).
//!
//! One binary: runs an HTTP/asset check, renders every URL concurrently in a
//! headless Chrome it launches and manages itself, classifies each page, screen-
//! shots flagged pages, writes JSON, and sets the exit code (0 = all pass).

use std::sync::Arc;
use std::time::Duration;

use chromiumoxide::browser::{Browser, BrowserConfig};
use chromiumoxide::page::ScreenshotParams;
use futures_util::StreamExt;
use serde_json::{json, Value};
use tokio::sync::Semaphore;

use smoke_rs::logic::*;

/// Pages rendered in parallel. The run is network-bound, not tab-bound, so
/// tuning this gave no measurable benefit in testing; it's a fixed constant.
const CONCURRENCY: usize = 6;

struct Args {
    urls: Vec<String>,
    shots: Option<String>,
    json_path: String,
    report_path: String,
    wait: f64,
}

fn parse_args() -> Args {
    let mut a = Args {
        urls: vec![],
        shots: None,
        json_path: "smoke-results.json".to_string(),
        report_path: "smoke-report.md".to_string(),
        wait: 2.5,
    };
    let mut it = std::env::args().skip(1);
    while let Some(arg) = it.next() {
        match arg.as_str() {
            "--file" => {
                let p = it.next().expect("--file needs a path");
                let body = std::fs::read_to_string(&p).expect("cannot read --file");
                for line in body.lines() {
                    let l = line.trim();
                    if !l.is_empty() && !l.starts_with('#') {
                        a.urls.push(l.to_string());
                    }
                }
            }
            "--shots" => a.shots = Some(it.next().expect("--shots needs a dir")),
            "--json" => a.json_path = it.next().expect("--json needs a path"),
            "--report" => a.report_path = it.next().expect("--report needs a path"),
            "--wait" => a.wait = it.next().expect("--wait needs seconds").parse().expect("bad --wait"),
            "-h" | "--help" => {
                eprintln!("usage: smoke URL [URL...] [--file F] [--shots DIR] [--json PATH] [--report PATH] [--wait S]");
                std::process::exit(2);
            }
            other => a.urls.push(other.to_string()),
        }
    }
    if a.urls.is_empty() {
        eprintln!("error: no URLs given (pass URLs as args or --file)");
        std::process::exit(2);
    }
    a
}

const SEC_HEADERS: [&str; 5] = [
    "strict-transport-security",
    "content-security-policy",
    "x-frame-options",
    "x-content-type-options",
    "cache-control",
];

/// A shared ureq agent. native-tls trusts the OS store (incl. a corporate proxy
/// CA) where the default webpki bundle would reject intercepted certs. One agent
/// is reused across all requests; its connection pool is the whole point.
fn build_agent() -> ureq::Agent {
    let tls = native_tls::TlsConnector::new().expect("native-tls connector");
    ureq::AgentBuilder::new()
        .timeout(Duration::from_secs(30))
        .tls_connector(std::sync::Arc::new(tls))
        .build()
}

/// Status of a single asset URL. Uses HEAD (no body transfer, so we don't pull
/// multi-MB JS bundles just to read a status code), falling back to GET if the
/// server rejects HEAD (405/501) so a quirky origin can't false-flag an asset.
fn asset_status(agent: &ureq::Agent, full: &str) -> i64 {
    match agent.head(full).call() {
        Ok(r) => r.status() as i64,
        Err(ureq::Error::Status(405 | 501, _)) => match agent.get(full).call() {
            Ok(r) => r.status() as i64,
            Err(ureq::Error::Status(c, _)) => c as i64,
            Err(_) => -1,
        },
        Err(ureq::Error::Status(c, _)) => c as i64,
        Err(_) => -1,
    }
}

/// Blocking HTTP + first-party-asset check for one URL (runs on a blocking thread).
fn http_check(agent: &ureq::Agent, url: &str) -> Value {
    let resp = match agent.get(url).set("User-Agent", "smoke-test/1.0").call() {
        Ok(r) => r,
        Err(ureq::Error::Status(code, r)) => {
            // Non-2xx still gives us headers; record the status.
            return json!({"url": url, "status": code, "ctype": r.content_type().to_string()});
        }
        Err(e) => return json!({"url": url, "error": e.to_string()}),
    };
    let status = resp.status();
    let ctype = resp.content_type().to_string();
    let mut security = serde_json::Map::new();
    for h in SEC_HEADERS {
        if let Some(v) = resp.header(h) {
            security.insert(h.to_string(), json!(v));
        }
    }
    let mut out = json!({
        "url": url, "status": status, "ctype": ctype,
        "security": Value::Object(security),
    });
    if out["ctype"].as_str().unwrap_or("").contains("text/html") {
        let body = resp.into_string().unwrap_or_default();
        out["size"] = json!(body.len());
        if let Some(origin) = origin_of(url) {
            let paths = extract_assets(&body, 30);
            // Fan the asset sub-checks out: each is an independent round-trip, so
            // running them concurrently (rather than one-by-one) collapses the
            // HTTP phase. The shared agent's connection pool is reused across them.
            let assets: Vec<Value> = std::thread::scope(|s| {
                let handles: Vec<_> = paths
                    .iter()
                    .map(|path| {
                        let full = format!("{origin}{path}");
                        s.spawn(move || json!({"path": path, "status": asset_status(agent, &full)}))
                    })
                    .collect();
                handles.into_iter().map(|h| h.join().unwrap()).collect()
            });
            let bad: Vec<Value> = assets
                .iter()
                .filter(|a| a.get("status").and_then(Value::as_i64) != Some(200))
                .cloned()
                .collect();
            out["assets"] = json!(assets);
            out["assets_bad"] = json!(bad);
        }
    } else if let Ok(b) = resp.into_string() {
        out["size"] = json!(b.len());
    }
    out
}

/// Settle signal: `[bodyTextLength, imagesStillLoading]`. We treat a page as
/// settled only when the body text has stabilized AND no image is mid-load, so
/// the probe doesn't sample a half-rendered page (which would false-flag it as
/// EMPTY? or BROKEN-IMG). Mirrors the fields the probe later classifies on.
const SETTLE_JS: &str = r#"
(function(){
  var len=document.body?document.body.innerText.length:0;
  var loading=Array.from(document.images).filter(function(i){return !i.complete}).length;
  return [len, loading];
})()
"#;

/// Wait until the page has visually settled (body text stable across consecutive
/// polls and no images still loading) or `cap` elapses, whichever comes first.
/// Polls on a short interval so fast pages return quickly instead of paying the
/// full fixed wait, but requires two consecutive matching, image-complete reads
/// so a transient match under load can't cause an early, half-rendered sample.
async fn settle(page: &chromiumoxide::page::Page, cap: Duration) {
    let interval = Duration::from_millis(150);
    let deadline = tokio::time::Instant::now() + cap;
    let mut prev: i64 = -1;
    let mut stable = 0u8;
    loop {
        let (len, loading) = page
            .evaluate(SETTLE_JS)
            .await
            .ok()
            .and_then(|r| r.into_value::<(i64, i64)>().ok())
            .unwrap_or((0, 1));
        // Settled = non-empty body, no images mid-load, and the length matches
        // the previous reading. Require two such consecutive reads.
        if len > 0 && loading == 0 && len == prev {
            stable += 1;
            if stable >= 2 {
                return;
            }
        } else {
            stable = 0;
        }
        prev = len;
        if tokio::time::Instant::now() + interval >= deadline {
            return;
        }
        tokio::time::sleep(interval).await;
    }
}

/// Render one URL in its own page; returns the probe record + status (+ shot).
async fn render_one(
    browser: &Browser,
    url: &str,
    wait: f64,
    shots: &Option<String>,
) -> Value {
    let mut rec = json!({ "url_requested": url });
    let page = match browser.new_page("about:blank").await {
        Ok(p) => p,
        Err(e) => {
            rec["error"] = json!(format!("new_page: {e}"));
            rec["status"] = json!(classify(&rec));
            return rec;
        }
    };
    // Give navigation its own leash, then probe whatever rendered *regardless*
    // of whether goto resolved. Under concurrent load an SPA's body can be fully
    // present while goto's load event never fires; bailing on the goto timeout
    // would mislabel a healthy page as ERR. So a goto timeout/error is recorded
    // as a note, not a verdict: the probe of the live DOM decides the status.
    let nav_leash = Duration::from_secs_f64(wait + 20.0);
    let nav_note = match tokio::time::timeout(nav_leash, page.goto(url)).await {
        Ok(Ok(_)) => None,
        Ok(Err(e)) => Some(format!("goto: {e}")),
        Err(_) => Some("goto: timed out (probing rendered DOM anyway)".to_string()),
    };
    let _ = tokio::time::timeout(Duration::from_secs(2), page.wait_for_navigation()).await;
    // Event-based settle: poll until the body stabilizes and images finish, or
    // the `wait` cap elapses. Fast pages exit in a few hundred ms.
    settle(&page, Duration::from_secs_f64(wait)).await;
    let probe: Result<Value, String> = match tokio::time::timeout(
        Duration::from_secs(10),
        page.evaluate(PROBE_JS),
    )
    .await
    {
        Ok(Ok(r)) => r.into_value().map_err(|e| format!("into_value: {e}")),
        Ok(Err(e)) => Err(format!("evaluate: {e}")),
        Err(_) => Err("evaluate: timed out".to_string()),
    };

    match probe {
        Ok(v) => {
            if let Value::Object(m) = v {
                for (k, val) in m {
                    rec[k] = val;
                }
            }
            // Navigation hiccuped but the DOM still rendered: keep the real
            // verdict, just record the nav note for visibility.
            if let Some(note) = nav_note {
                rec["nav_note"] = json!(note);
            }
        }
        // Probe failed too: now the navigation problem (if any) is the verdict.
        Err(e) => rec["error"] = json!(nav_note.unwrap_or(e)),
    }
    let status = classify(&rec);
    rec["status"] = json!(status);

    let flagged = !is_pass(status);
    if let Some(dir) = shots {
        if flagged {
            let _ = std::fs::create_dir_all(dir);
            let path = format!("{dir}/{}", shot_name(url));
            match page
                .screenshot(ScreenshotParams::builder().build())
                .await
            {
                Ok(bytes) => {
                    if std::fs::write(&path, bytes).is_ok() {
                        rec["screenshot"] = json!(path);
                    }
                }
                Err(e) => rec["screenshot_error"] = json!(e.to_string()),
            }
        }
    }
    let _ = page.close().await;
    rec
}

#[tokio::main]
async fn main() {
    let args = parse_args();

    // --- HTTP / asset check (blocking work, fanned out over the blocking pool,
    // sharing one connection-pooled agent across all URLs) ---
    let mut http_results: Vec<Value> = Vec::new();
    println!("== HTTP / asset check ==");
    let agent = Arc::new(build_agent());
    let handles: Vec<_> = args
        .urls
        .iter()
        .cloned()
        .map(|url| {
            let agent = agent.clone();
            tokio::task::spawn_blocking(move || http_check(&agent, &url))
        })
        .collect();
    for h in handles {
        let h = h.await.unwrap();
        let u = h.get("url").and_then(Value::as_str).unwrap_or("");
        if let Some(err) = h.get("error").and_then(Value::as_str) {
            println!("  ERR  {u} -> {err}");
        } else {
            let bad = h.get("assets_bad").and_then(Value::as_array).map_or(0, |a| a.len());
            let ctype = h.get("ctype").and_then(Value::as_str).unwrap_or("");
            let flag = if bad > 0 { format!(" BAD-ASSETS={bad}") } else { String::new() };
            println!("  {}  {:24} {u}{flag}", h.get("status").and_then(Value::as_i64).unwrap_or(0), ctype.split(';').next().unwrap_or(""));
        }
        http_results.push(h);
    }
    println!();

    // URLs whose top-level GET hard-errored will never render usefully, so skip
    // spinning up a tab for them: we already know the verdict (ERR). This saves
    // a Chrome page + the settle wait for every dead URL.
    let dead: std::collections::HashMap<String, String> = http_results
        .iter()
        .filter_map(|h| {
            let url = h.get("url").and_then(Value::as_str)?;
            let err = h.get("error").and_then(Value::as_str)?;
            Some((url.to_string(), err.to_string()))
        })
        .collect();
    let dead = Arc::new(dead);

    // --- render check (chromiumoxide-managed headless Chrome) ---
    println!("== render check ==");
    let config = BrowserConfig::builder()
        .launch_timeout(Duration::from_secs(30))
        .request_timeout(Duration::from_secs(30))
        .args(vec![
            "--no-first-run",
            "--no-default-browser-check",
            "--disable-gpu",
        ])
        .build()
        .expect("browser config");
    eprintln!("[smoke] launching headless Chrome...");
    let (browser, mut handler) = match Browser::launch(config).await {
        Ok(pair) => pair,
        Err(e) => {
            eprintln!("[smoke] launch failed: {e}");
            std::process::exit(2);
        }
    };
    eprintln!("[smoke] Chrome launched.");
    // Drive the CDP event loop in the background. Keep draining regardless of
    // individual event errors; stopping early would stall every page command.
    let handler_task = tokio::spawn(async move {
        while let Some(_ev) = handler.next().await {}
    });

    let browser = Arc::new(browser);
    let sem = Arc::new(Semaphore::new(CONCURRENCY));
    let shots = Arc::new(args.shots.clone());
    let mut tasks = Vec::new();
    // ERR records for URLs we skip rendering (HTTP-disqualified); merged below.
    let mut render_results_pre: Vec<Value> = Vec::new();
    for u in args.urls.clone() {
        // Don't render a URL the HTTP phase already proved dead; synthesize its
        // ERR record directly and skip the tab.
        if let Some(err) = dead.get(&u) {
            let mut rec = json!({ "url_requested": u, "error": format!("http: {err}") });
            rec["status"] = json!(classify(&rec));
            render_results_pre.push(rec);
            continue;
        }
        let browser = browser.clone();
        let sem = sem.clone();
        let shots = shots.clone();
        let wait = args.wait;
        tasks.push(tokio::spawn(async move {
            let _permit = sem.acquire().await.unwrap();
            render_one(&browser, &u, wait, &shots).await
        }));
    }
    let mut render_results: Vec<Value> = render_results_pre;
    for t in tasks {
        render_results.push(t.await.unwrap());
    }

    // Tidy up the browser.
    if let Ok(b) = Arc::try_unwrap(browser) {
        let mut b = b;
        let _ = b.close().await;
        let _ = b.wait().await;
    }
    handler_task.abort();

    // --- summary (failures first) ---
    render_results.sort_by_key(|r| {
        status_order(r.get("status").and_then(Value::as_str).unwrap_or("?"))
    });
    let mut fails = 0;
    for r in &render_results {
        let status = r.get("status").and_then(Value::as_str).unwrap_or("?");
        let h1 = r
            .get("h1")
            .and_then(Value::as_str)
            .or_else(|| r.get("error").and_then(Value::as_str))
            .unwrap_or("");
        let url = r.get("url_requested").and_then(Value::as_str).unwrap_or("");
        let h1t: String = h1.chars().take(55).collect();
        let urlt: String = url.chars().take(70).collect();
        println!("  {status:11} {urlt:70} {h1t}");
        if !is_pass(status) {
            fails += 1;
        }
    }
    let counts: Vec<String> = status_counts(&render_results)
        .iter()
        .map(|(k, n)| format!("{k}: {n}"))
        .collect();
    println!("\nsummary: {}  ({fails} failing)", counts.join(", "));

    let out = json!({ "http": http_results, "render": render_results });
    if std::fs::write(&args.json_path, serde_json::to_string_pretty(&out).unwrap()).is_ok() {
        println!("[wrote {}]", args.json_path);
    }
    // The run finishes by producing a shareable Markdown report.
    let report = markdown_report(&http_results, &render_results);
    if std::fs::write(&args.report_path, &report).is_ok() {
        println!("[wrote {}]", args.report_path);
    }

    std::process::exit(if fails > 0 { 1 } else { 0 });
}
