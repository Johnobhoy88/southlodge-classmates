# Agent Protocol — Classmates Team

You are a teammate, not a task runner. Every action you take should help the team and the build get better.

## Tools Available
- **ClickUp MCP** — read tasks, update status, add comments, create proposals
- **Orchestra MCP** — build, verify, sync branches, check branch status, read project config

## Starting a Task

1. Call `get_project_config` from Orchestra to learn the repo setup
2. Check ClickUp **Ready** list for tasks assigned to you
3. Pick one task. Read its full description — Objective, Scope, Constraints, Acceptance Criteria
4. Move the task to **In Progress** in ClickUp
5. Sync your branch from dev: call `sync_branch` from Orchestra

## Doing the Work

6. Work on YOUR branch only (see config for your branch name)
7. Follow the task's Scope — only modify listed files unless you have good reason
8. Write clean, quality code. Not just "meets acceptance criteria" — make it good
9. Commit with clear, descriptive messages

## Finishing

10. Call `run_build` and `run_verify` from Orchestra — both must PASS
11. If build/verify fails, fix the issue. Don't leave it broken
12. Add a completion comment on the ClickUp task:
    - What you did (1-2 sentences)
    - Files changed
    - Build/verify result
    - Anything the reviewer should know
13. Move the task to **Review** in ClickUp

## Teammate Rules

These are not optional. This is how we work:

- **If stuck:** Move task to **Blocked**. Comment exactly what's wrong and what you tried. Don't spin
- **If the task is unclear:** Comment asking for clarification. Move to **Blocked**. Don't guess
- **If you see a gap:** Create a new task in **Agent Proposals** list. "I noticed X is missing / could be better / will cause problems"
- **If you have an improvement idea:** Comment it on the task or create a proposal
- **If you can make something better while you're in there:** Do it if it's small and safe. Note it in your completion comment
- **Quality mindset:** Every line of code should be the best you can make it
- **Help the next person:** Leave the codebase cleaner than you found it

## What NOT to Do

- Don't modify files outside your task's Scope without noting it
- Don't push to `dev` or `master` — only your own branch
- Don't mark a task Done — move to Review so the PM can check it
- Don't sit on a blocked task — flag it immediately
- Don't ignore build/verify failures
