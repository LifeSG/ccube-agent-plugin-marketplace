//! Pure, testable logic: status classification, asset-URL extraction, the
//! browser-side probe script. No I/O here so it can be unit-tested directly.

use serde_json::Value;

/// The JS evaluated in each page to capture render state. Mirrors the Python
/// probe. Returns an object (chromiumoxide gives us the JSON value directly).
pub const PROBE_JS: &str = r#"
(function(){
  var t=document.body ? (document.body.innerText||"") : "";
  var h1=document.querySelector('h1');
  return {
    url:location.href, title:document.title,
    h1:h1?h1.innerText.slice(0,120):null,
    bodyLen:t.length,
    notFound:/page not found|the page you were looking for|does not exist|cannot be found/i.test(t.slice(0,1500)),
    errPage:/something went wrong|error occurred|unexpected error/i.test(t.slice(0,1500)),
    authGate:/login\.id\.singpass\.gov\.sg/.test(location.href)||/log in with singpass|one-time password|enter your email|enter (the |your )?[0-9]*[- ]?digit[- ]?(admin )?pin|admin access/i.test(t.slice(0,1500)),
    brokenImgs:Array.from(document.images).filter(function(i){return !i.complete||i.naturalWidth===0}).length,
    imgs:document.images.length,
    snippet:t.replace(/\s+/g,' ').slice(0,200)
  };
})()
"#;

/// Statuses that count as a PASS (renders, graceful 404, or an auth/login gate).
pub const PASS_STATUSES: [&str; 3] = ["OK", "404", "AUTH-GATE"];

pub fn is_pass(status: &str) -> bool {
    PASS_STATUSES.contains(&status)
}

/// Classify a render record (the JSON returned by PROBE_JS, possibly with an
/// "error" key added by the caller) into a single status string.
pub fn classify(rec: &Value) -> &'static str {
    if rec.get("error").map_or(false, |v| !v.is_null()) {
        return "ERR";
    }
    if rec.get("errPage").and_then(Value::as_bool).unwrap_or(false) {
        return "ERR";
    }
    if rec.get("notFound").and_then(Value::as_bool).unwrap_or(false) {
        return "404";
    }
    if rec.get("authGate").and_then(Value::as_bool).unwrap_or(false) {
        return "AUTH-GATE";
    }
    if rec.get("brokenImgs").and_then(Value::as_i64).unwrap_or(0) > 0 {
        return "BROKEN-IMG";
    }
    if rec.get("bodyLen").and_then(Value::as_i64).unwrap_or(0) > 300 {
        return "OK";
    }
    "EMPTY?"
}

/// Sort key so failures surface first in the summary.
pub fn status_order(status: &str) -> u8 {
    match status {
        "ERR" => 0,
        "BROKEN-IMG" => 1,
        "EMPTY?" => 2,
        "AUTH-GATE" => 3,
        "404" => 4,
        "OK" => 5,
        _ => 9,
    }
}

/// The scheme://host origin of a URL, used to resolve root-relative asset paths.
pub fn origin_of(url: &str) -> Option<String> {
    let scheme_end = url.find("://")?;
    let after = &url[scheme_end + 3..];
    let host_end = after.find('/').unwrap_or(after.len());
    Some(format!("{}{}", &url[..scheme_end + 3], &after[..host_end]))
}

/// Extract first-party asset paths referenced by HTML: root-relative src/href
/// values ending in a static extension, or anything under /static/. Deduped,
/// capped to `cap`. A tiny hand-rolled scan (no regex dependency).
pub fn extract_assets(html: &str, cap: usize) -> Vec<String> {
    let exts = [".js", ".css", ".ico", ".png", ".json", ".webmanifest"];
    let mut found: Vec<String> = Vec::new();
    for attr in ["src=\"", "href=\""] {
        let mut search_from = 0;
        while let Some(rel) = html[search_from..].find(attr) {
            let start = search_from + rel + attr.len();
            let Some(close_rel) = html[start..].find('"') else { break };
            let val = &html[start..start + close_rel];
            search_from = start + close_rel + 1;
            if !val.starts_with('/') {
                continue;
            }
            let path = val.split(['?', '#']).next().unwrap_or(val);
            let is_static = path.starts_with("/static/");
            let has_ext = exts.iter().any(|e| path.ends_with(e));
            if (is_static || has_ext) && !found.iter().any(|f| f == val) {
                found.push(val.to_string());
            }
        }
    }
    found.sort();
    found.dedup();
    found.truncate(cap);
    found
}

