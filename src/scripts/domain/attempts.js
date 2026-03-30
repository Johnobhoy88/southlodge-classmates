(function(){
  const ATTEMPTS_KEY = 'classmates_attempts';
  const MAX_ATTEMPTS = 500;

  function sanitizeCount(value) {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  function sanitizeErrorPatternCounts(value) {
    const source = value && typeof value === 'object' ? value : {};
    const next = {};
    Object.keys(source).forEach(function(key){
      const count = parseInt(source[key], 10);
      if (!key || !Number.isFinite(count) || count <= 0) return;
      next[String(key)] = count;
    });
    return next;
  }

  function normalizeAssignment(value) {
    if (!window.ClassmatesAssignments) return value || null;
    return ClassmatesAssignments.normalizeAssignment(value);
  }

  function listAttempts() {
    const attempts = storageGetJson(ATTEMPTS_KEY, []);
    return Array.isArray(attempts) ? attempts : [];
  }

  function saveAttempts(attempts) {
    const next = Array.isArray(attempts) ? attempts.slice(-MAX_ATTEMPTS) : [];
    storageSetJson(ATTEMPTS_KEY, next);
    return next;
  }

  function createAttemptId() {
    return 'att_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function recordAttempt(input) {
    const source = input && typeof input === 'object' ? input : {};
    const activityId = window.ClassmatesAssignments
      ? ClassmatesAssignments.normalizeActivityId(source.activityId || source.gameId)
      : String(source.activityId || source.gameId || '').trim().toLowerCase();
    const gameId = String(source.gameId || (activityId === 'southlodgeracers' ? 'hdash' : activityId) || '').trim();
    if (!activityId || !gameId) return null;

    const correct = sanitizeCount(source.correct);
    const total = sanitizeCount(source.total);
    const stars = typeof source.stars === 'number' && Number.isFinite(source.stars) ? source.stars : 0;
    const assignment = normalizeAssignment(source.assignment || null);

    const attempt = {
      id: createAttemptId(),
      recordedAt: new Date().toISOString(),
      pupilName: source.pupilName || null,
      gameId: gameId,
      activityId: activityId,
      category: source.category || (activityId === 'southlodgeracers' ? 'literacy' : null),
      title: source.title || (activityId === 'southlodgeracers' ? 'Southlodge Racers' : gameId),
      subtitle: source.subtitle || '',
      stageBand: source.stageBand || (assignment ? assignment.stageBand : null) || null,
      packId: source.packId || (assignment ? assignment.packId : null) || null,
      missionId: source.missionId || null,
      correct: correct,
      total: total,
      stars: stars,
      scorePercent: total && total > 0 && correct !== null ? Math.round(correct / total * 100) : null,
      errorPatternCounts: sanitizeErrorPatternCounts(source.errorPatternCounts),
      assignment: assignment
    };

    const attempts = listAttempts();
    attempts.push(attempt);
    saveAttempts(attempts);
    return attempt;
  }

  function getRecentAttempts(limit) {
    const max = typeof limit === 'number' && limit > 0 ? limit : 20;
    return listAttempts().slice(-max).reverse();
  }

  window.ClassmatesAttempts = {
    listAttempts: listAttempts,
    getRecentAttempts: getRecentAttempts,
    recordAttempt: recordAttempt
  };
})();
