(function(){
  // ============================================================
  // WORD PROBLEMS — "Village Market"
  // A bright outdoor market on a sunny morning. Colourful stalls,
  // striped awnings, bunting, baskets of fruit, cobblestones.
  // CHEERFUL, BUSTLING, SOCIAL — real-world maths in action.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.8;
  var time = 0;

  var clouds = [];
  var rooftops = [];
  var stalls = [];
  var buntingFlags = [];
  var fruitBaskets = [];
  var cobbles = [];
  var birds = [];
  var priceTags = [];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

  var W = 0, H = 0, ctx = null;

  function generateScene() {
    // Clouds
    clouds = [];
    for (var i = 0; i < 4; i++) {
      clouds.push({
        x: rand(-50, W + 50), y: rand(H * 0.03, H * 0.15),
        w: rand(60, 120), puffs: Math.floor(rand(3, 5)),
        speed: rand(0.08, 0.2), opacity: rand(0.5, 0.8)
      });
    }

    // Rooftops
    rooftops = [];
    var rx = 0;
    while (rx < W) {
      var rw = rand(30, 60);
      rooftops.push({ x: rx, w: rw, h: rand(20, 40), chimney: Math.random() > 0.5, color: pick(['#8b6550','#a07050','#7a5a40','#906848']) });
      rx += rw + rand(5, 15);
    }

    // Market stalls
    var stallColors = [['#cc3030','#fff'],['#2060cc','#fff'],['#208040','#fff']];
    stalls = [
      { x: W * 0.1, y: H * 0.35, w: W * 0.22, h: H * 0.15, colors: stallColors[0] },
      { x: W * 0.42, y: H * 0.33, w: W * 0.2, h: H * 0.16, colors: stallColors[1] },
      { x: W * 0.72, y: H * 0.36, w: W * 0.22, h: H * 0.14, colors: stallColors[2] }
    ];

    // Bunting between stalls
    buntingFlags = [];
    for (var s = 0; s < stalls.length - 1; s++) {
      var s1 = stalls[s], s2 = stalls[s + 1];
      var startX = s1.x + s1.w, endX = s2.x;
      var flagCount = Math.floor((endX - startX) / 12);
      for (var f = 0; f < flagCount; f++) {
        var t = f / flagCount;
        var fx = startX + (endX - startX) * t;
        var fy = Math.min(s1.y, s2.y) - 10 + Math.sin(t * Math.PI) * 12;
        buntingFlags.push({ x: fx, y: fy, color: pick(['#cc3030','#ffcc00','#2060cc','#20aa40','#ff6600','#cc30cc']) });
      }
    }

    // Fruit baskets on stall counters
    fruitBaskets = [];
    for (var s = 0; s < stalls.length; s++) {
      var st = stalls[s];
      var fruitsInStall = Math.floor(rand(3, 6));
      for (var f = 0; f < fruitsInStall; f++) {
        fruitBaskets.push({
          x: st.x + 15 + f * (st.w / fruitsInStall),
          y: st.y + st.h - 5,
          type: pick(['apple','orange','banana','grape']),
          minProgress: f > 2 ? 0.3 : 0
        });
      }
    }

    // Cobblestones
    cobbles = [];
    for (var y = H * 0.65; y < H; y += 12) {
      var offset = (Math.floor((y - H * 0.65) / 12) % 2) * 8;
      for (var x = offset; x < W; x += 16) {
        cobbles.push({ x: x + rand(-1, 1), y: y + rand(-1, 1), w: rand(12, 15), h: rand(8, 11) });
      }
    }

    // Birds on rooftops
    birds = [];
    for (var i = 0; i < 4; i++) {
      birds.push({
        x: rand(W * 0.1, W * 0.9), y: rand(H * 0.15, H * 0.25),
        size: rand(3, 5), wingPhase: rand(0, Math.PI * 2),
        sitting: Math.random() > 0.4,
        minProgress: i < 2 ? 0 : 0.4
      });
    }

    // Floating price tags
    priceTags = [];
    var tagTexts = ['\u00A31','\u00A32','50p','20p','10p','\u00A35'];
    for (var i = 0; i < 8; i++) {
      priceTags.push({
        x: rand(W * 0.1, W * 0.9), y: rand(H * 0.2, H * 0.55),
        text: pick(tagTexts), size: rand(8, 14),
        speed: rand(0.03, 0.08), drift: rand(-0.06, 0.06),
        opacity: rand(0.04, 0.08), rotation: rand(-0.15, 0.15),
        rotSpeed: rand(-0.002, 0.002)
      });
    }
  }

  // ==================== DRAWING ====================

  function drawSky() {
    var b = brightness;
    var sg = ctx.createLinearGradient(0, 0, 0, H * 0.4);
    sg.addColorStop(0, 'hsl(210,' + Math.round(55 + progress * 15) + '%,' + Math.round(60 * b) + '%)');
    sg.addColorStop(0.6, 'hsl(200,' + Math.round(45 + progress * 10) + '%,' + Math.round(70 * b) + '%)');
    sg.addColorStop(1, 'hsl(195,' + Math.round(35 + progress * 8) + '%,' + Math.round(78 * b) + '%)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, H);

    // Sun
    var sx = W * 0.8, sy = H * 0.08;
    ctx.globalAlpha = (0.3 + progress * 0.3) * b;
    var sunG = ctx.createRadialGradient(sx, sy, 5, sx, sy, 50);
    sunG.addColorStop(0, 'rgba(255,240,180,0.4)');
    sunG.addColorStop(0.5, 'rgba(255,220,120,0.1)');
    sunG.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.fillStyle = sunG;
    ctx.beginPath(); ctx.arc(sx, sy, 50, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff8d0';
    ctx.beginPath(); ctx.arc(sx, sy, 10, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawClouds() {
    var t = time * 0.001;
    for (var i = 0; i < clouds.length; i++) {
      var c = clouds[i];
      var cx = c.x + t * c.speed * 12;
      if (cx > W + c.w) cx -= W + c.w * 2;
      ctx.globalAlpha = c.opacity * brightness;
      ctx.fillStyle = '#fff';
      var pw = c.w / c.puffs;
      for (var p = 0; p < c.puffs; p++) {
        ctx.beginPath();
        ctx.arc(cx + p * pw * 0.7, c.y + Math.sin(p * 1.5) * 4, pw * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawRooftops() {
    var roofY = H * 0.22;
    ctx.globalAlpha = (0.4 + progress * 0.2) * brightness;
    for (var i = 0; i < rooftops.length; i++) {
      var r = rooftops[i];
      // Wall
      ctx.fillStyle = '#d4c4a8';
      ctx.fillRect(r.x, roofY, r.w, r.h + 15);
      // Roof
      ctx.fillStyle = r.color;
      ctx.beginPath();
      ctx.moveTo(r.x - 3, roofY);
      ctx.lineTo(r.x + r.w * 0.5, roofY - r.h);
      ctx.lineTo(r.x + r.w + 3, roofY);
      ctx.closePath();
      ctx.fill();
      // Chimney
      if (r.chimney) {
        ctx.fillStyle = '#8a6a4a';
        ctx.fillRect(r.x + r.w * 0.7, roofY - r.h * 0.8, 6, r.h * 0.5);
      }
      // Window
      ctx.fillStyle = '#6a9ac4';
      ctx.fillRect(r.x + r.w * 0.3, roofY + 5, 8, 8);
    }
    ctx.globalAlpha = 1;
  }

  function drawStalls() {
    for (var i = 0; i < stalls.length; i++) {
      var s = stalls[i];
      ctx.globalAlpha = (0.5 + progress * 0.3) * brightness;
      // Counter
      ctx.fillStyle = '#8a6a40';
      ctx.fillRect(s.x, s.y + s.h - 8, s.w, 8);
      // Back panel
      ctx.fillStyle = '#a08060';
      ctx.fillRect(s.x + 2, s.y + 5, s.w - 4, s.h - 12);
      // Awning — striped
      var stripeW = 8;
      for (var sx = s.x; sx < s.x + s.w; sx += stripeW * 2) {
        ctx.fillStyle = s.colors[0];
        ctx.fillRect(sx, s.y - 5, stripeW, 12);
        ctx.fillStyle = s.colors[1];
        ctx.fillRect(sx + stripeW, s.y - 5, stripeW, 12);
      }
      // Awning scallop edge
      ctx.fillStyle = s.colors[0];
      for (var sx = s.x; sx < s.x + s.w; sx += 10) {
        ctx.beginPath();
        ctx.arc(sx + 5, s.y + 7, 5, 0, Math.PI);
        ctx.fill();
      }
      // Poles
      ctx.fillStyle = '#5a4a30';
      ctx.fillRect(s.x + 3, s.y - 5, 3, s.h + 20);
      ctx.fillRect(s.x + s.w - 6, s.y - 5, 3, s.h + 20);
    }
    ctx.globalAlpha = 1;
  }

  function drawBunting() {
    var t = time * 0.001;
    for (var i = 0; i < buntingFlags.length; i++) {
      var f = buntingFlags[i];
      var sway = Math.sin(t * 1.5 + i * 0.5) * 2;
      ctx.globalAlpha = (0.4 + progress * 0.3) * brightness;
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.moveTo(f.x - 4, f.y + sway);
      ctx.lineTo(f.x + 4, f.y + sway);
      ctx.lineTo(f.x, f.y + 10 + sway);
      ctx.closePath();
      ctx.fill();
    }
    // String
    if (stalls.length > 1) {
      ctx.globalAlpha = 0.2 * brightness;
      ctx.strokeStyle = '#5a4a30';
      ctx.lineWidth = 1;
      for (var s = 0; s < stalls.length - 1; s++) {
        ctx.beginPath();
        ctx.moveTo(stalls[s].x + stalls[s].w, stalls[s].y - 8);
        ctx.quadraticCurveTo((stalls[s].x + stalls[s].w + stalls[s + 1].x) / 2, Math.min(stalls[s].y, stalls[s + 1].y) - 3, stalls[s + 1].x, stalls[s + 1].y - 8);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawFruit() {
    for (var i = 0; i < fruitBaskets.length; i++) {
      var f = fruitBaskets[i];
      if (f.minProgress && progress < f.minProgress) continue;
      ctx.globalAlpha = (0.45 + progress * 0.35) * brightness;
      // Basket
      ctx.fillStyle = '#b89060';
      ctx.beginPath();
      ctx.ellipse(f.x, f.y + 3, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Fruit
      if (f.type === 'apple') {
        ctx.fillStyle = '#cc2020';
        ctx.beginPath(); ctx.arc(f.x, f.y - 2, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#30aa20';
        ctx.fillRect(f.x - 0.5, f.y - 7, 1, 3);
      } else if (f.type === 'orange') {
        ctx.fillStyle = '#ff8c00';
        ctx.beginPath(); ctx.arc(f.x, f.y - 2, 4, 0, Math.PI * 2); ctx.fill();
      } else if (f.type === 'banana') {
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(f.x - 4, f.y);
        ctx.quadraticCurveTo(f.x, f.y - 6, f.x + 4, f.y - 2);
        ctx.quadraticCurveTo(f.x, f.y - 3, f.x - 4, f.y);
        ctx.fill();
      } else {
        ctx.fillStyle = '#7040a0';
        for (var g = 0; g < 4; g++) {
          ctx.beginPath(); ctx.arc(f.x - 3 + g * 2, f.y - 2 + (g % 2), 2, 0, Math.PI * 2); ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawCobbles() {
    ctx.globalAlpha = 0.08 * brightness;
    ctx.strokeStyle = '#8a8078';
    ctx.lineWidth = 0.5;
    for (var i = 0; i < cobbles.length; i++) {
      var c = cobbles[i];
      ctx.beginPath();
      ctx.ellipse(c.x + c.w * 0.5, c.y + c.h * 0.5, c.w * 0.45, c.h * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    // Ground base
    ctx.globalAlpha = brightness;
    ctx.fillStyle = 'hsl(30,8%,' + Math.round(45 * brightness) + '%)';
    ctx.fillRect(0, H * 0.63, W, H * 0.37);
    ctx.globalAlpha = 1;
  }

  function drawCart() {
    var cx = W * 0.85, cy = H * 0.65;
    ctx.globalAlpha = (0.35 + progress * 0.25) * brightness;
    // Cart body
    ctx.fillStyle = '#7a5a30';
    ctx.fillRect(cx - 15, cy - 10, 30, 15);
    // Handles
    ctx.strokeStyle = '#6a4a20';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx + 15, cy - 5); ctx.lineTo(cx + 28, cy - 12); ctx.stroke();
    // Wheels
    ctx.fillStyle = '#4a3a20';
    ctx.beginPath(); ctx.arc(cx - 10, cy + 6, 5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 10, cy + 6, 5, 0, Math.PI * 2); ctx.fill();
    // Produce in cart
    ctx.fillStyle = '#30aa20'; ctx.beginPath(); ctx.arc(cx - 5, cy - 12, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#cc6600'; ctx.beginPath(); ctx.arc(cx + 3, cy - 13, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#cc2020'; ctx.beginPath(); ctx.arc(cx - 1, cy - 15, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawBirds() {
    var t = time * 0.001;
    for (var i = 0; i < birds.length; i++) {
      var b = birds[i];
      if (b.minProgress && progress < b.minProgress) continue;
      ctx.globalAlpha = (0.3 + progress * 0.25) * brightness;
      ctx.fillStyle = '#3a3a40';
      if (b.sitting) {
        ctx.beginPath(); ctx.ellipse(b.x, b.y, b.size, b.size * 0.6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(b.x + b.size * 0.5, b.y - b.size * 0.3, b.size * 0.35, 0, Math.PI * 2); ctx.fill();
      } else {
        var wing = Math.sin(t * 4 + b.wingPhase) * b.size * 0.5;
        var bx = (b.x + t * 15) % (W + 20) - 10;
        ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx - b.size, b.y - wing);
        ctx.quadraticCurveTo(bx, b.y, bx + b.size, b.y - wing);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawPriceTags() {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (var i = 0; i < priceTags.length; i++) {
      var p = priceTags[i];
      p.y -= p.speed * 0.3;
      p.x += p.drift * 0.2;
      p.rotation += p.rotSpeed;
      if (p.y < H * 0.1) { p.y = H * 0.55; p.x = rand(W * 0.1, W * 0.9); }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity * (0.4 + progress * 0.6) * brightness;
      ctx.font = p.size + 'px "Fredoka One",cursive';
      ctx.fillStyle = '#2a6a2a';
      ctx.fillText(p.text, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // ==================== SCENE INTERFACE ====================
  var scene = {
    enter: function(canvas, context, w, h) {
      ctx = context; W = w; H = h;
      progress = 0; targetProgress = 0; brightness = 0.8;
      generateScene();
    },
    resize: function(w, h) { W = w; H = h; generateScene(); },
    update: function(dt, t) {
      time = t;
      progress += (targetProgress - progress) * 0.03;
      brightness += ((0.8 + progress * 0.2) - brightness) * 0.02;
    },
    draw: function() {
      drawSky();
      drawClouds();
      drawRooftops();
      drawCobbles();
      drawStalls();
      drawBunting();
      drawFruit();
      drawCart();
      drawBirds();
      drawPriceTags();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('wordprob', scene);

  window.ClassmatesWordprobScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('wordprob')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.4, 10, {
        spread: 5, rise: 2, decay: 0.02, size: 3,
        color: 'rgba(255,200,50,0.8)', shape: 'star', endColor: 'rgba(255,230,150,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.4, 5, {
        spread: 3, rise: 1.5, decay: 0.025, size: 2,
        color: 'rgba(50,150,50,0.6)'
      });
      if (window.FXSound) FXSound.play('starCollect');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('wordprob')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 2, rise: -0.1, gravity: 0.02, decay: 0.015, size: 2,
        color: 'rgba(100,80,60,0.4)'
      });
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('wordprob')) return;
      var s = FXCore.getSize();
      var colors = ['rgba(204,48,48,0.7)','rgba(255,204,0,0.7)','rgba(32,96,204,0.7)','rgba(32,170,64,0.7)','rgba(255,102,0,0.7)'];
      for (var i = 0; i < colors.length; i++) {
        FXCore.emit(s.w * (0.15 + i * 0.175), s.h * 0.35, 5, {
          spread: 6, rise: 3, decay: 0.012, size: 3.5, color: colors[i], shape: 'star'
        });
      }
      if (window.FXSound) FXSound.playSequence(['starCollect','correct','complete'], 100);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