/// Count statuses across render records, preserving a failures-first order.
pub fn status_counts(render: &[Value]) -> Vec<(String, usize)> {
    let mut map: std::collections::BTreeMap<String, usize> = std::collections::BTreeMap::new();
    for r in render {
        let s = r.get("status").and_then(Value::as_str).unwrap_or("?");
        *map.entry(s.to_string()).or_insert(0) += 1;
    }
    let mut v: Vec<(String, usize)> = map.into_iter().collect();
    v.sort_by_key(|(s, _)| status_order(s));
    v
}

/// Build a self-contained Markdown smoke-test report from the results. Pure, so
/// it is unit-tested. `render` is assumed already sorted failures-first.
pub fn markdown_report(http: &[Value], render: &[Value]) -> String {
    let fails = render.iter().filter(|r| {
        !is_pass(r.get("status").and_then(Value::as_str).unwrap_or("?"))
    }).count();
    let verdict = if fails == 0 { "PASS" } else { "FAIL" };

    let mut s = String::new();
    s.push_str("# Smoke Test Report\n\n");
    s.push_str(&format!("**Verdict: {verdict}**: {} URL(s), {fails} failing.\n\n", render.len()));

    let counts = status_counts(render);
    if !counts.is_empty() {
        let summary: Vec<String> = counts.iter().map(|(k, n)| format!("{k}: {n}")).collect();
        s.push_str(&format!("Status breakdown: {}\n\n", summary.join(", ")));
    }

    s.push_str("## Render\n\n| Status | URL | Title / detail |\n|---|---|---|\n");
    for r in render {
        let status = r.get("status").and_then(Value::as_str).unwrap_or("?");
        let url = r.get("url_requested").and_then(Value::as_str).unwrap_or("");
        let detail = r.get("h1").and_then(Value::as_str)
            .or_else(|| r.get("error").and_then(Value::as_str))
            .unwrap_or("");
        s.push_str(&format!("| {status} | {} | {} |\n", md_cell(url), md_cell(detail)));
    }

    // Only include the HTTP section if we ran it.
    if !http.is_empty() {
        s.push_str("\n## HTTP / assets\n\n| Status | URL | Bad assets |\n|---|---|---|\n");
        for h in http {
            let url = h.get("url").and_then(Value::as_str).unwrap_or("");
            let status = h.get("error").and_then(Value::as_str)
                .map(|e| e.to_string())
                .unwrap_or_else(|| h.get("status").and_then(Value::as_i64).unwrap_or(0).to_string());
            let bad = h.get("assets_bad").and_then(Value::as_array).map_or(0, |a| a.len());
            s.push_str(&format!("| {} | {} | {bad} |\n", md_cell(&status), md_cell(url)));
        }
    }

    // Surface any flagged pages with screenshots and any bad assets as findings.
    let mut findings: Vec<String> = Vec::new();
    for r in render {
        let status = r.get("status").and_then(Value::as_str).unwrap_or("?");
        if !is_pass(status) {
            let url = r.get("url_requested").and_then(Value::as_str).unwrap_or("");
            let why = r.get("error").and_then(Value::as_str).unwrap_or(status);
            let shot = r.get("screenshot").and_then(Value::as_str)
                .map(|p| format!(" (screenshot: {p})")).unwrap_or_default();
            findings.push(format!("- **{status}** {url}: {why}{shot}"));
        }
    }
    for h in http {
        if let Some(bad) = h.get("assets_bad").and_then(Value::as_array) {
            for a in bad {
                let path = a.get("path").and_then(Value::as_str).unwrap_or("");
                let st = a.get("status").and_then(Value::as_i64).unwrap_or(0);
                findings.push(format!("- **BAD-ASSET** {path}: HTTP {st}"));
            }
        }
    }
    if !findings.is_empty() {
        s.push_str("\n## Findings\n\n");
        s.push_str(&findings.join("\n"));
        s.push('\n');
    }
    s
}

