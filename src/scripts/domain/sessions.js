(function(){
  function getDateKey(isoString) {
    if (!isoString) return null;
    return isoString.split('T')[0];
  }

  function formatSessionDate(dateKey) {
    if (!dateKey) return '';
    const date = new Date(dateKey + 'T00:00:00Z');
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
  }

  function getRecentSessions(pupilName, limit) {
    if (!window.ClassmatesAttempts || !pupilName) return [];
    
    const max = typeof limit === 'number' && limit > 0 ? limit : 10;
    const attempts = window.ClassmatesAttempts.listAttempts();
    
    // Filter attempts by pupil name and group by date
    const sessionsByDate = {};
    attempts.forEach(function(attempt) {
      if (attempt.pupilName !== pupilName) return;
      
      const dateKey = getDateKey(attempt.recordedAt);
      if (!dateKey) return;
      
      if (!sessionsByDate[dateKey]) {
        sessionsByDate[dateKey] = [];
      }
      sessionsByDate[dateKey].push(attempt);
    });
    
    // Sort dates and return last N sessions
    const dateKeys = Object.keys(sessionsByDate).sort().reverse();
    const recentDateKeys = dateKeys.slice(0, max);
    
    // Build session objects with daily aggregates
    const sessions = recentDateKeys.map(function(dateKey) {
      const attempts = sessionsByDate[dateKey];
      const totalCorrect = attempts.reduce(function(sum, att) {
        return sum + (att.correct || 0);
      }, 0);
      const totalQuestions = attempts.reduce(function(sum, att) {
        return sum + (att.total || 0);
      }, 0);
      const totalStars = attempts.reduce(function(sum, att) {
        return sum + (att.stars || 0);
      }, 0);
      
      return {
        date: dateKey,
        displayDate: formatSessionDate(dateKey),
        games: attempts.map(function(att) {
          return {
            title: att.title || att.gameId,
            subtitle: att.subtitle || '',
            gameId: att.gameId,
            activityId: att.activityId,
            correct: att.correct,
            total: att.total,
            scorePercent: att.scorePercent,
            stars: att.stars,
            timestamp: att.recordedAt,
            displayTime: att.recordedAt ? new Date(att.recordedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''
          };
        }),
        dailyStats: {
          gamesPlayed: attempts.length,
          correctAnswers: totalCorrect,
          totalAnswers: totalQuestions,
          accuracy: totalQuestions > 0 ? Math.round(totalCorrect / totalQuestions * 100) : 0,
          starsEarned: totalStars
        }
      };
    });
    
    return sessions;
  }

  function getSessionsForPupil(pupilName, days) {
    if (!window.ClassmatesAttempts || !pupilName) return [];
    
    const maxDays = typeof days === 'number' && days > 0 ? days : 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxDays);
    
    const attempts = window.ClassmatesAttempts.listAttempts();
    
    // Filter attempts by pupil and date range
    const filteredAttempts = attempts.filter(function(attempt) {
      if (attempt.pupilName !== pupilName) return false;
      if (!attempt.recordedAt) return false;
      const attemptDate = new Date(attempt.recordedAt);
      return attemptDate >= cutoffDate;
    });
    
    // Group by date
    const sessionsByDate = {};
    filteredAttempts.forEach(function(attempt) {
      const dateKey = getDateKey(attempt.recordedAt);
      if (!sessionsByDate[dateKey]) {
        sessionsByDate[dateKey] = [];
      }
      sessionsByDate[dateKey].push(attempt);
    });
    
    // Build session objects sorted chronologically (oldest first)
    const dateKeys = Object.keys(sessionsByDate).sort();
    return dateKeys.map(function(dateKey) {
      const attempts = sessionsByDate[dateKey];
      const totalCorrect = attempts.reduce(function(sum, att) {
        return sum + (att.correct || 0);
      }, 0);
      const totalQuestions = attempts.reduce(function(sum, att) {
        return sum + (att.total || 0);
      }, 0);
      const totalStars = attempts.reduce(function(sum, att) {
        return sum + (att.stars || 0);
      }, 0);
      
      return {
        date: dateKey,
        displayDate: formatSessionDate(dateKey),
        attempts: attempts.map(function(att) {
          return {
            title: att.title || att.gameId,
            subtitle: att.subtitle || '',
            gameId: att.gameId,
            activityId: att.activityId,
            correct: att.correct,
            total: att.total,
            scorePercent: att.scorePercent,
            stars: att.stars,
            timestamp: att.recordedAt
          };
        }),
        dailyStats: {
          gamesPlayed: attempts.length,
          correctAnswers: totalCorrect,
          totalAnswers: totalQuestions,
          accuracy: totalQuestions > 0 ? Math.round(totalCorrect / totalQuestions * 100) : 0,
          starsEarned: totalStars
        }
      };
    });
  }

  function aggregateSessionStats(pupilName, days) {
    const sessions = getSessionsForPupil(pupilName, days);
    
    let totalGamesPlayed = 0;
    let totalCorrect = 0;
    let totalQuestions = 0;
    let totalStars = 0;
    const gamePlayCounts = {};
    let lastPlayDate = null;
    let firstPlayDate = null;

    sessions.forEach(function(session) {
      totalGamesPlayed += session.dailyStats.gamesPlayed;
      totalCorrect += session.dailyStats.correctAnswers;
      totalQuestions += session.dailyStats.totalAnswers;
      totalStars += session.dailyStats.starsEarned;
      
      if (!firstPlayDate) firstPlayDate = session.date;
      lastPlayDate = session.date;
      
      session.attempts.forEach(function(attempt) {
        const gameId = attempt.gameId;
        gamePlayCounts[gameId] = (gamePlayCounts[gameId] || 0) + 1;
      });
    });

    const favoriteGame = Object.keys(gamePlayCounts).reduce(function(max, gameId) {
      return gamePlayCounts[gameId] > (gamePlayCounts[max] || 0) ? gameId : max;
    }, null);

    return {
      totalGamesPlayed: totalGamesPlayed,
      totalCorrect: totalCorrect,
      totalQuestions: totalQuestions,
      averageAccuracy: totalQuestions > 0 ? Math.round(totalCorrect / totalQuestions * 100) : 0,
      totalStars: totalStars,
      favoriteGame: favoriteGame,
      firstPlayDate: firstPlayDate,
      lastPlayDate: lastPlayDate,
      gamePlayCounts: gamePlayCounts
    };
  }

  window.ClassmatesSessions = {
    getRecentSessions: getRecentSessions,
    getSessionsForPupil: getSessionsForPupil,
    aggregateSessionStats: aggregateSessionStats
  };
})();
