(function(){
  // ============================================================
  // MEASUREMENT — "Carpenter's Bench"
  // Close-up of a craftsman's workbench with measuring tools.
  // Tape measure, ruler, balance scale, measuring jug, weights.
  // PRECISE, CRAFTED, WARM — the satisfaction of exact measurement.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.6;
  var time = 0;
  var balanceTilt = 0;
  var bubblePos = 0;

  var pegTools = [];
  var woodShavings = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

  var W = 0, H = 0, ctx = null;

  function generateScene() {
    // Pegboard tools
    pegTools = [
      { x: W * 0.1, y: H * 0.12, type: 'hammer', minProgress: 0 },
      { x: W * 0.2, y: H * 0.1, type: 'saw', minProgress: 0 },
      { x: W * 0.75, y: H * 0.11, type: 'wrench', minProgress: 0.3 },
      { x: W * 0.85, y: H * 0.13, type: 'pliers', minProgress: 0.5 },
      { x: W * 0.92, y: H * 0.1, type: 'screwdriver', minProgress: 0.6 }
    ];

    // Wood shavings on bench
    woodShavings = [];
    for (var i = 0; i < 12; i++) {
      woodShavings.push({
        x: rand(W * 0.05, W * 0.95), y: rand(H * 0.55, H * 0.75),
        size: rand(4, 10), curl: rand(0.5, 2), angle: rand(0, Math.PI * 2),
        color: rand(0, 1) > 0.5 ? '#d4b070' : '#c4a060'
      });
    }
  }

  // ==================== DRAWING ====================

  function drawWall() {
    var b = brightness;
    var wg = ctx.createLinearGradient(0, 0, 0, H * 0.45);
    wg.addColorStop(0, 'hsl(25,' + Math.round(20 + progress * 8) + '%,' + Math.round(40 * b) + '%)');
    wg.addColorStop(1, 'hsl(20,' + Math.round(18 + progress * 6) + '%,' + Math.round(35 * b) + '%)');
    ctx.fillStyle = wg;
    ctx.fillRect(0, 0, W, H);

    // Wood panel lines
    ctx.strokeStyle = 'rgba(100,70,40,' + (0.04 * b) + ')';
    ctx.lineWidth = 0.5;
    for (var x = 0; x < W; x += 50) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H * 0.45); ctx.stroke();
    }

    // Pegboard
    ctx.fillStyle = 'hsl(30,12%,' + Math.round(32 * b) + '%)';
    ctx.fillRect(W * 0.05, H * 0.05, W * 0.35, H * 0.22);
    ctx.fillRect(W * 0.65, H * 0.05, W * 0.32, H * 0.22);
    // Peg holes
    ctx.fillStyle = 'rgba(40,25,15,' + (0.15 * b) + ')';
    for (var y = H * 0.08; y < H * 0.25; y += 12) {
      for (var x = W * 0.08; x < W * 0.38; x += 12) {
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
      }
      for (var x = W * 0.68; x < W * 0.95; x += 12) {
        ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  function drawPegTools() {
    for (var i = 0; i < pegTools.length; i++) {
      var t = pegTools[i];
      if (t.minProgress && progress < t.minProgress) continue;
      ctx.globalAlpha = (0.25 + progress * 0.25) * brightness;
      ctx.fillStyle = '#3a2a18';

      if (t.type === 'hammer') {
        ctx.fillRect(t.x - 1.5, t.y, 3, 20);
        ctx.fillRect(t.x - 6, t.y - 3, 12, 6);
      } else if (t.type === 'saw') {
        ctx.fillRect(t.x, t.y, 2, 18);
        ctx.fillStyle = '#8a8a88';
        ctx.beginPath();
        ctx.moveTo(t.x, t.y + 18);
        ctx.lineTo(t.x + 18, t.y + 20);
        ctx.lineTo(t.x + 18, t.y + 14);
        ctx.lineTo(t.x, t.y + 12);
        ctx.closePath();
        ctx.fill();
      } else if (t.type === 'wrench') {
        ctx.fillStyle = '#7a7a78';
        ctx.fillRect(t.x - 1.5, t.y, 3, 22);
        ctx.beginPath();
        ctx.arc(t.x, t.y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'hsl(25,15%,' + Math.round(35 * brightness) + '%)';
        ctx.beginPath();
        ctx.arc(t.x, t.y, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (t.type === 'pliers') {
        ctx.fillStyle = '#5a5a58';
        ctx.fillRect(t.x - 2, t.y, 2, 16);
        ctx.fillRect(t.x + 1, t.y, 2, 16);
        ctx.fillStyle = '#cc3030';
        ctx.fillRect(t.x - 3, t.y + 8, 7, 10);
      } else {
        ctx.fillStyle = '#e0c040';
        ctx.fillRect(t.x - 1.5, t.y, 3, 22);
        ctx.fillStyle = '#5a5a58';
        ctx.fillRect(t.x - 1, t.y - 2, 2, 5);
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawBench() {
    var by = H * 0.5;
    ctx.globalAlpha = brightness;
    var bg = ctx.createLinearGradient(0, by - 4, 0, by + 8);
    bg.addColorStop(0, '#a08050');
    bg.addColorStop(0.5, '#907040');
    bg.addColorStop(1, '#806030');
    ctx.fillStyle = bg;
    ctx.fillRect(0, by, W, 10);
    ctx.fillStyle = '#b09060';
    ctx.fillRect(0, by, W, 2);

    // Below bench
    ctx.fillStyle = 'hsl(20,12%,' + Math.round(22 * brightness) + '%)';
    ctx.fillRect(0, by + 10, W, H - by - 10);

    // Wood grain on bench surface
    ctx.globalAlpha = 0.03 * brightness;
    ctx.strokeStyle = '#6a4a20';
    ctx.lineWidth = 0.5;
    for (var y = by + 2; y < by + 8; y += 2) {
      ctx.beginPath();
      for (var x = 0; x < W; x += 5) {
        var gy = y + Math.sin(x * 0.02 + y) * 0.5;
        if (x === 0) ctx.moveTo(x, gy); else ctx.lineTo(x, gy);
      }
      ctx.stroke();
    }

    // Pencil marks/scratches
    ctx.strokeStyle = 'rgba(80,80,80,0.03)';
    ctx.lineWidth = 0.5;
    for (var i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(rand(W * 0.1, W * 0.8), by + rand(2, 8));
      ctx.lineTo(rand(W * 0.1, W * 0.8), by + rand(2, 8));
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawBalanceScale() {
    var bx = W * 0.7, by = H * 0.38;
    var t = time * 0.001;
    balanceTilt = Math.sin(t * 0.5) * 0.15 * (1 - progress * 0.7); // levels with progress

    ctx.globalAlpha = (0.4 + progress * 0.35) * brightness;
    // Centre post
    ctx.fillStyle = '#8a7848';
    ctx.fillRect(bx - 2, by, 4, 12);
    // Base
    ctx.fillStyle = '#7a6838';
    ctx.beginPath();
    ctx.ellipse(bx, by + 12, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Beam
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(balanceTilt);
    ctx.fillStyle = '#a08850';
    ctx.fillRect(-28, -2, 56, 3);
    // Left plate
    ctx.fillStyle = '#b09860';
    ctx.beginPath();
    ctx.ellipse(-24, 4, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // String
    ctx.strokeStyle = '#6a5838'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(-24, 0); ctx.lineTo(-24, 4); ctx.stroke();
    // Right plate
    ctx.beginPath();
    ctx.ellipse(24, 4, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath(); ctx.moveTo(24, 0); ctx.lineTo(24, 4); ctx.stroke();
    // Weights on left plate
    ctx.fillStyle = '#c4a448';
    ctx.fillRect(-27, -1, 6, 4);
    ctx.fillRect(-22, -2, 4, 5);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawTapeMeasure() {
    var tx = W * 0.15, ty = H * 0.56;
    var tapeLen = W * (0.2 + progress * 0.3); // extends with progress
    ctx.globalAlpha = (0.4 + progress * 0.35) * brightness;
    // Housing
    ctx.fillStyle = '#cc2020';
    ctx.beginPath();
    ctx.arc(tx, ty, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(tx, ty, 6, 0, Math.PI * 2);
    ctx.fill();
    // Tape ribbon
    ctx.fillStyle = '#ffdd44';
    ctx.fillRect(tx + 8, ty - 3, tapeLen, 6);
    // Markings
    ctx.fillStyle = '#1a1a1a';
    ctx.font = '5px sans-serif';
    ctx.textAlign = 'center';
    for (var m = 0; m < tapeLen; m += 10) {
      ctx.fillRect(tx + 10 + m, ty - 2, 0.5, m % 50 === 0 ? 4 : 2);
      if (m % 50 === 0 && m > 0) {
        ctx.fillText(Math.round(m / 10), tx + 10 + m, ty + 5);
      }
    }
    // End hook
    ctx.fillStyle = '#aaa';
    ctx.fillRect(tx + 8 + tapeLen, ty - 4, 3, 8);
    ctx.globalAlpha = 1;
  }

  function drawRuler() {
    var rx = W * 0.4, ry = H * 0.65;
    ctx.globalAlpha = (0.35 + progress * 0.3) * brightness;
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(-0.05);
    // Ruler body
    ctx.fillStyle = '#d4b870';
    ctx.fillRect(0, 0, W * 0.35, 14);
    // Edge
    ctx.fillStyle = '#c4a860';
    ctx.fillRect(0, 0, W * 0.35, 1.5);
    // Markings
    ctx.fillStyle = '#2a2a2a';
    for (var m = 0; m < W * 0.35; m += 6) {
      var isLong = m % 30 === 0;
      ctx.fillRect(m + 3, 1.5, 0.5, isLong ? 5 : 3);
    }
    // Numbers
    ctx.font = '4px sans-serif';
    ctx.fillStyle = '#2a2a2a';
    ctx.textAlign = 'center';
    for (var n = 0; n < W * 0.35; n += 30) {
      if (n > 0) ctx.fillText(Math.round(n / 30), n + 3, 10);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function drawMeasuringJug() {
    var jx = W * 0.25, jy = H * 0.42;
    var jh = 30, jw = 16;
    var fillLevel = 0.2 + progress * 0.6;
    ctx.globalAlpha = (0.4 + progress * 0.3) * brightness;
    // Jug outline
    ctx.strokeStyle = '#8a8a88';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(jx - jw * 0.4, jy);
    ctx.lineTo(jx - jw * 0.5, jy + jh);
    ctx.lineTo(jx + jw * 0.5, jy + jh);
    ctx.lineTo(jx + jw * 0.4, jy);
    ctx.stroke();
    // Handle
    ctx.beginPath();
    ctx.arc(jx + jw * 0.5 + 5, jy + jh * 0.4, 6, -Math.PI * 0.5, Math.PI * 0.5);
    ctx.stroke();
    // Liquid
    var liquidY = jy + jh * (1 - fillLevel);
    ctx.fillStyle = 'rgba(60,140,220,0.3)';
    ctx.fillRect(jx - jw * 0.45, liquidY, jw * 0.9, jy + jh - liquidY);
    // Level lines
    ctx.strokeStyle = '#6a6a68';
    ctx.lineWidth = 0.5;
    for (var l = 0; l < 4; l++) {
      var ly = jy + jh * 0.2 + l * (jh * 0.2);
      ctx.beginPath();
      ctx.moveTo(jx - jw * 0.35, ly);
      ctx.lineTo(jx - jw * 0.15, ly);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawSpiritLevel() {
    var lx = W * 0.55, ly = H * 0.72;
    var t = time * 0.001;
    bubblePos = Math.sin(t * 0.4) * 6 * (1 - progress * 0.8); // centres with progress
    ctx.globalAlpha = (0.35 + progress * 0.3) * brightness;
    // Body
    ctx.fillStyle = '#30aa30';
    ctx.fillRect(lx - 30, ly, 60, 8);
    // Vial
    ctx.fillStyle = 'rgba(200,255,200,0.4)';
    ctx.fillRect(lx - 12, ly + 1, 24, 6);
    // Bubble
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(lx + bubblePos, ly + 4, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    // Centre marks
    ctx.strokeStyle = '#1a6a1a';
    ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.moveTo(lx - 1, ly + 1); ctx.lineTo(lx - 1, ly + 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lx + 1, ly + 1); ctx.lineTo(lx + 1, ly + 7); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawBrassWeights() {
    var wx = W * 0.82, wy = H * 0.56;
    ctx.globalAlpha = (0.35 + progress * 0.3) * brightness;
    // Stacked weights
    var weights = [{ w: 12, h: 8 }, { w: 10, h: 7 }, { w: 8, h: 6 }];
    var cy = wy;
    for (var i = weights.length - 1; i >= 0; i--) {
      var w = weights[i];
      ctx.fillStyle = i === 0 ? '#c4a040' : i === 1 ? '#b49030' : '#a48020';
      ctx.fillRect(wx - w.w * 0.5, cy - w.h, w.w, w.h);
      // Highlight
      ctx.fillStyle = 'rgba(255,240,180,0.15)';
      ctx.fillRect(wx - w.w * 0.5, cy - w.h, w.w, 1.5);
      cy -= w.h;
    }
    ctx.globalAlpha = 1;
  }

  function drawWoodShavings() {
    for (var i = 0; i < woodShavings.length; i++) {
      var s = woodShavings[i];
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      ctx.globalAlpha = 0.15 * brightness;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, s.size, 0, Math.PI * s.curl);
      ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawPencil() {
    var px = W * 0.6, py = H * 0.58;
    ctx.globalAlpha = (0.3 + progress * 0.25) * brightness;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(0.15);
    // Body
    ctx.fillStyle = '#e8c820';
    ctx.fillRect(0, -2, 50, 4);
    // Tip
    ctx.fillStyle = '#d4b018';
    ctx.beginPath();
    ctx.moveTo(50, -2);
    ctx.lineTo(56, 0);
    ctx.lineTo(50, 2);
    ctx.closePath();
    ctx.fill();
    // Lead
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.moveTo(55, -0.5);
    ctx.lineTo(57, 0);
    ctx.lineTo(55, 0.5);
    ctx.closePath();
    ctx.fill();
    // Eraser
    ctx.fillStyle = '#e06080';
    ctx.fillRect(-6, -2, 6, 4);
    // Metal band
    ctx.fillStyle = '#c0c0b8';
    ctx.fillRect(-8, -2.5, 3, 5);
    ctx.restore();
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
      drawPegTools();
      drawBench();
      drawBalanceScale();
      drawMeasuringJug();
      drawTapeMeasure();
      drawRuler();
      drawBrassWeights();
      drawSpiritLevel();
      drawWoodShavings();
      drawPencil();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('measure', scene);

  window.ClassmatesMeasureScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('measure')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.45, 10, {
        spread: 5, rise: 1.5, decay: 0.02, size: 3,
        color: 'rgba(200,170,80,0.8)', shape: 'star', endColor: 'rgba(240,220,150,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.45, 5, {
        spread: 3, rise: 1, decay: 0.025, size: 2,
        color: 'rgba(160,130,60,0.6)'
      });
      if (window.FXSound) FXSound.play('click');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('measure')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 2, rise: -0.1, gravity: 0.02, decay: 0.015, size: 2,
        color: 'rgba(100,80,50,0.4)'
      });
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('measure')) return;
      var s = FXCore.getSize();
      var colors = ['rgba(200,170,80,0.7)','rgba(255,220,68,0.6)','rgba(160,130,60,0.7)','rgba(60,140,220,0.6)','rgba(48,170,48,0.6)'];
      for (var i = 0; i < colors.length; i++) {
        FXCore.emit(s.w * (0.2 + i * 0.15), s.h * 0.4, 5, {
          spread: 6, rise: 2.5, decay: 0.012, size: 3.5, color: colors[i], shape: 'star'
        });
      }
      if (window.FXSound) FXSound.playSequence(['click','chime','complete'], 110);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
