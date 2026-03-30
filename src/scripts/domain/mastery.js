(function(){
  const ACTIVITY_ID = 'southlodgeracers';

  function toNumber(value, fallback) {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  }

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function getAttempts() {
    if (!window.ClassmatesAttempts) return [];
    return safeArray(ClassmatesAttempts.listAttempts()).filter(function(attempt){
      return attempt && attempt.activityId === ACTIVITY_ID;
    });
  }

  function sortByRecordedAtDescending(items) {
    return items.slice().sort(function(left, right){
      return String(right.recordedAt || '').localeCompare(String(left.recordedAt || ''));
    });
  }

  function getPackMeta(packId) {
    if (!window.ClassmatesSouthlodgeRacersPacks) return null;
    return ClassmatesSouthlodgeRacersPacks.getPack(packId);
  }

  function getRecentTrend(accuracies) {
    const values = safeArray(accuracies).filter(function(value){
      return typeof value === 'number' && Number.isFinite(value);
    });
    if (values.length < 2) return 'Starting';
    const delta = values[values.length - 1] - values[0];
    if (delta >= 10) return 'Improving';
    if (delta <= -10) return 'Falling';
    return 'Steady';
  }

  function getStatus(accuracy, attemptCount) {
    if (!attemptCount) return 'No data';
    if (accuracy >= 95) return 'Secure';
    if (accuracy < 60) return 'Needs support';
    if (accuracy < 85 || attemptCount < 2) return 'Watch';
    return 'Secure';
  }

  function getDominantErrors(errorCounts) {
    const entries = Object.keys(errorCounts || {}).map(function(key){
      return {
        key: key,
        count: toNumber(errorCounts[key], 0)
      };
    }).filter(function(entry){
      return entry.count > 0;
    }).sort(function(left, right){
      return right.count - left.count;
    });

    return entries.slice(0, 3).map(function(entry){
      const label = window.ClassmatesSouthlodgeRacersPacks
        ? ClassmatesSouthlodgeRacersPacks.getErrorLabel(entry.key)
        : entry.key;
      return {
        key: entry.key,
        label: label,
        count: entry.count
      };
    });
  }

  function aggregateAttempts(attempts) {
    const recentAccuracies = [];
    const errorCounts = {};
    let correct = 0;
    let total = 0;

    attempts.forEach(function(attempt){
      const attemptCorrect = toNumber(attempt.correct, 0);
      const attemptTotal = toNumber(attempt.total, 0);
      const attemptAccuracy = attemptTotal > 0 ? Math.round((attemptCorrect / attemptTotal) * 100) : 0;

      correct += attemptCorrect;
      total += attemptTotal;
      recentAccuracies.push(attemptAccuracy);

      Object.keys(attempt.errorPatternCounts || {}).forEach(function(key){
        errorCounts[key] = toNumber(errorCounts[key], 0) + toNumber(attempt.errorPatternCounts[key], 0);
      });
    });

    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return {
      accuracy: accuracy,
      attemptCount: attempts.length,
      correct: correct,
      total: total,
      recentTrend: getRecentTrend(recentAccuracies.slice(-3)),
      status: getStatus(accuracy, attempts.length),
      commonErrors: getDominantErrors(errorCounts)
    };
  }

  function buildPackSummary(pupilName, packId) {
    const attempts = sortByRecordedAtDescending(getAttempts().filter(function(attempt){
      return attempt.pupilName === pupilName && attempt.packId === packId;
    }));
    const pack = getPackMeta(packId);
    const stats = aggregateAttempts(attempts);

    return {
      pupilName: pupilName,
      activityId: ACTIVITY_ID,
      packId: packId,
      packTitle: pack ? pack.title : packId,
      shortTitle: pack ? pack.shortTitle : packId,
      stageBand: pack ? pack.stageBand : (attempts[0] && attempts[0].stageBand) || 'First',
      skillFocus: pack ? pack.skillFocus : '',
      cfeOutcomeLabels: pack ? safeArray(pack.cfeOutcomeLabels) : [],
      accent: pack ? pack.accent : '#11998e',
      attemptCount: stats.attemptCount,
      accuracy: stats.accuracy,
      correct: stats.correct,
      total: stats.total,
      recentTrend: stats.recentTrend,
      status: stats.status,
      commonErrors: stats.commonErrors,
      lastPlayed: attempts[0] ? attempts[0].recordedAt : null
    };
  }

  function listPupilPackMasteries(pupilName) {
    const attempts = getAttempts().filter(function(attempt){
      return attempt.pupilName === pupilName;
    });
    const packIds = Array.from(new Set(attempts.map(function(attempt){
      return attempt.packId;
    }).filter(Boolean)));

    return packIds.map(function(packId){
      return buildPackSummary(pupilName, packId);
    }).sort(function(left, right){
      if (left.stageBand !== right.stageBand) {
        return left.stageBand.localeCompare(right.stageBand);
      }
      return left.packTitle.localeCompare(right.packTitle);
    });
  }

  function getPupilOverview(pupilName) {
    const packMasteries = listPupilPackMasteries(pupilName);
    const recentAttempts = listRecentFlagshipAttempts(5).filter(function(attempt){
      return attempt.pupilName === pupilName;
    });
    const weakest = packMasteries.slice().sort(function(left, right){
      if (left.status !== right.status) return left.status.localeCompare(right.status);
      return left.accuracy - right.accuracy;
    })[0] || null;

    return {
      pupilName: pupilName,
      packMasteries: packMasteries,
      recentAttempts: recentAttempts,
      weakestPack: weakest
    };
  }

  function listClassPackMasteries() {
    const attempts = getAttempts();
    const grouped = {};

    attempts.forEach(function(attempt){
      if (!attempt.packId) return;
      const key = attempt.packId;
      if (!grouped[key]) {
        grouped[key] = {
          packId: attempt.packId,
          pupilNames: {},
          attempts: []
        };
      }
      grouped[key].pupilNames[attempt.pupilName || 'Unknown'] = true;
      grouped[key].attempts.push(attempt);
    });

    return Object.keys(grouped).map(function(key){
      const entry = grouped[key];
      const stats = aggregateAttempts(sortByRecordedAtDescending(entry.attempts));
      const pack = getPackMeta(entry.packId);
      return {
        activityId: ACTIVITY_ID,
        packId: entry.packId,
        packTitle: pack ? pack.title : entry.packId,
        shortTitle: pack ? pack.shortTitle : entry.packId,
        stageBand: pack ? pack.stageBand : 'First',
        accent: pack ? pack.accent : '#11998e',
        pupilCount: Object.keys(entry.pupilNames).length,
        attemptCount: stats.attemptCount,
        accuracy: stats.accuracy,
        recentTrend: stats.recentTrend,
        status: getStatus(stats.accuracy, stats.attemptCount),
        commonErrors: stats.commonErrors
      };
    }).sort(function(left, right){
      if (left.stageBand !== right.stageBand) return left.stageBand.localeCompare(right.stageBand);
      return left.packTitle.localeCompare(right.packTitle);
    });
  }

  function listInterventionSignals(limit) {
    const pupilNames = window.ClassmatesPupils ? ClassmatesPupils.listPupils() : [];
    const summaries = [];

    pupilNames.forEach(function(name){
      listPupilPackMasteries(name).forEach(function(summary){
        if (!summary.attemptCount || summary.status === 'Secure') return;
        summaries.push({
          pupilName: name,
          packId: summary.packId,
          packTitle: summary.packTitle,
          stageBand: summary.stageBand,
          accuracy: summary.accuracy,
          status: summary.status,
          recentTrend: summary.recentTrend,
          commonErrors: summary.commonErrors
        });
      });
    });

    const max = typeof limit === 'number' && limit > 0 ? limit : 6;
    return summaries.sort(function(left, right){
      const leftRank = left.status === 'Needs support' ? 0 : 1;
      const rightRank = right.status === 'Needs support' ? 0 : 1;
      if (leftRank !== rightRank) return leftRank - rightRank;
      if (left.accuracy !== right.accuracy) return left.accuracy - right.accuracy;
      return left.pupilName.localeCompare(right.pupilName);
    }).slice(0, max);
  }

  function listFlagshipAttempts() {
    return sortByRecordedAtDescending(getAttempts());
  }

  function listRecentFlagshipAttempts(limit) {
    const max = typeof limit === 'number' && limit > 0 ? limit : 8;
    return listFlagshipAttempts().slice(0, max);
  }

  window.ClassmatesMastery = {
    buildPackSummary: buildPackSummary,
    getPupilOverview: getPupilOverview,
    listClassPackMasteries: listClassPackMasteries,
    listFlagshipAttempts: listFlagshipAttempts,
    listInterventionSignals: listInterventionSignals,
    listPupilPackMasteries: listPupilPackMasteries,
    listRecentFlagshipAttempts: listRecentFlagshipAttempts
  };
})();
