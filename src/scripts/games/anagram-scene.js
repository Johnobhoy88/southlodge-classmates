(function(){
  // ============================================================
  // ANAGRAM — "Toymaker's Workshop"
  // A warm cosy workshop with wooden blocks, turning brass gears,
  // drifting sawdust, and a glowing pendant lamp.
  // First scene built on FXCore shared modules.
  // For the kids of South Lodge Primary, Invergordon
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.75;
  var time = 0;

  // Scene elements
  var gears = [];
  var shelves = [];
  var shelfBlocks = [];
  var sawdust = [];
  var benchBlocks = [];
  var woodKnots = [];
  var lampPulse = 0;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

  var W = 0, H = 0, ctx = null;

  // ==================== SCENE GENERATION ====================
  function generateScene() {
    // Gears — brass/copper interlocking cogs
    gears = [
      { x: W * 0.12, y: H * 0.25, r: 35, teeth: 12, speed: 0.3, color: '#b87333', dir: 1 },
      { x: W * 0.12 + 52, y: H * 0.25 + 20, r: 22, teeth: 8, speed: -0.5, color: '#cd7f32', dir: -1 },
      { x: W * 0.88, y: H * 0.3, r: 40, teeth: 14, speed: 0.25, color: '#c9834a', dir: 1 },
      { x: W * 0.88 - 30, y: H * 0.3 - 40, r: 18, teeth: 8, speed: -0.6, color: '#daa06d', dir: -1, minProgress: 0.3 }
    ];

    // Shelves with letter blocks
    shelves = [
      { x: W * 0.05, y: H * 0.42, w: W * 0.2, h: 4 },
      { x: W * 0.75, y: H * 0.38, w: W * 0.2, h: 4 },
      { x: W * 0.1, y: H * 0.58, w: W * 0.15, h: 4 }
    ];

    shelfBlocks = [];
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var s = 0; s < shelves.length; s++) {
      var sh = shelves[s];
      var count = Math.floor(rand(3, 6));
      for (var b = 0; b < count; b++) {
        shelfBlocks.push({
          x: sh.x + 8 + b * 16 + rand(-2, 2),
          y: sh.y - 14 + rand(-1, 1),
          size: rand(10, 14),
          letter: letters[Math.floor(rand(0, 26))],
          tilt: rand(-0.15, 0.15),
          color: pick(['#d4a574','#c4956a','#e8c49a','#b8865a'])
        });
      }
    }

    // Bench blocks — decorative
    benchBlocks = [];
    for (var i = 0; i < 5; i++) {
      benchBlocks.push({
        x: rand(W * 0.15, W * 0.85),
        y: H * 0.72 + rand(-4, 4),
        size: rand(8, 12),
        letter: letters[Math.floor(rand(0, 26))],
        tilt: rand(-0.2, 0.2),
        color: pick(['#d4a574','#c4956a','#e8c49a'])
      });
    }

    // Sawdust particles
    sawdust = [];
    for (var i = 0; i < 30; i++) {
      sawdust.push({
        x: rand(0, W), y: rand(0, H * 0.8),
        size: rand(0.5, 2),
        speedX: rand(-0.08, 0.08),
        speedY: rand(-0.04, 0.04),
        opacity: rand(0.05, 0.15),
        phase: rand(0, Math.PI * 2)
      });
    }

    // Wood knots on wall
    woodKnots = [];
    for (var i = 0; i < 6; i++) {
      woodKnots.push({
        x: rand(W * 0.2, W * 0.8),
        y: rand(H * 0.1, H * 0.6),
        r: rand(4, 10)
      });
    }
  }

  // ==================== DRAWING LAYERS ====================

  // Layer 1: Workshop gradient + wooden wall
  function drawWalls() {
    var b = brightness;
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'hsl(25,' + Math.round(35 + progress * 10) + '%,' + Math.round(18 * b) + '%)');
    grad.addColorStop(0.3, 'hsl(30,' + Math.round(30 + progress * 10) + '%,' + Math.round(22 * b) + '%)');
    grad.addColorStop(0.65, 'hsl(20,' + Math.round(25 + progress * 8) + '%,' + Math.round(16 * b) + '%)');
    grad.addColorStop(1, 'hsl(15,' + Math.round(30) + '%,' + Math.round(12 * b) + '%)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Wood plank lines
    ctx.strokeStyle = 'rgba(80,50,30,' + (0.06 * b) + ')';
    ctx.lineWidth = 1;
    var plankH = 28;
    for (var y = plankH; y < H * 0.7; y += plankH) {
      ctx.beginPath();
      ctx.moveTo(0, y + Math.sin(y * 0.1) * 2);
      ctx.lineTo(W, y + Math.sin(y * 0.1 + 1) * 2);
      ctx.stroke();
    }

    // Wood knots
    for (var i = 0; i < woodKnots.length; i++) {
      var k = woodKnots[i];
      ctx.globalAlpha = 0.06 * b;
      ctx.fillStyle = '#3a2515';
      ctx.beginPath();
      ctx.ellipse(k.x, k.y, k.r, k.r * 0.7, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Ring
      ctx.strokeStyle = 'rgba(60,35,20,0.04)';
      ctx.beginPath();
      ctx.ellipse(k.x, k.y, k.r * 1.5, k.r * 1.2, 0.2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Layer 2: Warm lamp glow
  function drawLamp() {
    var t = time * 0.001;
    lampPulse = 0.85 + Math.sin(t * 0.8) * 0.1 + progress * 0.15;
    var lx = W * 0.5, ly = H * 0.08;

    // Lamp cord
    ctx.strokeStyle = 'rgba(40,25,15,' + (0.3 * brightness) + ')';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx, ly);
    ctx.stroke();

    // Lamp shade (trapezoid)
    ctx.fillStyle = 'rgba(80,50,30,' + (0.4 * brightness) + ')';
    ctx.beginPath();
    ctx.moveTo(lx - 12, ly);
    ctx.lineTo(lx + 12, ly);
    ctx.lineTo(lx + 20, ly + 10);
    ctx.lineTo(lx - 20, ly + 10);
    ctx.closePath();
    ctx.fill();

    // Light cone
    var lightAlpha = 0.06 * lampPulse * brightness;
    var lg = ctx.createRadialGradient(lx, ly + 15, 5, lx, H * 0.45, W * 0.4);
    lg.addColorStop(0, 'rgba(255,220,150,' + lightAlpha * 3 + ')');
    lg.addColorStop(0.3, 'rgba(255,200,120,' + lightAlpha * 1.5 + ')');
    lg.addColorStop(0.7, 'rgba(255,180,100,' + lightAlpha * 0.5 + ')');
    lg.addColorStop(1, 'rgba(255,160,80,0)');
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, W, H);

    // Bulb glow
    ctx.globalAlpha = lampPulse * 0.5 * brightness;
    ctx.fillStyle = '#fff5e0';
    ctx.beginPath();
    ctx.arc(lx, ly + 14, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Layer 3: Gears
  function drawGears() {
    var t = time * 0.001;
    for (var i = 0; i < gears.length; i++) {
      var g = gears[i];
      if (g.minProgress && progress < g.minProgress) continue;
      var rotation = t * g.speed * g.dir * (0.3 + progress * 0.7);

      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(rotation);
      ctx.globalAlpha = (0.2 + progress * 0.3) * brightness;

      // Gear body
      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.arc(0, 0, g.r * 0.75, 0, Math.PI * 2);
      ctx.fill();

      // Teeth
      for (var t2 = 0; t2 < g.teeth; t2++) {
        var angle = (t2 / g.teeth) * Math.PI * 2;
        var cos = Math.cos(angle), sin = Math.sin(angle);
        var inner = g.r * 0.7, outer = g.r;
        var halfTooth = Math.PI / g.teeth * 0.6;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle - halfTooth) * inner, Math.sin(angle - halfTooth) * inner);
        ctx.lineTo(Math.cos(angle - halfTooth * 0.6) * outer, Math.sin(angle - halfTooth * 0.6) * outer);
        ctx.lineTo(Math.cos(angle + halfTooth * 0.6) * outer, Math.sin(angle + halfTooth * 0.6) * outer);
        ctx.lineTo(Math.cos(angle + halfTooth) * inner, Math.sin(angle + halfTooth) * inner);
        ctx.fill();
      }

      // Centre hole
      ctx.fillStyle = 'rgba(30,20,10,' + (0.3 * brightness) + ')';
      ctx.beginPath();
      ctx.arc(0, 0, g.r * 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Highlight
      ctx.globalAlpha = 0.08 * brightness;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-g.r * 0.2, -g.r * 0.2, g.r * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // Layer 4: Shelves
  function drawShelves() {
    // Shelf planks
    for (var i = 0; i < shelves.length; i++) {
      var s = shelves[i];
      ctx.globalAlpha = 0.4 * brightness;
      ctx.fillStyle = '#5a3a20';
      ctx.fillRect(s.x, s.y, s.w, s.h);
      // Shadow under shelf
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#000';
      ctx.fillRect(s.x, s.y + s.h, s.w, 6);
      // Bracket
      ctx.globalAlpha = 0.25 * brightness;
      ctx.fillStyle = '#4a2a10';
      ctx.fillRect(s.x + 10, s.y, 3, 15);
      ctx.fillRect(s.x + s.w - 13, s.y, 3, 15);
    }

    // Blocks on shelves
    for (var i = 0; i < shelfBlocks.length; i++) {
      drawWoodBlock(shelfBlocks[i]);
    }
    ctx.globalAlpha = 1;
  }

  // Layer 5: Workbench
  function drawBench() {
    var benchY = H * 0.73;
    // Bench top
    var bg = ctx.createLinearGradient(0, benchY - 6, 0, benchY + 8);
    bg.addColorStop(0, 'hsl(25,35%,' + Math.round(20 * brightness) + '%)');
    bg.addColorStop(0.5, 'hsl(20,30%,' + Math.round(16 * brightness) + '%)');
    bg.addColorStop(1, 'hsl(15,25%,' + Math.round(12 * brightness) + '%)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, benchY, W, 12);

    // Bench edge highlight
    ctx.globalAlpha = 0.1 * brightness;
    ctx.fillStyle = '#c4956a';
    ctx.fillRect(0, benchY, W, 2);

    // Bench legs
    ctx.globalAlpha = 0.3 * brightness;
    ctx.fillStyle = '#3a2515';
    ctx.fillRect(W * 0.1, benchY + 12, 8, H - benchY - 12);
    ctx.fillRect(W * 0.9 - 8, benchY + 12, 8, H - benchY - 12);
    ctx.globalAlpha = 1;

    // Blocks on bench
    for (var i = 0; i < benchBlocks.length; i++) {
      drawWoodBlock(benchBlocks[i]);
    }
  }

  // Helper: draw a wooden letter block
  function drawWoodBlock(blk) {
    ctx.save();
    ctx.translate(blk.x, blk.y);
    ctx.rotate(blk.tilt);
    ctx.globalAlpha = (0.35 + progress * 0.25) * brightness;

    // Block body
    ctx.fillStyle = blk.color;
    ctx.fillRect(-blk.size / 2, -blk.size / 2, blk.size, blk.size);

    // Dark edge (right + bottom)
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(blk.size / 2 - 2, -blk.size / 2, 2, blk.size);
    ctx.fillRect(-blk.size / 2, blk.size / 2 - 2, blk.size, 2);

    // Letter
    ctx.globalAlpha = (0.3 + progress * 0.2) * brightness;
    ctx.fillStyle = '#4a2a10';
    ctx.font = 'bold ' + (blk.size * 0.65) + 'px "Fredoka One",cursive';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(blk.letter, 0, 1);

    ctx.restore();
  }

  // Layer 6: Sawdust
  function drawSawdust() {
    var t = time * 0.001;
    for (var i = 0; i < sawdust.length; i++) {
      var s = sawdust[i];
      // Drift in gentle loops with noise-based organic movement
      var nDrift = FXCore.noise2D(s.x * 0.006 + t * 0.2, s.y * 0.006 + i * 7) * 0.3;
      s.x += s.speedX + Math.sin(t * 0.5 + s.phase) * 0.1 + nDrift * 0.4;
      s.y += s.speedY + Math.cos(t * 0.3 + s.phase) * 0.05 + nDrift * 0.2;
      if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H * 0.75; if (s.y > H * 0.75) s.y = 0;

      // Brighter in lamplight zone
      var distFromCentre = Math.abs(s.x - W * 0.5) / W;
      var lampBoost = Math.max(0, 1 - distFromCentre * 2.5);
      var alpha = s.opacity * (0.5 + progress * 0.6) * brightness * (1 + lampBoost * lampPulse);

      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#dbb580';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ==================== NOISE / GLOW / DRIFT ====================

  function drawWorkshopNoise() {
    var t = time * 0.001;
    var noiseAlpha = (0.025 + progress * 0.02) * brightness;
    ctx.globalAlpha = noiseAlpha;
    for (var nx = 0; nx < W; nx += 16) {
      for (var ny = 0; ny < Math.floor(H * 0.55); ny += 16) {
        var n = FXCore.noise2D(nx * 0.005 + t * 0.03, ny * 0.005);
        var l = 18 + n * 8;
        ctx.fillStyle = 'hsl(25,30%,' + Math.round(Math.max(10, l)) + '%)';
        ctx.fillRect(nx, ny, 16, 16);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawLampGlow() {
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = (0.04 + progress * 0.04) * brightness;
    var lg = ctx.createRadialGradient(W * 0.5, H * 0.12, 0, W * 0.5, H * 0.12, W * 0.35);
    lg.addColorStop(0, 'rgba(255,200,120,0.15)');
    lg.addColorStop(0.4, 'rgba(255,180,100,0.05)');
    lg.addColorStop(1, 'rgba(255,160,80,0)');
    ctx.fillStyle = lg;
    ctx.fillRect(W * 0.15, 0, W * 0.7, H * 0.5);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  // ==================== SCENE INTERFACE (for FXCore) ====================
  var scene = {
    enter: function(canvas, context, w, h) {
      ctx = context; W = w; H = h;
      progress = 0; targetProgress = 0; brightness = 0.75;
      generateScene();
    },

    resize: function(w, h) {
      W = w; H = h;
      generateScene();
    },

    update: function(dt, t) {
      time = t;
      progress += (targetProgress - progress) * 0.03;
      var targetBright = 0.75 + progress * 0.25;
      brightness += (targetBright - brightness) * 0.02;
    },

    draw: function(context, w, h, t) {
      drawWalls();
      drawWorkshopNoise();
      drawLamp();
      drawGears();
      drawShelves();
      drawBench();
      drawSawdust();
      drawLampGlow();
    },

    exit: function() {}
  };

  // Register with FXCore
  if (window.FXCore) {
    FXCore.register('anagram', scene);
  }

  // ==================== PUBLIC API (for game hooks) ====================
  window.ClassmatesAnagramScene = {
    onCorrect: function(noteIndex) {
      if (!window.FXCore || !FXCore.isActive('anagram')) return;
      var s = FXCore.getSize();
      // Wooden block burst — warm browns + gold
      FXCore.emit(s.w * 0.5, s.h * 0.4, 10, {
        spread: 5, rise: 2, decay: 0.02, size: 3.5,
        color: 'rgba(212,165,116,0.9)', shape: 'diamond', endColor: 'rgba(255,220,150,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.4, 6, {
        spread: 3, rise: 1.5, decay: 0.025, size: 2.5,
        color: 'rgba(255,200,100,0.7)', shape: 'star'
      });
      if (window.FXSound) FXSound.play('correct');
    },

    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('anagram')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.45, 5, {
        spread: 2.5, rise: -0.2, gravity: 0.03, decay: 0.015, size: 2,
        color: 'rgba(100,65,35,0.4)'
      });
      if (window.FXSound) FXSound.play('wrongGentle');
    },

    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('anagram')) return;
      var s = FXCore.getSize();
      var colors = ['rgba(212,165,116,0.8)','rgba(184,115,51,0.7)','rgba(255,220,150,0.7)','rgba(200,160,100,0.7)','rgba(218,160,109,0.7)'];
      for (var i = 0; i < colors.length; i++) {
        FXCore.emit(s.w * (0.15 + i * 0.175), s.h * 0.35, 5, {
          spread: 7, rise: 3, decay: 0.012, size: 4,
          color: colors[i], shape: 'star'
        });
      }
      if (window.FXSound) FXSound.playSequence(['correct','streak','complete'], 120);
    },

    setProgress: function(pct) {
      targetProgress = Math.max(0, Math.min(1, pct || 0));
    }
  };
})();
