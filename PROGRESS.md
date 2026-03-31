# Game Enhancement Progress

Each game browser-tested with Playwright, verified working, enhanced, committed.

## Literacy (12 games) — ALL VERIFIED WORKING
| # | Game | ID | Browser Test | Streak | Missed | Remix | Adaptive | Status |
|---|------|-----|-------------|--------|--------|-------|----------|--------|
| 1 | Spelling | spelling | ✓ L1-3 | ✓ | ✓ | ✓ | ✓ | DONE |
| 2 | Dictation | dictation | ✓ L1-3 | ✓ | ✓ | ✓ | ✓ | DONE |
| 3 | Missing Vowels | vowels | ✓ L1-3 | ✓ | ✓ | ✓ | ✓ | DONE |
| 4 | Anagrams | anagram | ✓ L1-3 | ✓ | ✓ | ✓ | ✓ | DONE |
| 5 | Phonics | phonics | ✓ L1 | ✓ | ✓ | - | ✓ | DONE |
| 6 | Word Families | wordfam | ✓ L1 | ✓ | ✓ | - | ✓ | DONE |
| 7 | Sentences | sentence | ✓ L1 | ✓ | - | - | ✓ | DONE |
| 8 | Punctuation | punctuation | ✓ L1 | ✓ | - | - | ✓ | DONE |
| 9 | Vocabulary | vocab | ✓ L1 | ✓ | - | - | ✓ | DONE |
| 10 | Reading | reading | ✓ L1 | ✓ (fixed) | - | - | - | DONE |
| 11 | Grammar | grammar | ✓ L1 | ✓ | - | - | - | DONE |
| 12 | Rhyming | rhyme | ✓ L1 | ✓ | - | - | - | DONE |

## Numeracy (14 games) — ALL VERIFIED WORKING
| # | Game | ID | Browser Test | Streak | PB | Adaptive | Status |
|---|------|-----|-------------|--------|-----|----------|--------|
| 13 | Maths | maths | ✓ L1 | ✓ (fixed) | - | ✓ | DONE |
| 14 | Times Tables | times | ✓ L1 | ✓ (fixed) | ✓ | ✓ | DONE |
| 15 | Speed Maths | speed | ✓ L1 | combo | ✓ | - | DONE |
| 16 | Number Bonds | bonds | ✓ L1 | ✓ | - | ✓ | DONE |
| 17 | Missing Number | missnum | ✓ L1 | ✓ | - | ✓ | DONE |
| 18 | Place Value | placeval | ✓ L1 | ✓ | - | ✓ | DONE |
| 19 | Telling Time | telltime | ✓ L1 | ✓ | - | ✓ | DONE |
| 20 | Money | money | ✓ L1 | ✓ | - | ✓ | DONE |
| 21 | Fractions | fractions | ✓ L1 | ✓ (fixed) | - | ✓ | DONE |
| 22 | Word Problems | wordprob | ✓ L1 | ✓ (fixed) | - | ✓ | DONE |
| 23 | Shapes | shapes | ✓ L1 | ✓ (fixed) | - | ✓ | DONE |
| 24 | Data Handling | datahandling | ✓ L1 | ✓ (fixed) | - | - | DONE |
| 25 | Measurement | measure | ✓ L1 | ✓ | - | - | DONE |
| 26 | Sequences | sequence | ✓ L1 | ✓ | - | - | DONE |

## Geography (5 games) — ALL VERIFIED WORKING
| # | Game | ID | Browser Test | Streak | Status |
|---|------|-----|-------------|--------|--------|
| 27 | Capitals | capitals | ✓ | ✓ | DONE |
| 28 | Continents | continents | ✓ | ✓ | DONE |
| 29 | Weather | weather | ✓ | ✓ | DONE |
| 30 | Compass | compass | ✓ | ✓ | DONE |
| 31 | Flags | flags | ✓ | ✓ | DONE |

## Challenge (8 games) — ALL VERIFIED WORKING
| # | Game | ID | Browser Test | Special | Status |
|---|------|-----|-------------|---------|--------|
| 32 | Scotland Quiz | scotquiz | ✓ | streak | DONE |
| 33 | Spelling Bee | spellingbee | ✓ | lives, PB | DONE |
| 34 | Typing | typing | ✓ | timer, PB | DONE |
| 35 | Memory Match | memorymatch | ✓ | pairs, PB | DONE |
| 36 | Daily Challenge | daily | ✓ | daily streak, history | DONE |
| 37 | Head to Head | h2h | ✓ | 2-player | DONE |
| 38 | Teacher Quiz | customquiz | hidden | teacher-authored | DONE |
| 39 | Southlodge Racers | hdash | ✓ (fixed) | 3D, rewards, CfE | DONE |

## Bugs Found & Fixed
1. **Spelling** — `WORD_EMOJI` undefined in `loadSpellWord` (renamed variable not updated)
2. **Southlodge Racers** — `trailParticles` missing from RACER object init (crash on start)
3. **Reading** — `streak:0` missing from state init
4. **6 numeracy games** — `streak:0` missing from state init (maths, times, wordprob, fractions, shapes, datahandling)
