(function(){
  var STAR_SVG = '<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01z"/></svg>';

  var ENCOURAGEMENT = {
    3: ['Amazing work!', 'You\'re a superstar!', 'Absolutely brilliant!', 'Perfect score \u2014 wow!', 'Top of the class!', 'Incredible effort!'],
    2: ['Great job!', 'Well done!', 'Really good work!', 'You\'re getting better!', 'Nearly perfect!', 'Fantastic effort!'],
    1: ['Good try!', 'Keep going!', 'You\'re learning!', 'Practice makes perfect!', 'Getting there!', 'Don\'t give up!'],
    0: ['Let\'s try again!', 'Every expert was once a beginner!', 'You\'ll get it next time!', 'Keep practising!', 'Learning takes time!', 'Try a different level?']
  };

  function getEncouragement(stars) {
    var msgs = ENCOURAGEMENT[stars] || ENCOURAGEMENT[0];
    return msgs[Math.floor(Math.random() * msgs.length)];
  }

  function getStarSVG() {
    return STAR_SVG;
  }

  var gameShellApi = Object.freeze({
    STAR_SVG: STAR_SVG,
    ENCOURAGEMENT: ENCOURAGEMENT,
    getEncouragement: getEncouragement,
    getStarSVG: getStarSVG
  });

  // Expose for app.js backward compatibility
  window.STAR_SVG = STAR_SVG;
  window.ENCOURAGEMENT = ENCOURAGEMENT;
  window.getEncouragement = getEncouragement;

  window.ClassmatesGameShell = gameShellApi;
  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerModule === 'function') {
    window.ClassmatesPlatform.registerModule('platform', 'game-shell', {
      owner: 'platform',
      exports: ['ClassmatesGameShell', 'STAR_SVG', 'ENCOURAGEMENT', 'getEncouragement']
    });
  }
  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerService === 'function') {
    window.ClassmatesPlatform.registerService('gameShell', gameShellApi);
  }
})();
