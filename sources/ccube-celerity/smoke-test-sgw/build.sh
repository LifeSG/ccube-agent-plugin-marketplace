#!/usr/bin/env bash
# Rebuild the smoke binary and copy it into the plugin.
#
# The plugin ships a prebuilt binary so users don't need Rust. This script
# regenerates it from source; run it whenever the crate changes.
#
# On macOS it builds a universal (arm64 + x86_64) binary via lipo, which is
# what the Celerity fleet (macOS SEED devices) runs. On other platforms it
# builds a single native binary.
set -euo pipefail

SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_BIN="$SRC_DIR/../../../plugins/ccube-celerity/skills/smoke-test-sgw/bin"
mkdir -p "$PLUGIN_BIN"

export CARGO_HOME="${CARGO_HOME:-$SRC_DIR/.cargo-home}"

case "$(uname -s)" in
  Darwin)
    rustup target add aarch64-apple-darwin x86_64-apple-darwin >/dev/null
    cargo build --release --target aarch64-apple-darwin
    cargo build --release --target x86_64-apple-darwin
    lipo -create -output "$PLUGIN_BIN/smoke" \
      "$SRC_DIR/target/aarch64-apple-darwin/release/smoke" \
      "$SRC_DIR/target/x86_64-apple-darwin/release/smoke"
    strip "$PLUGIN_BIN/smoke"
    lipo -info "$PLUGIN_BIN/smoke"
    ;;
  *)
    cargo build --release
    cp "$SRC_DIR/target/release/smoke" "$PLUGIN_BIN/smoke"
    strip "$PLUGIN_BIN/smoke" 2>/dev/null || true
    ;;
esac

chmod +x "$PLUGIN_BIN/smoke"
echo "wrote $PLUGIN_BIN/smoke"
