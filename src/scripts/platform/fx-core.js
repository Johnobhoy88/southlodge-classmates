(function(){
  // ============================================================
  // FX CORE — Shared Game Scene Infrastructure
  // Particle system, easing, scene registry, canvas management.
  // Every game scene builds on top of this.
  // ============================================================

  // ==================== EASING FUNCTIONS ====================
  // All Robert Penner easings. Usage: ease.cubicOut(t) where t is 0-1
  var ease = {
    linear: function(t) { return t; },
    quadIn: function(t) { return t * t; },
    quadOut: function(t) { return t * (2 - t); },
    quadInOut: function(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },
    cubicIn: function(t) { return t * t * t; },
    cubicOut: function(t) { return (--t) * t * t + 1; },
    cubicInOut: function(t) { return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1; },
    quartOut: function(t) { return 1 - (--t) * t * t * t; },
    sinIn: function(t) { return 1 - Math.cos(t * Math.PI / 2); },
    sinOut: function(t) { return Math.sin(t * Math.PI / 2); },
    sinInOut: function(t) { return -(Math.cos(Math.PI * t) - 1) / 2; },
    expoOut: function(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); },
    circOut: function(t) { return Math.sqrt(1 - (--t) * t); },
    backOut: function(t) { var c = 1.70158; return 1 + (--t) * t * ((c + 1) * t + c); },
    bounceOut: function(t) {
      if (t < 1/2.75) return 7.5625 * t * t;
      if (t < 2/2.75) return 7.5625 * (t -= 1.5/2.75) * t + 0.75;
      if (t < 2.5/2.75) return 7.5625 * (t -= 2.25/2.75) * t + 0.9375;
      return 7.5625 * (t -= 2.625/2.75) * t + 0.984375;
    },
    elasticOut: function(t) {
      return t === 0 ? 0 : t === 1 ? 1 :
        Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
    }
  };

  // ==================== COLOUR UTILITIES ====================
  // Parse 'rgba(r,g,b,a)' or '#rrggbb' to {r,g,b,a}
  function parseColor(str) {
    if (str[0] === '#') {
      var hex = str.slice(1);
      return {
        r: parseInt(hex.substr(0, 2), 16),
        g: parseInt(hex.substr(2, 2), 16),
        b: parseInt(hex.substr(4, 2), 16),
        a: 1
      };
    }
    var m = str.match(/[\d.]+/g);
    if (!m) return { r: 255, g: 255, b: 255, a: 1 };
    return { r: +m[0], g: +m[1], b: +m[2], a: m[3] !== undefined ? +m[3] : 1 };
  }

  // Lerp between two {r,g,b,a} colours
  function lerpColor(a, b, t) {
    return {
      r: Math.round(a.r + (b.r - a.r) * t),
      g: Math.round(a.g + (b.g - a.g) * t),
      b: Math.round(a.b + (b.b - a.b) * t),
      a: a.a + (b.a - a.a) * t
    };
  }

  function colorToStr(c) {
    return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + c.a.toFixed(3) + ')';
  }

  // ==================== PARTICLE SYSTEM ====================
  // Object-pooled. Pre-allocates 300 particles. No splice, no GC.
  var POOL_SIZE = 300;
  var pool = [];
  var aliveCount = 0;

  function initPool() {
    pool = [];
    aliveCount = 0;
    for (var i = 0; i < POOL_SIZE; i++) {
      pool.push({
        alive: false, x: 0, y: 0, vx: 0, vy: 0,
        life: 0, maxLife: 1, decay: 0.02,
        size: 3, startSize: 3, endSize: 0,
        startColor: null, endColor: null, currentColor: '',
        shape: 'circle', // circle, star, diamond, streak
        gravity: 0, drag: 0,
        rotation: 0, rotSpeed: 0
      });
    }
  }
  initPool();

  function spawnParticle(x, y, cfg) {
    cfg = cfg || {};
    // Find a dead particle
    for (var i = 0; i < POOL_SIZE; i++) {
      var p = pool[i];
      if (!p.alive) {
        p.alive = true;
        p.x = x; p.y = y;
        p.vx = (Math.random() - 0.5) * (cfg.spread || 4);
        p.vy = (Math.random() - 0.5) * (cfg.spread || 4) - (cfg.rise || 1);
        p.life = 1; p.maxLife = 1;
        p.decay = cfg.decay || 0.02;
        p.startSize = cfg.size || 3 + Math.random() * 3;
        p.endSize = cfg.endSize !== undefined ? cfg.endSize : 0;
        p.size = p.startSize;
        p.shape = cfg.shape || 'circle';
        p.gravity = cfg.gravity || 0;
        p.drag = cfg.drag || 0;
        p.rotation = Math.random() * Math.PI * 2;
        p.rotSpeed = (Math.random() - 0.5) * 0.1;
        // Colour
        var startStr = cfg.color || cfg.startColor || 'rgba(255,255,255,0.8)';
        p.startColor = parseColor(startStr);
        p.endColor = cfg.endColor ? parseColor(cfg.endColor) : { r: p.startColor.r, g: p.startColor.g, b: p.startColor.b, a: 0 };
        p.currentColor = startStr;
        aliveCount++;
        return p;
      }
    }
    return null; // pool exhausted
  }

  function emitBurst(x, y, count, cfg) {
    for (var i = 0; i < count; i++) spawnParticle(x, y, cfg);
  }

  function updateParticles(dt) {
    var dtScale = dt * 60;
    aliveCount = 0;
    for (var i = 0; i < POOL_SIZE; i++) {
      var p = pool[i];
      if (!p.alive) continue;
      aliveCount++;
      p.x += p.vx * dtScale;
      p.y += p.vy * dtScale;
      p.vy += p.gravity * dtScale;
      if (p.drag) { p.vx *= (1 - p.drag); p.vy *= (1 - p.drag); }
      p.rotation += p.rotSpeed * dtScale;
      p.life -= p.decay * dtScale;
      if (p.life <= 0) { p.alive = false; continue; }
      // Interpolate colour
      var t = 1 - p.life;
      var c = lerpColor(p.startColor, p.endColor, t);
      p.currentColor = colorToStr(c);
      // Interpolate size
      p.size = p.startSize + (p.endSize - p.startSize) * t;
    }
  }

  function drawParticles(ctx, blendMode) {
    var prevComposite = ctx.globalCompositeOperation;
    if (blendMode) ctx.globalCompositeOperation = blendMode;

    for (var i = 0; i < POOL_SIZE; i++) {
      var p = pool[i];
      if (!p.alive) continue;
      ctx.globalAlpha = p.life * 0.85;
      ctx.fillStyle = p.currentColor;

      if (p.shape === 'star') {
        drawStar5(ctx, p.x, p.y, p.size);
      } else if (p.shape === 'diamond') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.6, 0);
        ctx.lineTo(0, p.size);
        ctx.lineTo(-p.size * 0.6, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else if (p.shape === 'streak') {
        ctx.save();
        ctx.translate(p.x, p.y);
        var angle = Math.atan2(p.vy, p.vx);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 2, p.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = prevComposite;
  }

  function drawStar5(ctx, cx, cy, r) {
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

  function clearParticles() {
    for (var i = 0; i < POOL_SIZE; i++) pool[i].alive = false;
    aliveCount = 0;
  }

  // ==================== SCENE REGISTRY ====================
  // Games register their scene: FXCore.register('maths', { enter, update, draw, exit })
  // showScreen calls FXCore.activate(id) — one line replaces all if-branching.
  var scenes = {};
  var activeScene = null;
  var activeId = null;
  var canvas = null, ctx = null;
  var W = 0, H = 0;
  var animId = null, running = false;
  var lastTime = 0;

  function register(id, scene) {
    scenes[id] = scene;
  }

  function activate(id) {
    // Deactivate current
    if (activeScene && activeScene.exit) activeScene.exit();
    if (animId) cancelAnimationFrame(animId);
    running = false;

    activeId = id;
    activeScene = scenes[id] || null;

    if (!activeScene) return;

    // Find canvas for this game
    var canvasId = id + 'Canvas';
    // Special cases for legacy naming
    if (id === 'spelling') canvasId = 'spellCanvas';
    canvas = document.getElementById(canvasId);
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    W = canvas.width = canvas.clientWidth || 600;
    H = canvas.height = canvas.clientHeight || 400;

    clearParticles();

    if (activeScene.enter) activeScene.enter(canvas, ctx, W, H);

    running = true;
    lastTime = performance.now();
    animId = requestAnimationFrame(loop);
  }

  function deactivate() {
    if (activeScene && activeScene.exit) activeScene.exit();
    if (animId) cancelAnimationFrame(animId);
    running = false;
    activeScene = null;
    activeId = null;
  }

  function loop(t) {
    if (!running || !activeScene) return;
    var dt = Math.min((t - lastTime) / 1000, 0.05);
    lastTime = t;

    // Resize check
    if (canvas && (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight)) {
      W = canvas.width = canvas.clientWidth;
      H = canvas.height = canvas.clientHeight;
      if (activeScene.resize) activeScene.resize(W, H);
    }

    // Update
    if (activeScene.update) activeScene.update(dt, t);
    updateParticles(dt);

    // Draw
    if (ctx && activeScene.draw) activeScene.draw(ctx, W, H, t);
    drawParticles(ctx, 'lighter');

    animId = requestAnimationFrame(loop);
  }

  // ==================== SCREEN SHAKE ====================
  var shakeAmount = 0;
  var shakeDuration = 0;

  function screenShake(amount, duration) {
    shakeAmount = amount || 4;
    shakeDuration = duration || 150;
  }

  function getShakeOffset() {
    if (shakeDuration <= 0) return { x: 0, y: 0 };
    shakeDuration -= 16; // ~1 frame
    var decay = shakeDuration / 150;
    return {
      x: (Math.random() - 0.5) * shakeAmount * decay,
      y: (Math.random() - 0.5) * shakeAmount * decay
    };
  }

  // ==================== SIMPLEX NOISE 2D ====================
  // Compact 2D simplex noise. Returns -1..1.
  // Usage: FXCore.noise2D(x, y) — scale inputs for frequency.
  var _F2 = 0.5 * (Math.sqrt(3) - 1);
  var _G2 = (3 - Math.sqrt(3)) / 6;
  var _grad2 = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
  var _perm = new Array(512);
  (function(){
    var p = [];
    for (var i = 0; i < 256; i++) p[i] = i;
    for (var i = 255; i > 0; i--) {
      var j = Math.floor((i + 1) * 0.5 * (Math.sin(i * 127.1 + 311.7) + 1));
      j = j % (i + 1);
      var t = p[i]; p[i] = p[j]; p[j] = t;
    }
    for (var i = 0; i < 512; i++) _perm[i] = p[i & 255];
  })();

  function noise2D(xin, yin) {
    var s = (xin + yin) * _F2;
    var i = Math.floor(xin + s), j = Math.floor(yin + s);
    var t = (i + j) * _G2;
    var x0 = xin - (i - t), y0 = yin - (j - t);
    var i1 = x0 > y0 ? 1 : 0, j1 = x0 > y0 ? 0 : 1;
    var x1 = x0 - i1 + _G2, y1 = y0 - j1 + _G2;
    var x2 = x0 - 1 + 2 * _G2, y2 = y0 - 1 + 2 * _G2;
    var ii = i & 255, jj = j & 255;
    var n0 = 0, n1 = 0, n2 = 0;
    var t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) { t0 *= t0; var g = _grad2[_perm[ii + _perm[jj]] & 7]; n0 = t0 * t0 * (g[0] * x0 + g[1] * y0); }
    var t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) { t1 *= t1; var g = _grad2[_perm[ii + i1 + _perm[jj + j1]] & 7]; n1 = t1 * t1 * (g[0] * x1 + g[1] * y1); }
    var t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) { t2 *= t2; var g = _grad2[_perm[ii + 1 + _perm[jj + 1]] & 7]; n2 = t2 * t2 * (g[0] * x2 + g[1] * y2); }
    return 70 * (n0 + n1 + n2);
  }

  // Fractional Brownian Motion — layered noise for richer textures
  // FXCore.fbm(x, y, octaves) — returns ~-1..1
  function fbm(x, y, octaves) {
    octaves = octaves || 4;
    var val = 0, amp = 0.5, freq = 1;
    for (var i = 0; i < octaves; i++) {
      val += amp * noise2D(x * freq, y * freq);
      freq *= 2; amp *= 0.5;
    }
    return val;
  }

  // ==================== PUBLIC API ====================
  window.FXCore = {
    // Scene management
    register: register,
    activate: activate,
    deactivate: deactivate,

    // Particles
    emit: emitBurst,
    spawn: spawnParticle,
    clearParticles: clearParticles,
    drawParticles: drawParticles,
    updateParticles: updateParticles,

    // Easing
    ease: ease,

    // Colour
    parseColor: parseColor,
    lerpColor: lerpColor,
    colorToStr: colorToStr,

    // Screen shake
    shake: screenShake,
    getShakeOffset: getShakeOffset,

    // Noise
    noise2D: noise2D,
    fbm: fbm,

    // State accessors (for scenes to read)
    getCanvas: function() { return canvas; },
    getCtx: function() { return ctx; },
    getSize: function() { return { w: W, h: H }; },
    isActive: function(id) { return activeId === id; }
  };

  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerModule === 'function') {
    window.ClassmatesPlatform.registerModule('platform', 'fx-core', {
      owner: 'platform',
      exports: ['FXCore']
    });
  }
})();
