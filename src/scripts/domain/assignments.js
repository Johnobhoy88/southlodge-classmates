(function(){
  const ASSIGNMENT_KEY = 'classmates_assignment';

  function normalizeAssignment(input) {
    const source = input && typeof input === 'object' ? input : {};
    const activity = String(source.activity || '').trim();
    if (!activity) return null;

    return {
      activity: activity,
      level: String(source.level || '2'),
      message: String(source.message || '').trim(),
      date: source.date || new Date().toDateString()
    };
  }

  function getAssignment() {
    return storageGetJson(ASSIGNMENT_KEY, null);
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

  window.ClassmatesAssignments = {
    getAssignment: getAssignment,
    saveAssignment: saveAssignment,
    clearAssignment: clearAssignment
  };
})();
