(function(){
  // ============================================================
  // CAPITALS — "Airport Terminal"
  // Bright modern airport. Runway through window, planes, tower.
  // MODERN, BRIGHT, TRAVEL — every capital is a destination.
  // First contemporary urban scene.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.6;
  var time = 0;
  var planeX = 0;

  var clouds = [];
  var runwayLights = [];
  var cityLabels = [];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

  var W = 0, H = 0, ctx = null;

  function generateScene() {
    clouds = [];
    for (var i = 0; i < 5; i++) {
      clouds.push({
        x: rand(-60, W + 60), y: rand(H * 0.08, H * 0.2),
        w: rand(50, 110), puffs: Math.floor(rand(3, 5)),
        speed: rand(0.1, 0.25), opacity: rand(0.5, 0.8)
      });
    }

    runwayLights = [];
    for (var i = 0; i < 12; i++) {
      var t = i / 11;
      runwayLights.push({
        x: W * (0.25 + t * 0.5), y: H * 0.42 - t * H * 0.04,
        size: 2.5 - t * 1.5, phase: rand(0, Math.PI * 2)
      });
    }

    var CITIES = ['Paris','London','Edinburgh','Tokyo','Rome','Berlin','Madrid','Oslo','Dublin','Athens','Cairo','Lima','Seoul','Ottawa'];
    cityLabels = [];
    for (var i = 0; i < 10; i++) {
      cityLabels.push({
        x: rand(W * 0.1, W * 0.9), y: rand(H * 0.5, H * 0.85),
        text: pick(CITIES), size: rand(10, 18),
        speed: rand(0.03, 0.08), drift: rand(-0.06, 0.06),
        opacity: rand(0.03, 0.06), rotation: rand(-0.1, 0.1),
        rotSpeed: rand(-0.001, 0.001),
        minProgress: i < 5 ? 0 : 0.3
      });
    }

    planeX = W * 0.3;
  }

  // ==================== DRAWING ====================

  function drawSky() {
    var b = brightness;
    var sg = ctx.createLinearGradient(0, 0, 0, H * 0.45);
    sg.addColorStop(0, 'hsl(210,' + Math.round(55 + progress * 15) + '%,' + Math.round(58 * b) + '%)');
    sg.addColorStop(0.6, 'hsl(200,' + Math.round(45 + progress * 12) + '%,' + Math.round(68 * b) + '%)');
    sg.addColorStop(1, 'hsl(195,' + Math.round(35 + progress * 10) + '%,' + Math.round(78 * b) + '%)');
    ctx.fillStyle = sg;
    ctx.fillRect(W * 0.05, H * 0.05, W * 0.9, H * 0.4);
  }

  function drawClouds() {
    var t = time * 0.001;
    for (var i = 0; i < clouds.length; i++) {
      var c = clouds[i];
      var cx = c.x + t * c.speed * 12;
      if (cx > W * 0.9 + c.w) cx -= W * 0.85 + c.w * 2;
      if (cx < W * 0.05 - c.w) cx += W * 0.85 + c.w * 2;
      ctx.globalAlpha = c.opacity * brightness;
      ctx.fillStyle = '#fff';
      var pw = c.w / c.puffs;
      for (var p = 0; p < c.puffs; p++) {
        ctx.beginPath();
        ctx.arc(cx + p * pw * 0.65, c.y + Math.sin(p * 1.4) * 3, pw * 0.38, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawRunway() {
    var ry = H * 0.38;
    ctx.globalAlpha = (0.5 + progress * 0.3) * brightness;
    // Runway strip
    ctx.fillStyle = '#5a5a62';
    ctx.beginPath();
    ctx.moveTo(W * 0.2, ry + 8);
    ctx.lineTo(W * 0.8, ry - 4);
    ctx.lineTo(W * 0.8, ry + 2);
    ctx.lineTo(W * 0.2, ry + 14);
    ctx.closePath();
    ctx.fill();
    // Centre line (dashed white)
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(W * 0.22, ry + 10);
    ctx.lineTo(W * 0.78, ry - 1);
    ctx.stroke();
    ctx.setLineDash([]);
    // Grass beside runway
    ctx.fillStyle = '#4a8a40';
    ctx.fillRect(W * 0.05, ry + 14, W * 0.9, 8);
    ctx.globalAlpha = 1;
  }

  function drawControlTower() {
    var tx = W * 0.72, ty = H * 0.18;
    ctx.globalAlpha = (0.3 + progress * 0.2) * brightness;
    ctx.fillStyle = '#6a6a72';
    // Tower shaft
    ctx.fillRect(tx - 3, ty, 6, 24);
    // Cab
    ctx.fillStyle = '#8a8a92';
    ctx.fillRect(tx - 8, ty - 6, 16, 8);
    // Windows
    ctx.fillStyle = '#a0d0e8';
    ctx.fillRect(tx - 6, ty - 4, 12, 4);
    // Antenna
    ctx.strokeStyle = '#5a5a62'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(tx, ty - 6); ctx.lineTo(tx, ty - 14); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawPlane() {
    var t = time * 0.001;
    planeX = W * (0.3 + progress * 0.45); // moves along runway with progress
    var py = H * 0.34 - progress * H * 0.08; // lifts off!
    var tilt = progress > 0.6 ? -(progress - 0.6) * 0.3 : 0; // nose up when taking off

    ctx.save();
    ctx.translate(planeX, py);
    ctx.rotate(tilt);
    ctx.globalAlpha = (0.45 + progress * 0.35) * brightness;

    // Fuselage
    ctx.fillStyle = '#e8e8f0';
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Wings
    ctx.fillStyle = '#d0d0d8';
    ctx.beginPath();
    ctx.moveTo(-5, -2);
    ctx.lineTo(0, -16);
    ctx.lineTo(5, -16);
    ctx.lineTo(3, -2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-5, 2);
    ctx.lineTo(0, 16);
    ctx.lineTo(5, 16);
    ctx.lineTo(3, 2);
    ctx.closePath();
    ctx.fill();
    // Tail
    ctx.fillStyle = '#3060c0';
    ctx.beginPath();
    ctx.moveTo(-18, -1);
    ctx.lineTo(-22, -8);
    ctx.lineTo(-16, -8);
    ctx.lineTo(-14, -1);
    ctx.closePath();
    ctx.fill();
    // Windows
    ctx.fillStyle = '#80b8e0';
    for (var w = -10; w < 12; w += 3) {
      ctx.beginPath(); ctx.arc(w, -1, 0.8, 0, Math.PI * 2); ctx.fill();
    }
    // Nose
    ctx.fillStyle = '#c0c0c8';
    ctx.beginPath();
    ctx.moveTo(20, 0);
    ctx.lineTo(16, -3);
    ctx.lineTo(16, 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawRunwayLights() {
    var t = time * 0.001;
    for (var i = 0; i < runwayLights.length; i++) {
      var l = runwayLights[i];
      var blink = 0.4 + Math.sin(t * 3 + l.phase) * 0.3 + 0.3;
      ctx.globalAlpha = blink * (0.3 + progress * 0.4) * brightness;
      ctx.fillStyle = i < 4 ? '#00cc00' : i < 8 ? '#ffcc00' : '#ff4444';
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.size, 0, Math.PI * 2);
      ctx.fill();
      // Glow
      ctx.globalAlpha = blink * 0.1 * brightness;
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.size * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawWindowFrame() {
    ctx.globalAlpha = (0.5 + progress * 0.25) * brightness;
    ctx.strokeStyle = '#8a8a90';
    ctx.lineWidth = 4;
    // Main frame
    ctx.strokeRect(W * 0.05, H * 0.05, W * 0.9, H * 0.4);
    // Vertical dividers
    ctx.lineWidth = 2;
    for (var d = 1; d < 4; d++) {
      var dx = W * 0.05 + d * W * 0.225;
      ctx.beginPath(); ctx.moveTo(dx, H * 0.05); ctx.lineTo(dx, H * 0.45); ctx.stroke();
    }
    // Horizontal bar
    ctx.beginPath(); ctx.moveTo(W * 0.05, H * 0.25); ctx.lineTo(W * 0.95, H * 0.25); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawCeiling() {
    ctx.globalAlpha = (0.4 + progress * 0.2) * brightness;
    ctx.fillStyle = '#d8d8e0';
    ctx.fillRect(0, 0, W, H * 0.05);
    // Steel beams
    ctx.fillStyle = '#b0b0b8';
    for (var b = 0; b < 5; b++) {
      ctx.fillRect(W * (0.1 + b * 0.2), 0, 4, H * 0.05);
    }
    ctx.globalAlpha = 1;
  }

  function drawFloor() {
    var fy = H * 0.45;
    ctx.globalAlpha = brightness;
    var fg = ctx.createLinearGradient(0, fy, 0, H);
    fg.addColorStop(0, 'hsl(220,5%,' + Math.round(55 * brightness) + '%)');
    fg.addColorStop(0.5, 'hsl(220,4%,' + Math.round(48 * brightness) + '%)');
    fg.addColorStop(1, 'hsl(220,3%,' + Math.round(42 * brightness) + '%)');
    ctx.fillStyle = fg;
    ctx.fillRect(0, fy, W, H - fy);
    // Tile lines
    ctx.globalAlpha = 0.04 * brightness;
    ctx.strokeStyle = '#9a9aa0';
    ctx.lineWidth = 0.5;
    for (var x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, fy); ctx.lineTo(x, H); ctx.stroke(); }
    for (var y = fy; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // Reflection sheen
    ctx.globalAlpha = 0.02 * brightness;
    ctx.fillStyle = '#fff';
    ctx.fillRect(W * 0.2, fy, W * 0.6, H * 0.08);
    ctx.globalAlpha = 1;
  }

  function drawCityLabels() {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (var i = 0; i < cityLabels.length; i++) {
      var c = cityLabels[i];
      if (c.minProgress && progress < c.minProgress) continue;
      c.y -= c.speed * 0.3;
      c.x += c.drift * 0.2;
      c.rotation += c.rotSpeed;
      if (c.y < H * 0.45) { c.y = H * 0.88; c.x = rand(W * 0.1, W * 0.9); }
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rotation);
      ctx.globalAlpha = c.opacity * (0.4 + progress * 0.6) * brightness;
      ctx.font = c.size + 'px "Fredoka One",cursive';
      ctx.fillStyle = '#3060c0';
      ctx.fillText(c.text, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // ==================== SCENE INTERFACE ====================
  var scene = {
    enter: function(canvas, context, w, h) {
      ctx = context; W = w; H = h;
      progress = 0; targetProgress = 0; brightness = 0.6;
      planeX = W * 0.3;
      generateScene();
    },
    resize: function(w, h) { W = w; H = h; generateScene(); },
    update: function(dt, t) {
      time = t;
      progress += (targetProgress - progress) * 0.03;
      brightness += ((0.6 + progress * 0.4) - brightness) * 0.02;
    },
    draw: function() {
      drawFloor();
      drawCeiling();
      drawSky();
      drawClouds();
      drawRunway();
      drawControlTower();
      drawRunwayLights();
      drawPlane();
      drawWindowFrame();
      drawCityLabels();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('capitals', scene);

  window.ClassmatesCapitalsScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('capitals')) return;
      var s = FXCore.getSize();
      var count = 8 + Math.floor(progress * 8);
      // Blue departure-board flicker
      FXCore.emit(s.w * 0.5, s.h * 0.48, count, {
        spread: 5, rise: 2.5, decay: 0.018, size: 3.5,
        color: 'rgba(48,120,220,0.8)', shape: 'star', endColor: 'rgba(160,210,255,0)'
      });
      // White runway-light sparks
      FXCore.emit(s.w * 0.5, s.h * 0.48, Math.floor(count * 0.5), {
        spread: 4, rise: 1.8, decay: 0.022, size: 2,
        color: 'rgba(240,245,255,0.7)'
      });
      // Warm amber taxiway accent
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 3, rise: 1.2, decay: 0.025, size: 2.5,
        color: 'rgba(255,180,50,0.6)', shape: 'diamond'
      });
      if (window.FXSound) FXSound.play('chime');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('capitals')) return;
      var s = FXCore.getSize();
      // Grey turbulence motes
      FXCore.emit(s.w * 0.5, s.h * 0.55, 5, {
        spread: 2.5, rise: -0.2, gravity: 0.025, decay: 0.012, size: 2.5,
        color: 'rgba(100,110,130,0.5)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.52, 3, {
        spread: 1.5, rise: -0.1, gravity: 0.015, decay: 0.02, size: 1.5,
        color: 'rgba(140,150,170,0.3)'
      });
      if (FXCore.shake) FXCore.shake(3, 150);
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('capitals')) return;
      var s = FXCore.getSize();
      // Runway lights celebration — blue and amber alternating
      for (var i = 0; i < 8; i++) {
        var isBlue = i % 2 === 0;
        FXCore.emit(s.w * (0.1 + i * 0.1), s.h * (0.35 + (i % 3) * 0.05), 7, {
          spread: 7, rise: 3.5, decay: 0.008, size: 4,
          color: isBlue ? 'rgba(48,120,220,0.75)' : 'rgba(255,180,50,0.7)',
          shape: isBlue ? 'star' : 'diamond'
        });
      }
      // Central white takeoff burst
      FXCore.emit(s.w * 0.5, s.h * 0.4, 15, {
        spread: 10, rise: 5, decay: 0.007, size: 4.5,
        color: 'rgba(255,255,255,0.8)', shape: 'star', endColor: 'rgba(200,220,255,0)'
      });
      // Contrail streaks
      FXCore.emit(s.w * 0.5, s.h * 0.45, 10, {
        spread: 14, rise: 2, decay: 0.01, size: 2,
        color: 'rgba(220,230,245,0.5)'
      });
      if (window.FXSound) FXSound.playSequence(['chime','correct','streak','complete'], 100);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
