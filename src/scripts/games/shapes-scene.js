(function(){
  // ============================================================
  // SHAPES — "Stained Glass"
  // Cathedral interior with a rose window made of geometric shapes.
  // Triangles, circles, diamonds, hexagons in jewel colours.
  // Light streams through, colour pools on stone floor.
  // GEOMETRIC, SACRED, BEAUTIFUL — shapes ARE the scene.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.75;
  var time = 0;

  var windowPanels = [];
  var lightBeams = [];
  var dustMotes = [];
  var candles = [];
  var floorStones = [];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

  var W = 0, H = 0, ctx = null;

  var JEWEL_COLORS = [
    { fill: 'rgba(180,30,50,', name: 'ruby' },
    { fill: 'rgba(30,80,180,', name: 'sapphire' },
    { fill: 'rgba(30,150,60,', name: 'emerald' },
    { fill: 'rgba(200,160,30,', name: 'gold' },
    { fill: 'rgba(120,50,160,', name: 'amethyst' }
  ];

  function generateScene() {
    // Rose window panels — geometric shapes arranged in a circle
    windowPanels = [];
    var cx = W * 0.5, cy = H * 0.3;
    var outerR = Math.min(W, H) * 0.28;

    // Centre circle
    windowPanels.push({ type: 'circle', x: cx, y: cy, r: outerR * 0.15, color: JEWEL_COLORS[3] });

    // Inner ring — 6 triangles
    for (var i = 0; i < 6; i++) {
      var angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
      windowPanels.push({
        type: 'triangle', x: cx + Math.cos(angle) * outerR * 0.3, y: cy + Math.sin(angle) * outerR * 0.3,
        r: outerR * 0.12, angle: angle, color: JEWEL_COLORS[i % JEWEL_COLORS.length]
      });
    }

    // Middle ring — 8 diamonds
    for (var i = 0; i < 8; i++) {
      var angle = (i / 8) * Math.PI * 2;
      windowPanels.push({
        type: 'diamond', x: cx + Math.cos(angle) * outerR * 0.55, y: cy + Math.sin(angle) * outerR * 0.55,
        r: outerR * 0.1, angle: angle, color: JEWEL_COLORS[(i + 2) % JEWEL_COLORS.length]
      });
    }

    // Outer ring — 12 mixed shapes
    for (var i = 0; i < 12; i++) {
      var angle = (i / 12) * Math.PI * 2;
      var shapeType = i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'hexagon' : 'triangle';
      windowPanels.push({
        type: shapeType, x: cx + Math.cos(angle) * outerR * 0.82, y: cy + Math.sin(angle) * outerR * 0.82,
        r: outerR * 0.08, angle: angle, color: JEWEL_COLORS[i % JEWEL_COLORS.length],
        minProgress: i > 8 ? 0.4 : 0
      });
    }

    // Light beams from window to floor
    lightBeams = [];
    for (var i = 0; i < 5; i++) {
      var angle = (i / 5) * Math.PI * 0.6 + 0.3;
      lightBeams.push({
        startX: cx + (i - 2) * outerR * 0.3, startY: cy + outerR * 0.5,
        endX: cx + (i - 2) * outerR * 0.5 + W * 0.05, endY: H * 0.85,
        width: 20 + i * 5, color: JEWEL_COLORS[i % JEWEL_COLORS.length]
      });
    }

    // Dust motes
    dustMotes = [];
    for (var i = 0; i < 25; i++) {
      dustMotes.push({
        x: rand(W * 0.2, W * 0.8), y: rand(H * 0.15, H * 0.8),
        size: rand(0.5, 2), speedX: rand(-0.03, 0.03),
        speedY: rand(-0.02, 0.02), opacity: rand(0.1, 0.3),
        phase: rand(0, Math.PI * 2)
      });
    }

    // Altar candles
    candles = [];
    for (var i = 0; i < 4; i++) {
      candles.push({
        x: W * (0.35 + i * 0.1), y: H * 0.82,
        height: rand(12, 20), phase: rand(0, Math.PI * 2)
      });
    }

    // Floor stones
    floorStones = [];
    for (var y = H * 0.75; y < H; y += 18) {
      var offset = (Math.floor((y - H * 0.75) / 18) % 2) * 15;
      for (var x = offset; x < W; x += 30) {
        floorStones.push({ x: x, y: y, w: 28, h: 16 });
      }
    }
  }

  // ==================== DRAWING ====================

  function drawStoneWalls() {
    var b = brightness;
    ctx.fillStyle = 'hsl(220,' + Math.round(8 + progress * 5) + '%,' + Math.round(12 * b) + '%)';
    ctx.fillRect(0, 0, W, H);

    // Stone block texture
    ctx.globalAlpha = 0.03 * b;
    ctx.strokeStyle = '#3a3a48';
    ctx.lineWidth = 0.5;
    for (var y = 0; y < H * 0.75; y += 20) {
      var off = (Math.floor(y / 20) % 2) * 20;
      for (var x = off; x < W; x += 40) {
        ctx.strokeRect(x, y, 40, 20);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawPillars() {
    ctx.globalAlpha = (0.3 + progress * 0.15) * brightness;
    var pillarColor = 'hsl(220,6%,' + Math.round(18 * brightness) + '%)';
    // Left pillar
    ctx.fillStyle = pillarColor;
    ctx.fillRect(W * 0.08, 0, 16, H * 0.78);
    ctx.fillStyle = 'hsl(220,5%,' + Math.round(22 * brightness) + '%)';
    ctx.fillRect(W * 0.08 + 2, 0, 3, H * 0.78);
    // Right pillar
    ctx.fillStyle = pillarColor;
    ctx.fillRect(W * 0.9, 0, 16, H * 0.78);
    ctx.fillStyle = 'hsl(220,5%,' + Math.round(22 * brightness) + '%)';
    ctx.fillRect(W * 0.9 + 2, 0, 3, H * 0.78);
    ctx.globalAlpha = 1;
  }

  function drawWindow() {
    var cx = W * 0.5, cy = H * 0.3;
    var outerR = Math.min(W, H) * 0.28;

    // Window frame — dark stone arch
    ctx.globalAlpha = (0.4 + progress * 0.2) * brightness;
    ctx.strokeStyle = '#2a2a38';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, outerR + 5, 0, Math.PI * 2);
    ctx.stroke();

    // Window background — dark
    ctx.fillStyle = '#0a0a15';
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.fill();

    // Leading (dark lines between panels)
    ctx.strokeStyle = '#1a1a28';
    ctx.lineWidth = 2;
    // Radial lines
    for (var i = 0; i < 12; i++) {
      var angle = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
      ctx.stroke();
    }
    // Concentric rings
    ctx.beginPath(); ctx.arc(cx, cy, outerR * 0.35, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, outerR * 0.65, 0, Math.PI * 2); ctx.stroke();

    // Glass panels
    for (var i = 0; i < windowPanels.length; i++) {
      var p = windowPanels[i];
      if (p.minProgress && progress < p.minProgress) continue;
      var glowInt = (0.3 + progress * 0.5) * brightness;
      ctx.globalAlpha = glowInt;
      ctx.fillStyle = p.color.fill + '0.7)';

      if (p.type === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'triangle') {
        ctx.beginPath();
        for (var v = 0; v < 3; v++) {
          var a = p.angle + (v / 3) * Math.PI * 2;
          var vx = p.x + Math.cos(a) * p.r;
          var vy = p.y + Math.sin(a) * p.r;
          if (v === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
        }
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'diamond') {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - p.r);
        ctx.lineTo(p.x + p.r * 0.6, p.y);
        ctx.lineTo(p.x, p.y + p.r);
        ctx.lineTo(p.x - p.r * 0.6, p.y);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'hexagon') {
        ctx.beginPath();
        for (var v = 0; v < 6; v++) {
          var a = (v / 6) * Math.PI * 2 - Math.PI / 6;
          var vx = p.x + Math.cos(a) * p.r;
          var vy = p.y + Math.sin(a) * p.r;
          if (v === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);
        }
        ctx.closePath();
        ctx.fill();
      }

      // Inner highlight
      ctx.globalAlpha = glowInt * 0.3;
      ctx.fillStyle = '#fff';
      if (p.type === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x - p.r * 0.2, p.y - p.r * 0.2, p.r * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawLightBeams() {
    for (var i = 0; i < lightBeams.length; i++) {
      var l = lightBeams[i];
      var beamAlpha = (0.03 + progress * 0.06) * brightness;
      ctx.globalAlpha = beamAlpha;
      var bg = ctx.createLinearGradient(l.startX, l.startY, l.endX, l.endY);
      bg.addColorStop(0, l.color.fill + '0.2)');
      bg.addColorStop(0.5, l.color.fill + '0.08)');
      bg.addColorStop(1, l.color.fill + '0)');
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.moveTo(l.startX - l.width * 0.3, l.startY);
      ctx.lineTo(l.startX + l.width * 0.3, l.startY);
      ctx.lineTo(l.endX + l.width, l.endY);
      ctx.lineTo(l.endX - l.width * 0.5, l.endY);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawFloor() {
    var fy = H * 0.75;
    ctx.globalAlpha = brightness;
    ctx.fillStyle = 'hsl(220,5%,' + Math.round(16 * brightness) + '%)';
    ctx.fillRect(0, fy, W, H - fy);

    // Flagstones
    ctx.globalAlpha = 0.04 * brightness;
    ctx.strokeStyle = '#3a3a45';
    ctx.lineWidth = 0.5;
    for (var i = 0; i < floorStones.length; i++) {
      var s = floorStones[i];
      ctx.strokeRect(s.x, s.y, s.w, s.h);
    }

    // Colour pools from light beams
    for (var i = 0; i < lightBeams.length; i++) {
      var l = lightBeams[i];
      ctx.globalAlpha = (0.05 + progress * 0.1) * brightness;
      var pg = ctx.createRadialGradient(l.endX, H * 0.85, 5, l.endX, H * 0.85, 30);
      pg.addColorStop(0, l.color.fill + '0.2)');
      pg.addColorStop(1, l.color.fill + '0)');
      ctx.fillStyle = pg;
      ctx.beginPath();
      ctx.ellipse(l.endX, H * 0.85, 30, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawCandles() {
    var t = time * 0.001;
    for (var i = 0; i < candles.length; i++) {
      var c = candles[i];
      var flicker = 0.7 + Math.sin(t * 5 + c.phase) * 0.1 + Math.sin(t * 8 + c.phase) * 0.05;
      ctx.globalAlpha = (0.35 + progress * 0.3) * brightness;
      // Candle body
      ctx.fillStyle = '#f0e8d0';
      ctx.fillRect(c.x - 2, c.y, 4, c.height);
      // Flame
      ctx.fillStyle = '#ffaa30';
      ctx.globalAlpha = flicker * 0.6 * brightness;
      var fh = 5 + Math.sin(t * 6 + c.phase) * 1.5;
      ctx.beginPath();
      ctx.moveTo(c.x - 2, c.y);
      ctx.quadraticCurveTo(c.x + Math.sin(t * 4 + c.phase), c.y - fh, c.x + 2, c.y);
      ctx.fill();
      // Inner flame
      ctx.fillStyle = '#ffdd60';
      ctx.beginPath();
      ctx.moveTo(c.x - 1, c.y);
      ctx.quadraticCurveTo(c.x, c.y - fh * 0.6, c.x + 1, c.y);
      ctx.fill();
      // Warm glow
      ctx.globalAlpha = flicker * 0.04 * brightness;
      var cg = ctx.createRadialGradient(c.x, c.y - 2, 1, c.x, c.y, 20);
      cg.addColorStop(0, 'rgba(255,180,80,0.3)');
      cg.addColorStop(1, 'rgba(255,150,50,0)');
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(c.x, c.y, 20, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawDustMotes() {
    var t = time * 0.001;
    for (var i = 0; i < dustMotes.length; i++) {
      var d = dustMotes[i];
      d.x += d.speedX + Math.sin(t * 0.3 + d.phase) * 0.04;
      d.y += d.speedY + Math.cos(t * 0.4 + d.phase) * 0.03;
      if (d.x < W * 0.15) d.x = W * 0.85;
      if (d.x > W * 0.85) d.x = W * 0.15;
      if (d.y < H * 0.1) d.y = H * 0.8;
      if (d.y > H * 0.82) d.y = H * 0.1;

      // Brighter in light beam paths
      var inBeam = (d.x > W * 0.3 && d.x < W * 0.7 && d.y > H * 0.3) ? 1.8 : 1;
      ctx.globalAlpha = d.opacity * (0.5 + progress * 0.5) * brightness * inBeam;
      ctx.fillStyle = '#fff8e0';
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ==================== SCENE INTERFACE ====================
  var scene = {
    enter: function(canvas, context, w, h) {
      ctx = context; W = w; H = h;
      progress = 0; targetProgress = 0; brightness = 0.75;
      generateScene();
    },
    resize: function(w, h) { W = w; H = h; generateScene(); },
    update: function(dt, t) {
      time = t;
      progress += (targetProgress - progress) * 0.03;
      brightness += ((0.75 + progress * 0.25) - brightness) * 0.02;
    },
    draw: function() {
      drawStoneWalls();
      drawPillars();
      drawWindow();
      drawLightBeams();
      drawFloor();
      drawCandles();
      drawDustMotes();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('shapes', scene);

  window.ClassmatesShapesScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('shapes')) return;
      var s = FXCore.getSize();
      var count = 8 + Math.floor(progress * 8);
      var jc = JEWEL_COLORS[idx % JEWEL_COLORS.length];
      FXCore.emit(s.w * 0.5, s.h * 0.4, 10, {
        spread: 5, rise: 2, decay: 0.02, size: 3,
        color: jc.fill + '0.8)', shape: 'diamond', endColor: jc.fill + '0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.4, 5, {
        spread: 3, rise: 1.5, decay: 0.025, size: 2,
        color: 'rgba(255,250,220,0.6)'
      });
      // Stained-glass jewel burst — complementary gem colour
      var nextJc = JEWEL_COLORS[(idx + 2) % JEWEL_COLORS.length];
      FXCore.emit(s.w * 0.5, s.h * 0.38, count, {
        spread: 6, rise: 2.3, decay: 0.018, size: 2.5,
        color: nextJc.fill + '0.7)', shape: 'diamond', endColor: nextJc.fill + '0)'
      });
      // Tiny candlelight sparkles
      FXCore.emit(s.w * 0.5, s.h * 0.4, 4, {
        spread: 2, rise: 1, decay: 0.03, size: 1.5,
        color: 'rgba(255,180,80,0.9)', shape: 'star'
      });
      if (window.FXSound) FXSound.play('chime');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('shapes')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 2, rise: -0.1, gravity: 0.02, decay: 0.015, size: 2,
        color: 'rgba(60,60,80,0.4)'
      });
      // Darker stone-shadow burst
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 1.5, rise: -0.2, gravity: 0.03, decay: 0.02, size: 1.8,
        color: 'rgba(30,30,50,0.5)'
      });
      if (FXCore.shake) FXCore.shake(3, 150);
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('shapes')) return;
      var s = FXCore.getSize();
      for (var i = 0; i < JEWEL_COLORS.length; i++) {
        FXCore.emit(s.w * (0.2 + i * 0.15), s.h * 0.35, 6, {
          spread: 7, rise: 3, decay: 0.01, size: 4,
          color: JEWEL_COLORS[i].fill + '0.7)', shape: 'diamond'
        });
      }
      // Cathedral celebration — 6 jewel bursts across the nave
      var gemOrder = [0, 4, 1, 3, 2, 0];
      for (var j = 0; j < 6; j++) {
        var gc = JEWEL_COLORS[gemOrder[j]];
        FXCore.emit(s.w * (0.1 + j * 0.14), s.h * (0.2 + Math.sin(j * 1.1) * 0.12), 5, {
          spread: 6, rise: 2.5, decay: 0.012, size: 3.5,
          color: gc.fill + '0.7)', shape: j % 2 === 0 ? 'diamond' : 'circle'
        });
      }
      // Central golden star burst
      FXCore.emit(s.w * 0.5, s.h * 0.35, 15, {
        spread: 8, rise: 3, decay: 0.008, size: 5,
        color: 'rgba(255,215,0,0.8)', shape: 'star', endColor: 'rgba(255,230,150,0)'
      });
      if (window.FXSound) FXSound.playSequence(['correct','streak','complete'], 100);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