/// Escape a value for use inside a Markdown table cell.
fn md_cell(s: &str) -> String {
    s.replace('|', "\\|").replace('\n', " ")
}

/// Filesystem-safe screenshot name derived from a URL.
pub fn shot_name(url: &str) -> String {
    let mut s: String = url
        .chars()
        .map(|c| if c.is_ascii_alphanumeric() { c } else { '_' })
        .collect();
    // collapse runs of underscores
    while s.contains("__") {
        s = s.replace("__", "_");
    }
    s.truncate(80);
    format!("{s}.png")
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn classify_ok() {
        assert_eq!(classify(&json!({"bodyLen": 2000, "brokenImgs": 0})), "OK");
    }

    #[test]
    fn classify_not_found_beats_ok() {
        // A long body that is also a not-found page should classify as 404.
        assert_eq!(classify(&json!({"bodyLen": 800, "notFound": true})), "404");
    }

    #[test]
    fn classify_auth_gate() {
        assert_eq!(classify(&json!({"bodyLen": 100, "authGate": true})), "AUTH-GATE");
    }

    #[test]
    fn classify_pin_gate_via_authgate_flag() {
        // The kiosk Admin PIN pad is a real auth gate even though its body is
        // short and keyword-sparse; PROBE_JS sets authGate on its "Admin
        // Access / Enter the 6-digit admin PIN" copy, so the record must
        // classify AUTH-GATE and not fall through to EMPTY?.
        assert_eq!(classify(&json!({"bodyLen": 80, "authGate": true})), "AUTH-GATE");
    }

    #[test]
    fn probe_js_detects_pin_gate_copy() {
        // Guard the literal PROBE_JS authGate alternation against the kiosk PIN
        // pad wording so a future probe edit that drops PIN-gate detection is
        // caught here. Substring check mirrors the JS regex's intent without
        // pulling in a regex crate.
        assert!(PROBE_JS.contains("admin )?pin"));
        assert!(PROBE_JS.contains("admin access"));
    }

    #[test]
    fn classify_error_page() {
        assert_eq!(classify(&json!({"bodyLen": 2000, "errPage": true})), "ERR");
    }

    #[test]
    fn classify_error_key() {
        assert_eq!(classify(&json!({"error": "boom"})), "ERR");
    }

    #[test]
    fn classify_broken_images() {
        assert_eq!(classify(&json!({"bodyLen": 2000, "brokenImgs": 3})), "BROKEN-IMG");
    }

    #[test]
    fn classify_empty_body() {
        assert_eq!(classify(&json!({"bodyLen": 50})), "EMPTY?");
    }

    #[test]
    fn pass_statuses() {
        assert!(is_pass("OK"));
        assert!(is_pass("404"));
        assert!(is_pass("AUTH-GATE"));
        assert!(!is_pass("ERR"));
        assert!(!is_pass("BROKEN-IMG"));
        assert!(!is_pass("EMPTY?"));
    }

    #[test]
    fn order_sorts_failures_first() {
        let mut v = vec!["OK", "ERR", "404", "AUTH-GATE", "BROKEN-IMG"];
        v.sort_by_key(|s| status_order(s));
        assert_eq!(v, vec!["ERR", "BROKEN-IMG", "AUTH-GATE", "404", "OK"]);
    }

    #[test]
    fn origin_extraction() {
        assert_eq!(origin_of("https://a.gov.sg/x/y?q=1").unwrap(), "https://a.gov.sg");
        assert_eq!(origin_of("https://a.gov.sg").unwrap(), "https://a.gov.sg");
        assert_eq!(origin_of("http://h:8080/p").unwrap(), "http://h:8080");
        assert!(origin_of("not-a-url").is_none());
    }

    #[test]
    fn assets_extracted_deduped_and_filtered() {
        let html = r#"
            <link rel="stylesheet" href="/static/index-abc.css">
            <script src="/static/index-abc.js"></script>
            <link rel="icon" href="/favicon.ico">
            <img src="/logo.png">
            <a href="/about">about</a>
            <a href="https://cdn.example.com/x.js">external</a>
            <script src="/static/index-abc.js"></script>
        "#;
        let a = extract_assets(html, 30);
        assert!(a.contains(&"/static/index-abc.css".to_string()));
        assert!(a.contains(&"/static/index-abc.js".to_string()));
        assert!(a.contains(&"/favicon.ico".to_string()));
        assert!(a.contains(&"/logo.png".to_string()));
        // /about has no static ext and is not under /static/ -> excluded
        assert!(!a.iter().any(|s| s == "/about"));
        // external (non root-relative) excluded
        assert!(!a.iter().any(|s| s.starts_with("http")));
        // deduped: index-abc.js appears once
        assert_eq!(a.iter().filter(|s| *s == "/static/index-abc.js").count(), 1);
    }

    #[test]
    fn assets_cap_respected() {
        let mut html = String::new();
        for i in 0..50 {
            html.push_str(&format!("<script src=\"/static/f{i}.js\"></script>"));
        }
        assert_eq!(extract_assets(&html, 30).len(), 30);
    }

    #[test]
    fn report_pass_when_all_ok() {
        let render = vec![
            json!({"url_requested": "https://a/", "status": "OK", "h1": "Home"}),
            json!({"url_requested": "https://a/x", "status": "404", "h1": "Error"}),
            json!({"url_requested": "https://a/g", "status": "AUTH-GATE"}),
        ];
        let md = markdown_report(&[], &render);
        assert!(md.contains("**Verdict: PASS**"));
        assert!(md.contains("3 URL(s), 0 failing"));
        assert!(md.contains("| OK | https://a/ | Home |"));
        // No HTTP section when http is empty, and no Findings when nothing failed.
        assert!(!md.contains("## HTTP"));
        assert!(!md.contains("## Findings"));
    }

    #[test]
    fn report_fail_lists_findings() {
        let render = vec![
            json!({"url_requested": "https://a/", "status": "OK", "h1": "Home"}),
            json!({"url_requested": "https://a/bad", "status": "ERR", "error": "goto: boom",
                   "screenshot": "/tmp/x.png"}),
        ];
        let http = vec![
            json!({"url": "https://a/", "status": 200, "assets_bad": [{"path": "/static/x.js", "status": 404}]}),
        ];
        let md = markdown_report(&http, &render);
        assert!(md.contains("**Verdict: FAIL**"));
        assert!(md.contains("## HTTP / assets"));
        assert!(md.contains("## Findings"));
        assert!(md.contains("**ERR** https://a/bad: goto: boom (screenshot: /tmp/x.png)"));
        assert!(md.contains("**BAD-ASSET** /static/x.js: HTTP 404"));
    }

    #[test]
    fn report_escapes_pipes() {
        let render = vec![json!({"url_requested": "https://a/?x=1|2", "status": "OK", "h1": "A|B"})];
        let md = markdown_report(&[], &render);
        assert!(md.contains("A\\|B"));
        assert!(md.contains("x=1\\|2"));
    }

    #[test]
    fn counts_are_failures_first() {
        let render = vec![
            json!({"status": "OK"}), json!({"status": "OK"}),
            json!({"status": "ERR"}), json!({"status": "404"}),
        ];
        let c = status_counts(&render);
        assert_eq!(c[0], ("ERR".to_string(), 1));
        assert_eq!(*c.last().unwrap(), ("OK".to_string(), 2));
    }

    #[test]
    fn shot_name_is_safe() {
        let n = shot_name("https://a.gov.sg/grants/ksa/apply?x=1");
        assert!(n.ends_with(".png"));
        assert!(!n.contains("__"));
        assert!(n.chars().all(|c| c.is_ascii_alphanumeric() || c == '_' || c == '.'));
    }
}
