(function(){
  // ============================================================
  // DATA HANDLING — "Weather Station"
  // A Highland weather station on a hilltop. Instruments spin,
  // clouds drift, wind blows grass. SCIENTIFIC but OUTDOOR.
  // Data comes from measuring the natural world.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.6;
  var time = 0;
  var anemometerAngle = 0;
  var vaneAngle = 0;

  var clouds = [];
  var hills = [];
  var grassBlades = [];
  var fencePosts = [];
  var windLines = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

  var W = 0, H = 0, ctx = null;

  function generateScene() {
    clouds = [];
    for (var i = 0; i < 6; i++) {
      clouds.push({
        x: rand(-80, W + 80), y: rand(H * 0.03, H * 0.2),
        w: rand(60, 140), puffs: Math.floor(rand(3, 5)),
        speed: rand(0.12, 0.35), opacity: rand(0.4, 0.75),
        isGrey: Math.random() > 0.5
      });
    }

    hills = [];
    for (var x = 0; x <= W + 20; x += 15) {
      hills.push({ x: x, y: H * 0.52 + Math.sin(x * 0.005 + 0.8) * H * 0.04 + Math.sin(x * 0.012) * H * 0.02 });
    }

    grassBlades = [];
    for (var i = 0; i < 40; i++) {
      grassBlades.push({
        x: rand(0, W), baseY: H * 0.68 + rand(0, H * 0.2),
        height: rand(8, 20), width: rand(1, 2.5),
        phase: rand(0, Math.PI * 2), speed: rand(1.5, 3)
      });
    }

    fencePosts = [];
    for (var i = 0; i < 6; i++) {
      fencePosts.push({ x: W * 0.05 + i * W * 0.07, y: H * 0.68 + i * 2 });
    }

    windLines = [];
    for (var i = 0; i < 8; i++) {
      windLines.push({
        x: rand(-W * 0.2, W), y: rand(H * 0.15, H * 0.6),
        length: rand(30, 70), speed: rand(1, 3), opacity: rand(0.03, 0.06)
      });
    }
  }

  // ==================== DRAWING ====================

  function drawSky() {
    var b = brightness;
    var clearness = 0.6 + progress * 0.4;
    var sg = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    sg.addColorStop(0, 'hsl(210,' + Math.round(50 + progress * 20) + '%,' + Math.round(55 * b * clearness) + '%)');
    sg.addColorStop(0.5, 'hsl(200,' + Math.round(40 + progress * 15) + '%,' + Math.round(65 * b * clearness) + '%)');
    sg.addColorStop(1, 'hsl(195,' + Math.round(30 + progress * 10) + '%,' + Math.round(72 * b) + '%)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, H);
  }

  function drawClouds() {
    var t = time * 0.001;
    for (var i = 0; i < clouds.length; i++) {
      var c = clouds[i];
      var cx = c.x + t * c.speed * 18;
      if (cx > W + c.w) cx -= W + c.w * 2;
      ctx.globalAlpha = c.opacity * brightness * (1 - progress * 0.3);
      ctx.fillStyle = c.isGrey ? '#c8c8d0' : '#fff';
      var pw = c.w / c.puffs;
      for (var p = 0; p < c.puffs; p++) {
        ctx.beginPath();
        ctx.arc(cx + p * pw * 0.7, c.y + Math.sin(p * 1.5) * 4, pw * 0.42, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawHills() {
    var hg = ctx.createLinearGradient(0, H * 0.45, 0, H * 0.7);
    hg.addColorStop(0, 'hsl(130,' + Math.round(30 + progress * 12) + '%,' + Math.round(35 * brightness) + '%)');
    hg.addColorStop(1, 'hsl(125,' + Math.round(25 + progress * 10) + '%,' + Math.round(28 * brightness) + '%)');
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

  function drawStation() {
    var sx = W * 0.5, sy = H * 0.48;
    ctx.globalAlpha = (0.5 + progress * 0.3) * brightness;
    // Building
    ctx.fillStyle = '#8a8a82';
    ctx.fillRect(sx - 25, sy, 50, 30);
    // Roof
    ctx.fillStyle = '#5a5a58';
    ctx.beginPath();
    ctx.moveTo(sx - 30, sy);
    ctx.lineTo(sx, sy - 18);
    ctx.lineTo(sx + 30, sy);
    ctx.closePath();
    ctx.fill();
    // Door
    ctx.fillStyle = '#4a3a28';
    ctx.fillRect(sx - 6, sy + 12, 12, 18);
    // Window
    ctx.fillStyle = '#8ac0e0';
    ctx.fillRect(sx + 10, sy + 6, 10, 8);
    ctx.strokeStyle = '#5a5a58'; ctx.lineWidth = 1;
    ctx.strokeRect(sx + 10, sy + 6, 10, 8);
    ctx.globalAlpha = 1;
  }

  function drawAnemometer() {
    var t = time * 0.001;
    var ax = W * 0.5, ay = H * 0.42;
    anemometerAngle += 0.05 * (0.3 + progress * 0.7);
    ctx.globalAlpha = (0.45 + progress * 0.35) * brightness;

    // Pole
    ctx.strokeStyle = '#6a6a68';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ax, ay + 6); ctx.lineTo(ax, ay - 10); ctx.stroke();

    // Spinning cups (3)
    ctx.save();
    ctx.translate(ax, ay - 10);
    ctx.rotate(anemometerAngle);
    for (var i = 0; i < 3; i++) {
      var ca = (i / 3) * Math.PI * 2;
      var cx = Math.cos(ca) * 10, cy = Math.sin(ca) * 10;
      // Arm
      ctx.strokeStyle = '#5a5a58';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(cx, cy); ctx.stroke();
      // Cup
      ctx.fillStyle = '#e0e0d8';
      ctx.beginPath();
      ctx.arc(cx + Math.cos(ca) * 3, cy + Math.sin(ca) * 3, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawWeatherVane() {
    var t = time * 0.001;
    var vx = W * 0.55, vy = H * 0.35;
    vaneAngle = Math.sin(t * 0.3) * 0.5 + Math.sin(t * 0.7) * 0.2;
    ctx.globalAlpha = (0.4 + progress * 0.3) * brightness;

    // Pole
    ctx.strokeStyle = '#5a5a58'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(vx, vy + 12); ctx.lineTo(vx, vy - 5); ctx.stroke();

    // Arrow
    ctx.save();
    ctx.translate(vx, vy - 5);
    ctx.rotate(vaneAngle);
    ctx.fillStyle = '#3a3a38';
    // Head
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(6, -3);
    ctx.lineTo(6, 3);
    ctx.closePath();
    ctx.fill();
    // Shaft
    ctx.fillRect(-12, -1, 20, 2);
    // Tail
    ctx.beginPath();
    ctx.moveTo(-12, -4);
    ctx.lineTo(-16, 0);
    ctx.lineTo(-12, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawThermometer() {
    var tx = W * 0.42, ty = H * 0.52;
    var thH = 30;
    var tempFill = 0.3 + progress * 0.5;
    ctx.globalAlpha = (0.4 + progress * 0.3) * brightness;
    // Tube
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(tx - 2, ty, 4, thH);
    // Bulb
    ctx.beginPath(); ctx.arc(tx, ty + thH + 3, 4, 0, Math.PI * 2); ctx.fill();
    // Mercury
    ctx.fillStyle = '#cc2020';
    ctx.fillRect(tx - 1.5, ty + thH * (1 - tempFill), 3, thH * tempFill);
    ctx.beginPath(); ctx.arc(tx, ty + thH + 3, 3, 0, Math.PI * 2); ctx.fill();
    // Scale marks
    ctx.strokeStyle = '#6a6a68'; ctx.lineWidth = 0.5;
    for (var m = 0; m < 5; m++) {
      var my = ty + m * (thH / 4);
      ctx.beginPath(); ctx.moveTo(tx + 3, my); ctx.lineTo(tx + 6, my); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawWindsock() {
    var t = time * 0.001;
    var wx = W * 0.62, wy = H * 0.5;
    var windStr = 0.4 + progress * 0.5;
    ctx.globalAlpha = (0.4 + progress * 0.3) * brightness;
    // Pole
    ctx.strokeStyle = '#6a6a68'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(wx, wy + 15); ctx.lineTo(wx, wy - 5); ctx.stroke();
    // Ring
    ctx.strokeStyle = '#8a8a88'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(wx + 2, wy - 5, 5, 3, 0, 0, Math.PI * 2); ctx.stroke();
    // Sock — billowing in wind
    var segments = 4;
    ctx.fillStyle = '#ff6600';
    for (var s = 0; s < segments; s++) {
      var sx = wx + 5 + s * 7 * windStr + Math.sin(t * 3 + s) * 2;
      var sy = wy - 5 + Math.sin(t * 2 + s * 0.5) * 2;
      var sw = 5 - s;
      ctx.fillStyle = s % 2 === 0 ? '#ff6600' : '#fff';
      ctx.beginPath();
      ctx.ellipse(sx, sy, 3, sw, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawFence() {
    ctx.globalAlpha = (0.3 + progress * 0.15) * brightness;
    ctx.fillStyle = '#6a5a40';
    for (var i = 0; i < fencePosts.length; i++) {
      var fp = fencePosts[i];
      ctx.fillRect(fp.x - 2, fp.y - 15, 4, 18);
      // Point
      ctx.beginPath();
      ctx.moveTo(fp.x - 2, fp.y - 15);
      ctx.lineTo(fp.x, fp.y - 19);
      ctx.lineTo(fp.x + 2, fp.y - 15);
      ctx.fill();
    }
    // Wire between posts
    ctx.strokeStyle = '#7a6a50'; ctx.lineWidth = 1;
    for (var r = 0; r < 2; r++) {
      ctx.beginPath();
      for (var i = 0; i < fencePosts.length; i++) {
        var fp = fencePosts[i];
        if (i === 0) ctx.moveTo(fp.x, fp.y - 8 - r * 6);
        else ctx.lineTo(fp.x, fp.y - 8 - r * 6);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawGrass() {
    var t = time * 0.001;
    for (var i = 0; i < grassBlades.length; i++) {
      var g = grassBlades[i];
      var sway = Math.sin(t * g.speed + g.phase) * (3 + progress * 2);
      ctx.globalAlpha = (0.3 + progress * 0.25) * brightness;
      ctx.strokeStyle = '#3a8a30';
      ctx.lineWidth = g.width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(g.x, g.baseY);
      ctx.quadraticCurveTo(g.x + sway * 0.5, g.baseY - g.height * 0.5, g.x + sway, g.baseY - g.height);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawWindLines() {
    var t = time * 0.001;
    for (var i = 0; i < windLines.length; i++) {
      var w = windLines[i];
      var wx = (w.x + t * w.speed * 40) % (W + w.length + 40) - w.length - 20;
      ctx.globalAlpha = w.opacity * (0.5 + progress * 0.5) * brightness;
      ctx.strokeStyle = 'rgba(200,210,220,0.3)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(wx, w.y);
      ctx.lineTo(wx + w.length, w.y + Math.sin(wx * 0.01) * 3);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // ==================== SCENE INTERFACE ====================
  var scene = {
    enter: function(canvas, context, w, h) {
      ctx = context; W = w; H = h;
      progress = 0; targetProgress = 0; brightness = 0.6;
      anemometerAngle = 0; vaneAngle = 0;
      generateScene();
    },
    resize: function(w, h) { W = w; H = h; generateScene(); },
    update: function(dt, t) {
      time = t;
      progress += (targetProgress - progress) * 0.03;
      brightness += ((0.6 + progress * 0.4) - brightness) * 0.02;
    },
    draw: function() {
      drawSky();
      drawClouds();
      drawHills();
      drawFence();
      drawStation();
      drawThermometer();
      drawWindsock();
      drawAnemometer();
      drawWeatherVane();
      drawGrass();
      drawWindLines();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('datahandling', scene);

  window.ClassmatesDataScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('datahandling')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.4, 10, {
        spread: 5, rise: 2, decay: 0.02, size: 3,
        color: 'rgba(100,180,220,0.8)', shape: 'star', endColor: 'rgba(200,230,255,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.4, 5, {
        spread: 3, rise: 1.5, decay: 0.025, size: 2,
        color: 'rgba(60,160,60,0.6)'
      });
      if (window.FXSound) FXSound.play('click');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('datahandling')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 2, rise: -0.1, gravity: 0.02, decay: 0.015, size: 2,
        color: 'rgba(100,100,110,0.4)'
      });
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('datahandling')) return;
      var s = FXCore.getSize();
      var colors = ['rgba(100,180,220,0.7)','rgba(60,160,60,0.7)','rgba(255,200,50,0.6)','rgba(200,100,150,0.6)','rgba(100,200,200,0.7)'];
      for (var i = 0; i < colors.length; i++) {
        FXCore.emit(s.w * (0.2 + i * 0.15), s.h * 0.35, 5, {
          spread: 6, rise: 2.5, decay: 0.012, size: 3.5, color: colors[i], shape: 'star'
        });
      }
      if (window.FXSound) FXSound.playSequence(['click','chime','complete'], 110);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
