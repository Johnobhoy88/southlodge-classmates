(function(){
  // ============================================================
  // MONEY — "Treasure Cove"
  // A pirate's hidden cove at night. Moonlight on dark water,
  // treasure chest on sand, ship silhouette, palm trees sway.
  // ADVENTURE and TREASURE — exciting moonlit discovery.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.5;
  var time = 0;

  var stars = [];
  var coinSparkles = [];
  var waveFoam = [];
  var palms = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

  var W = 0, H = 0, ctx = null;

  function generateScene() {
    stars = [];
    for (var i = 0; i < 45; i++) {
      stars.push({ x: rand(0, W), y: rand(0, H * 0.35), size: rand(0.5, 2.5), twinkle: rand(0, Math.PI * 2), speed: rand(1, 3) });
    }

    coinSparkles = [];
    for (var i = 0; i < 15; i++) {
      coinSparkles.push({
        x: rand(W * 0.35, W * 0.65), y: rand(H * 0.68, H * 0.78),
        size: rand(1, 2.5), phase: rand(0, Math.PI * 2), speed: rand(2, 5),
        minProgress: i < 6 ? 0 : (i < 11 ? 0.3 : 0.6)
      });
    }

    palms = [
      { x: W * 0.08, baseY: H * 0.55, trunkH: 80, fronds: 5, sway: 0.4, phase: 0 },
      { x: W * 0.92, baseY: H * 0.52, trunkH: 90, fronds: 6, sway: 0.35, phase: 1.5 },
      { x: W * 0.18, baseY: H * 0.6, trunkH: 55, fronds: 4, sway: 0.5, phase: 3 }
    ];

    waveFoam = [];
    for (var x = 0; x <= W; x += 6) {
      waveFoam.push({ x: x, baseY: H * 0.62 });
    }
  }

  // ==================== DRAWING ====================

  function drawSky() {
    var b = brightness;
    var grad = ctx.createLinearGradient(0, 0, 0, H * 0.45);
    grad.addColorStop(0, 'hsl(230,' + Math.round(40 + progress * 10) + '%,' + Math.round(8 * b) + '%)');
    grad.addColorStop(0.5, 'hsl(220,' + Math.round(35 + progress * 10) + '%,' + Math.round(12 * b) + '%)');
    grad.addColorStop(1, 'hsl(210,' + Math.round(30 + progress * 8) + '%,' + Math.round(18 * b) + '%)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawMoon() {
    var mx = W * 0.75, my = H * 0.1, mr = 22;
    ctx.globalAlpha = (0.6 + progress * 0.3) * brightness;
    // Glow
    var mg = ctx.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 4);
    mg.addColorStop(0, 'rgba(255,250,220,0.15)');
    mg.addColorStop(0.5, 'rgba(200,220,255,0.04)');
    mg.addColorStop(1, 'rgba(200,220,255,0)');
    ctx.fillStyle = mg;
    ctx.beginPath(); ctx.arc(mx, my, mr * 4, 0, Math.PI * 2); ctx.fill();
    // Crescent
    ctx.fillStyle = '#fff8e0';
    ctx.beginPath(); ctx.arc(mx, my, mr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'hsl(230,' + Math.round(40) + '%,' + Math.round(8 * brightness) + '%)';
    ctx.beginPath(); ctx.arc(mx + 8, my - 3, mr * 0.85, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawStars() {
    var t = time * 0.001;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var twink = 0.3 + Math.sin(t * s.speed + s.twinkle) * 0.4 + 0.3;
      ctx.globalAlpha = twink * brightness * 0.8;
      ctx.fillStyle = '#e8eeff';
      ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawOcean() {
    var t = time * 0.001;
    // Ocean surface
    var og = ctx.createLinearGradient(0, H * 0.4, 0, H * 0.65);
    og.addColorStop(0, 'hsl(210,' + Math.round(30 + progress * 10) + '%,' + Math.round(12 * brightness) + '%)');
    og.addColorStop(1, 'hsl(200,' + Math.round(25 + progress * 8) + '%,' + Math.round(16 * brightness) + '%)');
    ctx.fillStyle = og;
    ctx.fillRect(0, H * 0.4, W, H * 0.25);

    // Moonlight reflection path on water
    var mx = W * 0.75;
    ctx.globalAlpha = (0.05 + progress * 0.08) * brightness;
    for (var i = 0; i < 8; i++) {
      var ry = H * 0.42 + i * 12;
      var rw = 30 - i * 2 + Math.sin(t * 1.5 + i) * 5;
      ctx.fillStyle = 'rgba(255,250,220,0.3)';
      ctx.beginPath();
      ctx.ellipse(mx + Math.sin(t * 0.5 + i * 0.8) * 5, ry, rw, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawShip() {
    var sx = W * 0.65, sy = H * 0.38;
    var t = time * 0.001;
    var bob = Math.sin(t * 0.8) * 3;
    ctx.globalAlpha = (0.2 + progress * 0.2) * brightness;
    ctx.fillStyle = '#0a0a18';
    ctx.save();
    ctx.translate(sx, sy + bob);
    // Hull
    ctx.beginPath();
    ctx.moveTo(-25, 5);
    ctx.quadraticCurveTo(-20, 15, 0, 15);
    ctx.quadraticCurveTo(20, 15, 30, 5);
    ctx.lineTo(25, -2);
    ctx.lineTo(-20, -2);
    ctx.closePath();
    ctx.fill();
    // Mast
    ctx.fillRect(-2, -50, 3, 52);
    // Sail
    ctx.fillStyle = '#12121e';
    ctx.beginPath();
    ctx.moveTo(0, -48);
    ctx.quadraticCurveTo(18 + Math.sin(t * 0.5) * 3, -30, 0, -10);
    ctx.fill();
    // Rigging
    ctx.strokeStyle = '#1a1a2a';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(0, -48); ctx.lineTo(-22, -2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -48); ctx.lineTo(25, -2); ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawCliffs() {
    ctx.globalAlpha = 0.4 * brightness;
    ctx.fillStyle = 'hsl(220,10%,' + Math.round(10 * brightness) + '%)';
    // Left cliff
    ctx.beginPath();
    ctx.moveTo(0, H * 0.3);
    ctx.quadraticCurveTo(W * 0.05, H * 0.35, W * 0.08, H * 0.5);
    ctx.lineTo(W * 0.03, H * 0.65);
    ctx.lineTo(0, H * 0.65);
    ctx.closePath();
    ctx.fill();
    // Right cliff
    ctx.beginPath();
    ctx.moveTo(W, H * 0.28);
    ctx.quadraticCurveTo(W * 0.95, H * 0.33, W * 0.92, H * 0.48);
    ctx.lineTo(W * 0.97, H * 0.65);
    ctx.lineTo(W, H * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawBeach() {
    var t = time * 0.001;
    var bg = ctx.createLinearGradient(0, H * 0.62, 0, H);
    bg.addColorStop(0, 'hsl(40,' + Math.round(40 + progress * 10) + '%,' + Math.round(35 * brightness) + '%)');
    bg.addColorStop(0.4, 'hsl(35,' + Math.round(35 + progress * 8) + '%,' + Math.round(30 * brightness) + '%)');
    bg.addColorStop(1, 'hsl(30,' + Math.round(30) + '%,' + Math.round(24 * brightness) + '%)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, H * 0.62, W, H * 0.38);

    // Wave foam line
    ctx.globalAlpha = (0.2 + progress * 0.15) * brightness;
    ctx.strokeStyle = 'rgba(200,230,255,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (var i = 0; i < waveFoam.length; i++) {
      var wf = waveFoam[i];
      var fy = wf.baseY + Math.sin(wf.x * 0.02 + t * 1.5) * 3 + Math.sin(t * 0.8) * 4;
      if (i === 0) ctx.moveTo(wf.x, fy); else ctx.lineTo(wf.x, fy);
    }
    ctx.stroke();
    // Second foam line
    ctx.globalAlpha = (0.1 + progress * 0.08) * brightness;
    ctx.beginPath();
    for (var i = 0; i < waveFoam.length; i++) {
      var wf = waveFoam[i];
      var fy = wf.baseY + 6 + Math.sin(wf.x * 0.018 + t * 1.2 + 1) * 2;
      if (i === 0) ctx.moveTo(wf.x, fy); else ctx.lineTo(wf.x, fy);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawTreasureChest() {
    var cx = W * 0.5, cy = H * 0.72;
    var t = time * 0.001;
    var glowInt = 0.4 + progress * 0.5 + Math.sin(t * 1.5) * 0.1;
    ctx.globalAlpha = (0.5 + progress * 0.35) * brightness;

    // Treasure glow
    ctx.globalAlpha = glowInt * 0.1 * brightness;
    var tg = ctx.createRadialGradient(cx, cy - 5, 5, cx, cy, 50);
    tg.addColorStop(0, 'rgba(255,200,50,0.4)');
    tg.addColorStop(1, 'rgba(255,180,30,0)');
    ctx.fillStyle = tg;
    ctx.beginPath(); ctx.arc(cx, cy - 5, 50, 0, Math.PI * 2); ctx.fill();

    ctx.globalAlpha = (0.5 + progress * 0.35) * brightness;
    // Chest body
    ctx.fillStyle = '#5a3015';
    ctx.fillRect(cx - 18, cy, 36, 20);
    // Chest lid (open, angled back)
    ctx.fillStyle = '#6a3a1a';
    ctx.beginPath();
    ctx.moveTo(cx - 18, cy);
    ctx.lineTo(cx - 15, cy - 14);
    ctx.lineTo(cx + 15, cy - 14);
    ctx.lineTo(cx + 18, cy);
    ctx.closePath();
    ctx.fill();
    // Lid curve
    ctx.beginPath();
    ctx.moveTo(cx - 15, cy - 14);
    ctx.quadraticCurveTo(cx, cy - 20, cx + 15, cy - 14);
    ctx.fill();
    // Gold band
    ctx.fillStyle = '#c9a040';
    ctx.fillRect(cx - 19, cy + 8, 38, 3);
    ctx.fillRect(cx - 16, cy - 10, 32, 2);
    // Lock
    ctx.fillStyle = '#a08030';
    ctx.fillRect(cx - 3, cy + 6, 6, 8);
    // Gold coins visible inside
    ctx.fillStyle = '#ffd700';
    for (var i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse(cx - 8 + i * 4, cy - 4 + Math.sin(i) * 2, 3, 2, rand(-0.2, 0.2), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawRowboat() {
    var rx = W * 0.3, ry = H * 0.78;
    var t = time * 0.001;
    ctx.globalAlpha = (0.3 + progress * 0.2) * brightness;
    ctx.fillStyle = '#4a3020';
    // Hull
    ctx.beginPath();
    ctx.moveTo(rx - 20, ry);
    ctx.quadraticCurveTo(rx - 15, ry + 8, rx, ry + 8);
    ctx.quadraticCurveTo(rx + 15, ry + 8, rx + 22, ry);
    ctx.lineTo(rx + 18, ry - 3);
    ctx.lineTo(rx - 16, ry - 3);
    ctx.closePath();
    ctx.fill();
    // Oar
    ctx.strokeStyle = '#5a4030';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(rx - 5, ry - 2);
    ctx.lineTo(rx - 25, ry - 12);
    ctx.stroke();

    // Lantern on bow
    var lanternGlow = 0.5 + Math.sin(t * 2) * 0.2 + progress * 0.3;
    ctx.globalAlpha = lanternGlow * 0.08 * brightness;
    var lg = ctx.createRadialGradient(rx + 15, ry - 5, 1, rx + 15, ry - 5, 25);
    lg.addColorStop(0, 'rgba(255,200,80,0.5)');
    lg.addColorStop(1, 'rgba(255,180,60,0)');
    ctx.fillStyle = lg;
    ctx.beginPath(); ctx.arc(rx + 15, ry - 5, 25, 0, Math.PI * 2); ctx.fill();
    // Lantern body
    ctx.globalAlpha = (0.4 + progress * 0.3) * brightness;
    ctx.fillStyle = '#ffcc40';
    ctx.fillRect(rx + 13, ry - 8, 4, 5);
    ctx.fillStyle = '#5a4530';
    ctx.fillRect(rx + 12, ry - 9, 6, 2);
    ctx.fillRect(rx + 12, ry - 3, 6, 2);
    ctx.globalAlpha = 1;
  }

  function drawPalms() {
    var t = time * 0.001;
    for (var i = 0; i < palms.length; i++) {
      var p = palms[i];
      var sway = Math.sin(t * p.sway + p.phase) * 4;
      ctx.globalAlpha = (0.4 + progress * 0.25) * brightness;

      // Trunk — curved
      ctx.strokeStyle = '#5a4030';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(p.x, p.baseY);
      ctx.quadraticCurveTo(p.x + sway * 2, p.baseY - p.trunkH * 0.5, p.x + sway * 3, p.baseY - p.trunkH);
      ctx.stroke();
      // Trunk highlight
      ctx.strokeStyle = '#7a5a40';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(p.x + 1, p.baseY);
      ctx.quadraticCurveTo(p.x + sway * 2 + 1, p.baseY - p.trunkH * 0.5, p.x + sway * 3 + 1, p.baseY - p.trunkH);
      ctx.stroke();

      // Fronds
      var topX = p.x + sway * 3, topY = p.baseY - p.trunkH;
      ctx.fillStyle = '#1a5a20';
      for (var f = 0; f < p.fronds; f++) {
        var fAngle = -1.2 + f * (2.4 / (p.fronds - 1));
        var fLen = 30 + Math.sin(f * 2) * 8;
        var fSway = Math.sin(t * 0.8 + f + p.phase) * 3;
        var fEndX = topX + Math.cos(fAngle) * fLen + fSway;
        var fEndY = topY + Math.sin(fAngle) * fLen * 0.6 + Math.abs(Math.cos(fAngle)) * 10;
        ctx.beginPath();
        ctx.moveTo(topX, topY);
        ctx.quadraticCurveTo(topX + Math.cos(fAngle) * fLen * 0.6 + fSway * 0.5, topY + Math.sin(fAngle) * fLen * 0.3, fEndX, fEndY);
        ctx.quadraticCurveTo(topX + Math.cos(fAngle) * fLen * 0.4 + fSway * 0.3, topY + Math.sin(fAngle) * fLen * 0.2 + 3, topX, topY);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawCoinSparkles() {
    var t = time * 0.001;
    for (var i = 0; i < coinSparkles.length; i++) {
      var c = coinSparkles[i];
      if (progress < c.minProgress) continue;
      var sparkle = 0.2 + Math.sin(t * c.speed + c.phase) * 0.5 + 0.3;
      ctx.globalAlpha = sparkle * (0.3 + progress * 0.4) * brightness;
      ctx.fillStyle = '#ffd700';
      // Diamond sparkle
      var sz = c.size * sparkle;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y - sz);
      ctx.lineTo(c.x + sz * 0.4, c.y);
      ctx.lineTo(c.x, c.y + sz);
      ctx.lineTo(c.x - sz * 0.4, c.y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ==================== SCENE INTERFACE ====================
  var scene = {
    enter: function(canvas, context, w, h) {
      ctx = context; W = w; H = h;
      progress = 0; targetProgress = 0; brightness = 0.5;
      generateScene();
    },
    resize: function(w, h) { W = w; H = h; generateScene(); },
    update: function(dt, t) {
      time = t;
      progress += (targetProgress - progress) * 0.03;
      brightness += ((0.5 + progress * 0.5) - brightness) * 0.02;
    },
    draw: function() {
      drawSky();
      drawMoon();
      drawStars();
      drawOcean();
      drawShip();
      drawCliffs();
      drawBeach();
      drawTreasureChest();
      drawRowboat();
      drawPalms();
      drawCoinSparkles();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('money', scene);

  window.ClassmatesMoneyScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('money')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 10, {
        spread: 5, rise: 2, decay: 0.02, size: 3,
        color: 'rgba(255,215,0,0.9)', shape: 'diamond', endColor: 'rgba(255,240,150,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.5, 5, {
        spread: 3, rise: 1.5, decay: 0.025, size: 2,
        color: 'rgba(200,180,100,0.6)'
      });
      if (window.FXSound) FXSound.play('starCollect');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('money')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 2, rise: -0.2, gravity: 0.02, decay: 0.015, size: 2,
        color: 'rgba(80,60,40,0.4)'
      });
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('money')) return;
      var s = FXCore.getSize();
      // Gold coin shower
      for (var i = 0; i < 6; i++) {
        FXCore.emit(s.w * (0.2 + i * 0.12), s.h * 0.4, 5, {
          spread: 7, rise: 3, decay: 0.01, size: 3.5,
          color: 'rgba(255,215,0,0.8)', shape: 'diamond'
        });
      }
      if (window.FXSound) FXSound.playSequence(['starCollect','starCollect','complete'], 100);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
