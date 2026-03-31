#!/bin/bash
# Codex loop wrapper — builds, commits, proposes, repeats
# Usage: run-codex.sh [max-tasks]

WORKTREE="C:/Users/Farsight.DESKTOP-CQ0CL93/classmates-codex"
MAX_TASKS="${1:-3}"
DONE=0

cd "$WORKTREE" || exit 1

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

  CHANGES=$(cd "$WORKTREE" && git status --porcelain -- '*.js' '*.html' '*.css' '*.json' '*.mjs' 2>/dev/null | grep -v '^\?' | head -1)
  if [ -z "$CHANGES" ]; then
    echo "=== No changes. Stopping. ==="
    break
  fi

  echo "=== PHASE 2: Commit + Proposals + New Tasks (after 5s cooldown) ==="
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

  DONE=$((DONE + 1))
done

echo ""
echo "=== CODEX DONE: $DONE tasks ==="
cd "$WORKTREE" && git log codex/dev --oneline -5
