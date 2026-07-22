#!/bin/bash
# MR Git Analysis + Metrics Script
# Performs batched git analysis and metrics extraction in a single run
# Usage: bash git-analysis.sh <feature-branch> <base-branch>

# Exit on unset variables and pipe failures, but handle errors
# per-command to allow partial output on failure
set -uo pipefail

FEATURE_BRANCH="$1"
BASE_BRANCH="$2"

if [ -z "$FEATURE_BRANCH" ] || [ -z "$BASE_BRANCH" ]; then
    echo "Error: Both feature and base branches required"
    echo "Usage: $0 <feature-branch> <base-branch>"
    exit 1
fi

echo "=== MR Git Analysis ==="
echo "Feature Branch: $FEATURE_BRANCH"
echo "Base Branch: $BASE_BRANCH"
echo ""

echo "=== REPO ROOT ==="
git rev-parse --show-toplevel || echo "ERROR: Could not determine repo root"
echo ""

echo "=== FILE CHANGES (name-status) ==="
git diff --name-status "$BASE_BRANCH"..."$FEATURE_BRANCH" || echo "ERROR: git diff --name-status failed"
echo ""

echo "=== STATISTICS ==="
git diff --stat "$BASE_BRANCH"..."$FEATURE_BRANCH" || echo "ERROR: git diff --stat failed"
echo ""

echo "=== FULL DIFF ==="
git diff "$BASE_BRANCH"..."$FEATURE_BRANCH" || echo "ERROR: git diff failed"
echo ""

echo "=== COMMIT LOG ==="
git log --oneline --no-merges "$BASE_BRANCH".."$FEATURE_BRANCH" || echo "ERROR: git log failed"
echo ""

echo "=== CONTRIBUTORS ==="
git log --format='%aN' "$BASE_BRANCH".."$FEATURE_BRANCH" 2>/dev/null | sort -u || echo "unknown"
echo ""

# --- Inline metrics ---
STATS=$(git diff --shortstat "$BASE_BRANCH"..."$FEATURE_BRANCH" 2>/dev/null || echo "")
FILES_CHANGED=$(echo "$STATS" | sed -n 's/.* \([0-9]*\) file.*/\1/p')
LINES_ADDED=$(echo "$STATS" | sed -n 's/.* \([0-9]*\) insertion.*/\1/p')
LINES_DELETED=$(echo "$STATS" | sed -n 's/.* \([0-9]*\) deletion.*/\1/p')
FILES_CHANGED=${FILES_CHANGED:-0}
LINES_ADDED=${LINES_ADDED:-0}
LINES_DELETED=${LINES_DELETED:-0}
COMMITS=$(git log --oneline --no-merges "$BASE_BRANCH".."$FEATURE_BRANCH" | wc -l | tr -d ' ')
CONTRIBUTORS=$(git log --format='%aN' "$BASE_BRANCH".."$FEATURE_BRANCH" | sort -u | tr '\n' ',' | sed 's/,$//')
TOTAL_CHANGED=$((LINES_ADDED + LINES_DELETED))

if   [ "$TOTAL_CHANGED" -lt 50 ];   then COMPLEXITY="TRIVIAL"
elif [ "$TOTAL_CHANGED" -lt 200 ];  then COMPLEXITY="SMALL"
elif [ "$TOTAL_CHANGED" -lt 500 ];  then COMPLEXITY="MEDIUM"
elif [ "$TOTAL_CHANGED" -lt 1500 ]; then COMPLEXITY="LARGE"
else                                      COMPLEXITY="EXTRA LARGE"
fi

if   [ "$FILES_CHANGED" -gt 30 ] || [ "$TOTAL_CHANGED" -gt 1500 ]; then RISK="CRITICAL"
elif [ "$FILES_CHANGED" -gt 15 ] || [ "$TOTAL_CHANGED" -gt 500 ];  then RISK="HIGH"
elif [ "$FILES_CHANGED" -gt 5  ] || [ "$TOTAL_CHANGED" -gt 200 ];  then RISK="MEDIUM"
else                                                                      RISK="LOW"
fi

echo "=== METRICS JSON ==="
cat <<JSON
{
  "filesChanged": $FILES_CHANGED,
  "linesAdded": $LINES_ADDED,
  "linesDeleted": $LINES_DELETED,
  "totalChanged": $TOTAL_CHANGED,
  "commits": $COMMITS,
  "contributors": "$CONTRIBUTORS",
  "complexity": "$COMPLEXITY",
  "riskProfile": "$RISK"
}
JSON

echo ""
echo "=== ANALYSIS COMPLETE ==="
