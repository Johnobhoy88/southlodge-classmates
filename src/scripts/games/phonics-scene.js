(function(){
  // ============================================================
  // PHONICS — "Aurora Meadow"
  // A vast Highland meadow at dusk. Northern lights shimmer above,
  // wildflowers sway in the breeze, fireflies drift through grass.
  // Wide open sky — the opposite of the enclosed workshop.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.75;
  var time = 0;

  var auroraWaves = [];
  var mountains = [];
  var hills = [];
  var grassBlades = [];
  var flowers = [];
  var fireflies = [];
  var soundSymbols = [];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

  var W = 0, H = 0, ctx = null;

  function generateScene() {
    // Aurora bands — 3 shimmering curtains
    auroraWaves = [
      { y: H * 0.12, amplitude: 25, freq: 0.006, speed: 0.4, color: 'rgba(72,255,167,', width: H * 0.08 },
      { y: H * 0.18, amplitude: 20, freq: 0.008, speed: 0.3, color: 'rgba(100,200,255,', width: H * 0.06 },
      { y: H * 0.10, amplitude: 30, freq: 0.005, speed: 0.5, color: 'rgba(180,130,255,', width: H * 0.05 }
    ];

    // Mountain silhouette points
    mountains = [];
    for (var x = 0; x <= W + 20; x += 15) {
      mountains.push({
        x: x,
        y: H * 0.42 + Math.sin(x * 0.005 + 1.5) * H * 0.06 + Math.sin(x * 0.012) * H * 0.03 + Math.sin(x * 0.002) * H * 0.04
      });
    }

    // Mid-ground hills
    hills = [];
    for (var x = 0; x <= W + 20; x += 12) {
      hills.push({
        x: x,
        y: H * 0.58 + Math.sin(x * 0.007 + 0.8) * H * 0.04 + Math.sin(x * 0.015) * H * 0.02
      });
    }

    // Grass blades — foreground
    grassBlades = [];
    for (var i = 0; i < 50; i++) {
      grassBlades.push({
        x: rand(0, W),
        baseY: H * 0.72 + rand(0, H * 0.25),
        height: rand(10, 28),
        width: rand(1, 3),
        phase: rand(0, Math.PI * 2),
        speed: rand(1, 2.5),
        color: pick(['#4ade80','#34d399','#22c55e','#16a34a','#15803d'])
      });
    }

    // Wildflowers
    var flowerColors = ['#f472b6','#fb923c','#facc15','#a78bfa','#f87171','#38bdf8','#fb7185','#fbbf24'];
    flowers = [];
    for (var i = 0; i < 20; i++) {
      flowers.push({
        x: rand(W * 0.05, W * 0.95),
        baseY: H * 0.7 + rand(0, H * 0.18),
        stemH: rand(12, 30),
        petalSize: rand(2.5, 5),
        petals: Math.floor(rand(4, 7)),
        color: pick(flowerColors),
        phase: rand(0, Math.PI * 2),
        swaySpeed: rand(0.8, 1.5),
        minProgress: i < 10 ? 0 : (i < 16 ? 0.3 : 0.6) // bloom with progress
      });
    }

    // Fireflies / glowing pollen
    fireflies = [];
    for (var i = 0; i < 15; i++) {
      fireflies.push({
        x: rand(W * 0.05, W * 0.95),
        y: rand(H * 0.5, H * 0.85),
        size: rand(1.5, 3),
        phase: rand(0, Math.PI * 2),
        pulseSpeed: rand(1, 3),
        driftX: rand(-0.2, 0.2),
        driftY: rand(-0.15, 0.15),
        color: pick(['rgba(255,230,120,','rgba(200,255,150,','rgba(255,200,100,']),
        minProgress: i < 6 ? 0 : (i < 11 ? 0.25 : 0.5)
      });
    }

    // Floating phonics symbols
    var SYMS = ['sh','ch','ai','ee','oo','th','ng','igh','ou','aw'];
    soundSymbols = [];
    for (var i = 0; i < 8; i++) {
      soundSymbols.push({
        x: rand(W * 0.1, W * 0.9),
        y: rand(H * 0.35, H * 0.7),
        text: pick(SYMS),
        size: rand(14, 26),
        speed: rand(0.04, 0.12),
        drift: rand(-0.1, 0.1),
        opacity: rand(0.03, 0.06),
        rotation: rand(-0.15, 0.15),
        rotSpeed: rand(-0.002, 0.002)
      });
    }
  }

  // ==================== DRAWING ====================

  function drawSky() {
    var b = brightness;
    var grad = ctx.createLinearGradient(0, 0, 0, H * 0.55);
    grad.addColorStop(0, 'hsl(250,' + Math.round(40 + progress * 15) + '%,' + Math.round(14 * b) + '%)');
    grad.addColorStop(0.4, 'hsl(260,' + Math.round(35 + progress * 10) + '%,' + Math.round(20 * b) + '%)');
    grad.addColorStop(0.7, 'hsl(20,' + Math.round(40 + progress * 10) + '%,' + Math.round(30 * b) + '%)');
    grad.addColorStop(1, 'hsl(15,' + Math.round(50 + progress * 10) + '%,' + Math.round(40 * b) + '%)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Horizon glow
    var hg = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.6);
    hg.addColorStop(0, 'rgba(255,180,120,' + (0.04 + progress * 0.04) + ')');
    hg.addColorStop(1, 'rgba(255,180,120,0)');
    ctx.fillStyle = hg;
    ctx.fillRect(0, 0, W, H);
  }

  function drawAurora() {
    var t = time * 0.001;
    var auroraAlpha = 0.05 + progress * 0.25;
    for (var i = 0; i < auroraWaves.length; i++) {
      var a = auroraWaves[i];
      ctx.globalAlpha = auroraAlpha * (0.3 + Math.sin(t * 0.3 + i * 2) * 0.15);
      ctx.beginPath();
      for (var x = 0; x <= W; x += 4) {
        var y = a.y + Math.sin(x * a.freq + t * a.speed) * a.amplitude + Math.sin(x * a.freq * 2 + t * a.speed * 1.5) * a.amplitude * 0.3;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      // Close to form a filled band
      for (var x = W; x >= 0; x -= 4) {
        var y = a.y + a.width + Math.sin(x * a.freq + t * a.speed + 0.5) * a.amplitude * 0.8;
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      var ag = ctx.createLinearGradient(0, a.y - a.amplitude, 0, a.y + a.width + a.amplitude);
      ag.addColorStop(0, a.color + '0)');
      ag.addColorStop(0.3, a.color + '0.4)');
      ag.addColorStop(0.7, a.color + '0.3)');
      ag.addColorStop(1, a.color + '0)');
      ctx.fillStyle = ag;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawMountains() {
    ctx.globalAlpha = brightness * 0.7;
    var mg = ctx.createLinearGradient(0, H * 0.35, 0, H * 0.55);
    mg.addColorStop(0, 'hsl(270,25%,' + Math.round(18 * brightness) + '%)');
    mg.addColorStop(1, 'hsl(260,20%,' + Math.round(14 * brightness) + '%)');
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (var i = 0; i < mountains.length; i++) {
      var p = mountains[i];
      if (i === 0) ctx.moveTo(p.x, p.y);
      else {
        var prev = mountains[i - 1];
        ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + p.x) / 2, (prev.y + p.y) / 2);
      }
    }
    ctx.lineTo(W + 20, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawHills() {
    var t = time * 0.001;
    var hg = ctx.createLinearGradient(0, H * 0.5, 0, H * 0.75);
    hg.addColorStop(0, 'hsl(150,' + Math.round(30 + progress * 15) + '%,' + Math.round(18 * brightness) + '%)');
    hg.addColorStop(1, 'hsl(140,' + Math.round(35 + progress * 10) + '%,' + Math.round(14 * brightness) + '%)');
    ctx.fillStyle = hg;
    ctx.globalAlpha = brightness * 0.85;
    ctx.beginPath();
    for (var i = 0; i < hills.length; i++) {
      var p = hills[i];
      var sway = Math.sin(t * 0.2 + p.x * 0.003) * 1.5;
      if (i === 0) ctx.moveTo(p.x, p.y + sway);
      else {
        var prev = hills[i - 1];
        ctx.quadraticCurveTo(prev.x, prev.y + sway, (prev.x + p.x) / 2, (prev.y + p.y) / 2 + sway);
      }
    }
    ctx.lineTo(W + 20, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawMeadow() {
    // Base meadow fill
    var mg = ctx.createLinearGradient(0, H * 0.7, 0, H);
    mg.addColorStop(0, 'hsl(140,' + Math.round(40 + progress * 15) + '%,' + Math.round(20 * brightness) + '%)');
    mg.addColorStop(1, 'hsl(130,' + Math.round(35 + progress * 10) + '%,' + Math.round(14 * brightness) + '%)');
    ctx.fillStyle = mg;
    ctx.fillRect(0, H * 0.7, W, H * 0.3);
  }

  // Noise meadow texture — organic grass/ground detail
  function drawMeadowNoise() {
    var t = time * 0.001;
    var groundY = Math.floor(H * 0.7);
    var noiseAlpha = (0.03 + progress * 0.02) * brightness;
    ctx.globalAlpha = noiseAlpha;
    for (var nx = 0; nx < W; nx += 14) {
      for (var ny = groundY; ny < H; ny += 14) {
        var n = FXCore.noise2D(nx * 0.007 + t * 0.05, ny * 0.007 + t * 0.02);
        var depth = (ny - groundY) / (H - groundY);
        var hue = 140 - depth * 10;
        var l = 16 + n * 8;
        ctx.fillStyle = 'hsl(' + Math.round(hue) + ',' + Math.round(35 + n * 8) + '%,' + Math.round(Math.max(8, l)) + '%)';
        ctx.fillRect(nx, ny, 14, 14);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawGrass() {
    var t = time * 0.001;
    for (var i = 0; i < grassBlades.length; i++) {
      var g = grassBlades[i];
      var sway = Math.sin(t * g.speed + g.phase) * 4;
      ctx.globalAlpha = (0.3 + progress * 0.3) * brightness;
      ctx.strokeStyle = g.color;
      ctx.lineWidth = g.width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(g.x, g.baseY);
      ctx.quadraticCurveTo(g.x + sway * 0.5, g.baseY - g.height * 0.5, g.x + sway, g.baseY - g.height);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawFlowers() {
    var t = time * 0.001;
    for (var i = 0; i < flowers.length; i++) {
      var f = flowers[i];
      if (progress < f.minProgress) continue;
      var sway = Math.sin(t * f.swaySpeed + f.phase) * 3;

      // Stem
      ctx.globalAlpha = (0.4 + progress * 0.3) * brightness;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(f.x, f.baseY);
      ctx.quadraticCurveTo(f.x + sway * 0.5, f.baseY - f.stemH * 0.5, f.x + sway, f.baseY - f.stemH);
      ctx.stroke();

      // Petals
      var fx = f.x + sway, fy = f.baseY - f.stemH;
      ctx.globalAlpha = (0.5 + progress * 0.4) * brightness;
      ctx.fillStyle = f.color;
      for (var p = 0; p < f.petals; p++) {
        var angle = (p / f.petals) * Math.PI * 2 + t * 0.2;
        var px = fx + Math.cos(angle) * f.petalSize;
        var py = fy + Math.sin(angle) * f.petalSize;
        ctx.beginPath();
        ctx.arc(px, py, f.petalSize * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      // Centre
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(fx, fy, f.petalSize * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawFireflies() {
    var t = time * 0.001;
    for (var i = 0; i < fireflies.length; i++) {
      var f = fireflies[i];
      if (progress < f.minProgress) continue;
      var nDrift = FXCore.noise2D(f.x * 0.008 + t * 0.25, f.y * 0.008 + i * 7) * 0.35;
      f.x += f.driftX + Math.sin(t * 0.4 + f.phase) * 0.15 + nDrift;
      f.y += f.driftY + Math.cos(t * 0.5 + f.phase) * 0.1 + nDrift * 0.3;
      if (f.x < 0) f.x = W; if (f.x > W) f.x = 0;
      if (f.y < H * 0.4) f.y = H * 0.85; if (f.y > H * 0.9) f.y = H * 0.4;

      var pulse = 0.3 + Math.sin(t * f.pulseSpeed + f.phase) * 0.4 + 0.3;
      ctx.globalAlpha = pulse * 0.5 * brightness;
      var fg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 5);
      fg.addColorStop(0, f.color + '0.4)');
      fg.addColorStop(1, f.color + '0)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size * 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = pulse * 0.8 * brightness;
      ctx.fillStyle = f.color + '0.9)';
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size * pulse, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawSoundSymbols() {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var i = 0; i < soundSymbols.length; i++) {
      var s = soundSymbols[i];
      s.y -= s.speed * 0.3;
      s.x += s.drift * 0.2;
      s.rotation += s.rotSpeed;
      if (s.y < H * 0.2) { s.y = H * 0.75; s.x = rand(W * 0.1, W * 0.9); }

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation);
      ctx.globalAlpha = s.opacity * (0.4 + progress * 0.6) * brightness;
      ctx.font = s.size + 'px "Fredoka One",cursive';
      ctx.fillStyle = 'rgba(200,230,255,0.5)';
      ctx.fillText(s.text, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // Screen-blend aurora glow and firefly bloom
  function drawMeadowGlow() {
    var t = time * 0.001;
    ctx.globalCompositeOperation = 'screen';

    // Aurora bloom — wide soft glow along aurora bands
    for (var i = 0; i < auroraWaves.length; i++) {
      var a = auroraWaves[i];
      var bandY = a.y + a.width * 0.5;
      var bloomH = a.width * 3;
      ctx.globalAlpha = (0.04 + progress * 0.05) * brightness;
      var ag = ctx.createLinearGradient(0, bandY - bloomH, 0, bandY + bloomH);
      ag.addColorStop(0, a.color + '0)');
      ag.addColorStop(0.3, a.color + '0.08)');
      ag.addColorStop(0.7, a.color + '0.05)');
      ag.addColorStop(1, a.color + '0)');
      ctx.fillStyle = ag;
      ctx.fillRect(0, bandY - bloomH, W, bloomH * 2);
    }

    // Horizon dusk glow
    ctx.globalAlpha = (0.03 + progress * 0.03) * brightness;
    var hg = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, W * 0.5);
    hg.addColorStop(0, 'rgba(255,180,120,0.1)');
    hg.addColorStop(0.5, 'rgba(255,150,100,0.04)');
    hg.addColorStop(1, 'rgba(255,150,100,0)');
    ctx.fillStyle = hg;
    ctx.fillRect(0, H * 0.3, W, H * 0.4);

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
    draw: function(context, w, h, t) {
      drawSky();
      drawAurora();
      drawMountains();
      drawHills();
      drawMeadow();
      drawMeadowNoise();
      drawGrass();
      drawFlowers();
      drawSoundSymbols();
      drawFireflies();
      drawMeadowGlow();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('phonics', scene);

  // ==================== PUBLIC API ====================
  window.ClassmatesPhonicsScene = {
    onCorrect: function(noteIndex) {
      if (!window.FXCore || !FXCore.isActive('phonics')) return;
      var s = FXCore.getSize();
      var count = 8 + Math.floor(progress * 8);
      FXCore.emit(s.w * 0.5, s.h * 0.4, 12, {
        spread: 6, rise: 2.5, decay: 0.018, size: 3,
        color: 'rgba(72,255,167,0.8)', shape: 'star', endColor: 'rgba(180,130,255,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.4, 6, {
        spread: 4, rise: 2, decay: 0.022, size: 2,
        color: 'rgba(255,230,120,0.7)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.35, count, {
        spread: 7, rise: 3, decay: 0.015, size: 3.5,
        color: 'rgba(100,200,255,0.8)', shape: 'star', endColor: 'rgba(72,255,167,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.4, Math.floor(count * 0.6), {
        spread: 2, rise: 1.2, decay: 0.03, size: 1.2,
        color: 'rgba(220,240,255,0.5)'
      });
      if (window.FXSound) FXSound.play('chime');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('phonics')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 2, rise: -0.2, gravity: 0.02, decay: 0.015, size: 2,
        color: 'rgba(100,80,120,0.4)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.5, 3, {
        spread: 3, rise: -0.3, gravity: 0.03, decay: 0.018, size: 2.5,
        color: 'rgba(60,40,80,0.5)'
      });
      if(FXCore.shake) FXCore.shake(3, 150);
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('phonics')) return;
      var s = FXCore.getSize();
      var colors = ['rgba(72,255,167,0.7)','rgba(100,200,255,0.7)','rgba(180,130,255,0.7)','rgba(255,230,120,0.7)','rgba(244,114,182,0.7)'];
      for (var i = 0; i < colors.length; i++) {
        FXCore.emit(s.w * (0.15 + i * 0.175), s.h * 0.4, 5, {
          spread: 7, rise: 3, decay: 0.012, size: 4, color: colors[i], shape: 'star'
        });
      }
      var auroraColors = ['rgba(72,255,167,0.7)','rgba(100,200,255,0.7)','rgba(180,130,255,0.7)','rgba(120,230,200,0.7)','rgba(244,114,182,0.7)','rgba(150,180,255,0.7)','rgba(200,255,180,0.7)','rgba(140,100,240,0.7)'];
      for (var j = 0; j < auroraColors.length; j++) {
        FXCore.emit(s.w * (0.08 + j * 0.12), s.h * (0.25 + Math.sin(j) * 0.1), 8, {
          spread: 9, rise: 3.5, decay: 0.01, size: 4.5, color: auroraColors[j], shape: 'star'
        });
      }
      FXCore.emit(s.w * 0.5, s.h * 0.4, 15, {
        spread: 10, rise: 2, decay: 0.008, size: 5,
        color: 'rgba(255,215,0,0.8)', shape: 'star', endColor: 'rgba(255,215,0,0)'
      });
      if (window.FXSound) FXSound.playSequence(['correct','streak','complete'], 100);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
