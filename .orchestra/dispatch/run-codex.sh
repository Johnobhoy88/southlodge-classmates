#!/bin/bash
# Codex loop wrapper — builds, commits, proposes, repeats
# Usage: run-codex.sh [max-tasks]

WORKTREE="C:/Users/Farsight.DESKTOP-CQ0CL93/classmates-codex"
MAX_TASKS="${1:-3}"
DONE=0

cd "$WORKTREE" || { echo "HEALTH: worktree missing at $WORKTREE"; exit 1; }

# Pre-flight health check
echo "=== HEALTH CHECK ==="
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "codex/dev" ]; then
  echo "HEALTH FAIL: on $BRANCH, expected codex/dev"
  exit 1
fi
DIRTY=$(git status --porcelain -- '*.js' '*.css' '*.html' '*.mjs' | grep -v '^\?' | wc -l)
if [ "$DIRTY" -gt 0 ]; then
  echo "HEALTH WARN: $DIRTY uncommitted changes, cleaning..."
  git checkout -- . 2>/dev/null
fi
echo "HEALTH OK: codex/dev, clean worktree"

while [ "$DONE" -lt "$MAX_TASKS" ]; do
  echo ""
  echo "=== CODEX LOOP: Task $((DONE + 1)) of max $MAX_TASKS ==="

  git merge dev --no-edit 2>/dev/null

  echo "=== PHASE 1: Find and build ==="
  codex exec "You are Codex on the South Lodge Classmates team. Free tool for a real Scottish school.

Use clickup get_tasks with list_id 901216778613 to see Ready tasks. Find one with [codex] in the name. If none exist, say NO_CODEX_TASKS and stop.

Read the task description and the existing code files BEFORE building. Build the feature on codex/dev. Run npm run build and npm test. Fix failures." \
    --dangerously-bypass-approvals-and-sandbox \
    -C "$WORKTREE" \
    -m gpt-5.4 2>&1

  # Health: check if Phase 1 produced changes
  CHANGES=$(cd "$WORKTREE" && git status --porcelain -- '*.js' '*.html' '*.css' '*.json' '*.mjs' 2>/dev/null | grep -v '^\?' | wc -l)
  echo "HEALTH: $CHANGES files changed after Phase 1"
  if [ "$CHANGES" -eq 0 ]; then
    echo "=== No changes. Stopping. ==="
    break
  fi

  # Health: verify build passes before committing
  cd "$WORKTREE" && npm run build 2>&1 | tail -1
  BUILD_EXIT=$?
  if [ "$BUILD_EXIT" -ne 0 ]; then
    echo "HEALTH FAIL: build failed after Phase 1, discarding changes"
    git checkout -- . 2>/dev/null
    break
  fi

  echo "=== PHASE 2: Commit + Proposals + Tasks (after 5s cooldown) ==="
  sleep 5
  codex exec "Do these steps IN ORDER:
1. git add -A && git diff --cached --stat
2. Write a commit message and run git commit -m '<message>'
3. Use clickup MCP create_task in list_id 901216781412 — name: [proposal] <your idea>. Say WHY and HOW.
4. Create a SECOND proposal about a different improvement.
5. If you spotted a gap, bug, or new feature while working, create a TASK in list_id 901216778613 (Ready list). Tag it [codex], [copilot], [claude], or [gemini] based on who should do it. Include Objective, Scope, and Acceptance Criteria in the description.
Do NOT skip steps 1-4. Step 5 is optional but encouraged." \
    --dangerously-bypass-approvals-and-sandbox \
    -C "$WORKTREE" \
    -m gpt-5.4 2>&1

  # Health: verify commit exists
  LATEST=$(cd "$WORKTREE" && git log codex/dev --oneline -1)
  echo "HEALTH: latest commit: $LATEST"

  DONE=$((DONE + 1))
done

echo ""
echo "=== CODEX DONE: $DONE tasks ==="
echo "HEALTH SUMMARY: completed $DONE tasks"
cd "$WORKTREE" && git log codex/dev --oneline -5
