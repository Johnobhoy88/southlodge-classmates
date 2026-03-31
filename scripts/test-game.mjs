/**
 * Generic game browser test — verifies a game starts without errors.
 * Usage: node scripts/test-game.mjs <gameId> [level]
 * Example: node scripts/test-game.mjs spelling 3
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.resolve(__dirname, '..', 'dist', 'classmates.html');
const appUrl = 'file:///' + appPath.replace(/\\/g, '/');

const gameId = process.argv[2];
const level = process.argv[3] ? parseInt(process.argv[3]) : null;

if (!gameId) {
  console.log('Usage: node scripts/test-game.mjs <gameId> [level]');
  console.log('Example: node scripts/test-game.mjs spelling 3');
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));

await page.goto(appUrl);
await page.waitForTimeout(500);

// Go to pupil home
await page.evaluate(() => enterPupilHome());
await page.waitForTimeout(300);

// Start the game
console.log(`Testing: ${gameId}${level ? ' level ' + level : ''}...`);
await page.evaluate((id) => startGame(id), gameId);
await page.waitForTimeout(300);

// Try to start a level if provided
if (level) {
  // Find and call the level-start function
  const started = await page.evaluate(({ id, lv }) => {
    // Common patterns for level-start functions
    const fns = {
      spelling: () => setSpellingLevel(lv),
      dictation: () => startDict(lv),
      vowels: () => startVowels(lv),
      anagram: () => startAnagram(lv),
      phonics: () => startPhonics(lv),
      wordfam: () => startWF(lv),
      sentence: () => startSent(lv),
      punctuation: () => startPunct(lv),
      vocab: () => startVocab(lv),
      reading: () => startReading(lv),
      grammar: () => startGrammar(lv),
      rhyme: () => startRhyme(lv),
      maths: () => setMathsLevel(lv),
      times: () => startTT(lv),
      speed: () => startSpeed(lv),
      bonds: () => startBonds(lv),
      missnum: () => startMN(lv),
      placeval: () => startPV(lv),
      telltime: () => startTTime(lv),
      money: () => startMoney(lv),
      fractions: () => startFrac(lv),
      wordprob: () => startWP(lv),
      shapes: () => startShapes(lv),
      datahandling: () => startDataH(lv),
      measure: () => startMeasure(lv),
      sequence: () => startSeq(lv),
      capitals: () => startCaps(lv),
      continents: () => startCont(lv),
      weather: () => startWeather(lv),
      daily: () => startDaily(lv),
    };
    if (fns[id]) {
      try { fns[id](); return true; }
      catch (e) { return 'ERROR: ' + e.message; }
    }
    return 'NO_LEVEL_FN';
  }, { id: gameId, lv: level });

  if (started !== true) {
    console.log('Level start:', started);
  }
  await page.waitForTimeout(500);
}

// Check game state
const state = await page.evaluate((id) => {
  const screen = document.getElementById(id);
  const active = screen ? screen.classList.contains('active') : false;
  const visible = screen ? (screen.offsetWidth > 0 || screen.offsetHeight > 0) : false;

  // Count interactive elements
  const buttons = screen ? screen.querySelectorAll('button, .ph-opt, .kb-key, .num-key, .level-card').length : 0;
  const progressBar = screen ? screen.querySelector('.progress-bar, .progress-fill') : null;

  return {
    screenActive: active,
    screenVisible: visible,
    interactiveElements: buttons,
    hasProgressBar: !!progressBar,
    screenId: id,
  };
}, gameId);

console.log('Result:', JSON.stringify(state, null, 2));

if (errors.length > 0) {
  console.log('\nERRORS:');
  errors.forEach(e => console.log('  ', e));
  console.log(`\n${gameId}: BROKEN`);
} else if (state.screenActive && state.interactiveElements > 0) {
  console.log(`\n${gameId}: WORKING`);
} else if (state.screenActive) {
  console.log(`\n${gameId}: LOADED (but no interactive elements found — may need level selection)`);
} else {
  console.log(`\n${gameId}: FAILED TO LOAD`);
}

await browser.close();
