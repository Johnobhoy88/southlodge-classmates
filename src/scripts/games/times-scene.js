(function(){
  // ============================================================
  // TIMES TABLES — "Lava Peak"
  // An active volcano at night. Crater glows, lava flows,
  // embers rise, lightning flashes. INTENSE and ENERGETIC.
  // The most dramatic scene — matches timed speed pressure.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.45;
  var time = 0;
  var lightningFlash = 0;
  var nextLightning = 8000;

  var smokeClouds = [];
  var lavaStreams = [];
  var embers = [];
  var ashParticles = [];
  var rocks = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

  var W = 0, H = 0, ctx = null;

  function generateScene() {
    // Smoke clouds above crater
    smokeClouds = [];
    for (var i = 0; i < 6; i++) {
      smokeClouds.push({
        x: W * 0.5 + rand(-W * 0.15, W * 0.15),
        y: rand(H * 0.02, H * 0.2),
        size: rand(30, 70), speed: rand(0.08, 0.2),
        drift: rand(-0.15, 0.15), phase: rand(0, Math.PI * 2),
        opacity: rand(0.15, 0.3)
      });
    }

    // Lava streams down mountainside — 3 rivers
    lavaStreams = [
      { startX: W * 0.48, startY: H * 0.3, endX: W * 0.35, endY: H * 0.7, width: 4, speed: 0.5 },
      { startX: W * 0.52, startY: H * 0.3, endX: W * 0.65, endY: H * 0.72, width: 3.5, speed: 0.6 },
      { startX: W * 0.5, startY: H * 0.3, endX: W * 0.5, endY: H * 0.75, width: 5, speed: 0.4 }
    ];

    // Rising embers
    embers = [];
    for (var i = 0; i < 25; i++) {
      embers.push({
        x: W * 0.5 + rand(-W * 0.1, W * 0.1),
        y: H * 0.3 + rand(-10, 20),
        speed: rand(0.4, 1.2), drift: rand(-0.3, 0.3),
        size: rand(1, 3), life: rand(0, 1),
        color: Math.random() > 0.5 ? '#ff6600' : '#ffaa00',
        minProgress: i < 10 ? 0 : (i < 18 ? 0.25 : 0.5)
      });
    }

    // Ash particles
    ashParticles = [];
    for (var i = 0; i < 20; i++) {
      ashParticles.push({
        x: rand(0, W), y: rand(0, H * 0.7),
        size: rand(0.5, 1.5), speedX: rand(-0.06, 0.06),
        speedY: rand(0.02, 0.08), opacity: rand(0.1, 0.25)
      });
    }

    // Rocky foreground
    rocks = [];
    for (var i = 0; i < 10; i++) {
      rocks.push({
        x: rand(0, W), y: H * 0.78 + rand(0, H * 0.15),
        w: rand(15, 40), h: rand(10, 25),
        angle: rand(-0.2, 0.2)
      });
    }
  }

  // ==================== DRAWING ====================

  function drawSky() {
    var b = brightness;
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'hsl(0,' + Math.round(10 + progress * 10) + '%,' + Math.round(5 * b) + '%)');
    grad.addColorStop(0.3, 'hsl(10,' + Math.round(12 + progress * 8) + '%,' + Math.round(8 * b) + '%)');
    grad.addColorStop(0.6, 'hsl(15,' + Math.round(15 + progress * 10) + '%,' + Math.round(12 * b) + '%)');
    grad.addColorStop(1, 'hsl(10,' + Math.round(10) + '%,' + Math.round(6 * b) + '%)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Lightning flash overlay
    if (lightningFlash > 0) {
      ctx.globalAlpha = lightningFlash * 0.15;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }

  function drawSmokeClouds() {
    var t = time * 0.001;
    for (var i = 0; i < smokeClouds.length; i++) {
      var c = smokeClouds[i];
      var cx = c.x + Math.sin(t * c.speed + c.phase) * 20 + c.drift * t * 5;
      var cy = c.y + Math.cos(t * c.speed * 0.5 + c.phase) * 8;
      // Wrap
      if (cx > W * 0.8) cx -= W * 0.6;
      if (cx < W * 0.2) cx += W * 0.6;

      ctx.globalAlpha = c.opacity * brightness;
      // Cloud lit from below — orange bottom, dark grey top
      var cg = ctx.createRadialGradient(cx, cy + c.size * 0.3, 0, cx, cy, c.size);
      cg.addColorStop(0, 'rgba(180,80,20,' + (0.2 + progress * 0.15) + ')');
      cg.addColorStop(0.5, 'rgba(60,50,45,' + (0.3 + progress * 0.1) + ')');
      cg.addColorStop(1, 'rgba(30,25,22,0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, c.size * (0.8 + progress * 0.2), 0, Math.PI * 2);
      ctx.fill();
      // Secondary puff
      ctx.beginPath();
      ctx.arc(cx + c.size * 0.4, cy - c.size * 0.2, c.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawMountain() {
    var peakX = W * 0.5, peakY = H * 0.28;
    ctx.globalAlpha = brightness;

    // Mountain silhouette
    var mg = ctx.createLinearGradient(0, peakY, 0, H * 0.8);
    mg.addColorStop(0, 'hsl(10,10%,' + Math.round(12 * brightness) + '%)');
    mg.addColorStop(1, 'hsl(5,8%,' + Math.round(8 * brightness) + '%)');
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.moveTo(W * 0.1, H * 0.8);
    ctx.lineTo(W * 0.3, H * 0.5);
    ctx.lineTo(W * 0.42, H * 0.35);
    ctx.lineTo(peakX, peakY);
    ctx.lineTo(W * 0.58, H * 0.35);
    ctx.lineTo(W * 0.7, H * 0.5);
    ctx.lineTo(W * 0.9, H * 0.8);
    ctx.closePath();
    ctx.fill();

    // Crater glow
    var craterIntensity = 0.4 + progress * 0.6;
    var hue = 20 - progress * 10; // orange → yellow-orange with progress
    var cg = ctx.createRadialGradient(peakX, peakY + 5, 3, peakX, peakY + 10, 50 + progress * 30);
    cg.addColorStop(0, 'hsla(' + hue + ',100%,' + Math.round(60 + progress * 20) + '%,' + (craterIntensity * 0.8) + ')');
    cg.addColorStop(0.3, 'hsla(' + (hue + 10) + ',90%,40%,' + (craterIntensity * 0.4) + ')');
    cg.addColorStop(0.7, 'hsla(' + (hue + 15) + ',80%,25%,' + (craterIntensity * 0.15) + ')');
    cg.addColorStop(1, 'hsla(0,0%,0%,0)');
    ctx.fillStyle = cg;
    ctx.fillRect(W * 0.3, peakY - 30, W * 0.4, H * 0.3);

    // Lava glow on mountain surface
    ctx.globalAlpha = (0.05 + progress * 0.1) * brightness;
    var lg = ctx.createRadialGradient(peakX, peakY + 20, 10, peakX, H * 0.55, W * 0.25);
    lg.addColorStop(0, 'rgba(255,100,0,0.3)');
    lg.addColorStop(1, 'rgba(255,50,0,0)');
    ctx.fillStyle = lg;
    ctx.fillRect(W * 0.2, peakY, W * 0.6, H * 0.5);
    ctx.globalAlpha = 1;
  }

  function drawLavaStreams() {
    var t = time * 0.001;
    for (var i = 0; i < lavaStreams.length; i++) {
      var l = lavaStreams[i];
      var flowWidth = l.width * (0.5 + progress * 0.8);
      var flowPulse = 0.7 + Math.sin(t * 2 + i * 2) * 0.2;

      ctx.globalAlpha = (0.4 + progress * 0.5) * brightness * flowPulse;
      // Outer glow
      ctx.strokeStyle = 'rgba(255,80,0,' + (0.3 * flowPulse) + ')';
      ctx.lineWidth = flowWidth * 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(l.startX, l.startY);
      var cpx = (l.startX + l.endX) / 2 + Math.sin(t * l.speed + i) * 8;
      var cpy = (l.startY + l.endY) / 2;
      ctx.quadraticCurveTo(cpx, cpy, l.endX, l.endY);
      ctx.stroke();

      // Inner bright lava
      ctx.strokeStyle = 'rgba(255,180,0,' + (0.5 + progress * 0.3) + ')';
      ctx.lineWidth = flowWidth;
      ctx.beginPath();
      ctx.moveTo(l.startX, l.startY);
      ctx.quadraticCurveTo(cpx, cpy, l.endX, l.endY);
      ctx.stroke();

      // Core white-hot line
      ctx.strokeStyle = 'rgba(255,240,150,' + (0.3 + progress * 0.3) + ')';
      ctx.lineWidth = flowWidth * 0.3;
      ctx.beginPath();
      ctx.moveTo(l.startX, l.startY);
      ctx.quadraticCurveTo(cpx, cpy, l.endX, l.endY);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawRocks() {
    ctx.globalAlpha = (0.5 + progress * 0.2) * brightness;
    for (var i = 0; i < rocks.length; i++) {
      var r = rocks[i];
      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.rotate(r.angle);
      ctx.fillStyle = 'hsl(10,8%,' + Math.round(10 * brightness) + '%)';
      ctx.beginPath();
      ctx.moveTo(-r.w / 2, r.h / 2);
      ctx.lineTo(-r.w / 2 + r.w * 0.2, -r.h / 2);
      ctx.lineTo(r.w / 2 - r.w * 0.15, -r.h / 2 + r.h * 0.2);
      ctx.lineTo(r.w / 2, r.h / 2);
      ctx.closePath();
      ctx.fill();
      // Highlight from lava glow
      ctx.globalAlpha = (0.03 + progress * 0.05) * brightness;
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(-r.w / 2, -r.h / 2, r.w, 2);
      ctx.restore();
    }
    // Ground
    ctx.globalAlpha = brightness;
    ctx.fillStyle = 'hsl(5,6%,' + Math.round(6 * brightness) + '%)';
    ctx.fillRect(0, H * 0.82, W, H * 0.18);
    ctx.globalAlpha = 1;
  }

  function drawEmbers() {
    var t = time * 0.001;
    for (var i = 0; i < embers.length; i++) {
      var e = embers[i];
      if (progress < e.minProgress) continue;
      e.y -= e.speed * 0.6;
      e.x += e.drift * 0.3 + Math.sin(t * 2 + i) * 0.3;
      e.life -= 0.004;
      if (e.life <= 0 || e.y < H * 0.02) {
        e.x = W * 0.5 + rand(-W * 0.08, W * 0.08);
        e.y = H * 0.28 + rand(-5, 15);
        e.life = 1;
      }
      ctx.globalAlpha = e.life * (0.5 + progress * 0.4) * brightness;
      ctx.fillStyle = e.color;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size * e.life, 0, Math.PI * 2);
      ctx.fill();
      // Tiny glow
      ctx.globalAlpha = e.life * 0.1 * brightness;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawAsh() {
    for (var i = 0; i < ashParticles.length; i++) {
      var a = ashParticles[i];
      a.x += a.speedX;
      a.y += a.speedY;
      if (a.x < 0) a.x = W; if (a.x > W) a.x = 0;
      if (a.y > H * 0.8) a.y = 0;
      ctx.globalAlpha = a.opacity * brightness;
      ctx.fillStyle = '#3a3530';
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function updateLightning(dt) {
    lightningFlash *= 0.9;
    nextLightning -= dt * 1000;
    if (progress > 0.3 && nextLightning <= 0) {
      lightningFlash = 1;
      nextLightning = rand(4000, 12000) * (1.5 - progress);
    }
  }

  // ==================== SCENE INTERFACE ====================
  var scene = {
    enter: function(canvas, context, w, h) {
      ctx = context; W = w; H = h;
      progress = 0; targetProgress = 0; brightness = 0.45;
      lightningFlash = 0; nextLightning = 6000;
      generateScene();
    },
    resize: function(w, h) { W = w; H = h; generateScene(); },
    update: function(dt, t) {
      time = t;
      progress += (targetProgress - progress) * 0.03;
      brightness += ((0.45 + progress * 0.55) - brightness) * 0.02;
      updateLightning(dt);
    },
    draw: function() {
      drawSky();
      drawSmokeClouds();
      drawMountain();
      drawLavaStreams();
      drawRocks();
      drawAsh();
      drawEmbers();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('times', scene);

  window.ClassmatesTimesScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('times')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.35, 12, {
        spread: 6, rise: 3, decay: 0.015, size: 3.5,
        color: 'rgba(255,140,0,0.9)', shape: 'star', endColor: 'rgba(255,200,50,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.35, 6, {
        spread: 4, rise: 2, decay: 0.02, size: 2.5,
        color: 'rgba(255,80,0,0.7)'
      });
      if (window.FXSound) FXSound.play('correct');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('times')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 5, {
        spread: 2, rise: -0.3, gravity: 0.04, decay: 0.012, size: 2,
        color: 'rgba(80,40,20,0.5)'
      });
      if (window.FXSound) FXSound.play('wrong');
    },
    onComplete: function() {
      targetProgress = 1;
      lightningFlash = 1;
      if (!window.FXCore || !FXCore.isActive('times')) return;
      var s = FXCore.getSize();
      // Massive eruption burst
      for (var wave = 0; wave < 3; wave++) {
        FXCore.emit(s.w * 0.5, s.h * 0.3, 15, {
          spread: 10 + wave * 3, rise: 4 + wave, decay: 0.008, size: 4,
          color: wave === 0 ? 'rgba(255,200,50,0.9)' : wave === 1 ? 'rgba(255,140,0,0.8)' : 'rgba(255,80,0,0.7)',
          shape: 'star'
        });
      }
      if (window.FXSound) FXSound.playSequence(['correct','correct','complete'], 80);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
