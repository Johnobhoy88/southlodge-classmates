(function(global){
  function getPersonalBest(state, table) {
    if (!state || !state.ttPersonalBests) return null;
    var best = state.ttPersonalBests[table];
    return typeof best === 'number' ? best : null;
  }

  function isTableCompleted(state, table) {
    if (!state || !Array.isArray(state.ttCompleted)) return false;
    return state.ttCompleted.indexOf(table) !== -1;
  }

  function getCompletionCount(state) {
    if (!state || !Array.isArray(state.ttCompleted)) return 0;
    return state.ttCompleted.length;
  }

  function getOverallStats(state) {
    if (!state) return { completed: 0, total: 12, bestTimes: {} };
    return {
      completed: getCompletionCount(state),
      total: 12,
      bestTimes: state.ttPersonalBests || {}
    };
  }

  global.ClassmatesTimesTable = Object.freeze({
    getPersonalBest: getPersonalBest,
    isTableCompleted: isTableCompleted,
    getCompletionCount: getCompletionCount,
    getOverallStats: getOverallStats
  });
})(window);
