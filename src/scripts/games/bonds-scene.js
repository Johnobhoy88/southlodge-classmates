(function(){
  // ============================================================
  // NUMBER BONDS — "Coral Reef"
  // A bright tropical reef. Colourful coral, darting fish,
  // sunlight from above, bubbles rising. Warm, vibrant, alive.
  // Parts connect to form wholes — like number bonds.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.75;
  var time = 0;

  var corals = [];
  var anemones = [];
  var fish = [];
  var bubbles = [];
  var plankton = [];
  var shells = [];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

  var W = 0, H = 0, ctx = null;

  function generateScene() {
    // Background coral — pastel, distant
    var bgCoralColors = ['#ff9eaa','#ffb380','#d4a5ff','#80d4ff','#ff80bf'];
    // Mid-ground coral formations
    corals = [];
    var coralData = [
      { x: W * 0.1, baseY: H * 0.72, type: 'brain', color: '#ff6b9d', w: 35, h: 28 },
      { x: W * 0.3, baseY: H * 0.7, type: 'staghorn', color: '#ff9e50', w: 25, h: 40 },
      { x: W * 0.55, baseY: H * 0.74, type: 'fan', color: '#c470ff', w: 30, h: 45 },
      { x: W * 0.75, baseY: H * 0.71, type: 'brain', color: '#ff5588', w: 40, h: 30 },
      { x: W * 0.9, baseY: H * 0.73, type: 'staghorn', color: '#ffaa60', w: 22, h: 35 },
      { x: W * 0.42, baseY: H * 0.76, type: 'fan', color: '#8080ff', w: 20, h: 30, minProgress: 0.3 },
      { x: W * 0.65, baseY: H * 0.78, type: 'brain', color: '#ff70aa', w: 25, h: 20, minProgress: 0.5 }
    ];
    for (var i = 0; i < coralData.length; i++) {
      var cd = coralData[i];
      cd.phase = rand(0, Math.PI * 2);
      cd.swaySpeed = rand(0.3, 0.8);
      corals.push(cd);
    }

    // Sea anemones
    anemones = [];
    var anePositions = [W * 0.2, W * 0.5, W * 0.8, W * 0.35];
    for (var i = 0; i < anePositions.length; i++) {
      var tentacles = [];
      for (var t = 0; t < 8; t++) {
        tentacles.push({ angle: (t / 8) * Math.PI - Math.PI * 0.5 + rand(-0.2, 0.2), length: rand(12, 22), phase: rand(0, Math.PI * 2), speed: rand(0.8, 1.5) });
      }
      anemones.push({
        x: anePositions[i], baseY: H * 0.8 + rand(-3, 3),
        tentacles: tentacles,
        color: pick(['#ff69b4','#ff6347','#ffa500','#da70d6']),
        minProgress: i < 2 ? 0 : 0.4
      });
    }

    // Tropical fish
    var fishColors = [
      { body: '#ff6347', stripe: '#ffff00' },
      { body: '#00bfff', stripe: '#ffffff' },
      { body: '#ffd700', stripe: '#ff8c00' },
      { body: '#ff69b4', stripe: '#ffffff' },
      { body: '#32cd32', stripe: '#98fb98' },
      { body: '#ff4500', stripe: '#ffd700' },
      { body: '#9370db', stripe: '#e6e6fa' },
      { body: '#00ced1', stripe: '#f0ffff' }
    ];
    fish = [];
    for (var i = 0; i < 8; i++) {
      var fc = fishColors[i % fishColors.length];
      fish.push({
        x: rand(-W * 0.1, W * 1.1), y: rand(H * 0.15, H * 0.65),
        size: rand(6, 14), speed: rand(0.3, 0.9) * (Math.random() > 0.5 ? 1 : -1),
        bodyColor: fc.body, stripeColor: fc.stripe,
        swimPhase: rand(0, Math.PI * 2), swimSpeed: rand(2, 4),
        yDrift: rand(-0.1, 0.1),
        minProgress: i < 4 ? 0 : (i < 6 ? 0.25 : 0.5)
      });
    }

    // Bubbles
    bubbles = [];
    for (var i = 0; i < 20; i++) {
      bubbles.push({
        x: rand(W * 0.05, W * 0.95), y: rand(0, H),
        size: rand(2, 6), speed: rand(0.3, 0.7),
        wobblePhase: rand(0, Math.PI * 2), wobbleAmp: rand(0.5, 1.5)
      });
    }

    // Plankton
    plankton = [];
    for (var i = 0; i < 20; i++) {
      plankton.push({
        x: rand(0, W), y: rand(0, H * 0.7),
        size: rand(0.5, 1.5), speedX: rand(-0.04, 0.04),
        speedY: rand(-0.03, 0.03), opacity: rand(0.1, 0.3)
      });
    }

    // Shells on ocean floor
    shells = [];
    for (var i = 0; i < 8; i++) {
      shells.push({
        x: rand(W * 0.05, W * 0.95), y: H * 0.85 + rand(-3, 5),
        size: rand(3, 7), type: Math.random() > 0.5 ? 'spiral' : 'clam',
        color: pick(['#ffd4a8','#f0c8a0','#e8d0b8','#ffe4c4'])
      });
    }
  }

  // ==================== DRAWING ====================

  function drawWater() {
    var b = brightness;
    var wg = ctx.createLinearGradient(0, 0, 0, H);
    wg.addColorStop(0, 'hsl(185,' + Math.round(55 + progress * 15) + '%,' + Math.round(45 * b) + '%)');
    wg.addColorStop(0.3, 'hsl(190,' + Math.round(50 + progress * 10) + '%,' + Math.round(38 * b) + '%)');
    wg.addColorStop(0.7, 'hsl(200,' + Math.round(45 + progress * 8) + '%,' + Math.round(30 * b) + '%)');
    wg.addColorStop(1, 'hsl(210,' + Math.round(40) + '%,' + Math.round(22 * b) + '%)');
    ctx.fillStyle = wg;
    ctx.fillRect(0, 0, W, H);
  }

  // Noise water texture — organic ocean current overlay
  function drawWaterNoise() {
    var t = time * 0.001;
    var noiseAlpha = (0.03 + progress * 0.025) * brightness;
    ctx.globalAlpha = noiseAlpha;
    for (var nx = 0; nx < W; nx += 14) {
      for (var ny = 0; ny < H; ny += 14) {
        var n = FXCore.noise2D(nx * 0.006 + t * 0.12, ny * 0.006 + t * 0.06);
        var depth = ny / H;
        var hue = 185 + depth * 25;
        var l = 30 + n * 12 - depth * 10;
        ctx.fillStyle = 'hsl(' + Math.round(hue) + ',50%,' + Math.round(Math.max(8, l)) + '%)';
        ctx.fillRect(nx, ny, 14, 14);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawSunrays() {
    var t = time * 0.001;
    var rayAlpha = (0.03 + progress * 0.05) * brightness;
    for (var i = 0; i < 5; i++) {
      var rx = W * (0.15 + i * 0.17) + Math.sin(t * 0.2 + i * 1.5) * 15;
      var rw = 15 + Math.sin(t * 0.3 + i) * 5;
      ctx.globalAlpha = rayAlpha * (0.5 + Math.sin(t * 0.4 + i * 2) * 0.3);
      var rg = ctx.createLinearGradient(rx, 0, rx + rw * 2.5, H * 0.85);
      rg.addColorStop(0, 'rgba(255,255,200,0.15)');
      rg.addColorStop(0.5, 'rgba(255,255,180,0.05)');
      rg.addColorStop(1, 'rgba(255,255,160,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.moveTo(rx, 0);
      ctx.lineTo(rx + rw, 0);
      ctx.lineTo(rx + rw * 3, H * 0.85);
      ctx.lineTo(rx + rw * 1.5, H * 0.85);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawSandyFloor() {
    var fy = H * 0.82;
    ctx.globalAlpha = brightness;
    var fg = ctx.createLinearGradient(0, fy, 0, H);
    fg.addColorStop(0, 'hsl(40,' + Math.round(35 + progress * 10) + '%,' + Math.round(40 * brightness) + '%)');
    fg.addColorStop(1, 'hsl(35,' + Math.round(30) + '%,' + Math.round(32 * brightness) + '%)');
    ctx.fillStyle = fg;
    ctx.beginPath();
    var t = time * 0.001;
    for (var x = 0; x <= W; x += 8) {
      var y = fy + Math.sin(x * 0.01 + 0.5) * 3;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
    ctx.fill();

    // Shells
    for (var i = 0; i < shells.length; i++) {
      var s = shells[i];
      ctx.globalAlpha = 0.3 * brightness;
      ctx.fillStyle = s.color;
      if (s.type === 'spiral') {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(160,120,80,0.2)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 0.5, 0, Math.PI * 1.5);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, s.size, s.size * 0.5, 0, 0, Math.PI);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawCorals() {
    var t = time * 0.001;
    for (var i = 0; i < corals.length; i++) {
      var c = corals[i];
      if (c.minProgress && progress < c.minProgress) continue;
      var growFactor = c.minProgress ? Math.min(1, (progress - c.minProgress) / 0.3 + 0.3) : 0.5 + progress * 0.5;
      var sway = Math.sin(t * c.swaySpeed + c.phase) * 2;

      ctx.globalAlpha = (0.5 + progress * 0.35) * brightness;

      if (c.type === 'brain') {
        // Rounded bumpy shape
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.ellipse(c.x + sway, c.baseY - c.h * growFactor * 0.5, c.w * 0.5 * growFactor, c.h * 0.5 * growFactor, 0, 0, Math.PI * 2);
        ctx.fill();
        // Texture ridges
        ctx.globalAlpha = 0.12 * brightness;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 0.5;
        for (var r = 0; r < 3; r++) {
          ctx.beginPath();
          ctx.arc(c.x + sway + (r - 1) * 6, c.baseY - c.h * growFactor * 0.5, c.w * 0.25 * growFactor, 0, Math.PI);
          ctx.stroke();
        }
      } else if (c.type === 'staghorn') {
        // Branching upward
        ctx.strokeStyle = c.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        for (var b = 0; b < 4; b++) {
          var bAngle = -0.6 + b * 0.35 + sway * 0.05;
          var bLen = c.h * growFactor * (0.6 + b * 0.1);
          ctx.globalAlpha = (0.4 + progress * 0.3) * brightness;
          ctx.beginPath();
          ctx.moveTo(c.x, c.baseY);
          ctx.quadraticCurveTo(c.x + Math.sin(bAngle) * bLen * 0.5 + sway, c.baseY - bLen * 0.5, c.x + Math.sin(bAngle) * bLen + sway, c.baseY - bLen);
          ctx.stroke();
          // Tip glow
          ctx.fillStyle = c.color;
          ctx.beginPath();
          ctx.arc(c.x + Math.sin(bAngle) * bLen + sway, c.baseY - bLen, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else { // fan
        // Fan-shaped coral
        ctx.fillStyle = c.color;
        ctx.globalAlpha = (0.35 + progress * 0.3) * brightness;
        ctx.beginPath();
        ctx.moveTo(c.x + sway, c.baseY);
        for (var a = -0.8; a <= 0.8; a += 0.15) {
          var fLen = c.h * growFactor * (0.8 + Math.sin(a * 3) * 0.2);
          ctx.lineTo(c.x + Math.sin(a) * c.w * 0.5 + sway, c.baseY - fLen);
        }
        ctx.closePath();
        ctx.fill();
        // Fan ribs
        ctx.globalAlpha = 0.1 * brightness;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 0.5;
        for (var a = -0.6; a <= 0.6; a += 0.3) {
          ctx.beginPath();
          ctx.moveTo(c.x + sway, c.baseY);
          ctx.lineTo(c.x + Math.sin(a) * c.w * 0.4 + sway, c.baseY - c.h * growFactor * 0.7);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawAnemones() {
    var t = time * 0.001;
    for (var i = 0; i < anemones.length; i++) {
      var a = anemones[i];
      if (a.minProgress && progress < a.minProgress) continue;
      ctx.globalAlpha = (0.4 + progress * 0.3) * brightness;
      // Base rock
      ctx.fillStyle = '#6a6a72';
      ctx.beginPath();
      ctx.ellipse(a.x, a.baseY, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Tentacles
      ctx.strokeStyle = a.color;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      for (var j = 0; j < a.tentacles.length; j++) {
        var te = a.tentacles[j];
        var sway = Math.sin(t * te.speed + te.phase) * 5;
        var tipX = a.x + Math.cos(te.angle) * te.length + sway;
        var tipY = a.baseY + Math.sin(te.angle) * te.length - te.length * 0.3;
        ctx.beginPath();
        ctx.moveTo(a.x, a.baseY - 3);
        ctx.quadraticCurveTo(a.x + sway * 0.5, (a.baseY + tipY) * 0.5, tipX, tipY);
        ctx.stroke();
        // Tip glow
        ctx.fillStyle = a.color;
        ctx.globalAlpha = 0.3 * brightness;
        ctx.beginPath();
        ctx.arc(tipX, tipY, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = (0.4 + progress * 0.3) * brightness;
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawFish() {
    var t = time * 0.001;
    for (var i = 0; i < fish.length; i++) {
      var f = fish[i];
      if (progress < f.minProgress) continue;
      var nDrift = FXCore.noise2D(f.x * 0.005 + t * 0.25, f.y * 0.005 + i * 9) * 0.35;
      f.x += f.speed * 0.5;
      f.y += f.yDrift + Math.sin(t * 0.5 + f.swimPhase) * 0.15 + nDrift;
      var tailWag = Math.sin(t * f.swimSpeed + f.swimPhase) * 0.25;
      if (f.speed > 0 && f.x > W + f.size * 3) f.x = -f.size * 3;
      if (f.speed < 0 && f.x < -f.size * 3) f.x = W + f.size * 3;
      if (f.y < H * 0.1) f.y = H * 0.1;
      if (f.y > H * 0.7) f.y = H * 0.7;

      var dir = f.speed > 0 ? 1 : -1;
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.scale(dir, 1);
      ctx.globalAlpha = (0.55 + progress * 0.35) * brightness;
      // Tail
      ctx.fillStyle = f.bodyColor;
      ctx.beginPath();
      ctx.moveTo(-f.size * 0.7, 0);
      ctx.lineTo(-f.size * 1.3, -f.size * 0.4 + tailWag * f.size);
      ctx.lineTo(-f.size * 1.3, f.size * 0.4 + tailWag * f.size);
      ctx.closePath();
      ctx.fill();
      // Body
      ctx.beginPath();
      ctx.ellipse(0, 0, f.size, f.size * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
      // Stripe
      ctx.fillStyle = f.stripeColor;
      ctx.globalAlpha = 0.4 * brightness;
      ctx.fillRect(-f.size * 0.1, -f.size * 0.4, f.size * 0.15, f.size * 0.8);
      // Eye
      ctx.globalAlpha = (0.55 + progress * 0.35) * brightness;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(f.size * 0.45, -f.size * 0.08, f.size * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1a2e';
      ctx.beginPath();
      ctx.arc(f.size * 0.5, -f.size * 0.08, f.size * 0.08, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawBubbles() {
    var t = time * 0.001;
    for (var i = 0; i < bubbles.length; i++) {
      var b = bubbles[i];
      b.y -= b.speed * 0.35;
      b.x += Math.sin(t * 2 + b.wobblePhase) * b.wobbleAmp * 0.2;
      if (b.y < -b.size * 3) { b.y = H + b.size; b.x = rand(W * 0.05, W * 0.95); }
      ctx.globalAlpha = (0.12 + progress * 0.12) * brightness;
      ctx.strokeStyle = 'rgba(200,240,255,0.4)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.stroke();
      // Highlight
      ctx.globalAlpha = (0.2 + progress * 0.15) * brightness;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(b.x - b.size * 0.25, b.y - b.size * 0.25, b.size * 0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawPlankton() {
    for (var i = 0; i < plankton.length; i++) {
      var p = plankton[i];
      p.x += p.speedX; p.y += p.speedY;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H * 0.7; if (p.y > H * 0.75) p.y = 0;
      ctx.globalAlpha = p.opacity * (0.5 + progress * 0.5) * brightness;
      ctx.fillStyle = '#ffffcc';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Screen-blend reef glow — sunlight bloom and coral aura
  function drawReefGlow() {
    var t = time * 0.001;
    ctx.globalCompositeOperation = 'screen';

    // Sunray entry bloom at surface
    for (var i = 0; i < 5; i++) {
      var rx = W * (0.15 + i * 0.17) + Math.sin(t * 0.2 + i * 1.5) * 15;
      var glowR = 50 + progress * 25;
      ctx.globalAlpha = (0.05 + progress * 0.04) * brightness;
      var rg = ctx.createRadialGradient(rx, 0, 0, rx, 0, glowR);
      rg.addColorStop(0, 'rgba(255,255,200,0.2)');
      rg.addColorStop(0.5, 'rgba(255,240,180,0.06)');
      rg.addColorStop(1, 'rgba(255,240,180,0)');
      ctx.fillStyle = rg;
      ctx.fillRect(rx - glowR, 0, glowR * 2, glowR * 1.5);
    }

    // Coral glow halos
    for (var i = 0; i < corals.length; i++) {
      var c = corals[i];
      if (c.minProgress && progress < c.minProgress) continue;
      ctx.globalAlpha = (0.03 + progress * 0.03) * brightness;
      var cg = ctx.createRadialGradient(c.x, c.baseY - c.h * 0.3, 0, c.x, c.baseY - c.h * 0.3, c.w);
      cg.addColorStop(0, 'rgba(255,180,200,0.12)');
      cg.addColorStop(1, 'rgba(255,180,200,0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(c.x, c.baseY - c.h * 0.3, c.w, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'source-over';
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
      drawWater();
      drawWaterNoise();
      drawSunrays();
      drawSandyFloor();
      drawCorals();
      drawAnemones();
      drawFish();
      drawPlankton();
      drawBubbles();
      drawReefGlow();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('bonds', scene);

  window.ClassmatesBondsScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('bonds')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.4, 12, {
        spread: 5, rise: 2, decay: 0.02, size: 3,
        color: 'rgba(0,200,200,0.8)', shape: 'circle', endColor: 'rgba(200,255,255,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.4, 6, {
        spread: 3, rise: 1.5, decay: 0.025, size: 2.5,
        color: 'rgba(255,200,100,0.6)'
      });
      if (window.FXSound) FXSound.play('pop');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('bonds')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 2, rise: -0.1, gravity: 0.02, decay: 0.015, size: 2,
        color: 'rgba(80,100,120,0.4)'
      });
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('bonds')) return;
      var s = FXCore.getSize();
      var colors = ['rgba(255,100,150,0.7)','rgba(0,200,200,0.7)','rgba(255,170,80,0.7)','rgba(200,100,255,0.7)','rgba(100,200,100,0.7)'];
      for (var i = 0; i < colors.length; i++) {
        FXCore.emit(s.w * (0.15 + i * 0.175), s.h * 0.4, 5, {
          spread: 6, rise: 3, decay: 0.012, size: 3.5, color: colors[i], shape: 'circle'
        });
      }
      if (window.FXSound) FXSound.playSequence(['pop','pop','complete'], 100);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
