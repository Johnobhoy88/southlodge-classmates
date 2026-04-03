(function(){
  // ============================================================
  // PUNCTUATION — "Ink & Parchment"
  // A scribe's desk at night. Candle flickers, open book,
  // ink pot, quill, moths circling flame. Close-up, intimate.
  // First non-landscape scene — a desk surface, not a vista.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.45;
  var time = 0;
  var candleFlicker = 0;

  var moths = [];
  var inkDrops = [];
  var floatingMarks = [];
  var textLines = [];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

  var W = 0, H = 0, ctx = null;

  function generateScene() {
    // Moths circling the candle
    moths = [];
    for (var i = 0; i < 6; i++) {
      moths.push({
        angle: rand(0, Math.PI * 2),
        radiusX: rand(25, 55), radiusY: rand(15, 35),
        speed: rand(0.8, 1.8) * (Math.random() > 0.5 ? 1 : -1),
        size: rand(2, 4),
        wobble: rand(0, Math.PI * 2),
        minProgress: i < 3 ? 0 : (i < 5 ? 0.3 : 0.6)
      });
    }

    // Floating punctuation marks
    var MARKS = '.,?!;:\u201C\u201D\u2018\u2019\u2026';
    floatingMarks = [];
    for (var i = 0; i < 10; i++) {
      floatingMarks.push({
        x: rand(W * 0.1, W * 0.9), y: rand(H * 0.1, H * 0.85),
        char: MARKS[Math.floor(rand(0, MARKS.length))],
        size: rand(12, 24), speed: rand(0.03, 0.1),
        drift: rand(-0.08, 0.08), opacity: rand(0.03, 0.06),
        rotation: rand(-0.2, 0.2), rotSpeed: rand(-0.002, 0.002)
      });
    }

    // Text lines on book pages
    textLines = [];
    for (var page = 0; page < 2; page++) {
      var px = page === 0 ? W * 0.28 : W * 0.52;
      for (var l = 0; l < 12; l++) {
        textLines.push({
          x: px, y: H * 0.32 + l * 14,
          w: rand(W * 0.12, W * 0.18),
          page: page, lineIdx: l,
          minProgress: l < 5 ? 0 : (l < 9 ? 0.3 : 0.6)
        });
      }
    }

    inkDrops = [];
  }

  // ==================== DRAWING ====================

  function drawRoom() {
    // Very dark warm room
    var b = brightness;
    ctx.fillStyle = 'hsl(25,' + Math.round(20) + '%,' + Math.round(5 * b) + '%)';
    ctx.fillRect(0, 0, W, H);

    // Dark vignette
    var vig = ctx.createRadialGradient(W * 0.35, H * 0.3, W * 0.1, W * 0.5, H * 0.5, W * 0.7);
    vig.addColorStop(0, 'rgba(0,0,0,0)');
    vig.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);
  }

  function drawCandlelight() {
    var t = time * 0.001;
    candleFlicker = 0.7 + Math.sin(t * 4) * 0.08 + Math.sin(t * 7) * 0.05 + Math.sin(t * 11) * 0.03 + progress * 0.2;
    var cx = W * 0.18, cy = H * 0.15;

    // Warm light cone
    var lightR = W * (0.35 + progress * 0.15) * candleFlicker;
    var lg = ctx.createRadialGradient(cx, cy + 10, 5, cx + W * 0.1, H * 0.4, lightR);
    lg.addColorStop(0, 'rgba(255,180,80,' + (0.12 * candleFlicker) + ')');
    lg.addColorStop(0.3, 'rgba(255,160,60,' + (0.06 * candleFlicker) + ')');
    lg.addColorStop(0.6, 'rgba(255,140,40,' + (0.025 * candleFlicker) + ')');
    lg.addColorStop(1, 'rgba(255,120,20,0)');
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, W, H);
  }

  function drawCandle() {
    var t = time * 0.001;
    var cx = W * 0.18, cy = H * 0.15;

    ctx.globalAlpha = brightness * 0.8;
    // Candle body
    ctx.fillStyle = '#f5e6c8';
    ctx.fillRect(cx - 5, cy + 8, 10, 30);
    // Wax drips
    ctx.fillStyle = '#ede0c4';
    ctx.beginPath();
    ctx.ellipse(cx - 4, cy + 20, 2, 6, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 3, cy + 25, 1.5, 5, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Wick
    ctx.strokeStyle = '#2c1810';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 8);
    ctx.lineTo(cx, cy + 2);
    ctx.stroke();

    // Flame — inner bright, outer orange
    var flameH = 10 + Math.sin(t * 5) * 2 + Math.sin(t * 8) * 1;
    var flameSway = Math.sin(t * 3) * 1.5;
    // Outer flame
    ctx.globalAlpha = candleFlicker * 0.7;
    ctx.fillStyle = '#ff8c00';
    ctx.beginPath();
    ctx.moveTo(cx - 4, cy + 3);
    ctx.quadraticCurveTo(cx + flameSway, cy - flameH, cx + 4, cy + 3);
    ctx.fill();
    // Inner flame
    ctx.globalAlpha = candleFlicker * 0.9;
    ctx.fillStyle = '#ffcc40';
    ctx.beginPath();
    ctx.moveTo(cx - 2, cy + 3);
    ctx.quadraticCurveTo(cx + flameSway * 0.5, cy - flameH * 0.6, cx + 2, cy + 3);
    ctx.fill();
    // Core
    ctx.globalAlpha = candleFlicker;
    ctx.fillStyle = '#fff8e0';
    ctx.beginPath();
    ctx.arc(cx, cy + 1, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Candle holder
    ctx.globalAlpha = brightness * 0.6;
    ctx.fillStyle = '#8B7355';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 38, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawBook() {
    var bx = W * 0.38, by = H * 0.28;
    var pw = W * 0.22, ph = H * 0.45;
    ctx.globalAlpha = (0.5 + progress * 0.25) * brightness * candleFlicker;

    // Left page
    ctx.fillStyle = '#f4e8d0';
    ctx.fillRect(bx - pw - 2, by, pw, ph);
    // Right page
    ctx.fillStyle = '#f0e4c8';
    ctx.fillRect(bx + 2, by, pw, ph);
    // Spine shadow
    ctx.fillStyle = 'rgba(80,50,20,0.3)';
    ctx.fillRect(bx - 2, by, 4, ph);
    // Page shadow at bottom
    ctx.globalAlpha = 0.08 * brightness;
    ctx.fillStyle = '#000';
    ctx.fillRect(bx - pw - 2, by + ph, pw * 2 + 4, 4);

    // Text lines
    ctx.globalAlpha = (0.15 + progress * 0.2) * brightness * candleFlicker;
    ctx.fillStyle = '#3a2a15';
    for (var i = 0; i < textLines.length; i++) {
      var tl = textLines[i];
      if (progress < tl.minProgress) continue;
      ctx.fillRect(tl.x, tl.y, tl.w, 1.5);
    }
    ctx.globalAlpha = 1;
  }

  function drawInkPot() {
    var ix = W * 0.68, iy = H * 0.45;
    ctx.globalAlpha = (0.4 + progress * 0.2) * brightness * candleFlicker;
    // Pot body
    ctx.fillStyle = '#1a1520';
    ctx.beginPath();
    ctx.moveTo(ix - 10, iy);
    ctx.lineTo(ix + 10, iy);
    ctx.lineTo(ix + 8, iy + 18);
    ctx.lineTo(ix - 8, iy + 18);
    ctx.closePath();
    ctx.fill();
    // Rim
    ctx.fillStyle = '#2a2535';
    ctx.beginPath();
    ctx.ellipse(ix, iy, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Ink surface
    ctx.fillStyle = '#0a0520';
    ctx.beginPath();
    ctx.ellipse(ix, iy + 1, 9, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Blue-black gleam
    ctx.globalAlpha = 0.15 * brightness * candleFlicker;
    ctx.fillStyle = '#3344aa';
    ctx.beginPath();
    ctx.ellipse(ix - 3, iy - 1, 3, 1.5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawQuill() {
    var qx = W * 0.45, qy = H * 0.38;
    ctx.globalAlpha = (0.4 + progress * 0.2) * brightness * candleFlicker;
    ctx.save();
    ctx.translate(qx, qy);
    ctx.rotate(-0.4);
    // Shaft
    ctx.strokeStyle = '#c4a882';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(40, -5, 80, -15);
    ctx.stroke();
    // Barbs (feather)
    for (var i = 0; i < 8; i++) {
      var bx = 40 + i * 5, by = -5 - i * 1.2;
      ctx.strokeStyle = 'rgba(196,168,130,' + (0.3 - i * 0.03) + ')';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + 4, by - 6 - i * 0.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + 3, by + 4 + i * 0.3);
      ctx.stroke();
    }
    // Nib
    ctx.fillStyle = '#4a3a2a';
    ctx.beginPath();
    ctx.moveTo(-2, 2);
    ctx.lineTo(-8, 8);
    ctx.lineTo(0, 3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawScroll() {
    var sx = W * 0.75, sy = H * 0.25;
    ctx.globalAlpha = 0.2 * brightness * candleFlicker;
    // Rolled scroll
    ctx.fillStyle = '#d4c4a8';
    ctx.fillRect(sx, sy, 35, 12);
    // Roll ends
    ctx.fillStyle = '#c4b498';
    ctx.beginPath();
    ctx.ellipse(sx, sy + 6, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(sx + 35, sy + 6, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // Unrolled part
    ctx.fillStyle = '#e4d4b8';
    ctx.fillRect(sx + 5, sy + 12, 25, 40);
    ctx.globalAlpha = 1;
  }

  function drawMoths() {
    var t = time * 0.001;
    var cx = W * 0.18, cy = H * 0.15;
    for (var i = 0; i < moths.length; i++) {
      var m = moths[i];
      if (progress < m.minProgress) continue;
      m.angle += m.speed * 0.02;
      var mx = cx + Math.cos(m.angle) * m.radiusX + Math.sin(t + m.wobble) * 3;
      var my = cy + Math.sin(m.angle) * m.radiusY + Math.cos(t * 1.3 + m.wobble) * 2;
      var wingFlap = Math.sin(t * 12 + m.wobble) * 0.6;

      ctx.save();
      ctx.translate(mx, my);
      ctx.globalAlpha = (0.3 + progress * 0.3) * brightness * candleFlicker;
      ctx.fillStyle = '#d4c4a8';
      // Left wing
      ctx.save(); ctx.scale(wingFlap, 1);
      ctx.beginPath();
      ctx.ellipse(-m.size * 0.4, 0, m.size * 0.5, m.size * 0.3, -0.2, 0, Math.PI * 2);
      ctx.fill(); ctx.restore();
      // Right wing
      ctx.save(); ctx.scale(-wingFlap, 1);
      ctx.beginPath();
      ctx.ellipse(-m.size * 0.4, 0, m.size * 0.5, m.size * 0.3, -0.2, 0, Math.PI * 2);
      ctx.fill(); ctx.restore();
      // Body
      ctx.fillStyle = '#8a7a6a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 0.8, m.size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawInkDrops(dt) {
    // Occasionally spawn an ink drop from quill nib
    if (Math.random() < 0.003 * (1 + progress)) {
      inkDrops.push({
        x: W * 0.42 + rand(-3, 3), y: H * 0.42,
        vy: 0, size: rand(1, 2.5), life: 1
      });
    }
    for (var i = inkDrops.length - 1; i >= 0; i--) {
      var d = inkDrops[i];
      d.vy += 0.08;
      d.y += d.vy;
      d.life -= 0.008;
      if (d.life <= 0 || d.y > H * 0.75) { inkDrops.splice(i, 1); continue; }
      ctx.globalAlpha = d.life * 0.5 * brightness * candleFlicker;
      ctx.fillStyle = '#1a0a30';
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawFloatingMarks() {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (var i = 0; i < floatingMarks.length; i++) {
      var m = floatingMarks[i];
      m.y -= m.speed * 0.3;
      m.x += m.drift * 0.2;
      m.rotation += m.rotSpeed;
      if (m.y < -m.size) { m.y = H + m.size; m.x = rand(W * 0.1, W * 0.9); }
      ctx.save();
      ctx.translate(m.x, m.y);
      ctx.rotate(m.rotation);
      ctx.globalAlpha = m.opacity * (0.4 + progress * 0.6) * brightness * candleFlicker;
      ctx.font = m.size + 'px "Fredoka One",cursive';
      ctx.fillStyle = '#c4a882';
      ctx.fillText(m.char, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // ==================== SCENE INTERFACE ====================
  var scene = {
    enter: function(canvas, context, w, h) {
      ctx = context; W = w; H = h;
      progress = 0; targetProgress = 0; brightness = 0.45;
      inkDrops = [];
      generateScene();
    },
    resize: function(w, h) { W = w; H = h; generateScene(); },
    update: function(dt, t) {
      time = t;
      progress += (targetProgress - progress) * 0.03;
      brightness += ((0.45 + progress * 0.55) - brightness) * 0.02;
    },
    draw: function(context, w, h, t) {
      drawRoom();
      drawCandlelight();
      drawScroll();
      drawBook();
      drawQuill();
      drawInkPot();
      drawFloatingMarks();
      drawMoths();
      drawInkDrops(0.016);
      drawCandle();
    },
    exit: function() { inkDrops = []; }
  };

  if (window.FXCore) FXCore.register('punctuation', scene);

  window.ClassmatesPunctuationScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('punctuation')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.4, 10, {
        spread: 4, rise: 1.5, decay: 0.02, size: 2.5,
        color: 'rgba(255,200,100,0.8)', shape: 'star', endColor: 'rgba(196,168,130,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.4, 5, {
        spread: 3, rise: 1, decay: 0.025, size: 2,
        color: 'rgba(244,232,208,0.6)'
      });
      if (window.FXSound) FXSound.play('click');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('punctuation')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 2, rise: -0.1, gravity: 0.03, decay: 0.015, size: 2,
        color: 'rgba(26,10,48,0.5)'
      });
      if (window.FXSound) FXSound.play('wrong');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('punctuation')) return;
      var s = FXCore.getSize();
      var colors = ['rgba(255,200,100,0.7)','rgba(244,232,208,0.6)','rgba(196,168,130,0.7)','rgba(255,180,80,0.6)','rgba(212,196,168,0.7)'];
      for (var i = 0; i < colors.length; i++) {
        FXCore.emit(s.w * (0.2 + i * 0.15), s.h * 0.35, 4, {
          spread: 5, rise: 2, decay: 0.015, size: 3, color: colors[i], shape: 'star'
        });
      }
      if (window.FXSound) FXSound.playSequence(['click','chime','complete'], 120);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
