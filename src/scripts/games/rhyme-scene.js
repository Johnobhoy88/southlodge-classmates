(function(){
  // ============================================================
  // RHYMING — "Music Box"
  // A magical open music box. Ballerina spins, notes float,
  // mirror glows, sparkles shimmer. Precious, delicate, jewel-like.
  // The opposite of the industrial factory — tiny and magical.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.75;
  var time = 0;
  var ballerinaAngle = 0;

  var notes = [];
  var sparkles = [];
  var doilyPoints = [];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

  var W = 0, H = 0, ctx = null;

  function generateScene() {
    // Floating musical notes
    var NOTE_CHARS = ['\u266A','\u266B','\u266C','\u2669','\u2605'];
    notes = [];
    for (var i = 0; i < 15; i++) {
      notes.push({
        x: rand(W * 0.2, W * 0.8), y: rand(H * 0.1, H * 0.6),
        char: pick(NOTE_CHARS), size: rand(12, 24),
        speed: rand(0.15, 0.4), drift: rand(-0.15, 0.15),
        rotation: rand(-0.3, 0.3), rotSpeed: rand(-0.008, 0.008),
        opacity: rand(0.08, 0.2),
        color: pick(['#ffd700','#f0c050','#e8b440','#daa520','#ffdf80']),
        minProgress: i < 6 ? 0 : (i < 11 ? 0.25 : 0.5)
      });
    }

    // Star sparkles
    sparkles = [];
    for (var i = 0; i < 25; i++) {
      sparkles.push({
        x: rand(W * 0.15, W * 0.85), y: rand(H * 0.1, H * 0.75),
        size: rand(1, 3), phase: rand(0, Math.PI * 2),
        speed: rand(2, 5),
        minProgress: i < 10 ? 0 : (i < 18 ? 0.3 : 0.6)
      });
    }

    // Doily points for lace pattern
    doilyPoints = [];
    for (var i = 0; i < 24; i++) {
      doilyPoints.push({ angle: (i / 24) * Math.PI * 2, r1: rand(0.85, 1), r2: rand(0.6, 0.75) });
    }
  }

  // ==================== DRAWING ====================

  function drawBackground() {
    var b = brightness;
    // Soft mauve/lavender satin
    var bg = ctx.createRadialGradient(W * 0.5, H * 0.45, W * 0.1, W * 0.5, H * 0.5, W * 0.7);
    bg.addColorStop(0, 'hsl(280,' + Math.round(20 + progress * 10) + '%,' + Math.round(35 * b) + '%)');
    bg.addColorStop(0.4, 'hsl(270,' + Math.round(18 + progress * 8) + '%,' + Math.round(28 * b) + '%)');
    bg.addColorStop(1, 'hsl(260,' + Math.round(15) + '%,' + Math.round(20 * b) + '%)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
  }

  // Noise satin texture — organic velvet/fabric shimmer
  function drawSatinNoise() {
    var t = time * 0.001;
    var noiseAlpha = (0.02 + progress * 0.018) * brightness;
    ctx.globalAlpha = noiseAlpha;
    for (var nx = 0; nx < W; nx += 16) {
      for (var ny = 0; ny < H; ny += 16) {
        var n = FXCore.noise2D(nx * 0.005 + t * 0.04, ny * 0.005 + t * 0.02);
        var l = 25 + n * 10;
        ctx.fillStyle = 'hsl(' + Math.round(275 + n * 10) + ',' + Math.round(15 + n * 5) + '%,' + Math.round(Math.max(10, l)) + '%)';
        ctx.fillRect(nx, ny, 16, 16);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawDoily() {
    var cx = W * 0.5, cy = H * 0.55;
    var r = Math.min(W, H) * 0.35;
    ctx.globalAlpha = (0.06 + progress * 0.06) * brightness;
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 0.5;

    // Outer scallop edge
    ctx.beginPath();
    for (var i = 0; i < doilyPoints.length; i++) {
      var p = doilyPoints[i];
      var nextP = doilyPoints[(i + 1) % doilyPoints.length];
      var x1 = cx + Math.cos(p.angle) * r * p.r1;
      var y1 = cy + Math.sin(p.angle) * r * p.r1 * 0.5;
      var x2 = cx + Math.cos(nextP.angle) * r * nextP.r1;
      var y2 = cy + Math.sin(nextP.angle) * r * nextP.r1 * 0.5;
      var cpx = cx + Math.cos((p.angle + nextP.angle) / 2) * r * 1.08;
      var cpy = cy + Math.sin((p.angle + nextP.angle) / 2) * r * 0.54;
      if (i === 0) ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(cpx, cpy, x2, y2);
    }
    ctx.closePath();
    ctx.stroke();

    // Inner pattern rings
    for (var ring = 0.3; ring < 0.9; ring += 0.2) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, r * ring, r * ring * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Radial spokes
    for (var i = 0; i < 12; i++) {
      var angle = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * r * 0.15, cy + Math.sin(angle) * r * 0.075);
      ctx.lineTo(cx + Math.cos(angle) * r * 0.9, cy + Math.sin(angle) * r * 0.45);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawMusicBox() {
    var bx = W * 0.28, by = H * 0.35;
    var bw = W * 0.44, bh = H * 0.35;
    ctx.globalAlpha = (0.5 + progress * 0.3) * brightness;

    // Box body — dark wood with gold trim
    ctx.fillStyle = '#3a1f0a';
    ctx.fillRect(bx, by, bw, bh);
    // Wood grain
    ctx.strokeStyle = 'rgba(80,45,15,0.15)';
    ctx.lineWidth = 0.5;
    for (var y = by + 5; y < by + bh; y += 8) {
      ctx.beginPath();
      ctx.moveTo(bx, y + Math.sin(y * 0.1) * 1.5);
      ctx.lineTo(bx + bw, y + Math.sin(y * 0.1 + 1) * 1.5);
      ctx.stroke();
    }
    // Gold trim edges
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 2;
    ctx.strokeRect(bx + 2, by + 2, bw - 4, bh - 4);
    // Corner ornaments
    var corners = [[bx + 6, by + 6],[bx + bw - 6, by + 6],[bx + 6, by + bh - 6],[bx + bw - 6, by + bh - 6]];
    ctx.fillStyle = '#c9a84c';
    for (var i = 0; i < corners.length; i++) {
      ctx.beginPath();
      ctx.arc(corners[i][0], corners[i][1], 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Velvet interior
    var vg = ctx.createLinearGradient(bx + 8, by + 8, bx + bw - 8, by + bh - 8);
    vg.addColorStop(0, '#6b1a2a');
    vg.addColorStop(0.5, '#8b2a3a');
    vg.addColorStop(1, '#5a1520');
    ctx.fillStyle = vg;
    ctx.fillRect(bx + 6, by + 6, bw - 12, bh - 12);

    // Velvet sheen
    ctx.globalAlpha = 0.05 * brightness;
    ctx.fillStyle = '#ff8888';
    ctx.fillRect(bx + 10, by + 10, bw - 20, bh * 0.3);
    ctx.globalAlpha = 1;
  }

  function drawLid() {
    var bx = W * 0.28, by = H * 0.35;
    var bw = W * 0.44;
    var lidH = H * 0.22;
    ctx.globalAlpha = (0.4 + progress * 0.3) * brightness;

    // Lid — angled open, showing mirror inside
    ctx.fillStyle = '#3a1f0a';
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx + bw, by);
    ctx.lineTo(bx + bw - 10, by - lidH);
    ctx.lineTo(bx + 10, by - lidH);
    ctx.closePath();
    ctx.fill();

    // Gold trim on lid
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(bx + 3, by - 1);
    ctx.lineTo(bx + 13, by - lidH + 3);
    ctx.lineTo(bx + bw - 13, by - lidH + 3);
    ctx.lineTo(bx + bw - 3, by - 1);
    ctx.stroke();

    // Mirror surface inside lid
    var mirrorShimmer = 0.7 + Math.sin(time * 0.002) * 0.15 + progress * 0.2;
    var mg = ctx.createLinearGradient(bx + 15, by - lidH + 5, bx + bw - 15, by - 5);
    mg.addColorStop(0, 'rgba(255,240,200,' + (0.08 * mirrorShimmer) + ')');
    mg.addColorStop(0.3, 'rgba(255,250,220,' + (0.15 * mirrorShimmer) + ')');
    mg.addColorStop(0.7, 'rgba(255,245,210,' + (0.12 * mirrorShimmer) + ')');
    mg.addColorStop(1, 'rgba(255,235,190,' + (0.06 * mirrorShimmer) + ')');
    ctx.fillStyle = mg;
    ctx.beginPath();
    ctx.moveTo(bx + 12, by - 3);
    ctx.lineTo(bx + bw - 12, by - 3);
    ctx.lineTo(bx + bw - 18, by - lidH + 8);
    ctx.lineTo(bx + 18, by - lidH + 8);
    ctx.closePath();
    ctx.fill();

    // Light rays from mirror
    ctx.globalAlpha = (0.03 + progress * 0.04) * brightness * mirrorShimmer;
    var midX = W * 0.5, midY = by - lidH * 0.5;
    for (var r = 0; r < 5; r++) {
      var rayAngle = -0.8 + r * 0.3 + Math.sin(time * 0.001 + r) * 0.1;
      var rayLen = H * 0.3;
      ctx.strokeStyle = 'rgba(255,240,180,0.3)';
      ctx.lineWidth = 3 + r;
      ctx.beginPath();
      ctx.moveTo(midX + (r - 2) * 15, midY);
      ctx.lineTo(midX + Math.cos(rayAngle) * rayLen + (r - 2) * 20, midY + Math.sin(rayAngle) * rayLen);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawMechanism() {
    var t = time * 0.001;
    var bx = W * 0.28, by = H * 0.35, bh = H * 0.35;
    var gx = bx + 20, gy = by + bh - 18;
    ctx.globalAlpha = (0.25 + progress * 0.25) * brightness;
    // Tiny golden gear
    ctx.fillStyle = '#c9a84c';
    ctx.save();
    ctx.translate(gx, gy);
    ctx.rotate(t * 1.5);
    for (var i = 0; i < 6; i++) {
      var angle = (i / 6) * Math.PI * 2;
      ctx.fillRect(Math.cos(angle) * 4 - 1.5, Math.sin(angle) * 4 - 1.5, 3, 3);
    }
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // Second gear
    ctx.save();
    ctx.translate(gx + 10, gy - 5);
    ctx.rotate(-t * 2);
    ctx.beginPath();
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    for (var i = 0; i < 4; i++) {
      var angle = (i / 4) * Math.PI * 2;
      ctx.fillRect(Math.cos(angle) * 3 - 1, Math.sin(angle) * 3 - 1, 2, 2);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawBallerina() {
    var t = time * 0.001;
    var cx = W * 0.5, cy = H * 0.55;
    ballerinaAngle += 0.02 * (0.5 + progress * 1.5);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = (0.4 + progress * 0.4) * brightness;

    // Pedestal
    ctx.fillStyle = '#c9a84c';
    ctx.beginPath();
    ctx.ellipse(0, 8, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tiny figure — simplified silhouette
    var sway = Math.sin(ballerinaAngle) * 0.15;
    ctx.fillStyle = '#f0c0d0';
    // Body
    ctx.beginPath();
    ctx.ellipse(Math.sin(ballerinaAngle) * 2, -2, 3, 8, sway, 0, Math.PI * 2);
    ctx.fill();
    // Head
    ctx.beginPath();
    ctx.arc(Math.sin(ballerinaAngle) * 2, -12, 3, 0, Math.PI * 2);
    ctx.fill();
    // Tutu — flared skirt shape
    ctx.fillStyle = '#f8e0ea';
    ctx.beginPath();
    ctx.moveTo(-6 + Math.sin(ballerinaAngle) * 2, 3);
    ctx.quadraticCurveTo(0, -2, 6 + Math.sin(ballerinaAngle) * 2, 3);
    ctx.fill();
    // Arms — extended
    ctx.strokeStyle = '#f0c0d0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.sin(ballerinaAngle) * 2 - 3, -6);
    ctx.lineTo(-8 + Math.cos(ballerinaAngle) * 3, -10);
    ctx.moveTo(Math.sin(ballerinaAngle) * 2 + 3, -6);
    ctx.lineTo(8 + Math.cos(ballerinaAngle + Math.PI) * 3, -10);
    ctx.stroke();

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawNotes() {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (var i = 0; i < notes.length; i++) {
      var n = notes[i];
      if (progress < n.minProgress) continue;
      var nDrift = FXCore.noise2D(n.x * 0.007 + time * 0.0003, n.y * 0.007 + i * 6) * 0.3;
      n.y -= n.speed * 0.4 + nDrift * 0.1;
      n.x += n.drift * 0.2 + nDrift;
      n.rotation += n.rotSpeed;
      if (n.y < -n.size) { n.y = H * 0.65; n.x = rand(W * 0.25, W * 0.75); }
      ctx.save();
      ctx.translate(n.x, n.y);
      ctx.rotate(n.rotation);
      ctx.globalAlpha = n.opacity * (0.5 + progress * 0.6) * brightness;
      ctx.font = n.size + 'px serif';
      ctx.fillStyle = n.color;
      ctx.fillText(n.char, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawSparkles() {
    var t = time * 0.001;
    for (var i = 0; i < sparkles.length; i++) {
      var s = sparkles[i];
      if (progress < s.minProgress) continue;
      var twink = 0.2 + Math.sin(t * s.speed + s.phase) * 0.5 + 0.3;
      ctx.globalAlpha = twink * (0.2 + progress * 0.4) * brightness;
      ctx.fillStyle = '#ffd700';
      // Diamond shape
      var sz = s.size * twink;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y - sz);
      ctx.lineTo(s.x + sz * 0.5, s.y);
      ctx.lineTo(s.x, s.y + sz);
      ctx.lineTo(s.x - sz * 0.5, s.y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Screen-blend mirror glow and music box gold bloom
  function drawMusicBoxGlow() {
    var t = time * 0.001;
    var mirrorShimmer = 0.7 + Math.sin(t * 0.8) * 0.15 + progress * 0.2;
    ctx.globalCompositeOperation = 'screen';

    // Mirror light bloom — warm glow from lid mirror
    var midX = W * 0.5, midY = H * 0.25;
    var bloomR = Math.min(W, H) * (0.2 + progress * 0.1);
    ctx.globalAlpha = mirrorShimmer * (0.05 + progress * 0.04) * brightness;
    var mg = ctx.createRadialGradient(midX, midY, 0, midX, midY, bloomR);
    mg.addColorStop(0, 'rgba(255,240,200,0.18)');
    mg.addColorStop(0.4, 'rgba(255,230,180,0.06)');
    mg.addColorStop(1, 'rgba(255,230,180,0)');
    ctx.fillStyle = mg;
    ctx.fillRect(midX - bloomR, midY - bloomR, bloomR * 2, bloomR * 2);

    // Ballerina glow — delicate point of light
    var cx = W * 0.5, cy = H * 0.55;
    ctx.globalAlpha = (0.03 + progress * 0.03) * brightness;
    var bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
    bg.addColorStop(0, 'rgba(255,200,220,0.15)');
    bg.addColorStop(1, 'rgba(255,200,220,0)');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }

  // ==================== SCENE INTERFACE ====================
  var scene = {
    enter: function(canvas, context, w, h) {
      ctx = context; W = w; H = h;
      progress = 0; targetProgress = 0; brightness = 0.75;
      ballerinaAngle = 0;
      generateScene();
    },
    resize: function(w, h) { W = w; H = h; generateScene(); },
    update: function(dt, t) {
      time = t;
      progress += (targetProgress - progress) * 0.03;
      brightness += ((0.75 + progress * 0.25) - brightness) * 0.02;
    },
    draw: function() {
      drawBackground();
      drawSatinNoise();
      drawDoily();
      drawMusicBox();
      drawLid();
      drawMechanism();
      drawBallerina();
      drawNotes();
      drawSparkles();
      drawMusicBoxGlow();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('rhyme', scene);

  window.ClassmatesRhymeScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('rhyme')) return;
      var s = FXCore.getSize();
      var count = 8 + Math.floor(progress * 8);
      FXCore.emit(s.w * 0.5, s.h * 0.45, 10, {
        spread: 4, rise: 2, decay: 0.018, size: 2.5,
        color: 'rgba(255,215,0,0.8)', shape: 'diamond', endColor: 'rgba(255,240,200,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.45, 6, {
        spread: 3, rise: 1.5, decay: 0.022, size: 2,
        color: 'rgba(240,192,208,0.6)'
      });
      // Music box rose-pink burst
      FXCore.emit(s.w * 0.5, s.h * 0.43, count, {
        spread: 5, rise: 2.2, decay: 0.02, size: 2,
        color: 'rgba(248,224,234,0.7)', shape: 'diamond', endColor: 'rgba(240,192,208,0)'
      });
      // Tiny golden sparkles like music box glitter
      FXCore.emit(s.w * 0.5, s.h * 0.45, 4, {
        spread: 2, rise: 1.2, decay: 0.028, size: 1.5,
        color: 'rgba(201,168,76,0.9)', shape: 'diamond'
      });
      if (window.FXSound) FXSound.play('chime');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('rhyme')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 2, rise: -0.1, gravity: 0.02, decay: 0.015, size: 2,
        color: 'rgba(100,60,80,0.4)'
      });
      // Deeper velvet-dark burst
      FXCore.emit(s.w * 0.5, s.h * 0.5, 3, {
        spread: 1.5, rise: -0.15, gravity: 0.025, decay: 0.02, size: 1.8,
        color: 'rgba(58,31,10,0.5)'
      });
      if (FXCore.shake) FXCore.shake(3, 150);
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('rhyme')) return;
      var s = FXCore.getSize();
      var colors = ['rgba(255,215,0,0.7)','rgba(240,192,208,0.6)','rgba(201,168,76,0.7)','rgba(248,224,234,0.6)','rgba(255,223,128,0.7)'];
      for (var i = 0; i < colors.length; i++) {
        FXCore.emit(s.w * (0.2 + i * 0.15), s.h * 0.4, 5, {
          spread: 5, rise: 2.5, decay: 0.012, size: 3, color: colors[i], shape: 'diamond'
        });
      }
      // Music box celebration — 8 bursts of lavender, rose, and gold
      var boxColors = ['rgba(240,192,208,0.7)','rgba(201,168,76,0.7)','rgba(248,224,234,0.6)','rgba(255,215,0,0.7)','rgba(139,42,58,0.5)','rgba(255,223,128,0.7)','rgba(240,192,208,0.6)','rgba(201,168,76,0.7)'];
      for (var j = 0; j < 8; j++) {
        FXCore.emit(s.w * (0.08 + j * 0.11), s.h * (0.2 + Math.sin(j * 0.8) * 0.15), 5, {
          spread: 5, rise: 2, decay: 0.013, size: 3,
          color: boxColors[j], shape: 'diamond'
        });
      }
      // Central golden star burst
      FXCore.emit(s.w * 0.5, s.h * 0.4, 15, {
        spread: 8, rise: 3, decay: 0.008, size: 5,
        color: 'rgba(255,215,0,0.8)', shape: 'star', endColor: 'rgba(255,240,200,0)'
      });
      if (window.FXSound) FXSound.playSequence(['correct','streak','complete'], 100);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
