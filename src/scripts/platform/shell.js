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

  window.ClassmatesShell = {
    clearCurrentPupil: clearCurrentPupil,
    getActiveScreenId: getActiveScreenId,
    getCurrentPupil: getCurrentPupil,
    setCurrentPupil: setCurrentPupil,
    showScreen: showScreen
  };
})();
