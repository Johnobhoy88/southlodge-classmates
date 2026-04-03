(function(){
  // ============================================================
  // GRAMMAR — "Colour Factory"
  // A bright factory floor with conveyor belts, coloured bins,
  // gears, pipes, and sorting lights. Words get categorised.
  // MECHANICAL and BRIGHT — first industrial scene.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.6;
  var time = 0;

  var gears = [];
  var pipes = [];
  var bins = [];
  var lights = [];
  var steamPuffs = [];
  var rivets = [];
  var conveyorOffset = 0;
  var floatingLabels = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

  var W = 0, H = 0, ctx = null;

  var TYPES = [
    { name: 'NOUN', short: 'N', color: '#3498db', dark: '#2471a3' },
    { name: 'VERB', short: 'V', color: '#e74c3c', dark: '#c0392b' },
    { name: 'ADJ', short: 'A', color: '#f1c40f', dark: '#d4ac0d' },
    { name: 'ADV', short: 'Av', color: '#2ecc71', dark: '#27ae60' }
  ];

  function generateScene() {
    // Gears on wall
    gears = [
      { x: W * 0.08, y: H * 0.2, r: 28, teeth: 10, speed: 0.4, dir: 1 },
      { x: W * 0.08 + 42, y: H * 0.2 + 18, r: 18, teeth: 8, speed: -0.65, dir: -1 },
      { x: W * 0.92, y: H * 0.18, r: 32, teeth: 12, speed: 0.3, dir: 1 },
      { x: W * 0.92 - 35, y: H * 0.18 - 25, r: 15, teeth: 7, speed: -0.7, dir: -1 },
      { x: W * 0.5, y: H * 0.08, r: 20, teeth: 9, speed: 0.5, dir: 1, minProgress: 0.3 }
    ];

    // Coloured pipes across top
    pipes = [];
    for (var i = 0; i < TYPES.length; i++) {
      pipes.push({
        x1: W * (0.15 + i * 0.2), y1: H * 0.02,
        x2: W * (0.15 + i * 0.18), y2: H * 0.12,
        color: TYPES[i].color, width: 8
      });
    }

    // Sorting bins
    bins = [];
    for (var i = 0; i < TYPES.length; i++) {
      bins.push({
        x: W * (0.12 + i * 0.22), y: H * 0.82,
        w: W * 0.14, h: H * 0.12,
        type: TYPES[i]
      });
    }

    // Indicator lights
    lights = [];
    for (var i = 0; i < TYPES.length; i++) {
      lights.push({
        x: W * (0.19 + i * 0.22), y: H * 0.76,
        r: 6, type: TYPES[i], phase: rand(0, Math.PI * 2)
      });
    }

    // Rivets on wall
    rivets = [];
    for (var i = 0; i < 30; i++) {
      rivets.push({ x: rand(0, W), y: rand(0, H * 0.7), size: rand(1.5, 3) });
    }

    // Steam puffs from pipe joints
    steamPuffs = [];
    for (var i = 0; i < 6; i++) {
      steamPuffs.push({
        x: rand(W * 0.15, W * 0.85), y: H * 0.1 + rand(-5, 5),
        size: rand(6, 14), opacity: rand(0.06, 0.12),
        driftX: rand(-0.1, 0.1), driftY: rand(-0.15, -0.05),
        phase: rand(0, Math.PI * 2), minProgress: i < 3 ? 0 : 0.4
      });
    }

    // Floating word-type labels
    floatingLabels = [];
    var labels = ['N','V','Adj','Adv','noun','verb'];
    for (var i = 0; i < 8; i++) {
      floatingLabels.push({
        x: rand(W * 0.1, W * 0.9), y: rand(H * 0.15, H * 0.65),
        text: labels[i % labels.length], size: rand(10, 18),
        speed: rand(0.04, 0.1), drift: rand(-0.08, 0.08),
        opacity: rand(0.04, 0.08), rotation: rand(-0.15, 0.15),
        rotSpeed: rand(-0.002, 0.002),
        color: TYPES[i % TYPES.length].color
      });
    }
  }

  // ==================== DRAWING ====================

  function drawWall() {
    var b = brightness;
    // Light grey metal wall
    var wg = ctx.createLinearGradient(0, 0, 0, H);
    wg.addColorStop(0, 'hsl(210,' + Math.round(8 + progress * 5) + '%,' + Math.round(55 * b) + '%)');
    wg.addColorStop(0.5, 'hsl(210,' + Math.round(6 + progress * 4) + '%,' + Math.round(50 * b) + '%)');
    wg.addColorStop(1, 'hsl(210,' + Math.round(5) + '%,' + Math.round(42 * b) + '%)');
    ctx.fillStyle = wg;
    ctx.fillRect(0, 0, W, H);

    // Metal panel seams
    ctx.strokeStyle = 'rgba(120,130,140,' + (0.08 * b) + ')';
    ctx.lineWidth = 1;
    for (var x = 0; x < W; x += W / 5) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H * 0.7); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(0, H * 0.35); ctx.lineTo(W, H * 0.35); ctx.stroke();

    // Rivets
    ctx.fillStyle = 'rgba(160,170,180,' + (0.2 * b) + ')';
    for (var i = 0; i < rivets.length; i++) {
      ctx.beginPath();
      ctx.arc(rivets[i].x, rivets[i].y, rivets[i].size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPipes() {
    ctx.globalAlpha = (0.5 + progress * 0.3) * brightness;
    for (var i = 0; i < pipes.length; i++) {
      var p = pipes[i];
      ctx.strokeStyle = p.color;
      ctx.lineWidth = p.width;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p.x1, p.y1);
      ctx.quadraticCurveTo((p.x1 + p.x2) / 2, (p.y1 + p.y2) / 2 + 15, p.x2, p.y2);
      ctx.stroke();
      // Pipe joint circle
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x2, p.y2, p.width * 0.6, 0, Math.PI * 2);
      ctx.fill();
      // Highlight on pipe
      ctx.globalAlpha = 0.15 * brightness;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x1 + 2, p.y1);
      ctx.quadraticCurveTo((p.x1 + p.x2) / 2 + 2, (p.y1 + p.y2) / 2 + 13, p.x2 + 2, p.y2 - 2);
      ctx.stroke();
      ctx.globalAlpha = (0.5 + progress * 0.3) * brightness;
    }
    ctx.globalAlpha = 1;
  }

  function drawGears() {
    var t = time * 0.001;
    for (var i = 0; i < gears.length; i++) {
      var g = gears[i];
      if (g.minProgress && progress < g.minProgress) continue;
      var rotation = t * g.speed * g.dir * (0.4 + progress * 0.6);
      ctx.save();
      ctx.translate(g.x, g.y);
      ctx.rotate(rotation);
      ctx.globalAlpha = (0.3 + progress * 0.3) * brightness;
      // Gear body
      ctx.fillStyle = '#b0a090';
      ctx.beginPath();
      ctx.arc(0, 0, g.r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      // Teeth
      for (var t2 = 0; t2 < g.teeth; t2++) {
        var angle = (t2 / g.teeth) * Math.PI * 2;
        var inner = g.r * 0.65, outer = g.r;
        var halfTooth = Math.PI / g.teeth * 0.6;
        ctx.beginPath();
        ctx.moveTo(Math.cos(angle - halfTooth) * inner, Math.sin(angle - halfTooth) * inner);
        ctx.lineTo(Math.cos(angle - halfTooth * 0.5) * outer, Math.sin(angle - halfTooth * 0.5) * outer);
        ctx.lineTo(Math.cos(angle + halfTooth * 0.5) * outer, Math.sin(angle + halfTooth * 0.5) * outer);
        ctx.lineTo(Math.cos(angle + halfTooth) * inner, Math.sin(angle + halfTooth) * inner);
        ctx.fill();
      }
      // Centre hole
      ctx.fillStyle = 'rgba(80,80,90,' + (0.4 * brightness) + ')';
      ctx.beginPath();
      ctx.arc(0, 0, g.r * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawConveyor() {
    var t = time * 0.001;
    conveyorOffset = (t * 30 * (0.3 + progress * 0.7)) % 20;
    var cy = H * 0.7, ch = 14;
    ctx.globalAlpha = (0.45 + progress * 0.25) * brightness;
    // Belt
    ctx.fillStyle = '#4a4a52';
    ctx.fillRect(0, cy, W, ch);
    // Moving dashes
    ctx.strokeStyle = '#6a6a72';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 8]);
    ctx.lineDashOffset = -conveyorOffset;
    ctx.beginPath();
    ctx.moveTo(0, cy + ch / 2);
    ctx.lineTo(W, cy + ch / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    // Belt edges
    ctx.fillStyle = '#3a3a42';
    ctx.fillRect(0, cy - 2, W, 3);
    ctx.fillRect(0, cy + ch - 1, W, 3);
    // Rollers at ends
    ctx.fillStyle = '#5a5a62';
    ctx.beginPath();
    ctx.arc(15, cy + ch / 2, ch / 2 + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(W - 15, cy + ch / 2, ch / 2 + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawBins() {
    for (var i = 0; i < bins.length; i++) {
      var b = bins[i];
      ctx.globalAlpha = (0.45 + progress * 0.3) * brightness;
      // Bin body
      ctx.fillStyle = b.type.dark;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x + b.w, b.y);
      ctx.lineTo(b.x + b.w - 4, b.y + b.h);
      ctx.lineTo(b.x + 4, b.y + b.h);
      ctx.closePath();
      ctx.fill();
      // Front face lighter
      ctx.fillStyle = b.type.color;
      ctx.globalAlpha = (0.35 + progress * 0.25) * brightness;
      ctx.fillRect(b.x + 2, b.y + 2, b.w - 4, b.h * 0.3);
      // Label
      ctx.globalAlpha = (0.5 + progress * 0.3) * brightness;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px "Fredoka One",cursive';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(b.type.name, b.x + b.w / 2, b.y + b.h * 0.15);
    }
    ctx.globalAlpha = 1;
  }

  function drawLights() {
    var t = time * 0.001;
    for (var i = 0; i < lights.length; i++) {
      var l = lights[i];
      var pulse = 0.5 + Math.sin(t * 2 + l.phase) * 0.3;
      var glow = (0.3 + progress * 0.5) * brightness * pulse;
      // Glow halo
      ctx.globalAlpha = glow * 0.3;
      var lg = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r * 4);
      lg.addColorStop(0, l.type.color);
      lg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.r * 4, 0, Math.PI * 2);
      ctx.fill();
      // Light bulb
      ctx.globalAlpha = glow;
      ctx.fillStyle = l.type.color;
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
      ctx.fill();
      // Highlight
      ctx.globalAlpha = glow * 0.5;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(l.x - 1.5, l.y - 1.5, l.r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawSteam() {
    var t = time * 0.001;
    for (var i = 0; i < steamPuffs.length; i++) {
      var s = steamPuffs[i];
      if (s.minProgress && progress < s.minProgress) continue;
      var sx = s.x + Math.sin(t * 0.5 + s.phase) * 8 + s.driftX * t * 15;
      var sy = s.y + s.driftY * t * 10 + Math.cos(t * 0.3 + s.phase) * 3;
      if (sy < -20) sy += H * 0.15;
      ctx.globalAlpha = s.opacity * (0.4 + progress * 0.5) * brightness;
      ctx.fillStyle = 'rgba(200,210,220,0.4)';
      ctx.beginPath();
      ctx.arc(sx, sy, s.size * (0.6 + progress * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawFloatingLabels() {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (var i = 0; i < floatingLabels.length; i++) {
      var l = floatingLabels[i];
      l.y -= l.speed * 0.3;
      l.x += l.drift * 0.2;
      l.rotation += l.rotSpeed;
      if (l.y < H * 0.05) { l.y = H * 0.7; l.x = rand(W * 0.1, W * 0.9); }
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rotation);
      ctx.globalAlpha = l.opacity * (0.4 + progress * 0.6) * brightness;
      ctx.font = 'bold ' + l.size + 'px "Fredoka One",cursive';
      ctx.fillStyle = l.color;
      ctx.fillText(l.text, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // Floor
  function drawFloor() {
    ctx.globalAlpha = brightness * 0.6;
    var fg = ctx.createLinearGradient(0, H * 0.85, 0, H);
    fg.addColorStop(0, 'hsl(210,5%,' + Math.round(35 * brightness) + '%)');
    fg.addColorStop(1, 'hsl(210,4%,' + Math.round(30 * brightness) + '%)');
    ctx.fillStyle = fg;
    ctx.fillRect(0, H * 0.85, W, H * 0.15);
    // Floor line
    ctx.strokeStyle = 'rgba(100,100,110,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, H * 0.85); ctx.lineTo(W, H * 0.85); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ==================== SCENE INTERFACE ====================
  var scene = {
    enter: function(canvas, context, w, h) {
      ctx = context; W = w; H = h;
      progress = 0; targetProgress = 0; brightness = 0.6;
      generateScene();
    },
    resize: function(w, h) { W = w; H = h; generateScene(); },
    update: function(dt, t) {
      time = t;
      progress += (targetProgress - progress) * 0.03;
      brightness += ((0.6 + progress * 0.4) - brightness) * 0.02;
    },
    draw: function() {
      drawWall();
      drawPipes();
      drawGears();
      drawConveyor();
      drawFloor();
      drawBins();
      drawLights();
      drawSteam();
      drawFloatingLabels();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('grammar', scene);

  window.ClassmatesGrammarScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('grammar')) return;
      var s = FXCore.getSize();
      var typeColor = TYPES[idx % TYPES.length];
      FXCore.emit(s.w * 0.5, s.h * 0.4, 10, {
        spread: 5, rise: 2, decay: 0.02, size: 3,
        color: typeColor.color.replace(')', ',0.8)').replace('rgb', 'rgba'),
        shape: 'diamond', endColor: 'rgba(255,255,255,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.4, 5, {
        spread: 3, rise: 1.5, decay: 0.025, size: 2,
        color: 'rgba(200,210,220,0.6)'
      });
      if (window.FXSound) FXSound.play('click');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('grammar')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 2, rise: -0.2, gravity: 0.02, decay: 0.015, size: 2,
        color: 'rgba(100,100,110,0.4)'
      });
      if (window.FXSound) FXSound.play('wrong');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('grammar')) return;
      var s = FXCore.getSize();
      for (var i = 0; i < TYPES.length; i++) {
        FXCore.emit(s.w * (0.2 + i * 0.2), s.h * 0.4, 6, {
          spread: 6, rise: 3, decay: 0.012, size: 4,
          color: TYPES[i].color.replace(')', ',0.7)').replace('#', 'rgba('),
          shape: 'star'
        });
      }
      // Fix: use rgba strings directly
      FXCore.emit(s.w * 0.5, s.h * 0.35, 10, {
        spread: 8, rise: 3, decay: 0.012, size: 4,
        color: 'rgba(52,152,219,0.7)', shape: 'star'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.35, 10, {
        spread: 8, rise: 3, decay: 0.012, size: 4,
        color: 'rgba(231,76,60,0.7)', shape: 'diamond'
      });
      if (window.FXSound) FXSound.playSequence(['click','correct','complete'], 100);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
