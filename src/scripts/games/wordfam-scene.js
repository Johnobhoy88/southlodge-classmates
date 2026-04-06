(function(){
  // ============================================================
  // WORD FAMILIES — "Root Garden"
  // A cultivated garden at golden hour. Word roots grow like plants
  // in raised beds, vines climb trellises, butterflies drift.
  // Structured and warm — the opposite of the wild meadow.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.75;
  var time = 0;

  var treeline = [];
  var trellises = [];
  var gardenBeds = [];
  var sprouts = [];
  var pots = [];
  var butterflies = [];
  var pollen = [];
  var stones = [];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

  var W = 0, H = 0, ctx = null;

  function generateScene() {
    // Distant treeline
    treeline = [];
    for (var x = 0; x <= W + 20; x += 25) {
      treeline.push({ x: x, h: rand(30, 55), w: rand(18, 30) });
    }

    // Trellises — wooden lattice frames
    trellises = [
      { x: W * 0.08, y: H * 0.35, w: 50, h: 120, vines: Math.floor(rand(3, 6)) },
      { x: W * 0.88, y: H * 0.3, w: 45, h: 130, vines: Math.floor(rand(3, 6)) }
    ];

    // Garden beds — raised rectangles
    gardenBeds = [
      { x: W * 0.2, y: H * 0.68, w: W * 0.2, h: 18, sproutCount: 5 },
      { x: W * 0.5, y: H * 0.72, w: W * 0.22, h: 18, sproutCount: 6 },
      { x: W * 0.3, y: H * 0.78, w: W * 0.18, h: 16, sproutCount: 4 }
    ];

    // Sprouts in beds
    sprouts = [];
    for (var b = 0; b < gardenBeds.length; b++) {
      var bed = gardenBeds[b];
      for (var s = 0; s < bed.sproutCount; s++) {
        sprouts.push({
          x: bed.x + 8 + s * (bed.w / bed.sproutCount),
          baseY: bed.y - 2,
          maxH: rand(12, 35),
          phase: rand(0, Math.PI * 2),
          swaySpeed: rand(0.8, 1.5),
          leaves: Math.floor(rand(1, 4)),
          color: pick(['#22c55e','#16a34a','#15803d','#4ade80']),
          minProgress: s < 3 ? 0 : (s < 5 ? 0.3 : 0.6)
        });
      }
    }

    // Terracotta pots
    pots = [];
    var potPositions = [W * 0.15, W * 0.38, W * 0.62, W * 0.82, W * 0.95];
    for (var i = 0; i < potPositions.length; i++) {
      pots.push({
        x: potPositions[i],
        y: H * 0.82 + rand(-5, 5),
        w: rand(14, 22),
        h: rand(16, 24),
        plantH: rand(8, 25),
        hasFlower: Math.random() > 0.4,
        flowerColor: pick(['#f472b6','#fb923c','#facc15','#a78bfa','#f87171']),
        minProgress: i < 3 ? 0 : 0.4
      });
    }

    // Butterflies
    var bfColors = ['#f472b6','#fb923c','#facc15','#a78bfa','#38bdf8','#f87171'];
    butterflies = [];
    for (var i = 0; i < 8; i++) {
      butterflies.push({
        x: rand(W * 0.1, W * 0.9),
        y: rand(H * 0.3, H * 0.7),
        size: rand(4, 8),
        color: pick(bfColors),
        wingPhase: rand(0, Math.PI * 2),
        driftX: rand(-0.2, 0.2),
        driftY: rand(-0.1, 0.1),
        pathPhase: rand(0, Math.PI * 2),
        minProgress: i < 3 ? 0 : (i < 6 ? 0.25 : 0.5)
      });
    }

    // Golden pollen
    pollen = [];
    for (var i = 0; i < 25; i++) {
      pollen.push({
        x: rand(0, W), y: rand(H * 0.1, H * 0.8),
        size: rand(0.8, 2),
        speedX: rand(0.05, 0.15),
        speedY: rand(-0.05, 0.05),
        opacity: rand(0.08, 0.2),
        phase: rand(0, Math.PI * 2)
      });
    }

    // Stepping stones
    stones = [];
    for (var i = 0; i < 8; i++) {
      stones.push({
        x: W * 0.1 + i * W * 0.1 + rand(-10, 10),
        y: H * 0.88 + rand(-3, 3) + Math.sin(i * 0.8) * 8,
        w: rand(16, 26),
        h: rand(8, 14),
        angle: rand(-0.15, 0.15)
      });
    }
  }

  // ==================== DRAWING ====================

  function drawSky() {
    var b = brightness;
    var grad = ctx.createLinearGradient(0, 0, 0, H * 0.5);
    grad.addColorStop(0, 'hsl(210,' + Math.round(30 + progress * 10) + '%,' + Math.round(45 * b) + '%)');
    grad.addColorStop(0.4, 'hsl(35,' + Math.round(50 + progress * 15) + '%,' + Math.round(55 * b) + '%)');
    grad.addColorStop(0.8, 'hsl(30,' + Math.round(60 + progress * 10) + '%,' + Math.round(60 * b) + '%)');
    grad.addColorStop(1, 'hsl(25,' + Math.round(65 + progress * 10) + '%,' + Math.round(65 * b) + '%)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Golden hour glow
    var sunGlow = ctx.createRadialGradient(W * 0.7, H * 0.4, 0, W * 0.7, H * 0.4, W * 0.5);
    sunGlow.addColorStop(0, 'rgba(255,200,100,' + (0.08 + progress * 0.08) + ')');
    sunGlow.addColorStop(1, 'rgba(255,200,100,0)');
    ctx.fillStyle = sunGlow;
    ctx.fillRect(0, 0, W, H);
  }

  function drawTreeline() {
    ctx.globalAlpha = 0.3 * brightness;
    for (var i = 0; i < treeline.length; i++) {
      var t = treeline[i];
      ctx.fillStyle = 'hsl(140,20%,' + Math.round(15 * brightness) + '%)';
      // Rounded tree crown
      ctx.beginPath();
      ctx.arc(t.x, H * 0.42 - t.h * 0.3, t.w * 0.5, 0, Math.PI * 2);
      ctx.fill();
      // Trunk
      ctx.fillRect(t.x - 2, H * 0.42 - t.h * 0.1, 4, t.h * 0.2);
    }
    ctx.globalAlpha = 1;
  }

  function drawGround() {
    // Rich soil ground
    var gg = ctx.createLinearGradient(0, H * 0.65, 0, H);
    gg.addColorStop(0, 'hsl(30,' + Math.round(35 + progress * 10) + '%,' + Math.round(28 * brightness) + '%)');
    gg.addColorStop(0.3, 'hsl(25,' + Math.round(30 + progress * 8) + '%,' + Math.round(22 * brightness) + '%)');
    gg.addColorStop(1, 'hsl(20,' + Math.round(25) + '%,' + Math.round(16 * brightness) + '%)');
    ctx.fillStyle = gg;
    ctx.fillRect(0, H * 0.65, W, H * 0.35);

    // Grass strip at top of ground
    ctx.fillStyle = 'hsl(120,' + Math.round(35 + progress * 15) + '%,' + Math.round(25 * brightness) + '%)';
    ctx.fillRect(0, H * 0.65, W, 6);
  }

  // Noise ground texture — organic soil and grass detail
  function drawGroundNoise() {
    var t = time * 0.001;
    var noiseAlpha = (0.03 + progress * 0.02) * brightness;
    ctx.globalAlpha = noiseAlpha;
    var groundY = Math.floor(H * 0.65);
    for (var nx = 0; nx < W; nx += 14) {
      for (var ny = groundY; ny < H; ny += 14) {
        var n = FXCore.noise2D(nx * 0.007 + t * 0.06, ny * 0.007);
        var depth = (ny - groundY) / (H - groundY);
        var hue = 30 - depth * 10;
        var l = 18 + n * 10 - depth * 6;
        ctx.fillStyle = 'hsl(' + Math.round(hue) + ',35%,' + Math.round(Math.max(6, l)) + '%)';
        ctx.fillRect(nx, ny, 14, 14);
      }
    }
    ctx.globalAlpha = 1;
  }

  // Screen-blend golden hour glow
  function drawGoldenGlow() {
    var t = time * 0.001;
    ctx.globalCompositeOperation = 'screen';

    // Warm sunlight bloom from upper-right
    var sunR = Math.min(W, H) * (0.5 + progress * 0.2);
    ctx.globalAlpha = (0.06 + progress * 0.06) * brightness;
    var sg = ctx.createRadialGradient(W * 0.7, H * 0.3, 0, W * 0.7, H * 0.3, sunR);
    sg.addColorStop(0, 'rgba(255,200,100,0.2)');
    sg.addColorStop(0.4, 'rgba(255,180,80,0.06)');
    sg.addColorStop(1, 'rgba(255,180,80,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, H);

    // Subtle glow around flower pots
    for (var i = 0; i < pots.length; i++) {
      var p = pots[i];
      if (progress < p.minProgress || !p.hasFlower) continue;
      ctx.globalAlpha = (0.03 + progress * 0.03) * brightness;
      var pg = ctx.createRadialGradient(p.x, p.y - p.plantH, 0, p.x, p.y - p.plantH, 20);
      pg.addColorStop(0, 'rgba(255,220,100,0.15)');
      pg.addColorStop(1, 'rgba(255,220,100,0)');
      ctx.fillStyle = pg;
      ctx.fillRect(p.x - 20, p.y - p.plantH - 20, 40, 40);
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  function drawTrellises() {
    var t = time * 0.001;
    for (var i = 0; i < trellises.length; i++) {
      var tr = trellises[i];
      ctx.globalAlpha = (0.35 + progress * 0.2) * brightness;

      // Wooden frame
      ctx.strokeStyle = '#6b4423';
      ctx.lineWidth = 3;
      ctx.strokeRect(tr.x, tr.y, tr.w, tr.h);
      // Cross bars
      ctx.lineWidth = 1.5;
      for (var r = 1; r < 4; r++) {
        var ry = tr.y + r * (tr.h / 4);
        ctx.beginPath(); ctx.moveTo(tr.x, ry); ctx.lineTo(tr.x + tr.w, ry); ctx.stroke();
      }
      for (var c = 1; c < 3; c++) {
        var cx = tr.x + c * (tr.w / 3);
        ctx.beginPath(); ctx.moveTo(cx, tr.y); ctx.lineTo(cx, tr.y + tr.h); ctx.stroke();
      }

      // Climbing vines
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      for (var v = 0; v < tr.vines; v++) {
        var vx = tr.x + rand(5, tr.w - 5);
        var vineH = tr.h * (0.3 + progress * 0.5);
        ctx.globalAlpha = (0.3 + progress * 0.35) * brightness;
        ctx.beginPath();
        ctx.moveTo(vx, tr.y + tr.h);
        for (var seg = 0; seg < 5; seg++) {
          var sy = tr.y + tr.h - (vineH * seg / 5);
          var sx = vx + Math.sin(t * 0.5 + v + seg) * 6;
          ctx.lineTo(sx, sy);
        }
        ctx.stroke();

        // Vine flowers (appear with progress)
        if (progress > 0.4) {
          ctx.fillStyle = pick(['#f472b6','#facc15','#fb923c']);
          ctx.globalAlpha = (progress - 0.3) * brightness;
          ctx.beginPath();
          ctx.arc(vx + Math.sin(t * 0.3 + v) * 4, tr.y + tr.h - vineH * 0.7, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawGardenBeds() {
    for (var i = 0; i < gardenBeds.length; i++) {
      var bed = gardenBeds[i];
      ctx.globalAlpha = (0.5 + progress * 0.2) * brightness;
      // Wooden sides
      ctx.fillStyle = '#8B5E3C';
      ctx.fillRect(bed.x - 3, bed.y, bed.w + 6, bed.h);
      // Soil
      ctx.fillStyle = '#3E2723';
      ctx.fillRect(bed.x, bed.y + 2, bed.w, bed.h - 4);
      // Top highlight
      ctx.globalAlpha = 0.1 * brightness;
      ctx.fillStyle = '#8B5E3C';
      ctx.fillRect(bed.x, bed.y, bed.w, 2);
    }
    ctx.globalAlpha = 1;
  }

  function drawSprouts() {
    var t = time * 0.001;
    for (var i = 0; i < sprouts.length; i++) {
      var s = sprouts[i];
      if (progress < s.minProgress) continue;
      var growFactor = Math.min(1, (progress - s.minProgress) / 0.4 + 0.3);
      var h = s.maxH * growFactor;
      var sway = Math.sin(t * s.swaySpeed + s.phase) * 2;

      ctx.globalAlpha = (0.5 + progress * 0.35) * brightness;
      // Stem
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(s.x, s.baseY);
      ctx.quadraticCurveTo(s.x + sway * 0.5, s.baseY - h * 0.5, s.x + sway, s.baseY - h);
      ctx.stroke();

      // Leaves
      var tipX = s.x + sway, tipY = s.baseY - h;
      ctx.fillStyle = s.color;
      for (var l = 0; l < s.leaves; l++) {
        var ly = s.baseY - h * (0.4 + l * 0.25);
        var lx = s.x + sway * (0.4 + l * 0.2);
        var dir = l % 2 === 0 ? 1 : -1;
        ctx.beginPath();
        ctx.ellipse(lx + dir * 4, ly, 5 * growFactor, 2.5 * growFactor, dir * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawPots() {
    var t = time * 0.001;
    for (var i = 0; i < pots.length; i++) {
      var p = pots[i];
      if (progress < p.minProgress) continue;
      ctx.globalAlpha = (0.45 + progress * 0.3) * brightness;

      // Terracotta pot
      ctx.fillStyle = '#C2663A';
      ctx.beginPath();
      ctx.moveTo(p.x - p.w * 0.4, p.y);
      ctx.lineTo(p.x + p.w * 0.4, p.y);
      ctx.lineTo(p.x + p.w * 0.5, p.y + p.h);
      ctx.lineTo(p.x - p.w * 0.5, p.y + p.h);
      ctx.closePath();
      ctx.fill();
      // Rim
      ctx.fillStyle = '#D4845A';
      ctx.fillRect(p.x - p.w * 0.5, p.y - 3, p.w, 4);

      // Plant
      var plantGrow = Math.min(1, (progress - p.minProgress) / 0.3 + 0.4);
      var ph = p.plantH * plantGrow;
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 1.5;
      var sway = Math.sin(t * 1.2 + i) * 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.quadraticCurveTo(p.x + sway, p.y - ph * 0.5, p.x + sway, p.y - ph);
      ctx.stroke();

      // Flower on top
      if (p.hasFlower && progress > p.minProgress + 0.2) {
        ctx.fillStyle = p.flowerColor;
        ctx.globalAlpha = (progress - p.minProgress) * brightness;
        for (var petal = 0; petal < 5; petal++) {
          var angle = (petal / 5) * Math.PI * 2 + t * 0.3;
          ctx.beginPath();
          ctx.arc(p.x + sway + Math.cos(angle) * 3, p.y - ph + Math.sin(angle) * 3, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(p.x + sway, p.y - ph, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawStones() {
    for (var i = 0; i < stones.length; i++) {
      var s = stones[i];
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      ctx.globalAlpha = 0.3 * brightness;
      ctx.fillStyle = '#9ca3af';
      ctx.beginPath();
      ctx.ellipse(0, 0, s.w * 0.5, s.h * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Highlight
      ctx.globalAlpha = 0.08 * brightness;
      ctx.fillStyle = '#d1d5db';
      ctx.beginPath();
      ctx.ellipse(-2, -2, s.w * 0.3, s.h * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawButterflies() {
    var t = time * 0.001;
    for (var i = 0; i < butterflies.length; i++) {
      var bf = butterflies[i];
      if (progress < bf.minProgress) continue;
      var nDrift = FXCore.noise2D(bf.x * 0.008 + t * 0.25, bf.y * 0.008 + i * 8) * 0.4;
      bf.x += bf.driftX + Math.sin(t * 0.4 + bf.pathPhase) * 0.3 + nDrift;
      bf.y += bf.driftY + Math.cos(t * 0.5 + bf.pathPhase) * 0.2 + nDrift * 0.3;
      if (bf.x < -10) bf.x = W + 10;
      if (bf.x > W + 10) bf.x = -10;
      if (bf.y < H * 0.2) bf.y = H * 0.7;
      if (bf.y > H * 0.75) bf.y = H * 0.2;

      var wing = Math.sin(t * 6 + bf.wingPhase) * 0.7;
      ctx.save();
      ctx.translate(bf.x, bf.y);
      ctx.globalAlpha = (0.5 + progress * 0.4) * brightness;
      ctx.fillStyle = bf.color;
      // Left wing
      ctx.save(); ctx.scale(wing, 1);
      ctx.beginPath();
      ctx.ellipse(-bf.size * 0.4, -bf.size * 0.2, bf.size * 0.5, bf.size * 0.35, -0.3, 0, Math.PI * 2);
      ctx.fill(); ctx.restore();
      // Right wing
      ctx.save(); ctx.scale(-wing, 1);
      ctx.beginPath();
      ctx.ellipse(-bf.size * 0.4, -bf.size * 0.2, bf.size * 0.5, bf.size * 0.35, -0.3, 0, Math.PI * 2);
      ctx.fill(); ctx.restore();
      // Body
      ctx.fillStyle = '#44403c';
      ctx.beginPath();
      ctx.ellipse(0, 0, 1.2, bf.size * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawPollen() {
    var t = time * 0.001;
    for (var i = 0; i < pollen.length; i++) {
      var p = pollen[i];
      p.x += p.speedX + Math.sin(t * 0.3 + p.phase) * 0.1;
      p.y += p.speedY + Math.cos(t * 0.4 + p.phase) * 0.05;
      if (p.x > W + 5) p.x = -5;
      if (p.x < -5) p.x = W + 5;
      if (p.y < H * 0.05) p.y = H * 0.8;
      if (p.y > H * 0.85) p.y = H * 0.05;

      ctx.globalAlpha = p.opacity * (0.5 + progress * 0.5) * brightness;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawWateringCan() {
    var cx = W * 0.92, cy = H * 0.85;
    ctx.globalAlpha = 0.25 * brightness;
    ctx.fillStyle = '#71717a';
    // Body
    ctx.beginPath();
    ctx.ellipse(cx, cy, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Spout
    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + 10, cy - 3);
    ctx.lineTo(cx + 22, cy - 12);
    ctx.stroke();
    // Handle
    ctx.beginPath();
    ctx.arc(cx - 5, cy - 10, 8, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();
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
      drawTreeline();
      drawGround();
      drawGroundNoise();
      drawStones();
      drawTrellises();
      drawGardenBeds();
      drawSprouts();
      drawPots();
      drawPollen();
      drawButterflies();
      drawWateringCan();
      drawGoldenGlow();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('wordfam', scene);

  window.ClassmatesWordfamScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('wordfam')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.4, 10, {
        spread: 5, rise: 2, decay: 0.02, size: 3,
        color: 'rgba(34,197,94,0.8)', shape: 'star', endColor: 'rgba(250,204,21,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.4, 6, {
        spread: 3, rise: 1.5, decay: 0.025, size: 2,
        color: 'rgba(251,191,36,0.7)'
      });
      if (window.FXSound) FXSound.play('chime');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('wordfam')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 2, rise: -0.2, gravity: 0.02, decay: 0.015, size: 2,
        color: 'rgba(120,90,60,0.4)'
      });
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('wordfam')) return;
      var s = FXCore.getSize();
      var colors = ['rgba(34,197,94,0.7)','rgba(244,114,182,0.7)','rgba(251,191,36,0.7)','rgba(167,139,250,0.7)','rgba(56,189,248,0.7)'];
      for (var i = 0; i < colors.length; i++) {
        FXCore.emit(s.w * (0.15 + i * 0.175), s.h * 0.4, 5, {
          spread: 7, rise: 3, decay: 0.012, size: 4, color: colors[i], shape: 'star'
        });
      }
      if (window.FXSound) FXSound.playSequence(['chime','correct','complete'], 120);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
