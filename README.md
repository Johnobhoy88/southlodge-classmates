# Classmates

Classmates is a local-first classroom learning platform designed to ship as one self-contained HTML file that a teacher can download, open in the browser, and use offline with no install or server.

## Delivery Model

- Teachers receive one generated `classmates.html` file.
- The file runs directly in the browser with no internet dependency.
- Progress, roster data, settings, and authored content stay on that browser and device.
- Backup export and restore are built into the app because browser storage is not guaranteed forever.

## Source Layout

- `src/template.html`: single-file shell for the shipped artifact
- `src/body.html`: application markup
- `src/styles/`: embedded fonts and app styles
- `src/scripts/storage.js`: local storage boundary and backup/import runtime
- `src/scripts/app.js`: current runtime while legacy features are extracted into cleaner modules
- `scripts/build-single-file.mjs`: compiles the modular source into one HTML artifact
- `scripts/verify-single-file.mjs`: blocks external dependencies that would break offline use
- `docs/architecture.md`: current architecture and migration order
- `docs/classmates-v2-spec.md`: product, UX, flagship games, and module target for V2

## Commands

```bash
npm install
npm run build
```

`npm run build` writes:

- `dist/classmates.html`
- `index.html`

## Product Rules

- The repo can be modular.
- The shipped product stays one HTML file.
- No CDN, server, login system, or teacher-side setup is allowed for core use.
- New features must preserve direct browser-open behaviour.
