(function(){
  // ============================================================
  // SENTENCES — "Mountain Railway"
  // A Highland railway winding through mountains. Words are
  // carriages coupled in order. Cool, fresh, expansive.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.55;
  var time = 0;

  var clouds = [];
  var mountains = [];
  var hills = [];
  var pines = [];
  var trackTies = [];
  var steamPuffs = [];
  var birds = [];
  var foregroundPines = [];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

  var W = 0, H = 0, ctx = null;

  function generateScene() {
    // Clouds
    clouds = [];
    for (var i = 0; i < 6; i++) {
      clouds.push({
        x: rand(-80, W + 80), y: rand(H * 0.04, H * 0.22),
        w: rand(70, 160), puffs: Math.floor(rand(3, 6)),
        speed: rand(0.08, 0.25), opacity: rand(0.4, 0.75)
      });
    }

    // Mountain peaks — jagged
    mountains = [];
    var mx = 0;
    while (mx < W + 40) {
      var peakH = rand(50, 100);
      var peakW = rand(40, 80);
      mountains.push({ x: mx, w: peakW, h: peakH, snowLine: peakH * rand(0.5, 0.7) });
      mx += peakW * rand(0.6, 0.9);
    }

    // Forested hills
    hills = [];
    for (var x = 0; x <= W + 20; x += 15) {
      hills.push({ x: x, y: H * 0.5 + Math.sin(x * 0.006 + 1) * H * 0.04 + Math.sin(x * 0.013) * H * 0.02 });
    }

    // Background pine rows on hills
    pines = [];
    for (var i = 0; i < 30; i++) {
      pines.push({
        x: rand(0, W), baseY: H * 0.48 + rand(0, H * 0.12),
        h: rand(10, 22), w: rand(6, 12)
      });
    }

    // Railway track ties
    trackTies = [];
    var trackY = H * 0.72;
    for (var x = 0; x < W + 20; x += 12) {
      var ty = trackY + Math.sin(x * 0.004 + 0.5) * 8;
      trackTies.push({ x: x, y: ty });
    }

    // Steam puffs
    steamPuffs = [];
    for (var i = 0; i < 5; i++) {
      steamPuffs.push({
        x: W * 0.3 + rand(-20, 20), y: H * 0.62 + rand(-10, 10),
        size: rand(8, 20), opacity: rand(0.15, 0.35),
        driftX: rand(0.1, 0.4), driftY: rand(-0.15, -0.05),
        phase: rand(0, Math.PI * 2)
      });
    }

    // Birds
    birds = [];
    for (var i = 0; i < 5; i++) {
      birds.push({
        x: rand(0, W), y: rand(H * 0.08, H * 0.25),
        speed: rand(0.3, 0.8), wingPhase: rand(0, Math.PI * 2),
        size: rand(3, 6)
      });
    }

    // Foreground pines — larger, more detailed
    foregroundPines = [];
    var fgPositions = [W * 0.05, W * 0.18, W * 0.78, W * 0.92, W * 0.55];
    for (var i = 0; i < fgPositions.length; i++) {
      foregroundPines.push({
        x: fgPositions[i], baseY: H * 0.68 + rand(-5, 10),
        h: rand(50, 85), w: rand(18, 30),
        layers: Math.floor(rand(4, 7)),
        sway: rand(0.3, 0.8)
      });
    }
  }

  // ==================== DRAWING ====================

  function drawSky() {
    var b = brightness;
    var clearness = 0.7 + progress * 0.3; // sky clears with progress
    var grad = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    grad.addColorStop(0, 'hsl(210,' + Math.round(25 + progress * 20) + '%,' + Math.round(55 * b * clearness) + '%)');
    grad.addColorStop(0.5, 'hsl(205,' + Math.round(20 + progress * 15) + '%,' + Math.round(65 * b * clearness) + '%)');
    grad.addColorStop(1, 'hsl(200,' + Math.round(15 + progress * 10) + '%,' + Math.round(75 * b) + '%)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawClouds() {
    var t = time * 0.001;
    for (var i = 0; i < clouds.length; i++) {
      var c = clouds[i];
      var cx = c.x + t * c.speed * 15;
      if (cx > W + c.w) cx -= W + c.w * 2;
      if (cx < -c.w) cx += W + c.w * 2;
      ctx.globalAlpha = c.opacity * brightness * (1 - progress * 0.3); // clouds thin with progress
      ctx.fillStyle = '#fff';
      var pw = c.w / c.puffs;
      for (var p = 0; p < c.puffs; p++) {
        ctx.beginPath();
        ctx.arc(cx + p * pw * 0.7, c.y + Math.sin(p * 1.5) * 5, pw * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawMountains() {
    var baseY = H * 0.42;
    for (var i = 0; i < mountains.length; i++) {
      var m = mountains[i];
      ctx.globalAlpha = 0.6 * brightness;
      // Mountain body
      ctx.fillStyle = 'hsl(215,15%,' + Math.round(35 * brightness) + '%)';
      ctx.beginPath();
      ctx.moveTo(m.x, baseY);
      ctx.lineTo(m.x + m.w * 0.5, baseY - m.h);
      ctx.lineTo(m.x + m.w, baseY);
      ctx.closePath();
      ctx.fill();
      // Snow cap
      ctx.fillStyle = 'rgba(240,245,255,' + (0.5 * brightness) + ')';
      ctx.beginPath();
      ctx.moveTo(m.x + m.w * 0.35, baseY - m.snowLine);
      ctx.lineTo(m.x + m.w * 0.5, baseY - m.h);
      ctx.lineTo(m.x + m.w * 0.65, baseY - m.snowLine);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawHills() {
    var hg = ctx.createLinearGradient(0, H * 0.45, 0, H * 0.65);
    hg.addColorStop(0, 'hsl(145,' + Math.round(30 + progress * 10) + '%,' + Math.round(22 * brightness) + '%)');
    hg.addColorStop(1, 'hsl(140,' + Math.round(25 + progress * 8) + '%,' + Math.round(18 * brightness) + '%)');
    ctx.fillStyle = hg;
    ctx.globalAlpha = 0.85 * brightness;
    ctx.beginPath();
    for (var i = 0; i < hills.length; i++) {
      if (i === 0) ctx.moveTo(hills[i].x, hills[i].y);
      else {
        var prev = hills[i - 1], cur = hills[i];
        ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + cur.x) / 2, (prev.y + cur.y) / 2);
      }
    }
    ctx.lineTo(W + 20, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawBackgroundPines() {
    ctx.globalAlpha = 0.3 * brightness;
    for (var i = 0; i < pines.length; i++) {
      var p = pines[i];
      ctx.fillStyle = 'hsl(150,25%,' + Math.round(15 * brightness) + '%)';
      // Simple triangle pine
      ctx.beginPath();
      ctx.moveTo(p.x, p.baseY);
      ctx.lineTo(p.x - p.w * 0.5, p.baseY);
      ctx.lineTo(p.x, p.baseY - p.h);
      ctx.lineTo(p.x + p.w * 0.5, p.baseY);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawGround() {
    var gg = ctx.createLinearGradient(0, H * 0.65, 0, H);
    gg.addColorStop(0, 'hsl(140,' + Math.round(30 + progress * 10) + '%,' + Math.round(22 * brightness) + '%)');
    gg.addColorStop(0.4, 'hsl(30,' + Math.round(20) + '%,' + Math.round(18 * brightness) + '%)');
    gg.addColorStop(1, 'hsl(25,' + Math.round(15) + '%,' + Math.round(14 * brightness) + '%)');
    ctx.fillStyle = gg;
    ctx.fillRect(0, H * 0.65, W, H * 0.35);
  }

  function drawTrack() {
    if (trackTies.length < 2) return;
    ctx.globalAlpha = (0.4 + progress * 0.2) * brightness;
    // Cross ties
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2;
    for (var i = 0; i < trackTies.length; i++) {
      var t = trackTies[i];
      ctx.beginPath();
      ctx.moveTo(t.x, t.y - 4);
      ctx.lineTo(t.x, t.y + 4);
      ctx.stroke();
    }
    // Rails
    ctx.strokeStyle = '#9e9e9e';
    ctx.lineWidth = 1.5;
    for (var rail = -3; rail <= 3; rail += 6) {
      ctx.beginPath();
      for (var i = 0; i < trackTies.length; i++) {
        var t = trackTies[i];
        if (i === 0) ctx.moveTo(t.x, t.y + rail);
        else ctx.lineTo(t.x, t.y + rail);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawStation() {
    var sx = W * 0.85, sy = H * 0.66;
    ctx.globalAlpha = (0.35 + progress * 0.25) * brightness;
    // Platform
    ctx.fillStyle = '#78909C';
    ctx.fillRect(sx - 25, sy, 50, 8);
    // Building
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(sx - 15, sy - 25, 30, 25);
    // Roof
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.moveTo(sx - 20, sy - 25);
    ctx.lineTo(sx, sy - 38);
    ctx.lineTo(sx + 20, sy - 25);
    ctx.closePath();
    ctx.fill();
    // Door
    ctx.fillStyle = '#4E342E';
    ctx.fillRect(sx - 4, sy - 15, 8, 15);
    ctx.globalAlpha = 1;
  }

  function drawSignal() {
    var sx = W * 0.7, sy = H * 0.58;
    ctx.globalAlpha = (0.35 + progress * 0.25) * brightness;
    // Pole
    ctx.strokeStyle = '#424242';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy + 20); ctx.stroke();
    // Light housing
    ctx.fillStyle = '#212121';
    ctx.fillRect(sx - 4, sy - 3, 8, 10);
    // Light — red at start, green with progress
    var green = progress > 0.5;
    ctx.fillStyle = green ? '#4caf50' : '#f44336';
    ctx.globalAlpha = (0.5 + Math.sin(time * 0.003) * 0.2) * brightness;
    ctx.beginPath();
    ctx.arc(sx, sy + 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawForegroundPines() {
    var t = time * 0.001;
    for (var i = 0; i < foregroundPines.length; i++) {
      var p = foregroundPines[i];
      var sway = Math.sin(t * p.sway + i) * 1.5;
      ctx.globalAlpha = (0.5 + progress * 0.25) * brightness;
      // Trunk
      ctx.fillStyle = '#4E342E';
      ctx.fillRect(p.x - 3, p.baseY - p.h * 0.3, 6, p.h * 0.35);
      // Layered branches
      for (var l = 0; l < p.layers; l++) {
        var ly = p.baseY - p.h * (0.25 + l * 0.15);
        var lw = p.w * (1 - l * 0.12);
        var lsway = sway * (l + 1) * 0.3;
        ctx.fillStyle = 'hsl(150,' + Math.round(30 + l * 5) + '%,' + Math.round((18 + l * 2) * brightness) + '%)';
        ctx.beginPath();
        ctx.moveTo(p.x + lsway, ly - 12 - l * 2);
        ctx.lineTo(p.x - lw * 0.5 + lsway, ly);
        ctx.lineTo(p.x + lw * 0.5 + lsway, ly);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawSteam() {
    var t = time * 0.001;
    for (var i = 0; i < steamPuffs.length; i++) {
      var s = steamPuffs[i];
      var sx = s.x + Math.sin(t * 0.5 + s.phase) * 10 + t * s.driftX * 20;
      var sy = s.y + t * s.driftY * 10 + Math.cos(t * 0.3 + s.phase) * 5;
      // Wrap
      if (sx > W + 30) sx -= W + 60;
      var puffSize = s.size * (0.5 + progress * 0.5);
      ctx.globalAlpha = s.opacity * (0.3 + progress * 0.5) * brightness;
      ctx.fillStyle = 'rgba(240,240,240,0.6)';
      ctx.beginPath();
      ctx.arc(sx, sy, puffSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + puffSize * 0.6, sy - puffSize * 0.3, puffSize * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawBirds() {
    var t = time * 0.001;
    ctx.strokeStyle = 'hsl(215,10%,' + Math.round(30 * brightness) + '%)';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    for (var i = 0; i < birds.length; i++) {
      var b = birds[i];
      var bx = (b.x + t * b.speed * 20) % (W + 60) - 30;
      var by = b.y + Math.sin(t * 0.6 + b.wingPhase) * 5;
      var wing = Math.sin(t * 3 + b.wingPhase) * b.size * 0.5;
      ctx.globalAlpha = 0.4 * brightness;
      ctx.beginPath();
      ctx.moveTo(bx - b.size, by - wing);
      ctx.quadraticCurveTo(bx, by, bx + b.size, by - wing);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // ==================== SCENE INTERFACE ====================
  var scene = {
    enter: function(canvas, context, w, h) {
      ctx = context; W = w; H = h;
      progress = 0; targetProgress = 0; brightness = 0.55;
      generateScene();
    },
    resize: function(w, h) { W = w; H = h; generateScene(); },
    update: function(dt, t) {
      time = t;
      progress += (targetProgress - progress) * 0.03;
      brightness += ((0.55 + progress * 0.45) - brightness) * 0.02;
    },
    draw: function() {
      drawSky();
      drawClouds();
      drawMountains();
      drawBackgroundPines();
      drawHills();
      drawGround();
      drawTrack();
      drawStation();
      drawSignal();
      drawSteam();
      drawForegroundPines();
      drawBirds();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('sentence', scene);

  window.ClassmatesSentenceScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('sentence')) return;
      var s = FXCore.getSize();
      // Steam burst — white puffs
      FXCore.emit(s.w * 0.5, s.h * 0.4, 8, {
        spread: 5, rise: 2, decay: 0.02, size: 4,
        color: 'rgba(220,230,240,0.8)', endColor: 'rgba(255,255,255,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.4, 5, {
        spread: 3, rise: 1.5, decay: 0.025, size: 2,
        color: 'rgba(76,175,80,0.7)', shape: 'star'
      });
      if (window.FXSound) FXSound.play('pop');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('sentence')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 2, rise: -0.2, gravity: 0.02, decay: 0.015, size: 2,
        color: 'rgba(100,100,120,0.4)'
      });
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('sentence')) return;
      var s = FXCore.getSize();
      // Full steam celebration
      for (var i = 0; i < 6; i++) {
        FXCore.emit(s.w * (0.2 + i * 0.12), s.h * 0.35, 4, {
          spread: 6, rise: 3, decay: 0.012, size: 5,
          color: 'rgba(220,230,240,0.7)', endColor: 'rgba(255,255,255,0)'
        });
      }
      if (window.FXSound) FXSound.playSequence(['pop','correct','complete'], 100);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
