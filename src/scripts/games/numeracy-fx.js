(function(){
  // ============================================================
  // NUMERACY FX ENGINE — Per-Game Visual Worlds
  // Each numeracy game has its own Canvas scene, particles,
  // colour palette, floating elements, and sound design.
  // Mode is set via setMode('maths'), etc.
  // ============================================================

  var canvas, ctx, animId, running = false;
  var W = 0, H = 0, time = 0;
  var progress = 0, targetProgress = 0;
  var mode = 'default';
  var particles = [];
  var elements = [];
  var accents = [];
  var stars = [];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

  // ==================== MODE DEFINITIONS ====================
  var MODES = {
    // MATHS — deep blue calculator world
    maths: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W * 0.3, H);
        var b = 0.7 + p * 0.3;
        g.addColorStop(0, 'hsl(220,' + Math.round(55 + p * 15) + '%,' + Math.round(22 * b) + '%)');
        g.addColorStop(0.5, 'hsl(230,' + Math.round(50 + p * 10) + '%,' + Math.round(26 * b) + '%)');
        g.addColorStop(1, 'hsl(240,' + Math.round(45 + p * 10) + '%,' + Math.round(20 * b) + '%)');
        return g;
      },
      floaters: '0123456789+-\u00D7\u00F7=',
      floatColors: ['#60a5fa','#93c5fd','#3b82f6','#2563eb','#dbeafe'],
      accentType: 'grid', // faint grid lines
      starCount: 40,
      particleColor: 'rgba(96,165,250,0.8)',
      particleAccent: 'rgba(147,197,253,0.6)',
      correctSound: [523, 659, 784],
      wrongSound: [294, 262]
    },
    // TIMES TABLES — fiery orange race theme
    times: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W, H * 0.3);
        var b = 0.72 + p * 0.28;
        g.addColorStop(0, 'hsl(15,' + Math.round(60 + p * 15) + '%,' + Math.round(20 * b) + '%)');
        g.addColorStop(0.5, 'hsl(20,' + Math.round(55 + p * 10) + '%,' + Math.round(24 * b) + '%)');
        g.addColorStop(1, 'hsl(10,' + Math.round(50 + p * 10) + '%,' + Math.round(18 * b) + '%)');
        return g;
      },
      floaters: '\u00D72345678910111213',
      floatColors: ['#f97316','#fb923c','#fdba74','#ea580c','#fed7aa'],
      accentType: 'flames', // rising flame shapes
      starCount: 30,
      particleColor: 'rgba(249,115,22,0.8)',
      particleAccent: 'rgba(251,146,60,0.6)',
      correctSound: [440, 554, 659],
      wrongSound: [330, 277]
    },
    // SPEED — electric green race theme
    speed: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W * 0.4, H);
        var b = 0.7 + p * 0.3;
        g.addColorStop(0, 'hsl(150,' + Math.round(55 + p * 15) + '%,' + Math.round(18 * b) + '%)');
        g.addColorStop(0.5, 'hsl(160,' + Math.round(50 + p * 10) + '%,' + Math.round(22 * b) + '%)');
        g.addColorStop(1, 'hsl(140,' + Math.round(45 + p * 10) + '%,' + Math.round(16 * b) + '%)');
        return g;
      },
      floaters: '60s\u26A1\u23F1\u23F0',
      floatColors: ['#22c55e','#4ade80','#86efac','#16a34a','#bbf7d0'],
      accentType: 'streaks', // horizontal speed lines
      starCount: 25,
      particleColor: 'rgba(34,197,94,0.8)',
      particleAccent: 'rgba(74,222,128,0.6)',
      correctSound: [523, 659, 784, 1047],
      wrongSound: [349, 294]
    },
    // NUMBER BONDS — teal connection theme
    bonds: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, 0, H);
        var b = 0.72 + p * 0.28;
        g.addColorStop(0, 'hsl(170,' + Math.round(50 + p * 15) + '%,' + Math.round(20 * b) + '%)');
        g.addColorStop(1, 'hsl(180,' + Math.round(45 + p * 10) + '%,' + Math.round(18 * b) + '%)');
        return g;
      },
      floaters: '?+= 101520',
      floatColors: ['#14b8a6','#2dd4bf','#5eead4','#0d9488','#99f6e4'],
      accentType: 'connections', // dotted lines connecting nodes
      starCount: 35,
      particleColor: 'rgba(20,184,166,0.8)',
      particleAccent: 'rgba(45,212,191,0.6)',
      correctSound: [440, 523, 659],
      wrongSound: [311, 277]
    },
    // MISSING NUMBER — purple puzzle theme
    missnum: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W * 0.3, H);
        var b = 0.72 + p * 0.28;
        g.addColorStop(0, 'hsl(270,' + Math.round(45 + p * 15) + '%,' + Math.round(22 * b) + '%)');
        g.addColorStop(1, 'hsl(280,' + Math.round(40 + p * 10) + '%,' + Math.round(20 * b) + '%)');
        return g;
      },
      floaters: '?=+-\u00D7\u00F7',
      floatColors: ['#a855f7','#c084fc','#d8b4fe','#9333ea','#e9d5ff'],
      accentType: 'bokeh',
      starCount: 40,
      particleColor: 'rgba(168,85,247,0.8)',
      particleAccent: 'rgba(192,132,252,0.6)',
      correctSound: [523, 659, 784],
      wrongSound: [294, 262]
    },
    // PLACE VALUE — amber/gold blocks
    placeval: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, 0, H);
        var b = 0.73 + p * 0.27;
        g.addColorStop(0, 'hsl(40,' + Math.round(50 + p * 15) + '%,' + Math.round(22 * b) + '%)');
        g.addColorStop(1, 'hsl(35,' + Math.round(45 + p * 10) + '%,' + Math.round(18 * b) + '%)');
        return g;
      },
      floaters: 'HTO100s10s1s',
      floatColors: ['#d97706','#f59e0b','#fbbf24','#b45309','#fde68a'],
      accentType: 'blocks',
      starCount: 30,
      particleColor: 'rgba(217,119,6,0.8)',
      particleAccent: 'rgba(245,158,11,0.6)',
      correctSound: [392, 523, 659],
      wrongSound: [330, 294]
    },
    // TELLING TIME — sky blue clock
    telltime: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W * 0.3, H);
        var b = 0.73 + p * 0.27;
        g.addColorStop(0, 'hsl(200,' + Math.round(50 + p * 15) + '%,' + Math.round(24 * b) + '%)');
        g.addColorStop(1, 'hsl(210,' + Math.round(45 + p * 10) + '%,' + Math.round(20 * b) + '%)');
        return g;
      },
      floaters: '12369\u23F0:00',
      floatColors: ['#0ea5e9','#38bdf8','#7dd3fc','#0284c7','#bae6fd'],
      accentType: 'clockhands', // rotating clock hand shapes
      starCount: 35,
      particleColor: 'rgba(14,165,233,0.8)',
      particleAccent: 'rgba(56,189,248,0.6)',
      correctSound: [523, 587, 659],
      wrongSound: [349, 311]
    },
    // MONEY — gold/green currency
    money: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W * 0.4, H);
        var b = 0.72 + p * 0.28;
        g.addColorStop(0, 'hsl(80,' + Math.round(40 + p * 10) + '%,' + Math.round(20 * b) + '%)');
        g.addColorStop(1, 'hsl(50,' + Math.round(50 + p * 15) + '%,' + Math.round(22 * b) + '%)');
        return g;
      },
      floaters: '\u00A3p12550',
      floatColors: ['#ca8a04','#eab308','#facc15','#a16207','#fef08a'],
      accentType: 'coins',
      starCount: 25,
      particleColor: 'rgba(202,138,4,0.8)',
      particleAccent: 'rgba(234,179,8,0.6)',
      correctSound: [440, 554, 659, 880],
      wrongSound: [330, 277]
    },
    // FRACTIONS — warm coral pie slices
    fractions: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, 0, H);
        var b = 0.72 + p * 0.28;
        g.addColorStop(0, 'hsl(350,' + Math.round(45 + p * 15) + '%,' + Math.round(22 * b) + '%)');
        g.addColorStop(1, 'hsl(10,' + Math.round(40 + p * 10) + '%,' + Math.round(20 * b) + '%)');
        return g;
      },
      floaters: '\u00BD\u00BC\u00BE\u2153\u2154',
      floatColors: ['#f43f5e','#fb7185','#fda4af','#e11d48','#fecdd3'],
      accentType: 'pieslices',
      starCount: 30,
      particleColor: 'rgba(244,63,94,0.8)',
      particleAccent: 'rgba(251,113,133,0.6)',
      correctSound: [523, 659, 784],
      wrongSound: [294, 262]
    },
    // WORD PROBLEMS — warm brown story
    wordprob: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W * 0.3, H);
        var b = 0.72 + p * 0.28;
        g.addColorStop(0, 'hsl(25,' + Math.round(40 + p * 10) + '%,' + Math.round(22 * b) + '%)');
        g.addColorStop(1, 'hsl(20,' + Math.round(35 + p * 10) + '%,' + Math.round(18 * b) + '%)');
        return g;
      },
      floaters: '?+\u00D7=\u00F7',
      floatColors: ['#a8a29e','#d6d3d1','#78716c','#57534e','#e7e5e4'],
      accentType: 'bokeh',
      starCount: 35,
      particleColor: 'rgba(120,113,108,0.7)',
      particleAccent: 'rgba(168,162,158,0.5)',
      correctSound: [440, 523, 659],
      wrongSound: [330, 294]
    },
    // SHAPES — multi-colour geometry
    shapes: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W, H);
        var b = 0.72 + p * 0.28;
        g.addColorStop(0, 'hsl(250,' + Math.round(35 + p * 10) + '%,' + Math.round(22 * b) + '%)');
        g.addColorStop(0.5, 'hsl(200,' + Math.round(30 + p * 10) + '%,' + Math.round(24 * b) + '%)');
        g.addColorStop(1, 'hsl(170,' + Math.round(35 + p * 10) + '%,' + Math.round(20 * b) + '%)');
        return g;
      },
      floaters: '\u25B3\u25CB\u25A1\u2B21\u2B22',
      floatColors: ['#8b5cf6','#06b6d4','#f43f5e','#f59e0b','#22c55e'],
      accentType: 'shapes',
      starCount: 30,
      particleColor: 'rgba(139,92,246,0.7)',
      particleAccent: 'rgba(6,182,212,0.6)',
      correctSound: [523, 659, 784],
      wrongSound: [294, 262]
    },
    // DATA HANDLING — cool slate charts
    datahandling: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, 0, H);
        var b = 0.72 + p * 0.28;
        g.addColorStop(0, 'hsl(215,' + Math.round(35 + p * 10) + '%,' + Math.round(22 * b) + '%)');
        g.addColorStop(1, 'hsl(220,' + Math.round(30 + p * 10) + '%,' + Math.round(18 * b) + '%)');
        return g;
      },
      floaters: '\u2581\u2582\u2583\u2584\u2585\u2586\u2587\u2588',
      floatColors: ['#60a5fa','#f472b6','#a78bfa','#34d399','#fbbf24'],
      accentType: 'bars',
      starCount: 25,
      particleColor: 'rgba(96,165,250,0.7)',
      particleAccent: 'rgba(244,114,182,0.6)',
      correctSound: [440, 554, 659],
      wrongSound: [311, 277]
    },
    // MEASURE — teal ruler/tape
    measure: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W * 0.3, H);
        var b = 0.72 + p * 0.28;
        g.addColorStop(0, 'hsl(190,' + Math.round(45 + p * 10) + '%,' + Math.round(22 * b) + '%)');
        g.addColorStop(1, 'hsl(185,' + Math.round(40 + p * 10) + '%,' + Math.round(18 * b) + '%)');
        return g;
      },
      floaters: 'cmmmkggml\u00B0',
      floatColors: ['#0891b2','#06b6d4','#22d3ee','#0e7490','#67e8f9'],
      accentType: 'ruler',
      starCount: 30,
      particleColor: 'rgba(8,145,178,0.8)',
      particleAccent: 'rgba(6,182,212,0.6)',
      correctSound: [523, 587, 659],
      wrongSound: [349, 311]
    },
    // SEQUENCES — indigo pattern
    sequence: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W * 0.4, H);
        var b = 0.72 + p * 0.28;
        g.addColorStop(0, 'hsl(245,' + Math.round(45 + p * 15) + '%,' + Math.round(22 * b) + '%)');
        g.addColorStop(1, 'hsl(255,' + Math.round(40 + p * 10) + '%,' + Math.round(18 * b) + '%)');
        return g;
      },
      floaters: '1,2,?,3,5,8',
      floatColors: ['#6366f1','#818cf8','#a5b4fc','#4f46e5','#c7d2fe'],
      accentType: 'dots', // connected dot pattern
      starCount: 40,
      particleColor: 'rgba(99,102,241,0.8)',
      particleAccent: 'rgba(129,140,248,0.6)',
      correctSound: [392, 523, 659, 784],
      wrongSound: [330, 294]
    },
    default: {
      bg: function(p) {
        var g = ctx.createLinearGradient(0, 0, W * 0.3, H);
        g.addColorStop(0, 'hsl(230,40%,18%)');
        g.addColorStop(1, 'hsl(240,35%,15%)');
        return g;
      },
      floaters: '0123456789',
      floatColors: ['#60a5fa','#93c5fd','#3b82f6'],
      accentType: 'grid',
      starCount: 40,
      particleColor: 'rgba(96,165,250,0.7)',
      particleAccent: 'rgba(147,197,253,0.5)',
      correctSound: [523, 659],
      wrongSound: [294, 262]
    }
  };

  function getMode() { return MODES[mode] || MODES['default']; }

  // ==================== SCENE GENERATION ====================
  function generateScene() {
    if (!W || !H) return;
    var m = getMode();

    // Stars
    stars = [];
    var sc = m.starCount || 40;
    for (var i = 0; i < sc; i++) {
      stars.push({
        x: rand(0, W), y: rand(0, H * 0.7),
        size: rand(0.8, 2.5), twinkle: rand(0, Math.PI * 2),
        speed: rand(1, 3)
      });
    }

    // Floating elements
    elements = [];
    var chars = m.floaters;
    for (var i = 0; i < 14; i++) {
      elements.push({
        x: rand(0, W), y: rand(0, H),
        char: chars[Math.floor(rand(0, chars.length))],
        size: rand(12, 30), speed: rand(0.06, 0.22),
        drift: rand(-0.2, 0.2), opacity: rand(0.03, 0.08),
        rotation: rand(-0.3, 0.3), rotSpeed: rand(-0.003, 0.003),
        color: pick(m.floatColors)
      });
    }

    // Accents
    accents = [];
    var aType = m.accentType;
    if (aType === 'bokeh' || aType === 'coins' || aType === 'pieslices') {
      for (var i = 0; i < 10; i++) {
        accents.push({
          x: rand(0, W), y: rand(0, H),
          r: rand(15, 50), speed: rand(0.04, 0.15),
          phase: rand(0, Math.PI * 2), opacity: rand(0.02, 0.05),
          color: pick(m.floatColors)
        });
      }
    } else if (aType === 'blocks' || aType === 'shapes') {
      for (var i = 0; i < 8; i++) {
        accents.push({
          x: rand(0, W), y: rand(0, H),
          size: rand(14, 30), rotation: rand(-0.4, 0.4),
          speed: rand(0.05, 0.15), drift: rand(-0.12, 0.12),
          opacity: rand(0.03, 0.06), color: pick(m.floatColors),
          sides: aType === 'shapes' ? Math.floor(rand(3, 7)) : 4
        });
      }
    } else if (aType === 'connections' || aType === 'dots') {
      for (var i = 0; i < 12; i++) {
        accents.push({
          x: rand(W * 0.1, W * 0.9),
          y: rand(H * 0.1, H * 0.9),
          r: rand(3, 6), phase: rand(0, Math.PI * 2)
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
      if (p.shape === 'star') drawStar5(p.x, p.y, p.size * p.life);
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }

  // ==================== DRAWING ====================
  function drawStars() {
    var t = time * 0.001;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var twink = 0.3 + Math.sin(t * s.speed + s.twinkle) * 0.4 + 0.3;
      ctx.globalAlpha = twink * (0.4 + progress * 0.5);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawElements() {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      el.y -= el.speed * 0.35;
      el.x += el.drift * 0.2;
      el.rotation += el.rotSpeed;
      if (el.y < -el.size * 2) { el.y = H + el.size * 2; el.x = rand(0, W); }
      if (el.x < -40) el.x = W + 40;
      if (el.x > W + 40) el.x = -40;
      ctx.save();
      ctx.translate(el.x, el.y);
      ctx.rotate(el.rotation);
      ctx.globalAlpha = el.opacity * (0.4 + progress * 0.7);
      ctx.font = 'bold ' + el.size + 'px "Fredoka One","Comic Sans MS",cursive';
      ctx.fillStyle = el.color;
      ctx.fillText(el.char, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawAccents() {
    var m = getMode();
    var t = time * 0.001;
    var aType = m.accentType;

    if (aType === 'grid') {
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 0.5;
      var gap = 40;
      ctx.globalAlpha = 0.5 + progress * 0.3;
      for (var x = gap; x < W; x += gap) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (var y = gap; y < H; y += gap) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    } else if (aType === 'flames') {
      for (var i = 0; i < 6; i++) {
        var fx = W * (0.1 + i * 0.16);
        var fy = H;
        ctx.globalAlpha = 0.04 * (0.5 + progress * 0.6);
        var fg = ctx.createLinearGradient(fx, fy, fx, fy - 100);
        fg.addColorStop(0, pick(m.floatColors));
        fg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = fg;
        ctx.beginPath();
        ctx.moveTo(fx - 15, fy);
        ctx.quadraticCurveTo(fx + Math.sin(t * 2 + i) * 10, fy - 60 - Math.sin(t * 3 + i) * 20, fx, fy - 80 - progress * 30);
        ctx.quadraticCurveTo(fx + Math.sin(t * 2.5 + i) * 8, fy - 50, fx + 15, fy);
        ctx.fill();
      }
    } else if (aType === 'streaks') {
      ctx.lineWidth = 1;
      for (var i = 0; i < 8; i++) {
        var sy = H * (0.1 + i * 0.1) + Math.sin(t * 0.5 + i) * 10;
        var sx = (t * 80 * (1 + i * 0.2)) % (W + 200) - 100;
        ctx.globalAlpha = 0.06 * (0.5 + progress * 0.6);
        ctx.strokeStyle = pick(m.floatColors);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + rand(40, 100), sy);
        ctx.stroke();
      }
    } else if (aType === 'bokeh' || aType === 'coins' || aType === 'pieslices') {
      for (var i = 0; i < accents.length; i++) {
        var a = accents[i];
        var ax = a.x + Math.sin(t * a.speed + a.phase) * 20;
        var ay = a.y + Math.cos(t * a.speed * 0.7 + a.phase) * 12;
        ctx.globalAlpha = a.opacity * (0.6 + progress * 0.5);
        var g = ctx.createRadialGradient(ax, ay, 0, ax, ay, a.r);
        g.addColorStop(0, a.color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ax, ay, a.r, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (aType === 'blocks' || aType === 'shapes') {
      for (var i = 0; i < accents.length; i++) {
        var a = accents[i];
        a.y -= a.speed * 0.25;
        a.x += a.drift * 0.15;
        if (a.y < -a.size * 2) { a.y = H + a.size * 2; a.x = rand(0, W); }
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(a.rotation + t * 0.1);
        ctx.globalAlpha = a.opacity * (0.4 + progress * 0.6);
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 1.5;
        if (a.sides && a.sides !== 4) {
          ctx.beginPath();
          for (var j = 0; j < a.sides; j++) {
            var ang = (j / a.sides) * Math.PI * 2 - Math.PI / 2;
            if (j === 0) ctx.moveTo(Math.cos(ang) * a.size * 0.5, Math.sin(ang) * a.size * 0.5);
            else ctx.lineTo(Math.cos(ang) * a.size * 0.5, Math.sin(ang) * a.size * 0.5);
          }
          ctx.closePath();
          ctx.stroke();
        } else {
          ctx.strokeRect(-a.size / 2, -a.size / 2, a.size, a.size);
        }
        ctx.restore();
      }
    } else if (aType === 'connections' || aType === 'dots') {
      ctx.fillStyle = '#fff';
      for (var i = 0; i < accents.length; i++) {
        var a = accents[i];
        var pulse = 0.5 + Math.sin(t * 1.5 + a.phase) * 0.3;
        ctx.globalAlpha = 0.08 * pulse * (0.5 + progress * 0.6);
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r * pulse, 0, Math.PI * 2);
        ctx.fill();
        // Connect to next
        if (i < accents.length - 1) {
          ctx.globalAlpha = 0.03 * (0.5 + progress * 0.5);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 0.5;
          ctx.setLineDash([3, 4]);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(accents[i + 1].x, accents[i + 1].y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
    } else if (aType === 'clockhands' || aType === 'ruler' || aType === 'bars') {
      // Simple tick marks
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      var gap = aType === 'bars' ? 30 : 50;
      for (var x = gap; x < W; x += gap) {
        var h = aType === 'bars' ? rand(20, H * 0.3) : 8;
        ctx.globalAlpha = 0.04 * (0.5 + progress * 0.5);
        ctx.beginPath();
        ctx.moveTo(x, H);
        ctx.lineTo(x, H - h);
        ctx.stroke();
      }
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
    osc.type = type || 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume || 0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration);
  }

  function sfxCorrect(noteIndex) {
    var m = getMode();
    var notes = m.correctSound || [523, 659, 784];
    for (var i = 0; i < notes.length; i++) {
      playNote(notes[i], 0.22, 'triangle', 0.06, i * 0.05);
    }
  }

  function sfxWrong() {
    var m = getMode();
    var notes = m.wrongSound || [294, 262];
    playNote(notes[0], 0.16, 'triangle', 0.05);
    if (notes[1]) playNote(notes[1], 0.2, 'triangle', 0.03, 0.05);
  }

  function sfxComplete() {
    var m = getMode();
    var base = m.correctSound || [523, 659, 784];
    for (var i = 0; i < base.length; i++) {
      playNote(base[i], 0.35, 'triangle', 0.07, i * 0.07);
      playNote(base[i] * 0.5, 0.4, 'sine', 0.025, i * 0.07);
    }
    setTimeout(function() {
      playNote(1319, 0.25, 'sine', 0.04);
      playNote(1568, 0.35, 'sine', 0.03, 0.08);
    }, base.length * 70 + 80);
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

    var m = getMode();
    ctx.fillStyle = m.bg(progress);
    ctx.fillRect(0, 0, W, H);

    drawStars();
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
    emitBurst(W * 0.5, H * 0.35, 25, {
      spread: 10, rise: 3, decay: 0.012, size: 4,
      color: m.particleColor, shape: 'star'
    });
    emitBurst(W * 0.5, H * 0.35, 15, {
      spread: 7, rise: 2, decay: 0.015, size: 3,
      color: m.particleAccent
    });
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

  window.ClassmatesNumeracyFX = {
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
