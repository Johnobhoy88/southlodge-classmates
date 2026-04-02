(function(){
  // ============================================================
  // GEOGRAPHY FX ENGINE — Per-Game Visual Worlds
  // Each geography game has its own Canvas scene.
  // Mode is set via setMode('capitals'), etc.
  // ============================================================

  var canvas, ctx, animId, running = false;
  var W = 0, H = 0, time = 0;
  var progress = 0, targetProgress = 0;
  var mode = 'default';
  var particles = [];
  var elements = [];
  var accents = [];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

  var MODES = {
    // CAPITALS — warm gold/amber city lights
    capitals: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W * 0.3, H);
        var b = 0.8 + p * 0.2;
        g.addColorStop(0, 'hsl(195,' + Math.round(50 + p * 15) + '%,' + Math.round(72 * b) + '%)');
        g.addColorStop(0.5, 'hsl(185,' + Math.round(40 + p * 10) + '%,' + Math.round(76 * b) + '%)');
        g.addColorStop(1, 'hsl(45,' + Math.round(45 + p * 10) + '%,' + Math.round(82 * b) + '%)');
        return g;
      },
      floaters: '\u{1F3DB}\u{1F3F0}\u{1F5FC}\u{1F3E0}\u2605',
      floatColors: ['#b45309','#d97706','#f59e0b','#92400e','#fbbf24'],
      accentType: 'lights', // city light dots
      particleColor: 'rgba(245,158,11,0.8)',
      particleAccent: 'rgba(251,191,36,0.6)',
      correctSound: [440, 554, 659],
      wrongSound: [330, 277]
    },
    // CONTINENTS — ocean blue/green globe
    continents: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, 0, H);
        var b = 0.8 + p * 0.2;
        g.addColorStop(0, 'hsl(200,' + Math.round(55 + p * 15) + '%,' + Math.round(70 * b) + '%)');
        g.addColorStop(0.5, 'hsl(190,' + Math.round(45 + p * 10) + '%,' + Math.round(74 * b) + '%)');
        g.addColorStop(1, 'hsl(170,' + Math.round(35 + p * 10) + '%,' + Math.round(78 * b) + '%)');
        return g;
      },
      floaters: '\u{1F30D}\u{1F30E}\u{1F30F}\u2708\u{1F5FA}',
      floatColors: ['#0284c7','#0ea5e9','#22c55e','#06b6d4','#38bdf8'],
      accentType: 'waves',
      particleColor: 'rgba(14,165,233,0.8)',
      particleAccent: 'rgba(34,197,94,0.6)',
      correctSound: [523, 659, 784],
      wrongSound: [294, 262]
    },
    // WEATHER — sky gradient with cloud shapes
    weather: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, 0, H);
        var b = 0.82 + p * 0.18;
        g.addColorStop(0, 'hsl(210,' + Math.round(50 + p * 15) + '%,' + Math.round(75 * b) + '%)');
        g.addColorStop(0.5, 'hsl(200,' + Math.round(40 + p * 10) + '%,' + Math.round(80 * b) + '%)');
        g.addColorStop(1, 'hsl(45,' + Math.round(40 + p * 10) + '%,' + Math.round(85 * b) + '%)');
        return g;
      },
      floaters: '\u2600\u2601\u26C5\u{1F327}\u2744\u{1F321}',
      floatColors: ['#f59e0b','#94a3b8','#60a5fa','#0ea5e9','#e2e8f0'],
      accentType: 'clouds',
      particleColor: 'rgba(14,165,233,0.7)',
      particleAccent: 'rgba(245,158,11,0.6)',
      correctSound: [440, 523, 659],
      wrongSound: [349, 311]
    },
    // COMPASS — warm parchment with compass rose
    compass: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W * 0.4, H);
        var b = 0.85 + p * 0.15;
        g.addColorStop(0, 'hsl(35,' + Math.round(45 + p * 15) + '%,' + Math.round(85 * b) + '%)');
        g.addColorStop(0.5, 'hsl(30,' + Math.round(40 + p * 10) + '%,' + Math.round(82 * b) + '%)');
        g.addColorStop(1, 'hsl(25,' + Math.round(35 + p * 10) + '%,' + Math.round(78 * b) + '%)');
        return g;
      },
      floaters: 'NSEW\u2191\u2193\u2190\u2192\u{1F9ED}',
      floatColors: ['#92400e','#b45309','#d97706','#78350f','#a16207'],
      accentType: 'compass',
      particleColor: 'rgba(180,83,9,0.8)',
      particleAccent: 'rgba(217,119,6,0.6)',
      correctSound: [392, 523, 659],
      wrongSound: [330, 294]
    },
    // FLAGS — bright multi-colour celebration
    flags: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W, H);
        var b = 0.82 + p * 0.18;
        g.addColorStop(0, 'hsl(220,' + Math.round(35 + p * 10) + '%,' + Math.round(80 * b) + '%)');
        g.addColorStop(0.35, 'hsl(350,' + Math.round(30 + p * 10) + '%,' + Math.round(82 * b) + '%)');
        g.addColorStop(0.65, 'hsl(45,' + Math.round(35 + p * 10) + '%,' + Math.round(84 * b) + '%)');
        g.addColorStop(1, 'hsl(140,' + Math.round(30 + p * 10) + '%,' + Math.round(80 * b) + '%)');
        return g;
      },
      floaters: '\u{1F3F3}\u{1F3F4}\u2691\u2690\u2605',
      floatColors: ['#dc2626','#2563eb','#16a34a','#f59e0b','#7c3aed'],
      accentType: 'confetti',
      particleColor: 'rgba(37,99,235,0.7)',
      particleAccent: 'rgba(220,38,38,0.6)',
      correctSound: [523, 659, 784, 1047],
      wrongSound: [349, 294]
    },
    default: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, 'hsl(195,50%,72%)');
        g.addColorStop(1, 'hsl(45,45%,82%)');
        return g;
      },
      floaters: 'NSEW\u{1F30D}',
      floatColors: ['#0284c7','#16a34a','#d97706'],
      accentType: 'waves',
      particleColor: 'rgba(2,132,199,0.7)',
      particleAccent: 'rgba(22,163,74,0.5)',
      correctSound: [523, 659],
      wrongSound: [294, 262]
    }
  };

  function getMode() { return MODES[mode] || MODES['default']; }

  function generateScene() {
    if (!W || !H) return;
    var m = getMode();
    elements = [];
    var chars = m.floaters;
    for (var i = 0; i < 14; i++) {
      elements.push({
        x: rand(0, W), y: rand(0, H),
        char: chars[Math.floor(rand(0, chars.length))],
        size: rand(12, 28), speed: rand(0.06, 0.2),
        drift: rand(-0.15, 0.15), opacity: rand(0.04, 0.08),
        rotation: rand(-0.2, 0.2), rotSpeed: rand(-0.003, 0.003),
        color: pick(m.floatColors)
      });
    }
    accents = [];
    var aType = m.accentType;
    if (aType === 'waves') {
      for (var i = 0; i < 4; i++) {
        accents.push({ y: H * (0.6 + i * 0.1), amplitude: rand(6, 14), freq: rand(0.01, 0.02), speed: rand(0.5, 1), phase: rand(0, Math.PI * 2) });
      }
    } else if (aType === 'clouds') {
      for (var i = 0; i < 6; i++) {
        accents.push({ x: rand(-80, W + 80), y: rand(H * 0.05, H * 0.35), w: rand(60, 140), speed: rand(0.1, 0.3), puffs: Math.floor(rand(3, 5)), opacity: rand(0.15, 0.3) });
      }
    } else if (aType === 'lights') {
      for (var i = 0; i < 20; i++) {
        accents.push({ x: rand(0, W), y: rand(H * 0.5, H), size: rand(1, 3), phase: rand(0, Math.PI * 2), speed: rand(1, 3) });
      }
    } else if (aType === 'confetti') {
      for (var i = 0; i < 15; i++) {
        accents.push({ x: rand(0, W), y: rand(-H * 0.2, H), size: rand(3, 8), rotation: rand(0, Math.PI * 2), rotSpeed: rand(-0.03, 0.03), fallSpeed: rand(0.2, 0.6), drift: rand(-0.2, 0.2), color: pick(m.floatColors) });
      }
    }
  }

  // Particle system
  function spawnParticle(x, y, c) { c = c || {}; if (particles.length > 100) return; particles.push({ x: x, y: y, vx: (Math.random() - 0.5) * (c.spread || 4), vy: (Math.random() - 0.5) * (c.spread || 4) - (c.rise || 1), life: 1, decay: c.decay || 0.02, size: c.size || 3 + Math.random() * 3, color: c.color || getMode().particleColor, gravity: c.gravity || 0, shape: c.shape || 'circle' }); }
  function emitBurst(x, y, count, c) { for (var i = 0; i < count; i++) spawnParticle(x, y, c); }
  function updateParticles(dt) { for (var i = particles.length - 1; i >= 0; i--) { var p = particles[i]; p.x += p.vx * dt * 60; p.y += p.vy * dt * 60; p.vy += p.gravity * dt * 60; p.life -= p.decay * dt * 60; if (p.life <= 0) particles.splice(i, 1); } }
  function drawStar5(cx, cy, r) { ctx.beginPath(); for (var i = 0; i < 10; i++) { var rad = i % 2 === 0 ? r : r * 0.4; var angle = (i * Math.PI / 5) - Math.PI / 2; if (i === 0) ctx.moveTo(cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad); else ctx.lineTo(cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad); } ctx.closePath(); ctx.fill(); }
  function drawParticles() { for (var i = 0; i < particles.length; i++) { var p = particles[i]; ctx.globalAlpha = p.life * 0.8; ctx.fillStyle = p.color; if (p.shape === 'star') drawStar5(p.x, p.y, p.size * p.life); else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill(); } } ctx.globalAlpha = 1; }

  function drawElements() {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      el.y -= el.speed * 0.3; el.x += el.drift * 0.2; el.rotation += el.rotSpeed;
      if (el.y < -el.size * 2) { el.y = H + el.size * 2; el.x = rand(0, W); }
      if (el.x < -40) el.x = W + 40; if (el.x > W + 40) el.x = -40;
      ctx.save(); ctx.translate(el.x, el.y); ctx.rotate(el.rotation);
      ctx.globalAlpha = el.opacity * (0.5 + progress * 0.6);
      ctx.font = el.size + 'px "Fredoka One","Comic Sans MS",cursive';
      ctx.fillStyle = el.color; ctx.fillText(el.char, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawAccents() {
    var m = getMode(); var t = time * 0.001; var aType = m.accentType;
    if (aType === 'waves') {
      for (var i = 0; i < accents.length; i++) {
        var a = accents[i]; ctx.globalAlpha = 0.06 * (0.5 + progress * 0.6);
        ctx.strokeStyle = m.floatColors[i % m.floatColors.length]; ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (var x = 0; x <= W; x += 4) { var y = a.y + Math.sin(x * a.freq + t * a.speed + a.phase) * a.amplitude; if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
        ctx.stroke();
      }
    } else if (aType === 'clouds') {
      for (var i = 0; i < accents.length; i++) {
        var c = accents[i]; var cx = c.x + t * c.speed * 15;
        if (cx > W + c.w) cx -= W + c.w * 2; if (cx < -c.w) cx += W + c.w * 2;
        ctx.globalAlpha = c.opacity; ctx.fillStyle = 'rgba(255,255,255,0.8)';
        var pw = c.w / c.puffs;
        for (var p = 0; p < c.puffs; p++) { ctx.beginPath(); ctx.arc(cx + p * pw * 0.7, c.y + Math.sin(p * 1.5) * 8, pw * 0.5, 0, Math.PI * 2); ctx.fill(); }
      }
    } else if (aType === 'lights') {
      for (var i = 0; i < accents.length; i++) {
        var a = accents[i]; var twink = 0.3 + Math.sin(t * a.speed + a.phase) * 0.4 + 0.3;
        ctx.globalAlpha = twink * 0.15 * (0.5 + progress * 0.6); ctx.fillStyle = pick(m.floatColors);
        ctx.beginPath(); ctx.arc(a.x, a.y, a.size * twink, 0, Math.PI * 2); ctx.fill();
      }
    } else if (aType === 'compass') {
      var cx = W * 0.85, cy = H * 0.15, r = Math.min(W, H) * 0.06;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.05);
      ctx.globalAlpha = 0.12 * (0.5 + progress * 0.5); ctx.strokeStyle = m.floatColors[0]; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
      for (var i = 0; i < 4; i++) { var angle = (i * Math.PI / 2) - Math.PI / 2; ctx.fillStyle = i === 0 ? m.floatColors[0] : m.floatColors[2]; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(angle - 0.15) * r * 0.3, Math.sin(angle - 0.15) * r * 0.3); ctx.lineTo(Math.cos(angle) * r * 0.9, Math.sin(angle) * r * 0.9); ctx.lineTo(Math.cos(angle + 0.15) * r * 0.3, Math.sin(angle + 0.15) * r * 0.3); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    } else if (aType === 'confetti') {
      for (var i = 0; i < accents.length; i++) {
        var a = accents[i]; a.y += a.fallSpeed * 0.3; a.x += a.drift * 0.2 + Math.sin(t * 0.5 + i) * 0.15; a.rotation += a.rotSpeed;
        if (a.y > H + 20) { a.y = -20; a.x = rand(0, W); }
        ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.rotation);
        ctx.globalAlpha = 0.12 * (0.5 + progress * 0.6); ctx.fillStyle = a.color;
        ctx.fillRect(-a.size / 2, -a.size / 4, a.size, a.size / 2);
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
  }

  // Sound engine
  var audioCtx = null;
  function getAudio() { if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; } } return audioCtx; }
  function playNote(freq, duration, type, volume, delay) { var ac = getAudio(); if (!ac) return; if (window._classmatesMuted) return; var t = ac.currentTime + (delay || 0); var osc = ac.createOscillator(); var gain = ac.createGain(); osc.connect(gain); gain.connect(ac.destination); osc.type = type || 'sine'; osc.frequency.setValueAtTime(freq, t); gain.gain.setValueAtTime(volume || 0.07, t); gain.gain.exponentialRampToValueAtTime(0.001, t + duration); osc.start(t); osc.stop(t + duration); }

  function sfxCorrect() { var m = getMode(); var notes = m.correctSound || [523, 659]; for (var i = 0; i < notes.length; i++) playNote(notes[i], 0.22, 'sine', 0.06, i * 0.05); }
  function sfxWrong() { var m = getMode(); var notes = m.wrongSound || [294, 262]; playNote(notes[0], 0.16, 'sine', 0.05); if (notes[1]) playNote(notes[1], 0.2, 'sine', 0.03, 0.05); }
  function sfxComplete() { var m = getMode(); var base = m.correctSound || [523, 659]; for (var i = 0; i < base.length; i++) { playNote(base[i], 0.35, 'sine', 0.07, i * 0.07); } setTimeout(function() { playNote(1319, 0.25, 'sine', 0.04); playNote(1568, 0.35, 'sine', 0.03, 0.08); }, base.length * 70 + 80); }

  // Main loop
  var lastTime = 0;
  function loop(t) {
    if (!running) return;
    var dt = Math.min((t - lastTime) / 1000, 0.05); lastTime = t; time = t;
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) { W = canvas.width = canvas.clientWidth; H = canvas.height = canvas.clientHeight; generateScene(); }
    progress += (targetProgress - progress) * 0.03;
    var m = getMode(); ctx.fillStyle = m.bg(progress); ctx.fillRect(0, 0, W, H);
    drawAccents(); drawElements(); updateParticles(dt); drawParticles();
    animId = requestAnimationFrame(loop);
  }

  // Public API
  function init(canvasEl) { canvas = canvasEl; if (!canvas) return; ctx = canvas.getContext('2d'); W = canvas.width = canvas.clientWidth || 600; H = canvas.height = canvas.clientHeight || 400; generateScene(); }
  function start() { if (!canvas || running) return; running = true; targetProgress = 0; progress = 0; particles = []; lastTime = performance.now(); animId = requestAnimationFrame(loop); }
  function stop() { running = false; if (animId) cancelAnimationFrame(animId); animId = null; }
  function setMode(m) { mode = m || 'default'; if (canvas) generateScene(); }

  function onCorrect(x, y) { if (!canvas) return; var m = getMode(); var px = x || W * 0.5, py = y || H * 0.4; emitBurst(px, py, 10, { spread: 6, rise: 2, decay: 0.02, size: 3.5, color: m.particleColor, shape: 'star' }); emitBurst(px, py, 6, { spread: 4, rise: 1.5, decay: 0.025, size: 2.5, color: m.particleAccent }); sfxCorrect(); }
  function onWrong() { if (!canvas) return; emitBurst(W * 0.5, H * 0.4, 6, { spread: 3, rise: -0.3, gravity: 0.03, decay: 0.012, size: 2, color: 'rgba(220,80,60,0.4)' }); sfxWrong(); }
  function onComplete(pct) { targetProgress = pct || 1; if (!canvas) return; var m = getMode(); emitBurst(W * 0.5, H * 0.35, 25, { spread: 10, rise: 3, decay: 0.012, size: 4, color: m.particleColor, shape: 'star' }); emitBurst(W * 0.5, H * 0.35, 15, { spread: 7, rise: 2, decay: 0.015, size: 3, color: m.particleAccent }); var rainbow = ['rgba(255,107,107,0.7)','rgba(255,217,61,0.7)','rgba(85,239,196,0.7)','rgba(116,185,255,0.7)','rgba(162,155,254,0.7)']; for (var i = 0; i < rainbow.length; i++) emitBurst(W * (0.2 + i * 0.15), H * 0.3, 5, { spread: 5, rise: 2.5, decay: 0.018, size: 3, color: rainbow[i], shape: 'star' }); sfxComplete(); }
  function setProgress(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }

  window.ClassmatesGeographyFX = { init: init, start: start, stop: stop, setMode: setMode, onCorrect: onCorrect, onWrong: onWrong, onComplete: onComplete, setProgress: setProgress };
})();
