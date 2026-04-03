(function(){
  // ============================================================
  // SEQUENCES — "Domino Chain"
  // Colourful dominoes in a chain, some fallen, some standing.
  // Spotlight on polished dark floor. KINETIC, ELEGANT, RHYTHMIC.
  // Each domino triggers the next — like numbers in a sequence.
  // Built on FXCore shared modules.
  // ============================================================

  var progress = 0, targetProgress = 0, brightness = 0.5;
  var time = 0;

  var dominoes = [];
  var ripples = [];
  var dustMotes = [];
  var floatingNums = [];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(rand(0, arr.length))]; }

  var W = 0, H = 0, ctx = null;

  var DOMINO_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#f43f5e','#10b981'];

  function generateScene() {
    // Domino chain — curved path across screen
    dominoes = [];
    var count = 18;
    for (var i = 0; i < count; i++) {
      var t = i / (count - 1);
      // S-curve path
      var dx = W * 0.1 + t * W * 0.8;
      var dy = H * 0.5 + Math.sin(t * Math.PI * 2) * H * 0.12 + Math.sin(t * Math.PI) * H * 0.08;
      dominoes.push({
        x: dx, y: dy,
        w: 8, h: 22,
        color: DOMINO_COLORS[i % DOMINO_COLORS.length],
        index: i,
        angle: Math.atan2(
          (H * 0.5 + Math.sin((i + 1) / (count - 1) * Math.PI * 2) * H * 0.12) - dy,
          (W * 0.1 + (i + 1) / (count - 1) * W * 0.8) - dx
        ) + Math.PI / 2
      });
    }

    // Dust motes in spotlight
    dustMotes = [];
    for (var i = 0; i < 20; i++) {
      dustMotes.push({
        x: rand(W * 0.15, W * 0.85), y: rand(H * 0.1, H * 0.7),
        size: rand(0.5, 2), speedX: rand(-0.03, 0.03),
        speedY: rand(-0.02, 0.02), opacity: rand(0.08, 0.25),
        phase: rand(0, Math.PI * 2)
      });
    }

    // Floating number fragments
    var NUMS = '123456789?+';
    floatingNums = [];
    for (var i = 0; i < 10; i++) {
      floatingNums.push({
        x: rand(W * 0.1, W * 0.9), y: rand(H * 0.15, H * 0.7),
        char: NUMS[Math.floor(rand(0, NUMS.length))],
        size: rand(10, 22), speed: rand(0.04, 0.1),
        drift: rand(-0.08, 0.08), opacity: rand(0.03, 0.06),
        rotation: rand(-0.2, 0.2), rotSpeed: rand(-0.002, 0.002),
        color: pick(DOMINO_COLORS)
      });
    }

    ripples = [];
  }

  // ==================== DRAWING ====================

  function drawFloor() {
    var b = brightness;
    // Dark polished floor
    ctx.fillStyle = 'hsl(230,' + Math.round(10 + progress * 5) + '%,' + Math.round(8 * b) + '%)';
    ctx.fillRect(0, 0, W, H);

    // Subtle reflection sheen — horizontal gradient bands
    ctx.globalAlpha = (0.02 + progress * 0.03) * b;
    for (var y = 0; y < H; y += H * 0.25) {
      var sg = ctx.createLinearGradient(0, y, 0, y + H * 0.15);
      sg.addColorStop(0, 'rgba(255,255,255,0)');
      sg.addColorStop(0.5, 'rgba(255,255,255,0.05)');
      sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(0, y, W, H * 0.15);
    }
    ctx.globalAlpha = 1;
  }

  function drawSpotlight() {
    var cx = W * 0.5, cy = H * 0.1;
    var spotR = W * (0.3 + progress * 0.2);
    ctx.globalAlpha = (0.06 + progress * 0.08) * brightness;
    var sg = ctx.createRadialGradient(cx, H * 0.45, 20, cx, H * 0.45, spotR);
    sg.addColorStop(0, 'rgba(255,240,200,0.2)');
    sg.addColorStop(0.5, 'rgba(255,230,180,0.06)');
    sg.addColorStop(1, 'rgba(255,220,160,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, H);

    // Spotlight cone from top
    ctx.globalAlpha = (0.03 + progress * 0.04) * brightness;
    ctx.beginPath();
    ctx.moveTo(cx - 15, 0);
    ctx.lineTo(cx + 15, 0);
    ctx.lineTo(cx + spotR, H * 0.85);
    ctx.lineTo(cx - spotR, H * 0.85);
    ctx.closePath();
    var cg = ctx.createLinearGradient(cx, 0, cx, H * 0.85);
    cg.addColorStop(0, 'rgba(255,240,200,0.15)');
    cg.addColorStop(0.5, 'rgba(255,230,180,0.04)');
    cg.addColorStop(1, 'rgba(255,220,160,0)');
    ctx.fillStyle = cg;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawDominoes() {
    var t = time * 0.001;
    var fallenCount = Math.floor(dominoes.length * progress * 0.8);

    for (var i = 0; i < dominoes.length; i++) {
      var d = dominoes[i];
      var isFallen = i < fallenCount;
      var isNext = i === fallenCount;

      ctx.save();
      ctx.translate(d.x, d.y);

      if (isFallen) {
        // Fallen — lying flat with tilt
        ctx.rotate(d.angle + Math.PI / 2);
        ctx.globalAlpha = (0.3 + progress * 0.2) * brightness;
        ctx.fillStyle = d.color;
        ctx.fillRect(-d.h * 0.5, -d.w * 0.15, d.h, d.w * 0.3);
        // Dot pattern on top
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath(); ctx.arc(-d.h * 0.2, 0, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(d.h * 0.2, 0, 1.5, 0, Math.PI * 2); ctx.fill();
      } else {
        // Standing — upright
        var wobble = isNext ? Math.sin(t * 4) * 0.08 : 0;
        ctx.rotate(d.angle + wobble);
        var glow = isNext ? 0.3 + Math.sin(t * 3) * 0.15 : 0;

        // Glow on "next" domino
        if (isNext) {
          ctx.globalAlpha = glow * brightness;
          var ng = ctx.createRadialGradient(0, 0, 2, 0, 0, 20);
          ng.addColorStop(0, d.color);
          ng.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = ng;
          ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
        }

        ctx.globalAlpha = (0.5 + progress * 0.35) * brightness;
        // Domino body
        ctx.fillStyle = d.color;
        ctx.fillRect(-d.w * 0.5, -d.h * 0.5, d.w, d.h);
        // Edge highlight
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(-d.w * 0.5, -d.h * 0.5, d.w, 2);
        ctx.fillRect(-d.w * 0.5, -d.h * 0.5, 1.5, d.h);
        // Centre line
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(-d.w * 0.5, -0.5, d.w, 1);
        // Dots
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath(); ctx.arc(0, -d.h * 0.25, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(0, d.h * 0.25, 1.5, 0, Math.PI * 2); ctx.fill();
        // Shadow
        ctx.globalAlpha = 0.08 * brightness;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(d.w * 0.3, d.h * 0.5, d.w * 0.6, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawRipples() {
    // Ripple effect where dominoes have fallen
    var fallenCount = Math.floor(dominoes.length * progress * 0.8);
    var t = time * 0.001;

    for (var i = 0; i < Math.min(fallenCount, 6); i++) {
      var d = dominoes[i];
      var rippleAge = (fallenCount - i) * 0.1;
      var rippleSize = 8 + rippleAge * 4;
      var rippleAlpha = Math.max(0, 0.04 - rippleAge * 0.005) * brightness;
      ctx.globalAlpha = rippleAlpha;
      ctx.strokeStyle = d.color;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(d.x, d.y, rippleSize + Math.sin(t + i) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawFloatingNums() {
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (var i = 0; i < floatingNums.length; i++) {
      var n = floatingNums[i];
      n.y -= n.speed * 0.3;
      n.x += n.drift * 0.2;
      n.rotation += n.rotSpeed;
      if (n.y < H * 0.05) { n.y = H * 0.7; n.x = rand(W * 0.1, W * 0.9); }
      ctx.save();
      ctx.translate(n.x, n.y);
      ctx.rotate(n.rotation);
      ctx.globalAlpha = n.opacity * (0.4 + progress * 0.6) * brightness;
      ctx.font = n.size + 'px "Fredoka One",cursive';
      ctx.fillStyle = n.color;
      ctx.fillText(n.char, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawDustMotes() {
    var t = time * 0.001;
    for (var i = 0; i < dustMotes.length; i++) {
      var d = dustMotes[i];
      d.x += d.speedX + Math.sin(t * 0.3 + d.phase) * 0.04;
      d.y += d.speedY + Math.cos(t * 0.4 + d.phase) * 0.03;
      if (d.x < W * 0.1) d.x = W * 0.9;
      if (d.x > W * 0.9) d.x = W * 0.1;
      if (d.y < H * 0.05) d.y = H * 0.7;
      if (d.y > H * 0.75) d.y = H * 0.05;
      // Brighter in spotlight
      var inSpot = (Math.abs(d.x - W * 0.5) < W * 0.25 && d.y > H * 0.1 && d.y < H * 0.7) ? 1.5 : 1;
      ctx.globalAlpha = d.opacity * (0.5 + progress * 0.5) * brightness * inSpot;
      ctx.fillStyle = '#fff8e0';
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Chain line connecting dominoes
  function drawChainPath() {
    ctx.globalAlpha = 0.04 * brightness;
    ctx.strokeStyle = '#4a4a5a';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    for (var i = 0; i < dominoes.length; i++) {
      if (i === 0) ctx.moveTo(dominoes[i].x, dominoes[i].y);
      else ctx.lineTo(dominoes[i].x, dominoes[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  // ==================== SCENE INTERFACE ====================
  var scene = {
    enter: function(canvas, context, w, h) {
      ctx = context; W = w; H = h;
      progress = 0; targetProgress = 0; brightness = 0.5;
      generateScene();
    },
    resize: function(w, h) { W = w; H = h; generateScene(); },
    update: function(dt, t) {
      time = t;
      progress += (targetProgress - progress) * 0.03;
      brightness += ((0.5 + progress * 0.5) - brightness) * 0.02;
    },
    draw: function() {
      drawFloor();
      drawSpotlight();
      drawChainPath();
      drawRipples();
      drawDominoes();
      drawFloatingNums();
      drawDustMotes();
    },
    exit: function() {}
  };

  if (window.FXCore) FXCore.register('sequence', scene);

  window.ClassmatesSequenceScene = {
    onCorrect: function(idx) {
      if (!window.FXCore || !FXCore.isActive('sequence')) return;
      var s = FXCore.getSize();
      var color = DOMINO_COLORS[idx % DOMINO_COLORS.length];
      FXCore.emit(s.w * 0.5, s.h * 0.45, 10, {
        spread: 5, rise: 2, decay: 0.02, size: 3,
        color: color.replace('#', 'rgba(') ? 'rgba(100,200,255,0.8)' : 'rgba(100,200,255,0.8)',
        shape: 'diamond', endColor: 'rgba(255,255,255,0)'
      });
      FXCore.emit(s.w * 0.5, s.h * 0.45, 5, {
        spread: 3, rise: 1.5, decay: 0.025, size: 2,
        color: 'rgba(200,200,255,0.6)'
      });
      if (window.FXSound) FXSound.play('click');
    },
    onWrong: function() {
      if (!window.FXCore || !FXCore.isActive('sequence')) return;
      var s = FXCore.getSize();
      FXCore.emit(s.w * 0.5, s.h * 0.5, 4, {
        spread: 2, rise: -0.1, gravity: 0.02, decay: 0.015, size: 2,
        color: 'rgba(80,80,100,0.4)'
      });
      if (window.FXSound) FXSound.play('wrongGentle');
    },
    onComplete: function() {
      targetProgress = 1;
      if (!window.FXCore || !FXCore.isActive('sequence')) return;
      var s = FXCore.getSize();
      // Cascade of domino colours
      for (var i = 0; i < 6; i++) {
        var dc = DOMINO_COLORS[i * 2 % DOMINO_COLORS.length];
        FXCore.emit(s.w * (0.15 + i * 0.14), s.h * 0.4, 5, {
          spread: 6, rise: 3, decay: 0.01, size: 3.5,
          color: 'rgba(' + parseInt(dc.slice(1,3),16) + ',' + parseInt(dc.slice(3,5),16) + ',' + parseInt(dc.slice(5,7),16) + ',0.7)',
          shape: 'diamond'
        });
      }
      if (window.FXSound) FXSound.playSequence(['click','click','click','complete'], 80);
    },
    setProgress: function(pct) { targetProgress = Math.max(0, Math.min(1, pct || 0)); }
  };
})();
