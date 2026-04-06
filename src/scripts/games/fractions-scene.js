(function(){
  // ============================================================
  // FRACTIONS — "Pizza Kitchen"
  // A warm Italian kitchen. Wood-fired oven glows, flour drifts,
  // herbs hang, pizza on the cutting board. WARM, COSY, FOOD.
  // Fractions = slicing pizza into equal parts.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.8;
  var time = 0;

  var herbs = [];
  var flourDust = [];
  var steamWisps = [];
  var jars = [];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

  var W = 0, H = 0, ctx = null;

  function generateScene() {
    // Hanging herbs
    herbs = [];
    var herbPositions = [W * 0.12, W * 0.28, W * 0.72, W * 0.88, W * 0.5];
    for (var i = 0; i < herbPositions.length; i++) {
      herbs.push({
        x: herbPositions[i], y: rand(0, 8),
        length: rand(18, 35), width: rand(6, 12),
        color: pick(['#2d6a2e','#3a7a3a','#1d5a1e','#4a8a4a']),
        phase: rand(0, Math.PI * 2), swaySpeed: rand(0.5, 1)
      });
    }

    // Shelf items (jars and tomatoes)
    jars = [
      { x: W * 0.62, y: H * 0.2, type: 'jar', color: '#8b6914', w: 10, h: 16 },
      { x: W * 0.68, y: H * 0.2, type: 'jar', color: '#6b4914', w: 8, h: 14 },
      { x: W * 0.74, y: H * 0.21, type: 'tomato' },
      { x: W * 0.78, y: H * 0.21, type: 'tomato' },
      { x: W * 0.81, y: H * 0.21, type: 'tomato' }
    ];

    // Flour dust
    flourDust = [];
    for (var i = 0; i < 20; i++) {
      flourDust.push({
        x: rand(W * 0.1, W * 0.9), y: rand(H * 0.5, H * 0.85),
        size: rand(0.5, 2), speedX: rand(-0.04, 0.04),
        speedY: rand(-0.06, -0.01), opacity: rand(0.08, 0.2),
        phase: rand(0, Math.PI * 2)
      });
    }

    // Steam wisps from oven
    steamWisps = [];
    for (var i = 0; i < 5; i++) {
      steamWisps.push({
        x: W * 0.4 + rand(-15, 15), y: H * 0.3 + rand(-5, 5),
        size: rand(10, 22), drift: rand(-0.08, 0.08),
        speed: rand(0.1, 0.25), opacity: rand(0.04, 0.08),
        phase: rand(0, Math.PI * 2)
      });
    }
  }

  // ==================== DRAWING ====================

  function drawWall() {
    var b = brightness;
    var wg = ctx.createLinearGradient(0, 0, 0, H);
    wg.addColorStop(0, 'hsl(30,' + Math.round(25 + progress * 10) + '%,' + Math.round(55 * b) + '%)');
    wg.addColorStop(0.4, 'hsl(25,' + Math.round(22 + progress * 8) + '%,' + Math.round(50 * b) + '%)');
    wg.addColorStop(1, 'hsl(20,' + Math.round(20) + '%,' + Math.round(40 * b) + '%)');
    ctx.fillStyle = wg;
    ctx.fillRect(0, 0, W, H);

    // Tile pattern hint
    ctx.globalAlpha = 0.03 * b;
    ctx.strokeStyle = '#c0a080';
    ctx.lineWidth = 0.5;
    var tileSize = 25;
    for (var y = 0; y < H * 0.55; y += tileSize) {
      for (var x = 0; x < W; x += tileSize) {
        ctx.strokeRect(x, y, tileSize, tileSize);
      }
    }
    ctx.globalAlpha = 1;
  }

  // Noise wall texture — organic warm plaster/terracotta
  function drawWallNoise() {
    var t = time * 0.001;
    var noiseAlpha = (0.025 + progress * 0.02) * brightness;
    ctx.globalAlpha = noiseAlpha;
    for (var nx = 0; nx < W; nx += 16) {
      for (var ny = 0; ny < H * 0.62; ny += 16) {
        var n = FXCore.noise2D(nx * 0.006 + t * 0.03, ny * 0.006);
        var l = 42 + n * 10;
        ctx.fillStyle = 'hsl(' + Math.round(28 + n * 5) + ',25%,' + Math.round(Math.max(20, l)) + '%)';
        ctx.fillRect(nx, ny, 16, 16);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawOven() {
    var ox = W * 0.4, oy = H * 0.25;
    var ow = W * 0.2, oh = H * 0.2;
    var t = time * 0.001;
    var fireFlicker = 0.8 + Math.sin(t * 4) * 0.06 + Math.sin(t * 7) * 0.04 + progress * 0.15;

    ctx.globalAlpha = (0.55 + progress * 0.3) * brightness;
    // Oven body — brick arch
    ctx.fillStyle = '#8a5a35';
    ctx.beginPath();
    ctx.moveTo(ox - ow * 0.55, oy + oh);
    ctx.lineTo(ox - ow * 0.55, oy + oh * 0.3);
    ctx.quadraticCurveTo(ox, oy - oh * 0.2, ox + ow * 0.55, oy + oh * 0.3);
    ctx.lineTo(ox + ow * 0.55, oy + oh);
    ctx.closePath();
    ctx.fill();

    // Oven opening — dark arch
    ctx.fillStyle = '#1a0a05';
    ctx.beginPath();
    ctx.moveTo(ox - ow * 0.35, oy + oh);
    ctx.lineTo(ox - ow * 0.35, oy + oh * 0.45);
    ctx.quadraticCurveTo(ox, oy + oh * 0.05, ox + ow * 0.35, oy + oh * 0.45);
    ctx.lineTo(ox + ow * 0.35, oy + oh);
    ctx.closePath();
    ctx.fill();

    // Fire glow inside
    var fg = ctx.createRadialGradient(ox, oy + oh * 0.7, 5, ox, oy + oh * 0.6, ow * 0.35);
    fg.addColorStop(0, 'rgba(255,150,30,' + (0.5 * fireFlicker) + ')');
    fg.addColorStop(0.4, 'rgba(255,100,10,' + (0.3 * fireFlicker) + ')');
    fg.addColorStop(1, 'rgba(200,50,0,0)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(ox, oy + oh * 0.65, ow * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Small flames
    ctx.globalAlpha = fireFlicker * 0.4 * brightness;
    ctx.fillStyle = '#ff8800';
    for (var f = 0; f < 3; f++) {
      var fx = ox - 10 + f * 10 + Math.sin(t * 5 + f * 2) * 3;
      var fh = 8 + Math.sin(t * 6 + f) * 3;
      ctx.beginPath();
      ctx.moveTo(fx - 3, oy + oh * 0.85);
      ctx.quadraticCurveTo(fx + Math.sin(t * 4 + f) * 2, oy + oh * 0.85 - fh, fx + 3, oy + oh * 0.85);
      ctx.fill();
    }

    // Oven glow on surrounding area
    ctx.globalAlpha = (0.03 + progress * 0.04) * brightness * fireFlicker;
    var oGlow = ctx.createRadialGradient(ox, oy + oh * 0.5, 10, ox, oy + oh, ow);
    oGlow.addColorStop(0, 'rgba(255,150,50,0.2)');
    oGlow.addColorStop(1, 'rgba(255,100,30,0)');
    ctx.fillStyle = oGlow;
    ctx.fillRect(ox - ow, oy, ow * 2, oh * 1.5);
    ctx.globalAlpha = 1;
  }

  function drawShelf() {
    var sy = H * 0.22;
    ctx.globalAlpha = (0.4 + progress * 0.2) * brightness;
    // Shelf plank
    ctx.fillStyle = '#6a4a2a';
    ctx.fillRect(W * 0.58, sy + 14, W * 0.28, 4);
    // Bracket
    ctx.fillRect(W * 0.62, sy + 14, 3, 10);
    ctx.fillRect(W * 0.82, sy + 14, 3, 10);

    // Items on shelf
    for (var i = 0; i < jars.length; i++) {
      var j = jars[i];
      if (j.type === 'jar') {
        ctx.fillStyle = j.color;
        ctx.fillRect(j.x - j.w * 0.5, j.y - j.h, j.w, j.h);
        // Lid
        ctx.fillStyle = '#a08040';
        ctx.fillRect(j.x - j.w * 0.55, j.y - j.h - 2, j.w * 1.1, 3);
        // Label
        ctx.fillStyle = '#f0e0c0';
        ctx.fillRect(j.x - j.w * 0.3, j.y - j.h * 0.6, j.w * 0.6, j.h * 0.3);
      } else {
        // Tomato
        ctx.fillStyle = '#cc3030';
        ctx.beginPath();
        ctx.arc(j.x, j.y - 5, 5, 0, Math.PI * 2);
        ctx.fill();
        // Stem
        ctx.fillStyle = '#3a7a30';
        ctx.fillRect(j.x - 1, j.y - 11, 2, 3);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawHerbs() {
    var t = time * 0.001;
    for (var i = 0; i < herbs.length; i++) {
      var h = herbs[i];
      var sway = Math.sin(t * h.swaySpeed + h.phase) * 2;
      ctx.globalAlpha = (0.35 + progress * 0.25) * brightness;
      // String
      ctx.strokeStyle = '#8a7060';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(h.x, h.y);
      ctx.lineTo(h.x + sway * 0.5, h.y + 8);
      ctx.stroke();
      // Herb bunch
      ctx.fillStyle = h.color;
      var bx = h.x + sway, by = h.y + 8;
      ctx.beginPath();
      ctx.ellipse(bx, by + h.length * 0.5, h.width * 0.5, h.length * 0.5, sway * 0.05, 0, Math.PI * 2);
      ctx.fill();
      // Individual leaf shapes
      for (var l = 0; l < 3; l++) {
        var ly = by + h.length * (0.2 + l * 0.25);
        var lsway = sway + Math.sin(t * 0.8 + l + h.phase) * 1.5;
        ctx.beginPath();
        ctx.ellipse(bx + lsway + (l % 2 === 0 ? 3 : -3), ly, 4, 2, (l % 2 === 0 ? 0.3 : -0.3), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawCountertop() {
    var cy = H * 0.62;
    ctx.globalAlpha = brightness;
    // Counter surface
    var cg = ctx.createLinearGradient(0, cy - 4, 0, cy + 6);
    cg.addColorStop(0, '#a08060');
    cg.addColorStop(0.5, '#907050');
    cg.addColorStop(1, '#806040');
    ctx.fillStyle = cg;
    ctx.fillRect(0, cy, W, 10);
    // Front edge
    ctx.fillStyle = '#b09070';
    ctx.fillRect(0, cy, W, 2);
    // Below counter — darker
    ctx.fillStyle = 'hsl(20,15%,' + Math.round(25 * brightness) + '%)';
    ctx.fillRect(0, cy + 10, W, H - cy - 10);
    ctx.globalAlpha = 1;
  }

  function drawCheckedCloth() {
    var cx = W * 0.75, cy = H * 0.62;
    ctx.globalAlpha = (0.25 + progress * 0.15) * brightness;
    // Cloth shape — draped
    ctx.fillStyle = '#cc2020';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.quadraticCurveTo(cx + 15, cy - 3, cx + 35, cy);
    ctx.lineTo(cx + 40, cy + 25);
    ctx.quadraticCurveTo(cx + 20, cy + 28, cx - 5, cy + 22);
    ctx.closePath();
    ctx.fill();
    // White checks
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.2 * brightness;
    for (var r = 0; r < 3; r++) {
      for (var c = 0; c < 4; c++) {
        if ((r + c) % 2 === 0) {
          ctx.fillRect(cx + c * 8 + 2, cy + r * 7 + 2, 6, 5);
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawCuttingBoard() {
    var bx = W * 0.45, by = H * 0.67;
    ctx.globalAlpha = (0.4 + progress * 0.3) * brightness;
    // Board
    ctx.fillStyle = '#b89060';
    ctx.beginPath();
    ctx.ellipse(bx, by + 5, 30, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    // Board edge
    ctx.strokeStyle = '#907040';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(bx, by + 5, 30, 22, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Pizza on board — circle with slice lines
    ctx.fillStyle = '#e8a830';
    ctx.beginPath();
    ctx.arc(bx, by + 3, 18, 0, Math.PI * 2);
    ctx.fill();
    // Tomato sauce
    ctx.fillStyle = '#cc4020';
    ctx.beginPath();
    ctx.arc(bx, by + 3, 16, 0, Math.PI * 2);
    ctx.fill();
    // Cheese
    ctx.fillStyle = '#f0c860';
    ctx.beginPath();
    ctx.arc(bx, by + 3, 14, 0, Math.PI * 2);
    ctx.fill();
    // Slice lines
    ctx.strokeStyle = '#c44020';
    ctx.lineWidth = 1;
    var slices = 4 + Math.floor(progress * 4); // more slices with progress
    for (var s = 0; s < slices; s++) {
      var angle = (s / slices) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(bx, by + 3);
      ctx.lineTo(bx + Math.cos(angle) * 15, by + 3 + Math.sin(angle) * 15);
      ctx.stroke();
    }
    // Toppings
    ctx.fillStyle = '#208020';
    for (var i = 0; i < 6; i++) {
      var ta = rand(0, Math.PI * 2), td = rand(4, 12);
      ctx.beginPath();
      ctx.arc(bx + Math.cos(ta) * td, by + 3 + Math.sin(ta) * td, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawSteam() {
    var t = time * 0.001;
    for (var i = 0; i < steamWisps.length; i++) {
      var s = steamWisps[i];
      var sx = s.x + Math.sin(t * 0.5 + s.phase) * 10 + s.drift * t * 8;
      var sy = s.y + s.speed * t * -12 + Math.cos(t * 0.3 + s.phase) * 4;
      if (sy < H * 0.05) sy += H * 0.3;
      ctx.globalAlpha = s.opacity * (0.4 + progress * 0.5) * brightness;
      ctx.fillStyle = 'rgba(230,220,210,0.3)';
      ctx.beginPath();
      ctx.arc(sx, sy, s.size * (0.6 + progress * 0.4), 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + s.size * 0.3, sy - s.size * 0.2, s.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawFlour() {
    var t = time * 0.001;
    for (var i = 0; i < flourDust.length; i++) {
      var f = flourDust[i];
      var nDrift = FXCore.noise2D(f.x * 0.008 + t * 0.2, f.y * 0.008 + i * 6) * 0.25;
      f.x += f.speedX + Math.sin(t * 0.3 + f.phase) * 0.03 + nDrift;
      f.y += f.speedY + nDrift * 0.15;
      if (f.y < H * 0.45) { f.y = H * 0.85; f.x = rand(W * 0.1, W * 0.9); }
      if (f.x < W * 0.05) f.x = W * 0.95;
      if (f.x > W * 0.95) f.x = W * 0.05;
      ctx.globalAlpha = f.opacity * (0.5 + progress * 0.4) * brightness;
      ctx.fillStyle = '#fff8f0';
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Screen-blend oven fire glow — warm bloom across kitchen
  function drawKitchenGlow() {
    var t = time * 0.001;
    var fireFlicker = 0.8 + Math.sin(t * 4) * 0.06 + Math.sin(t * 7) * 0.04 + progress * 0.15;
    ctx.globalCompositeOperation = 'screen';

    // Oven fire bloom — large warm glow
    var ox = W * 0.4, oy = H * 0.35;
    var glowR = W * (0.2 + progress * 0.1);
    ctx.globalAlpha = (0.05 + progress * 0.05) * brightness * fireFlicker;
    var fg = ctx.createRadialGradient(ox, oy, 0, ox, oy, glowR);
    fg.addColorStop(0, 'rgba(255,150,50,0.2)');
    fg.addColorStop(0.3, 'rgba(255,120,30,0.08)');
    fg.addColorStop(1, 'rgba(255,100,20,0)');
    ctx.fillStyle = fg;
    ctx.fillRect(ox - glowR, oy - glowR, glowR * 2, glowR * 2);

    // Warm ambient on countertop
    ctx.globalAlpha = (0.03 + progress * 0.03) * brightness;
    var cGlow = ctx.createRadialGradient(W * 0.5, H * 0.65, 0, W * 0.5, H * 0.65, W * 0.4);
    cGlow.addColorStop(0, 'rgba(255,200,120,0.1)');
    cGlow.addColorStop(1, 'rgba(255,200,120,0)');
    ctx.fillStyle = cGlow;
    ctx.fillRect(0, H * 0.45, W, H * 0.4);

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  // ==================== SCENE INTERFACE ====================
  var scene = {
    enter: function(canvas, context, w, h) {
      ctx = context; W = w; H = h;
      progress = 0; targetProgress = 0; brightness = 0.8;
      generateScene();
    },
    resize: function(w, h) { W = w; H = h; generateScene(); },
    update: function(dt, t) {
      time = t;
      progress += (targetProgress - progress) * 0.03;
      brightness += ((0.8 + progress * 0.2) - brightness) * 0.02;
    },
    draw: function() {
      drawWall();
      drawWallNoise();
      drawOven();
      drawShelf();
      drawHerbs();
      drawCountertop();
      drawCheckedCloth();
      drawCuttingBoard();
      drawSteam();
      drawFlour();
      drawKitchenGlow();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('fractions', scene);

  window.ClassmatesFractionsScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('fractions')) return;
      var s = FXCore.getSize();
      var count = 8 + Math.floor(progress * 8);
      FXCore.emit(s.w * 0.5, s.h * 0.5, 10, {
        spread: 5, rise: 2, decay: 0.02, size: 3,
        color: 'rgba(240,200,80,0.8)', shape: 'circle', endColor: 'rgba(255,230,150,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.5, 5, {
        spread: 3, rise: 1.5, decay: 0.025, size: 2,
        color: 'rgba(200,60,30,0.6)'
      });
      // Warm oven-glow burst
      FXCore.emit(s.w * 0.5, s.h * 0.48, count, {
        spread: 6, rise: 1.8, decay: 0.018, size: 3,
        color: 'rgba(255,150,30,0.7)', endColor: 'rgba(255,200,80,0)'
      });
      // Tiny flour sparkles
      FXCore.emit(s.w * 0.5, s.h * 0.52, 4, {
        spread: 2, rise: 2.5, decay: 0.03, size: 1.5,
        color: 'rgba(255,248,240,0.9)', shape: 'star'
      });
      if (window.FXSound) FXSound.play('click');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('fractions')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.55, 4, {
        spread: 2, rise: -0.1, gravity: 0.02, decay: 0.015, size: 2,
        color: 'rgba(120,80,50,0.4)'
      });
      // Darker burnt crust burst
      FXCore.emit(s.w * 0.5, s.h * 0.57, 3, {
        spread: 1.5, rise: -0.3, gravity: 0.03, decay: 0.02, size: 2.5,
        color: 'rgba(80,40,20,0.5)'
      });
      if(FXCore.shake) FXCore.shake(3, 150);
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('fractions')) return;
      var s = FXCore.getSize();
      var colors = ['rgba(240,200,80,0.7)','rgba(200,60,30,0.6)','rgba(240,200,100,0.6)','rgba(50,130,50,0.6)','rgba(255,150,30,0.7)'];
      for (var i = 0; i < colors.length; i++) {
        FXCore.emit(s.w * (0.2 + i * 0.15), s.h * 0.4, 5, {
          spread: 6, rise: 2.5, decay: 0.012, size: 3.5, color: colors[i], shape: 'circle'
        });
      }
      // Kitchen themed bursts across the scene
      var kitchenColors = ['rgba(255,150,30,0.7)','rgba(240,200,80,0.7)','rgba(200,60,30,0.65)','rgba(50,130,50,0.6)','rgba(255,180,60,0.7)','rgba(230,180,70,0.65)','rgba(180,50,20,0.6)'];
      for (var j = 0; j < 7; j++) {
        FXCore.emit(s.w * (0.1 + j * 0.115), s.h * (0.25 + (j % 3) * 0.08), 5, {
          spread: 5, rise: 2.5, decay: 0.01, size: 4,
          color: kitchenColors[j], shape: j % 2 === 0 ? 'circle' : 'star'
        });
      }
      // Central golden star burst
      FXCore.emit(s.w * 0.5, s.h * 0.4, 15, {
        spread: 8, rise: 3, decay: 0.008, size: 5,
        color: 'rgba(255,215,0,0.8)', shape: 'star'
      });
      if (window.FXSound) FXSound.playSequence(['correct','streak','complete'], 100);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
