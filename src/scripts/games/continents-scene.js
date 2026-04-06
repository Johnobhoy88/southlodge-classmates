(function(){
  // ============================================================
  // CONTINENTS — "Balloon Voyage"
  // Floating in a hot air balloon above patchwork landscape.
  // Colourful envelope above, fields below, clouds drifting past.
  // ELEVATED, PEACEFUL, VAST — seeing the world from above.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.8;
  var time = 0;

  var clouds = [];
  var fields = [];
  var birds = [];
  var mapLabels = [];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

  var W = 0, H = 0, ctx = null;

  function generateScene() {
    clouds = [];
    for (var i = 0; i < 6; i++) {
      clouds.push({
        x: rand(-80, W + 80), y: rand(H * 0.35, H * 0.55),
        w: rand(50, 120), puffs: Math.floor(rand(3, 5)),
        speed: rand(0.15, 0.35), opacity: rand(0.5, 0.8)
      });
    }

    // Patchwork fields below
    fields = [];
    var fieldColors = ['#5a9a40','#4a8a30','#8aaa50','#c4a060','#6aaa50','#a09040','#70b050'];
    for (var r = 0; r < 5; r++) {
      for (var c = 0; c < 8; c++) {
        fields.push({
          x: W * (c / 8) + rand(-5, 5), y: H * (0.62 + r * 0.08) + rand(-3, 3),
          w: W / 8 + rand(-8, 8), h: H * 0.08 + rand(-4, 4),
          color: pick(fieldColors), angle: rand(-0.05, 0.05)
        });
      }
    }

    birds = [];
    for (var i = 0; i < 5; i++) {
      birds.push({
        x: rand(0, W), y: rand(H * 0.3, H * 0.5),
        speed: rand(0.4, 1), wingPhase: rand(0, Math.PI * 2),
        size: rand(3, 6)
      });
    }

    var CONTINENTS = ['Europe','Asia','Africa','N. America','S. America','Australia','Antarctica'];
    mapLabels = [];
    for (var i = 0; i < 8; i++) {
      mapLabels.push({
        x: rand(W * 0.1, W * 0.9), y: rand(H * 0.55, H * 0.85),
        text: pick(CONTINENTS), size: rand(10, 18),
        speed: rand(0.03, 0.08), drift: rand(-0.06, 0.06),
        opacity: rand(0.04, 0.07), rotation: rand(-0.1, 0.1),
        rotSpeed: rand(-0.001, 0.001),
        minProgress: i < 4 ? 0 : 0.3
      });
    }
  }

  // ==================== DRAWING ====================

  function drawSky() {
    var b = brightness;
    var sg = ctx.createLinearGradient(0, 0, 0, H * 0.6);
    sg.addColorStop(0, 'hsl(210,' + Math.round(55 + progress * 15) + '%,' + Math.round(62 * b) + '%)');
    sg.addColorStop(0.5, 'hsl(205,' + Math.round(50 + progress * 12) + '%,' + Math.round(70 * b) + '%)');
    sg.addColorStop(1, 'hsl(200,' + Math.round(40 + progress * 10) + '%,' + Math.round(78 * b) + '%)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, H);
  }

  function drawBalloonEnvelope() {
    var bx = W * 0.5, by = H * 0.08;
    var bw = W * 0.28, bh = H * 0.28;
    var t = time * 0.001;
    var sway = Math.sin(t * 0.4) * 3;

    ctx.save();
    ctx.translate(bx + sway, by);
    ctx.globalAlpha = (0.5 + progress * 0.35) * brightness;

    // Envelope — dome shape with coloured panels
    var panels = [
      { color: '#dc2626', start: -0.45, end: -0.15 },
      { color: '#eab308', start: -0.15, end: 0.15 },
      { color: '#2563eb', start: 0.15, end: 0.45 },
      { color: '#16a34a', start: -0.6, end: -0.45 },
      { color: '#ea580c', start: 0.45, end: 0.6 }
    ];

    // Full envelope background
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-bw * 0.15, bh);
    ctx.quadraticCurveTo(-bw * 0.5, bh * 0.3, -bw * 0.2, 0);
    ctx.quadraticCurveTo(0, -bh * 0.15, bw * 0.2, 0);
    ctx.quadraticCurveTo(bw * 0.5, bh * 0.3, bw * 0.15, bh);
    ctx.closePath();
    ctx.fill();

    // Coloured vertical panels
    for (var i = 0; i < panels.length; i++) {
      var p = panels[i];
      ctx.fillStyle = p.color;
      ctx.beginPath();
      var lx = bw * p.start, rx = bw * p.end;
      var ly = bh * (0.1 + Math.abs(p.start) * 0.8);
      var ry = bh * (0.1 + Math.abs(p.end) * 0.8);
      ctx.moveTo(lx * 0.8, bh);
      ctx.quadraticCurveTo(lx, ly, lx * 0.5, Math.abs(lx) < bw * 0.2 ? 0 : bh * 0.1);
      ctx.lineTo(rx * 0.5, Math.abs(rx) < bw * 0.2 ? 0 : bh * 0.1);
      ctx.quadraticCurveTo(rx, ry, rx * 0.8, bh);
      ctx.closePath();
      ctx.fill();
    }

    // Highlight on envelope
    ctx.globalAlpha = 0.08 * brightness;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(-bw * 0.1, bh * 0.3, bw * 0.15, bh * 0.3, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Rope lines from envelope to basket
    ctx.globalAlpha = (0.3 + progress * 0.2) * brightness;
    ctx.strokeStyle = '#6a5a40';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-bw * 0.12, bh); ctx.lineTo(-8, bh + H * 0.15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bw * 0.12, bh); ctx.lineTo(8, bh + H * 0.15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-bw * 0.06, bh); ctx.lineTo(-3, bh + H * 0.15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bw * 0.06, bh); ctx.lineTo(3, bh + H * 0.15); ctx.stroke();

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawBasket() {
    var bx = W * 0.5, by = H * 0.38;
    var t = time * 0.001;
    var sway = Math.sin(t * 0.4) * 3;

    ctx.save();
    ctx.translate(bx + sway, by);
    ctx.globalAlpha = (0.4 + progress * 0.3) * brightness;
    // Basket body — wicker brown
    ctx.fillStyle = '#8a6a40';
    ctx.fillRect(-12, 0, 24, 14);
    // Rim
    ctx.fillStyle = '#7a5a30';
    ctx.fillRect(-14, -2, 28, 4);
    // Wicker pattern
    ctx.strokeStyle = 'rgba(100,70,35,0.15)';
    ctx.lineWidth = 0.5;
    for (var y = 2; y < 12; y += 3) {
      ctx.beginPath(); ctx.moveTo(-11, y); ctx.lineTo(11, y); ctx.stroke();
    }
    for (var x = -9; x < 12; x += 4) {
      ctx.beginPath(); ctx.moveTo(x, 1); ctx.lineTo(x, 13); ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawHorizon() {
    var hy = H * 0.58;
    ctx.globalAlpha = (0.4 + progress * 0.25) * brightness;
    // Hazy horizon line
    var hg = ctx.createLinearGradient(0, hy - 10, 0, hy + 10);
    hg.addColorStop(0, 'rgba(180,210,230,0.3)');
    hg.addColorStop(0.5, 'rgba(160,200,180,0.2)');
    hg.addColorStop(1, 'rgba(140,180,140,0.1)');
    ctx.fillStyle = hg;
    ctx.fillRect(0, hy - 10, W, 20);
    // Distant mountains
    ctx.fillStyle = 'rgba(100,130,160,0.15)';
    ctx.beginPath();
    ctx.moveTo(0, hy);
    for (var x = 0; x <= W; x += 30) {
      ctx.lineTo(x, hy - 5 - Math.sin(x * 0.01 + 1) * 8 - Math.sin(x * 0.025) * 4);
    }
    ctx.lineTo(W, hy + 5); ctx.lineTo(0, hy + 5); ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawLandscape() {
    // Patchwork fields
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i];
      ctx.save();
      ctx.translate(f.x + f.w * 0.5, f.y + f.h * 0.5);
      ctx.rotate(f.angle);
      ctx.globalAlpha = (0.35 + progress * 0.3) * brightness;
      ctx.fillStyle = f.color;
      ctx.fillRect(-f.w * 0.5, -f.h * 0.5, f.w, f.h);
      // Field border
      ctx.strokeStyle = 'rgba(60,80,40,0.1)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(-f.w * 0.5, -f.h * 0.5, f.w, f.h);
      ctx.restore();
    }

    // River
    ctx.globalAlpha = (0.25 + progress * 0.25) * brightness;
    ctx.strokeStyle = '#4a90c0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W * 0.2, H * 0.65);
    ctx.quadraticCurveTo(W * 0.4, H * 0.72, W * 0.5, H * 0.68);
    ctx.quadraticCurveTo(W * 0.65, H * 0.62, W * 0.8, H * 0.7);
    ctx.stroke();

    // Road
    ctx.strokeStyle = '#d4d0c8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W * 0.1, H * 0.78);
    ctx.quadraticCurveTo(W * 0.35, H * 0.82, W * 0.55, H * 0.75);
    ctx.quadraticCurveTo(W * 0.75, H * 0.68, W * 0.95, H * 0.72);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Noise landscape texture — organic patchwork field detail from above
  function drawFieldNoise() {
    var t = time * 0.001;
    var landY = Math.floor(H * 0.6);
    var noiseAlpha = (0.025 + progress * 0.02) * brightness;
    ctx.globalAlpha = noiseAlpha;
    for (var nx = 0; nx < W; nx += 16) {
      for (var ny = landY; ny < H; ny += 16) {
        var n = FXCore.noise2D(nx * 0.005 + t * 0.03, ny * 0.005);
        var depth = (ny - landY) / (H - landY);
        var hue = 120 + n * 30;
        var l = 30 + n * 12 - depth * 6;
        ctx.fillStyle = 'hsl(' + Math.round(hue) + ',' + Math.round(30 + n * 10) + '%,' + Math.round(Math.max(12, l)) + '%)';
        ctx.fillRect(nx, ny, 16, 16);
      }
    }
    ctx.globalAlpha = 1;
  }

  // Screen-blend sky and balloon glow bloom
  function drawAerialGlow() {
    ctx.globalCompositeOperation = 'screen';

    // Bright sky ambient bloom
    var skyR = W * (0.35 + progress * 0.1);
    ctx.globalAlpha = (0.03 + progress * 0.04) * brightness;
    var sg = ctx.createRadialGradient(W * 0.5, H * 0.2, 0, W * 0.5, H * 0.2, skyR);
    sg.addColorStop(0, 'rgba(200,230,255,0.1)');
    sg.addColorStop(0.5, 'rgba(180,220,250,0.04)');
    sg.addColorStop(1, 'rgba(180,220,250,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, H * 0.6);

    // Balloon envelope warm radiance
    var bx = W * 0.5, by = H * 0.2;
    var balloonR = Math.min(W, H) * 0.2;
    ctx.globalAlpha = (0.04 + progress * 0.03) * brightness;
    var bg = ctx.createRadialGradient(bx, by, 0, bx, by, balloonR);
    bg.addColorStop(0, 'rgba(255,200,100,0.12)');
    bg.addColorStop(0.5, 'rgba(255,180,80,0.04)');
    bg.addColorStop(1, 'rgba(255,180,80,0)');
    ctx.fillStyle = bg;
    ctx.fillRect(bx - balloonR, by - balloonR, balloonR * 2, balloonR * 2);

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  function drawClouds() {
    var t = time * 0.001;
    for (var i = 0; i < clouds.length; i++) {
      var c = clouds[i];
      var cx = c.x + t * c.speed * 18;
      if (cx > W + c.w) cx -= W + c.w * 2;
      if (cx < -c.w) cx += W + c.w * 2;
      ctx.globalAlpha = c.opacity * brightness * (1 - progress * 0.2);
      ctx.fillStyle = '#fff';
      var pw = c.w / c.puffs;
      for (var p = 0; p < c.puffs; p++) {
        ctx.beginPath();
        ctx.arc(cx + p * pw * 0.7, c.y + Math.sin(p * 1.5) * 5, pw * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawBirds() {
    var t = time * 0.001;
    ctx.strokeStyle = '#4a5a6a';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    for (var i = 0; i < birds.length; i++) {
      var b = birds[i];
      var bx = (b.x + t * b.speed * 25) % (W + 40) - 20;
      var by = b.y + Math.sin(t * 0.6 + b.wingPhase) * 6;
      var wing = Math.sin(t * 3 + b.wingPhase) * b.size * 0.5;
      ctx.globalAlpha = (0.3 + progress * 0.2) * brightness;
      ctx.beginPath();
      ctx.moveTo(bx - b.size, by - wing);
      ctx.quadraticCurveTo(bx, by, bx + b.size, by - wing);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawMapLabels() {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (var i = 0; i < mapLabels.length; i++) {
      var m = mapLabels[i];
      if (m.minProgress && progress < m.minProgress) continue;
      var nDrift = FXCore.noise2D(m.x * 0.006 + time * 0.0002, m.y * 0.006 + i * 6) * 0.25;
      m.y -= m.speed * 0.3 + nDrift * 0.1;
      m.x += m.drift * 0.2 + nDrift;
      m.rotation += m.rotSpeed;
      if (m.y < H * 0.5) { m.y = H * 0.88; m.x = rand(W * 0.1, W * 0.9); }
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.rotation);
      ctx.globalAlpha = m.opacity * (0.4 + progress * 0.6) * brightness;
      ctx.font = m.size + 'px "Fredoka One",cursive';
      ctx.fillStyle = '#2a5a8a';
      ctx.fillText(m.text, 0, 0);
      ctx.restore();
    }
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
      drawSky();
      drawHorizon();
      drawLandscape();
      drawFieldNoise();
      drawClouds();
      drawBirds();
      drawBalloonEnvelope();
      drawBasket();
      drawMapLabels();
      drawAerialGlow();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('continents', scene);

  window.ClassmatesContinentsScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('continents')) return;
      var s = FXCore.getSize();
      var count = 8 + Math.floor(progress * 8);
      FXCore.emit(s.w * 0.5, s.h * 0.45, 10, {
        spread: 5, rise: 2, decay: 0.02, size: 3,
        color: 'rgba(37,99,235,0.8)', shape: 'star', endColor: 'rgba(200,220,255,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.45, 5, {
        spread: 3, rise: 1.5, decay: 0.025, size: 2,
        color: 'rgba(22,163,74,0.6)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.45, count, {
        spread: 6, rise: 2.5, decay: 0.015, size: 3,
        color: 'rgba(0,200,180,0.7)', shape: 'diamond', endColor: 'rgba(0,150,130,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.45, count, {
        spread: 4, rise: 2, decay: 0.02, size: 2.5,
        color: 'rgba(180,220,255,0.5)'
      });
      if (window.FXSound) FXSound.play('correct');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('continents')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 2, rise: -0.1, gravity: 0.02, decay: 0.015, size: 2,
        color: 'rgba(100,100,120,0.4)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.5, 3, {
        spread: 2.5, rise: -0.15, gravity: 0.025, decay: 0.018, size: 2,
        color: 'rgba(20,40,80,0.4)'
      });
      if(FXCore.shake) FXCore.shake(3, 150);
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('continents')) return;
      var s = FXCore.getSize();
      var colors = ['rgba(220,38,38,0.7)','rgba(234,179,8,0.7)','rgba(37,99,235,0.7)','rgba(22,163,74,0.7)','rgba(234,88,12,0.7)'];
      for (var i = 0; i < colors.length; i++) {
        FXCore.emit(s.w * (0.2 + i * 0.15), s.h * 0.35, 5, {
          spread: 7, rise: 3, decay: 0.01, size: 4, color: colors[i], shape: 'star'
        });
      }
      // 8 burst points in ocean colours
      var oceanColors = ['rgba(0,200,180,0.8)','rgba(0,150,220,0.8)','rgba(0,180,160,0.7)','rgba(30,120,200,0.8)','rgba(0,220,200,0.7)','rgba(20,100,180,0.8)','rgba(0,170,190,0.7)','rgba(40,140,210,0.8)'];
      for (var i = 0; i < 8; i++) {
        var angle = (i / 8) * Math.PI * 2;
        var ex = s.w * 0.5 + Math.cos(angle) * s.w * 0.2;
        var ey = s.h * 0.4 + Math.sin(angle) * s.h * 0.15;
        FXCore.emit(ex, ey, 8, {
          spread: 7, rise: 2.5, decay: 0.009, size: 3.5,
          color: oceanColors[i], shape: 'diamond'
        });
      }
      // Central golden burst
      FXCore.emit(s.w * 0.5, s.h * 0.4, 18, {
        spread: 10, rise: 4, decay: 0.007, size: 5,
        color: 'rgba(255,220,80,0.9)', shape: 'star', endColor: 'rgba(255,180,0,0)'
      });
      if (window.FXSound) FXSound.playSequence(['correct','streak','complete'], 100);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
