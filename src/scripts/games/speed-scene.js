(function(){
  // ============================================================
  // SPEED MATHS — "Frost Peak"
  // An arctic mountain at twilight. Ice crystals, falling snow,
  // aurora shimmer, frozen lake. The polar opposite of the volcano.
  // Cold, beautiful, urgent — matching the 60-second countdown.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.75;
  var time = 0;

  var stars = [];
  var auroraWaves = [];
  var mountains = [];
  var crystals = [];
  var snowflakes = [];
  var frostEdges = [];
  var vapourWisps = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

  var W = 0, H = 0, ctx = null;

  function generateScene() {
    // Stars
    stars = [];
    for (var i = 0; i < 35; i++) {
      stars.push({
        x: rand(0, W), y: rand(0, H * 0.3),
        size: rand(0.5, 2), twinkle: rand(0, Math.PI * 2), speed: rand(1, 3)
      });
    }

    // Aurora bands
    auroraWaves = [
      { y: H * 0.08, amplitude: 18, freq: 0.005, speed: 0.35, color: 'rgba(100,255,200,', width: H * 0.06 },
      { y: H * 0.14, amplitude: 14, freq: 0.007, speed: 0.25, color: 'rgba(80,200,255,', width: H * 0.04 },
      { y: H * 0.05, amplitude: 22, freq: 0.004, speed: 0.4, color: 'rgba(150,100,255,', width: H * 0.035 }
    ];

    // Frozen mountain peaks
    mountains = [];
    var mx = 0;
    while (mx < W + 30) {
      var pw = rand(35, 70);
      mountains.push({ x: mx, w: pw, h: rand(40, 90), snowDepth: rand(0.4, 0.7) });
      mx += pw * rand(0.5, 0.8);
    }

    // Ice crystals growing from ground
    crystals = [];
    var crystalPositions = [W * 0.08, W * 0.2, W * 0.35, W * 0.6, W * 0.75, W * 0.88, W * 0.95, W * 0.45];
    for (var i = 0; i < crystalPositions.length; i++) {
      crystals.push({
        x: crystalPositions[i], baseY: H * 0.75 + rand(-5, 5),
        maxH: rand(20, 50), width: rand(4, 10),
        facets: Math.floor(rand(3, 6)),
        hue: Math.round(rand(195, 220)),
        phase: rand(0, Math.PI * 2),
        minProgress: i < 4 ? 0 : (i < 6 ? 0.3 : 0.6)
      });
    }

    // Snowflakes
    snowflakes = [];
    for (var i = 0; i < 40; i++) {
      snowflakes.push({
        x: rand(0, W), y: rand(-H * 0.1, H),
        size: rand(1, 3.5), speed: rand(0.4, 1),
        windDrift: rand(0.2, 0.6), wobble: rand(0, Math.PI * 2),
        wobbleSpeed: rand(1, 3)
      });
    }

    // Frost edge patterns (4 corners)
    frostEdges = [];
    for (var i = 0; i < 20; i++) {
      var side = i < 5 ? 'left' : i < 10 ? 'right' : i < 15 ? 'topLeft' : 'topRight';
      frostEdges.push({
        side: side,
        startX: side === 'left' || side === 'topLeft' ? rand(0, W * 0.12) : rand(W * 0.88, W),
        startY: side === 'topLeft' || side === 'topRight' ? rand(0, H * 0.15) : rand(H * 0.3, H * 0.7),
        branches: Math.floor(rand(2, 5)),
        length: rand(15, 40),
        angle: side.includes('left') ? rand(0, 0.8) : rand(Math.PI - 0.8, Math.PI)
      });
    }

    // Breath vapour wisps
    vapourWisps = [];
    for (var i = 0; i < 4; i++) {
      vapourWisps.push({
        x: rand(W * 0.3, W * 0.7), y: rand(H * 0.5, H * 0.7),
        size: rand(8, 18), drift: rand(0.05, 0.15),
        opacity: rand(0.03, 0.06), phase: rand(0, Math.PI * 2)
      });
    }
  }

  // ==================== DRAWING ====================

  function drawSky() {
    var b = brightness;
    var grad = ctx.createLinearGradient(0, 0, 0, H * 0.5);
    grad.addColorStop(0, 'hsl(230,' + Math.round(35 + progress * 15) + '%,' + Math.round(10 * b) + '%)');
    grad.addColorStop(0.4, 'hsl(220,' + Math.round(30 + progress * 10) + '%,' + Math.round(15 * b) + '%)');
    grad.addColorStop(1, 'hsl(210,' + Math.round(25 + progress * 10) + '%,' + Math.round(22 * b) + '%)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawStars() {
    var t = time * 0.001;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var twink = 0.3 + Math.sin(t * s.speed + s.twinkle) * 0.4 + 0.3;
      ctx.globalAlpha = twink * brightness * 0.8;
      ctx.fillStyle = '#e0eaff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawAurora() {
    var t = time * 0.001;
    var auroraAlpha = 0.06 + progress * 0.2;
    for (var i = 0; i < auroraWaves.length; i++) {
      var a = auroraWaves[i];
      ctx.globalAlpha = auroraAlpha * (0.4 + Math.sin(t * 0.3 + i * 2) * 0.15);
      ctx.beginPath();
      for (var x = 0; x <= W; x += 4) {
        var y = a.y + Math.sin(x * a.freq + t * a.speed) * a.amplitude;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      for (var x = W; x >= 0; x -= 4) {
        var y = a.y + a.width + Math.sin(x * a.freq + t * a.speed + 0.5) * a.amplitude * 0.7;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      var ag = ctx.createLinearGradient(0, a.y - a.amplitude, 0, a.y + a.width + a.amplitude);
      ag.addColorStop(0, a.color + '0)');
      ag.addColorStop(0.3, a.color + '0.35)');
      ag.addColorStop(0.7, a.color + '0.25)');
      ag.addColorStop(1, a.color + '0)');
      ctx.fillStyle = ag;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawMountains() {
    var baseY = H * 0.42;
    for (var i = 0; i < mountains.length; i++) {
      var m = mountains[i];
      ctx.globalAlpha = 0.7 * brightness;
      // Mountain body — pale blue-grey
      ctx.fillStyle = 'hsl(210,15%,' + Math.round(28 * brightness) + '%)';
      ctx.beginPath();
      ctx.moveTo(m.x, baseY + 10);
      ctx.lineTo(m.x + m.w * 0.5, baseY - m.h);
      ctx.lineTo(m.x + m.w, baseY + 10);
      ctx.closePath();
      ctx.fill();
      // Snow/ice on peaks — white
      ctx.fillStyle = 'rgba(220,235,255,' + (0.6 * brightness) + ')';
      ctx.beginPath();
      ctx.moveTo(m.x + m.w * 0.3, baseY - m.h * m.snowDepth);
      ctx.lineTo(m.x + m.w * 0.5, baseY - m.h);
      ctx.lineTo(m.x + m.w * 0.7, baseY - m.h * m.snowDepth);
      ctx.closePath();
      ctx.fill();
      // Ice gleam — tiny highlight on peak
      ctx.globalAlpha = (0.15 + progress * 0.15) * brightness;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(m.x + m.w * 0.48, baseY - m.h + 3, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawFrozenLake() {
    var lakeY = H * 0.55;
    var lakeH = H * 0.08;
    var reflectivity = 0.1 + progress * 0.2;
    ctx.globalAlpha = (0.3 + progress * 0.25) * brightness;
    // Lake surface
    ctx.fillStyle = 'hsl(205,' + Math.round(20 + progress * 15) + '%,' + Math.round(30 * brightness) + '%)';
    ctx.fillRect(W * 0.1, lakeY, W * 0.8, lakeH);
    // Ice shimmer lines
    ctx.strokeStyle = 'rgba(200,230,255,' + (0.08 + reflectivity * 0.08) + ')';
    ctx.lineWidth = 0.5;
    var t = time * 0.001;
    for (var i = 0; i < 5; i++) {
      ctx.beginPath();
      var ly = lakeY + 3 + i * (lakeH / 5);
      for (var x = W * 0.1; x <= W * 0.9; x += 6) {
        var y = ly + Math.sin(x * 0.02 + t * 0.3 + i) * 1;
        if (x === W * 0.1) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawSnowGround() {
    var gy = H * 0.68;
    var gg = ctx.createLinearGradient(0, gy, 0, H);
    gg.addColorStop(0, 'hsl(210,' + Math.round(10 + progress * 8) + '%,' + Math.round(50 * brightness) + '%)');
    gg.addColorStop(0.3, 'hsl(215,' + Math.round(8 + progress * 5) + '%,' + Math.round(42 * brightness) + '%)');
    gg.addColorStop(1, 'hsl(220,' + Math.round(6) + '%,' + Math.round(35 * brightness) + '%)');
    ctx.fillStyle = gg;
    // Undulating snow surface
    ctx.beginPath();
    var t = time * 0.001;
    for (var x = 0; x <= W; x += 8) {
      var y = gy + Math.sin(x * 0.008 + 0.5) * 5 + Math.sin(x * 0.02) * 2;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fill();
  }

  function drawCrystals() {
    var t = time * 0.001;
    for (var i = 0; i < crystals.length; i++) {
      var c = crystals[i];
      if (progress < c.minProgress) continue;
      var growFactor = Math.min(1, (progress - c.minProgress) / 0.3 + 0.3);
      var h = c.maxH * growFactor;
      var shimmer = 0.5 + Math.sin(t * 1.5 + c.phase) * 0.2;

      ctx.save();
      ctx.translate(c.x, c.baseY);
      ctx.globalAlpha = (0.35 + progress * 0.35) * brightness;

      // Crystal body — elongated hexagonal
      var hw = c.width * 0.5;
      var bodyG = ctx.createLinearGradient(-hw, -h, hw, 0);
      bodyG.addColorStop(0, 'hsla(' + c.hue + ',60%,' + Math.round(65 * shimmer) + '%,0.6)');
      bodyG.addColorStop(0.5, 'hsla(' + c.hue + ',50%,' + Math.round(50 * shimmer) + '%,0.4)');
      bodyG.addColorStop(1, 'hsla(' + c.hue + ',40%,' + Math.round(40 * shimmer) + '%,0.3)');
      ctx.fillStyle = bodyG;
      ctx.beginPath();
      ctx.moveTo(0, -h);
      ctx.lineTo(hw, -h * 0.65);
      ctx.lineTo(hw, -h * 0.1);
      ctx.lineTo(0, 0);
      ctx.lineTo(-hw, -h * 0.1);
      ctx.lineTo(-hw, -h * 0.65);
      ctx.closePath();
      ctx.fill();

      // Inner light line
      ctx.globalAlpha = shimmer * 0.3 * brightness;
      ctx.strokeStyle = '#e0f0ff';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.9);
      ctx.lineTo(0, -h * 0.1);
      ctx.stroke();

      // Facet edge highlights
      ctx.globalAlpha = shimmer * 0.15 * brightness;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, -h);
      ctx.lineTo(hw, -h * 0.65);
      ctx.stroke();

      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawSnow() {
    var t = time * 0.001;
    var intensity = 0.6 + progress * 0.4;
    for (var i = 0; i < snowflakes.length; i++) {
      var s = snowflakes[i];
      if (i / snowflakes.length > intensity) continue;
      s.y += s.speed * 0.5;
      s.x += s.windDrift * 0.4 + Math.sin(t * s.wobbleSpeed + s.wobble) * 0.3;
      if (s.y > H + 5) { s.y = -5; s.x = rand(0, W); }
      if (s.x > W + 5) s.x = -5;
      ctx.globalAlpha = (0.3 + progress * 0.3) * brightness;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawFrostEdges() {
    ctx.globalAlpha = (0.04 + progress * 0.06) * brightness;
    ctx.strokeStyle = 'rgba(200,230,255,0.4)';
    ctx.lineWidth = 0.5;
    for (var i = 0; i < frostEdges.length; i++) {
      var f = frostEdges[i];
      ctx.beginPath();
      ctx.moveTo(f.startX, f.startY);
      var cx = f.startX, cy = f.startY;
      for (var b = 0; b < f.branches; b++) {
        var branchAngle = f.angle + rand(-0.5, 0.5);
        var branchLen = f.length * (1 - b * 0.2);
        var nx = cx + Math.cos(branchAngle) * branchLen;
        var ny = cy + Math.sin(branchAngle) * branchLen;
        ctx.lineTo(nx, ny);
        // Sub-branch
        ctx.moveTo(cx + Math.cos(branchAngle) * branchLen * 0.5, cy + Math.sin(branchAngle) * branchLen * 0.5);
        ctx.lineTo(
          cx + Math.cos(branchAngle + 0.5) * branchLen * 0.3,
          cy + Math.sin(branchAngle + 0.5) * branchLen * 0.3
        );
        ctx.moveTo(nx, ny);
        cx = nx; cy = ny;
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawVapour() {
    var t = time * 0.001;
    for (var i = 0; i < vapourWisps.length; i++) {
      var v = vapourWisps[i];
      var vx = v.x + Math.sin(t * 0.4 + v.phase) * 10 + v.drift * t * 8;
      var vy = v.y + Math.cos(t * 0.3 + v.phase) * 5 - t * 0.5;
      if (vy < H * 0.3) vy += H * 0.4;
      ctx.globalAlpha = v.opacity * (0.5 + progress * 0.5) * brightness;
      ctx.fillStyle = 'rgba(220,235,255,0.3)';
      ctx.beginPath();
      ctx.arc(vx, vy, v.size, 0, Math.PI * 2);
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
      drawSky();
      drawStars();
      drawAurora();
      drawMountains();
      drawFrozenLake();
      drawSnowGround();
      drawCrystals();
      drawFrostEdges();
      drawVapour();
      drawSnow();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('speed', scene);

  window.ClassmatesSpeedScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('speed')) return;
      var s = FXCore.getSize();
      var count = 8 + Math.floor(progress * 8);
      FXCore.emit(s.w * 0.5, s.h * 0.4, 10, {
        spread: 5, rise: 2.5, decay: 0.018, size: 3,
        color: 'rgba(180,230,255,0.8)', shape: 'diamond', endColor: 'rgba(220,240,255,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.4, 5, {
        spread: 3, rise: 2, decay: 0.022, size: 2,
        color: 'rgba(100,200,255,0.6)', shape: 'star'
      });
      // Aurora shimmer burst
      FXCore.emit(s.w * 0.5, s.h * 0.38, count, {
        spread: 6, rise: 2.2, decay: 0.016, size: 3,
        color: 'rgba(100,255,200,0.7)', endColor: 'rgba(150,100,255,0)'
      });
      // Tiny ice sparkles
      FXCore.emit(s.w * 0.5, s.h * 0.42, 4, {
        spread: 2, rise: 2.8, decay: 0.03, size: 1.5,
        color: 'rgba(230,245,255,0.9)', shape: 'star'
      });
      if (window.FXSound) FXSound.play('click');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('speed')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 2, rise: -0.2, gravity: 0.02, decay: 0.015, size: 2,
        color: 'rgba(100,120,150,0.4)'
      });
      // Darker frost burst
      FXCore.emit(s.w * 0.5, s.h * 0.52, 4, {
        spread: 1.5, rise: -0.3, gravity: 0.03, decay: 0.02, size: 2.5,
        color: 'rgba(50,60,80,0.5)'
      });
      if(FXCore.shake) FXCore.shake(3, 150);
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('speed')) return;
      var s = FXCore.getSize();
      // Crystal shatter burst — ice blue + white
      for (var i = 0; i < 5; i++) {
        FXCore.emit(s.w * (0.2 + i * 0.15), s.h * 0.4, 6, {
          spread: 7, rise: 3, decay: 0.01, size: 3.5,
          color: i % 2 === 0 ? 'rgba(180,230,255,0.8)' : 'rgba(255,255,255,0.7)',
          shape: 'diamond'
        });
      }
      // Arctic themed bursts across the scene
      var iceColors = ['rgba(100,255,200,0.7)','rgba(80,200,255,0.7)','rgba(150,100,255,0.6)','rgba(180,230,255,0.7)','rgba(120,240,210,0.65)','rgba(200,220,255,0.7)'];
      for (var j = 0; j < 6; j++) {
        FXCore.emit(s.w * (0.1 + j * 0.14), s.h * (0.2 + (j % 3) * 0.1), 5, {
          spread: 5, rise: 2.5, decay: 0.01, size: 4,
          color: iceColors[j], shape: j % 2 === 0 ? 'diamond' : 'star'
        });
      }
      // Central golden star burst
      FXCore.emit(s.w * 0.5, s.h * 0.35, 15, {
        spread: 8, rise: 3, decay: 0.008, size: 5,
        color: 'rgba(255,215,0,0.8)', shape: 'star'
      });
      if (window.FXSound) FXSound.playSequence(['correct','streak','complete'], 100);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
