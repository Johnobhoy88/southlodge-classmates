(function(){
  const ATTEMPTS_KEY = 'classmates_attempts';
  const MAX_ATTEMPTS = 500;

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
    if (!source.gameId) return null;

    const correct = typeof source.correct === 'number' && Number.isFinite(source.correct) ? source.correct : null;
    const total = typeof source.total === 'number' && Number.isFinite(source.total) ? source.total : null;
    const stars = typeof source.stars === 'number' && Number.isFinite(source.stars) ? source.stars : 0;

    const attempt = {
      id: createAttemptId(),
      recordedAt: new Date().toISOString(),
      pupilName: source.pupilName || null,
      gameId: source.gameId,
      category: source.category || null,
      title: source.title || source.gameId,
      subtitle: source.subtitle || '',
      correct: correct,
      total: total,
      stars: stars,
      scorePercent: total && total > 0 && correct !== null ? Math.round(correct / total * 100) : null,
      assignment: source.assignment || null
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
