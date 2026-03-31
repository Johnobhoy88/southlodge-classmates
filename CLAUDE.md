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
- `src/scripts/teacher/` — teacher dashboard (summary, reports, authoring, tools)
- `src/scripts/platform/` — app state, shell, module system, bootstrap
- `src/scripts/pupil/` — pupil home, avatar
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

## Git
- `master` = release
- `dev` = integration
- Agent branches: `claude/dev`, `codex/dev`, `copilot/dev`, `gemini/dev`
- All merges to dev require passing tests
