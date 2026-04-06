(function(){
  // ============================================================
  // COMPASS — "Captain's Helm"
  // At the helm of a sailing ship. Open ocean, ship's wheel,
  // compass rose, billowing sail, seagulls. NAUTICAL, DIRECTIONAL.
  // The child is the CAPTAIN steering by compass.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.8;
  var time = 0;
  var wheelAngle = 0;

  var waves = [];
  var seagulls = [];
  var sprayDrops = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

  var W = 0, H = 0, ctx = null;

  function generateScene() {
    waves = [];
    for (var i = 0; i < 6; i++) {
      waves.push({
        y: H * (0.3 + i * 0.05), amplitude: rand(3, 8),
        freq: rand(0.008, 0.018), speed: rand(0.3, 0.8),
        phase: rand(0, Math.PI * 2), opacity: rand(0.04, 0.1)
      });
    }

    seagulls = [];
    for (var i = 0; i < 5; i++) {
      seagulls.push({
        x: rand(0, W), y: rand(H * 0.08, H * 0.25),
        speed: rand(0.3, 0.8), wingPhase: rand(0, Math.PI * 2),
        size: rand(4, 7)
      });
    }

    sprayDrops = [];
    for (var i = 0; i < 15; i++) {
      sprayDrops.push({
        x: rand(W * 0.35, W * 0.65), y: H * 0.42 + rand(-5, 5),
        size: rand(1, 3), speed: rand(0.3, 0.8),
        phase: rand(0, Math.PI * 2), life: rand(0, 1)
      });
    }
  }

  // ==================== DRAWING ====================

  function drawOcean() {
    var b = brightness;
    var og = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    og.addColorStop(0, 'hsl(210,' + Math.round(50 + progress * 15) + '%,' + Math.round(55 * b) + '%)');
    og.addColorStop(0.3, 'hsl(205,' + Math.round(55 + progress * 12) + '%,' + Math.round(50 * b) + '%)');
    og.addColorStop(0.7, 'hsl(200,' + Math.round(60 + progress * 10) + '%,' + Math.round(42 * b) + '%)');
    og.addColorStop(1, 'hsl(195,' + Math.round(50 + progress * 8) + '%,' + Math.round(35 * b) + '%)');
    ctx.fillStyle = og;
    ctx.fillRect(0, 0, W, H);
  }

  // Noise ocean texture — organic sea surface detail
  function drawOceanNoise() {
    var t = time * 0.001;
    var noiseAlpha = (0.025 + progress * 0.02) * brightness;
    ctx.globalAlpha = noiseAlpha;
    for (var nx = 0; nx < W; nx += 14) {
      for (var ny = 0; ny < H * 0.5; ny += 14) {
        var n = FXCore.noise2D(nx * 0.005 + t * 0.1, ny * 0.006 + t * 0.05);
        var depth = ny / (H * 0.5);
        var hue = 205 + n * 8;
        var l = 40 + n * 12 - depth * 8;
        ctx.fillStyle = 'hsl(' + Math.round(hue) + ',' + Math.round(50 + n * 8) + '%,' + Math.round(Math.max(20, l)) + '%)';
        ctx.fillRect(nx, ny, 14, 14);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawHorizon() {
    var hy = H * 0.28;
    ctx.globalAlpha = (0.2 + progress * 0.15) * brightness;
    // Faint land silhouette
    ctx.fillStyle = '#6a8a7a';
    ctx.beginPath();
    for (var x = 0; x <= W; x += 20) {
      var y = hy + Math.sin(x * 0.004 + 1) * 4 + Math.sin(x * 0.01) * 2;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.lineTo(W, hy + 8); ctx.lineTo(0, hy + 8); ctx.closePath();
    ctx.fill();
    // Horizon line
    ctx.strokeStyle = 'rgba(180,200,220,0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, hy); ctx.lineTo(W, hy); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawWaves() {
    var t = time * 0.001;
    for (var i = 0; i < waves.length; i++) {
      var w = waves[i];
      ctx.globalAlpha = w.opacity * (0.5 + progress * 0.5) * brightness;
      ctx.strokeStyle = 'rgba(180,220,255,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var x = 0; x <= W; x += 4) {
        var y = w.y + Math.sin(x * w.freq + t * w.speed + w.phase) * w.amplitude;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawDeck() {
    var dy = H * 0.5;
    ctx.globalAlpha = brightness;
    // Deck perspective — trapezoid shape narrowing toward horizon
    var dg = ctx.createLinearGradient(0, dy, 0, H);
    dg.addColorStop(0, '#8a6a40');
    dg.addColorStop(0.3, '#7a5a35');
    dg.addColorStop(1, '#6a4a28');
    ctx.fillStyle = dg;
    ctx.beginPath();
    ctx.moveTo(W * 0.2, dy);
    ctx.lineTo(W * 0.8, dy);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    // Plank lines
    ctx.strokeStyle = 'rgba(60,40,20,0.06)';
    ctx.lineWidth = 1;
    for (var i = 0; i < 10; i++) {
      var t = i / 9;
      var lx = W * (0.2 + t * 0.6);
      var bx = W * t;
      ctx.beginPath(); ctx.moveTo(lx, dy); ctx.lineTo(bx, H); ctx.stroke();
    }

    // Deck edge/railing
    ctx.strokeStyle = '#5a4020';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(W * 0.2, dy);
    ctx.lineTo(0, H * 0.85);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(W * 0.8, dy);
    ctx.lineTo(W, H * 0.85);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawCompassRose() {
    var cx = W * 0.5, cy = H * 0.58;
    var r = Math.min(W, H) * 0.08;
    var t = time * 0.001;
    var glowAmount = 0.2 + progress * 0.5;

    ctx.save();
    ctx.translate(cx, cy);

    // Glow
    ctx.globalAlpha = glowAmount * 0.1 * brightness;
    var rg = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 2);
    rg.addColorStop(0, 'rgba(255,215,0,0.3)');
    rg.addColorStop(1, 'rgba(255,215,0,0)');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.arc(0, 0, r * 2, 0, Math.PI * 2); ctx.fill();

    // Outer circle
    ctx.globalAlpha = (0.3 + progress * 0.35) * brightness;
    ctx.strokeStyle = '#c4a050';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();

    // Cardinal points
    var dirs = ['N','E','S','W'];
    for (var i = 0; i < 4; i++) {
      var angle = (i * Math.PI / 2) - Math.PI / 2;
      // Main spike
      ctx.fillStyle = i === 0 ? '#c44020' : '#3a3a38';
      ctx.globalAlpha = (0.35 + progress * 0.4) * brightness;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle - 0.2) * r * 0.3, Math.sin(angle - 0.2) * r * 0.3);
      ctx.lineTo(Math.cos(angle) * r * 0.85, Math.sin(angle) * r * 0.85);
      ctx.lineTo(Math.cos(angle + 0.2) * r * 0.3, Math.sin(angle + 0.2) * r * 0.3);
      ctx.closePath();
      ctx.fill();
      // Letter
      ctx.globalAlpha = (0.4 + progress * 0.4) * brightness;
      ctx.fillStyle = i === 0 ? '#c44020' : '#5a5a58';
      ctx.font = 'bold ' + Math.round(r * 0.35) + 'px "Fredoka One",cursive';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(dirs[i], Math.cos(angle) * r * 1.2, Math.sin(angle) * r * 1.2);
    }

    // Centre dot
    ctx.globalAlpha = (0.4 + progress * 0.3) * brightness;
    ctx.fillStyle = '#c4a050';
    ctx.beginPath(); ctx.arc(0, 0, r * 0.06, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawWheel() {
    var wx = W * 0.5, wy = H * 0.82;
    var wr = Math.min(W, H) * 0.12;
    var t = time * 0.001;
    wheelAngle += 0.003 * Math.sin(t * 0.5) * (0.3 + progress * 0.7);

    ctx.save();
    ctx.translate(wx, wy);
    ctx.rotate(wheelAngle);
    ctx.globalAlpha = (0.45 + progress * 0.35) * brightness;

    // Outer rim
    ctx.strokeStyle = '#5a3a18';
    ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(0, 0, wr, 0, Math.PI * 2); ctx.stroke();

    // Inner rim
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, wr * 0.35, 0, Math.PI * 2); ctx.stroke();

    // Spokes (8)
    ctx.lineWidth = 3;
    for (var i = 0; i < 8; i++) {
      var angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * wr * 0.35, Math.sin(angle) * wr * 0.35);
      ctx.lineTo(Math.cos(angle) * wr, Math.sin(angle) * wr);
      ctx.stroke();
    }

    // Handle pegs
    ctx.fillStyle = '#8a6a40';
    for (var i = 0; i < 8; i++) {
      var angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(Math.cos(angle) * (wr + 6), Math.sin(angle) * (wr + 6), 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Centre hub
    ctx.fillStyle = '#4a2a10';
    ctx.beginPath(); ctx.arc(0, 0, wr * 0.08, 0, Math.PI * 2); ctx.fill();
    // Brass ring
    ctx.strokeStyle = '#c4a050';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0, 0, wr * 0.12, 0, Math.PI * 2); ctx.stroke();

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawMastAndSail() {
    var t = time * 0.001;
    var mx = W * 0.5, my = H * 0.48;
    var sailFill = 0.4 + progress * 0.6;
    ctx.globalAlpha = (0.35 + progress * 0.3) * brightness;

    // Mast
    ctx.fillStyle = '#5a4020';
    ctx.fillRect(mx - 3, 0, 6, my + 5);

    // Rigging lines
    ctx.strokeStyle = '#6a5a40';
    ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(mx, 0); ctx.lineTo(W * 0.15, my); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx, 0); ctx.lineTo(W * 0.85, my); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx, H * 0.15); ctx.lineTo(W * 0.25, my); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx, H * 0.15); ctx.lineTo(W * 0.75, my); ctx.stroke();

    // Sail — billowing canvas
    ctx.fillStyle = '#f0ece0';
    var bulge = Math.sin(t * 0.8) * 5 + sailFill * 15;
    ctx.beginPath();
    ctx.moveTo(mx + 4, H * 0.05);
    ctx.quadraticCurveTo(mx + 30 + bulge, H * 0.15, mx + 25 + bulge * 0.8, H * 0.3);
    ctx.lineTo(mx + 4, H * 0.35);
    ctx.closePath();
    ctx.fill();
    // Sail shadow
    ctx.fillStyle = 'rgba(0,0,0,0.03)';
    ctx.beginPath();
    ctx.moveTo(mx + 4, H * 0.2);
    ctx.quadraticCurveTo(mx + 20 + bulge * 0.5, H * 0.25, mx + 18 + bulge * 0.6, H * 0.32);
    ctx.lineTo(mx + 4, H * 0.35);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
  }

  function drawSeagulls() {
    var t = time * 0.001;
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    for (var i = 0; i < seagulls.length; i++) {
      var s = seagulls[i];
      var sx = (s.x + t * s.speed * 20) % (W + 40) - 20;
      var sy = s.y + Math.sin(t * 0.6 + s.wingPhase) * 5;
      var wing = Math.sin(t * 2.5 + s.wingPhase) * s.size * 0.5;
      ctx.globalAlpha = (0.4 + progress * 0.3) * brightness;
      ctx.beginPath();
      ctx.moveTo(sx - s.size, sy - wing);
      ctx.quadraticCurveTo(sx, sy, sx + s.size, sy - wing);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawSpray() {
    var t = time * 0.001;
    var sprayStrength = 0.3 + progress * 0.5;
    for (var i = 0; i < sprayDrops.length; i++) {
      var s = sprayDrops[i];
      s.life -= 0.01;
      var nWind = FXCore.noise2D(s.x * 0.006 + t * 0.25, s.y * 0.006 + i * 6) * 0.4;
      s.y -= s.speed * 0.3;
      s.x += Math.sin(t * 2 + s.phase) * 0.5 + nWind;
      if (s.life <= 0) {
        s.x = rand(W * 0.35, W * 0.65);
        s.y = H * 0.45 + rand(-5, 5);
        s.life = 1;
      }
      ctx.globalAlpha = s.life * sprayStrength * 0.2 * brightness;
      ctx.fillStyle = 'rgba(220,240,255,0.5)';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Screen-blend compass glow and ocean shimmer
  function drawNauticalGlow() {
    ctx.globalCompositeOperation = 'screen';

    // Compass rose brass glow
    var cx = W * 0.5, cy = H * 0.58;
    var glowR = Math.min(W, H) * 0.15;
    var glowAmount = 0.2 + progress * 0.5;
    ctx.globalAlpha = glowAmount * 0.05 * brightness;
    var cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
    cg.addColorStop(0, 'rgba(255,215,100,0.15)');
    cg.addColorStop(0.4, 'rgba(255,200,80,0.05)');
    cg.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.fillStyle = cg;
    ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);

    // Ocean horizon shimmer — light bloom along horizon
    ctx.globalAlpha = (0.03 + progress * 0.04) * brightness;
    var hg = ctx.createLinearGradient(0, H * 0.22, 0, H * 0.38);
    hg.addColorStop(0, 'rgba(200,230,255,0)');
    hg.addColorStop(0.4, 'rgba(200,230,255,0.06)');
    hg.addColorStop(1, 'rgba(200,230,255,0)');
    ctx.fillStyle = hg;
    ctx.fillRect(0, H * 0.22, W, H * 0.16);

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  // ==================== SCENE INTERFACE ====================
  var scene = {
    enter: function(canvas, context, w, h) {
      ctx = context; W = w; H = h;
      progress = 0; targetProgress = 0; brightness = 0.8;
      wheelAngle = 0;
      generateScene();
    },
    resize: function(w, h) { W = w; H = h; generateScene(); },
    update: function(dt, t) {
      time = t;
      progress += (targetProgress - progress) * 0.03;
      brightness += ((0.8 + progress * 0.2) - brightness) * 0.02;
    },
    draw: function() {
      drawOcean();
      drawOceanNoise();
      drawHorizon();
      drawWaves();
      drawSeagulls();
      drawMastAndSail();
      drawDeck();
      drawCompassRose();
      drawSpray();
      drawWheel();
      drawNauticalGlow();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('compass', scene);

  window.ClassmatesCompassScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('compass')) return;
      var s = FXCore.getSize();
      var count = 8 + Math.floor(progress * 8);
      FXCore.emit(s.w * 0.5, s.h * 0.5, 10, {
        spread: 5, rise: 2, decay: 0.02, size: 3,
        color: 'rgba(196,160,80,0.8)', shape: 'star', endColor: 'rgba(255,230,150,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.5, 5, {
        spread: 3, rise: 1.5, decay: 0.025, size: 2,
        color: 'rgba(180,220,255,0.6)'
      });
      // Nautical ocean burst — sea-foam teal
      FXCore.emit(s.w * 0.5, s.h * 0.48, count, {
        spread: 6, rise: 2.5, decay: 0.018, size: 2.5,
        color: 'rgba(100,200,220,0.7)', endColor: 'rgba(180,240,255,0)'
      });
      // Tiny brass sparkles
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 2, rise: 1, decay: 0.03, size: 1.5,
        color: 'rgba(255,230,150,0.9)', shape: 'star'
      });
      if (window.FXSound) FXSound.play('chime');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('compass')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.55, 4, {
        spread: 2, rise: -0.1, gravity: 0.02, decay: 0.015, size: 2,
        color: 'rgba(80,100,120,0.4)'
      });
      // Deeper ocean-dark burst
      FXCore.emit(s.w * 0.5, s.h * 0.55, 3, {
        spread: 1.5, rise: -0.2, gravity: 0.03, decay: 0.02, size: 1.8,
        color: 'rgba(40,60,90,0.5)'
      });
      if (FXCore.shake) FXCore.shake(3, 150);
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('compass')) return;
      var s = FXCore.getSize();
      for (var i = 0; i < 5; i++) {
        FXCore.emit(s.w * (0.2 + i * 0.15), s.h * 0.4, 6, {
          spread: 7, rise: 3, decay: 0.01, size: 4,
          color: i % 2 === 0 ? 'rgba(196,160,80,0.7)' : 'rgba(180,220,255,0.6)',
          shape: 'star'
        });
      }
      // Nautical themed celebration — 7 bursts across the ocean
      var nautColors = ['rgba(100,200,220,0.7)','rgba(180,220,255,0.6)','rgba(196,160,80,0.7)','rgba(90,180,200,0.7)','rgba(220,240,255,0.6)','rgba(138,106,64,0.7)','rgba(100,200,220,0.7)'];
      for (var j = 0; j < 7; j++) {
        FXCore.emit(s.w * (0.1 + j * 0.12), s.h * (0.25 + Math.sin(j) * 0.1), 5, {
          spread: 6, rise: 2.5, decay: 0.012, size: 3.5,
          color: nautColors[j], shape: j % 2 === 0 ? 'star' : 'circle'
        });
      }
      // Central golden star burst
      FXCore.emit(s.w * 0.5, s.h * 0.45, 15, {
        spread: 8, rise: 3, decay: 0.008, size: 5,
        color: 'rgba(255,215,0,0.8)', shape: 'star', endColor: 'rgba(255,230,150,0)'
      });
      if (window.FXSound) FXSound.playSequence(['correct','streak','complete'], 100);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
