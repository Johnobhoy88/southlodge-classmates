(function(){
  const ASSIGNMENT_KEY = 'classmates_assignment';
  const FLAGSHIP_ACTIVITY_ID = 'southlodgeracers';

  function normalizeActivityId(value) {
    const text = String(value || '').trim().toLowerCase();
    if (!text) return '';
    if (text === 'hdash' || text === FLAGSHIP_ACTIVITY_ID) return FLAGSHIP_ACTIVITY_ID;
    return text;
  }

  function normalizeStageBand(value) {
    const text = String(value || '').trim().toLowerCase();
    if (text === '1' || text === 'early') return 'Early';
    if (text === '2' || text === 'first') return 'First';
    if (text === '3' || text === 'second') return 'Second';
    return 'First';
  }

  function normalizeMissionLength(value) {
    const length = parseInt(value, 10);
    if (length === 5 || length === 7 || length === 9) return length;
    return 7;
  }

  function getDefaultPackId(stageBand) {
    if (!window.ClassmatesSouthlodgeRacersPacks) return '';
    const pack = ClassmatesSouthlodgeRacersPacks.getDefaultPack(stageBand);
    return pack ? pack.id : '';
  }

  function normalizeAssignment(input) {
    const source = input && typeof input === 'object' ? input : {};
    const activityId = normalizeActivityId(source.activityId || source.activity);
    if (!activityId) return null;

    if (activityId === FLAGSHIP_ACTIVITY_ID) {
      const stageBand = normalizeStageBand(source.stageBand || source.level);
      const requestedPackId = String(source.packId || '').trim();
      const pack = window.ClassmatesSouthlodgeRacersPacks ? ClassmatesSouthlodgeRacersPacks.getPack(requestedPackId) : null;
      const packId = pack && pack.stageBand === stageBand ? pack.id : getDefaultPackId(stageBand);

      return {
        activityId: FLAGSHIP_ACTIVITY_ID,
        stageBand: stageBand,
        packId: packId,
        missionLength: normalizeMissionLength(source.missionLength),
        message: String(source.message || '').trim(),
        assignedAt: source.assignedAt || source.date || new Date().toISOString()
      };
    }

    return {
      activityId: activityId,
      stageBand: source.stageBand || null,
      packId: source.packId || null,
      missionLength: source.missionLength || null,
      message: String(source.message || '').trim(),
      assignedAt: source.assignedAt || source.date || new Date().toISOString()
    };
  }

  function getAssignment() {
    return normalizeAssignment(storageGetJson(ASSIGNMENT_KEY, null));
  }

  function saveAssignment(assignment) {
    const next = normalizeAssignment(assignment);
    if (!next) return null;
    storageSetJson(ASSIGNMENT_KEY, next);
    return next;
  }

  function clearAssignment() {
    storageRemoveItem(ASSIGNMENT_KEY);
  }

  function isFlagshipAssignment(assignment) {
    const normalized = normalizeAssignment(assignment);
    return !!(normalized && normalized.activityId === FLAGSHIP_ACTIVITY_ID);
  }

  function getAssignmentLaunchId(assignment) {
    const normalized = normalizeAssignment(assignment);
    if (!normalized) return '';
    return normalized.activityId === FLAGSHIP_ACTIVITY_ID ? 'hdash' : normalized.activityId;
  }

  window.ClassmatesAssignments = {
    getAssignment: getAssignment,
    getAssignmentLaunchId: getAssignmentLaunchId,
    isFlagshipAssignment: isFlagshipAssignment,
    normalizeActivityId: normalizeActivityId,
    normalizeAssignment: normalizeAssignment,
    normalizeMissionLength: normalizeMissionLength,
    normalizeStageBand: normalizeStageBand,
    saveAssignment: saveAssignment,
    clearAssignment: clearAssignment
  };
})();
