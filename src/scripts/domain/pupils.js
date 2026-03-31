(function(){
  const PUPILS_KEY = 'classmates_pupils';

  function normalizeName(name) {
    return String(name || '').trim();
  }

  function stateKey(name) {
    return 'classmates_state_' + name;
  }

  function avatarKey(name) {
    return 'classmates_avatar_' + name;
  }

  function uniqueNames(names) {
    const seen = new Set();
    const result = [];
    names.forEach(function(name){
      const normalized = normalizeName(name);
      if (!normalized || seen.has(normalized)) return;
      seen.add(normalized);
      result.push(normalized);
    });
    return result;
  }

  function listPupils() {
    return uniqueNames(storageGetJson(PUPILS_KEY, []));
  }

  function savePupils(pupils) {
    const next = uniqueNames(Array.isArray(pupils) ? pupils : []);
    storageSetJson(PUPILS_KEY, next);
    return next;
  }

  function addPupil(name) {
    const normalized = normalizeName(name);
    if (!normalized) {
      return { added: false, pupils: listPupils(), name: '' };
    }
    const pupils = listPupils();
    if (pupils.includes(normalized)) {
      return { added: false, pupils: pupils, name: normalized };
    }
    pupils.push(normalized);
    return { added: true, pupils: savePupils(pupils), name: normalized };
  }

  function addPupils(names) {
    const pupils = listPupils();
    let added = 0;
    uniqueNames(Array.isArray(names) ? names : []).forEach(function(name){
      if (pupils.includes(name)) return;
      pupils.push(name);
      added++;
    });
    return { added: added, pupils: savePupils(pupils) };
  }

  function removePupil(name) {
    const normalized = normalizeName(name);
    if (!normalized) return listPupils();
    const pupils = savePupils(listPupils().filter(function(pupil){
      return pupil !== normalized;
    }));
    storageRemoveItem(stateKey(normalized));
    storageRemoveItem(avatarKey(normalized));
    return pupils;
  }

  function resetPupilProgress(name) {
    const normalized = normalizeName(name);
    if (!normalized) return false;
    storageRemoveItem(stateKey(normalized));
    return true;
  }

  function getPupilState(name) {
    const normalized = normalizeName(name);
    if (!normalized) return null;
    return storageGetJson(stateKey(normalized), null);
  }

  function savePupilState(name, pupilState) {
    const normalized = normalizeName(name);
    if (!normalized) return null;
    storageSetJson(stateKey(normalized), pupilState);
    return pupilState;
  }

  window.ClassmatesPupils = {
    listPupils: listPupils,
    savePupils: savePupils,
    addPupil: addPupil,
    addPupils: addPupils,
    removePupil: removePupil,
    resetPupilProgress: resetPupilProgress,
    getPupilState: getPupilState,
    savePupilState: savePupilState,
    getStateKey: stateKey
  };
})();
