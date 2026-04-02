(function(){
  // ============================================================
  // LANDING BACKDROP — Bright Highland Day
  // Rolling green hills, blue sky, fluffy clouds, sunshine
  // For the kids of South Lodge Primary, Invergordon
  // ============================================================

  var canvas, ctx, animId, running = false;
  var W = 0, H = 0, time = 0;

  // Scene data
  var clouds = [];
  var birds = [];
  var flowers = [];
  var butterflies = [];
  var sunRays = [];
  var hillLayers = [];
  var daisies = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

  // ==================== SCENE GENERATION ====================
  function generateScene() {
    if (!W || !H) return;

    // Clouds — big fluffy ones drifting gently
    clouds = [];
    for (var i = 0; i < 8; i++) {
      clouds.push({
        x: rand(-100, W + 100),
        y: rand(H * 0.04, H * 0.28),
        w: rand(100, 220),
        h: rand(40, 70),
        speed: rand(0.15, 0.5),
        puffs: Math.floor(rand(3, 6)),
        opacity: rand(0.7, 0.95)
      });
    }

    // Birds — little V shapes gliding
    birds = [];
    for (var i = 0; i < 5; i++) {
      birds.push({
        x: rand(0, W),
        y: rand(H * 0.08, H * 0.25),
        speed: rand(0.4, 1.2),
        wingPhase: rand(0, Math.PI * 2),
        size: rand(4, 8)
      });
    }

    // Hill layers — 3 rolling layers of green
    hillLayers = [];
    // Far hills — blue-green, gentle
    var farPoints = [];
    for (var x = 0; x <= W + 40; x += 40) {
      farPoints.push({ x: x, y: H * 0.48 + Math.sin(x * 0.004 + 1.2) * H * 0.06 + Math.sin(x * 0.009) * H * 0.03 });
    }
    hillLayers.push({ points: farPoints, color1: '#5b9f6e', color2: '#3d7a50', sway: 0.002 });

    // Mid hills — rich green
    var midPoints = [];
    for (var x = 0; x <= W + 40; x += 30) {
      midPoints.push({ x: x, y: H * 0.58 + Math.sin(x * 0.006 + 0.5) * H * 0.05 + Math.sin(x * 0.013) * H * 0.025 });
    }
    hillLayers.push({ points: midPoints, color1: '#4CAF50', color2: '#2E7D32', sway: 0.003 });

    // Near hills — bright vibrant green
    var nearPoints = [];
    for (var x = 0; x <= W + 40; x += 25) {
      nearPoints.push({ x: x, y: H * 0.72 + Math.sin(x * 0.008 + 2) * H * 0.04 + Math.sin(x * 0.015) * H * 0.02 });
    }
    hillLayers.push({ points: nearPoints, color1: '#66BB6A', color2: '#388E3C', sway: 0.004 });

    // Daisies and wildflowers on the near hill
    daisies = [];
    for (var i = 0; i < 35; i++) {
      var dx = rand(0, W);
      var hillY = H * 0.72 + Math.sin(dx * 0.008 + 2) * H * 0.04 + Math.sin(dx * 0.015) * H * 0.02;
      daisies.push({
        x: dx,
        y: hillY + rand(-8, 20),
        size: rand(3, 7),
        color: ['#fff', '#FFD93D', '#FF6B6B', '#74b9ff', '#a29bfe', '#fd79a8'][Math.floor(rand(0, 6))],
        phase: rand(0, Math.PI * 2)
      });
    }

    // Butterflies
    butterflies = [];
    for (var i = 0; i < 4; i++) {
      butterflies.push({
        x: rand(W * 0.1, W * 0.9),
        y: rand(H * 0.35, H * 0.65),
        vx: rand(-0.3, 0.3),
        vy: rand(-0.2, 0.2),
        wingPhase: rand(0, Math.PI * 2),
        size: rand(5, 9),
        color: ['#FF6B6B', '#FFD93D', '#74b9ff', '#a29bfe', '#fd79a8', '#55efc4'][Math.floor(rand(0, 6))]
      });
    }

    // Sun rays
    sunRays = [];
    for (var i = 0; i < 8; i++) {
      sunRays.push({
        angle: (i / 8) * Math.PI * 2,
        length: rand(80, 160),
        width: rand(15, 40),
        opacity: rand(0.03, 0.08)
      });
    }
  }

  // ==================== DRAWING ====================
  function drawSky() {
    var grad = ctx.createLinearGradient(0, 0, 0, H * 0.7);
    grad.addColorStop(0, '#4FC3F7');    // bright sky blue
    grad.addColorStop(0.3, '#81D4FA');  // lighter
    grad.addColorStop(0.6, '#B3E5FC');  // pale blue
    grad.addColorStop(1, '#E1F5FE');    // almost white near horizon
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawSun() {
    var sx = W * 0.78, sy = H * 0.12, sr = 40;
    var t = time * 0.001;

    // Warm glow
    var glow = ctx.createRadialGradient(sx, sy, sr * 0.5, sx, sy, sr * 4);
    glow.addColorStop(0, 'rgba(255,235,59,0.3)');
    glow.addColorStop(0.3, 'rgba(255,235,59,0.1)');
    glow.addColorStop(1, 'rgba(255,235,59,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(sx - sr * 4, sy - sr * 4, sr * 8, sr * 8);

    // Rotating rays
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(t * 0.1);
    for (var i = 0; i < sunRays.length; i++) {
      var r = sunRays[i];
      var pulseLen = r.length + Math.sin(t * 0.5 + i) * 20;
      ctx.save();
      ctx.rotate(r.angle);
      ctx.beginPath();
      ctx.moveTo(sr * 0.8, -r.width * 0.5);
      ctx.lineTo(pulseLen, 0);
      ctx.lineTo(sr * 0.8, r.width * 0.5);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255,235,59,' + (r.opacity + Math.sin(t + i) * 0.02) + ')';
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // Sun disc
    var sunGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    sunGrad.addColorStop(0, '#FFF9C4');
    sunGrad.addColorStop(0.7, '#FFD93D');
    sunGrad.addColorStop(1, '#F0A500');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawClouds() {
    var t = time * 0.001;
    for (var i = 0; i < clouds.length; i++) {
      var c = clouds[i];
      var cx = c.x + t * c.speed * 20;
      // Wrap around
      if (cx > W + c.w) cx -= W + c.w * 2;
      if (cx < -c.w) cx += W + c.w * 2;

      ctx.globalAlpha = c.opacity;
      ctx.fillStyle = '#fff';
      // Draw cloud as overlapping circles
      var pw = c.w / c.puffs;
      for (var p = 0; p < c.puffs; p++) {
        var px = cx + p * pw * 0.7;
        var py = c.y + Math.sin(p * 1.5) * c.h * 0.2;
        var pr = pw * 0.55 + Math.sin(p * 2.1) * pw * 0.15;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
      }
      // Bottom flat — extra fill
      ctx.beginPath();
      ctx.ellipse(cx + c.w * 0.3, c.y + c.h * 0.15, c.w * 0.45, c.h * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function drawBirds() {
    var t = time * 0.001;
    ctx.strokeStyle = '#546E7A';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    for (var i = 0; i < birds.length; i++) {
      var b = birds[i];
      var bx = (b.x + t * b.speed * 30) % (W + 100) - 50;
      var by = b.y + Math.sin(t * 0.8 + b.wingPhase) * 8;
      var wing = Math.sin(t * 3 + b.wingPhase) * b.size * 0.6;
      ctx.beginPath();
      ctx.moveTo(bx - b.size, by - wing);
      ctx.quadraticCurveTo(bx - b.size * 0.3, by, bx, by);
      ctx.quadraticCurveTo(bx + b.size * 0.3, by, bx + b.size, by - wing);
      ctx.stroke();
    }
  }

  function drawHills() {
    for (var l = 0; l < hillLayers.length; l++) {
      var layer = hillLayers[l];
      var pts = layer.points;
      var t = time * 0.001;
      var grad = ctx.createLinearGradient(0, H * 0.4, 0, H);
      grad.addColorStop(0, layer.color1);
      grad.addColorStop(1, layer.color2);
      ctx.fillStyle = grad;
      ctx.beginPath();
      // Gentle sway
      var offY = Math.sin(t * layer.sway * 100) * 2;
      ctx.moveTo(pts[0].x, pts[0].y + offY);
      for (var i = 1; i < pts.length; i++) {
        var prev = pts[i - 1];
        var cur = pts[i];
        var cpx = (prev.x + cur.x) / 2;
        var cpy = (prev.y + cur.y) / 2 + offY;
        ctx.quadraticCurveTo(prev.x, prev.y + offY, cpx, cpy);
      }
      ctx.lineTo(W + 20, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawDaisies() {
    var t = time * 0.001;
    for (var i = 0; i < daisies.length; i++) {
      var d = daisies[i];
      var sway = Math.sin(t * 1.2 + d.phase) * 2;

      // Stem
      ctx.strokeStyle = '#43A047';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(d.x, d.y + d.size * 2);
      ctx.quadraticCurveTo(d.x + sway, d.y + d.size, d.x + sway, d.y);
      ctx.stroke();

      // Petals
      var petalCount = 5;
      ctx.fillStyle = d.color;
      for (var p = 0; p < petalCount; p++) {
        var angle = (p / petalCount) * Math.PI * 2 + t * 0.2;
        var px = d.x + sway + Math.cos(angle) * d.size * 0.8;
        var py = d.y + Math.sin(angle) * d.size * 0.8;
        ctx.beginPath();
        ctx.arc(px, py, d.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
      // Center
      ctx.fillStyle = '#FFD93D';
      ctx.beginPath();
      ctx.arc(d.x + sway, d.y, d.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawButterflies() {
    var t = time * 0.001;
    for (var i = 0; i < butterflies.length; i++) {
      var b = butterflies[i];
      // Wander gently
      b.x += Math.sin(t * 0.5 + i * 3) * 0.5 + b.vx;
      b.y += Math.sin(t * 0.7 + i * 2) * 0.3 + b.vy;
      // Wrap
      if (b.x < -20) b.x = W + 20;
      if (b.x > W + 20) b.x = -20;
      if (b.y < H * 0.25) b.y = H * 0.25;
      if (b.y > H * 0.75) b.y = H * 0.75;

      var wing = Math.sin(t * 6 + b.wingPhase) * 0.7;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.fillStyle = b.color;
      ctx.globalAlpha = 0.8;
      // Left wing
      ctx.save();
      ctx.scale(wing, 1);
      ctx.beginPath();
      ctx.ellipse(-b.size * 0.4, -b.size * 0.2, b.size * 0.6, b.size * 0.4, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // Right wing
      ctx.save();
      ctx.scale(-wing, 1);
      ctx.beginPath();
      ctx.ellipse(-b.size * 0.4, -b.size * 0.2, b.size * 0.6, b.size * 0.4, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // Body
      ctx.fillStyle = '#5D4037';
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, 1.5, b.size * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // A few little trees on the hills
  function drawTrees() {
    var t = time * 0.001;
    var treePositions = [
      { x: W * 0.12, hill: 1 },
      { x: W * 0.28, hill: 0 },
      { x: W * 0.45, hill: 1 },
      { x: W * 0.62, hill: 0 },
      { x: W * 0.85, hill: 1 },
      { x: W * 0.95, hill: 0 }
    ];

    for (var i = 0; i < treePositions.length; i++) {
      var tp = treePositions[i];
      var layer = hillLayers[tp.hill];
      if (!layer || !layer.points.length) continue;

      // Find Y on the hill
      var closestPt = layer.points[0];
      for (var j = 1; j < layer.points.length; j++) {
        if (Math.abs(layer.points[j].x - tp.x) < Math.abs(closestPt.x - tp.x)) {
          closestPt = layer.points[j];
        }
      }
      var ty = closestPt.y - 5;
      var sway = Math.sin(t * 0.8 + i * 2) * 2;
      var treeH = 28 + (i % 3) * 10;

      // Trunk
      ctx.fillStyle = '#5D4037';
      ctx.fillRect(tp.x - 3, ty - treeH * 0.4, 6, treeH * 0.5);

      // Foliage — round blobs
      ctx.fillStyle = i % 2 === 0 ? '#2E7D32' : '#388E3C';
      ctx.beginPath();
      ctx.arc(tp.x + sway, ty - treeH * 0.55, treeH * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = i % 2 === 0 ? '#43A047' : '#4CAF50';
      ctx.beginPath();
      ctx.arc(tp.x + sway - treeH * 0.15, ty - treeH * 0.45, treeH * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(tp.x + sway + treeH * 0.18, ty - treeH * 0.48, treeH * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ==================== MAIN LOOP ====================
  var lastTime = 0;

  function loop(t) {
    if (!running) return;
    var dt = Math.min((t - lastTime) / 1000, 0.05);
    lastTime = t;
    time = t;

    // Resize check
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      W = canvas.width = canvas.clientWidth;
      H = canvas.height = canvas.clientHeight;
      generateScene();
    }

    drawSky();
    drawSun();
    drawClouds();
    drawBirds();
    drawHills();
    drawTrees();
    drawDaisies();
    drawButterflies();

    animId = requestAnimationFrame(loop);
  }

  // ==================== PUBLIC API ====================
  function init(canvasEl) {
    canvas = canvasEl;
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    W = canvas.width = canvas.clientWidth || 600;
    H = canvas.height = canvas.clientHeight || 400;
    generateScene();
  }

  function start() {
    if (!canvas || running) return;
    running = true;
    lastTime = performance.now();
    animId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    animId = null;
  }

  window.ClassmatesLandingFX = {
    init: init,
    start: start,
    stop: stop
  };
})();
