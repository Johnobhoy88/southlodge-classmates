/**
 * Smoke test for classmates offline artifact.
 *
 * Checks:
 * 1. Build artifact exists and is self-contained
 * 2. No external URLs (offline contract)
 * 3. All expected modules are present in the bundle
 * 4. File size is within acceptable range
 * 5. Key DOM elements exist in markup
 * 6. Storage API surface is intact
 * 7. Teacher module API surface is intact
 */

import { readFileSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARTIFACT = resolve(__dirname, '..', 'dist', 'classmates.html');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    failed++;
    console.log(`  ✗ ${name}`);
    console.log(`    ${e.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// --- Load artifact ---

let html;
let size;
try {
  html = readFileSync(ARTIFACT, 'utf-8');
  size = statSync(ARTIFACT).size;
} catch (e) {
  console.error(`Cannot read artifact at ${ARTIFACT}. Run 'npm run build' first.`);
  process.exit(1);
}

console.log(`\nSmoke testing: ${ARTIFACT}`);
console.log(`Artifact size: ${(size / 1024 / 1024).toFixed(2)} MB\n`);

// --- 1. Artifact integrity ---
console.log('Artifact Integrity:');

test('File exists and is non-empty', () => {
  assert(size > 0, 'Artifact is empty');
});

test('Is valid HTML document', () => {
  assert(html.includes('<!DOCTYPE html>') || html.includes('<!doctype html>'), 'Missing DOCTYPE');
  assert(html.includes('<html'), 'Missing html tag');
  assert(html.includes('</html>'), 'Missing closing html tag');
});

test('Size is under 5 MB', () => {
  assert(size < 5 * 1024 * 1024, `Artifact is ${(size / 1024 / 1024).toFixed(2)} MB — too large`);
});

test('Size is over 500 KB (sanity check)', () => {
  assert(size > 500 * 1024, `Artifact is only ${(size / 1024).toFixed(0)} KB — suspiciously small`);
});

// --- 2. Offline contract ---
console.log('\nOffline Contract:');

const BANNED_PATTERNS = [
  /https?:\/\/fonts\.googleapis\.com/,
  /https?:\/\/cdnjs\.cloudflare\.com/,
  /https?:\/\/cdn\.jsdelivr\.net/,
  /https?:\/\/unpkg\.com/,
  /https?:\/\/ajax\.googleapis\.com/,
  /<link[^>]+rel=["']stylesheet["'][^>]+href=["']https?:/i,
  /<script[^>]+src=["']https?:/i,
];

BANNED_PATTERNS.forEach(pattern => {
  test(`No external dependency: ${pattern.source.substring(0, 40)}`, () => {
    assert(!pattern.test(html), `Found banned external URL matching ${pattern}`);
  });
});

test('No fetch() calls to external URLs', () => {
  const fetchMatches = html.match(/fetch\s*\(\s*['"]https?:\/\//g);
  assert(!fetchMatches, `Found ${fetchMatches?.length} external fetch calls`);
});

// --- 3. Module presence ---
console.log('\nModule Presence:');

const EXPECTED_MODULES = [
  'ClassmatesAppState',
  'ClassmatesPupils',
  'ClassmatesSettings',
  'ClassmatesAttempts',
  'ClassmatesAssignments',
  'ClassmatesCustomQuiz',
  'ClassmatesMastery',
  'ClassmatesSouthlodgeRacersPacks',
  'ClassmatesTeacherSummary',
  'ClassmatesTeacherReports',
  'ClassmatesTeacherAuthoring',
  'ClassmatesTeacherTools',
];

EXPECTED_MODULES.forEach(mod => {
  test(`Module present: ${mod}`, () => {
    assert(html.includes(`window.${mod}`), `Missing window.${mod} in bundle`);
  });
});

// --- 4. Key DOM elements ---
console.log('\nKey DOM Elements:');

const EXPECTED_IDS = [
  'landing',
  'teacher',
  'home',
  'spelling',
  'maths',
  'racerStage',
  'classSummary',
  'progressArea',
  'pupilDetailSection',
  'pupilList',
  'backupSummary',
];

EXPECTED_IDS.forEach(id => {
  test(`DOM element: #${id}`, () => {
    assert(html.includes(`id="${id}"`), `Missing element with id="${id}"`);
  });
});

// --- 5. Key functions ---
console.log('\nKey Functions:');

const EXPECTED_FUNCTIONS = [
  'showScreen',
  'renderTeacher',
  'startGame',
  'addPupil',
  'exportAppBackup',
  'handleBackupImport',
  'storageGetJson',
  'storageSetJson',
];

EXPECTED_FUNCTIONS.forEach(fn => {
  test(`Function present: ${fn}`, () => {
    assert(html.includes(`function ${fn}`) || html.includes(`${fn}=function`) || html.includes(`${fn}(`), `Missing function ${fn}`);
  });
});

// --- 6. Three.js presence (for Southlodge Racers) ---
console.log('\nThree.js:');

test('Three.js library embedded', () => {
  assert(html.includes('THREE') && html.includes('WebGLRenderer'), 'Three.js not found in bundle');
});

// --- Summary ---
console.log(`\n${'='.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);

if (failed > 0) {
  console.log('\nSMOKE TEST FAILED');
  process.exit(1);
} else {
  console.log('\nSMOKE TEST PASSED');
}
