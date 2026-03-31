#!/bin/bash
# Copilot loop wrapper — builds, commits, proposes, repeats
# Usage: run-copilot.sh [max-tasks]

WORKTREE="C:/Users/Farsight.DESKTOP-CQ0CL93/classmates-copilot"
MCP_FILE="C:/Users/Farsight.DESKTOP-CQ0CL93/classmates/.orchestra/dispatch/copilot-mcp.json"
MAX_TASKS="${1:-3}"
DONE=0

cd "$WORKTREE" || { echo "HEALTH: worktree missing at $WORKTREE"; exit 1; }

# Pre-flight health check
echo "=== HEALTH CHECK ==="
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "copilot/dev" ]; then
  echo "HEALTH FAIL: on $BRANCH, expected copilot/dev"
  exit 1
fi
DIRTY=$(git status --porcelain -- '*.js' '*.css' '*.html' '*.mjs' | grep -v '^\?' | wc -l)
if [ "$DIRTY" -gt 0 ]; then
  echo "HEALTH WARN: $DIRTY uncommitted changes, cleaning..."
  git checkout -- . 2>/dev/null
fi
echo "HEALTH OK: copilot/dev, clean worktree"

while [ "$DONE" -lt "$MAX_TASKS" ]; do
  echo ""
  echo "=== COPILOT LOOP: Task $((DONE + 1)) of max $MAX_TASKS ==="

  git merge dev --no-edit 2>/dev/null

  echo "=== PHASE 1: Find and build ==="
  gh copilot -- -p "You are on copilot/dev in the classmates repo. A free tool for South Lodge Primary.

Use clickup get_tasks with list_id 901216778613 to see Ready tasks. Find one with [copilot] in the name. Read the task and the existing code. Build it. Run npm run build and npm test. Then git add -A and git commit with a clear message." \
    --yolo --autopilot -s \
    --additional-mcp-config "@$MCP_FILE" 2>&1

  NEWCOMMIT=$(cd "$WORKTREE" && git log copilot/dev --oneline --not dev 2>/dev/null | head -1)
  echo "HEALTH: new commit check: ${NEWCOMMIT:-none}"
  if [ -z "$NEWCOMMIT" ]; then
    echo "=== No new commits. Stopping. ==="
    break
  fi

  # Health: verify build
  cd "$WORKTREE" && npm test 2>&1 | tail -3
  TEST_EXIT=$?
  if [ "$TEST_EXIT" -ne 0 ]; then
    echo "HEALTH FAIL: tests failed, resetting"
    git reset --hard dev 2>/dev/null
    break
  fi

  echo "=== PHASE 2: Proposals ==="
  gh copilot -- -p "Use the clickup MCP create_task tool to create 2 proposals in list_id 901216781412. Name them [proposal] <idea>. One about product improvement, one about system improvement. Explain WHY and HOW." \
    --yolo --autopilot -s \
    --additional-mcp-config "@$MCP_FILE" 2>&1

  DONE=$((DONE + 1))
done

echo ""
echo "=== COPILOT DONE: $DONE tasks ==="
cd "$WORKTREE" && git log copilot/dev --oneline -5
