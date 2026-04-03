(function(){
  // ============================================================
  // WEATHER — "Storm & Rainbow"
  // Split sky: stormy left, clearing right. Rain, lightning,
  // rainbow, sun rays. The weather IS the scene.
  // Most DRAMATIC SKY — teaches weather by showing it.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.55;
  var time = 0;
  var lightningFlash = 0;
  var nextLightning = 5000;

  var stormClouds = [];
  var raindrops = [];
  var leaves = [];
  var puddles = [];
  var trees = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

  var W = 0, H = 0, ctx = null;

  function generateScene() {
    stormClouds = [];
    for (var i = 0; i < 8; i++) {
      stormClouds.push({
        x: rand(W * -0.1, W * 0.55), y: rand(H * 0.02, H * 0.2),
        w: rand(60, 140), h: rand(30, 60),
        darkness: rand(0.3, 0.6), puffs: Math.floor(rand(3, 6))
      });
    }

    raindrops = [];
    for (var i = 0; i < 40; i++) {
      raindrops.push({
        x: rand(0, W * 0.55), y: rand(-H * 0.1, H),
        length: rand(8, 18), speed: rand(3, 7),
        opacity: rand(0.1, 0.3)
      });
    }

    leaves = [];
    for (var i = 0; i < 8; i++) {
      leaves.push({
        x: rand(W * 0.2, W * 0.6), y: rand(H * 0.3, H * 0.7),
        size: rand(3, 7), speed: rand(0.5, 1.5),
        rotation: rand(0, Math.PI * 2), rotSpeed: rand(-0.05, 0.05),
        wobblePhase: rand(0, Math.PI * 2),
        color: ['#4a8a30','#8a7020','#6a5a20','#3a7a30'][Math.floor(rand(0, 4))]
      });
    }

    puddles = [];
    for (var i = 0; i < 5; i++) {
      puddles.push({
        x: rand(W * 0.05, W * 0.5), y: H * 0.82 + rand(-3, 8),
        w: rand(15, 35), h: rand(5, 10)
      });
    }

    trees = [];
    var treePositions = [W * 0.15, W * 0.4, W * 0.65, W * 0.85];
    for (var i = 0; i < treePositions.length; i++) {
      trees.push({
        x: treePositions[i], baseY: H * 0.78 + rand(-3, 3),
        trunkH: rand(20, 35), canopyR: rand(12, 22),
        sway: rand(0.3, 0.8), phase: rand(0, Math.PI * 2)
      });
    }
  }

  // ==================== DRAWING ====================

  function drawSplitSky() {
    var b = brightness;
    var stormAmount = Math.max(0, 1 - progress * 1.2); // storm clears with progress

    // Left = stormy, right = clear. Transition in middle.
    var grad = ctx.createLinearGradient(0, 0, W, 0);
    var stormL = Math.round(20 * b * stormAmount + 40 * b * (1 - stormAmount));
    grad.addColorStop(0, 'hsl(230,' + Math.round(15 + (1 - stormAmount) * 30) + '%,' + stormL + '%)');
    grad.addColorStop(0.4, 'hsl(220,' + Math.round(20 + (1 - stormAmount) * 25) + '%,' + Math.round(35 * b) + '%)');
    grad.addColorStop(0.7, 'hsl(210,' + Math.round(45 + progress * 15) + '%,' + Math.round(55 * b) + '%)');
    grad.addColorStop(1, 'hsl(205,' + Math.round(55 + progress * 15) + '%,' + Math.round(65 * b) + '%)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Vertical sky gradient (top darker)
    var vg = ctx.createLinearGradient(0, 0, 0, H * 0.5);
    vg.addColorStop(0, 'rgba(0,0,20,' + (0.15 * stormAmount) + ')');
    vg.addColorStop(1, 'rgba(0,0,20,0)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, H * 0.5);

    // Lightning flash
    if (lightningFlash > 0) {
      ctx.globalAlpha = lightningFlash * 0.2 * stormAmount;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, W * 0.5, H);
      ctx.globalAlpha = 1;
    }
  }

  function drawStormClouds() {
    var stormAmount = Math.max(0, 1 - progress * 1.2);
    for (var i = 0; i < stormClouds.length; i++) {
      var c = stormClouds[i];
      ctx.globalAlpha = c.darkness * stormAmount * brightness;
      var cg = ctx.createRadialGradient(c.x + c.w * 0.5, c.y + c.h * 0.5, 0, c.x + c.w * 0.5, c.y + c.h * 0.5, c.w * 0.6);
      cg.addColorStop(0, 'rgba(40,35,55,0.6)');
      cg.addColorStop(0.5, 'rgba(60,55,70,0.3)');
      cg.addColorStop(1, 'rgba(80,75,90,0)');
      ctx.fillStyle = cg;
      var pw = c.w / c.puffs;
      for (var p = 0; p < c.puffs; p++) {
        ctx.beginPath();
        ctx.arc(c.x + p * pw * 0.7 + pw * 0.3, c.y + c.h * 0.4 + Math.sin(p * 1.3) * c.h * 0.25, pw * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }
      // Bottom flat fill
      ctx.beginPath();
      ctx.ellipse(c.x + c.w * 0.5, c.y + c.h * 0.6, c.w * 0.5, c.h * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawSunRays() {
    var t = time * 0.001;
    var sunX = W * 0.82, sunY = H * 0.12;
    var sunStrength = 0.2 + progress * 0.6;

    // Sun glow
    ctx.globalAlpha = sunStrength * 0.15 * brightness;
    var sg = ctx.createRadialGradient(sunX, sunY, 5, sunX, sunY, 80);
    sg.addColorStop(0, 'rgba(255,240,180,0.4)');
    sg.addColorStop(0.5, 'rgba(255,220,120,0.1)');
    sg.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.arc(sunX, sunY, 80, 0, Math.PI * 2); ctx.fill();

    // Sun disc
    ctx.globalAlpha = sunStrength * 0.7 * brightness;
    ctx.fillStyle = '#fff8d0';
    ctx.beginPath(); ctx.arc(sunX, sunY, 14, 0, Math.PI * 2); ctx.fill();

    // Rays
    ctx.globalAlpha = sunStrength * 0.04 * brightness;
    for (var r = 0; r < 6; r++) {
      var angle = (r / 6) * Math.PI * 2 + t * 0.1;
      var rayLen = 60 + Math.sin(t * 0.5 + r) * 15;
      ctx.strokeStyle = 'rgba(255,230,150,0.3)';
      ctx.lineWidth = 3 + r;
      ctx.beginPath();
      ctx.moveTo(sunX + Math.cos(angle) * 18, sunY + Math.sin(angle) * 18);
      ctx.lineTo(sunX + Math.cos(angle) * rayLen, sunY + Math.sin(angle) * rayLen);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawRainbow() {
    var arcX = W * 0.55, arcY = H * 0.75;
    var arcR = Math.min(W, H) * 0.45;
    var rainbowAlpha = (0.1 + progress * 0.25) * brightness;

    var RAINBOW = ['#ff0000','#ff8800','#ffff00','#00cc00','#0066ff','#4400cc','#8800cc'];
    for (var i = 0; i < RAINBOW.length; i++) {
      ctx.globalAlpha = rainbowAlpha * (0.6 + i * 0.05);
      ctx.strokeStyle = RAINBOW[i];
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(arcX, arcY, arcR - i * 5, Math.PI, 0);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawRain() {
    var stormAmount = Math.max(0, 1 - progress * 1.3);
    if (stormAmount < 0.05) return;
    ctx.strokeStyle = 'rgba(150,170,200,' + (0.2 * stormAmount) + ')';
    ctx.lineWidth = 1;
    for (var i = 0; i < raindrops.length; i++) {
      var r = raindrops[i];
      r.y += r.speed * 0.8;
      r.x += 1.5; // wind
      if (r.y > H) { r.y = -r.length; r.x = rand(0, W * 0.55); }
      if (r.x > W * 0.6) r.x = rand(0, W * 0.2);
      ctx.globalAlpha = r.opacity * stormAmount * brightness;
      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x + 3, r.y + r.length);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawLandscape() {
    var gy = H * 0.75;
    var greenness = 0.5 + progress * 0.5;
    var gg = ctx.createLinearGradient(0, gy, 0, H);
    gg.addColorStop(0, 'hsl(' + Math.round(120 + progress * 10) + ',' + Math.round(25 + progress * 15) + '%,' + Math.round(30 * brightness * greenness) + '%)');
    gg.addColorStop(1, 'hsl(110,' + Math.round(20 + progress * 10) + '%,' + Math.round(22 * brightness) + '%)');
    ctx.fillStyle = gg;
    ctx.beginPath();
    for (var x = 0; x <= W; x += 10) {
      var y = gy + Math.sin(x * 0.008 + 0.5) * 4;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fill();
  }

  function drawTrees() {
    var t = time * 0.001;
    var stormAmount = Math.max(0, 1 - progress * 1.2);
    for (var i = 0; i < trees.length; i++) {
      var tr = trees[i];
      var windSway = Math.sin(t * tr.sway + tr.phase) * (3 + stormAmount * 6);
      ctx.globalAlpha = (0.4 + progress * 0.3) * brightness;
      // Trunk
      ctx.fillStyle = '#5a4030';
      ctx.fillRect(tr.x - 3, tr.baseY - tr.trunkH, 6, tr.trunkH);
      // Canopy
      ctx.fillStyle = 'hsl(120,' + Math.round(30 + progress * 15) + '%,' + Math.round(25 * brightness) + '%)';
      ctx.beginPath();
      ctx.arc(tr.x + windSway, tr.baseY - tr.trunkH - tr.canopyR * 0.3, tr.canopyR, 0, Math.PI * 2);
      ctx.fill();
      // Lighter patch
      ctx.fillStyle = 'hsl(115,35%,' + Math.round(32 * brightness) + '%)';
      ctx.beginPath();
      ctx.arc(tr.x + windSway - tr.canopyR * 0.2, tr.baseY - tr.trunkH - tr.canopyR * 0.5, tr.canopyR * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawPuddles() {
    var stormAmount = Math.max(0, 1 - progress * 1.2);
    var t = time * 0.001;
    for (var i = 0; i < puddles.length; i++) {
      var p = puddles[i];
      ctx.globalAlpha = (0.1 + stormAmount * 0.15) * brightness;
      ctx.fillStyle = 'rgba(120,150,180,0.3)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.w, p.h, 0, 0, Math.PI * 2);
      ctx.fill();
      // Ripples from rain
      if (stormAmount > 0.2) {
        ctx.strokeStyle = 'rgba(180,200,220,0.15)';
        ctx.lineWidth = 0.5;
        var ripR = (t * 3 + i * 2) % 8 + 2;
        ctx.beginPath();
        ctx.ellipse(p.x + rand(-5, 5), p.y, ripR, ripR * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawLeaves() {
    var t = time * 0.001;
    for (var i = 0; i < leaves.length; i++) {
      var l = leaves[i];
      l.x += l.speed;
      l.y += Math.sin(t * 2 + l.wobblePhase) * 0.5;
      l.rotation += l.rotSpeed;
      if (l.x > W + 10) { l.x = W * 0.1; l.y = rand(H * 0.3, H * 0.7); }
      var stormAmount = Math.max(0, 1 - progress * 1.2);
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rotation);
      ctx.globalAlpha = (0.15 + stormAmount * 0.2) * brightness;
      ctx.fillStyle = l.color;
      ctx.beginPath();
      ctx.moveTo(0, -l.size);
      ctx.quadraticCurveTo(l.size * 0.5, 0, 0, l.size * 0.5);
      ctx.quadraticCurveTo(-l.size * 0.5, 0, 0, -l.size);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function updateLightning(dt) {
    lightningFlash *= 0.88;
    var stormAmount = Math.max(0, 1 - progress * 1.2);
    if (stormAmount < 0.2) return;
    nextLightning -= dt * 1000;
    if (nextLightning <= 0) {
      lightningFlash = 1;
      nextLightning = rand(3000, 10000) / stormAmount;
    }
  }

  // ==================== SCENE INTERFACE ====================
  var scene = {
    enter: function(canvas, context, w, h) {
      ctx = context; W = w; H = h;
      progress = 0; targetProgress = 0; brightness = 0.55;
      lightningFlash = 0; nextLightning = 4000;
      generateScene();
    },
    resize: function(w, h) { W = w; H = h; generateScene(); },
    update: function(dt, t) {
      time = t;
      progress += (targetProgress - progress) * 0.03;
      brightness += ((0.55 + progress * 0.45) - brightness) * 0.02;
      updateLightning(dt);
    },
    draw: function() {
      drawSplitSky();
      drawStormClouds();
      drawSunRays();
      drawRainbow();
      drawRain();
      drawLandscape();
      drawPuddles();
      drawTrees();
      drawLeaves();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('weather', scene);

  window.ClassmatesWeatherScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('weather')) return;
      var s = FXCore.getSize();
      var count = 8 + Math.floor(progress * 8);
      FXCore.emit(s.w * 0.5, s.h * 0.4, 10, {
        spread: 5, rise: 2, decay: 0.02, size: 3,
        color: 'rgba(100,200,255,0.8)', shape: 'star', endColor: 'rgba(255,240,180,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.4, 5, {
        spread: 3, rise: 1.5, decay: 0.025, size: 2,
        color: 'rgba(255,220,100,0.6)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.4, count, {
        spread: 6, rise: 3, decay: 0.014, size: 3,
        color: 'rgba(255,180,60,0.7)', shape: 'star', endColor: 'rgba(255,140,20,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.4, count, {
        spread: 4, rise: 2, decay: 0.02, size: 2,
        color: 'rgba(180,210,255,0.6)'
      });
      if (window.FXSound) FXSound.play('correct');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('weather')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.3, s.h * 0.5, 4, {
        spread: 2, rise: -0.2, gravity: 0.03, decay: 0.015, size: 2,
        color: 'rgba(100,100,130,0.4)'
      });
      FXCore.emit(s.w * 0.3, s.h * 0.5, 3, {
        spread: 2.5, rise: -0.15, gravity: 0.025, decay: 0.018, size: 2.5,
        color: 'rgba(60,60,80,0.4)'
      });
      if(FXCore.shake) FXCore.shake(4, 200);
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('weather')) return;
      var s = FXCore.getSize();
      // Rainbow burst
      var rainbow = ['rgba(255,0,0,0.6)','rgba(255,136,0,0.6)','rgba(255,255,0,0.6)','rgba(0,204,0,0.6)','rgba(0,102,255,0.6)','rgba(136,0,204,0.6)'];
      for (var i = 0; i < rainbow.length; i++) {
        FXCore.emit(s.w * (0.2 + i * 0.12), s.h * 0.35, 5, {
          spread: 7, rise: 3, decay: 0.01, size: 4, color: rainbow[i], shape: 'star'
        });
      }
      // 7 ROYGBIV rainbow bursts
      var roygbiv = ['rgba(255,0,0,0.8)','rgba(255,127,0,0.8)','rgba(255,255,0,0.8)','rgba(0,200,0,0.8)','rgba(0,100,255,0.8)','rgba(75,0,130,0.8)','rgba(148,0,211,0.8)'];
      for (var i = 0; i < 7; i++) {
        var angle = (i / 7) * Math.PI;
        var rx = s.w * 0.5 + Math.cos(angle) * s.w * 0.25;
        var ry = s.h * 0.35 - Math.sin(angle) * s.h * 0.15;
        FXCore.emit(rx, ry, 10, {
          spread: 8, rise: 3, decay: 0.008, size: 4,
          color: roygbiv[i], shape: 'star'
        });
      }
      // Golden sunburst
      FXCore.emit(s.w * 0.5, s.h * 0.35, 20, {
        spread: 12, rise: 5, decay: 0.006, size: 5,
        color: 'rgba(255,220,80,0.9)', shape: 'star', endColor: 'rgba(255,180,0,0)'
      });
      // White lightning sparks
      FXCore.emit(s.w * 0.5, s.h * 0.35, 12, {
        spread: 10, rise: 6, decay: 0.012, size: 2,
        color: 'rgba(255,255,255,0.9)', endColor: 'rgba(200,220,255,0)'
      });
      if (window.FXSound) FXSound.playSequence(['correct','streak','celebration','complete'], 90);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
