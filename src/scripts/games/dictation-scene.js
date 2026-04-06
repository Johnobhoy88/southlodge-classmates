(function(){
  // ============================================================
  // DICTATION — "Crystal Cave"
  // A glowing crystal cavern deep underground. Crystals pulse
  // when words are spoken, bioluminescent creatures drift in
  // the dark, an underground pool reflects the light above.
  // For the kids of South Lodge Primary, Invergordon
  // ============================================================

  var canvas, ctx, animId, running = false;
  var W = 0, H = 0;
  var progress = 0, targetProgress = 0, brightness = 0.75;
  var particles = [];
  var time = 0;
  var crystalPulse = 0; // spikes when word is spoken

  // Scene elements
  var crystals = [];
  var stalactites = [];
  var creatures = [];
  var caveDust = [];
  var droplets = [];
  var ripples = [];
  var nextDrop = 3000;

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
      color: c.color || 'rgba(180,130,255,0.8)',
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
      if (p.shape === 'star') drawStar5(p.x, p.y, p.size * p.life);
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }

  // ==================== SCENE GENERATION ====================
  function generateScene() {
    if (!W || !H) return;

    // Crystal clusters on cave walls
    var crystalColors = [
      { h: 'rgba(160,80,255,', name: 'amethyst' },    // purple
      { h: 'rgba(80,220,220,', name: 'aquamarine' },   // cyan
      { h: 'rgba(255,120,160,', name: 'rose' },         // pink
      { h: 'rgba(255,200,60,', name: 'topaz' },         // gold
      { h: 'rgba(100,180,255,', name: 'sapphire' }      // blue
    ];
    crystals = [];
    // Left wall crystals
    for (var i = 0; i < 5; i++) {
      var cc = crystalColors[i % crystalColors.length];
      crystals.push({
        x: rand(W * 0.02, W * 0.15),
        y: rand(H * 0.15, H * 0.65),
        length: rand(25, 50),
        width: rand(8, 16),
        angle: rand(-0.5, 0.5) + Math.PI * 0.15, // pointing inward
        colorBase: cc.h,
        glowRadius: rand(20, 40),
        pulsePhase: rand(0, Math.PI * 2),
        pulseSpeed: rand(0.5, 1.5)
      });
    }
    // Right wall crystals
    for (var i = 0; i < 5; i++) {
      var cc = crystalColors[(i + 2) % crystalColors.length];
      crystals.push({
        x: rand(W * 0.85, W * 0.98),
        y: rand(H * 0.15, H * 0.65),
        length: rand(25, 50),
        width: rand(8, 16),
        angle: rand(-0.5, 0.5) - Math.PI * 0.15, // pointing inward
        colorBase: cc.h,
        glowRadius: rand(20, 40),
        pulsePhase: rand(0, Math.PI * 2),
        pulseSpeed: rand(0.5, 1.5)
      });
    }

    // Stalactites
    stalactites = [];
    for (var i = 0; i < 8; i++) {
      stalactites.push({
        x: rand(W * 0.05, W * 0.95),
        width: rand(6, 18),
        height: rand(20, 60),
        dropPhase: rand(0, 100)
      });
    }

    // Bioluminescent creatures
    creatures = [];
    for (var i = 0; i < 18; i++) {
      var cColors = ['rgba(120,240,255,','rgba(255,150,200,','rgba(255,220,100,','rgba(160,255,200,'];
      creatures.push({
        x: rand(W * 0.1, W * 0.9),
        y: rand(H * 0.2, H * 0.7),
        size: rand(1.5, 4),
        color: cColors[Math.floor(rand(0, cColors.length))],
        speedX: rand(-0.15, 0.15),
        speedY: rand(-0.1, 0.1),
        phase: rand(0, Math.PI * 2),
        pulseSpeed: rand(1, 3),
        minProgress: i < 8 ? 0 : (i < 14 ? 0.25 : 0.5) // more appear with progress
      });
    }

    // Cave dust
    caveDust = [];
    for (var i = 0; i < 25; i++) {
      caveDust.push({
        x: rand(0, W), y: rand(0, H),
        size: rand(0.5, 1.5),
        speedX: rand(-0.08, 0.08),
        speedY: rand(-0.05, 0.05),
        opacity: rand(0.02, 0.05)
      });
    }

    droplets = [];
    ripples = [];
    nextDrop = 2000 + Math.random() * 4000;
  }

  // ==================== DRAWING LAYERS ====================

  // Layer 1: Cave background
  function drawCaveWalls() {
    var b = brightness;
    // Main gradient — deep violet at top, near-black at bottom
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'hsl(260,' + Math.round(40 + progress * 15) + '%,' + Math.round(12 * b) + '%)');
    grad.addColorStop(0.3, 'hsl(250,' + Math.round(35 + progress * 10) + '%,' + Math.round(8 * b) + '%)');
    grad.addColorStop(0.7, 'hsl(240,' + Math.round(30 + progress * 10) + '%,' + Math.round(5 * b) + '%)');
    grad.addColorStop(1, 'hsl(230,' + Math.round(25) + '%,' + Math.round(3 * b) + '%)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Cave wall texture — dark radial vignette from center
    var vig = ctx.createRadialGradient(W * 0.5, H * 0.4, W * 0.15, W * 0.5, H * 0.4, W * 0.7);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    // Rocky wall edges — rough shapes on left and right
    ctx.fillStyle = 'rgba(15,10,25,' + (0.6 - progress * 0.1) + ')';
    // Left wall
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(W * 0.08, 0);
    ctx.quadraticCurveTo(W * 0.12, H * 0.2, W * 0.06, H * 0.4);
    ctx.quadraticCurveTo(W * 0.1, H * 0.6, W * 0.04, H * 0.8);
    ctx.lineTo(0, H);
    ctx.fill();
    // Right wall
    ctx.beginPath();
    ctx.moveTo(W, 0);
    ctx.lineTo(W * 0.92, 0);
    ctx.quadraticCurveTo(W * 0.88, H * 0.25, W * 0.94, H * 0.45);
    ctx.quadraticCurveTo(W * 0.9, H * 0.65, W * 0.96, H * 0.85);
    ctx.lineTo(W, H);
    ctx.fill();
  }

  // Layer 2: Crystals
  function drawCrystals() {
    var t = time * 0.001;
    var pulse = crystalPulse; // extra brightness when word spoken

    for (var i = 0; i < crystals.length; i++) {
      var c = crystals[i];
      var basePulse = 0.5 + Math.sin(t * c.pulseSpeed + c.pulsePhase) * 0.2;
      var glow = (basePulse + pulse * 0.6) * brightness * (0.6 + progress * 0.6);

      // Outer glow halo
      ctx.globalAlpha = glow * 0.25;
      var halo = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.glowRadius * (1 + pulse * 0.5));
      halo.addColorStop(0, c.colorBase + '0.4)');
      halo.addColorStop(0.5, c.colorBase + '0.1)');
      halo.addColorStop(1, c.colorBase + '0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.glowRadius * (1 + pulse * 0.5), 0, Math.PI * 2);
      ctx.fill();

      // Crystal body — elongated hexagon
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.angle);
      ctx.globalAlpha = glow * 0.7;

      // Body gradient
      var bodyG = ctx.createLinearGradient(0, -c.length * 0.5, 0, c.length * 0.5);
      bodyG.addColorStop(0, c.colorBase + '0.9)');
      bodyG.addColorStop(0.3, c.colorBase + '0.6)');
      bodyG.addColorStop(0.7, c.colorBase + '0.7)');
      bodyG.addColorStop(1, c.colorBase + '0.4)');
      ctx.fillStyle = bodyG;

      // Hexagonal crystal shape
      var hw = c.width * 0.5;
      var hl = c.length * 0.5;
      ctx.beginPath();
      ctx.moveTo(0, -hl);           // tip
      ctx.lineTo(hw, -hl * 0.6);    // upper right
      ctx.lineTo(hw, hl * 0.6);     // lower right
      ctx.lineTo(0, hl);            // bottom
      ctx.lineTo(-hw, hl * 0.6);    // lower left
      ctx.lineTo(-hw, -hl * 0.6);   // upper left
      ctx.closePath();
      ctx.fill();

      // Inner highlight — bright line down center
      ctx.globalAlpha = glow * 0.4;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -hl * 0.8);
      ctx.lineTo(0, hl * 0.5);
      ctx.stroke();

      // Edge highlight
      ctx.globalAlpha = glow * 0.15;
      ctx.strokeStyle = c.colorBase + '0.8)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, -hl);
      ctx.lineTo(hw, -hl * 0.6);
      ctx.lineTo(hw, hl * 0.6);
      ctx.stroke();

      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // Layer 3: Stalactites
  function drawStalactites() {
    for (var i = 0; i < stalactites.length; i++) {
      var s = stalactites[i];
      ctx.globalAlpha = 0.6;
      // Stone gradient
      var sg = ctx.createLinearGradient(s.x, 0, s.x, s.height);
      sg.addColorStop(0, 'hsl(250,15%,' + Math.round(15 * brightness) + '%)');
      sg.addColorStop(1, 'hsl(250,10%,' + Math.round(10 * brightness) + '%)');
      ctx.fillStyle = sg;

      // Pointed triangle
      ctx.beginPath();
      ctx.moveTo(s.x - s.width * 0.5, 0);
      ctx.lineTo(s.x + s.width * 0.5, 0);
      ctx.lineTo(s.x + s.width * 0.15, s.height * 0.7);
      ctx.lineTo(s.x, s.height);
      ctx.lineTo(s.x - s.width * 0.15, s.height * 0.7);
      ctx.closePath();
      ctx.fill();

      // Wet highlight
      ctx.globalAlpha = 0.1 * brightness;
      ctx.strokeStyle = '#a0c0ff';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(s.x, 0);
      ctx.lineTo(s.x, s.height * 0.9);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Layer 4: Underground pool
  function drawPool() {
    var t = time * 0.001;
    var poolY = H * 0.82;
    var poolH = H - poolY;
    var reflectivity = 0.1 + progress * 0.2;

    // Pool surface gradient
    var pg = ctx.createLinearGradient(0, poolY, 0, H);
    pg.addColorStop(0, 'rgba(30,40,80,' + (0.4 + reflectivity) + ')');
    pg.addColorStop(0.3, 'rgba(15,20,50,' + (0.6 + reflectivity * 0.5) + ')');
    pg.addColorStop(1, 'rgba(5,8,20,0.9)');
    ctx.fillStyle = pg;
    ctx.fillRect(0, poolY, W, poolH);

    // Wave shimmer lines
    ctx.strokeStyle = 'rgba(120,160,255,' + (0.05 + reflectivity * 0.1) + ')';
    ctx.lineWidth = 0.8;
    for (var w = 0; w < 5; w++) {
      var wy = poolY + 4 + w * (poolH / 6);
      ctx.beginPath();
      for (var x = 0; x <= W; x += 4) {
        var y = wy + Math.sin(x * 0.015 + t * (0.8 + w * 0.2)) * 2;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Crystal reflections — blurred colour spots in the pool
    for (var i = 0; i < crystals.length; i++) {
      var c = crystals[i];
      var rx = c.x + Math.sin(t * 0.5 + i) * 5;
      var ry = poolY + (c.y - poolY) * 0.2 + 10;
      if (ry < poolY) continue;
      ctx.globalAlpha = reflectivity * 0.3 * brightness;
      var rg = ctx.createRadialGradient(rx, ry, 0, rx, ry, c.glowRadius * 0.6);
      rg.addColorStop(0, c.colorBase + '0.15)');
      rg.addColorStop(1, c.colorBase + '0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(rx, ry, c.glowRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ripples from droplets
    for (var i = ripples.length - 1; i >= 0; i--) {
      var r = ripples[i];
      r.radius += 0.5;
      r.life -= 0.015;
      if (r.life <= 0) { ripples.splice(i, 1); continue; }
      ctx.globalAlpha = r.life * 0.25;
      ctx.strokeStyle = 'rgba(150,180,255,0.4)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
      // Second ring
      if (r.radius > 5) {
        ctx.globalAlpha = r.life * 0.12;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  // Layer 5: Bioluminescent creatures
  function drawCreatures() {
    var t = time * 0.001;
    for (var i = 0; i < creatures.length; i++) {
      var c = creatures[i];
      if (progress < c.minProgress) continue;

      // Drift
      c.x += c.speedX + Math.sin(t * 0.3 + c.phase) * 0.15;
      c.y += c.speedY + Math.cos(t * 0.4 + c.phase) * 0.1;
      // Wrap
      if (c.x < W * 0.05) c.x = W * 0.95;
      if (c.x > W * 0.95) c.x = W * 0.05;
      if (c.y < H * 0.15) c.y = H * 0.7;
      if (c.y > H * 0.75) c.y = H * 0.15;

      var pulse = 0.4 + Math.sin(t * c.pulseSpeed + c.phase) * 0.35 + 0.25;
      var alpha = pulse * brightness * (0.5 + progress * 0.5);

      // Glow halo
      ctx.globalAlpha = alpha * 0.3;
      var cg = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.size * 5);
      cg.addColorStop(0, c.color + '0.3)');
      cg.addColorStop(1, c.color + '0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size * 5, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.globalAlpha = alpha * 0.8;
      ctx.fillStyle = c.color + '0.9)';
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.size * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Tiny tentacles (2 faint lines trailing down)
      if (c.size > 2.5) {
        ctx.globalAlpha = alpha * 0.2;
        ctx.strokeStyle = c.color + '0.3)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(c.x - 1, c.y + c.size);
        ctx.quadraticCurveTo(c.x - 2 + Math.sin(t * 2 + c.phase) * 2, c.y + c.size * 4, c.x - 1, c.y + c.size * 6);
        ctx.moveTo(c.x + 1, c.y + c.size);
        ctx.quadraticCurveTo(c.x + 2 + Math.sin(t * 2.3 + c.phase) * 2, c.y + c.size * 4, c.x + 1, c.y + c.size * 6);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  // Layer 6: Cave dust
  function drawCaveDust() {
    for (var i = 0; i < caveDust.length; i++) {
      var d = caveDust[i];
      d.x += d.speedX;
      d.y += d.speedY;
      if (d.x < 0) d.x = W;
      if (d.x > W) d.x = 0;
      if (d.y < 0) d.y = H;
      if (d.y > H * 0.8) d.y = 0;

      ctx.globalAlpha = d.opacity * brightness * (0.5 + progress * 0.5);
      ctx.fillStyle = '#c0c0ff';
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Layer 7: Water droplets
  function updateDroplets(dt) {
    nextDrop -= dt * 1000;
    if (nextDrop <= 0 && droplets.length < 3) {
      var s = stalactites[Math.floor(rand(0, stalactites.length))];
      droplets.push({
        x: s.x, y: s.height,
        vy: 0,
        gravity: 0.15
      });
      nextDrop = rand(2000, 5000);
    }
    for (var i = droplets.length - 1; i >= 0; i--) {
      var d = droplets[i];
      d.vy += d.gravity;
      d.y += d.vy;
      // Hit pool
      if (d.y > H * 0.82) {
        ripples.push({ x: d.x, y: H * 0.82, radius: 1, life: 1 });
        droplets.splice(i, 1);
        // Tiny splash sound could go here
        continue;
      }
      // Draw droplet
      ctx.globalAlpha = 0.5 * brightness;
      ctx.fillStyle = 'rgba(150,180,255,0.6)';
      ctx.beginPath();
      ctx.arc(d.x, d.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
      // Tiny trail
      ctx.globalAlpha = 0.15 * brightness;
      ctx.beginPath();
      ctx.arc(d.x, d.y - 3, 0.8, 0, Math.PI * 2);
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

  // Cave echo scale — notes with long reverb-like decay
  var CAVE_SCALE = [330, 392, 440, 523, 587, 659, 784, 880, 988, 1047];

  function sfxCorrect(noteIndex) {
    var freq = CAVE_SCALE[Math.min(noteIndex || 0, CAVE_SCALE.length - 1)];
    // Primary note — long decay for cave echo
    playNote(freq, 0.6, 'sine', 0.08);
    // Echo 1 — slightly detuned, delayed
    playNote(freq * 1.002, 0.5, 'sine', 0.04, 0.12);
    // Echo 2 — octave shimmer
    playNote(freq * 2, 0.35, 'sine', 0.02, 0.08);
    // Deep undertone
    playNote(freq * 0.5, 0.7, 'triangle', 0.02, 0.05);
  }

  function sfxWrong() {
    // Deep stone rumble
    playNote(110, 0.5, 'sine', 0.06);
    playNote(105, 0.6, 'triangle', 0.03, 0.03);
    playNote(98, 0.4, 'sine', 0.02, 0.08);
  }

  function sfxWordSpoken() {
    // Soft crystal activation chime
    playNote(659, 0.15, 'sine', 0.03);
    playNote(784, 0.12, 'sine', 0.02, 0.04);
  }

  function sfxGameComplete() {
    // Cave celebration — echoing arpeggio
    var notes = [330, 440, 523, 659, 784];
    for (var i = 0; i < notes.length; i++) {
      playNote(notes[i], 0.8, 'sine', 0.07, i * 0.12);
      playNote(notes[i] * 1.002, 0.7, 'sine', 0.03, i * 0.12 + 0.1); // echo
      playNote(notes[i] * 2, 0.4, 'sine', 0.015, i * 0.12 + 0.06); // shimmer
    }
    // Final resonant chord
    setTimeout(function() {
      playNote(330, 1.0, 'sine', 0.05);
      playNote(440, 1.0, 'sine', 0.04);
      playNote(523, 1.0, 'triangle', 0.03);
      playNote(659, 0.8, 'sine', 0.02);
    }, 700);
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
    var targetBright = 0.75 + progress * 0.25;
    brightness += (targetBright - brightness) * 0.02;

    // Decay crystal pulse
    crystalPulse *= 0.95;

    // Draw all layers
    drawCaveWalls();
    drawStalactites();
    drawCrystals();
    drawCreatures();
    drawCaveDust();
    drawPool();
    updateDroplets(dt);

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
    brightness = 0.75;
    crystalPulse = 0;
    particles = [];
    droplets = [];
    ripples = [];
    nextDrop = 2000 + Math.random() * 3000;
    lastTime = performance.now();
    animId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    animId = null;
  }

  function onWordSpoken() {
    // Pulse all crystals
    crystalPulse = 1;
    sfxWordSpoken();
  }

  function onCorrect(noteIndex) {
    if (!canvas) return;
    var cx = W * 0.5, cy = H * 0.4;
    // Crystal shard burst — purple/cyan
    emitBurst(cx, cy, 12, {
      spread: 6, rise: 2.5, decay: 0.018, size: 3.5,
      color: 'rgba(180,130,255,0.9)', shape: 'star'
    });
    emitBurst(cx, cy, 8, {
      spread: 4, rise: 1.5, decay: 0.022, size: 2.5,
      color: 'rgba(120,240,255,0.7)'
    });
    sfxCorrect(noteIndex);
    crystalPulse = 0.8; // flash crystals
  }

  function onWrong() {
    if (!canvas) return;
    // Dark stone embers
    emitBurst(W * 0.5, H * 0.4, 6, {
      spread: 3, rise: -0.3, gravity: 0.04, decay: 0.012, size: 2,
      color: 'rgba(80,60,100,0.5)'
    });
    sfxWrong();
  }

  function onComplete(pct) {
    targetProgress = pct || 1;
    if (!canvas) return;
    // Cave-wide crystal explosion
    var colors = ['rgba(160,80,255,0.8)','rgba(80,220,220,0.7)','rgba(255,120,160,0.7)','rgba(255,200,60,0.7)','rgba(100,180,255,0.7)'];
    for (var i = 0; i < colors.length; i++) {
      emitBurst(W * (0.15 + i * 0.175), H * 0.35, 6, {
        spread: 8, rise: 3, decay: 0.012, size: 4,
        color: colors[i], shape: 'star'
      });
    }
    crystalPulse = 1;
    sfxGameComplete();
  }

  function setProgress(pct) {
    targetProgress = Math.max(0, Math.min(1, pct || 0));
  }

  window.ClassmatesDictationScene = {
    init: init,
    start: start,
    stop: stop,
    onWordSpoken: onWordSpoken,
    onCorrect: onCorrect,
    onWrong: onWrong,
    onComplete: onComplete,
    setProgress: setProgress
  };
})();
