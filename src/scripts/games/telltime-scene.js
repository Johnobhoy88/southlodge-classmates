(function(){
  // ============================================================
  // TELLING TIME — "Clockwork Tower"
  // Inside the mechanism of a grand clock tower. Massive brass
  // gears turn, pendulum swings, dusty light streams through.
  // GRAND MECHANICAL — dwarfed by enormous clockwork.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.5;
  var time = 0;
  var pendulumAngle = 0;

  var gears = [];
  var dustMotes = [];
  var springs = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

  var W = 0, H = 0, ctx = null;

  function generateScene() {
    // Gears — different sizes, meshing
    gears = [
      // Massive back gear
      { x: W * 0.7, y: H * 0.35, r: Math.min(W, H) * 0.3, teeth: 24, speed: 0.08, dir: 1, depth: 'back' },
      // Medium gears
      { x: W * 0.25, y: H * 0.4, r: Math.min(W, H) * 0.15, teeth: 14, speed: -0.16, dir: -1, depth: 'mid' },
      { x: W * 0.38, y: H * 0.25, r: Math.min(W, H) * 0.1, teeth: 10, speed: 0.22, dir: 1, depth: 'mid' },
      { x: W * 0.15, y: H * 0.65, r: Math.min(W, H) * 0.12, teeth: 12, speed: -0.18, dir: -1, depth: 'mid' },
      // Small front gears
      { x: W * 0.85, y: H * 0.7, r: Math.min(W, H) * 0.06, teeth: 8, speed: 0.35, dir: 1, depth: 'front', minProgress: 0.3 },
      { x: W * 0.1, y: H * 0.25, r: Math.min(W, H) * 0.05, teeth: 7, speed: -0.4, dir: -1, depth: 'front', minProgress: 0.5 }
    ];

    // Dust motes in window light
    dustMotes = [];
    for (var i = 0; i < 30; i++) {
      dustMotes.push({
        x: rand(W * 0.1, W * 0.6), y: rand(H * 0.05, H * 0.7),
        size: rand(0.5, 2), speedX: rand(-0.03, 0.05),
        speedY: rand(-0.03, 0.03), opacity: rand(0.1, 0.3),
        phase: rand(0, Math.PI * 2)
      });
    }

    // Small springs/mechanisms
    springs = [];
    for (var i = 0; i < 5; i++) {
      springs.push({
        x: rand(W * 0.1, W * 0.9), y: rand(H * 0.5, H * 0.85),
        coils: Math.floor(rand(3, 6)), width: rand(6, 12), height: rand(10, 20),
        phase: rand(0, Math.PI * 2)
      });
    }
  }

  // ==================== DRAWING ====================

  function drawWall() {
    var b = brightness;
    // Dark brick interior
    var wg = ctx.createLinearGradient(0, 0, 0, H);
    wg.addColorStop(0, 'hsl(20,' + Math.round(15 + progress * 8) + '%,' + Math.round(12 * b) + '%)');
    wg.addColorStop(0.5, 'hsl(15,' + Math.round(12 + progress * 6) + '%,' + Math.round(10 * b) + '%)');
    wg.addColorStop(1, 'hsl(10,' + Math.round(10) + '%,' + Math.round(8 * b) + '%)');
    ctx.fillStyle = wg;
    ctx.fillRect(0, 0, W, H);

    // Brick texture hints
    ctx.globalAlpha = 0.03 * b;
    ctx.strokeStyle = '#4a3020';
    ctx.lineWidth = 0.5;
    var brickH = 12, brickW = 28;
    for (var y = 0; y < H; y += brickH) {
      var offset = (Math.floor(y / brickH) % 2) * brickW * 0.5;
      for (var x = offset; x < W; x += brickW) {
        ctx.strokeRect(x, y, brickW, brickH);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawWindow() {
    var wx = W * 0.18, wy = H * 0.08, ww = W * 0.1, wh = H * 0.2;
    ctx.globalAlpha = (0.4 + progress * 0.3) * brightness;

    // Window frame
    ctx.fillStyle = '#3a2a18';
    ctx.beginPath();
    ctx.moveTo(wx - 2, wy + wh);
    ctx.lineTo(wx - 2, wy + ww * 0.4);
    ctx.arc(wx + ww * 0.5, wy + ww * 0.4, ww * 0.5 + 2, Math.PI, 0);
    ctx.lineTo(wx + ww + 2, wy + wh);
    ctx.closePath();
    ctx.fill();

    // Window glass — bright sky
    ctx.fillStyle = 'hsl(40,' + Math.round(50 + progress * 15) + '%,' + Math.round(70 * brightness) + '%)';
    ctx.beginPath();
    ctx.moveTo(wx, wy + wh);
    ctx.lineTo(wx, wy + ww * 0.4);
    ctx.arc(wx + ww * 0.5, wy + ww * 0.4, ww * 0.5, Math.PI, 0);
    ctx.lineTo(wx + ww, wy + wh);
    ctx.closePath();
    ctx.fill();

    // Light beams from window
    var lightAlpha = (0.04 + progress * 0.06) * brightness;
    ctx.globalAlpha = lightAlpha;
    var lg = ctx.createLinearGradient(wx, wy, wx + W * 0.4, H * 0.8);
    lg.addColorStop(0, 'rgba(255,220,130,0.2)');
    lg.addColorStop(0.5, 'rgba(255,200,100,0.06)');
    lg.addColorStop(1, 'rgba(255,180,80,0)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(wx, wy + wh * 0.3);
    ctx.lineTo(wx + ww, wy + wh * 0.2);
    ctx.lineTo(wx + W * 0.45, H * 0.9);
    ctx.lineTo(wx + W * 0.2, H * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawGear(g) {
    var t = time * 0.001;
    if (g.minProgress && progress < g.minProgress) return;
    var rotation = t * g.speed * g.dir * (0.5 + progress * 0.5);
    var alpha = g.depth === 'back' ? 0.25 : g.depth === 'mid' ? 0.35 : 0.45;
    alpha = (alpha + progress * 0.2) * brightness;

    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;

    // Gear body
    var gColor = g.depth === 'back' ? '#8a7040' : g.depth === 'mid' ? '#a08050' : '#b89060';
    ctx.fillStyle = gColor;
    ctx.beginPath();
    ctx.arc(0, 0, g.r * 0.72, 0, Math.PI * 2);
    ctx.fill();

    // Teeth
    for (var i = 0; i < g.teeth; i++) {
      var angle = (i / g.teeth) * Math.PI * 2;
      var inner = g.r * 0.68, outer = g.r;
      var halfTooth = Math.PI / g.teeth * 0.55;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle - halfTooth) * inner, Math.sin(angle - halfTooth) * inner);
      ctx.lineTo(Math.cos(angle - halfTooth * 0.5) * outer, Math.sin(angle - halfTooth * 0.5) * outer);
      ctx.lineTo(Math.cos(angle + halfTooth * 0.5) * outer, Math.sin(angle + halfTooth * 0.5) * outer);
      ctx.lineTo(Math.cos(angle + halfTooth) * inner, Math.sin(angle + halfTooth) * inner);
      ctx.fill();
    }

    // Spokes (4)
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    for (var i = 0; i < 4; i++) {
      var angle = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle - 0.08) * g.r * 0.2, Math.sin(angle - 0.08) * g.r * 0.2);
      ctx.lineTo(Math.cos(angle - 0.04) * g.r * 0.6, Math.sin(angle - 0.04) * g.r * 0.6);
      ctx.lineTo(Math.cos(angle + 0.04) * g.r * 0.6, Math.sin(angle + 0.04) * g.r * 0.6);
      ctx.lineTo(Math.cos(angle + 0.08) * g.r * 0.2, Math.sin(angle + 0.08) * g.r * 0.2);
      ctx.fill();
    }

    // Centre hub
    ctx.fillStyle = '#6a5030';
    ctx.beginPath();
    ctx.arc(0, 0, g.r * 0.18, 0, Math.PI * 2);
    ctx.fill();
    // Centre axle
    ctx.fillStyle = '#4a3520';
    ctx.beginPath();
    ctx.arc(0, 0, g.r * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Highlight arc
    ctx.globalAlpha = alpha * 0.2;
    ctx.strokeStyle = '#d4b880';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(-g.r * 0.15, -g.r * 0.15, g.r * 0.55, -0.5, 0.8);
    ctx.stroke();

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawConnectingRod() {
    ctx.globalAlpha = (0.3 + progress * 0.2) * brightness;
    ctx.fillStyle = '#7a6040';
    // Horizontal rod linking the massive gear to the mid gear
    var y = H * 0.38;
    ctx.fillRect(W * 0.25, y - 3, W * 0.45, 6);
    // Rod ends (bolts)
    ctx.fillStyle = '#5a4530';
    ctx.beginPath();
    ctx.arc(W * 0.25, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W * 0.7, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawPendulum() {
    var t = time * 0.001;
    var swingWidth = 0.3 + progress * 0.15;
    pendulumAngle = Math.sin(t * 1.2) * swingWidth;
    var px = W * 0.5, py = H * 0.12;
    var pendLen = H * 0.55;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(pendulumAngle);
    ctx.globalAlpha = (0.4 + progress * 0.3) * brightness;

    // Rod
    ctx.strokeStyle = '#8a7050';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, pendLen);
    ctx.stroke();

    // Weight (bob)
    var bg = ctx.createRadialGradient(-3, pendLen - 3, 0, 0, pendLen, 15);
    bg.addColorStop(0, '#d4b060');
    bg.addColorStop(0.7, '#a08040');
    bg.addColorStop(1, '#806030');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(0, pendLen, 14, 0, Math.PI * 2);
    ctx.fill();
    // Bob highlight
    ctx.globalAlpha = 0.15 * brightness;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-4, pendLen - 4, 5, 0, Math.PI * 2);
    ctx.fill();

    // Pivot at top
    ctx.globalAlpha = (0.4 + progress * 0.3) * brightness;
    ctx.fillStyle = '#5a4530';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawSprings() {
    var t = time * 0.001;
    for (var i = 0; i < springs.length; i++) {
      var s = springs[i];
      var compress = 0.8 + Math.sin(t * 2 + s.phase) * 0.1;
      ctx.globalAlpha = (0.15 + progress * 0.15) * brightness;
      ctx.strokeStyle = '#8a7858';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (var c = 0; c < s.coils; c++) {
        var cy = s.y + c * (s.height / s.coils) * compress;
        var dir = c % 2 === 0 ? 1 : -1;
        ctx.lineTo(s.x + dir * s.width * 0.5, cy);
        ctx.lineTo(s.x - dir * s.width * 0.5, cy + (s.height / s.coils) * compress * 0.5);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawClockFaceGhost() {
    // Faint clock face outline seen from behind
    var cx = W * 0.5, cy = H * 0.4, r = Math.min(W, H) * 0.22;
    ctx.globalAlpha = (0.04 + progress * 0.04) * brightness;
    ctx.strokeStyle = '#a09070';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    // Hour marks (reversed, seen from behind)
    for (var i = 0; i < 12; i++) {
      var angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r * 0.85, cy + Math.sin(angle) * r * 0.85);
      ctx.lineTo(cx + Math.cos(angle) * r * 0.95, cy + Math.sin(angle) * r * 0.95);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawDustMotes() {
    var t = time * 0.001;
    for (var i = 0; i < dustMotes.length; i++) {
      var d = dustMotes[i];
      d.x += d.speedX + Math.sin(t * 0.3 + d.phase) * 0.05;
      d.y += d.speedY + Math.cos(t * 0.4 + d.phase) * 0.04;
      if (d.x < W * 0.05) d.x = W * 0.6;
      if (d.x > W * 0.65) d.x = W * 0.05;
      if (d.y < 0) d.y = H * 0.7;
      if (d.y > H * 0.75) d.y = 0;

      // Brighter in window light beam
      var inBeam = (d.x < W * 0.5 && d.y < H * 0.6) ? 1.5 : 1;
      ctx.globalAlpha = d.opacity * (0.5 + progress * 0.5) * brightness * inBeam;
      ctx.fillStyle = '#ffd780';
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ==================== SCENE INTERFACE ====================
  var scene = {
    enter: function(canvas, context, w, h) {
      ctx = context; W = w; H = h;
      progress = 0; targetProgress = 0; brightness = 0.5;
      pendulumAngle = 0;
      generateScene();
    },
    resize: function(w, h) { W = w; H = h; generateScene(); },
    update: function(dt, t) {
      time = t;
      progress += (targetProgress - progress) * 0.03;
      brightness += ((0.5 + progress * 0.5) - brightness) * 0.02;
    },
    draw: function() {
      drawWall();
      drawWindow();
      // Back gears
      for (var i = 0; i < gears.length; i++) { if (gears[i].depth === 'back') drawGear(gears[i]); }
      drawClockFaceGhost();
      drawConnectingRod();
      // Mid gears
      for (var i = 0; i < gears.length; i++) { if (gears[i].depth === 'mid') drawGear(gears[i]); }
      drawPendulum();
      drawSprings();
      // Front gears
      for (var i = 0; i < gears.length; i++) { if (gears[i].depth === 'front') drawGear(gears[i]); }
      drawDustMotes();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('telltime', scene);

  window.ClassmatesTelltimeScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('telltime')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.4, 10, {
        spread: 5, rise: 1.5, decay: 0.02, size: 3,
        color: 'rgba(200,170,100,0.8)', shape: 'star', endColor: 'rgba(255,220,150,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.4, 5, {
        spread: 3, rise: 1, decay: 0.025, size: 2,
        color: 'rgba(180,150,80,0.6)'
      });
      if (window.FXSound) FXSound.play('click');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('telltime')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 2, rise: -0.2, gravity: 0.02, decay: 0.015, size: 2,
        color: 'rgba(90,70,50,0.4)'
      });
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('telltime')) return;
      var s = FXCore.getSize();
      // Bell chime burst — brass tones
      for (var i = 0; i < 5; i++) {
        FXCore.emit(s.w * (0.2 + i * 0.15), s.h * 0.35, 5, {
          spread: 6, rise: 2.5, decay: 0.012, size: 3.5,
          color: i % 2 === 0 ? 'rgba(200,170,100,0.7)' : 'rgba(255,220,150,0.6)',
          shape: 'star'
        });
      }
      if (window.FXSound) FXSound.playSequence(['click','chime','complete'], 120);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
