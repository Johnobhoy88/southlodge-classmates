(function(){
  // ============================================================
  // GEOGRAPHY FX — Explorer's Map
  // Warm parchment tones, compass rose, floating map elements
  // Bright and adventurous for young explorers
  // ============================================================

  var canvas, ctx, animId, running = false;
  var W = 0, H = 0, time = 0;
  var progress = 0, targetProgress = 0;

  var clouds = [];
  var mapIcons = [];
  var particles = [];
  var compassAngle = 0;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function generateScene() {
    if (!W || !H) return;

    // Drifting clouds
    clouds = [];
    for (var i = 0; i < 6; i++) {
      clouds.push({
        x: rand(-80, W + 80),
        y: rand(H * 0.05, H * 0.35),
        w: rand(60, 140),
        h: rand(25, 45),
        speed: rand(0.1, 0.35),
        puffs: Math.floor(rand(3, 5)),
        opacity: rand(0.15, 0.35)
      });
    }

    // Floating map icons — compass symbols, waves, mountains
    var ICONS = ['N','S','E','W','~','⛰','🌊','🧭','🗺','✦','☆','◇'];
    mapIcons = [];
    for (var i = 0; i < 14; i++) {
      mapIcons.push({
        x: rand(0, W),
        y: rand(0, H),
        icon: ICONS[Math.floor(rand(0, ICONS.length))],
        size: rand(12, 28),
        speed: rand(0.06, 0.2),
        drift: rand(-0.15, 0.15),
        opacity: rand(0.04, 0.08),
        rotation: rand(-0.2, 0.2),
        rotSpeed: rand(-0.003, 0.003),
        color: ['#2E7D32','#1565C0','#F57F17','#BF360C','#4E342E','#00695C'][Math.floor(rand(0, 6))]
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
      color: c.color || 'rgba(46,125,50,0.8)',
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
    var bright = 0.85 + progress * 0.15;
    // Warm ocean/sky gradient — teal to sandy
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'hsl(195,' + Math.round(55 + progress * 15) + '%,' + Math.round(70 * bright) + '%)');
    grad.addColorStop(0.4, 'hsl(180,' + Math.round(40 + progress * 10) + '%,' + Math.round(75 * bright) + '%)');
    grad.addColorStop(0.7, 'hsl(160,' + Math.round(30 + progress * 10) + '%,' + Math.round(80 * bright) + '%)');
    grad.addColorStop(1, 'hsl(45,' + Math.round(50 + progress * 10) + '%,' + Math.round(85 * bright) + '%)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawClouds() {
    var t = time * 0.001;
    for (var i = 0; i < clouds.length; i++) {
      var c = clouds[i];
      var cx = c.x + t * c.speed * 15;
      if (cx > W + c.w) cx -= W + c.w * 2;
      if (cx < -c.w) cx += W + c.w * 2;

      ctx.globalAlpha = c.opacity;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      var pw = c.w / c.puffs;
      for (var p = 0; p < c.puffs; p++) {
        var px = cx + p * pw * 0.7;
        var py = c.y + Math.sin(p * 1.5) * c.h * 0.2;
        var pr = pw * 0.5;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawCompassRose() {
    var t = time * 0.001;
    var cx = W * 0.85, cy = H * 0.15;
    var r = Math.min(W, H) * 0.06;
    compassAngle += 0.001;
    var op = 0.15 + progress * 0.2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(compassAngle);
    ctx.globalAlpha = op;

    // Outer circle
    ctx.strokeStyle = '#BF360C';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();

    // Cardinal points
    var dirs = ['N','E','S','W'];
    for (var i = 0; i < 4; i++) {
      var angle = (i * Math.PI / 2) - Math.PI / 2;
      // Main spike
      ctx.fillStyle = i === 0 ? '#BF360C' : '#4E342E';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle - 0.15) * r * 0.3, Math.sin(angle - 0.15) * r * 0.3);
      ctx.lineTo(Math.cos(angle) * r * 0.9, Math.sin(angle) * r * 0.9);
      ctx.lineTo(Math.cos(angle + 0.15) * r * 0.3, Math.sin(angle + 0.15) * r * 0.3);
      ctx.closePath();
      ctx.fill();
    }

    // Center dot
    ctx.fillStyle = '#F57F17';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.08, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawMapIcons() {
    var t = time * 0.001;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var i = 0; i < mapIcons.length; i++) {
      var mi = mapIcons[i];
      mi.y -= mi.speed * 0.3;
      mi.x += mi.drift * 0.2;
      mi.rotation += mi.rotSpeed;
      if (mi.y < -mi.size * 2) { mi.y = H + mi.size * 2; mi.x = rand(0, W); }
      if (mi.x < -40) mi.x = W + 40;
      if (mi.x > W + 40) mi.x = -40;

      ctx.save();
      ctx.translate(mi.x, mi.y);
      ctx.rotate(mi.rotation);
      ctx.globalAlpha = mi.opacity * (0.5 + progress * 0.7);
      ctx.font = mi.size + 'px "Fredoka One","Comic Sans MS",cursive';
      ctx.fillStyle = mi.color;
      ctx.fillText(mi.icon, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // Gentle wave pattern at bottom
  function drawWaves() {
    var t = time * 0.001;
    var waveY = H * 0.85;
    var op = 0.1 + progress * 0.1;

    for (var w = 0; w < 3; w++) {
      ctx.globalAlpha = op - w * 0.02;
      ctx.strokeStyle = 'rgba(21,101,192,' + (0.15 - w * 0.03) + ')';
      ctx.lineWidth = 2;
      ctx.beginPath();
      var offY = w * 12;
      for (var x = 0; x <= W; x += 5) {
        var y = waveY + offY + Math.sin(x * 0.02 + t * (0.8 + w * 0.3)) * 6 + Math.sin(x * 0.01 + t * 0.5) * 4;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
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

  function sfxCorrect() {
    playNote(440, 0.15, 'sine', 0.07);
    playNote(554, 0.15, 'sine', 0.05, 0.05);
    playNote(659, 0.2, 'sine', 0.06, 0.1);
  }

  function sfxWrong() {
    playNote(300, 0.15, 'sine', 0.05);
    playNote(260, 0.2, 'sine', 0.03, 0.05);
  }

  function sfxComplete() {
    var notes = [440, 554, 659, 880, 1047];
    for (var i = 0; i < notes.length; i++) {
      playNote(notes[i], 0.3, 'sine', 0.06, i * 0.08);
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
    drawClouds();
    drawWaves();
    drawCompassRose();
    drawMapIcons();
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

  function onCorrect(x, y) {
    if (!canvas) return;
    var px = x || W * 0.5, py = y || H * 0.4;
    emitBurst(px, py, 8, {
      spread: 5, rise: 1.5, decay: 0.025, size: 3,
      color: 'rgba(46,125,50,0.8)'
    });
    emitBurst(px, py, 4, {
      spread: 3, rise: 1, decay: 0.03, size: 2,
      color: 'rgba(245,127,23,0.7)'
    });
    sfxCorrect();
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
      color: 'rgba(46,125,50,0.8)'
    });
    emitBurst(W * 0.5, H * 0.35, 10, {
      spread: 6, rise: 1.5, decay: 0.018, size: 3,
      color: 'rgba(0,105,92,0.7)'
    });
    sfxComplete();
  }

  function setProgress(pct) {
    targetProgress = Math.max(0, Math.min(1, pct || 0));
  }

  window.ClassmatesGeographyFX = {
    init: init,
    start: start,
    stop: stop,
    onCorrect: onCorrect,
    onWrong: onWrong,
    onComplete: onComplete,
    setProgress: setProgress
  };
})();
