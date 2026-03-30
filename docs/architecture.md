# Classmates Architecture

## Product Promise
- One self-contained HTML file for teachers.
- Runs directly from `file://` with no server, install, or internet dependency.
- Stores data locally in the browser on that device.
- Supports backup export and restore because browser storage is not permanent.

## Source Of Truth
- `src/template.html`: single-file shell used for the shipped artifact.
- `src/body.html`: UI markup extracted from the legacy prototype.
- `src/styles/fonts.css`: embedded font faces.
- `src/styles/app.css`: application styling.
- `src/scripts/platform/runtime.js`: module and service registry for shared runtime contracts.
- `src/scripts/platform/module-manifest.js`: explicit ownership map for platform, domain, teacher, pupil, and flagship slices.
- `src/scripts/platform/bootstrap.js`: final startup gate that validates core services before the app boots.
- `src/scripts/storage.js`: local-first storage boundary and backup runtime.
- `src/scripts/app.js`: current legacy runtime while features are extracted.
- `scripts/build-single-file.mjs`: compiles source into one HTML file.
- `scripts/verify-single-file.mjs`: blocks regressions that would break offline delivery.

## Current Migration Order
1. Lock down the offline contract: no external assets, no runtime fetches, one generated artifact.
2. Extract platform boundaries first: runtime registry, storage, backup, teacher data tools, shared shell state.
3. Split game logic into reusable engines instead of one mode per giant block of code.
4. Move content into structured packs so literacy, numeracy, and geography stop living inside runtime code.
5. Upgrade flagship games and the teacher dashboard after the platform spine is stable.

## Non-Negotiables
- The shipped product stays one HTML file.
- The repo can be modular even though the artifact is not.
- New features must be buildable into the single-file export without adding teacher setup.
