# Game Enhancement Progress — COMPLETE

Every game browser-tested with Playwright, verified working, enhanced.

## Literacy (12 games) — ALL DONE
| # | Game | ID | Works | Streak | Missed | Remix | Adaptive |
|---|------|-----|-------|--------|--------|-------|----------|
| 1 | Spelling | spelling | ✓ | ✓ | ✓ | ✓ | ✓ |
| 2 | Dictation | dictation | ✓ | ✓ | ✓ | ✓ | ✓ |
| 3 | Missing Vowels | vowels | ✓ | ✓ | ✓ | ✓ | ✓ |
| 4 | Anagrams | anagram | ✓ | ✓ | ✓ | ✓ | ✓ |
| 5 | Phonics | phonics | ✓ | ✓ | ✓ | ✓ | ✓ |
| 6 | Word Families | wordfam | ✓ | ✓ | ✓ | ✓ | ✓ |
| 7 | Sentences | sentence | ✓ | ✓ | ✓ | - | ✓ |
| 8 | Punctuation | punctuation | ✓ | ✓ | ✓ | ✓ | ✓ |
| 9 | Vocabulary | vocab | ✓ | ✓ | ✓ | ✓ | ✓ |
| 10 | Reading | reading | ✓ | ✓ | - | - | - |
| 11 | Grammar | grammar | ✓ | ✓ | ✓ | ✓ | ✓ |
| 12 | Rhyming | rhyme | ✓ | ✓ | ✓ | ✓ | ✓ |

## Numeracy (14 games) — ALL DONE
| # | Game | ID | Works | Streak | Missed | PB | Adaptive |
|---|------|-----|-------|--------|--------|-----|----------|
| 13 | Maths | maths | ✓ | ✓ | - | - | ✓ |
| 14 | Times Tables | times | ✓ | ✓ | - | ✓ | ✓ |
| 15 | Speed Maths | speed | ✓ | combo | - | ✓ | - |
| 16 | Number Bonds | bonds | ✓ | ✓ | ✓ | - | ✓ |
| 17 | Missing Number | missnum | ✓ | ✓ | - | - | ✓ |
| 18 | Place Value | placeval | ✓ | ✓ | - | - | ✓ |
| 19 | Telling Time | telltime | ✓ | ✓ | - | - | ✓ |
| 20 | Money | money | ✓ | ✓ | - | - | ✓ |
| 21 | Fractions | fractions | ✓ | ✓ | - | - | ✓ |
| 22 | Word Problems | wordprob | ✓ | ✓ | - | - | ✓ |
| 23 | Shapes | shapes | ✓ | ✓ | ✓ | - | ✓ |
| 24 | Data Handling | datahandling | ✓ | ✓ | ✓ | - | - |
| 25 | Measurement | measure | ✓ | ✓ | ✓ | - | - |
| 26 | Sequences | sequence | ✓ | ✓ | ✓ | - | - |

## Geography (5 games) — ALL DONE
| # | Game | ID | Works | Streak | Missed |
|---|------|-----|-------|--------|--------|
| 27 | Capitals | capitals | ✓ | ✓ | ✓ |
| 28 | Continents | continents | ✓ | ✓ | ✓ |
| 29 | Weather | weather | ✓ | ✓ | ✓ |
| 30 | Compass | compass | ✓ | ✓ | ✓ |
| 31 | Flags | flags | ✓ | ✓ | ✓ |

## Challenge (8 games) — ALL DONE
| # | Game | ID | Works | Special Features |
|---|------|-----|-------|-----------------|
| 32 | Scotland Quiz | scotquiz | ✓ | streak, missed items |
| 33 | Spelling Bee | spellingbee | ✓ | lives, persistent PB |
| 34 | Typing | typing | ✓ | timer, persistent PB |
| 35 | Memory Match | memorymatch | ✓ | pairs, persistent PB (moves) |
| 36 | Daily Challenge | daily | ✓ | daily streak, yesterday's score |
| 37 | Head to Head | h2h | ✓ | 2-player |
| 38 | Teacher Quiz | customquiz | ✓ | teacher-authored (hidden by design) |
| 39 | Southlodge Racers | hdash | ✓ | 3D, rewards, pacing, CfE, classroom launch |

## Bugs Found & Fixed
1. Spelling — WORD_EMOJI undefined in loadSpellWord
2. Southlodge Racers — trailParticles missing from RACER init
3. Reading — streak:0 missing from state init
4. 6 numeracy games — streak:0 missing from state init
5. 3 game modules — missing semicolons causing concatenation crash
