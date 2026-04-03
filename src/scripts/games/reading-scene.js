(function(){
  // ============================================================
  // READING — "Story Campfire"
  // A cosy campfire in a forest clearing at night. Fire crackles,
  // sparks rise, trees ring the clearing, stars peek through.
  // Warm centre, cool dark forest edges. Storytelling mood.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.45;
  var time = 0;

  var stars = [];
  var trees = [];
  var embers = [];
  var sparks = [];
  var smokeWisps = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

  var W = 0, H = 0, ctx = null;

  function generateScene() {
    // Stars visible through canopy gaps
    stars = [];
    for (var i = 0; i < 40; i++) {
      stars.push({
        x: rand(W * 0.1, W * 0.9), y: rand(0, H * 0.3),
        size: rand(0.5, 2), twinkle: rand(0, Math.PI * 2), speed: rand(1, 3)
      });
    }

    // Tree silhouettes forming a ring
    trees = [];
    // Left side trees
    for (var i = 0; i < 4; i++) {
      trees.push({
        x: W * (0.02 + i * 0.06), trunkW: rand(8, 16),
        canopyY: rand(0, H * 0.15), canopyW: rand(30, 55), canopyH: rand(40, 70),
        side: 'left'
      });
    }
    // Right side trees
    for (var i = 0; i < 4; i++) {
      trees.push({
        x: W * (0.72 + i * 0.07), trunkW: rand(8, 16),
        canopyY: rand(0, H * 0.15), canopyW: rand(30, 55), canopyH: rand(40, 70),
        side: 'right'
      });
    }

    // Ground embers around fire
    embers = [];
    for (var i = 0; i < 20; i++) {
      var angle = rand(0, Math.PI * 2);
      var dist = rand(20, 60);
      embers.push({
        x: W * 0.5 + Math.cos(angle) * dist,
        y: H * 0.72 + Math.sin(angle) * dist * 0.3,
        size: rand(1, 3), phase: rand(0, Math.PI * 2), speed: rand(1, 3)
      });
    }

    // Rising sparks
    sparks = [];
    for (var i = 0; i < 20; i++) {
      sparks.push({
        x: W * 0.5 + rand(-15, 15), y: H * 0.65 + rand(-5, 10),
        speed: rand(0.4, 1.2), drift: rand(-0.3, 0.3),
        size: rand(0.8, 2.5), life: rand(0, 1),
        color: Math.random() > 0.6 ? '#ffd700' : '#ff8c00',
        minProgress: i < 8 ? 0 : (i < 15 ? 0.25 : 0.5)
      });
    }

    // Smoke wisps
    smokeWisps = [];
    for (var i = 0; i < 4; i++) {
      smokeWisps.push({
        x: W * 0.5 + rand(-10, 10), y: H * 0.55,
        size: rand(15, 30), drift: rand(-0.15, 0.15),
        speed: rand(0.1, 0.3), opacity: rand(0.03, 0.06),
        phase: rand(0, Math.PI * 2)
      });
    }
  }

  // ==================== DRAWING ====================

  function drawSky() {
    // Very dark sky
    var b = brightness;
    ctx.fillStyle = 'hsl(220,' + Math.round(30) + '%,' + Math.round(6 * b) + '%)';
    ctx.fillRect(0, 0, W, H);
  }

  function drawStars() {
    var t = time * 0.001;
    var vis = 0.4 + progress * 0.6;
    for (var i = 0; i < stars.length; i++) {
      if (i / stars.length > vis) continue;
      var s = stars[i];
      var twink = 0.3 + Math.sin(t * s.speed + s.twinkle) * 0.4 + 0.3;
      ctx.globalAlpha = twink * brightness * 0.8;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawTrees() {
    ctx.globalAlpha = brightness * 0.9;
    for (var i = 0; i < trees.length; i++) {
      var t = trees[i];
      // Trunk
      ctx.fillStyle = '#0a0a12';
      ctx.fillRect(t.x - t.trunkW / 2, t.canopyY + t.canopyH * 0.5, t.trunkW, H - t.canopyY);
      // Canopy — dark mass
      ctx.fillStyle = '#050510';
      ctx.beginPath();
      ctx.ellipse(t.x, t.canopyY + t.canopyH * 0.3, t.canopyW / 2, t.canopyH / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Canopy overlay across top — denser
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, W * 0.25, H * 0.35);
    ctx.fillRect(W * 0.75, 0, W * 0.25, H * 0.4);
    ctx.globalAlpha = 1;
  }

  function drawFirelight() {
    var t = time * 0.001;
    var fireSize = 0.5 + progress * 0.5;
    var flicker = 0.85 + Math.sin(t * 5) * 0.05 + Math.sin(t * 8) * 0.04 + Math.sin(t * 12) * 0.02;
    var cx = W * 0.5, cy = H * 0.7;
    var r = W * (0.25 + progress * 0.15) * flicker;

    // Warm glow on ground and trees
    var fg = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
    fg.addColorStop(0, 'rgba(255,150,50,' + (0.15 * fireSize * flicker) + ')');
    fg.addColorStop(0.3, 'rgba(255,120,30,' + (0.08 * fireSize * flicker) + ')');
    fg.addColorStop(0.6, 'rgba(255,80,10,' + (0.03 * fireSize * flicker) + ')');
    fg.addColorStop(1, 'rgba(255,50,0,0)');
    ctx.fillStyle = fg;
    ctx.fillRect(0, 0, W, H);

    // Tree trunk illumination — warm edges on nearest trunks
    for (var i = 0; i < trees.length; i++) {
      var tr = trees[i];
      var dist = Math.abs(tr.x - cx);
      if (dist < W * 0.35) {
        var intensity = (1 - dist / (W * 0.35)) * 0.15 * fireSize * flicker;
        ctx.globalAlpha = intensity * brightness;
        ctx.fillStyle = '#ff8030';
        var edgeX = tr.side === 'left' ? tr.x + tr.trunkW / 2 - 3 : tr.x - tr.trunkW / 2;
        ctx.fillRect(edgeX, H * 0.3, 3, H * 0.5);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawGround() {
    // Dark ground
    var gy = H * 0.78;
    var gg = ctx.createLinearGradient(0, gy, 0, H);
    gg.addColorStop(0, 'hsl(25,' + Math.round(15) + '%,' + Math.round(8 * brightness) + '%)');
    gg.addColorStop(1, 'hsl(20,' + Math.round(10) + '%,' + Math.round(5 * brightness) + '%)');
    ctx.fillStyle = gg;
    ctx.fillRect(0, gy, W, H - gy);
  }

  function drawCampfire() {
    var t = time * 0.001;
    var cx = W * 0.5, cy = H * 0.73;
    var fireSize = 0.6 + progress * 0.4;
    var flicker = 0.85 + Math.sin(t * 5) * 0.06 + Math.sin(t * 8) * 0.04;

    ctx.globalAlpha = (0.5 + progress * 0.35) * brightness;

    // Stone ring
    ctx.fillStyle = '#4a4a52';
    for (var i = 0; i < 8; i++) {
      var angle = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(cx + Math.cos(angle) * 22, cy + Math.sin(angle) * 8, 5, 4, angle, 0, Math.PI * 2);
      ctx.fill();
    }

    // Logs
    ctx.fillStyle = '#3a2010';
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(0.3);
    ctx.fillRect(-18, -3, 36, 6);
    ctx.restore();
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.4);
    ctx.fillRect(-16, -3, 32, 6);
    ctx.restore();
    // Cross log
    ctx.fillStyle = '#2a1508';
    ctx.save();
    ctx.translate(cx, cy - 2);
    ctx.rotate(1.2);
    ctx.fillRect(-14, -2.5, 28, 5);
    ctx.restore();

    // Flames — 3 tongues
    for (var f = 0; f < 3; f++) {
      var fx = cx + (f - 1) * 8 + Math.sin(t * 4 + f * 2) * 3;
      var fh = (20 + f * 5) * fireSize * flicker;
      var fw = 6 + f * 2;
      var sway = Math.sin(t * (5 + f) + f) * 3;

      // Outer flame — orange
      ctx.globalAlpha = (0.6 + progress * 0.3) * brightness * flicker;
      ctx.fillStyle = '#ff6600';
      ctx.beginPath();
      ctx.moveTo(fx - fw, cy - 2);
      ctx.quadraticCurveTo(fx + sway, cy - fh, fx + fw, cy - 2);
      ctx.fill();

      // Inner flame — yellow
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.moveTo(fx - fw * 0.5, cy - 2);
      ctx.quadraticCurveTo(fx + sway * 0.6, cy - fh * 0.65, fx + fw * 0.5, cy - 2);
      ctx.fill();

      // Core — white-yellow
      if (f === 1) {
        ctx.fillStyle = '#fff8e0';
        ctx.globalAlpha = 0.5 * brightness * flicker;
        ctx.beginPath();
        ctx.moveTo(fx - 2, cy - 3);
        ctx.quadraticCurveTo(fx, cy - fh * 0.35, fx + 2, cy - 3);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawEmbers() {
    var t = time * 0.001;
    for (var i = 0; i < embers.length; i++) {
      var e = embers[i];
      var pulse = 0.3 + Math.sin(t * e.speed + e.phase) * 0.4 + 0.3;
      ctx.globalAlpha = pulse * (0.3 + progress * 0.4) * brightness;
      ctx.fillStyle = '#ff4400';
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size * pulse, 0, Math.PI * 2);
      ctx.fill();
      // Tiny glow
      ctx.globalAlpha = pulse * 0.1 * brightness;
      ctx.fillStyle = '#ff8800';
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size * 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawLogSeat() {
    var lx = W * 0.3, ly = H * 0.78;
    ctx.globalAlpha = (0.35 + progress * 0.2) * brightness;
    // Log
    ctx.fillStyle = '#4a3020';
    ctx.beginPath();
    ctx.ellipse(lx, ly, 30, 8, 0.05, 0, Math.PI * 2);
    ctx.fill();
    // Bark texture
    ctx.strokeStyle = 'rgba(80,50,30,0.3)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.ellipse(lx, ly, 28, 6, 0.05, 0, Math.PI * 2);
    ctx.stroke();
    // Log end
    ctx.fillStyle = '#5a4030';
    ctx.beginPath();
    ctx.ellipse(lx + 28, ly, 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    // Ring pattern on end
    ctx.strokeStyle = 'rgba(100,70,50,0.2)';
    ctx.beginPath();
    ctx.ellipse(lx + 28, ly, 3, 5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Blanket draped
    ctx.globalAlpha = (0.25 + progress * 0.2) * brightness;
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.moveTo(lx - 15, ly - 6);
    ctx.quadraticCurveTo(lx - 10, ly - 12, lx + 5, ly - 8);
    ctx.quadraticCurveTo(lx + 10, ly - 4, lx + 5, ly + 2);
    ctx.quadraticCurveTo(lx - 5, ly + 5, lx - 15, ly);
    ctx.closePath();
    ctx.fill();
    // Blanket check pattern
    ctx.globalAlpha = 0.08 * brightness;
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(lx - 10, ly - 10);
    ctx.lineTo(lx + 2, ly + 2);
    ctx.moveTo(lx - 5, ly - 10);
    ctx.lineTo(lx + 7, ly + 2);
    ctx.stroke();

    ctx.globalAlpha = 1;
  }

  function drawSparks() {
    var t = time * 0.001;
    for (var i = 0; i < sparks.length; i++) {
      var s = sparks[i];
      if (progress < s.minProgress) continue;
      // Rise and drift
      s.y -= s.speed * 0.5;
      s.x += s.drift * 0.3 + Math.sin(t * 2 + i) * 0.2;
      s.life -= 0.005;
      // Reset when dead or off screen
      if (s.life <= 0 || s.y < H * 0.05) {
        s.x = W * 0.5 + rand(-15, 15);
        s.y = H * 0.68 + rand(-5, 5);
        s.life = 1;
      }
      ctx.globalAlpha = s.life * (0.5 + progress * 0.4) * brightness;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawSmoke() {
    var t = time * 0.001;
    for (var i = 0; i < smokeWisps.length; i++) {
      var s = smokeWisps[i];
      var sx = s.x + Math.sin(t * 0.5 + s.phase) * 15 + s.drift * t * 10;
      var sy = s.y - t * s.speed * 20 + Math.cos(t * 0.3 + s.phase) * 5;
      // Wrap
      if (sy < -s.size * 2) sy += H * 0.6;
      ctx.globalAlpha = s.opacity * (0.3 + progress * 0.4) * brightness;
      ctx.fillStyle = 'rgba(150,150,160,0.3)';
      ctx.beginPath();
      ctx.arc(sx, sy, s.size * (0.7 + progress * 0.3), 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx + s.size * 0.4, sy - s.size * 0.3, s.size * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ==================== SCENE INTERFACE ====================
  var scene = {
    enter: function(canvas, context, w, h) {
      ctx = context; W = w; H = h;
      progress = 0; targetProgress = 0; brightness = 0.45;
      generateScene();
    },
    resize: function(w, h) { W = w; H = h; generateScene(); },
    update: function(dt, t) {
      time = t;
      progress += (targetProgress - progress) * 0.03;
      brightness += ((0.45 + progress * 0.55) - brightness) * 0.02;
    },
    draw: function() {
      drawSky();
      drawStars();
      drawTrees();
      drawGround();
      drawFirelight();
      drawEmbers();
      drawLogSeat();
      drawCampfire();
      drawSparks();
      drawSmoke();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('reading', scene);

  window.ClassmatesReadingScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('reading')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 10, {
        spread: 5, rise: 2.5, decay: 0.018, size: 3,
        color: 'rgba(255,140,0,0.8)', shape: 'star', endColor: 'rgba(255,200,50,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.5, 6, {
        spread: 3, rise: 2, decay: 0.022, size: 2,
        color: 'rgba(255,200,80,0.6)'
      });
      if (window.FXSound) FXSound.play('correct');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('reading')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.6, 4, {
        spread: 2, rise: -0.1, gravity: 0.02, decay: 0.015, size: 2,
        color: 'rgba(80,50,30,0.4)'
      });
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('reading')) return;
      var s = FXCore.getSize();
      // Big spark shower
      for (var i = 0; i < 4; i++) {
        FXCore.emit(s.w * 0.5, s.h * 0.55, 8, {
          spread: 7 + i * 2, rise: 3 + i, decay: 0.01, size: 3,
          color: i % 2 === 0 ? 'rgba(255,140,0,0.8)' : 'rgba(255,200,50,0.7)',
          shape: 'star'
        });
      }
      if (window.FXSound) FXSound.playSequence(['correct','chime','complete'], 120);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
