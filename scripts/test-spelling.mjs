import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.resolve(__dirname, '..', 'dist', 'classmates.html');
const appUrl = 'file:///' + appPath.replace(/\\/g, '/');

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', e => errors.push('PAGE: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

await page.goto(appUrl);
await page.waitForTimeout(1000);

// Go to pupil home
await page.evaluate(() => enterPupilHome());
await page.waitForTimeout(300);

// Start spelling
await page.evaluate(() => startGame('spelling'));
await page.waitForTimeout(300);

// Try level 3
console.log('Testing spelling level 3...');
try {
  await page.evaluate(() => setSpellingLevel(3));
} catch (e) {
  console.log('setSpellingLevel(3) threw:', e.message);
}
await page.waitForTimeout(500);

const state = await page.evaluate(() => {
  const game = document.getElementById('spellingGame');
  const levelSelect = document.getElementById('spellingLevelSelect');
  const spellWord = document.getElementById('spellWord');
  const keyboard = document.getElementById('keyboard');
  return {
    gameVisible: game ? game.style.display !== 'none' : false,
    levelSelectHidden: levelSelect ? levelSelect.style.display === 'none' : false,
    wordSlots: spellWord ? spellWord.children.length : 0,
    keyboardKeys: keyboard ? keyboard.querySelectorAll('.kb-key').length : 0,
    spWords: typeof sp !== 'undefined' ? sp.words.length : -1,
    spWord: typeof sp !== 'undefined' ? sp.word : 'undefined',
    spLevel: typeof sp !== 'undefined' ? sp.level : -1,
  };
});

console.log('Result:', JSON.stringify(state, null, 2));
console.log('Errors:', errors.length ? errors.join('\n') : 'NONE');

if (state.spWords > 0 && state.wordSlots > 0 && state.keyboardKeys > 0) {
  console.log('\nSPELLING LEVEL 3: WORKING');
} else {
  console.log('\nSPELLING LEVEL 3: BROKEN');
}

await browser.close();
