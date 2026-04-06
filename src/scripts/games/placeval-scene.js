(function(){
  // ============================================================
  // PLACE VALUE — "Bamboo Mist"
  // A serene bamboo forest in morning mist. Three layers of
  // stalks (far/mid/near) mirror hundreds/tens/ones.
  // ZEN, CALM, LAYERED — the most peaceful scene.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.75;
  var time = 0;

  var farStalks = [];
  var midStalks = [];
  var nearStalks = [];
  var dragonflies = [];
  var fallingLeaves = [];
  var dewDrops = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

  var W = 0, H = 0, ctx = null;

  function generateScene() {
    // Far bamboo — many, thin, faint
    farStalks = [];
    for (var i = 0; i < 16; i++) {
      farStalks.push({
        x: rand(0, W), w: rand(2, 4),
        h: rand(H * 0.5, H * 0.8),
        sway: rand(0.2, 0.5), phase: rand(0, Math.PI * 2),
        segments: Math.floor(rand(5, 8))
      });
    }

    // Mid bamboo — fewer, thicker, clearer
    midStalks = [];
    for (var i = 0; i < 8; i++) {
      midStalks.push({
        x: rand(W * 0.05, W * 0.95), w: rand(4, 7),
        h: rand(H * 0.6, H * 0.9),
        sway: rand(0.3, 0.6), phase: rand(0, Math.PI * 2),
        segments: Math.floor(rand(6, 10)),
        leaves: Math.floor(rand(2, 5))
      });
    }

    // Near bamboo — few, tall, vivid, detailed
    nearStalks = [];
    var nearPositions = [W * 0.05, W * 0.25, W * 0.78, W * 0.95];
    for (var i = 0; i < nearPositions.length; i++) {
      nearStalks.push({
        x: nearPositions[i], w: rand(7, 12),
        h: rand(H * 0.85, H),
        sway: rand(0.4, 0.7), phase: rand(0, Math.PI * 2),
        segments: Math.floor(rand(8, 13)),
        leaves: Math.floor(rand(4, 8))
      });
    }

    // Dragonflies
    dragonflies = [];
    for (var i = 0; i < 6; i++) {
      dragonflies.push({
        x: rand(W * 0.15, W * 0.85), y: rand(H * 0.2, H * 0.6),
        size: rand(3, 6), wingPhase: rand(0, Math.PI * 2),
        driftX: rand(-0.2, 0.2), driftY: rand(-0.1, 0.1),
        pathPhase: rand(0, Math.PI * 2),
        color: ['#60d0d0','#80e0c0','#50c0e0','#a0d8a0','#70b8d8','#90e8b0'][i],
        minProgress: i < 3 ? 0 : (i < 5 ? 0.3 : 0.6)
      });
    }

    // Falling bamboo leaves
    fallingLeaves = [];
    for (var i = 0; i < 12; i++) {
      fallingLeaves.push({
        x: rand(0, W), y: rand(-H * 0.2, H),
        size: rand(4, 10), rotation: rand(0, Math.PI * 2),
        rotSpeed: rand(-0.02, 0.02),
        fallSpeed: rand(0.15, 0.4), drift: rand(-0.2, 0.2),
        opacity: rand(0.1, 0.25),
        color: ['#5a9e50','#4a8e40','#6aae60','#3a7e30'][Math.floor(rand(0, 4))]
      });
    }

    // Dew drops on near stalks
    dewDrops = [];
    for (var i = 0; i < nearStalks.length; i++) {
      var ns = nearStalks[i];
      for (var d = 0; d < 4; d++) {
        dewDrops.push({
          x: ns.x + rand(-ns.w * 0.3, ns.w * 0.3),
          y: rand(H * 0.2, H * 0.7),
          size: rand(1, 2.5), phase: rand(0, Math.PI * 2)
        });
      }
    }
  }

  // ==================== DRAWING ====================

  function drawSky() {
    var b = brightness;
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'hsl(25,' + Math.round(30 + progress * 15) + '%,' + Math.round(60 * b) + '%)');
    grad.addColorStop(0.25, 'hsl(35,' + Math.round(20 + progress * 10) + '%,' + Math.round(70 * b) + '%)');
    grad.addColorStop(0.5, 'hsl(160,' + Math.round(10 + progress * 8) + '%,' + Math.round(75 * b) + '%)');
    grad.addColorStop(1, 'hsl(140,' + Math.round(15 + progress * 10) + '%,' + Math.round(65 * b) + '%)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawBambooLayer(stalks, opacity, colorBase, detailLevel) {
    var t = time * 0.001;
    for (var i = 0; i < stalks.length; i++) {
      var s = stalks[i];
      var sway = Math.sin(t * s.sway + s.phase) * 3 * (detailLevel * 0.3 + 0.4);
      ctx.globalAlpha = opacity * brightness;

      // Draw stalk segments with nodes
      var segH = s.h / s.segments;
      var cx = s.x, cy = H;
      for (var seg = 0; seg < s.segments; seg++) {
        var ny = cy - segH;
        var nx = cx + sway * (seg / s.segments);
        // Segment
        ctx.fillStyle = colorBase;
        ctx.fillRect(nx - s.w * 0.5, ny, s.w, segH + 1);
        // Node ring (slightly darker band)
        if (seg > 0) {
          ctx.fillStyle = 'rgba(0,0,0,0.06)';
          ctx.fillRect(nx - s.w * 0.55, ny + segH - 2, s.w * 1.1, 3);
        }
        cx = nx;
        cy = ny;
      }

      // Leaves on mid and near stalks
      if (detailLevel >= 2 && s.leaves) {
        ctx.fillStyle = colorBase;
        for (var l = 0; l < s.leaves; l++) {
          var ly = H - s.h * (0.3 + l * 0.15);
          var lx = s.x + sway * ((H - ly) / s.h);
          var dir = l % 2 === 0 ? 1 : -1;
          var leafSway = Math.sin(t * 0.8 + l + s.phase) * 3;
          ctx.globalAlpha = opacity * 0.7 * brightness;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.quadraticCurveTo(lx + dir * (10 + leafSway), ly - 5, lx + dir * (18 + leafSway), ly + 2);
          ctx.quadraticCurveTo(lx + dir * (10 + leafSway), ly + 3, lx, ly);
          ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawMist(y, height, opacity) {
    var t = time * 0.001;
    var mistAlpha = opacity * (1 - progress * 0.6); // mist clears with progress
    if (mistAlpha < 0.01) return;
    ctx.globalAlpha = mistAlpha * brightness;
    var mg = ctx.createLinearGradient(0, y, 0, y + height);
    mg.addColorStop(0, 'rgba(230,240,235,0)');
    mg.addColorStop(0.3, 'rgba(230,240,235,0.5)');
    mg.addColorStop(0.7, 'rgba(230,240,235,0.4)');
    mg.addColorStop(1, 'rgba(230,240,235,0)');
    ctx.fillStyle = mg;
    ctx.fillRect(0, y, W, height);
    // Wispy drift
    for (var i = 0; i < 3; i++) {
      var wx = (t * 8 + i * W * 0.35) % (W + 100) - 50;
      ctx.globalAlpha = mistAlpha * 0.3 * brightness;
      ctx.fillStyle = 'rgba(240,248,242,0.3)';
      ctx.beginPath();
      ctx.ellipse(wx, y + height * 0.5 + Math.sin(t * 0.3 + i) * 8, 60, 15, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawGround() {
    var gy = H * 0.88;
    ctx.globalAlpha = brightness;
    var gg = ctx.createLinearGradient(0, gy, 0, H);
    gg.addColorStop(0, 'hsl(100,' + Math.round(15 + progress * 10) + '%,' + Math.round(35 * brightness) + '%)');
    gg.addColorStop(1, 'hsl(90,' + Math.round(10) + '%,' + Math.round(28 * brightness) + '%)');
    ctx.fillStyle = gg;
    ctx.fillRect(0, gy, W, H - gy);
    // Moss patches
    ctx.fillStyle = 'hsl(120,20%,' + Math.round(30 * brightness) + '%)';
    ctx.globalAlpha = 0.15 * brightness;
    for (var i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse(rand(0, W), gy + rand(2, H - gy - 2), rand(15, 35), rand(4, 8), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawLantern() {
    var lx = W * 0.55, ly = H * 0.78;
    var t = time * 0.001;
    var glowPulse = 0.6 + Math.sin(t * 1.2) * 0.15 + progress * 0.3;
    ctx.globalAlpha = (0.35 + progress * 0.3) * brightness;

    // Base
    ctx.fillStyle = '#8a8a80';
    ctx.fillRect(lx - 8, ly + 8, 16, 5);
    // Post
    ctx.fillRect(lx - 3, ly - 5, 6, 13);
    // Top cap
    ctx.fillStyle = '#7a7a70';
    ctx.beginPath();
    ctx.moveTo(lx - 10, ly - 5);
    ctx.lineTo(lx, ly - 14);
    ctx.lineTo(lx + 10, ly - 5);
    ctx.closePath();
    ctx.fill();
    // Chamber
    ctx.fillStyle = '#9a9a90';
    ctx.fillRect(lx - 6, ly - 5, 12, 10);
    // Inner glow
    ctx.globalAlpha = glowPulse * 0.4 * brightness;
    ctx.fillStyle = '#ffdd80';
    ctx.fillRect(lx - 4, ly - 3, 8, 6);
    // Glow radiance
    ctx.globalAlpha = glowPulse * 0.06 * brightness;
    var lg = ctx.createRadialGradient(lx, ly, 2, lx, ly, 35);
    lg.addColorStop(0, 'rgba(255,220,120,0.4)');
    lg.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(lx, ly, 35, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawDragonflies() {
    var t = time * 0.001;
    for (var i = 0; i < dragonflies.length; i++) {
      var d = dragonflies[i];
      if (progress < d.minProgress) continue;
      d.x += d.driftX + Math.sin(t * 0.5 + d.pathPhase) * 0.3;
      d.y += d.driftY + Math.cos(t * 0.7 + d.pathPhase) * 0.2;
      if (d.x < W * 0.05) d.x = W * 0.95;
      if (d.x > W * 0.95) d.x = W * 0.05;
      if (d.y < H * 0.1) d.y = H * 0.6;
      if (d.y > H * 0.65) d.y = H * 0.1;

      var wingFlap = Math.sin(t * 15 + d.wingPhase);
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.globalAlpha = (0.4 + progress * 0.4) * brightness;

      // Body
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, d.size * 0.3, d.size, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wings — iridescent blur
      ctx.globalAlpha = (0.2 + progress * 0.2) * brightness;
      ctx.fillStyle = 'rgba(200,240,255,0.4)';
      // Top wings
      ctx.beginPath();
      ctx.ellipse(-d.size * 0.2, -d.size * 0.3 * wingFlap, d.size * 0.8, d.size * 0.2, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(d.size * 0.2, -d.size * 0.3 * wingFlap, d.size * 0.8, d.size * 0.2, 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawFallingLeaves() {
    var t = time * 0.001;
    for (var i = 0; i < fallingLeaves.length; i++) {
      var l = fallingLeaves[i];
      l.y += l.fallSpeed * 0.4;
      l.x += l.drift * 0.3 + Math.sin(t * 0.5 + i) * 0.15;
      l.rotation += l.rotSpeed;
      if (l.y > H + l.size * 2) { l.y = -l.size * 2; l.x = rand(0, W); }
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rotation);
      ctx.globalAlpha = l.opacity * (0.5 + progress * 0.5) * brightness;
      ctx.fillStyle = l.color;
      // Leaf shape
      ctx.beginPath();
      ctx.moveTo(0, -l.size);
      ctx.quadraticCurveTo(l.size * 0.6, -l.size * 0.3, 0, l.size * 0.5);
      ctx.quadraticCurveTo(-l.size * 0.6, -l.size * 0.3, 0, -l.size);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawDewDrops() {
    var t = time * 0.001;
    for (var i = 0; i < dewDrops.length; i++) {
      var d = dewDrops[i];
      var sparkle = 0.3 + Math.sin(t * 3 + d.phase) * 0.4 + 0.3;
      ctx.globalAlpha = sparkle * (0.15 + progress * 0.25) * brightness;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size * sparkle, 0, Math.PI * 2);
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
      drawBambooLayer(farStalks, 0.15 + progress * 0.1, 'hsl(130,15%,' + Math.round(55 * brightness) + '%)', 1);
      drawMist(H * 0.25, H * 0.15, 0.3);
      drawBambooLayer(midStalks, 0.25 + progress * 0.15, 'hsl(125,25%,' + Math.round(40 * brightness) + '%)', 2);
      drawMist(H * 0.5, H * 0.12, 0.2);
      drawGround();
      drawLantern();
      drawBambooLayer(nearStalks, 0.4 + progress * 0.3, 'hsl(120,35%,' + Math.round(30 * brightness) + '%)', 3);
      drawDewDrops();
      drawDragonflies();
      drawFallingLeaves();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('placeval', scene);

  window.ClassmatesPlacevalScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('placeval')) return;
      var s = FXCore.getSize();
      var count = 8 + Math.floor(progress * 8);
      FXCore.emit(s.w * 0.5, s.h * 0.4, 10, {
        spread: 4, rise: 2, decay: 0.02, size: 2.5,
        color: 'rgba(100,200,100,0.7)', shape: 'circle', endColor: 'rgba(200,240,200,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.4, 5, {
        spread: 3, rise: 1.5, decay: 0.025, size: 2,
        color: 'rgba(255,255,255,0.5)'
      });
      // Bamboo leaf burst — green and teal
      FXCore.emit(s.w * 0.5, s.h * 0.42, count, {
        spread: 6, rise: 1.8, decay: 0.018, size: 2.5,
        color: 'rgba(90,180,120,0.7)', shape: 'circle', endColor: 'rgba(180,240,200,0)'
      });
      // Tiny dew-drop sparkles
      for (var i = 0; i < 4; i++) {
        FXCore.emit(s.w * (0.42 + i * 0.05), s.h * 0.38, 2, {
          spread: 2, rise: 1, decay: 0.03, size: 1.2,
          color: 'rgba(220,255,240,0.6)', shape: 'star'
        });
      }
      if (window.FXSound) FXSound.play('chime');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('placeval')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 2, rise: -0.1, gravity: 0.02, decay: 0.015, size: 2,
        color: 'rgba(80,100,80,0.4)'
      });
      // Darker mist-like burst
      FXCore.emit(s.w * 0.5, s.h * 0.48, 3, {
        spread: 3, rise: -0.2, gravity: 0.03, decay: 0.012, size: 2.5,
        color: 'rgba(50,70,50,0.5)'
      });
      if(FXCore.shake) FXCore.shake(3, 150);
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('placeval')) return;
      var s = FXCore.getSize();
      // 7 bamboo-forest themed bursts across the screen
      var bambooColors = [
        'rgba(100,200,100,0.8)','rgba(150,230,150,0.7)','rgba(80,180,120,0.8)',
        'rgba(200,255,200,0.7)','rgba(120,210,120,0.8)','rgba(160,240,180,0.7)',
        'rgba(100,220,160,0.7)'
      ];
      for (var i = 0; i < bambooColors.length; i++) {
        FXCore.emit(s.w * (0.1 + i * 0.115), s.h * (0.25 + (i % 2) * 0.1), 7, {
          spread: 7, rise: 3, decay: 0.009, size: 3.5, color: bambooColors[i], shape: 'circle'
        });
      }
      // Central golden lantern burst — lantern light radiating
      FXCore.emit(s.w * 0.5, s.h * 0.3, 15, {
        spread: 10, rise: 2, decay: 0.007, size: 5,
        color: 'rgba(255,220,120,0.9)', shape: 'star', endColor: 'rgba(255,255,200,0)'
      });
      if (window.FXSound) FXSound.playSequence(['chime','click','chime','click','complete'], 120);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
