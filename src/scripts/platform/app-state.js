(function(){
  const DEFAULT_STATE = {
    stars: 0,
    games: 0,
    streak: 0,
    lastPlayed: null,
    spellingCorrect: 0,
    mathsCorrect: 0,
    storiesRead: [],
    ttCompleted: [],
    dailyCompleted: null,
    achievements: [],
    ttPersonalBests: {},
    adaptive: {},
    weakItems: {},
    coins: 0,
    unlockedRewards: [],
    weeklyGames: 0,
    weeklyGoalReset: null,
    powerups: {},
    journeyStop: 0
  };

  function cloneState(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function ensureStateShape(savedState) {
    const next = cloneState(DEFAULT_STATE);
    if (savedState && typeof savedState === 'object') {
      Object.assign(next, savedState);
    }
    if (!next.powerups || typeof next.powerups !== 'object') next.powerups = {};
    if (!next.adaptive || typeof next.adaptive !== 'object') next.adaptive = {};
    if (!next.weakItems || typeof next.weakItems !== 'object') next.weakItems = {};
    return next;
  }

  function ensureMutableState(state) {
    if (!state || typeof state !== 'object') {
      return ensureStateShape(state);
    }
    const normalized = ensureStateShape(state);
    Object.keys(normalized).forEach(function(key){
      state[key] = normalized[key];
    });
    return state;
  }

  function getStateKey(pupilName) {
    return pupilName ? 'classmates_state_' + pupilName : 'classmates_state';
  }

  function updateStreak(state) {
    const next = ensureMutableState(state);
    const today = new Date().toDateString();
    if (next.lastPlayed) {
      const diff = Math.floor((new Date(today) - new Date(new Date(next.lastPlayed).toDateString())) / 864e5);
      if (diff > 1) next.streak = 0;
    }
    return next;
  }

  function loadState(pupilName) {
    const savedState = storageGetJson(getStateKey(pupilName), null);
    return updateStreak(savedState);
  }

  function saveState(pupilName, state) {
    const next = ensureStateShape(state);
    storageSetJson(getStateKey(pupilName), next);
    return next;
  }

  function createDefaultState() {
    return cloneState(DEFAULT_STATE);
  }

  function resetState(pupilName) {
    const next = createDefaultState();
    saveState(pupilName, next);
    return next;
  }

  function applyPlayProgress(state) {
    const next = ensureMutableState(state);
    const today = new Date().toDateString();
    if (next.lastPlayed !== today) {
      const last = next.lastPlayed ? new Date(next.lastPlayed) : null;
      if (last) {
        const diff = Math.floor((new Date(today) - new Date(last.toDateString())) / 864e5);
        next.streak = diff === 1 ? next.streak + 1 : 1;
      } else {
        next.streak = 1;
      }
      next.lastPlayed = today;
    }
    next.games++;
    next.weeklyGames = (next.weeklyGames || 0) + 1;
    return next;
  }

  function applyStars(state, amount) {
    const next = ensureMutableState(state);
    next.stars += amount;
    return next;
  }

  function adaptiveCorrect(state, topic) {
    const next = ensureMutableState(state);
    if (!next.adaptive[topic]) next.adaptive[topic] = { streak: 0, level: 1 };
    const adaptiveState = next.adaptive[topic];
    adaptiveState.streak = Math.max(adaptiveState.streak, 0) + 1;
    if (adaptiveState.streak >= 3 && adaptiveState.level < 3) {
      adaptiveState.level++;
      adaptiveState.streak = 0;
      return 'up';
    }
    return null;
  }

  function adaptiveWrong(state, topic) {
    const next = ensureMutableState(state);
    if (!next.adaptive[topic]) next.adaptive[topic] = { streak: 0, level: 1 };
    const adaptiveState = next.adaptive[topic];
    adaptiveState.streak = Math.min(adaptiveState.streak, 0) - 1;
    if (adaptiveState.streak <= -2 && adaptiveState.level > 1) {
      adaptiveState.level--;
      adaptiveState.streak = 0;
      return 'down';
    }
    return null;
  }

  function addWeakItem(state, topic, item) {
    const next = ensureMutableState(state);
    if (!next.weakItems[topic]) next.weakItems[topic] = [];
    const items = next.weakItems[topic];
    if (items.find(function(existing){
      return JSON.stringify(existing) === JSON.stringify(item);
    })) {
      return next;
    }
    items.push(item);
    if (items.length > 20) items.shift();
    return next;
  }

  function getWeakItems(state, topic, count) {
    const next = ensureMutableState(state);
    if (!next.weakItems[topic]) return [];
    const items = next.weakItems[topic].slice();
    for (let index = items.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      const current = items[index];
      items[index] = items[swapIndex];
      items[swapIndex] = current;
    }
    return items.slice(0, count);
  }

  function clearWeakItem(state, topic, item) {
    const next = ensureMutableState(state);
    if (!next.weakItems[topic]) return next;
    next.weakItems[topic] = next.weakItems[topic].filter(function(existing){
      return JSON.stringify(existing) !== JSON.stringify(item);
    });
    return next;
  }

  const appStateApi = Object.freeze({
    createDefaultState: createDefaultState,
    getStateKey: getStateKey,
    loadState: loadState,
    saveState: saveState,
    resetState: resetState,
    updateStreak: updateStreak,
    applyPlayProgress: applyPlayProgress,
    applyStars: applyStars,
    adaptiveCorrect: adaptiveCorrect,
    adaptiveWrong: adaptiveWrong,
    addWeakItem: addWeakItem,
    getWeakItems: getWeakItems,
    clearWeakItem: clearWeakItem
  });

  window.ClassmatesAppState = appStateApi;
  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerModule === 'function') {
    window.ClassmatesPlatform.registerModule('platform', 'app-state', {
      owner: 'platform',
      exports: ['ClassmatesAppState', 'loadState', 'saveState', 'resetState', 'applyPlayProgress', 'applyStars']
    });
  }
  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerService === 'function') {
    window.ClassmatesPlatform.registerService('appState', appStateApi);
  }
})();
