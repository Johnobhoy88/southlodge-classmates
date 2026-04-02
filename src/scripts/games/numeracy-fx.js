(function(){
  // ============================================================
  // NUMERACY FX — Bright Space Station
  // Colourful planets, twinkling stars, floating numbers
  // Fun and bright, not dark-moody
  // ============================================================

  var canvas, ctx, animId, running = false;
  var W = 0, H = 0, time = 0;
  var progress = 0, targetProgress = 0;

  var stars = [];
  var planets = [];
  var floatingNums = [];
  var particles = [];
  var comets = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

  function generateScene() {
    if (!W || !H) return;

    // Stars — bright twinkling dots
    stars = [];
    for (var i = 0; i < 60; i++) {
      stars.push({
        x: rand(0, W),
        y: rand(0, H * 0.65),
        size: rand(1, 3),
        twinkle: rand(0, Math.PI * 2),
        speed: rand(1, 3)
      });
    }

    // Colourful planets (small, decorative)
    planets = [];
    var planetColors = [
      { base: '#FF6B6B', ring: '#fab1a0' },
      { base: '#74b9ff', ring: '#81ecec' },
      { base: '#FFD93D', ring: '#fdcb6e' },
      { base: '#55efc4', ring: '#00b894' },
      { base: '#a29bfe', ring: '#fd79a8' }
    ];
    for (var i = 0; i < 4; i++) {
      var pc = planetColors[i % planetColors.length];
      planets.push({
        x: rand(W * 0.05, W * 0.95),
        y: rand(H * 0.05, H * 0.4),
        r: rand(12, 30),
        color: pc.base,
        ringColor: pc.ring,
        hasRing: Math.random() > 0.5,
        phase: rand(0, Math.PI * 2),
        orbitSpeed: rand(0.0003, 0.001)
      });
    }

    // Floating numbers
    var NUMS = '0123456789+-x÷=%';
    floatingNums = [];
    for (var i = 0; i < 16; i++) {
      floatingNums.push({
        x: rand(0, W),
        y: rand(0, H),
        char: NUMS[Math.floor(rand(0, NUMS.length))],
        size: rand(14, 34),
        speed: rand(0.08, 0.3),
        drift: rand(-0.2, 0.2),
        opacity: rand(0.04, 0.09),
        rotation: rand(-0.3, 0.3),
        rotSpeed: rand(-0.004, 0.004),
        color: ['#FF6B6B','#FFD93D','#74b9ff','#55efc4','#a29bfe','#fdcb6e'][Math.floor(rand(0, 6))]
      });
    }

    // Occasional comets
    comets = [];
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
      color: c.color || 'rgba(116,185,255,0.8)',
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
    // Deep blue to soft purple gradient — rich but not dark
    var bright = 0.75 + progress * 0.25;
    var grad = ctx.createLinearGradient(0, 0, W * 0.4, H);
    grad.addColorStop(0, 'hsl(230,' + Math.round(50 + progress * 15) + '%,' + Math.round(30 * bright) + '%)');
    grad.addColorStop(0.4, 'hsl(250,' + Math.round(40 + progress * 10) + '%,' + Math.round(35 * bright) + '%)');
    grad.addColorStop(0.8, 'hsl(270,' + Math.round(35 + progress * 10) + '%,' + Math.round(40 * bright) + '%)');
    grad.addColorStop(1, 'hsl(220,' + Math.round(45 + progress * 10) + '%,' + Math.round(25 * bright) + '%)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawStars() {
    var t = time * 0.001;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var twink = 0.4 + Math.sin(t * s.speed + s.twinkle) * 0.4 + 0.2;
      ctx.globalAlpha = twink * (0.6 + progress * 0.4);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      // Cross flare for bigger stars
      if (s.size > 2) {
        ctx.globalAlpha = twink * 0.3;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(s.x - s.size * 2, s.y);
        ctx.lineTo(s.x + s.size * 2, s.y);
        ctx.moveTo(s.x, s.y - s.size * 2);
        ctx.lineTo(s.x, s.y + s.size * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawPlanets() {
    var t = time * 0.001;
    for (var i = 0; i < planets.length; i++) {
      var p = planets[i];
      var px = p.x + Math.sin(t * p.orbitSpeed * 100 + p.phase) * 15;
      var py = p.y + Math.cos(t * p.orbitSpeed * 70 + p.phase) * 8;
      var op = 0.5 + progress * 0.5;

      ctx.globalAlpha = op;
      // Planet body
      var pg = ctx.createRadialGradient(px - p.r * 0.3, py - p.r * 0.3, 0, px, py, p.r);
      pg.addColorStop(0, '#fff');
      pg.addColorStop(0.3, p.color);
      pg.addColorStop(1, 'rgba(0,0,0,0.3)');
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fill();

      // Ring
      if (p.hasRing) {
        ctx.strokeStyle = p.ringColor;
        ctx.lineWidth = 2;
        ctx.globalAlpha = op * 0.6;
        ctx.beginPath();
        ctx.ellipse(px, py, p.r * 1.6, p.r * 0.4, 0.3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawFloatingNums() {
    var t = time * 0.001;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var i = 0; i < floatingNums.length; i++) {
      var fn = floatingNums[i];
      fn.y -= fn.speed * 0.4;
      fn.x += fn.drift * 0.25;
      fn.rotation += fn.rotSpeed;
      if (fn.y < -fn.size * 2) { fn.y = H + fn.size * 2; fn.x = rand(0, W); }
      if (fn.x < -50) fn.x = W + 50;
      if (fn.x > W + 50) fn.x = -50;

      ctx.save();
      ctx.translate(fn.x, fn.y);
      ctx.rotate(fn.rotation);
      ctx.globalAlpha = fn.opacity * (0.5 + progress * 0.7);
      ctx.font = 'bold ' + fn.size + 'px "Fredoka One","Comic Sans MS",cursive';
      ctx.fillStyle = fn.color;
      ctx.fillText(fn.char, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawComets(dt) {
    var t = time * 0.001;
    // Spawn occasional comet after 20% progress
    if (progress > 0.2 && comets.length < 2 && Math.random() < 0.001) {
      comets.push({
        x: rand(-50, W * 0.3),
        y: rand(-50, H * 0.2),
        vx: rand(3, 6),
        vy: rand(1, 3),
        life: 1,
        size: rand(2, 4),
        color: ['#FFD93D','#74b9ff','#55efc4'][Math.floor(rand(0, 3))]
      });
    }
    for (var i = comets.length - 1; i >= 0; i--) {
      var c = comets[i];
      c.x += c.vx * dt * 60;
      c.y += c.vy * dt * 60;
      c.life -= 0.005 * dt * 60;
      if (c.life <= 0 || c.x > W + 50 || c.y > H + 50) {
        comets.splice(i, 1);
        continue;
      }
      // Trail
      ctx.globalAlpha = c.life * 0.6;
      ctx.strokeStyle = c.color;
      ctx.lineWidth = c.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x - c.vx * 8, c.y - c.vy * 8);
      ctx.stroke();
      // Head
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size, 0, Math.PI * 2);
      ctx.fill();
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

  function sfxCorrect(noteIndex) {
    var freqs = [392, 440, 523, 587, 659, 784, 880, 1047];
    var f = freqs[Math.min(noteIndex || 0, freqs.length - 1)];
    playNote(f, 0.18, 'triangle', 0.08);
    playNote(f * 1.5, 0.12, 'sine', 0.04, 0.03);
  }

  function sfxWrong() {
    playNote(260, 0.15, 'triangle', 0.05);
    playNote(220, 0.2, 'triangle', 0.03, 0.05);
  }

  function sfxComplete() {
    var notes = [523, 659, 784, 1047, 1319];
    for (var i = 0; i < notes.length; i++) {
      playNote(notes[i], 0.35, 'triangle', 0.06, i * 0.07);
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
    drawStars();
    drawPlanets();
    drawComets(dt);
    drawFloatingNums();
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
    comets = [];
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
      color: 'rgba(116,185,255,0.9)'
    });
    emitBurst(px, py, 4, {
      spread: 3, rise: 1, decay: 0.03, size: 2,
      color: 'rgba(255,217,61,0.7)'
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
      color: 'rgba(116,185,255,0.9)'
    });
    emitBurst(W * 0.5, H * 0.35, 10, {
      spread: 6, rise: 1.5, decay: 0.018, size: 3,
      color: 'rgba(162,155,254,0.8)'
    });
    sfxComplete();
  }

  function setProgress(pct) {
    targetProgress = Math.max(0, Math.min(1, pct || 0));
  }

  window.ClassmatesNumeracyFX = {
    init: init,
    start: start,
    stop: stop,
    onCorrect: onCorrect,
    onWrong: onWrong,
    onComplete: onComplete,
    setProgress: setProgress
  };
})();
