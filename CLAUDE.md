# South Lodge Classmates

A free, sovereign, local learning tool for South Lodge Primary School, Invergordon.

## What this is
A parent built this for his daughter's school. It's free. No monetisation, no cloud, no tracking, no accounts. Just a good tool that helps kids learn and helps teachers teach.

## How it works
- Ships as **one HTML file** — teacher downloads it, opens in a browser, done
- All data stays on the device in localStorage
- Works offline from file:// — no internet required
- Teachers manage pupils, set assignments, view progress, export reports
- Pupils play learning games across literacy, numeracy, and general knowledge

## Build
```
npm install
npm run build    # builds dist/classmates.html + index.html
npm test         # 126 smoke checks + 26 logic tests = 152 total
```

## Architecture
- `src/scripts/domain/` — data models (pupils, attempts, mastery, sessions, CfE curriculum, reading)
- `src/scripts/games/` — extracted game modules (spelling, maths, times-tables, southlodge-racers)
- `src/scripts/games/spelling-fx.js` — premium FX engine (Canvas 2D scene, Web Audio sounds, particles)
- `src/scripts/teacher/` — teacher dashboard (summary, reports, authoring, tools)
- `src/scripts/platform/` — app state, shell, module system, bootstrap
- `src/scripts/pupil/` — pupil home, avatar (with equipped cosmetics store)
- `src/scripts/flagship/` — Southlodge Racers admin panel
- `src/scripts/app.js` — legacy runtime (being decomposed)
- `src/body.html` — all markup
- `src/styles/app.css` — all styles

## Agent instructions
- Read existing code before building. Don't duplicate what's there
- Run `npm run build && npm test` before considering work done
- This ships as one offline HTML file — no external deps, no server
- Think about what a 7-year-old experiences and what a teacher needs at 3pm on a Friday
- The school name is South Lodge Primary. The town is Invergordon, Highlands, Scotland
- CfE = Curriculum for Excellence (Scottish national curriculum)

## Tests
```
npm test           # 164 checks: 129 smoke + 35 logic
npm run test:smoke # artifact integrity, offline contract, module presence, build completeness
npm run test:logic # VM-sandboxed module tests (storage, spelling, maths, etc.)
npx playwright test # E2E tests: landing, teacher flow, game cards, pupil home
```

## Git
- `master` = release
- `dev` = integration
- Agent branches: `claude/dev`, `codex/dev`, `copilot/dev`, `gemini/dev`
- Agent worktrees: `classmates-codex/`, `classmates-copilot/`, `classmates-gemini/`
- All merges to dev require passing tests

## Versions
- v0.1.0 — initial scaffold
- v0.2.0 — overnight session 1 (teacher dashboard, Racers, 9 modules, 144 tests)
- v0.3.0 — game enhancement sprint begins (adaptive spelling, remix, suggestions)
- v0.4.0 — all 35 games enhanced (streaks, PBs, encouragements, adaptive difficulty)
- v0.5.0 — Phase 5: E2E tests, intervention playlist, module cleanup
- v0.6.0 — all 39 games verified working, missed items, CSS design tokens
- v0.7.0 — Premium Spelling "Word Forest" (Canvas 2D scene, Web Audio, particles)
- v0.7.1 — Full-screen forest, avatar store with 21 cosmetics, star-based coin economy

## Premium Game Pattern (spelling-fx.js)
The spelling game is the flagship — the quality bar for every other game.
- Canvas 2D background scene fills the entire screen (not boxed)
- Web Audio API procedural sounds (zero audio files)
- Particle system for visual feedback (reusable for other games)
- 6 guarded hooks in app.js: onCorrectLetter, onWrongLetter, onWordComplete, onWordFailed, onGameComplete
- Pattern: create `games/{game}-fx.js`, add canvas to screen, wire hooks
- Degrades gracefully if FX module fails to load
