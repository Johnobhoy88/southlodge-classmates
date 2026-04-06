(function(){
  // ============================================================
  // VOCABULARY — "Grand Library"
  // A tall grand library with towering bookshelves, afternoon
  // light streaming through arched windows, dust motes drifting.
  // VERTICAL scene — height, scale, knowledge.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.75;
  var time = 0;

  var shelves = [];
  var books = [];
  var dustMotes = [];
  var bookPiles = [];
  var globeAngle = 0;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

  var W = 0, H = 0, ctx = null;

  var BOOK_COLORS = ['#c0392b','#2980b9','#27ae60','#8e44ad','#d35400','#2c3e50','#16a085','#c0392b','#f39c12','#1abc9c','#e74c3c','#3498db','#9b59b6','#e67e22'];

  function generateScene() {
    // Tall bookshelves — left and right
    shelves = [
      { x: 0, w: W * 0.15, y: 0, h: H * 0.75, shelfCount: 8 },
      { x: W * 0.85, w: W * 0.15, y: 0, h: H * 0.8, shelfCount: 9 }
    ];

    // Books on shelves
    books = [];
    for (var s = 0; s < shelves.length; s++) {
      var sh = shelves[s];
      var shelfH = sh.h / sh.shelfCount;
      for (var r = 0; r < sh.shelfCount; r++) {
        var booksInRow = Math.floor(rand(5, 10));
        for (var b = 0; b < booksInRow; b++) {
          books.push({
            x: sh.x + 4 + b * (sh.w / booksInRow) + rand(-1, 1),
            y: sh.y + r * shelfH + 4,
            w: rand(4, 9),
            h: shelfH - 8 + rand(-3, 3),
            color: pick(BOOK_COLORS),
            shelf: s, row: r,
            minProgress: r < 4 ? 0 : (r < 7 ? 0.3 : 0.6)
          });
        }
      }
    }

    // Book piles on desk
    bookPiles = [];
    var pilePositions = [
      { x: W * 0.25, count: 4 },
      { x: W * 0.55, count: 3 },
      { x: W * 0.7, count: 5 }
    ];
    for (var p = 0; p < pilePositions.length; p++) {
      var pp = pilePositions[p];
      for (var b = 0; b < pp.count; b++) {
        bookPiles.push({
          x: pp.x + rand(-5, 5),
          y: H * 0.78 - b * 6,
          w: rand(25, 40),
          h: 5,
          color: pick(BOOK_COLORS),
          tilt: rand(-0.08, 0.08)
        });
      }
    }

    // Dust motes
    dustMotes = [];
    for (var i = 0; i < 30; i++) {
      dustMotes.push({
        x: rand(W * 0.2, W * 0.85),
        y: rand(0, H * 0.8),
        size: rand(0.5, 2),
        speedX: rand(-0.04, 0.04),
        speedY: rand(-0.03, 0.03),
        opacity: rand(0.08, 0.25),
        phase: rand(0, Math.PI * 2)
      });
    }
  }

  // ==================== DRAWING ====================

  function drawWall() {
    var b = brightness;
    var wg = ctx.createLinearGradient(0, 0, 0, H);
    wg.addColorStop(0, 'hsl(20,' + Math.round(25 + progress * 10) + '%,' + Math.round(22 * b) + '%)');
    wg.addColorStop(0.5, 'hsl(18,' + Math.round(22 + progress * 8) + '%,' + Math.round(20 * b) + '%)');
    wg.addColorStop(1, 'hsl(15,' + Math.round(20) + '%,' + Math.round(16 * b) + '%)');
    ctx.fillStyle = wg;
    ctx.fillRect(0, 0, W, H);

    // Wood panel lines
    ctx.strokeStyle = 'rgba(60,35,15,' + (0.05 * b) + ')';
    ctx.lineWidth = 1;
    for (var x = W * 0.15; x < W * 0.85; x += 60) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H * 0.75); ctx.stroke();
    }
  }

  function drawWindow() {
    var wx = W * 0.65, wy = H * 0.02, ww = W * 0.15, wh = H * 0.5;
    ctx.globalAlpha = (0.4 + progress * 0.25) * brightness;

    // Arched window frame
    ctx.fillStyle = '#3a2a15';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(wx - 3, wy + wh);
    ctx.lineTo(wx - 3, wy + ww * 0.5);
    ctx.arc(wx + ww / 2, wy + ww * 0.5, ww / 2 + 3, Math.PI, 0);
    ctx.lineTo(wx + ww + 3, wy + wh);
    ctx.lineTo(wx + ww + 3, wy + wh + 4);
    ctx.lineTo(wx - 3, wy + wh + 4);
    ctx.closePath();
    ctx.fill();

    // Window glass — bright sky
    ctx.fillStyle = 'hsl(200,' + Math.round(40 + progress * 15) + '%,' + Math.round(70 * brightness) + '%)';
    ctx.beginPath();
    ctx.moveTo(wx, wy + wh);
    ctx.lineTo(wx, wy + ww * 0.5);
    ctx.arc(wx + ww / 2, wy + ww * 0.5, ww / 2, Math.PI, 0);
    ctx.lineTo(wx + ww, wy + wh);
    ctx.closePath();
    ctx.fill();

    // Window mullion (cross bar)
    ctx.fillStyle = '#3a2a15';
    ctx.fillRect(wx + ww / 2 - 1.5, wy + ww * 0.3, 3, wh - ww * 0.3);
    ctx.fillRect(wx, wy + wh * 0.5, ww, 3);

    // Light beams streaming in
    var t = time * 0.001;
    ctx.globalAlpha = (0.04 + progress * 0.06) * brightness;
    var beamG = ctx.createLinearGradient(wx + ww, wy + wh * 0.2, W * 0.3, H * 0.9);
    beamG.addColorStop(0, 'rgba(255,220,150,0.3)');
    beamG.addColorStop(0.5, 'rgba(255,200,120,0.1)');
    beamG.addColorStop(1, 'rgba(255,180,100,0)');
    ctx.fillStyle = beamG;
    ctx.beginPath();
    ctx.moveTo(wx, wy + wh * 0.2);
    ctx.lineTo(wx + ww, wy + wh * 0.1);
    ctx.lineTo(W * 0.35, H * 0.95);
    ctx.lineTo(W * 0.15, H * 0.95);
    ctx.closePath();
    ctx.fill();

    ctx.globalAlpha = 1;
  }

  function drawShelves() {
    for (var s = 0; s < shelves.length; s++) {
      var sh = shelves[s];
      ctx.globalAlpha = (0.5 + progress * 0.2) * brightness;
      // Shelf back panel
      ctx.fillStyle = 'hsl(20,20%,' + Math.round(14 * brightness) + '%)';
      ctx.fillRect(sh.x, sh.y, sh.w, sh.h);
      // Shelf planks
      var shelfH = sh.h / sh.shelfCount;
      ctx.fillStyle = '#5a3a20';
      for (var r = 0; r <= sh.shelfCount; r++) {
        ctx.fillRect(sh.x, sh.y + r * shelfH - 2, sh.w, 4);
      }
      // Side panel
      ctx.fillStyle = '#4a2a12';
      var sideX = s === 0 ? sh.x + sh.w - 3 : sh.x;
      ctx.fillRect(sideX, sh.y, 3, sh.h);
    }

    // Books on shelves
    for (var i = 0; i < books.length; i++) {
      var b = books[i];
      if (progress < b.minProgress) continue;
      ctx.globalAlpha = (0.4 + progress * 0.3) * brightness;
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      // Spine highlight
      ctx.globalAlpha = 0.15 * brightness;
      ctx.fillStyle = '#fff';
      ctx.fillRect(b.x, b.y, 1, b.h);
    }
    ctx.globalAlpha = 1;
  }

  function drawDesk() {
    var dy = H * 0.78;
    ctx.globalAlpha = (0.55 + progress * 0.2) * brightness;
    // Desk surface
    var dg = ctx.createLinearGradient(0, dy - 4, 0, dy + 6);
    dg.addColorStop(0, '#6b4423');
    dg.addColorStop(1, '#5a3a18');
    ctx.fillStyle = dg;
    ctx.fillRect(W * 0.12, dy, W * 0.76, 8);
    // Front edge highlight
    ctx.globalAlpha = 0.12 * brightness;
    ctx.fillStyle = '#8b6443';
    ctx.fillRect(W * 0.12, dy, W * 0.76, 2);

    // Floor below desk
    ctx.globalAlpha = (0.4 + progress * 0.15) * brightness;
    ctx.fillStyle = 'hsl(20,15%,' + Math.round(12 * brightness) + '%)';
    ctx.fillRect(0, dy + 8, W, H - dy - 8);
    ctx.globalAlpha = 1;
  }

  function drawBookPiles() {
    for (var i = 0; i < bookPiles.length; i++) {
      var b = bookPiles[i];
      ctx.save();
      ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
      ctx.rotate(b.tilt);
      ctx.globalAlpha = (0.4 + progress * 0.25) * brightness;
      ctx.fillStyle = b.color;
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.globalAlpha = 0.1 * brightness;
      ctx.fillStyle = '#fff';
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, 1);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawOpenBook() {
    var ox = W * 0.4, oy = H * 0.73;
    ctx.globalAlpha = (0.4 + progress * 0.25) * brightness;
    // Left page
    ctx.fillStyle = '#f4e8d0';
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.quadraticCurveTo(ox - 22, oy - 2, ox - 28, oy + 18);
    ctx.lineTo(ox, oy + 18);
    ctx.closePath();
    ctx.fill();
    // Right page
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.quadraticCurveTo(ox + 22, oy - 2, ox + 28, oy + 18);
    ctx.lineTo(ox, oy + 18);
    ctx.closePath();
    ctx.fill();
    // Spine
    ctx.strokeStyle = '#8b6443';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ox, oy - 1);
    ctx.lineTo(ox, oy + 18);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawLamp() {
    var lx = W * 0.32, ly = H * 0.68;
    ctx.globalAlpha = (0.35 + progress * 0.25) * brightness;
    // Stand
    ctx.strokeStyle = '#2c6b40';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx, ly + 10);
    ctx.lineTo(lx, ly - 8);
    ctx.stroke();
    // Base
    ctx.fillStyle = '#2c6b40';
    ctx.beginPath();
    ctx.ellipse(lx, ly + 10, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Shade
    ctx.fillStyle = '#1a5c30';
    ctx.beginPath();
    ctx.moveTo(lx - 12, ly - 6);
    ctx.quadraticCurveTo(lx, ly - 14, lx + 12, ly - 6);
    ctx.lineTo(lx + 10, ly - 2);
    ctx.lineTo(lx - 10, ly - 2);
    ctx.closePath();
    ctx.fill();
    // Warm light glow from lamp
    ctx.globalAlpha = (0.03 + progress * 0.04) * brightness;
    var lg = ctx.createRadialGradient(lx, ly - 2, 2, lx, ly + 20, 60);
    lg.addColorStop(0, 'rgba(255,230,150,0.3)');
    lg.addColorStop(1, 'rgba(255,200,100,0)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(lx, ly + 10, 60, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawGlobe() {
    var t = time * 0.001;
    var gx = W * 0.78, gy = H * 0.7;
    globeAngle += 0.003 * (0.5 + progress);
    ctx.globalAlpha = (0.3 + progress * 0.25) * brightness;
    // Pedestal
    ctx.fillStyle = '#5a3a20';
    ctx.fillRect(gx - 3, gy + 8, 6, 10);
    ctx.beginPath();
    ctx.ellipse(gx, gy + 18, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Globe sphere
    var gg = ctx.createRadialGradient(gx - 3, gy - 3, 0, gx, gy, 10);
    gg.addColorStop(0, '#5dade2');
    gg.addColorStop(0.6, '#2e86c1');
    gg.addColorStop(1, '#1a5276');
    ctx.fillStyle = gg;
    ctx.beginPath();
    ctx.arc(gx, gy, 10, 0, Math.PI * 2);
    ctx.fill();
    // Land masses (rotating stripes)
    ctx.globalAlpha = 0.2 * brightness;
    ctx.fillStyle = '#27ae60';
    for (var i = 0; i < 3; i++) {
      var lx2 = gx + Math.cos(globeAngle + i * 2.1) * 7;
      var ly2 = gy + Math.sin(globeAngle * 0.5 + i) * 4;
      ctx.beginPath();
      ctx.ellipse(lx2, ly2, 3, 5, globeAngle + i, 0, Math.PI * 2);
      ctx.fill();
    }
    // Frame ring
    ctx.globalAlpha = 0.3 * brightness;
    ctx.strokeStyle = '#8B7355';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(gx, gy, 11, 11, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawPlant() {
    var px = W * 0.2, py = H * 0.74;
    ctx.globalAlpha = (0.3 + progress * 0.2) * brightness;
    // Pot
    ctx.fillStyle = '#C2663A';
    ctx.fillRect(px - 5, py, 10, 8);
    // Plant leaves
    ctx.fillStyle = '#27ae60';
    var t = time * 0.001;
    for (var i = 0; i < 3; i++) {
      var angle = -0.8 + i * 0.5 + Math.sin(t * 0.5 + i) * 0.1;
      ctx.beginPath();
      ctx.ellipse(px + Math.cos(angle) * 6, py - 4 + Math.sin(angle) * -4, 4, 2, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawDustMotes() {
    var t = time * 0.001;
    for (var i = 0; i < dustMotes.length; i++) {
      var d = dustMotes[i];
      d.x += d.speedX + Math.sin(t * 0.3 + d.phase) * 0.08;
      d.y += d.speedY + Math.cos(t * 0.4 + d.phase) * 0.05;
      if (d.x < W * 0.15) d.x = W * 0.85;
      if (d.x > W * 0.85) d.x = W * 0.15;
      if (d.y < 0) d.y = H * 0.75;
      if (d.y > H * 0.8) d.y = 0;

      // Brighter in window light beam
      var inBeam = (d.x > W * 0.3 && d.x < W * 0.7 && d.y > H * 0.1 && d.y < H * 0.8) ? 1.5 : 1;
      ctx.globalAlpha = d.opacity * (0.5 + progress * 0.5) * brightness * inBeam;
      ctx.fillStyle = '#ffd700';
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
      drawWall();
      drawWindow();
      drawShelves();
      drawDesk();
      drawLamp();
      drawOpenBook();
      drawBookPiles();
      drawGlobe();
      drawPlant();
      drawDustMotes();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('vocab', scene);

  window.ClassmatesVocabScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('vocab')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.4, 10, {
        spread: 5, rise: 2, decay: 0.02, size: 3,
        color: 'rgba(255,215,0,0.8)', shape: 'star', endColor: 'rgba(244,232,208,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.4, 5, {
        spread: 3, rise: 1.5, decay: 0.025, size: 2,
        color: 'rgba(41,128,185,0.6)'
      });
      if (window.FXSound) FXSound.play('click');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('vocab')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 2, rise: -0.2, gravity: 0.02, decay: 0.015, size: 2,
        color: 'rgba(90,60,30,0.4)'
      });
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('vocab')) return;
      var s = FXCore.getSize();
      var colors = ['rgba(255,215,0,0.7)','rgba(41,128,185,0.6)','rgba(39,174,96,0.6)','rgba(142,68,173,0.6)','rgba(211,84,0,0.6)'];
      for (var i = 0; i < colors.length; i++) {
        FXCore.emit(s.w * (0.2 + i * 0.15), s.h * 0.35, 4, {
          spread: 6, rise: 2.5, decay: 0.012, size: 3.5, color: colors[i], shape: 'star'
        });
      }
      if (window.FXSound) FXSound.playSequence(['click','chime','complete'], 120);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
