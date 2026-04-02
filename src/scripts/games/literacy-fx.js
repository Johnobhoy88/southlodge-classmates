(function(){
  // ============================================================
  // LITERACY FX ENGINE — Per-Game Visual Worlds
  // Each literacy game has its own Canvas scene, particles,
  // colour palette, floating elements, and sound design.
  // Mode is set via setMode('dictation'), etc.
  // ============================================================

  var canvas, ctx, animId, running = false;
  var W = 0, H = 0, time = 0;
  var progress = 0, targetProgress = 0;
  var mode = 'default';
  var particles = [];
  var elements = []; // floating background elements
  var accents = [];  // secondary layer (bokeh, waves, etc.)

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

  // ==================== MODE DEFINITIONS ====================
  // Each mode defines: palette, gradient, floaters, accent type
  var MODES = {
    // DICTATION — audio/soundwave world. Purple, pulsing rings, floating music notes
    dictation: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W * 0.3, H);
        var b = 0.75 + p * 0.25;
        g.addColorStop(0, 'hsl(270,' + Math.round(35 + p * 15) + '%,' + Math.round(90 * b) + '%)');
        g.addColorStop(0.5, 'hsl(280,' + Math.round(30 + p * 10) + '%,' + Math.round(86 * b) + '%)');
        g.addColorStop(1, 'hsl(260,' + Math.round(40 + p * 10) + '%,' + Math.round(82 * b) + '%)');
        return g;
      },
      floaters: '\u266A\u266B\u266C\u2669',
      floatColors: ['#7c3aed','#a78bfa','#c4b5fd','#8b5cf6','#ddd6fe'],
      accentType: 'rings', // pulsing concentric rings from center
      particleColor: 'rgba(124,58,237,0.8)',
      particleAccent: 'rgba(167,139,250,0.6)',
      correctSound: [523, 659, 784], // major triad
      wrongSound: [294, 262]
    },
    // VOWELS — puzzle world. Pink, floating vowel letters, jigsaw-edge bokeh
    vowels: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W * 0.4, H);
        var b = 0.78 + p * 0.22;
        g.addColorStop(0, 'hsl(340,' + Math.round(45 + p * 15) + '%,' + Math.round(92 * b) + '%)');
        g.addColorStop(0.5, 'hsl(330,' + Math.round(40 + p * 10) + '%,' + Math.round(88 * b) + '%)');
        g.addColorStop(1, 'hsl(350,' + Math.round(35 + p * 10) + '%,' + Math.round(85 * b) + '%)');
        return g;
      },
      floaters: 'AEIOUaeiou',
      floatColors: ['#ec4899','#f472b6','#fb7185','#f9a8d4','#fda4af'],
      accentType: 'bokeh',
      particleColor: 'rgba(236,72,153,0.8)',
      particleAccent: 'rgba(244,114,182,0.6)',
      correctSound: [440, 554, 659],
      wrongSound: [311, 277]
    },
    // ANAGRAM — tile/scrabble world. Amber/gold, floating letter blocks, wood grain feel
    anagram: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, 0, H);
        var b = 0.8 + p * 0.2;
        g.addColorStop(0, 'hsl(40,' + Math.round(50 + p * 15) + '%,' + Math.round(92 * b) + '%)');
        g.addColorStop(0.5, 'hsl(35,' + Math.round(45 + p * 10) + '%,' + Math.round(88 * b) + '%)');
        g.addColorStop(1, 'hsl(30,' + Math.round(40 + p * 10) + '%,' + Math.round(84 * b) + '%)');
        return g;
      },
      floaters: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      floatColors: ['#d97706','#f59e0b','#fbbf24','#92400e','#b45309'],
      accentType: 'blocks', // floating square tile shapes
      particleColor: 'rgba(245,158,11,0.8)',
      particleAccent: 'rgba(251,191,36,0.6)',
      correctSound: [392, 523, 659],
      wrongSound: [330, 294]
    },
    // PHONICS — sound/wave world. Cyan, sound wave lines, floating phonemes
    phonics: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W * 0.3, H);
        var b = 0.78 + p * 0.22;
        g.addColorStop(0, 'hsl(188,' + Math.round(50 + p * 15) + '%,' + Math.round(90 * b) + '%)');
        g.addColorStop(0.5, 'hsl(192,' + Math.round(45 + p * 10) + '%,' + Math.round(86 * b) + '%)');
        g.addColorStop(1, 'hsl(185,' + Math.round(40 + p * 10) + '%,' + Math.round(82 * b) + '%)');
        return g;
      },
      floaters: 'aieeooushshthchng',
      floatColors: ['#06b6d4','#22d3ee','#67e8f9','#0891b2','#0e7490'],
      accentType: 'waves', // animated sine waves across screen
      particleColor: 'rgba(6,182,212,0.8)',
      particleAccent: 'rgba(34,211,238,0.6)',
      correctSound: [523, 659, 784],
      wrongSound: [349, 311]
    },
    // WORD FAMILIES — tree/branch world. Green, growing branches, leaf shapes
    wordfam: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, 0, H);
        var b = 0.78 + p * 0.22;
        g.addColorStop(0, 'hsl(140,' + Math.round(35 + p * 15) + '%,' + Math.round(90 * b) + '%)');
        g.addColorStop(0.5, 'hsl(130,' + Math.round(40 + p * 10) + '%,' + Math.round(86 * b) + '%)');
        g.addColorStop(1, 'hsl(150,' + Math.round(30 + p * 10) + '%,' + Math.round(82 * b) + '%)');
        return g;
      },
      floaters: '\u2618\u2766\u273F\u2740\u2741\u2742',
      floatColors: ['#16a34a','#22c55e','#4ade80','#15803d','#166534'],
      accentType: 'leaves', // drifting leaf shapes
      particleColor: 'rgba(22,163,74,0.8)',
      particleAccent: 'rgba(74,222,128,0.6)',
      correctSound: [440, 523, 659],
      wrongSound: [330, 277]
    },
    // SENTENCES — railway/track world. Teal, word carriages on a track
    sentence: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W, H * 0.3);
        var b = 0.8 + p * 0.2;
        g.addColorStop(0, 'hsl(200,' + Math.round(35 + p * 15) + '%,' + Math.round(92 * b) + '%)');
        g.addColorStop(0.5, 'hsl(210,' + Math.round(30 + p * 10) + '%,' + Math.round(88 * b) + '%)');
        g.addColorStop(1, 'hsl(195,' + Math.round(40 + p * 10) + '%,' + Math.round(85 * b) + '%)');
        return g;
      },
      floaters: '.,!?;:\"\'',
      floatColors: ['#0284c7','#0ea5e9','#38bdf8','#075985','#0369a1'],
      accentType: 'tracks', // horizontal dashed lines like railway
      particleColor: 'rgba(2,132,199,0.8)',
      particleAccent: 'rgba(56,189,248,0.6)',
      correctSound: [523, 587, 659],
      wrongSound: [349, 294]
    },
    // PUNCTUATION — ink/quill world. Orange/sepia, ink splots, quill strokes
    punctuation: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W * 0.2, H);
        var b = 0.8 + p * 0.2;
        g.addColorStop(0, 'hsl(25,' + Math.round(40 + p * 15) + '%,' + Math.round(93 * b) + '%)');
        g.addColorStop(0.5, 'hsl(20,' + Math.round(35 + p * 10) + '%,' + Math.round(89 * b) + '%)');
        g.addColorStop(1, 'hsl(30,' + Math.round(45 + p * 10) + '%,' + Math.round(86 * b) + '%)');
        return g;
      },
      floaters: '.?!,;:\u2014\u201C\u201D\u2018\u2019...',
      floatColors: ['#ea580c','#f97316','#fb923c','#c2410c','#9a3412'],
      accentType: 'inkdrops', // soft circular ink blots
      particleColor: 'rgba(234,88,12,0.8)',
      particleAccent: 'rgba(249,115,22,0.6)',
      correctSound: [440, 554, 659],
      wrongSound: [311, 262]
    },
    // VOCAB — dictionary/book world. Indigo, floating definition cards, pages
    vocab: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W * 0.4, H);
        var b = 0.78 + p * 0.22;
        g.addColorStop(0, 'hsl(240,' + Math.round(30 + p * 15) + '%,' + Math.round(92 * b) + '%)');
        g.addColorStop(0.5, 'hsl(250,' + Math.round(35 + p * 10) + '%,' + Math.round(88 * b) + '%)');
        g.addColorStop(1, 'hsl(230,' + Math.round(25 + p * 10) + '%,' + Math.round(85 * b) + '%)');
        return g;
      },
      floaters: 'ABCDEFabcdef\u2261\u2248',
      floatColors: ['#4f46e5','#6366f1','#818cf8','#4338ca','#3730a3'],
      accentType: 'pages', // floating rectangles like book pages
      particleColor: 'rgba(79,70,229,0.8)',
      particleAccent: 'rgba(129,140,248,0.6)',
      correctSound: [523, 659, 784],
      wrongSound: [294, 262]
    },
    // READING — storybook world. Warm brown/cream, floating stars, page-turn feel
    reading: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, 0, H);
        var b = 0.82 + p * 0.18;
        g.addColorStop(0, 'hsl(35,' + Math.round(50 + p * 15) + '%,' + Math.round(94 * b) + '%)');
        g.addColorStop(0.5, 'hsl(30,' + Math.round(45 + p * 10) + '%,' + Math.round(90 * b) + '%)');
        g.addColorStop(1, 'hsl(25,' + Math.round(40 + p * 10) + '%,' + Math.round(87 * b) + '%)');
        return g;
      },
      floaters: '\u2605\u2606\u2726\u2727\u2728',
      floatColors: ['#92400e','#a16207','#ca8a04','#854d0e','#78350f'],
      accentType: 'sparkles',
      particleColor: 'rgba(202,138,4,0.8)',
      particleAccent: 'rgba(161,98,7,0.6)',
      correctSound: [392, 523, 659],
      wrongSound: [330, 294]
    },
    // GRAMMAR — colour-code world. Multi-colour, floating word-type labels
    grammar: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W, H);
        var b = 0.8 + p * 0.2;
        g.addColorStop(0, 'hsl(210,' + Math.round(25 + p * 10) + '%,' + Math.round(93 * b) + '%)');
        g.addColorStop(0.35, 'hsl(340,' + Math.round(20 + p * 10) + '%,' + Math.round(91 * b) + '%)');
        g.addColorStop(0.65, 'hsl(45,' + Math.round(25 + p * 10) + '%,' + Math.round(92 * b) + '%)');
        g.addColorStop(1, 'hsl(150,' + Math.round(20 + p * 10) + '%,' + Math.round(90 * b) + '%)');
        return g;
      },
      floaters: 'NounVerbAdj',
      floatColors: ['#2563eb','#dc2626','#ca8a04','#16a34a','#9333ea','#0891b2'],
      accentType: 'tags', // rounded rectangle tags floating
      particleColor: 'rgba(37,99,235,0.7)',
      particleAccent: 'rgba(220,38,38,0.6)',
      correctSound: [523, 587, 659],
      wrongSound: [349, 311]
    },
    // RHYME — musical/bell world. Rose/magenta, musical notes, bell shapes
    rhyme: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W * 0.3, H);
        var b = 0.78 + p * 0.22;
        g.addColorStop(0, 'hsl(310,' + Math.round(40 + p * 15) + '%,' + Math.round(92 * b) + '%)');
        g.addColorStop(0.5, 'hsl(320,' + Math.round(35 + p * 10) + '%,' + Math.round(88 * b) + '%)');
        g.addColorStop(1, 'hsl(300,' + Math.round(30 + p * 10) + '%,' + Math.round(84 * b) + '%)');
        return g;
      },
      floaters: '\u266A\u266B\u2669\u266C\u2605',
      floatColors: ['#be185d','#db2777','#ec4899','#f472b6','#a21caf'],
      accentType: 'bells', // small bell/chime shapes
      particleColor: 'rgba(219,39,119,0.8)',
      particleAccent: 'rgba(236,72,153,0.6)',
      correctSound: [523, 659, 784, 1047],
      wrongSound: [349, 294]
    },
    // DEFAULT fallback
    default: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W * 0.3, H);
        g.addColorStop(0, 'hsl(25,30%,92%)');
        g.addColorStop(1, 'hsl(35,35%,85%)');
        return g;
      },
      floaters: 'ABCabc',
      floatColors: ['#64748b','#94a3b8','#cbd5e1'],
      accentType: 'bokeh',
      particleColor: 'rgba(100,116,139,0.7)',
      particleAccent: 'rgba(148,163,184,0.5)',
      correctSound: [523, 659],
      wrongSound: [294, 262]
    }
  };

  function getMode() { return MODES[mode] || MODES['default']; }

  // ==================== SCENE GENERATION ====================
  function generateScene() {
    if (!W || !H) return;
    var m = getMode();

    // Floating elements — per-mode characters
    elements = [];
    var chars = m.floaters;
    for (var i = 0; i < 18; i++) {
      elements.push({
        x: rand(0, W), y: rand(0, H),
        char: chars[Math.floor(rand(0, chars.length))],
        size: rand(14, 36),
        speed: rand(0.08, 0.28),
        drift: rand(-0.25, 0.25),
        opacity: rand(0.03, 0.09),
        rotation: rand(-0.3, 0.3),
        rotSpeed: rand(-0.004, 0.004),
        color: pick(m.floatColors)
      });
    }

    // Accent layer — depends on mode
    accents = [];
    if (m.accentType === 'bokeh' || m.accentType === 'inkdrops') {
      for (var i = 0; i < 12; i++) {
        accents.push({
          x: rand(0, W), y: rand(0, H),
          r: rand(20, 70), speed: rand(0.04, 0.18),
          phase: rand(0, Math.PI * 2),
          opacity: rand(0.02, 0.06),
          color: pick(m.floatColors)
        });
      }
    } else if (m.accentType === 'rings') {
      for (var i = 0; i < 5; i++) {
        accents.push({
          cx: W * 0.5, cy: H * 0.35,
          r: rand(30, 120), phase: rand(0, Math.PI * 2),
          speed: rand(0.3, 0.8)
        });
      }
    } else if (m.accentType === 'waves') {
      for (var i = 0; i < 4; i++) {
        accents.push({
          y: H * (0.25 + i * 0.15), amplitude: rand(8, 18),
          freq: rand(0.008, 0.02), speed: rand(0.5, 1.2),
          phase: rand(0, Math.PI * 2)
        });
      }
    } else if (m.accentType === 'blocks') {
      for (var i = 0; i < 10; i++) {
        accents.push({
          x: rand(0, W), y: rand(0, H),
          size: rand(16, 36), rotation: rand(-0.4, 0.4),
          speed: rand(0.06, 0.2), drift: rand(-0.15, 0.15),
          opacity: rand(0.03, 0.07),
          color: pick(m.floatColors)
        });
      }
    } else if (m.accentType === 'leaves') {
      for (var i = 0; i < 14; i++) {
        accents.push({
          x: rand(0, W), y: rand(-H * 0.2, H),
          size: rand(6, 14), rotation: rand(0, Math.PI * 2),
          rotSpeed: rand(-0.02, 0.02),
          fallSpeed: rand(0.15, 0.5), drift: rand(-0.3, 0.3),
          opacity: rand(0.08, 0.2),
          color: pick(m.floatColors)
        });
      }
    } else if (m.accentType === 'tracks') {
      // Static — drawn each frame
    } else if (m.accentType === 'pages') {
      for (var i = 0; i < 8; i++) {
        accents.push({
          x: rand(0, W), y: rand(0, H),
          w: rand(20, 40), h: rand(28, 48),
          rotation: rand(-0.3, 0.3),
          speed: rand(0.04, 0.15), drift: rand(-0.1, 0.1),
          opacity: rand(0.03, 0.07)
        });
      }
    } else if (m.accentType === 'tags') {
      var tagLabels = ['noun','verb','adj','adv','N','V','A'];
      for (var i = 0; i < 10; i++) {
        accents.push({
          x: rand(0, W), y: rand(0, H),
          label: pick(tagLabels),
          speed: rand(0.05, 0.18), drift: rand(-0.15, 0.15),
          opacity: rand(0.04, 0.08),
          color: pick(m.floatColors)
        });
      }
    } else if (m.accentType === 'sparkles' || m.accentType === 'bells') {
      for (var i = 0; i < 15; i++) {
        accents.push({
          x: rand(0, W), y: rand(0, H),
          size: rand(2, 5), phase: rand(0, Math.PI * 2),
          speed: rand(1, 3)
        });
      }
    }
  }

  // ==================== PARTICLE SYSTEM ====================
  function spawnParticle(x, y, c) {
    c = c || {};
    if (particles.length > 100) return;
    particles.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * (c.spread || 4),
      vy: (Math.random() - 0.5) * (c.spread || 4) - (c.rise || 1),
      life: 1, decay: c.decay || 0.02,
      size: c.size || 3 + Math.random() * 3,
      color: c.color || getMode().particleColor,
      gravity: c.gravity || 0,
      shape: c.shape || 'circle'
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

  // ==================== ACCENT DRAWING ====================
  function drawAccents() {
    var m = getMode();
    var t = time * 0.001;
    var aType = m.accentType;

    if (aType === 'bokeh' || aType === 'inkdrops') {
      for (var i = 0; i < accents.length; i++) {
        var a = accents[i];
        var ax = a.x + Math.sin(t * a.speed + a.phase) * 25;
        var ay = a.y + Math.cos(t * a.speed * 0.7 + a.phase) * 15;
        var pulse = 1 + Math.sin(t * 0.4 + a.phase) * 0.12;
        ctx.globalAlpha = a.opacity * (0.7 + progress * 0.5) * pulse;
        var g = ctx.createRadialGradient(ax, ay, 0, ax, ay, a.r * pulse);
        g.addColorStop(0, a.color);
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ax, ay, a.r * pulse, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (aType === 'rings') {
      ctx.strokeStyle = m.floatColors[0];
      ctx.lineWidth = 1.5;
      for (var i = 0; i < accents.length; i++) {
        var a = accents[i];
        var pulse = (Math.sin(t * a.speed + a.phase) + 1) * 0.5;
        var r = a.r * (0.5 + pulse * 0.8);
        ctx.globalAlpha = (1 - pulse) * 0.12 * (0.5 + progress * 0.5);
        ctx.beginPath();
        ctx.arc(a.cx, a.cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (aType === 'waves') {
      for (var i = 0; i < accents.length; i++) {
        var a = accents[i];
        ctx.globalAlpha = 0.06 * (0.5 + progress * 0.7);
        ctx.strokeStyle = m.floatColors[i % m.floatColors.length];
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (var x = 0; x <= W; x += 4) {
          var y = a.y + Math.sin(x * a.freq + t * a.speed + a.phase) * a.amplitude;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    } else if (aType === 'blocks') {
      for (var i = 0; i < accents.length; i++) {
        var a = accents[i];
        a.y -= a.speed * 0.3;
        a.x += a.drift * 0.2;
        if (a.y < -a.size * 2) { a.y = H + a.size * 2; a.x = rand(0, W); }
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rotation);
        ctx.globalAlpha = a.opacity * (0.5 + progress * 0.6);
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(-a.size / 2, -a.size / 2, a.size, a.size);
        // Letter inside
        ctx.fillStyle = a.color;
        ctx.globalAlpha = a.opacity * 0.5 * (0.5 + progress * 0.6);
        ctx.font = 'bold ' + (a.size * 0.5) + 'px "Fredoka One",cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(pick('ABCDEFG'), 0, 0);
        ctx.restore();
      }
    } else if (aType === 'leaves') {
      for (var i = 0; i < accents.length; i++) {
        var a = accents[i];
        a.y += a.fallSpeed * 0.4;
        a.x += a.drift * 0.3 + Math.sin(t * 0.5 + i) * 0.2;
        a.rotation += a.rotSpeed;
        if (a.y > H + 20) { a.y = -20; a.x = rand(0, W); }
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rotation);
        ctx.globalAlpha = a.opacity * (0.6 + progress * 0.5);
        ctx.fillStyle = a.color;
        ctx.beginPath();
        ctx.moveTo(0, -a.size);
        ctx.quadraticCurveTo(a.size, 0, 0, a.size);
        ctx.quadraticCurveTo(-a.size, 0, 0, -a.size);
        ctx.fill();
        // Vein
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, -a.size * 0.8);
        ctx.lineTo(0, a.size * 0.8);
        ctx.stroke();
        ctx.restore();
      }
    } else if (aType === 'tracks') {
      // Horizontal dashed lines like a sentence track
      ctx.setLineDash([8, 6]);
      ctx.lineWidth = 1;
      for (var i = 0; i < 5; i++) {
        var y = H * (0.2 + i * 0.15);
        ctx.globalAlpha = 0.05 * (0.5 + progress * 0.6);
        ctx.strokeStyle = m.floatColors[i % m.floatColors.length];
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    } else if (aType === 'pages') {
      for (var i = 0; i < accents.length; i++) {
        var a = accents[i];
        a.y -= a.speed * 0.3;
        a.x += a.drift * 0.2;
        if (a.y < -a.h * 2) { a.y = H + a.h * 2; a.x = rand(0, W); }
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rotation);
        ctx.globalAlpha = a.opacity * (0.5 + progress * 0.6);
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillRect(-a.w / 2, -a.h / 2, a.w, a.h);
        ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 0.5;
        ctx.strokeRect(-a.w / 2, -a.h / 2, a.w, a.h);
        // Text lines
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        for (var j = 0; j < 4; j++) {
          ctx.fillRect(-a.w / 2 + 3, -a.h / 2 + 4 + j * 5, a.w * (0.5 + Math.random() * 0.4), 1.5);
        }
        ctx.restore();
      }
    } else if (aType === 'tags') {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (var i = 0; i < accents.length; i++) {
        var a = accents[i];
        a.y -= a.speed * 0.3;
        a.x += a.drift * 0.2;
        if (a.y < -30) { a.y = H + 30; a.x = rand(0, W); }
        ctx.globalAlpha = a.opacity * (0.5 + progress * 0.6);
        ctx.fillStyle = a.color;
        ctx.font = '10px "Fredoka One",cursive';
        var tw = ctx.measureText(a.label).width + 10;
        // Rounded rect tag
        var rx = a.x - tw / 2, ry = a.y - 8;
        ctx.beginPath();
        ctx.roundRect(rx, ry, tw, 16, 8);
        ctx.globalAlpha = a.opacity * 0.3 * (0.5 + progress * 0.6);
        ctx.fill();
        ctx.globalAlpha = a.opacity * 0.8 * (0.5 + progress * 0.6);
        ctx.fillStyle = '#fff';
        ctx.fillText(a.label, a.x, a.y);
      }
    } else if (aType === 'sparkles' || aType === 'bells') {
      for (var i = 0; i < accents.length; i++) {
        var a = accents[i];
        var twink = 0.3 + Math.sin(t * a.speed + a.phase) * 0.4 + 0.3;
        ctx.globalAlpha = twink * 0.15 * (0.5 + progress * 0.6);
        ctx.fillStyle = '#fff';
        drawStar5(a.x, a.y, a.size * twink);
      }
    }
    ctx.globalAlpha = 1;
  }

  // ==================== FLOATING ELEMENTS ====================
  function drawElements() {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      el.y -= el.speed * 0.4;
      el.x += el.drift * 0.25;
      el.rotation += el.rotSpeed;
      if (el.y < -el.size * 2) { el.y = H + el.size * 2; el.x = rand(0, W); }
      if (el.x < -50) el.x = W + 50;
      if (el.x > W + 50) el.x = -50;

      ctx.save();
      ctx.translate(el.x, el.y);
      ctx.rotate(el.rotation);
      ctx.globalAlpha = el.opacity * (0.5 + progress * 0.6);
      ctx.font = 'bold ' + el.size + 'px "Fredoka One","Comic Sans MS",cursive';
      ctx.fillStyle = el.color;
      ctx.fillText(el.char, 0, 0);
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
    gain.gain.setValueAtTime(volume || 0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration);
  }

  function sfxCorrect(noteIndex) {
    var m = getMode();
    var notes = m.correctSound || [523, 659, 784];
    for (var i = 0; i < notes.length; i++) {
      playNote(notes[i], 0.25 - i * 0.03, 'sine', 0.07, i * 0.06);
    }
    // Shimmer
    if (notes.length > 0) playNote(notes[notes.length - 1] * 2, 0.15, 'sine', 0.02, notes.length * 0.06);
  }

  function sfxWrong() {
    var m = getMode();
    var notes = m.wrongSound || [294, 262];
    playNote(notes[0], 0.18, 'sine', 0.05);
    if (notes[1]) playNote(notes[1], 0.22, 'sine', 0.03, 0.06);
  }

  function sfxComplete() {
    var m = getMode();
    var base = m.correctSound || [523, 659, 784];
    // Victory arpeggio
    for (var i = 0; i < base.length; i++) {
      playNote(base[i], 0.4, 'sine', 0.08, i * 0.08);
      playNote(base[i] * 0.5, 0.5, 'triangle', 0.03, i * 0.08);
    }
    // Final sparkle
    setTimeout(function() {
      playNote(1319, 0.3, 'sine', 0.05);
      playNote(1568, 0.4, 'sine', 0.04, 0.1);
    }, base.length * 80 + 100);
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

    // Background
    var m = getMode();
    ctx.fillStyle = m.bg(progress);
    ctx.fillRect(0, 0, W, H);

    // Layers
    drawAccents();
    drawElements();
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

  function setMode(m) {
    mode = m || 'default';
    if (canvas) generateScene();
  }

  function onCorrect(x, y, noteIndex) {
    if (!canvas) return;
    var m = getMode();
    var px = x || W * 0.5, py = y || H * 0.4;
    emitBurst(px, py, 10, {
      spread: 6, rise: 2, decay: 0.02, size: 3.5,
      color: m.particleColor, shape: 'star'
    });
    emitBurst(px, py, 6, {
      spread: 4, rise: 1.5, decay: 0.025, size: 2.5,
      color: m.particleAccent
    });
    sfxCorrect(noteIndex);
  }

  function onWrong() {
    if (!canvas) return;
    var m = getMode();
    emitBurst(W * 0.5, H * 0.4, 6, {
      spread: 3, rise: -0.3, gravity: 0.03, decay: 0.012, size: 2,
      color: 'rgba(220,80,60,0.4)'
    });
    sfxWrong();
  }

  function onComplete(pct) {
    targetProgress = pct || 1;
    if (!canvas) return;
    var m = getMode();
    // Big celebration burst
    emitBurst(W * 0.5, H * 0.35, 25, {
      spread: 10, rise: 3, decay: 0.012, size: 4,
      color: m.particleColor, shape: 'star'
    });
    emitBurst(W * 0.5, H * 0.35, 15, {
      spread: 7, rise: 2, decay: 0.015, size: 3,
      color: m.particleAccent
    });
    // Rainbow extra
    var rainbow = ['rgba(255,107,107,0.7)','rgba(255,217,61,0.7)','rgba(85,239,196,0.7)','rgba(116,185,255,0.7)','rgba(162,155,254,0.7)'];
    for (var i = 0; i < rainbow.length; i++) {
      emitBurst(W * (0.2 + i * 0.15), H * 0.3, 5, {
        spread: 5, rise: 2.5, decay: 0.018, size: 3, color: rainbow[i], shape: 'star'
      });
    }
    sfxComplete();
  }

  function setProgress(pct) {
    targetProgress = Math.max(0, Math.min(1, pct || 0));
  }

  window.ClassmatesLiteracyFX = {
    init: init,
    start: start,
    stop: stop,
    setMode: setMode,
    onCorrect: onCorrect,
    onWrong: onWrong,
    onComplete: onComplete,
    setProgress: setProgress
  };
})();
