# smoke-test-sgw (source)

Rust source for the `smoke` binary used by the `ccube-celerity` plugin's
`smoke-test-sgw` skill.

## Why source lives here, not in the plugin

Plugins install onto users' machines. Shipping compiled-software source inside a
plugin would force every user to have a Rust toolchain just to run the skill. So
the pattern is:

- **source** lives in this repo under `sources/<plugin>/<skill>/`,
- the **prebuilt binary** ships in the plugin at
  `plugins/<plugin>/skills/<skill>/bin/`.

Use this layout for any future skill that needs compiled software.

## Build

```bash
./build.sh
```

On macOS this produces a universal (arm64 + x86_64) binary and copies it to the
plugin's `bin/smoke`. On other platforms it builds a single native binary. Run it
whenever the crate changes.

Requires the Rust toolchain (`rustup`); the binary needs Google Chrome or
Chromium at runtime (chromiumoxide auto-detects it).

## Test

```bash
CARGO_HOME=.cargo-home cargo test --lib   # classify, asset-extraction, report
```
