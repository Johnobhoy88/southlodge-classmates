(function(){
  // ============================================================
  // LITERACY FX — Bright Bookshelf World
  // Warm, cosy backdrop for all literacy games
  // Floating letters, gentle bokeh, soft paper texture feel
  // ============================================================

  var canvas, ctx, animId, running = false;
  var W = 0, H = 0, time = 0;
  var progress = 0, targetProgress = 0;

  var floatingLetters = [];
  var bokeh = [];
  var particles = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

  var LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrs';

  function generateScene() {
    if (!W || !H) return;

    // Floating letters — drift gently across the background
    floatingLetters = [];
    for (var i = 0; i < 20; i++) {
      floatingLetters.push({
        x: rand(0, W),
        y: rand(0, H),
        letter: LETTERS[Math.floor(rand(0, LETTERS.length))],
        size: rand(16, 40),
        speed: rand(0.1, 0.4),
        drift: rand(-0.3, 0.3),
        opacity: rand(0.04, 0.1),
        rotation: rand(-0.3, 0.3),
        rotSpeed: rand(-0.005, 0.005),
        color: ['#FF6B6B','#FFD93D','#74b9ff','#55efc4','#a29bfe','#fd79a8','#fdcb6e'][Math.floor(rand(0, 7))]
      });
    }

    // Bokeh circles — soft, warm, out-of-focus lights
    bokeh = [];
    for (var i = 0; i < 15; i++) {
      bokeh.push({
        x: rand(0, W),
        y: rand(0, H),
        r: rand(20, 80),
        speed: rand(0.05, 0.2),
        drift: rand(-0.15, 0.15),
        opacity: rand(0.03, 0.07),
        color: ['rgba(255,107,107,','rgba(255,217,61,','rgba(116,185,255,','rgba(85,239,196,','rgba(253,121,168,'][Math.floor(rand(0, 5))],
        phase: rand(0, Math.PI * 2)
      });
    }
  }

  // ==================== PARTICLE SYSTEM ====================
  function spawnParticle(x, y, c) {
    c = c || {};
    if (particles.length > 80) return;
    particles.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * (c.spread || 4),
      vy: (Math.random() - 0.5) * (c.spread || 4) - (c.rise || 1),
      life: 1, decay: c.decay || 0.02,
      size: c.size || 3 + Math.random() * 3,
      color: c.color || 'rgba(255,217,61,0.8)',
      gravity: c.gravity || 0
    });
  }

  function emitBurst(x, y, count, c) {
    for (var i = 0; i < count; i++) spawnParticle(x, y, c);
  }

  function updateParticles(dt) {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.vy += p.gravity * dt * 60;
      p.life -= p.decay * dt * 60;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.globalAlpha = p.life * 0.8;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ==================== DRAWING ====================
  function drawBackground() {
    // Warm gradient — creamy peach to soft coral
    var bright = 0.7 + progress * 0.3;
    var grad = ctx.createLinearGradient(0, 0, W * 0.3, H);
    grad.addColorStop(0, 'hsl(25,' + Math.round(30 + progress * 20) + '%,' + Math.round(92 * bright) + '%)');
    grad.addColorStop(0.5, 'hsl(15,' + Math.round(35 + progress * 15) + '%,' + Math.round(88 * bright) + '%)');
    grad.addColorStop(1, 'hsl(35,' + Math.round(40 + progress * 10) + '%,' + Math.round(85 * bright) + '%)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawBokeh() {
    var t = time * 0.001;
    for (var i = 0; i < bokeh.length; i++) {
      var b = bokeh[i];
      var bx = b.x + Math.sin(t * b.speed + b.phase) * 30;
      var by = b.y + Math.cos(t * b.speed * 0.7 + b.phase) * 20;
      var pulse = 1 + Math.sin(t * 0.5 + b.phase) * 0.15;
      var op = b.opacity * (0.8 + progress * 0.4) * pulse;
      ctx.globalAlpha = op;
      var g = ctx.createRadialGradient(bx, by, 0, bx, by, b.r * pulse);
      g.addColorStop(0, b.color + '0.3)');
      g.addColorStop(0.5, b.color + '0.1)');
      g.addColorStop(1, b.color + '0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(bx, by, b.r * pulse, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawFloatingLetters() {
    var t = time * 0.001;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var i = 0; i < floatingLetters.length; i++) {
      var fl = floatingLetters[i];
      // Gentle float upward, drift sideways
      fl.y -= fl.speed * 0.5;
      fl.x += fl.drift * 0.3;
      fl.rotation += fl.rotSpeed;
      // Wrap
      if (fl.y < -fl.size * 2) { fl.y = H + fl.size * 2; fl.x = rand(0, W); }
      if (fl.x < -50) fl.x = W + 50;
      if (fl.x > W + 50) fl.x = -50;

      var op = fl.opacity * (0.6 + progress * 0.6);
      ctx.save();
      ctx.translate(fl.x, fl.y);
      ctx.rotate(fl.rotation);
      ctx.globalAlpha = op;
      ctx.font = 'bold ' + fl.size + 'px "Fredoka One","Comic Sans MS",cursive';
      ctx.fillStyle = fl.color;
      ctx.fillText(fl.letter, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // ==================== SOUND ENGINE ====================
  var audioCtx = null;

  function getAudio() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    return audioCtx;
  }

  function playNote(freq, duration, type, volume, delay) {
    var ac = getAudio();
    if (!ac) return;
    if (window._classmatesMuted) return;
    var t = ac.currentTime + (delay || 0);
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume || 0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration);
  }

  var SCALE = [262, 294, 330, 392, 440, 523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760];

  function sfxCorrect(noteIndex) {
    var freq = SCALE[Math.min(noteIndex || 0, SCALE.length - 1)];
    playNote(freq, 0.2, 'sine', 0.08);
    playNote(freq * 1.5, 0.15, 'sine', 0.04, 0.03);
  }

  function sfxWrong() {
    playNote(280, 0.18, 'sine', 0.05);
    playNote(230, 0.22, 'sine', 0.03, 0.06);
  }

  function sfxComplete() {
    var notes = [523, 659, 784, 1047, 1319];
    for (var i = 0; i < notes.length; i++) {
      playNote(notes[i], 0.4, 'sine', 0.07, i * 0.08);
    }
  }

  // ==================== MAIN LOOP ====================
  var lastTime = 0;

  function loop(t) {
    if (!running) return;
    var dt = Math.min((t - lastTime) / 1000, 0.05);
    lastTime = t;
    time = t;

    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      W = canvas.width = canvas.clientWidth;
      H = canvas.height = canvas.clientHeight;
      generateScene();
    }

    progress += (targetProgress - progress) * 0.03;

    drawBackground();
    drawBokeh();
    drawFloatingLetters();
    updateParticles(dt);
    drawParticles();

    animId = requestAnimationFrame(loop);
  }

  // ==================== PUBLIC API ====================
  function init(canvasEl) {
    canvas = canvasEl;
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    W = canvas.width = canvas.clientWidth || 600;
    H = canvas.height = canvas.clientHeight || 400;
    generateScene();
  }

  function start() {
    if (!canvas || running) return;
    running = true;
    targetProgress = 0;
    progress = 0;
    particles = [];
    lastTime = performance.now();
    animId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    animId = null;
  }

  function onCorrect(x, y, noteIndex) {
    if (!canvas) return;
    var px = x || W * 0.5, py = y || H * 0.4;
    emitBurst(px, py, 8, {
      spread: 5, rise: 1.5, decay: 0.025, size: 3,
      color: 'rgba(255,217,61,0.9)'
    });
    emitBurst(px, py, 4, {
      spread: 3, rise: 1, decay: 0.03, size: 2,
      color: 'rgba(85,239,196,0.7)'
    });
    sfxCorrect(noteIndex);
  }

  function onWrong() {
    if (!canvas) return;
    emitBurst(W * 0.5, H * 0.4, 5, {
      spread: 3, rise: -0.3, gravity: 0.03, decay: 0.015, size: 2,
      color: 'rgba(220,80,60,0.4)'
    });
    sfxWrong();
  }

  function onComplete(pct) {
    targetProgress = pct || 1;
    if (!canvas) return;
    emitBurst(W * 0.5, H * 0.35, 20, {
      spread: 8, rise: 2, decay: 0.015, size: 4,
      color: 'rgba(255,217,61,0.9)'
    });
    emitBurst(W * 0.5, H * 0.35, 10, {
      spread: 6, rise: 1.5, decay: 0.018, size: 3,
      color: 'rgba(116,185,255,0.8)'
    });
    sfxComplete();
  }

  function setProgress(pct) {
    targetProgress = Math.max(0, Math.min(1, pct || 0));
  }

  window.ClassmatesLiteracyFX = {
    init: init,
    start: start,
    stop: stop,
    onCorrect: onCorrect,
    onWrong: onWrong,
    onComplete: onComplete,
    setProgress: setProgress
  };
})();
