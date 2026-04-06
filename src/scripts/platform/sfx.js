(function(){
  var soundMuted = false;
  var audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
  }

  function playTone(freq, dur, type, vol) {
    if (soundMuted) return;
    try {
      var ctx = getAudioCtx();
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = type || 'sine';
      o.frequency.value = freq;
      g.gain.value = vol || 0.3;
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + dur);
    } catch (e) {}
  }

  function sfxCorrect() {
    playTone(523, 0.1, 'sine', 0.25);
    setTimeout(function(){ playTone(659, 0.1, 'sine', 0.25); }, 100);
    setTimeout(function(){ playTone(784, 0.15, 'sine', 0.3); }, 200);
    flashScreen(true);
  }

  function sfxWrong() {
    playTone(200, 0.15, 'square', 0.15);
    setTimeout(function(){ playTone(180, 0.2, 'square', 0.12); }, 150);
    flashScreen(false);
  }

  function sfxStreak() {
    playTone(523, 0.08, 'sine', 0.2);
    setTimeout(function(){ playTone(659, 0.08, 'sine', 0.2); }, 80);
    setTimeout(function(){ playTone(784, 0.08, 'sine', 0.2); }, 160);
    setTimeout(function(){ playTone(1047, 0.2, 'sine', 0.3); }, 240);
  }

  function sfxLevelUp() {
    playTone(392, 0.1, 'sine', 0.2);
    setTimeout(function(){ playTone(523, 0.1, 'sine', 0.2); }, 120);
    setTimeout(function(){ playTone(659, 0.1, 'sine', 0.25); }, 240);
    setTimeout(function(){ playTone(784, 0.15, 'sine', 0.3); }, 360);
    setTimeout(function(){ playTone(1047, 0.25, 'sine', 0.35); }, 480);
  }

  function sfxClick() { playTone(800, 0.05, 'sine', 0.1); }

  function sfxStar() {
    playTone(880, 0.1, 'triangle', 0.2);
    setTimeout(function(){ playTone(1108, 0.15, 'triangle', 0.25); }, 120);
  }

  function toggleMute() {
    soundMuted = !soundMuted;
    var btn = document.getElementById('muteBtn');
    if (soundMuted) {
      btn.textContent = '\u{1F507} Sound Off';
      btn.classList.add('muted');
    } else {
      btn.textContent = '\u{1F50A} Sound On';
      btn.classList.remove('muted');
      sfxClick();
    }
  }

  function flashScreen(correct) {
    var screen = document.querySelector('.screen.active');
    if (!screen) return;
    screen.classList.remove('flash-correct-bg', 'flash-wrong-bg');
    void screen.offsetWidth;
    screen.classList.add(correct ? 'flash-correct-bg' : 'flash-wrong-bg');
    screen.addEventListener('animationend', function() {
      screen.classList.remove('flash-correct-bg', 'flash-wrong-bg');
    }, { once: true });
  }

  function launchConfetti(duration) {
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9999';
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var colors = ['#FFD93D','#FF6B6B','#4ECDC4','#A29BFE','#6BCB77','#FF9A9E','#45B7D1','#F0A500','#E056A0','#00B894'];
    var pieces = [];
    for (var i = 0; i < 80; i++) {
      pieces.push({
        x: canvas.width * 0.5 + (Math.random() - 0.5) * 100,
        y: canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 14 - 4,
        r: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        shape: Math.floor(Math.random() * 3),
        gravity: 0.25 + Math.random() * 0.1,
        drag: 0.98 + Math.random() * 0.01
      });
    }
    var start = performance.now();
    function frame(t) {
      var elapsed = t - start;
      if (elapsed > duration) { canvas.remove(); return; }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var fade = elapsed > duration - 400 ? 1 - (elapsed - (duration - 400)) / 400 : 1;
      ctx.globalAlpha = fade;
      pieces.forEach(function(p) {
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        if (p.shape === 0) {
          ctx.fillRect(-p.r, -p.r * 0.6, p.r * 2, p.r * 1.2);
        } else if (p.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -p.r);
          ctx.lineTo(p.r * 0.9, p.r * 0.7);
          ctx.lineTo(-p.r * 0.9, p.r * 0.7);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // Expose globally for app.js and game modules
  window.sfxCorrect = sfxCorrect;
  window.sfxWrong = sfxWrong;
  window.sfxStreak = sfxStreak;
  window.sfxLevelUp = sfxLevelUp;
  window.sfxClick = sfxClick;
  window.sfxStar = sfxStar;
  window.toggleMute = toggleMute;
  window.flashScreen = flashScreen;
  window.launchConfetti = launchConfetti;
  window.playTone = playTone;

  var sfxApi = Object.freeze({
    correct: sfxCorrect,
    wrong: sfxWrong,
    streak: sfxStreak,
    levelUp: sfxLevelUp,
    click: sfxClick,
    star: sfxStar,
    toggleMute: toggleMute,
    flashScreen: flashScreen,
    launchConfetti: launchConfetti,
    playTone: playTone
  });

  window.ClassmatesSFX = sfxApi;
  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerModule === 'function') {
    window.ClassmatesPlatform.registerModule('platform', 'sfx', {
      owner: 'platform',
      exports: ['ClassmatesSFX', 'sfxCorrect', 'sfxWrong', 'sfxStreak', 'sfxLevelUp', 'sfxClick', 'sfxStar', 'toggleMute', 'flashScreen', 'launchConfetti']
    });
  }
  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerService === 'function') {
    window.ClassmatesPlatform.registerService('sfx', sfxApi);
  }
})();
