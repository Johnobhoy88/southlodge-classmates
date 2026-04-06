(function(){
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function show(id) {
    var el = document.getElementById(id);
    el.style.display = el.classList.contains('level-select-wrap') ? 'flex' : '';
  }

  function hide(id) {
    document.getElementById(id).style.display = 'none';
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function animateCounter(el, target, duration) {
    if (!el) return;
    var start = parseInt(el.textContent) || 0;
    if (start === target) return;
    var diff = target - start;
    var startTime = performance.now();
    function tick(now) {
      var elapsed = now - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + diff * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function animateCounterSuffix(el, target, suffix, duration) {
    if (!el) return;
    var startTime = performance.now();
    function tick(now) {
      var elapsed = now - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function animateQuestion(elementId) {
    var el = document.getElementById(elementId);
    if (!el) return;
    el.classList.remove('q-animate');
    void el.offsetWidth;
    el.classList.add('q-animate');
  }

  function lighten(hex) {
    return hex + '99';
  }

  function getGreeting() {
    var h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  function getDayMessage(streak) {
    var s = typeof streak === 'number' ? streak : 0;
    if (s >= 7) return s + ' day streak! You are unstoppable!';
    if (s >= 5) return s + ' days in a row! Amazing!';
    if (s >= 3) return s + ' day streak! Keep it up!';
    var d = new Date().getDay();
    var msgs = ['Happy Sunday!', 'Let\'s start the week!', 'Happy Tuesday!', 'It\'s Wednesday!', 'Nearly Friday!', 'Happy Friday!', 'Enjoy your Saturday!'];
    return msgs[d];
  }

  function getWeekNumber() {
    var d = new Date();
    var start = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
  }

  // Expose globally for app.js and game modules
  window.shuffle = shuffle;
  window.rand = rand;
  window.show = show;
  window.hide = hide;
  window.escapeHtml = escapeHtml;
  window.animateCounter = animateCounter;
  window.animateCounterSuffix = animateCounterSuffix;
  window.animateQuestion = animateQuestion;
  window.lighten = lighten;
  window.getGreeting = getGreeting;
  window.getDayMessage = getDayMessage;
  window.getWeekNumber = getWeekNumber;

  var utilsApi = Object.freeze({
    shuffle: shuffle,
    rand: rand,
    show: show,
    hide: hide,
    escapeHtml: escapeHtml,
    animateCounter: animateCounter,
    animateCounterSuffix: animateCounterSuffix,
    animateQuestion: animateQuestion,
    lighten: lighten,
    getGreeting: getGreeting,
    getDayMessage: getDayMessage,
    getWeekNumber: getWeekNumber
  });

  window.ClassmatesUtils = utilsApi;
  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerModule === 'function') {
    window.ClassmatesPlatform.registerModule('platform', 'utils', {
      owner: 'platform',
      exports: ['ClassmatesUtils', 'shuffle', 'rand', 'show', 'hide', 'escapeHtml', 'animateCounter', 'animateCounterSuffix', 'animateQuestion', 'lighten', 'getGreeting', 'getDayMessage', 'getWeekNumber']
    });
  }
  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerService === 'function') {
    window.ClassmatesPlatform.registerService('utils', utilsApi);
  }
})();
