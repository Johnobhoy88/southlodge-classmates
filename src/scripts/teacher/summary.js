(function(){
  const PROGRESS_HEADERS = [
    'Name',
    'Stars',
    'Games',
    'Spelling',
    'Maths',
    'Tables',
    'Stories',
    'Badges',
    'Streak',
    'Last Active'
  ];

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function loadPupilState(name) {
    return ClassmatesAppState.loadState(name);
  }

  function formatDisplayDate(value) {
    return value ? new Date(value).toLocaleDateString('en-GB') : 'Never';
  }

  function buildPupilDetail(name) {
    const pupilName = String(name || '');
    const state = loadPupilState(pupilName);
    const achievements = safeArray(state.achievements);
    const storiesRead = safeArray(state.storiesRead);
    const tablesDone = safeArray(state.ttCompleted);
    const adaptiveTopics = Object.keys(state.adaptive || {}).sort().map(function(topic){
      const adaptiveState = state.adaptive[topic] || {};
      return {
        topic: topic,
        level: adaptiveState.level || 1
      };
    });
    const recommendedNextStep = getRecommendedNextStep(pupilName);
    const recentSessions = (window.ClassmatesSessions && typeof ClassmatesSessions.getRecentSessions === 'function')
      ? ClassmatesSessions.getRecentSessions(pupilName, 10)
      : [];

    return {
      name: pupilName,
      title: pupilName + ' — Detail',
      lastActiveLabel: formatDisplayDate(state.lastPlayed),
      achievements: achievements,
      adaptiveTopics: adaptiveTopics,
      stats: [
        { label: 'Stars', value: state.stars || 0 },
        { label: 'Games', value: state.games || 0 },
        { label: 'Day Streak', value: state.streak || 0 },
        { label: 'Words Spelled', value: state.spellingCorrect || 0 },
        { label: 'Maths Solved', value: state.mathsCorrect || 0 },
        { label: 'Tables Done', value: tablesDone.length + '/11' },
        { label: 'Stories Read', value: storiesRead.length + '/18' },
        { label: 'Badges', value: achievements.length + '/31' }
      ],
      reportStats: [
        { label: 'Stars', value: state.stars || 0 },
        { label: 'Games', value: state.games || 0 },
        { label: 'Streak', value: state.streak || 0 },
        { label: 'Words', value: state.spellingCorrect || 0 },
        { label: 'Maths', value: state.mathsCorrect || 0 },
        { label: 'Stories', value: storiesRead.length + '/18' },
        { label: 'Tables', value: tablesDone.length + '/11' },
        { label: 'Badges', value: achievements.length + '/31' }
      ],
      progressCells: [
        pupilName,
        state.stars || 0,
        state.games || 0,
        state.spellingCorrect || 0,
        state.mathsCorrect || 0,
        tablesDone.length + '/11',
        storiesRead.length + '/18',
        achievements.length + '/31',
        state.streak || 0,
        formatDisplayDate(state.lastPlayed)
      ],
      csvCells: [
        pupilName,
        state.stars || 0,
        state.games || 0,
        state.streak || 0,
        state.spellingCorrect || 0,
        state.mathsCorrect || 0,
        tablesDone.length,
        storiesRead.length,
        achievements.length,
        state.lastPlayed || 'Never'
      ],
      recommendedNextStep: recommendedNextStep,
      sessionHistory: recentSessions
    };
  }

  function getRecommendationRank(status) {
    if (status === 'Needs support') return 0;
    if (status === 'Watch') return 1;
    if (status === 'Secure') return 2;
    return 3;
  }

  function getRecommendedNextStep(pupilName) {
    if (!window.ClassmatesMastery || typeof ClassmatesMastery.getPupilOverview !== 'function') return null;

    const overview = ClassmatesMastery.getPupilOverview(pupilName);
    const weakestPack = overview && overview.weakestPack;
    if (!weakestPack) return null;

    const commonErrors = safeArray(weakestPack.commonErrors);
    const topError = commonErrors[0] || null;
    const actionVerb = weakestPack.status === 'Needs support' ? 'Revisit' : 'Practise';
    const focusLabel = topError ? topError.label : (weakestPack.skillFocus || weakestPack.shortTitle || weakestPack.packTitle);

    return {
      pupilName: pupilName,
      packId: weakestPack.packId,
      packTitle: weakestPack.packTitle,
      shortTitle: weakestPack.shortTitle,
      stageBand: weakestPack.stageBand,
      status: weakestPack.status,
      accuracy: weakestPack.accuracy,
      recentTrend: weakestPack.recentTrend,
      focusLabel: focusLabel,
      focusCount: topError ? topError.count : 0,
      actionLabel: actionVerb + ' ' + (weakestPack.shortTitle || weakestPack.packTitle),
      summaryText: actionVerb + ' ' + (weakestPack.shortTitle || weakestPack.packTitle) + ' and focus on ' + focusLabel + '.',
      supportText: topError
        ? topError.label + ' appears ' + topError.count + ' times.'
        : 'Keep building confidence in this pack.',
      sortRank: getRecommendationRank(weakestPack.status)
    };
  }

  function listRecommendedNextSteps(limit) {
    const max = typeof limit === 'number' && limit > 0 ? limit : 4;
    return ClassmatesPupils.listPupils().map(function(name){
      return getRecommendedNextStep(name);
    }).filter(Boolean).sort(function(left, right){
      if (left.sortRank !== right.sortRank) return left.sortRank - right.sortRank;
      if (left.accuracy !== right.accuracy) return left.accuracy - right.accuracy;
      return left.pupilName.localeCompare(right.pupilName);
    }).slice(0, max);
  }

  function listProgressRows() {
    return ClassmatesPupils.listPupils().map(function(name){
      const detail = buildPupilDetail(name);
      return {
        name: detail.name,
        cells: detail.progressCells.slice(),
        csvCells: detail.csvCells.slice()
      };
    });
  }

  function getClassSummary() {
    const pupils = ClassmatesPupils.listPupils();
    const today = new Date().toDateString();
    let totalStars = 0;
    let totalGames = 0;
    let activeToday = 0;
    let totalBadges = 0;

    pupils.forEach(function(name){
      const state = loadPupilState(name);
      totalStars += state.stars || 0;
      totalGames += state.games || 0;
      totalBadges += safeArray(state.achievements).length;
      if (state.lastPlayed === today) activeToday++;
    });

    return {
      pupilCount: pupils.length,
      cards: [
        {
          label: 'Active Today',
          value: activeToday + '/' + pupils.length,
          background: '#e8fff5',
          color: '#11998e'
        },
        {
          label: 'Total Stars',
          value: totalStars,
          background: '#fff8e6',
          color: '#d4a520'
        },
        {
          label: 'Games Played',
          value: totalGames,
          background: '#f0ecff',
          color: '#6c5ce7'
        },
        {
          label: 'Badges Earned',
          value: totalBadges,
          background: '#fff0f5',
          color: '#e84393'
        }
      ]
    };
  }

  function getInactivityDays(lastPlayed) {
    if (!lastPlayed) return Infinity;
    var diff = Math.floor((new Date() - new Date(lastPlayed)) / 864e5);
    return diff >= 0 ? diff : Infinity;
  }

  function getNeedsAttention() {
    var pupils = ClassmatesPupils.listPupils();
    var alerts = [];

    pupils.forEach(function(name) {
      var state = loadPupilState(name);
      var daysInactive = getInactivityDays(state.lastPlayed);
      var reason = null;

      if (daysInactive === Infinity) {
        reason = 'Never played';
      } else if (daysInactive >= 7) {
        reason = 'Inactive ' + daysInactive + ' days';
      } else if ((state.games || 0) > 5 && (state.streak || 0) === 0) {
        reason = 'Lost streak';
      }

      if (reason) {
        alerts.push({ name: name, reason: reason, daysInactive: daysInactive });
      }
    });

    alerts.sort(function(a, b) { return b.daysInactive - a.daysInactive; });
    return alerts.slice(0, 6);
  }

  function getInterventionSignals() {
    if (!window.ClassmatesMastery) return [];
    return ClassmatesMastery.listInterventionSignals(6);
  }

  function getRecentActivity() {
    if (!window.ClassmatesMastery) return [];
    return ClassmatesMastery.listRecentFlagshipAttempts(5).map(function(attempt) {
      return {
        pupilName: attempt.pupilName || 'Unknown',
        packTitle: attempt.packTitle || attempt.packId || 'Unknown',
        accuracy: attempt.accuracy != null ? attempt.accuracy : '—',
        correct: attempt.correct || 0,
        total: attempt.total || 0,
        recordedAt: attempt.recordedAt || null
      };
    });
  }

  function getClassMastery() {
    if (!window.ClassmatesMastery || typeof ClassmatesMastery.getClassMasterySnapshot !== 'function') return null;
    return ClassmatesMastery.getClassMasterySnapshot();
  }

  function getTeacherHomeModel() {
    return {
      classSummary: getClassSummary(),
      classMastery: getClassMastery(),
      needsAttention: getNeedsAttention(),
      interventions: getInterventionSignals(),
      recentActivity: getRecentActivity(),
      nextActions: listRecommendedNextSteps(4)
    };
  }

  const teacherSummaryApi = Object.freeze({
    getClassSummary: getClassSummary,
    getPupilDetail: buildPupilDetail,
    getProgressHeaders: function(){
      return PROGRESS_HEADERS.slice();
    },
    getRecommendedNextStep: getRecommendedNextStep,
    listProgressRows: listProgressRows,
    listRecommendedNextSteps: listRecommendedNextSteps,
    getNeedsAttention: getNeedsAttention,
    getInterventionSignals: getInterventionSignals,
    getRecentActivity: getRecentActivity,
    getTeacherHomeModel: getTeacherHomeModel
  });

  window.ClassmatesTeacherSummary = teacherSummaryApi;
  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerModule === 'function') {
    window.ClassmatesPlatform.registerModule('teacher', 'summary', {
      owner: 'teacher',
      exports: ['ClassmatesTeacherSummary', 'getClassSummary', 'getPupilDetail', 'getTeacherHomeModel', 'getRecommendedNextStep', 'listRecommendedNextSteps']
    });
  }
  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerService === 'function') {
    window.ClassmatesPlatform.registerService('teacherSummary', teacherSummaryApi);
  }
})();
