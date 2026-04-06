(function(){
  // ============================================================
  // MISSING NUMBER — "Desert Ruins"
  // A warm desert at sunset with ancient stone ruins. Long
  // shadows, golden sand, circling hawk, buried mysteries.
  // HOT, DRY, ANCIENT — the opposite of the tropical reef.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.75;
  var time = 0;
  var hawkAngle = 0;

  var dunes = [];
  var columns = [];
  var cacti = [];
  var sandParticles = [];
  var heatWaves = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

  var W = 0, H = 0, ctx = null;

  function generateScene() {
    // Distant dunes
    dunes = [];
    for (var x = 0; x <= W + 30; x += 20) {
      dunes.push({ x: x, y: H * 0.44 + Math.sin(x * 0.005 + 0.8) * H * 0.03 + Math.sin(x * 0.012) * H * 0.015 });
    }

    // Stone columns/ruins
    columns = [
      { x: W * 0.15, baseY: H * 0.55, w: 14, h: 60, broken: false },
      { x: W * 0.25, baseY: H * 0.53, w: 12, h: 45, broken: true },
      { x: W * 0.82, baseY: H * 0.56, w: 16, h: 55, broken: false },
      { x: W * 0.7, baseY: H * 0.58, w: 10, h: 30, broken: true }
    ];

    // Cacti
    cacti = [
      { x: W * 0.05, baseY: H * 0.72, h: 25, arms: 2 },
      { x: W * 0.4, baseY: H * 0.7, h: 18, arms: 1 },
      { x: W * 0.6, baseY: H * 0.74, h: 30, arms: 2 },
      { x: W * 0.92, baseY: H * 0.71, h: 22, arms: 1 }
    ];

    // Sand particles
    sandParticles = [];
    for (var i = 0; i < 25; i++) {
      sandParticles.push({
        x: rand(0, W), y: rand(H * 0.4, H * 0.85),
        size: rand(0.5, 1.5), speedX: rand(0.1, 0.4),
        speedY: rand(-0.05, 0.05), opacity: rand(0.1, 0.25)
      });
    }

    // Heat wave shimmer points
    heatWaves = [];
    for (var i = 0; i < 6; i++) {
      heatWaves.push({
        x: rand(W * 0.1, W * 0.9), y: H * 0.44 + rand(-5, 5),
        width: rand(40, 80), phase: rand(0, Math.PI * 2)
      });
    }
  }

  // ==================== DRAWING ====================

  function drawSky() {
    var b = brightness;
    var sunHeight = 0.3 + progress * 0.15; // sun rises with progress
    var grad = ctx.createLinearGradient(0, 0, 0, H * 0.5);
    grad.addColorStop(0, 'hsl(270,' + Math.round(30 + progress * 10) + '%,' + Math.round(18 * b) + '%)');
    grad.addColorStop(0.3, 'hsl(300,' + Math.round(25 + progress * 10) + '%,' + Math.round(25 * b) + '%)');
    grad.addColorStop(0.6, 'hsl(20,' + Math.round(60 + progress * 15) + '%,' + Math.round(45 * b) + '%)');
    grad.addColorStop(0.85, 'hsl(30,' + Math.round(70 + progress * 10) + '%,' + Math.round(55 * b) + '%)');
    grad.addColorStop(1, 'hsl(40,' + Math.round(75 + progress * 10) + '%,' + Math.round(60 * b) + '%)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Sun disc
    var sx = W * 0.7, sy = H * (0.38 - progress * 0.08);
    ctx.globalAlpha = (0.3 + progress * 0.3) * b;
    var sg = ctx.createRadialGradient(sx, sy, 5, sx, sy, 60);
    sg.addColorStop(0, 'rgba(255,200,80,0.5)');
    sg.addColorStop(0.3, 'rgba(255,180,60,0.2)');
    sg.addColorStop(1, 'rgba(255,150,30,0)');
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(sx, sy, 60, 0, Math.PI * 2);
    ctx.fill();
    // Sun core
    ctx.fillStyle = '#fff8e0';
    ctx.globalAlpha = (0.5 + progress * 0.3) * b;
    ctx.beginPath();
    ctx.arc(sx, sy, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawDistantDunes() {
    ctx.globalAlpha = 0.7 * brightness;
    var dg = ctx.createLinearGradient(0, H * 0.4, 0, H * 0.55);
    dg.addColorStop(0, 'hsl(35,' + Math.round(50 + progress * 10) + '%,' + Math.round(45 * brightness) + '%)');
    dg.addColorStop(1, 'hsl(30,' + Math.round(45 + progress * 8) + '%,' + Math.round(38 * brightness) + '%)');
    ctx.fillStyle = dg;
    ctx.beginPath();
    for (var i = 0; i < dunes.length; i++) {
      if (i === 0) ctx.moveTo(dunes[i].x, dunes[i].y);
      else {
        var prev = dunes[i - 1], cur = dunes[i];
        ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + cur.x) / 2, (prev.y + cur.y) / 2);
      }
    }
    ctx.lineTo(W + 20, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawHeatShimmer() {
    var t = time * 0.001;
    ctx.globalAlpha = (0.02 + progress * 0.03) * brightness;
    for (var i = 0; i < heatWaves.length; i++) {
      var h = heatWaves[i];
      ctx.strokeStyle = 'rgba(255,220,150,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var x = h.x; x < h.x + h.width; x += 3) {
        var y = h.y + Math.sin(x * 0.1 + t * 3 + h.phase) * 2;
        if (x === h.x) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawColumns() {
    for (var i = 0; i < columns.length; i++) {
      var c = columns[i];
      ctx.globalAlpha = (0.45 + progress * 0.3) * brightness;

      // Shadow on ground
      ctx.globalAlpha = 0.1 * brightness;
      ctx.fillStyle = '#2a1a08';
      var shadowLen = 40 * (1.2 - progress * 0.4); // shadows shorten with progress
      ctx.beginPath();
      ctx.moveTo(c.x - c.w * 0.3, c.baseY);
      ctx.lineTo(c.x + shadowLen, c.baseY + 3);
      ctx.lineTo(c.x + shadowLen, c.baseY + 6);
      ctx.lineTo(c.x - c.w * 0.3, c.baseY + 4);
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = (0.45 + progress * 0.3) * brightness;
      // Column body — sandstone
      var cg = ctx.createLinearGradient(c.x - c.w * 0.5, 0, c.x + c.w * 0.5, 0);
      cg.addColorStop(0, '#c4a878');
      cg.addColorStop(0.5, '#d4b888');
      cg.addColorStop(1, '#b89868');
      ctx.fillStyle = cg;

      if (c.broken) {
        // Broken column — jagged top
        ctx.beginPath();
        ctx.moveTo(c.x - c.w * 0.5, c.baseY);
        ctx.lineTo(c.x - c.w * 0.5, c.baseY - c.h);
        ctx.lineTo(c.x - c.w * 0.15, c.baseY - c.h - 5);
        ctx.lineTo(c.x + c.w * 0.2, c.baseY - c.h + 3);
        ctx.lineTo(c.x + c.w * 0.5, c.baseY - c.h - 2);
        ctx.lineTo(c.x + c.w * 0.5, c.baseY);
        ctx.closePath();
        ctx.fill();
      } else {
        // Full column with capital
        ctx.fillRect(c.x - c.w * 0.5, c.baseY - c.h, c.w, c.h);
        // Capital (top piece)
        ctx.fillStyle = '#d4c098';
        ctx.fillRect(c.x - c.w * 0.7, c.baseY - c.h - 4, c.w * 1.4, 5);
      }

      // Erosion lines
      ctx.globalAlpha = 0.06 * brightness;
      ctx.strokeStyle = '#8a7858';
      ctx.lineWidth = 0.5;
      for (var l = 0; l < 3; l++) {
        var ly = c.baseY - c.h * (0.2 + l * 0.25);
        ctx.beginPath();
        ctx.moveTo(c.x - c.w * 0.4, ly);
        ctx.lineTo(c.x + c.w * 0.4, ly + rand(-1, 1));
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawArch() {
    var ax = W * 0.5, ay = H * 0.5;
    var aw = 50, ah = 55;
    ctx.globalAlpha = (0.35 + progress * 0.3) * brightness;
    ctx.fillStyle = '#c4a878';
    // Left pillar
    ctx.fillRect(ax - aw * 0.5, ay, 10, ah);
    // Right pillar
    ctx.fillRect(ax + aw * 0.5 - 10, ay, 10, ah);
    // Arch top
    ctx.beginPath();
    ctx.moveTo(ax - aw * 0.5, ay);
    ctx.quadraticCurveTo(ax, ay - 20, ax + aw * 0.5, ay);
    ctx.lineTo(ax + aw * 0.5 - 8, ay);
    ctx.quadraticCurveTo(ax, ay - 12, ax - aw * 0.5 + 8, ay);
    ctx.closePath();
    ctx.fill();
    // Keystone
    ctx.fillStyle = '#b89868';
    ctx.beginPath();
    ctx.moveTo(ax - 5, ay - 16);
    ctx.lineTo(ax + 5, ay - 16);
    ctx.lineTo(ax + 4, ay - 10);
    ctx.lineTo(ax - 4, ay - 10);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawSandForeground() {
    var gy = H * 0.68;
    var fg = ctx.createLinearGradient(0, gy, 0, H);
    fg.addColorStop(0, 'hsl(35,' + Math.round(50 + progress * 10) + '%,' + Math.round(48 * brightness) + '%)');
    fg.addColorStop(0.5, 'hsl(32,' + Math.round(45 + progress * 8) + '%,' + Math.round(42 * brightness) + '%)');
    fg.addColorStop(1, 'hsl(28,' + Math.round(40) + '%,' + Math.round(35 * brightness) + '%)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    var t = time * 0.001;
    for (var x = 0; x <= W; x += 10) {
      var y = gy + Math.sin(x * 0.006 + 1) * 4 + Math.sin(x * 0.02) * 2;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fill();

    // Sand ripple lines
    ctx.globalAlpha = 0.05 * brightness;
    ctx.strokeStyle = '#a08050';
    ctx.lineWidth = 0.5;
    for (var r = 0; r < 6; r++) {
      var ry = gy + 10 + r * 12;
      ctx.beginPath();
      for (var x = 0; x <= W; x += 8) {
        var y = ry + Math.sin(x * 0.03 + r * 0.5) * 1.5;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawCacti() {
    for (var i = 0; i < cacti.length; i++) {
      var c = cacti[i];
      ctx.globalAlpha = (0.4 + progress * 0.2) * brightness;
      ctx.fillStyle = '#2d5a27';
      // Main trunk
      ctx.fillRect(c.x - 3, c.baseY - c.h, 6, c.h);
      ctx.beginPath();
      ctx.arc(c.x, c.baseY - c.h, 3, 0, Math.PI * 2);
      ctx.fill();
      // Arms
      if (c.arms >= 1) {
        ctx.fillRect(c.x + 3, c.baseY - c.h * 0.6, 10, 4);
        ctx.fillRect(c.x + 10, c.baseY - c.h * 0.6 - 8, 4, 12);
      }
      if (c.arms >= 2) {
        ctx.fillRect(c.x - 13, c.baseY - c.h * 0.4, 10, 4);
        ctx.fillRect(c.x - 13, c.baseY - c.h * 0.4 - 10, 4, 14);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawHawk() {
    var t = time * 0.001;
    hawkAngle += 0.008;
    var hx = W * 0.5 + Math.cos(hawkAngle) * W * 0.2;
    var hy = H * (0.2 - progress * 0.05) + Math.sin(hawkAngle * 0.7) * 15;
    var wingAngle = Math.sin(t * 1.5) * 0.3;

    ctx.globalAlpha = (0.3 + progress * 0.25) * brightness;
    ctx.fillStyle = '#2a1a08';
    ctx.save();
    ctx.translate(hx, hy);
    // Body
    ctx.beginPath();
    ctx.ellipse(0, 0, 4, 2, Math.cos(hawkAngle) * 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Wings — V shape
    ctx.strokeStyle = '#2a1a08';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-8, wingAngle * 4);
    ctx.quadraticCurveTo(-3, -2, 0, 0);
    ctx.quadraticCurveTo(3, -2, 8, wingAngle * 4);
    ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawSandParticles() {
    for (var i = 0; i < sandParticles.length; i++) {
      var s = sandParticles[i];
      s.x += s.speedX;
      s.y += s.speedY;
      if (s.x > W + 5) { s.x = -5; s.y = rand(H * 0.4, H * 0.85); }
      ctx.globalAlpha = s.opacity * (0.5 + progress * 0.3) * brightness;
      ctx.fillStyle = '#d4b070';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ==================== SCENE INTERFACE ====================
  var scene = {
    enter: function(canvas, context, w, h) {
      ctx = context; W = w; H = h;
      progress = 0; targetProgress = 0; brightness = 0.75;
      hawkAngle = 0;
      generateScene();
    },
    resize: function(w, h) { W = w; H = h; generateScene(); },
    update: function(dt, t) {
      time = t;
      progress += (targetProgress - progress) * 0.03;
      brightness += ((0.75 + progress * 0.25) - brightness) * 0.02;
    },
    draw: function() {
      drawSky();
      drawDistantDunes();
      drawHeatShimmer();
      drawColumns();
      drawArch();
      drawSandForeground();
      drawCacti();
      drawHawk();
      drawSandParticles();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('missnum', scene);

  window.ClassmatesMissnumScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('missnum')) return;
      var s = FXCore.getSize();
      var count = 8 + Math.floor(progress * 8);
      FXCore.emit(s.w * 0.5, s.h * 0.4, 10, {
        spread: 5, rise: 2, decay: 0.02, size: 3,
        color: 'rgba(212,176,112,0.8)', shape: 'star', endColor: 'rgba(255,220,150,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.4, 5, {
        spread: 3, rise: 1.5, decay: 0.025, size: 2,
        color: 'rgba(196,168,120,0.6)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.35, count, {
        spread: 7, rise: 2.5, decay: 0.016, size: 3.5,
        color: 'rgba(255,180,60,0.8)', shape: 'star', endColor: 'rgba(212,176,112,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.4, Math.floor(count * 0.6), {
        spread: 2, rise: 1, decay: 0.03, size: 1.2,
        color: 'rgba(255,230,180,0.6)'
      });
      if (window.FXSound) FXSound.play('click');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('missnum')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 2, rise: -0.2, gravity: 0.03, decay: 0.015, size: 2,
        color: 'rgba(120,90,50,0.4)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.5, 3, {
        spread: 3, rise: -0.4, gravity: 0.04, decay: 0.018, size: 2.5,
        color: 'rgba(80,60,30,0.5)'
      });
      if(FXCore.shake) FXCore.shake(3, 150);
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('missnum')) return;
      var s = FXCore.getSize();
      var colors = ['rgba(212,176,112,0.7)','rgba(255,200,80,0.7)','rgba(196,168,120,0.6)','rgba(255,220,150,0.6)','rgba(180,140,80,0.7)'];
      for (var i = 0; i < colors.length; i++) {
        FXCore.emit(s.w * (0.2 + i * 0.15), s.h * 0.35, 5, {
          spread: 6, rise: 3, decay: 0.012, size: 3.5, color: colors[i], shape: 'star'
        });
      }
      var desertColors = ['rgba(255,180,60,0.7)','rgba(212,176,112,0.7)','rgba(255,220,150,0.7)','rgba(196,168,120,0.7)','rgba(255,200,80,0.7)','rgba(180,140,80,0.7)','rgba(240,190,90,0.7)','rgba(220,180,100,0.7)'];
      for (var j = 0; j < desertColors.length; j++) {
        FXCore.emit(s.w * (0.08 + j * 0.12), s.h * (0.25 + Math.sin(j) * 0.1), 8, {
          spread: 8, rise: 3.5, decay: 0.01, size: 4, color: desertColors[j], shape: 'star'
        });
      }
      FXCore.emit(s.w * 0.5, s.h * 0.4, 15, {
        spread: 10, rise: 2, decay: 0.008, size: 5,
        color: 'rgba(255,215,0,0.8)', shape: 'star', endColor: 'rgba(255,215,0,0)'
      });
      if (window.FXSound) FXSound.playSequence(['correct','streak','complete'], 100);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
