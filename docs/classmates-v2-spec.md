# Classmates V2 Product Spec

## Assumption

Classmates V2 targets primary-school pupils and teachers, must run well on standard school hardware, and must still ship as one browser-openable HTML file with no install, no server, and no online dependency for core use.

## Product Position

Classmates V2 is a free, local-first classroom learning platform designed to rival paid products on engagement and teacher usefulness while keeping pupil data sovereign and device-local.

## Non-Negotiables

- The shipped product is one self-contained HTML file.
- A teacher can receive it, open it in the browser, and use it immediately.
- No local server, account setup, or internet dependency exists for core use.
- Data is stored in the local browser on that device.
- Backup export and restore are built in.
- New features must improve the platform without turning it back into one giant hand-edited source file.

## Product Pillars

### 1. Engagement

- Children should feel they are playing a real game, not doing worksheet wrappers.
- Every flagship game needs visible progression, rewards, and replay value.
- Feedback must be immediate and satisfying.

### 2. Teacher Value

- Teachers must get usable intervention signals in under one minute.
- Roster management, assignments, progress, and backup must be simple and fast.
- The dashboard must answer who is stuck, who is thriving, and what to assign next.

### 3. Professional Finish

- The app must feel calm, intentional, and premium.
- Visual consistency must span pupil play, teacher tools, reports, and builders.
- Motion, sound, and rewards should feel deliberate rather than noisy.

### 4. Local Sovereignty

- All core classroom use works offline.
- Teacher data stays on-device unless explicitly exported.
- The codebase must preserve a later path to sync without requiring server infrastructure now.

## Quality Bar

- Engagement benchmark: Prodigy-style motivation and progression
- Teacher benchmark: Sumdog-style classroom usefulness
- Warmth benchmark: Teach Your Monster-style literacy charm
- Trust benchmark: Khan Academy Kids-style clarity and accessibility

The goal is not to copy those products. The goal is to beat them within the local single-file delivery model.

## Art Direction

## Visual Tone

- Warm, premium, playful
- Bright but controlled
- Distinct from flat school websites and generic edtech dashboards
- More storybook game studio than worksheet portal

## UI Rules

- Strong world identity from the first screen
- One clear typography system with large readable headings and calm body text
- Bold iconography and character-led navigation for pupils
- Cleaner, more disciplined controls for teachers
- Meaningful motion on transitions, rewards, and game outcomes
- No purple-on-white default look
- No overcrowded card soup

## Brand Shape

- Classmates should feel like a learning world, not a set of disconnected modes
- Pupil screens should feel adventurous and collectible
- Teacher screens should feel dependable and operational

## Core Progression Loop

1. Pupil selects profile
2. App shows assignments, streak, and suggested next goal
3. Pupil plays a short flagship session
4. Questions drive score, movement, unlocks, and rewards
5. Session ends with summary, reward, and mastery feedback
6. Progress updates per skill and per game engine
7. Teacher sees updated class signals on the dashboard

## Reward Loop

- Coins or stars for participation and success
- Bonus rewards for streaks, improvement, perfect rounds, and teacher assignments
- Unlockable cosmetic items, world progress, and collectible milestones
- Certificates and printable outputs for teacher-facing reinforcement

## Pupil UX Spec

## Home Screen

The pupil home must show:

- current avatar
- streak
- assignment prompt
- three recommended next actions
- quick access to flagship games
- visible progress toward the next unlock

The pupil should never land in an overloaded menu.

## Session Standard

- The first meaningful interaction happens within 5 seconds
- The first reward lands within 20 seconds
- Most sessions should fit into 3 to 8 minutes
- Failure states should encourage retry, not shame

## Accessibility

- Full keyboard support
- Full touch support
- Clear contrast and large hit targets
- Dyslexia-friendly reading mode option
- Reduced sensory overload in menus and result states

## Teacher UX Spec

## Teacher Dashboard Must Show

- class summary
- active pupils today
- assignment status
- weakest skills by pupil
- strongest pupils
- recent attempts
- backup health and restore tools

## Teacher Workflows

### Roster

- add pupil
- bulk add pupils
- remove pupil
- reset individual pupil progress

### Assignments

- assign game or skill focus
- set level or difficulty target
- add short teacher message
- clear or update assignment quickly

### Progress

- class overview
- per-pupil detail
- skill gaps
- trend summaries
- printable or exportable report views

### Builder

- create content without editing code
- add or remove quiz items
- later add level packs and challenge chains

### Backup

- download one backup file
- import one backup file
- clear device data only through explicit destructive flow

## Flagship Games

## 1. Highland Dash 2.0

