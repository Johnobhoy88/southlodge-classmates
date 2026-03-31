(function(){
  // ============================================================
  // SOUTH LODGE CLASSMATES — PREMIUM SPELLING FX ENGINE
  // "Word Forest" — where every letter makes the world come alive
  // ============================================================

  var canvas, ctx, animId, running = false;
  var W = 0, H = 0;
  var progress = 0, brightness = 0.65;
  var particles = [];
  var fireflies = [];
  var flowers = [];
  var clouds = [];
  var hills = [];
  var trees = [];

  // ==================== PARTICLE SYSTEM ====================
  function spawnParticle(x, y, config) {
    var c = config || {};
    particles.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * (c.spread || 4),
      vy: (Math.random() - 0.5) * (c.spread || 4) - (c.rise || 1),
      life: 1, decay: c.decay || 0.02,
      size: c.size || 3 + Math.random() * 3,
      color: c.color || 'rgba(253,203,110,0.8)',
      shape: c.shape || 'circle',
      gravity: c.gravity || 0
    });
  }

  function emitBurst(x, y, count, config) {
    for (var i = 0; i < count; i++) spawnParticle(x, y, config);
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
      if (p.shape === 'star') {
        drawStar(p.x, p.y, p.size, 5);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawStar(cx, cy, r, points) {
    ctx.beginPath();
    for (var i = 0; i < points * 2; i++) {
      var radius = i % 2 === 0 ? r : r * 0.4;
      var angle = (i * Math.PI / points) - Math.PI / 2;
      if (i === 0) ctx.moveTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
      else ctx.lineTo(cx + radius * Math.cos(angle), cy + radius * Math.sin(angle));
    }
    ctx.closePath();
    ctx.fill();
  }

  // ==================== SCENE: WORD FOREST ====================
  function generateScene() {
    // Hills (3 layers, parallax feel)
    hills = [
      { y: 0.65, color: '#4a7c59', amplitude: 40, frequency: 0.008 },
      { y: 0.72, color: '#3d6b4e', amplitude: 30, frequency: 0.012 },
      { y: 0.82, color: '#2d5a3f', amplitude: 20, frequency: 0.015 }
    ];

    // Trees
    trees = [];
    for (var i = 0; i < 12; i++) {
      trees.push({
        x: Math.random() * W,
        baseY: 0,
        height: 20 + Math.random() * 25,
        width: 8 + Math.random() * 6,
        color: ['#2d6b3f', '#3a7d4f', '#4a8d5f', '#1d5b2f'][Math.floor(Math.random() * 4)],
        trunk: '#5d4037',
        sway: Math.random() * Math.PI * 2
      });
    }

    // Fireflies
    fireflies = [];
    for (var j = 0; j < 18; j++) {
      fireflies.push({
        x: Math.random() * W,
        y: H * 0.3 + Math.random() * H * 0.5,
        baseX: 0, baseY: 0,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.5,
        size: 1.5 + Math.random() * 2,
        glow: Math.random()
      });
    }

    // Flower positions along a path
    flowers = [];
    for (var k = 0; k < 10; k++) {
      var fx = W * 0.1 + (W * 0.8) * (k / 9);
      flowers.push({
        x: fx,
        y: H * 0.78 + Math.sin(k * 0.7) * 15,
        bloom: 0, // 0 = bud, 1 = full bloom
        color: ['#e84393', '#fdcb6e', '#00b894', '#6c5ce7', '#e17055', '#0984e3', '#00cec9', '#fd79a8', '#ffeaa7', '#55efc4'][k],
        petalCount: 5 + Math.floor(Math.random() * 3)
      });
    }

    // Clouds
    clouds = [];
    for (var c = 0; c < 3; c++) {
      clouds.push({
        x: Math.random() * W,
        y: H * 0.08 + Math.random() * H * 0.15,
        width: 40 + Math.random() * 50,
        speed: 0.15 + Math.random() * 0.2,
        opacity: 0.15 + Math.random() * 0.15
      });
    }
  }

  function drawSky(time) {
    // Warm amber gradient sky
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    var b = brightness;
    grad.addColorStop(0, 'rgba(' + Math.round(180 * b) + ',' + Math.round(140 * b) + ',' + Math.round(80 * b) + ',1)');
    grad.addColorStop(0.4, 'rgba(' + Math.round(160 * b) + ',' + Math.round(180 * b) + ',' + Math.round(120 * b) + ',1)');
    grad.addColorStop(1, 'rgba(' + Math.round(45 * b) + ',' + Math.round(90 * b) + ',' + Math.round(63 * b) + ',1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawClouds(time) {
    for (var i = 0; i < clouds.length; i++) {
      var c = clouds[i];
      c.x += c.speed;
      if (c.x > W + c.width) c.x = -c.width;
      ctx.globalAlpha = c.opacity * brightness;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.width * 0.5, c.width * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(c.x - c.width * 0.2, c.y + 3, c.width * 0.3, c.width * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(c.x + c.width * 0.2, c.y + 2, c.width * 0.35, c.width * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawHills(time) {
    for (var i = 0; i < hills.length; i++) {
      var h = hills[i];
      ctx.fillStyle = h.color;
      ctx.globalAlpha = brightness;
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (var x = 0; x <= W; x += 4) {
        var y = H * h.y + Math.sin(x * h.frequency + time * 0.0003 * (i + 1)) * h.amplitude;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawTrees(time) {
    for (var i = 0; i < trees.length; i++) {
      var t = trees[i];
      var hillY = H * 0.72 + Math.sin(t.x * 0.012 + time * 0.0003) * 30;
      var sway = Math.sin(time * 0.001 + t.sway) * 2;

      // Trunk
      ctx.fillStyle = t.trunk;
      ctx.globalAlpha = brightness;
      ctx.fillRect(t.x - 2, hillY - t.height * 0.4, 4, t.height * 0.4);

      // Canopy (triangle)
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.moveTo(t.x + sway, hillY - t.height);
      ctx.lineTo(t.x - t.width / 2, hillY - t.height * 0.35);
      ctx.lineTo(t.x + t.width / 2, hillY - t.height * 0.35);
      ctx.closePath();
      ctx.fill();

      // Second layer
      ctx.beginPath();
      ctx.moveTo(t.x + sway * 0.7, hillY - t.height * 0.75);
      ctx.lineTo(t.x - t.width * 0.6, hillY - t.height * 0.15);
      ctx.lineTo(t.x + t.width * 0.6, hillY - t.height * 0.15);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawPath() {
    ctx.strokeStyle = 'rgba(139,119,91,' + (brightness * 0.6) + ')';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(W * 0.05, H * 0.82);
    for (var i = 0; i < 10; i++) {
      var fx = W * 0.1 + (W * 0.8) * (i / 9);
      var fy = H * 0.78 + Math.sin(i * 0.7) * 15;
      ctx.lineTo(fx, fy + 10);
    }
    ctx.lineTo(W * 0.95, H * 0.82);
    ctx.stroke();
  }

  function drawFlowers(time) {
    for (var i = 0; i < flowers.length; i++) {
      var f = flowers[i];
      if (f.bloom <= 0) {
        // Bud
        ctx.fillStyle = 'rgba(100,100,80,' + (brightness * 0.5) + ')';
        ctx.beginPath();
        ctx.arc(f.x, f.y, 3, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      var r = 4 + f.bloom * 6;
      var wobble = Math.sin(time * 0.002 + i) * 0.1;
      ctx.globalAlpha = brightness;
      // Petals
      for (var p = 0; p < f.petalCount; p++) {
        var angle = (p / f.petalCount) * Math.PI * 2 + wobble;
        var px = f.x + Math.cos(angle) * r * 0.7;
        var py = f.y + Math.sin(angle) * r * 0.7;
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.ellipse(px, py, r * 0.4, r * 0.25, angle, 0, Math.PI * 2);
        ctx.fill();
      }
      // Center
      ctx.fillStyle = '#fdcb6e';
      ctx.beginPath();
      ctx.arc(f.x, f.y, r * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function drawFireflies(time) {
    for (var i = 0; i < fireflies.length; i++) {
      var f = fireflies[i];
      f.x += Math.sin(time * 0.001 * f.speed + f.phase) * 0.3;
      f.y += Math.cos(time * 0.0008 * f.speed + f.phase) * 0.2;
      f.glow = 0.3 + Math.sin(time * 0.003 + f.phase) * 0.3;

      var alpha = f.glow * brightness;
      ctx.fillStyle = 'rgba(253,235,150,' + alpha + ')';
      ctx.shadowColor = 'rgba(253,235,150,' + (alpha * 0.5) + ')';
      ctx.shadowBlur = f.size * 4;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
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
    var t = ac.currentTime + (delay || 0);
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume || 0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration);
  }

  // Musical scale for letter reveals — each letter goes up a note
  var SCALE = [262, 294, 330, 349, 392, 440, 494, 523, 587, 659, 698, 784, 880, 988, 1047];

  function sfxLetterReveal(noteIndex) {
    var freq = SCALE[Math.min(noteIndex, SCALE.length - 1)];
    playNote(freq, 0.2, 'sine', 0.12);
    playNote(freq * 1.5, 0.15, 'sine', 0.06, 0.05); // harmony
  }

  function sfxKeyTick() {
    var ac = getAudio();
    if (!ac) return;
    var t = ac.currentTime;
    var buf = ac.createBuffer(1, ac.sampleRate * 0.02, ac.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.03;
    var src = ac.createBufferSource();
    src.buffer = buf;
    var filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    src.connect(filter);
    filter.connect(ac.destination);
    src.start(t);
  }

  function sfxWordComplete() {
    // Major arpeggio: C5 E5 G5 C6 with sustain
    var notes = [523, 659, 784, 1047];
    for (var i = 0; i < notes.length; i++) {
      playNote(notes[i], 0.4 - i * 0.05, 'sine', 0.1, i * 0.1);
      playNote(notes[i] * 0.5, 0.5 - i * 0.05, 'triangle', 0.04, i * 0.1); // bass
    }
  }

  function sfxGentleWrong() {
    playNote(300, 0.2, 'sine', 0.08);
    playNote(250, 0.25, 'sine', 0.06, 0.08);
  }

  function sfxNearMiss() {
    playNote(392, 0.2, 'triangle', 0.08);
    playNote(349, 0.25, 'triangle', 0.06, 0.1);
    playNote(330, 0.3, 'triangle', 0.04, 0.2);
  }

  // ==================== ANIMATION LOOP ====================
  var lastTime = 0;

  function loop(time) {
    if (!running) return;
    var dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    // Resize if needed
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      W = canvas.width = canvas.clientWidth;
      H = canvas.height = canvas.clientHeight;
      generateScene();
    }

    // Target brightness based on progress
    var targetBrightness = 0.65 + progress * 0.35;
    brightness += (targetBrightness - brightness) * 0.02;

    // Draw scene layers
    drawSky(time);
    drawClouds(time);
    drawHills(time);
    drawPath();
    drawTrees(time);
    drawFlowers(time);
    drawFireflies(time);

    // Draw particles on top
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
    progress = 0;
    brightness = 0.65;
    particles = [];
    lastTime = performance.now();
    animId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    animId = null;
  }

  function onCorrectLetter(slotIndex, totalRevealed) {
    if (!canvas) return;
    // Sparkle burst from approximate slot position
    var slotX = W * 0.2 + (W * 0.6) * (slotIndex / 12);
    var slotY = H * 0.45;
    emitBurst(slotX, slotY, 10, {
      spread: 5, rise: 2, decay: 0.03, size: 3,
      color: 'rgba(253,203,110,0.9)', shape: 'star'
    });
    sfxLetterReveal(totalRevealed || slotIndex);
    sfxKeyTick();
  }

  function onWrongLetter(livesLeft) {
    if (!canvas) return;
    // Falling embers
    emitBurst(W * 0.5, H * 0.4, 5, {
      spread: 3, rise: -1, gravity: 0.05, decay: 0.015, size: 2,
      color: 'rgba(231,76,60,0.6)'
    });
    sfxGentleWrong();
  }

  function onWordComplete(progressPct) {
    progress = progressPct;
    if (!canvas) return;

    // Celebration burst
    emitBurst(W * 0.5, H * 0.4, 25, {
      spread: 8, rise: 3, decay: 0.015, size: 4,
      color: 'rgba(46,204,113,0.8)', shape: 'star'
    });

    // Bloom next flower
    var flowerIdx = Math.floor(progressPct * flowers.length);
    if (flowerIdx < flowers.length && flowers[flowerIdx].bloom < 1) {
      flowers[flowerIdx].bloom = 1;
    }

    sfxWordComplete();
  }

  function onWordFailed(wasClose) {
    if (!canvas) return;
    // Grey rain
    emitBurst(W * 0.5, H * 0.2, 8, {
      spread: 6, rise: -2, gravity: 0.08, decay: 0.01, size: 2,
      color: 'rgba(178,190,195,0.5)'
    });
    if (wasClose) sfxNearMiss();
    else sfxGentleWrong();
  }

  function onGameComplete(correct, total) {
    if (!canvas) return;
    // All flowers bloom
    for (var i = 0; i < flowers.length; i++) flowers[i].bloom = 1;
    brightness = 1;
    // Rainbow burst
    var colors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
    for (var j = 0; j < 40; j++) {
      emitBurst(W * 0.5, H * 0.4, 1, {
        spread: 10, rise: 4, decay: 0.01, size: 4 + Math.random() * 3,
        color: colors[j % colors.length], shape: 'star'
      });
    }
    sfxWordComplete();
    // Second jingle delayed
    setTimeout(function() {
      playNote(1047, 0.5, 'sine', 0.12);
      playNote(1319, 0.5, 'sine', 0.08, 0.15);
    }, 400);
  }

  window.ClassmatesSpellingFX = {
    init: init,
    start: start,
    stop: stop,
    onCorrectLetter: onCorrectLetter,
    onWrongLetter: onWrongLetter,
    onWordComplete: onWordComplete,
    onWordFailed: onWordFailed,
    onGameComplete: onGameComplete
  };
})();
