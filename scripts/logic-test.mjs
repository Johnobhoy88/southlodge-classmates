/**
 * Logic tests for classmates modules.
 * Tests actual function behaviour, not just artifact presence.
 * Runs source files in a minimal mock environment.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

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

// --- Create a mock window/global for module loading ---
function createMockGlobal() {
  return {
    window: {},
    localStorage: {
      _store: {},
      getItem(k) { return this._store[k] || null; },
      setItem(k, v) { this._store[k] = String(v); },
      removeItem(k) { delete this._store[k]; },
      get length() { return Object.keys(this._store).length; },
      key(i) { return Object.keys(this._store)[i] || null; },
    },
    document: { createElement: () => ({ click() {}, href: '', download: '' }) },
    URL: { createObjectURL: () => 'blob:', revokeObjectURL: () => {} },
    Blob: function(parts, opts) { this.parts = parts; },
    Date,
    Math,
    JSON,
    Array,
    Object,
    String,
    Number,
    parseInt,
    parseFloat,
    isNaN,
    console,
    setTimeout: (fn) => fn(),
    speechSynthesis: null,
  };
}

function loadModule(filePath, ctx) {
  const code = readFileSync(resolve(root, filePath), 'utf-8');
  const script = new vm.Script(code, { filename: filePath });
  script.runInContext(ctx);
}

// --- Test 1: Storage module ---
console.log('\nStorage Module:');
{
  const g = createMockGlobal();
  g.window = g;
  const ctx = vm.createContext(g);

  loadModule('src/scripts/storage.js', ctx);

  test('storageIsAvailable returns true', () => {
    assert(g.storageIsAvailable(), 'Storage should be available with mock localStorage');
  });

  test('storageSetJson + storageGetJson round-trip', () => {
    g.storageSetJson('classmates_test', { name: 'Alice', score: 42 });
    const result = g.storageGetJson('classmates_test', null);
    assert(result && result.name === 'Alice', 'Should round-trip JSON');
    assert(result.score === 42, 'Should preserve number values');
  });

  test('storageListAppKeys returns classmates_ keys', () => {
    g.storageSetJson('classmates_a', 1);
    g.storageSetJson('classmates_b', 2);
    g.storageSetJson('other_key', 3);
    const keys = g.storageListAppKeys();
    assert(keys.includes('classmates_a'), 'Should include classmates_a');
    assert(keys.includes('classmates_b'), 'Should include classmates_b');
    assert(!keys.includes('other_key'), 'Should not include non-classmates keys');
  });

  test('storageClearAppData removes only classmates keys', () => {
    g.storageClearAppData();
    assert(g.storageGetJson('classmates_a', null) === null, 'classmates_a should be cleared');
    assert(g.localStorage._store['other_key'] === '3', 'other_key should survive');
  });

  test('storageGetUsage returns usage object', () => {
    g.storageSetJson('classmates_x', { data: 'hello' });
    const usage = g.storageGetUsage();
    assert(usage.available === true, 'Should report available');
    assert(typeof usage.usedKB === 'number', 'Should report KB used');
  });

  test('needsBackupReminder returns boolean', () => {
    const result = g.storageNeedsBackupReminder();
    assert(typeof result === 'boolean', 'Should return boolean');
  });
}

// --- Test 2: Spelling module ---
console.log('\nSpelling Module:');
{
  const g = createMockGlobal();
  g.window = g;
  const ctx = vm.createContext(g);

  loadModule('src/scripts/games/spelling.js', ctx);

  test('ClassmatesSpelling exports SPELLING', () => {
    assert(g.ClassmatesSpelling, 'ClassmatesSpelling should exist');
    assert(g.ClassmatesSpelling.SPELLING, 'Should have SPELLING data');
  });

  test('SPELLING has 3 levels', () => {
    const s = g.ClassmatesSpelling.SPELLING;
    assert(s[1] && s[2] && s[3], 'Should have levels 1, 2, 3');
  });

  test('Each spelling word has w and h properties', () => {
    const words = g.ClassmatesSpelling.SPELLING[1];
    assert(words.length > 0, 'Level 1 should have words');
    assert(words[0].w && words[0].h, 'Each word should have w (word) and h (hint)');
  });

  test('WORD_EMOJI is a mapping object', () => {
    assert(g.ClassmatesSpelling.WORD_EMOJI, 'Should have WORD_EMOJI');
    assert(typeof g.ClassmatesSpelling.WORD_EMOJI === 'object', 'Should be an object');
    assert(g.ClassmatesSpelling.WORD_EMOJI['cat'], 'Should have common words like cat');
  });
}

// --- Test 3: Times Tables module ---
console.log('\nTimes Tables Module:');
{
  const g = createMockGlobal();
  g.window = g;
  const ctx = vm.createContext(g);

  loadModule('src/scripts/games/times-tables.js', ctx);

  test('ClassmatesTimesTable exports', () => {
    assert(g.ClassmatesTimesTable, 'ClassmatesTimesTable should exist');
  });

  test('getPersonalBest returns null for no data', () => {
    const result = g.ClassmatesTimesTable.getPersonalBest({}, 5);
    assert(result === null, 'Should be null with no data');
  });

  test('getPersonalBest returns time when set', () => {
    const state = { ttPersonalBests: { 5: 25000 } };
    assert(g.ClassmatesTimesTable.getPersonalBest(state, 5) === 25000, 'Should return 25000');
  });

  test('isTableCompleted works', () => {
    const state = { ttCompleted: [2, 5, 10] };
    assert(g.ClassmatesTimesTable.isTableCompleted(state, 5) === true, '5 should be completed');
    assert(g.ClassmatesTimesTable.isTableCompleted(state, 3) === false, '3 should not be completed');
  });

  test('getCompletionCount works', () => {
    const state = { ttCompleted: [2, 5, 10] };
    assert(g.ClassmatesTimesTable.getCompletionCount(state) === 3, 'Should be 3');
  });
}

// --- Summary ---
console.log(`\n${'='.repeat(40)}`);
console.log(`Logic tests: ${passed} passed, ${failed} failed, ${passed + failed} total`);

if (failed > 0) {
  console.log('\nLOGIC TESTS FAILED');
  process.exit(1);
} else {
  console.log('\nLOGIC TESTS PASSED');
}
