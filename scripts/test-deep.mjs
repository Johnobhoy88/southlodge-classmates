/**
 * Deep functional test — actually plays through games and verifies behavior.
 * Tests things the smoke tests can't: runtime state, DOM updates, game flow.
 */
import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appPath = path.resolve(__dirname, '..', 'dist', 'classmates.html');
const appUrl = 'file:///' + appPath.replace(/\\/g, '/');

let passed = 0;
let failed = 0;
const failures = [];

function report(name, ok, detail) {
  if (ok) { passed++; console.log(`  ✓ ${name}`); }
  else { failed++; console.log(`  ✗ ${name}: ${detail}`); failures.push({ name, detail }); }
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const jsErrors = [];
page.on('pageerror', e => jsErrors.push(e.message));

await page.goto(appUrl);
await page.waitForTimeout(500);

// === 1. Landing ===
console.log('\nLanding:');
report('Landing screen active', await page.evaluate(() => document.getElementById('landing')?.classList.contains('active')));
report('School name visible', (await page.textContent('#landing')).includes('South Lodge'));
report("Let's Learn button", await page.evaluate(() => !!document.querySelector('.btn-learn')));
report('Staff Access button', await page.evaluate(() => !!document.querySelector('.btn-staff')));

// === 2. Pupil Home ===
console.log('\nPupil Home:');
await page.evaluate(() => enterPupilHome());
await page.waitForTimeout(300);
report('Home screen active', await page.evaluate(() => document.getElementById('home')?.classList.contains('active')));
const cardCount = await page.evaluate(() => document.querySelectorAll('#home .subject-card').length);
report(`Game cards visible (${cardCount})`, cardCount >= 20, cardCount < 20 ? `only ${cardCount} cards` : '');
report('Stars display', await page.evaluate(() => !!document.getElementById('statStars')));
report('Coins display', await page.evaluate(() => !!document.getElementById('coinCount')));
report('Shop grid', await page.evaluate(() => document.getElementById('shopGrid')?.children.length > 0));

// === 3. Spelling full flow ===
console.log('\nSpelling Full Flow:');
await page.evaluate(() => startGame('spelling'));
await page.waitForTimeout(200);
report('Spelling screen active', await page.evaluate(() => document.getElementById('spelling')?.classList.contains('active')));
await page.evaluate(() => setSpellingLevel(1));
await page.waitForTimeout(300);
const spState = await page.evaluate(() => ({
  word: sp.word,
  lives: sp.lives,
  wordSlots: document.getElementById('spellWord')?.children.length,
  keyboard: document.getElementById('keyboard')?.querySelectorAll('.kb-key').length,
}));
report('Word loaded', !!spState.word, spState.word ? '' : 'sp.word is empty');
report(`Word slots (${spState.wordSlots})`, spState.wordSlots > 0);
report(`Keyboard keys (${spState.keyboard})`, spState.keyboard === 26, spState.keyboard !== 26 ? `got ${spState.keyboard}` : '');
report('Lives set', spState.lives > 0);

// Press correct letters to complete the word
const completed = await page.evaluate(() => {
  const word = sp.word;
  for (const ch of word) pressKey(ch);
  return sp.revealed.every(r => r);
});
report('Can complete word by pressing keys', completed);

// === 4. Maths full flow ===
console.log('\nMaths Full Flow:');
await page.evaluate(() => { showScreen('maths'); setMathsLevel(1); });
await page.waitForTimeout(300);
const maState = await page.evaluate(() => ({
  question: ma.question?.text,
  answer: ma.question?.answer,
  numpad: document.getElementById('numpad')?.querySelectorAll('.num-key').length,
}));
report('Maths question loaded', !!maState.question, maState.question ? '' : 'no question');
report(`Numpad keys (${maState.numpad})`, maState.numpad === 12);

// Submit correct answer
const mathCorrect = await page.evaluate(() => {
  const ans = String(ma.question.answer);
  for (const ch of ans) numpadPress(ch);
  numpadPress('enter');
  return ma.correct > 0;
});
report('Correct answer accepted', mathCorrect);

// === 5. Teacher Dashboard ===
console.log('\nTeacher Dashboard:');
await page.evaluate(() => showScreen('landing'));
await page.waitForTimeout(200);
await page.evaluate(() => showStaffLogin());
await page.waitForTimeout(200);
await page.evaluate(() => {
  document.getElementById('staffPwd').value = 'classmates2026';
  checkStaffPwd();
});
await page.waitForTimeout(300);
report('Teacher screen active', await page.evaluate(() => document.getElementById('teacher')?.classList.contains('active')));
report('Overview tab', await page.evaluate(() => !!document.getElementById('tp-overview')));
report('Class summary', await page.evaluate(() => !!document.getElementById('classSummary')));
report('Backup summary', await page.evaluate(() => !!document.getElementById('backupSummary')));

// Switch tabs
for (const tab of ['pupils', 'progress', 'assign', 'settings']) {
  await page.evaluate((t) => showTeacherTab(t, null), tab);
  await page.waitForTimeout(100);
  const active = await page.evaluate((t) => document.getElementById('tp-' + t)?.classList.contains('active'), tab);
  report(`Tab: ${tab}`, active);
}

// Add pupil
await page.evaluate(() => showTeacherTab('pupils', null));
await page.waitForTimeout(100);
await page.evaluate(() => {
  document.getElementById('newPupilInput').value = 'Test Pupil Red Team';
  addPupil();
});
await page.waitForTimeout(200);
const pupilAdded = await page.evaluate(() => document.getElementById('pupilList')?.textContent?.includes('Test Pupil Red Team'));
report('Pupil added', pupilAdded);

// Clean up
await page.evaluate(() => {
  const pupils = ClassmatesPupils.listPupils();
  if (pupils.includes('Test Pupil Red Team')) ClassmatesPupils.removePupil('Test Pupil Red Team');
});

// === 6. Southlodge Racers ===
console.log('\nSouthlodge Racers:');
await page.evaluate(() => { showScreen('home'); startGame('hdash'); });
await page.waitForTimeout(500);
const racerState = await page.evaluate(() => ({
  active: document.getElementById('hdash')?.classList.contains('active'),
  canvas: !!document.getElementById('hdash-canvas'),
  intro: document.getElementById('racerIntro')?.style.display !== 'none',
  startBtn: !!document.getElementById('racerIntroStart'),
}));
report('Racers screen active', racerState.active);
report('Canvas present', racerState.canvas);
report('Intro visible', racerState.intro);
report('Start button', racerState.startBtn);

// === 7. JS Errors ===
console.log('\nJS Errors:');
report(`No page errors (${jsErrors.length})`, jsErrors.length === 0, jsErrors.join('; '));

// === Summary ===
console.log(`\n${'='.repeat(50)}`);
console.log(`Deep test: ${passed} passed, ${failed} failed, ${passed + failed} total`);
if (failures.length > 0) {
  console.log('\nFAILURES:');
  failures.forEach(f => console.log(`  - ${f.name}: ${f.detail}`));
  console.log('\nDEEP TEST FAILED');
} else {
  console.log('\nDEEP TEST PASSED');
}

await browser.close();
process.exit(failed > 0 ? 1 : 0);
