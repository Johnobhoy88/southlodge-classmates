(function(){
  // ============================================================
  // MATHS — "Star Station"
  // A colourful space observatory. The kid gazes into the cosmos
  // and the universe comes alive as they solve maths problems.
  // For the kids of South Lodge Primary, Invergordon
  // ============================================================

  var canvas, ctx, animId, running = false;
  var W = 0, H = 0;
  var progress = 0, targetProgress = 0, brightness = 0.55;
  var particles = [];
  var time = 0;

  // Scene elements
  var stars = [];
  var nebulae = [];
  var planets = [];
  var constellations = [];
  var floatingSymbols = [];
  var comets = [];
  var nextComet = 8000;

  function rand(a, b) { return a + Math.random() * (b - a); }

  // ==================== PARTICLE SYSTEM ====================
  function spawnParticle(x, y, c) {
    c = c || {};
    if (particles.length > 120) return;
    particles.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * (c.spread || 4),
      vy: (Math.random() - 0.5) * (c.spread || 4) - (c.rise || 1),
      life: 1, decay: c.decay || 0.02,
      size: c.size || 3 + Math.random() * 3,
      color: c.color || 'rgba(255,215,0,0.8)',
      shape: c.shape || 'circle',
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

  function drawStar5(cx, cy, r) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var rad = i % 2 === 0 ? r : r * 0.4;
      var angle = (i * Math.PI / 5) - Math.PI / 2;
      if (i === 0) ctx.moveTo(cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad);
      else ctx.lineTo(cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad);
    }
    ctx.closePath();
    ctx.fill();
  }

  function drawParticles() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.globalAlpha = p.life * 0.8;
      ctx.fillStyle = p.color;
      if (p.shape === 'star') {
        drawStar5(p.x, p.y, p.size * p.life);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // ==================== SCENE GENERATION ====================
  function generateScene() {
    if (!W || !H) return;

    // Stars — 3 tiers
    stars = [];
    for (var i = 0; i < 50; i++) {
      stars.push({ x: rand(0, W), y: rand(0, H * 0.85), size: rand(0.5, 1), twinkle: rand(0, Math.PI * 2), speed: rand(0.8, 2), tier: 0 });
    }
    for (var i = 0; i < 25; i++) {
      stars.push({ x: rand(0, W), y: rand(0, H * 0.8), size: rand(1.5, 2.5), twinkle: rand(0, Math.PI * 2), speed: rand(1, 2.5), tier: 1 });
    }
    for (var i = 0; i < 8; i++) {
      stars.push({ x: rand(0, W), y: rand(0, H * 0.7), size: rand(3, 4), twinkle: rand(0, Math.PI * 2), speed: rand(1.5, 3), tier: 2 });
    }

    // Nebulae — 2 overlapping
    nebulae = [
      { cx: W * 0.3, cy: H * 0.35, r: Math.max(W, H) * 0.3, color: 'rgba(255,0,102,', driftX: 0.15, driftY: 0.1, phase: 0 },
      { cx: W * 0.6, cy: H * 0.3, r: Math.max(W, H) * 0.25, color: 'rgba(0,212,255,', driftX: -0.1, driftY: 0.12, phase: Math.PI * 0.7 }
    ];

    // Planets
    planets = [
      { x: W * 0.82, y: H * 0.15, r: 12, color1: '#ff6b6b', color2: '#c0392b', hasRing: false, bobSpeed: 0.3, bobAmp: 8, drift: 0 },
      { x: W * 0.2, y: H * 0.4, r: 18, color1: '#ffd93d', color2: '#f0a500', hasRing: true, ringColor: '#fde68a', bobSpeed: 0.2, bobAmp: 5, drift: 0.08 },
      { x: W * 0.65, y: H * 0.65, r: 22, color1: '#74b9ff', color2: '#0984e3', hasRing: false, bobSpeed: 0.15, bobAmp: 10, drift: -0.05 },
      { x: W * 0.45, y: H * 0.25, r: 6, color1: '#55efc4', color2: '#00b894', hasRing: false, bobSpeed: 0.4, bobAmp: 4, drift: 0, minProgress: 0.5 }
    ];

    // Number constellations — 3 groups forming loose digit shapes
    constellations = [];
    var constellationData = [
      // A loose "7" shape
      [{ x: W * 0.12, y: H * 0.15 }, { x: W * 0.18, y: H * 0.15 }, { x: W * 0.18, y: H * 0.2 }, { x: W * 0.16, y: H * 0.28 }],
      // A loose "+" shape
      [{ x: W * 0.5, y: H * 0.08 }, { x: W * 0.5, y: H * 0.16 }, { x: W * 0.46, y: H * 0.12 }, { x: W * 0.54, y: H * 0.12 }],
      // A loose "3" shape
      [{ x: W * 0.88, y: H * 0.45 }, { x: W * 0.92, y: H * 0.48 }, { x: W * 0.88, y: H * 0.52 }, { x: W * 0.92, y: H * 0.55 }, { x: W * 0.88, y: H * 0.58 }]
    ];
    for (var g = 0; g < constellationData.length; g++) {
      constellations.push({ points: constellationData[g], rotation: 0, rotSpeed: rand(-0.0003, 0.0003) });
    }

    // Floating symbols
    var SYMS = '+\u2212\u00D7\u00F7=0123456789';
    floatingSymbols = [];
    for (var i = 0; i < 14; i++) {
      floatingSymbols.push({
        x: rand(0, W), y: rand(0, H),
        char: SYMS[Math.floor(rand(0, SYMS.length))],
        size: rand(10, 20),
        speed: rand(0.06, 0.18),
        drift: rand(-0.15, 0.15),
        opacity: rand(0.03, 0.06),
        rotation: rand(-0.3, 0.3),
        rotSpeed: rand(-0.003, 0.003),
        isGold: Math.random() > 0.5
      });
    }

    comets = [];
    nextComet = 5000 + Math.random() * 10000;
  }

  // ==================== DRAWING LAYERS ====================

  function drawSky() {
    var b = brightness;
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'hsl(245,' + Math.round(60 + progress * 10) + '%,' + Math.round(6 * b) + '%)');
    grad.addColorStop(0.4, 'hsl(265,' + Math.round(50 + progress * 10) + '%,' + Math.round(10 * b) + '%)');
    grad.addColorStop(1, 'hsl(220,' + Math.round(55 + progress * 10) + '%,' + Math.round(12 * b) + '%)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawStars() {
    var t = time * 0.001;
    var visiblePct = 0.6 + progress * 0.4;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      // Skip some stars at low progress
      if (i / stars.length > visiblePct) continue;
      var twink = 0.3 + Math.sin(t * s.speed + s.twinkle) * 0.4 + 0.3;
      var alpha = twink * brightness * 1.4;
      ctx.globalAlpha = Math.min(1, alpha);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();

      // Cross flare for large stars
      if (s.tier === 2) {
        ctx.globalAlpha = twink * 0.4 * brightness;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 0.5;
        var flareLen = s.size * 3 + Math.sin(t * s.speed * 0.5 + s.twinkle) * s.size;
        ctx.beginPath();
        ctx.moveTo(s.x - flareLen, s.y);
        ctx.lineTo(s.x + flareLen, s.y);
        ctx.moveTo(s.x, s.y - flareLen);
        ctx.lineTo(s.x, s.y + flareLen);
        ctx.stroke();
        // Diagonal flare at half length
        var dFlare = flareLen * 0.5;
        ctx.globalAlpha = twink * 0.2 * brightness;
        ctx.beginPath();
        ctx.moveTo(s.x - dFlare, s.y - dFlare);
        ctx.lineTo(s.x + dFlare, s.y + dFlare);
        ctx.moveTo(s.x + dFlare, s.y - dFlare);
        ctx.lineTo(s.x - dFlare, s.y + dFlare);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawNebulae() {
    var t = time * 0.001;
    var nebAlpha = 0.08 + progress * 0.35;
    for (var i = 0; i < nebulae.length; i++) {
      var n = nebulae[i];
      // Figure-8 drift
      var cx = n.cx + Math.sin(t * n.driftX + n.phase) * 30;
      var cy = n.cy + Math.cos(t * n.driftY + n.phase) * 20;
      var r = n.r * (0.9 + progress * 0.2);
      ctx.globalAlpha = nebAlpha;
      var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, n.color + (0.15 + progress * 0.1) + ')');
      g.addColorStop(0.4, n.color + (0.06 + progress * 0.04) + ')');
      g.addColorStop(1, n.color + '0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawPlanets() {
    var t = time * 0.001;
    for (var i = 0; i < planets.length; i++) {
      var p = planets[i];
      if (p.minProgress && progress < p.minProgress) continue;
      var px = p.x + Math.sin(t * p.drift * 10) * 15;
      var py = p.y + Math.sin(t * p.bobSpeed) * p.bobAmp;
      var glow = 0.6 + progress * 0.4;

      // Halo glow
      ctx.globalAlpha = 0.08 * glow;
      var haloG = ctx.createRadialGradient(px, py, p.r, px, py, p.r * 2.5);
      haloG.addColorStop(0, p.color1);
      haloG.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = haloG;
      ctx.beginPath();
      ctx.arc(px, py, p.r * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Planet body
      ctx.globalAlpha = glow;
      var pg = ctx.createRadialGradient(px - p.r * 0.3, py - p.r * 0.3, 0, px, py, p.r);
      pg.addColorStop(0, '#fff');
      pg.addColorStop(0.25, p.color1);
      pg.addColorStop(1, p.color2);
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fill();

      // Ring
      if (p.hasRing) {
        ctx.globalAlpha = 0.5 * glow;
        ctx.strokeStyle = p.ringColor || '#fde68a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(px, py, p.r * 1.8, p.r * 0.4, 0.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawConstellations() {
    var t = time * 0.001;
    var lineAlpha = 0.03 + progress * 0.08;
    var dotAlpha = 0.15 + progress * 0.3;

    for (var g = 0; g < constellations.length; g++) {
      var c = constellations[g];
      c.rotation += c.rotSpeed;
      var pts = c.points;

      // Lines
      ctx.globalAlpha = lineAlpha;
      ctx.strokeStyle = '#a5b4fc';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      for (var j = 0; j < pts.length; j++) {
        if (j === 0) ctx.moveTo(pts[j].x, pts[j].y);
        else ctx.lineTo(pts[j].x, pts[j].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Dots
      ctx.fillStyle = '#c7d2fe';
      for (var j = 0; j < pts.length; j++) {
        ctx.globalAlpha = dotAlpha;
        ctx.beginPath();
        ctx.arc(pts[j].x, pts[j].y, 2 + Math.sin(t * 2 + j) * 0.5, 0, Math.PI * 2);
        ctx.fill();
        // Tiny glow
        ctx.globalAlpha = dotAlpha * 0.3;
        ctx.beginPath();
        ctx.arc(pts[j].x, pts[j].y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawFloatingSymbols() {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var i = 0; i < floatingSymbols.length; i++) {
      var s = floatingSymbols[i];
      s.y -= s.speed * 0.3;
      s.x += s.drift * 0.2;
      s.rotation += s.rotSpeed;
      if (s.y < -s.size * 2) { s.y = H + s.size * 2; s.x = rand(0, W); }
      if (s.x < -30) s.x = W + 30;
      if (s.x > W + 30) s.x = -30;

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation);
      ctx.globalAlpha = s.opacity * (0.5 + progress * 0.6);
      ctx.font = s.size + 'px "Fredoka One","Comic Sans MS",cursive';
      ctx.fillStyle = s.isGold ? '#ffd700' : '#c0c0c0';
      ctx.fillText(s.char, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawComets(dt) {
    var t = time;
    // Spawn
    if (progress > 0.25 && comets.length < 2) {
      nextComet -= dt * 1000;
      if (nextComet <= 0) {
        comets.push({
          x: rand(-50, W * 0.3),
          y: rand(-50, H * 0.2),
          vx: rand(3, 6),
          vy: rand(1, 3),
          life: 1,
          trail: []
        });
        nextComet = rand(8000, 18000) * (1.5 - progress);
      }
    }
    for (var i = comets.length - 1; i >= 0; i--) {
      var c = comets[i];
      // Save trail
      c.trail.push({ x: c.x, y: c.y });
      if (c.trail.length > 8) c.trail.shift();
      c.x += c.vx * dt * 60;
      c.y += c.vy * dt * 60;
      c.life -= 0.004 * dt * 60;
      if (c.life <= 0 || c.x > W + 50 || c.y > H + 50) {
        comets.splice(i, 1);
        continue;
      }
      // Draw trail
      for (var j = 0; j < c.trail.length; j++) {
        var tp = c.trail[j];
        var trailAlpha = (j / c.trail.length) * c.life * 0.4;
        var trailSize = 1 + (j / c.trail.length) * 2;
        ctx.globalAlpha = trailAlpha;
        // Gradient from white to blue
        var blue = Math.round(100 + (1 - j / c.trail.length) * 155);
        ctx.fillStyle = 'rgb(' + blue + ',' + blue + ',255)';
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, trailSize, 0, Math.PI * 2);
        ctx.fill();
      }
      // Head
      ctx.globalAlpha = c.life;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(c.x, c.y, 3, 0, Math.PI * 2);
      ctx.fill();
      // Head glow
      ctx.globalAlpha = c.life * 0.3;
      var hg = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, 10);
      hg.addColorStop(0, 'rgba(255,255,255,0.5)');
      hg.addColorStop(1, 'rgba(100,150,255,0)');
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawTelescope() {
    // Bottom-right silhouette
    var tx = W * 0.88, ty = H * 0.92;
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#05051a';
    ctx.strokeStyle = '#05051a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // Tripod legs
    ctx.beginPath();
    ctx.moveTo(tx, ty - 20);
    ctx.lineTo(tx - 18, ty + 10);
    ctx.moveTo(tx, ty - 20);
    ctx.lineTo(tx + 18, ty + 10);
    ctx.moveTo(tx, ty - 20);
    ctx.lineTo(tx + 5, ty + 10);
    ctx.stroke();

    // Tube
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(tx - 2, ty - 18);
    ctx.lineTo(tx - 22, ty - 45);
    ctx.stroke();

    // Lens end
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(tx - 24, ty - 48);
    ctx.lineTo(tx - 20, ty - 42);
    ctx.stroke();

    // Red power dot (pulsing after 50% progress)
    if (progress > 0.5) {
      var t = time * 0.001;
      var pulse = 0.5 + Math.sin(t * 2) * 0.3;
      ctx.globalAlpha = pulse * 0.8;
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(tx - 1, ty - 20, 1.5, 0, Math.PI * 2);
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

  // Crystalline major scale — C D E F G A B (differs from spelling's pentatonic)
  var CRYSTAL_SCALE = [523, 587, 659, 698, 784, 880, 988, 1047, 1175, 1319];

  function sfxCorrect(noteIndex) {
    var freq = CRYSTAL_SCALE[Math.min(noteIndex || 0, CRYSTAL_SCALE.length - 1)];
    // Crystalline chime: sine + triangle harmonic
    playNote(freq, 0.3, 'sine', 0.09);
    playNote(freq * 2, 0.2, 'triangle', 0.03, 0.02);
    // Shimmer
    playNote(freq * 3, 0.12, 'sine', 0.015, 0.05);
  }

  function sfxWrong() {
    // Low bell: G3 + Ab3 minor second
    playNote(196, 0.5, 'sine', 0.06);
    playNote(208, 0.4, 'sine', 0.04, 0.06);
  }

  function sfxGameComplete() {
    // Ascending arpeggio
    var asc = [523, 659, 784, 1047];
    for (var i = 0; i < asc.length; i++) {
      playNote(asc[i], 0.4, 'sine', 0.08, i * 0.1);
      playNote(asc[i] * 2, 0.25, 'triangle', 0.025, i * 0.1);
    }
    // Descending sparkle
    setTimeout(function() {
      var desc = [1047, 784, 659, 523];
      for (var i = 0; i < desc.length; i++) {
        playNote(desc[i], 0.3, 'sine', 0.06, i * 0.08);
      }
    }, 450);
    // Final sustain chord
    setTimeout(function() {
      playNote(523, 0.6, 'sine', 0.05);
      playNote(659, 0.6, 'sine', 0.04);
      playNote(784, 0.6, 'triangle', 0.03);
    }, 800);
  }

  // ==================== MAIN LOOP ====================
  var lastTime = 0;

  function loop(t) {
    if (!running) return;
    var dt = Math.min((t - lastTime) / 1000, 0.05);
    lastTime = t;
    time = t;

    // Resize
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      W = canvas.width = canvas.clientWidth;
      H = canvas.height = canvas.clientHeight;
      generateScene();
    }

    // Smooth progress and brightness
    progress += (targetProgress - progress) * 0.03;
    var targetBright = 0.55 + progress * 0.45;
    brightness += (targetBright - brightness) * 0.02;

    // Draw all layers back-to-front
    drawSky();
    drawStars();
    drawNebulae();
    drawConstellations();
    drawPlanets();
    drawFloatingSymbols();
    drawComets(dt);
    drawTelescope();

    // Particles on top
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
    brightness = 0.55;
    particles = [];
    comets = [];
    nextComet = 5000 + Math.random() * 10000;
    lastTime = performance.now();
    animId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    animId = null;
  }

  function onCorrect(noteIndex) {
    if (!canvas) return;
    var cx = W * 0.5, cy = H * 0.4;
    // Golden number sparks
    emitBurst(cx, cy, 12, {
      spread: 6, rise: 2, decay: 0.02, size: 3.5,
      color: 'rgba(255,215,0,0.9)', shape: 'star'
    });
    // Warm white sparks
    emitBurst(cx, cy, 6, {
      spread: 4, rise: 1.5, decay: 0.025, size: 2.5,
      color: 'rgba(255,240,200,0.7)'
    });
    sfxCorrect(noteIndex);
  }

  function onWrong() {
    if (!canvas) return;
    // Blue-purple cold embers, drift down
    emitBurst(W * 0.5, H * 0.4, 6, {
      spread: 3, rise: -0.5, gravity: 0.04, decay: 0.012, size: 2.5,
      color: 'rgba(100,100,220,0.5)'
    });
    sfxWrong();
  }

  function onComplete(pct) {
    targetProgress = pct || 1;
    if (!canvas) return;
    // Massive rainbow burst
    var colors = ['rgba(255,215,0,0.8)','rgba(255,107,107,0.7)','rgba(116,185,255,0.7)','rgba(85,239,196,0.7)','rgba(162,155,254,0.7)','rgba(253,203,110,0.7)'];
    for (var w = 0; w < 2; w++) {
      for (var i = 0; i < colors.length; i++) {
        emitBurst(W * (0.15 + i * 0.14), H * (0.25 + w * 0.15), 5, {
          spread: 8, rise: 3, decay: 0.012, size: 4,
          color: colors[i], shape: 'star'
        });
      }
    }
    sfxGameComplete();
  }

  function setProgress(pct) {
    targetProgress = Math.max(0, Math.min(1, pct || 0));
  }

  window.ClassmatesMathsScene = {
    init: init,
    start: start,
    stop: stop,
    onCorrect: onCorrect,
    onWrong: onWrong,
    onComplete: onComplete,
    setProgress: setProgress
  };
})();
