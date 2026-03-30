(function(){
  let currentPupil = null;
  let activeScreenId = 'landing';

  function normalizePupilName(name) {
    const value = String(name == null ? '' : name).trim();
    return value || null;
  }

  function getCurrentPupil() {
    return currentPupil;
  }

  function setCurrentPupil(name) {
    currentPupil = normalizePupilName(name);
    return currentPupil;
  }

  function clearCurrentPupil() {
    currentPupil = null;
    return currentPupil;
  }

  function showScreen(id) {
    const nextId = String(id || '').trim();
    const screen = document.getElementById(nextId);
    if (!screen) return false;
    document.querySelectorAll('.screen').forEach(function(element){
      element.classList.remove('active');
    });
    screen.classList.add('active');
    activeScreenId = nextId;
    window.scrollTo(0, 0);
    return true;
  }

  function getActiveScreenId() {
    return activeScreenId;
  }

  const shellApi = Object.freeze({
    clearCurrentPupil: clearCurrentPupil,
    getActiveScreenId: getActiveScreenId,
    getCurrentPupil: getCurrentPupil,
    setCurrentPupil: setCurrentPupil,
    showScreen: showScreen
  });

  window.ClassmatesShell = shellApi;
  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerModule === 'function') {
    window.ClassmatesPlatform.registerModule('platform', 'shell', {
      owner: 'platform',
      exports: ['ClassmatesShell', 'showScreen', 'getActiveScreenId', 'getCurrentPupil', 'setCurrentPupil', 'clearCurrentPupil']
    });
  }
  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerService === 'function') {
    window.ClassmatesPlatform.registerService('shell', shellApi);
  }
})();