### Role

Flagship arcade numeracy and general challenge game.

### Promise

This is the game children ask to play again.

### Gameplay

- Endless-runner style flow
- Questions fuel boosts, lane choices, hazards, and reward chains
- Correct streaks unlock speed, shield, and bonus pickups
- Wrong answers slow progress but do not hard-stop the session

### Learning Use

- number bonds
- arithmetic fluency
- quick-fire comparison
- teacher challenge events later

### Premium Standard

- fast controls
- good juice and motion
- short rounds
- visible world progression

## 2. Spellbound Forest

### Role

Flagship literacy game.

### Promise

This is where phonics, spelling, and word families stop feeling like drills.

### Gameplay

- branching woodland map
- short encounters driven by phonics, spelling patterns, word building, and reading prompts
- correct answers grow paths, restore areas, unlock companions, and reveal story fragments
- mistakes redirect with scaffolding rather than blunt failure

### Learning Use

- phonics
- spelling
- word families
- reading fluency
- early comprehension

### Premium Standard

- warm art direction
- strong sense of place
- clear mastery feedback
- collectible but calm reward loop

## 3. Number Forge

### Role

Flagship numeracy strategy game.

### Promise

This is the game that proves classroom value to teachers.

### Gameplay

- short tactical puzzle rounds
- arithmetic decisions power crafting, building, or machine activation
- different modes for fluency, reasoning, and timed mastery
- reward loop focuses on progress and improving confidence

### Learning Use

- number bonds
- place value
- multiplication
- division
- fractions
- targeted teacher practice

### Premium Standard

- readable systems
- satisfying outcomes
- strong clarity on what skill improved
- easy teacher assignment hooks

## Platform Systems

## Shared Game Shell

Every flagship game should use the same shared runtime features:

- session timer
- reward output
- result screen
- pause and quit
- assignment tag
- accessibility controls
- audio toggle
- mastery summary

## Shared Domain Model

The domain layer should own:

- pupils
- teacher settings
- assignments
- attempts
- mastery summaries
- achievements
- content packs
- backup metadata

## Persistence Rules

- UI should never talk to raw browser storage directly
- storage access goes through the storage boundary
- all records stay serializable and exportable
- entity IDs must stay stable for future sync

## Repo Modules

## Current Direction

The repo should move from one legacy runtime toward clear platform slices.

## Target Module Layout

- `src/template.html`
  - final artifact shell
- `src/body.html`
  - static application structure
- `src/styles/`
  - design tokens, layout, teacher UI, pupil UI, flagship game skins
- `src/scripts/platform/`
  - boot, screen routing, shared shell, shared UI helpers
- `src/scripts/domain/`
  - pupils, assignments, attempts, progress summaries, achievements
- `src/scripts/storage/`
  - browser persistence adapter, backup import, backup export
- `src/scripts/content/`
  - literacy packs, numeracy packs, geography packs, teacher-authored packs
- `src/scripts/engines/`
  - reusable quiz and interaction engines
- `src/scripts/games/highland-dash/`
  - runtime, systems, content hooks, HUD
- `src/scripts/games/spellbound-forest/`
  - runtime, map flow, literacy hooks, reward logic
- `src/scripts/games/number-forge/`
  - runtime, puzzle systems, numeracy hooks, reward logic
- `src/scripts/teacher/`
  - dashboard, reports, roster tools, assignments, builders
- `scripts/`
  - build and verification scripts
- `docs/`
  - product, architecture, roadmap, content design

## First-Build Roadmap

## Phase 1. Lock The Platform Spine

- keep the one-file build contract
- finish domain boundaries
- keep storage and backup stable
- stop legacy runtime from spreading

## Phase 2. Ship One Premium Teacher Dashboard

- better summary cards
- intervention-first progress views
- cleaner roster and assignment UX
- stronger report formatting

## Phase 3. Rebuild Highland Dash As A Flagship

- separate it from generic page logic
- improve game feel and readability
- connect it to real mastery and reward systems

## Phase 4. Build Spellbound Forest

- this becomes the premium literacy anchor
- data-driven content packs from day one

## Phase 5. Build Number Forge

- this becomes the premium numeracy anchor
- clear teacher assignment hooks

## Phase 6. Rationalize The Rest

- stop making one-off mini-games
- merge weaker modes into shared engines
- keep only modes that add real value

## Success Criteria

Classmates V2 is successful when:

- a teacher can open one file and use it immediately
- pupils want to replay the flagship games
- teachers can see who needs help without hunting for data
- the app no longer feels like a prototype
- new features are built through platform modules, not giant-file sprawl
