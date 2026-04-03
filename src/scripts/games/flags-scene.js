(function(){
  // ============================================================
  // FLAGS — "World Parade"
  // THE GRAND FINALE — scene 30 of 30.
  // Flags flying, confetti falling, fireworks bursting.
  // A celebration of ALL nations, ALL learning, ALL journeys.
  // The most SPECTACULAR scene — the whole world cheers.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.65;
  var time = 0;

  var clouds = [];
  var flagpoles = [];
  var confetti = [];
  var fireworks = [];
  var nextFirework = 3000;
  var buntingFlags = [];
  var countryLabels = [];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

  var W = 0, H = 0, ctx = null;

  var FLAG_COLORS = ['#dc2626','#2563eb','#16a34a','#eab308','#fff','#1a1a1a','#ea580c','#7c3aed','#06b6d4','#ec4899'];

  function generateScene() {
    clouds = [];
    for (var i = 0; i < 4; i++) {
      clouds.push({
        x: rand(-60, W + 60), y: rand(H * 0.03, H * 0.15),
        w: rand(50, 100), puffs: Math.floor(rand(3, 5)),
        speed: rand(0.08, 0.2), opacity: rand(0.5, 0.75)
      });
    }

    // Flagpoles lining the avenue — left and right
    flagpoles = [];
    for (var i = 0; i < 6; i++) {
      // Left side
      flagpoles.push({
        x: W * (0.05 + i * 0.06), baseY: H * 0.65 + i * 3,
        height: 80 - i * 5, side: 'left',
        flagColor1: pick(FLAG_COLORS), flagColor2: pick(FLAG_COLORS),
        flagColor3: pick(FLAG_COLORS), phase: rand(0, Math.PI * 2)
      });
      // Right side
      flagpoles.push({
        x: W * (0.95 - i * 0.06), baseY: H * 0.65 + i * 3,
        height: 80 - i * 5, side: 'right',
        flagColor1: pick(FLAG_COLORS), flagColor2: pick(FLAG_COLORS),
        flagColor3: pick(FLAG_COLORS), phase: rand(0, Math.PI * 2)
      });
    }

    // Confetti — lots of it
    confetti = [];
    for (var i = 0; i < 60; i++) {
      confetti.push({
        x: rand(0, W), y: rand(-H * 0.3, H),
        w: rand(3, 7), h: rand(2, 5),
        color: pick(FLAG_COLORS),
        rotation: rand(0, Math.PI * 2), rotSpeed: rand(-0.08, 0.08),
        fallSpeed: rand(0.3, 0.8), drift: rand(-0.3, 0.3),
        wobblePhase: rand(0, Math.PI * 2)
      });
    }

    // Bunting between flagpoles
    buntingFlags = [];
    for (var i = 0; i < 30; i++) {
      buntingFlags.push({
        x: rand(W * 0.1, W * 0.9), y: rand(H * 0.2, H * 0.45),
        color: pick(FLAG_COLORS), size: rand(4, 8)
      });
    }

    // Country labels
    var COUNTRIES = ['France','Japan','Brazil','Kenya','Scotland','India','Canada','Egypt','Italy','Australia','Mexico','Norway','China','Greece'];
    countryLabels = [];
    for (var i = 0; i < 10; i++) {
      countryLabels.push({
        x: rand(W * 0.15, W * 0.85), y: rand(H * 0.5, H * 0.8),
        text: pick(COUNTRIES), size: rand(10, 16),
        speed: rand(0.03, 0.07), drift: rand(-0.05, 0.05),
        opacity: rand(0.04, 0.07), rotation: rand(-0.1, 0.1),
        rotSpeed: rand(-0.001, 0.001),
        minProgress: i < 5 ? 0 : 0.3
      });
    }

    fireworks = [];
    nextFirework = 2000;
  }

  // ==================== DRAWING ====================

  function drawSky() {
    var b = brightness;
    var sg = ctx.createLinearGradient(0, 0, 0, H * 0.5);
    sg.addColorStop(0, 'hsl(210,' + Math.round(55 + progress * 15) + '%,' + Math.round(58 * b) + '%)');
    sg.addColorStop(0.5, 'hsl(205,' + Math.round(50 + progress * 12) + '%,' + Math.round(66 * b) + '%)');
    sg.addColorStop(1, 'hsl(200,' + Math.round(40 + progress * 10) + '%,' + Math.round(74 * b) + '%)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, H);
  }

  function drawClouds() {
    var t = time * 0.001;
    for (var i = 0; i < clouds.length; i++) {
      var c = clouds[i];
      var cx = c.x + t * c.speed * 10;
      if (cx > W + c.w) cx -= W + c.w * 2;
      ctx.globalAlpha = c.opacity * brightness;
      ctx.fillStyle = '#fff';
      var pw = c.w / c.puffs;
      for (var p = 0; p < c.puffs; p++) {
        ctx.beginPath();
        ctx.arc(cx + p * pw * 0.7, c.y + Math.sin(p * 1.4) * 3, pw * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawFireworks(dt) {
    var t = time * 0.001;
    var fwRate = 0.3 + progress * 0.8;

    nextFirework -= dt * 1000;
    if (progress > 0.15 && nextFirework <= 0 && fireworks.length < 5) {
      fireworks.push({
        x: rand(W * 0.15, W * 0.85), y: rand(H * 0.05, H * 0.25),
        life: 1, sparks: [],
        color: pick(FLAG_COLORS)
      });
      // Generate sparks
      var fw = fireworks[fireworks.length - 1];
      for (var s = 0; s < 20; s++) {
        var angle = (s / 20) * Math.PI * 2;
        var speed = rand(1, 3);
        fw.sparks.push({
          x: fw.x, y: fw.y,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          life: 1
        });
      }
      nextFirework = rand(1500, 4000) / fwRate;
    }

    // Update and draw fireworks
    for (var i = fireworks.length - 1; i >= 0; i--) {
      var fw = fireworks[i];
      fw.life -= 0.008;
      if (fw.life <= 0) { fireworks.splice(i, 1); continue; }

      for (var s = 0; s < fw.sparks.length; s++) {
        var sp = fw.sparks[s];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vy += 0.03; // gravity
        sp.life -= 0.015;
        if (sp.life <= 0) continue;
        ctx.globalAlpha = sp.life * fw.life * 0.6 * brightness;
        ctx.fillStyle = fw.color;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 2 * sp.life, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawAvenue() {
    var ay = H * 0.55;
    ctx.globalAlpha = brightness;
    // Paved ground — perspective
    var ag = ctx.createLinearGradient(0, ay, 0, H);
    ag.addColorStop(0, 'hsl(40,8%,' + Math.round(55 * brightness) + '%)');
    ag.addColorStop(0.5, 'hsl(35,6%,' + Math.round(48 * brightness) + '%)');
    ag.addColorStop(1, 'hsl(30,5%,' + Math.round(42 * brightness) + '%)');
    ctx.fillStyle = ag;
    ctx.beginPath();
    ctx.moveTo(W * 0.3, ay);
    ctx.lineTo(W * 0.7, ay);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    // Centre line
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.moveTo(W * 0.5, ay); ctx.lineTo(W * 0.5, H); ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  function drawFlagpoles() {
    var t = time * 0.001;
    for (var i = 0; i < flagpoles.length; i++) {
      var fp = flagpoles[i];
      ctx.globalAlpha = (0.45 + progress * 0.35) * brightness;

      // Pole
      ctx.fillStyle = '#8a8a88';
      ctx.fillRect(fp.x - 1.5, fp.baseY - fp.height, 3, fp.height);
      // Gold finial
      ctx.fillStyle = '#c4a040';
      ctx.beginPath();
      ctx.arc(fp.x, fp.baseY - fp.height - 3, 3, 0, Math.PI * 2);
      ctx.fill();

      // FLAG — 3-stripe rectangle fluttering
      var flagW = 22, flagH = 15;
      var wave = Math.sin(t * 2 + fp.phase) * 3 + Math.sin(t * 3 + fp.phase) * 1.5;
      var fx = fp.x + 3, fy = fp.baseY - fp.height + 2;

      // Three horizontal stripes
      var stripeH = flagH / 3;
      var colors = [fp.flagColor1, fp.flagColor2, fp.flagColor3];
      for (var s = 0; s < 3; s++) {
        ctx.fillStyle = colors[s];
        ctx.beginPath();
        ctx.moveTo(fx, fy + s * stripeH);
        ctx.quadraticCurveTo(fx + flagW * 0.5, fy + s * stripeH + wave, fx + flagW, fy + s * stripeH + wave * 0.7);
        ctx.lineTo(fx + flagW, fy + (s + 1) * stripeH + wave * 0.7);
        ctx.quadraticCurveTo(fx + flagW * 0.5, fy + (s + 1) * stripeH + wave, fx, fy + (s + 1) * stripeH);
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawBunting() {
    var t = time * 0.001;
    // String between poles
    for (var row = 0; row < 2; row++) {
      var by = H * (0.25 + row * 0.12);
      ctx.globalAlpha = (0.2 + progress * 0.25) * brightness;
      ctx.strokeStyle = '#5a5a58';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(W * 0.05, by);
      ctx.quadraticCurveTo(W * 0.5, by + 15, W * 0.95, by);
      ctx.stroke();
    }

    // Triangle flags on bunting
    for (var i = 0; i < buntingFlags.length; i++) {
      var bf = buntingFlags[i];
      var sway = Math.sin(t * 1.5 + i * 0.5) * 2;
      ctx.globalAlpha = (0.3 + progress * 0.35) * brightness;
      ctx.fillStyle = bf.color;
      ctx.beginPath();
      ctx.moveTo(bf.x - bf.size * 0.5, bf.y + sway);
      ctx.lineTo(bf.x + bf.size * 0.5, bf.y + sway);
      ctx.lineTo(bf.x, bf.y + bf.size * 1.5 + sway);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawConfetti() {
    var t = time * 0.001;
    var confettiAmount = 0.4 + progress * 0.6;
    for (var i = 0; i < confetti.length; i++) {
      if (i / confetti.length > confettiAmount) continue;
      var c = confetti[i];
      c.y += c.fallSpeed * 0.5;
      c.x += c.drift * 0.3 + Math.sin(t * 2 + c.wobblePhase) * 0.3;
      c.rotation += c.rotSpeed;
      if (c.y > H + 10) { c.y = -10; c.x = rand(0, W); }
      if (c.x < -10) c.x = W + 10;
      if (c.x > W + 10) c.x = -10;

      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rotation);
      ctx.globalAlpha = (0.4 + progress * 0.4) * brightness;
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.w * 0.5, -c.h * 0.5, c.w, c.h);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawCountryLabels() {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (var i = 0; i < countryLabels.length; i++) {
      var c = countryLabels[i];
      if (c.minProgress && progress < c.minProgress) continue;
      c.y -= c.speed * 0.3;
      c.x += c.drift * 0.2;
      c.rotation += c.rotSpeed;
      if (c.y < H * 0.4) { c.y = H * 0.85; c.x = rand(W * 0.15, W * 0.85); }
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rotation);
      ctx.globalAlpha = c.opacity * (0.4 + progress * 0.6) * brightness;
      ctx.font = c.size + 'px "Fredoka One",cursive';
      ctx.fillStyle = '#2a4a6a';
      ctx.fillText(c.text, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // ==================== SCENE INTERFACE ====================
  var scene = {
    enter: function(canvas, context, w, h) {
      ctx = context; W = w; H = h;
      progress = 0; targetProgress = 0; brightness = 0.65;
      fireworks = []; nextFirework = 2000;
      generateScene();
    },
    resize: function(w, h) { W = w; H = h; generateScene(); },
    update: function(dt, t) {
      time = t;
      progress += (targetProgress - progress) * 0.03;
      brightness += ((0.65 + progress * 0.35) - brightness) * 0.02;
    },
    draw: function(context, w, h, t) {
      drawSky();
      drawClouds();
      drawFireworks(0.016);
      drawBunting();
      drawAvenue();
      drawFlagpoles();
      drawConfetti();
      drawCountryLabels();
    },
    exit: function() { fireworks = []; }
  };

  if (window.FXCore) FXCore.register('flags', scene);

  window.ClassmatesFlagsScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('flags')) return;
      var s = FXCore.getSize();
      var count = 6 + Math.floor(progress * 10);
      // Multi-colour celebration burst
      var colors = ['rgba(220,38,38,0.8)','rgba(37,99,235,0.8)','rgba(22,163,74,0.8)','rgba(234,179,8,0.8)'];
      for (var i = 0; i < 4; i++) {
        FXCore.emit(s.w * 0.5, s.h * 0.4, 4, {
          spread: 6, rise: 2.5, decay: 0.018, size: 3,
          color: colors[i], shape: 'star', endColor: 'rgba(255,255,255,0)'
        });
      }
      // Confetti-like multi-colour burst
      var confettiColors = ['rgba(255,0,100,0.7)','rgba(0,200,255,0.7)','rgba(255,200,0,0.7)','rgba(120,0,255,0.7)','rgba(0,255,120,0.7)'];
      for (var i = 0; i < confettiColors.length; i++) {
        FXCore.emit(s.w * (0.35 + i * 0.075), s.h * 0.38, Math.ceil(count / 5), {
          spread: 5, rise: 2, decay: 0.02, size: 2.5,
          color: confettiColors[i], shape: 'circle'
        });
      }
      // Tiny gold sparkles
      for (var i = 0; i < 5; i++) {
        FXCore.emit(s.w * (0.4 + i * 0.05), s.h * 0.36, 2, {
          spread: 2, rise: 1.2, decay: 0.03, size: 1.2,
          color: 'rgba(255,215,0,0.7)', shape: 'star'
        });
      }
      if (window.FXSound) FXSound.play('celebration');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('flags')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 2, rise: -0.1, gravity: 0.02, decay: 0.015, size: 2,
        color: 'rgba(100,100,120,0.4)'
      });
      // Darker muted burst
      FXCore.emit(s.w * 0.5, s.h * 0.48, 3, {
        spread: 3, rise: -0.2, gravity: 0.03, decay: 0.012, size: 2.5,
        color: 'rgba(60,60,80,0.5)'
      });
      if(FXCore.shake) FXCore.shake(3, 150);
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('flags')) return;
      var s = FXCore.getSize();
      // MASSIVE FINALE — rainbow firework shower
      var rainbow = ['rgba(255,0,0,0.8)','rgba(255,136,0,0.8)','rgba(255,255,0,0.8)','rgba(0,200,0,0.8)','rgba(0,100,255,0.8)','rgba(136,0,200,0.8)','rgba(255,0,200,0.8)'];
      for (var wave = 0; wave < 3; wave++) {
        for (var i = 0; i < rainbow.length; i++) {
          FXCore.emit(s.w * (0.1 + i * 0.12), s.h * (0.2 + wave * 0.12), 5, {
            spread: 10, rise: 4, decay: 0.008, size: 4.5,
            color: rainbow[i], shape: 'star'
          });
        }
      }
      // Confetti rain — scattered bursts across the full width
      var flagColors = ['rgba(220,38,38,0.7)','rgba(37,99,235,0.7)','rgba(22,163,74,0.7)','rgba(234,179,8,0.7)','rgba(255,255,255,0.6)','rgba(124,58,237,0.7)','rgba(6,182,212,0.7)','rgba(236,72,153,0.7)'];
      for (var i = 0; i < flagColors.length; i++) {
        FXCore.emit(s.w * (0.05 + i * 0.12), s.h * 0.15, 6, {
          spread: 4, rise: -1, gravity: 0.04, decay: 0.006, size: 3,
          color: flagColors[i], shape: 'circle'
        });
      }
      // Central golden firework burst — the grand star
      FXCore.emit(s.w * 0.5, s.h * 0.25, 15, {
        spread: 14, rise: 3, decay: 0.005, size: 6,
        color: 'rgba(255,215,0,0.95)', shape: 'star', endColor: 'rgba(255,255,200,0)'
      });
      // Extra golden sparkle ring
      for (var i = 0; i < 8; i++) {
        var angle = (i / 8) * Math.PI * 2;
        FXCore.emit(s.w * 0.5 + Math.cos(angle) * s.w * 0.12, s.h * 0.25 + Math.sin(angle) * s.h * 0.08, 4, {
          spread: 5, rise: 1.5, decay: 0.01, size: 3,
          color: 'rgba(255,220,80,0.8)', shape: 'star'
        });
      }
      if (window.FXSound) FXSound.playSequence(['celebration','chime','celebration','chime','celebration','complete'], 80);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
