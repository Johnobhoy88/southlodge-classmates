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

test('All script tags have valid JavaScript syntax', () => {
  const scriptBlocks = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
  scriptBlocks.forEach((block, i) => {
    const code = block.replace(/<\/?script[^>]*>/g, '');
    if (code.trim().length < 10) return; // skip empty/tiny scripts
    try {
      new Function(code);
    } catch (e) {
      throw new Error(`Script block ${i} has syntax error: ${e.message}`);
    }
  });
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
  'ClassmatesSessions',
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

// --- 7. Module API surface ---
console.log('\nModule API Surface:');

const MODULE_APIS = {
  'ClassmatesAppState': ['loadState', 'saveState', 'resetState', 'applyPlayProgress', 'applyStars', 'adaptiveCorrect', 'adaptiveWrong'],
  'ClassmatesPupils': ['listPupils', 'addPupil', 'removePupil'],
  'ClassmatesSettings': ['getSchoolName', 'setSchoolName', 'getStaffPassword'],
  'ClassmatesAttempts': ['listAttempts', 'recordAttempt'],
  'ClassmatesMastery': ['listClassPackMasteries', 'listInterventionSignals', 'getPupilOverview', 'getClassMasterySnapshot'],
  'ClassmatesSessions': ['getRecentSessions', 'getSessionsForPupil', 'aggregateSessionStats'],
  'ClassmatesTeacherSummary': ['getClassSummary', 'getPupilDetail', 'getTeacherHomeModel', 'getNeedsAttention'],
  'ClassmatesTeacherReports': ['buildPupilReportHtml', 'buildClassReportHtml', 'buildProgressCsv'],
  'ClassmatesSouthlodgeRacersPacks': ['listPacks', 'getPack', 'buildMissionWords', 'validatePack'],
};

Object.entries(MODULE_APIS).forEach(([mod, methods]) => {
  methods.forEach(method => {
    test(`${mod}.${method} exists`, () => {
      assert(
        html.includes(`${method}:`) || html.includes(`${method} =`) || html.includes(`function ${method}`),
        `Missing ${mod}.${method} in bundle`
      );
    });
  });
});

// --- 8. Game screens present ---
console.log('\nGame Screens:');

const GAME_SCREENS = [
  'spelling', 'maths', 'times', 'reading', 'daily',
  'phonics', 'grammar', 'vocab', 'dictation',
];

GAME_SCREENS.forEach(game => {
  test(`Game screen: ${game}`, () => {
    assert(
      html.includes(`startGame('${game}')`) || html.includes(`startGame("${game}")`),
      `Missing startGame('${game}') in bundle`
    );
  });
});

// --- 9. Storage safety ---
console.log('\nStorage Safety:');

test('Storage migration function present', () => {
  assert(html.includes('migrateStorage'), 'Missing migrateStorage function');
});

test('Backup reminder function present', () => {
  assert(html.includes('needsBackupReminder'), 'Missing needsBackupReminder function');
});

test('Storage quota function present', () => {
  assert(html.includes('getStorageUsage') || html.includes('storageGetUsage'), 'Missing storage usage function');
});

// --- 10. Extracted game modules ---
console.log('\nExtracted Game Modules:');

test('ClassmatesTimesTable module present', () => {
  assert(html.includes('ClassmatesTimesTable'), 'Missing ClassmatesTimesTable');
});

test('ClassmatesTimesTable.getPersonalBest exists', () => {
  assert(html.includes('getPersonalBest'), 'Missing getPersonalBest');
});

test('ClassmatesTimesTable.isTableCompleted exists', () => {
  assert(html.includes('isTableCompleted'), 'Missing isTableCompleted');
});

test('CfE Curriculum module present', () => {
  assert(html.includes('ClassmatesCfeCurriculum') || html.includes('CFE_OUTCOMES'), 'Missing CfE curriculum module');
});

test('Sessions module present', () => {
  assert(html.includes('ClassmatesSessions') || html.includes('getRecentSessions'), 'Missing sessions module');
});

test('Spelling data getters present', () => {
  assert(html.includes('getSpellingWords') && html.includes('getSpellingWordEmoji'), 'Missing spelling data getters');
});

// --- 11. Build completeness — every src JS file should be in the artifact ---
console.log('\nBuild Completeness:');

import { readdirSync } from 'fs';

function listSrcJsFiles(dir) {
  const results = [];
  try {
    const entries = readdirSync(resolve(__dirname, '..', dir), { withFileTypes: true });
    for (const entry of entries) {
      const path = dir + '/' + entry.name;
      if (entry.isDirectory()) {
        results.push(...listSrcJsFiles(path));
      } else if (entry.name.endsWith('.js')) {
        results.push(path);
      }
    }
  } catch (e) { /* dir doesn't exist */ }
  return results;
}

const srcJsFiles = listSrcJsFiles('src/scripts');
srcJsFiles.forEach(file => {
  const fileName = file.split('/').pop();
  test(`Source file bundled: ${fileName}`, () => {
    // Check that at least some unique content from this file appears in the artifact
    // We use the filename sans extension as a heuristic — most files define a window.Classmates* object
    const content = readFileSync(resolve(__dirname, '..', file), 'utf-8');
    // Find the first window.Classmates* or window.* assignment as a fingerprint
    const fingerprint = content.match(/window\.(Classmates\w+|hdashInit|hdashStop)/);
    if (fingerprint) {
      assert(html.includes(fingerprint[1]), `${fileName}: window.${fingerprint[1]} not found in bundle`);
    } else {
      // Fallback: check the file's first function or const name
      const funcMatch = content.match(/function\s+(\w{6,})/);
      if (funcMatch) {
        assert(html.includes(funcMatch[1]), `${fileName}: function ${funcMatch[1]} not found in bundle`);
      }
      // If no fingerprint found, skip silently (file may be inline data)
    }
  });
});

// --- 12. Platform modules ---
console.log('\nPlatform:');

test('Module manifest present', () => {
  assert(html.includes('ClassmatesModuleManifest') || html.includes('MODULE_MANIFEST'), 'Missing module manifest');
});

test('Platform runtime present', () => {
  assert(html.includes('ClassmatesPlatform'), 'Missing ClassmatesPlatform');
});

// --- Premium Game Components ---
console.log('\nPremium Game Components:');

// FX engines present
test('LiteracyFX engine present', () => {
  assert(html.includes('ClassmatesLiteracyFX'), 'Missing ClassmatesLiteracyFX');
});
test('NumeracyFX engine present', () => {
  assert(html.includes('ClassmatesNumeracyFX'), 'Missing ClassmatesNumeracyFX');
});
test('GeographyFX engine present', () => {
  assert(html.includes('ClassmatesGeographyFX'), 'Missing ClassmatesGeographyFX');
});
test('LandingFX engine present', () => {
  assert(html.includes('ClassmatesLandingFX'), 'Missing ClassmatesLandingFX');
});

// Per-game Canvas elements
const CANVAS_GAMES = [
  'dictation','vowels','anagram','phonics','wordfam','sentence',
  'punctuation','vocab','reading','grammar','rhyme',
  'maths','times','speed','bonds','missnum','placeval','telltime','money',
  'fractions','wordprob','shapes','datahandling','measure','sequence',
  'capitals','continents','weather','compass','flags'
];
// Spelling uses spellCanvas (legacy name)
test('Canvas element: spelling', () => {
  assert(html.includes('id="spellCanvas"'), 'Missing canvas for spelling');
});
CANVAS_GAMES.forEach(g => {
  test(`Canvas element: ${g}`, () => {
    assert(html.includes(`id="${g}Canvas"`), `Missing canvas for ${g}`);
  });
});

// FX mode switching
test('LiteracyFX setMode present', () => {
  assert(html.includes('ClassmatesLiteracyFX.setMode'), 'Missing LiteracyFX setMode');
});
test('NumeracyFX setMode present', () => {
  assert(html.includes('ClassmatesNumeracyFX.setMode'), 'Missing NumeracyFX setMode');
});
test('GeographyFX setMode present', () => {
  assert(html.includes('ClassmatesGeographyFX.setMode'), 'Missing GeographyFX setMode');
});

// Game theme classes
const THEMED_GAMES = [
  {id: 'dictation', cls: 'dict-game'},
  {id: 'vowels', cls: 'vowel-game'},
  {id: 'anagram', cls: 'ana-game'},
  {id: 'phonics', cls: 'ph-game'},
  {id: 'wordfam', cls: 'wf-game'},
  {id: 'sentence', cls: 'sent-game'},
  {id: 'punctuation', cls: 'punct-game'},
  {id: 'vocab', cls: 'voc-game'},
  {id: 'reading', cls: 'read-game'},
  {id: 'grammar', cls: 'gram-game'},
  {id: 'rhyme', cls: 'rhyme-game'},
  {id: 'speed', cls: 'speed-game'},
  {id: 'bonds', cls: 'bonds-game'},
  {id: 'missnum', cls: 'mn-game'},
  {id: 'placeval', cls: 'pv-game'},
  {id: 'telltime', cls: 'tt-game'},
  {id: 'money', cls: 'money-game'},
  {id: 'fractions', cls: 'frac-game'},
  {id: 'wordprob', cls: 'wp-game'},
  {id: 'shapes', cls: 'shapes-game'},
  {id: 'datahandling', cls: 'data-game'},
  {id: 'measure', cls: 'meas-game'},
  {id: 'sequence', cls: 'seq-game'},
  {id: 'capitals', cls: 'caps-game'},
  {id: 'continents', cls: 'cont-game'},
  {id: 'weather', cls: 'weath-game'},
  {id: 'compass', cls: 'comp-game'},
];
THEMED_GAMES.forEach(g => {
  test(`Theme class: ${g.cls}`, () => {
    assert(html.includes(g.cls), `Missing theme class ${g.cls} for ${g.id}`);
  });
});

// World Portal
test('World portal cards present', () => {
  assert(html.includes('portal-card portal-literacy'), 'Missing literacy portal card');
  assert(html.includes('portal-card portal-numeracy'), 'Missing numeracy portal card');
  assert(html.includes('portal-card portal-geography'), 'Missing geography portal card');
});

// Landing Canvas
test('Landing canvas present', () => {
  assert(html.includes('id="landingCanvas"'), 'Missing landing canvas');
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
