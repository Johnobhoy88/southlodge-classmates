(function(){
  // ============================================================
  // WORD FOREST — "Enchanted Highland Night"
  // A magical Caledonian forest that comes alive as you spell
  // For the kids of South Lodge Primary, Invergordon
  // ============================================================

  var canvas, ctx, animId, running = false;
  var W = 0, H = 0;
  var progress = 0, targetProgress = 0, brightness = 0.55;
  var particles = [];
  var time = 0;

  // Scene elements — generated once, drawn every frame
  var stars = [];
  var auroras = [];
  var mountains = [];
  var farTrees = [];
  var midTrees = [];
  var nearTrees = [];
  var mushrooms = [];
  var flowers = [];
  var fireflies = [];
  var mistLayers = [];
  var grassTufts = [];
  var streamPoints = [];
  var shootingStars = [];
  var nextShootingStar = 5000;

  // ==================== PARTICLE SYSTEM ====================
  function spawnParticle(x, y, c) {
    c = c || {};
    if (particles.length > 120) return;
    particles.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * (c.spread || 4),
      vy: (Math.random() - 0.5) * (c.spread || 4) - (c.rise || 1),
      life: 1, decay: c.decay || 0.02,
      size: c.size || 3 + Math.random() * 3,
      color: c.color || 'rgba(253,203,110,0.8)',
      shape: c.shape || 'circle',
      gravity: c.gravity || 0
    });
  }

  function emitBurst(x, y, count, c) {
    for (var i = 0; i < count; i++) spawnParticle(x, y, c);
  }

  function updateParticles(dt) {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;
      p.vy += p.gravity * dt * 60;
      p.life -= p.decay * dt * 60;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.globalAlpha = p.life * 0.8;
      ctx.fillStyle = p.color;
      if (p.shape === 'star') {
        drawStar5(p.x, p.y, p.size * p.life);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawStar5(cx, cy, r) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var rad = i % 2 === 0 ? r : r * 0.4;
      var a = (i * Math.PI / 5) - Math.PI / 2;
      if (i === 0) ctx.moveTo(cx + rad * Math.cos(a), cy + rad * Math.sin(a));
      else ctx.lineTo(cx + rad * Math.cos(a), cy + rad * Math.sin(a));
    }
    ctx.closePath();
    ctx.fill();
  }

  // ==================== SCENE GENERATION ====================
  function generateScene() {
    var i, j;

    // Stars — 90 twinkling points
    stars = [];
    for (i = 0; i < 90; i++) {
      stars.push({
        x: Math.random(), y: Math.random() * 0.55,
        size: 0.4 + Math.random() * 1.6,
        phase: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
        bright: 0.3 + Math.random() * 0.7
      });
    }

    // Aurora bands — 3 wavy ribbons
    auroras = [];
    var auroraColors = [
      { r: 45, g: 200, b: 130, a: 0.06 },
      { r: 80, g: 180, b: 220, a: 0.04 },
      { r: 130, g: 100, b: 200, a: 0.035 }
    ];
    for (i = 0; i < 3; i++) {
      auroras.push({
        y: 0.12 + i * 0.08,
        height: 0.06 + Math.random() * 0.04,
        color: auroraColors[i],
        waveFreq: 0.003 + i * 0.001,
        waveAmp: 15 + i * 5,
        speed: 0.0002 + i * 0.0001,
        phase: i * 2
      });
    }

    // Far mountains — jagged Highland silhouette
    mountains = [];
    var mx = 0;
    while (mx < W + 40) {
      var mh = 0.28 + Math.random() * 0.12;
      mountains.push({ x: mx, h: mh, w: 30 + Math.random() * 60 });
      mx += mountains[mountains.length - 1].w * 0.6;
    }

    // Far tree line — small conifers on the ridge
    farTrees = [];
    for (i = 0; i < 18; i++) {
      farTrees.push({
        x: Math.random() * W,
        h: 10 + Math.random() * 15,
        w: 4 + Math.random() * 4
      });
    }

    // Mid trees — proper Scots pines with character
    midTrees = [];
    for (i = 0; i < 10; i++) {
      var tx = W * 0.05 + Math.random() * W * 0.9;
      midTrees.push({
        x: tx,
        trunkH: 18 + Math.random() * 14,
        trunkW: 3 + Math.random() * 2,
        layers: 3 + Math.floor(Math.random() * 2),
        width: 12 + Math.random() * 10,
        color: ['#1a4d2e', '#1e5a34', '#245e3a', '#163d26'][Math.floor(Math.random() * 4)],
        sway: Math.random() * Math.PI * 2,
        type: Math.random() > 0.3 ? 'pine' : 'round'
      });
    }

    // Near trees — dark foreground silhouettes for depth
    nearTrees = [];
    nearTrees.push({ x: -10, w: 35, side: 'left' });
    nearTrees.push({ x: W + 10, w: 30, side: 'right' });
    if (W > 500) nearTrees.push({ x: W * 0.85, w: 20, side: 'right' });

    // Stream/burn — winding reflective water
    streamPoints = [];
    for (i = 0; i <= 12; i++) {
      streamPoints.push({
        x: W * 0.08 + (W * 0.84) * (i / 12),
        y: H * 0.78 + Math.sin(i * 0.8 + 1) * 12 + Math.cos(i * 0.5) * 6
      });
    }

    // Mushrooms — bioluminescent clusters
    mushrooms = [];
    for (i = 0; i < 7; i++) {
      var msx = W * 0.1 + (W * 0.8) * (i / 6);
      mushrooms.push({
        x: msx + (Math.random() - 0.5) * 20,
        y: H * 0.82 + Math.random() * (H * 0.06),
        size: 3 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#55efc4' : '#81ecec',
        glowPhase: Math.random() * Math.PI * 2,
        bloomAt: i / 7  // when this mushroom starts glowing (based on progress)
      });
    }

    // Flowers — bloom as child progresses
    flowers = [];
    for (i = 0; i < 10; i++) {
      var fx = W * 0.08 + (W * 0.84) * (i / 9);
      flowers.push({
        x: fx + (Math.random() - 0.5) * 15,
        y: H * 0.8 + Math.sin(i * 0.7) * 10 + 15,
        bloom: 0, // 0–1
        bloomAt: i / 10, // progress threshold
        color: ['#ff6b6b', '#fdcb6e', '#a29bfe', '#fd79a8', '#55efc4',
                '#74b9ff', '#ffeaa7', '#ff7675', '#dfe6e9', '#81ecec'][i],
        petals: 5 + Math.floor(Math.random() * 3),
        swayPhase: Math.random() * Math.PI * 2
      });
    }

    // Fireflies — magical drifting lights
    fireflies = [];
    for (i = 0; i < 22; i++) {
      fireflies.push({
        x: Math.random() * W,
        y: H * 0.25 + Math.random() * H * 0.55,
        ox: 0, oy: 0,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.6,
        size: 1.2 + Math.random() * 2,
        glow: Math.random(),
        trail: [],
        visibleAt: i / 22 // fades in based on progress
      });
    }

    // Mist layers
    mistLayers = [
      { y: 0.55, speed: 0.12, opacity: 0.06, stretch: 0.6 },
      { y: 0.68, speed: -0.08, opacity: 0.05, stretch: 0.8 },
      { y: 0.75, speed: 0.15, opacity: 0.04, stretch: 0.5 }
    ];

    // Grass tufts
    grassTufts = [];
    for (i = 0; i < 25; i++) {
      grassTufts.push({
        x: Math.random() * W,
        y: H * 0.82 + Math.random() * (H * 0.1),
        h: 3 + Math.random() * 5,
        blades: 3 + Math.floor(Math.random() * 3),
        phase: Math.random() * Math.PI * 2
      });
    }

    // Reset shooting stars
    shootingStars = [];
    nextShootingStar = 4000 + Math.random() * 8000;
  }

  // ==================== DRAW LAYERS ====================

  function drawSky() {
    var b = brightness;
    var g = ctx.createLinearGradient(0, 0, 0, H);
    // Deep Highland night: navy → dark teal → forest at horizon
    g.addColorStop(0, 'rgb(' + Math.round(8 * b) + ',' + Math.round(12 * b + 8) + ',' + Math.round(35 * b + 10) + ')');
    g.addColorStop(0.35, 'rgb(' + Math.round(12 * b) + ',' + Math.round(25 * b + 5) + ',' + Math.round(45 * b + 8) + ')');
    g.addColorStop(0.65, 'rgb(' + Math.round(15 * b) + ',' + Math.round(35 * b) + ',' + Math.round(35 * b + 5) + ')');
    g.addColorStop(1, 'rgb(' + Math.round(10 * b + 5) + ',' + Math.round(22 * b + 5) + ',' + Math.round(18 * b + 5) + ')');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawStars() {
    var b = brightness;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var twinkle = 0.3 + 0.7 * Math.sin(time * 0.001 * s.speed + s.phase);
      var alpha = twinkle * s.bright * Math.min(b * 1.5, 1);
      if (alpha < 0.05) continue;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#ffefd5';
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.size * b, 0, Math.PI * 2);
      ctx.fill();
      // Larger stars get a cross-flare
      if (s.size > 1.2 && twinkle > 0.7) {
        ctx.globalAlpha = alpha * 0.3;
        ctx.strokeStyle = '#ffefd5';
        ctx.lineWidth = 0.5;
        var sx = s.x * W, sy = s.y * H, fl = s.size * 3;
        ctx.beginPath();
        ctx.moveTo(sx - fl, sy); ctx.lineTo(sx + fl, sy);
        ctx.moveTo(sx, sy - fl); ctx.lineTo(sx, sy + fl);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawMoon() {
    var b = brightness;
    var mx = W * 0.82, my = H * 0.13, mr = Math.min(W, H) * 0.055;

    // Outer halo — grows with progress
    var haloSize = mr * (2.5 + progress * 1.5);
    var halo = ctx.createRadialGradient(mx, my, mr * 0.3, mx, my, haloSize);
    halo.addColorStop(0, 'rgba(253,235,180,' + (0.06 * b + progress * 0.04) + ')');
    halo.addColorStop(0.4, 'rgba(253,220,150,' + (0.03 * b + progress * 0.02) + ')');
    halo.addColorStop(1, 'transparent');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(mx, my, haloSize, 0, Math.PI * 2);
    ctx.fill();

    // Moon body
    ctx.globalAlpha = b * 0.9 + progress * 0.1;
    ctx.fillStyle = '#ffefd5';
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();

    // Crescent shadow
    ctx.fillStyle = 'rgba(8,12,35,' + (0.7 - progress * 0.15) + ')';
    ctx.beginPath();
    ctx.arc(mx + mr * 0.35, my - mr * 0.1, mr * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // Subtle craters on visible part
    ctx.globalAlpha = 0.08 * b;
    ctx.fillStyle = '#d4c5a0';
    ctx.beginPath(); ctx.arc(mx - mr * 0.25, my + mr * 0.1, mr * 0.12, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(mx - mr * 0.1, my - mr * 0.25, mr * 0.08, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawAurora() {
    if (progress < 0.15) return; // Aurora appears as child progresses
    var intensity = Math.max(0, (progress - 0.15) / 0.85);
    var b = brightness;

    for (var a = 0; a < auroras.length; a++) {
      var au = auroras[a];
      var c = au.color;
      var alpha = c.a * intensity * b * (0.7 + 0.3 * Math.sin(time * 0.0005 + au.phase));
      if (alpha < 0.005) continue;

      ctx.beginPath();
      ctx.moveTo(0, H * au.y);
      for (var x = 0; x <= W; x += 6) {
        var wave = Math.sin(x * au.waveFreq + time * au.speed + au.phase) * au.waveAmp;
        var wave2 = Math.sin(x * au.waveFreq * 1.7 + time * au.speed * 0.6) * au.waveAmp * 0.4;
        ctx.lineTo(x, H * au.y + wave + wave2);
      }
      // Close bottom
      for (var x2 = W; x2 >= 0; x2 -= 6) {
        var wave3 = Math.sin(x2 * au.waveFreq + time * au.speed + au.phase) * au.waveAmp * 0.5;
        ctx.lineTo(x2, H * (au.y + au.height) + wave3);
      }
      ctx.closePath();

      ctx.fillStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + alpha + ')';
      ctx.fill();
    }
  }

  function drawShootingStars(dt) {
    nextShootingStar -= dt * 1000;
    if (nextShootingStar <= 0 && progress > 0.3) {
      shootingStars.push({
        x: Math.random() * W * 0.7,
        y: Math.random() * H * 0.3,
        vx: 3 + Math.random() * 4,
        vy: 1.5 + Math.random() * 2,
        life: 1, len: 30 + Math.random() * 40
      });
      nextShootingStar = 6000 + Math.random() * 12000;
    }

    for (var i = shootingStars.length - 1; i >= 0; i--) {
      var s = shootingStars[i];
      s.x += s.vx * dt * 60;
      s.y += s.vy * dt * 60;
      s.life -= 0.015 * dt * 60;
      if (s.life <= 0) { shootingStars.splice(i, 1); continue; }

      ctx.globalAlpha = s.life * 0.7;
      var g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * s.len * 0.3, s.y - s.vy * s.len * 0.3);
      g.addColorStop(0, '#fffbe6');
      g.addColorStop(1, 'transparent');
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * s.len * 0.3, s.y - s.vy * s.len * 0.3);
      ctx.stroke();

      // Bright head
      ctx.fillStyle = '#fffbe6';
      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawMountains() {
    var b = brightness;
    ctx.fillStyle = 'rgb(' + Math.round(12 * b) + ',' + Math.round(18 * b + 5) + ',' + Math.round(22 * b + 5) + ')';
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (var i = 0; i < mountains.length; i++) {
      var m = mountains[i];
      ctx.lineTo(m.x, H * (1 - m.h));
      ctx.lineTo(m.x + m.w * 0.5, H * (1 - m.h + 0.03));
    }
    ctx.lineTo(W, H * 0.65);
    ctx.lineTo(W, H);
    ctx.closePath();
    ctx.fill();

    // Snow caps — subtle on peaks
    ctx.fillStyle = 'rgba(220,230,240,' + (0.12 * b) + ')';
    for (var j = 0; j < mountains.length; j++) {
      var m2 = mountains[j];
      if (m2.h > 0.32) {
        ctx.beginPath();
        ctx.moveTo(m2.x - 3, H * (1 - m2.h) + 6);
        ctx.lineTo(m2.x, H * (1 - m2.h));
        ctx.lineTo(m2.x + 8, H * (1 - m2.h) + 8);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  function drawFarTreeLine() {
    var b = brightness;
    ctx.fillStyle = 'rgb(' + Math.round(10 * b + 3) + ',' + Math.round(20 * b + 5) + ',' + Math.round(15 * b + 3) + ')';
    for (var i = 0; i < farTrees.length; i++) {
      var t = farTrees[i];
      var baseY = H * 0.58 + Math.sin(t.x * 0.008) * 12;
      // Simple pine silhouette
      ctx.beginPath();
      ctx.moveTo(t.x, baseY);
      ctx.lineTo(t.x - t.w, baseY);
      ctx.lineTo(t.x - t.w * 0.15, baseY - t.h);
      ctx.lineTo(t.x + t.w * 0.15, baseY - t.h);
      ctx.lineTo(t.x + t.w, baseY);
      ctx.closePath();
      ctx.fill();
    }
  }

  function hillY(x, baseY, freq, amp) {
    return H * baseY + Math.sin(x * freq + time * 0.0002) * amp + Math.sin(x * freq * 2.3 + 1.5) * amp * 0.3;
  }

  function drawHills() {
    var b = brightness;
    var layers = [
      { y: 0.62, freq: 0.006, amp: 25, r: 18, g: 40, gb: 28 },
      { y: 0.72, freq: 0.009, amp: 18, r: 14, g: 32, gb: 22 },
      { y: 0.82, freq: 0.012, amp: 12, r: 10, g: 24, gb: 16 }
    ];

    for (var i = 0; i < layers.length; i++) {
      var l = layers[i];
      ctx.fillStyle = 'rgb(' + Math.round(l.r * b + 5) + ',' + Math.round(l.g * b + 5) + ',' + Math.round(l.gb * b + 5) + ')';
      ctx.beginPath();
      ctx.moveTo(0, H);
      for (var x = 0; x <= W; x += 3) {
        ctx.lineTo(x, hillY(x, l.y, l.freq, l.amp));
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawMidTrees() {
    var b = brightness;
    for (var i = 0; i < midTrees.length; i++) {
      var t = midTrees[i];
      var baseY = hillY(t.x, 0.72, 0.009, 18);
      var sway = Math.sin(time * 0.0008 + t.sway) * 1.5;

      // Trunk
      ctx.fillStyle = 'rgb(' + Math.round(45 * b + 10) + ',' + Math.round(32 * b + 8) + ',' + Math.round(22 * b + 5) + ')';
      var tw = t.trunkW;
      ctx.fillRect(t.x - tw / 2, baseY - t.trunkH, tw, t.trunkH);

      // Canopy
      ctx.fillStyle = t.color;
      ctx.globalAlpha = Math.min(b * 1.3, 1);

      if (t.type === 'pine') {
        // Scots pine — layered triangles with character
        for (var j = 0; j < t.layers; j++) {
          var layerY = baseY - t.trunkH + j * -t.width * 0.55;
          var layerW = t.width * (1 - j * 0.15);
          var layerH = t.width * 0.75;
          ctx.beginPath();
          ctx.moveTo(t.x + sway * (j + 1) * 0.3, layerY - layerH);
          ctx.lineTo(t.x - layerW / 2, layerY);
          ctx.lineTo(t.x + layerW / 2, layerY);
          ctx.closePath();
          ctx.fill();
        }
      } else {
        // Round oak/birch style
        var cy = baseY - t.trunkH - t.width * 0.4;
        ctx.beginPath();
        ctx.ellipse(t.x + sway, cy, t.width * 0.55, t.width * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Darker center for depth
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(t.x + sway + 2, cy + 2, t.width * 0.35, t.width * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  function drawStream() {
    if (streamPoints.length < 2) return;
    var b = brightness;
    var shimmer = 0.5 + 0.5 * Math.sin(time * 0.002);

    // Water body
    ctx.strokeStyle = 'rgba(100,180,220,' + (0.12 * b + progress * 0.06) + ')';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(streamPoints[0].x, streamPoints[0].y);
    for (var i = 1; i < streamPoints.length; i++) {
      var p = streamPoints[i];
      var pp = streamPoints[i - 1];
      var cpx = (pp.x + p.x) / 2;
      var cpy = (pp.y + p.y) / 2;
      ctx.quadraticCurveTo(pp.x, pp.y + Math.sin(time * 0.003 + i) * 1.5, cpx, cpy);
    }
    ctx.stroke();

    // Highlight shimmer on water
    if (progress > 0.25) {
      ctx.strokeStyle = 'rgba(180,230,255,' + (0.06 * shimmer * progress) + ')';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(streamPoints[0].x, streamPoints[0].y - 1);
      for (var j = 1; j < streamPoints.length; j++) {
        var p2 = streamPoints[j];
        var pp2 = streamPoints[j - 1];
        ctx.quadraticCurveTo(pp2.x, pp2.y - 1 + Math.sin(time * 0.003 + j) * 1.5, (pp2.x + p2.x) / 2, (pp2.y + p2.y) / 2 - 1);
      }
      ctx.stroke();
    }
  }

  function drawMist() {
    var b = brightness;
    for (var i = 0; i < mistLayers.length; i++) {
      var m = mistLayers[i];
      var ox = (time * m.speed) % (W * 2) - W * 0.5;
      ctx.globalAlpha = m.opacity * b * (0.7 + progress * 0.3);
      ctx.fillStyle = 'rgba(180,200,190,' + (m.opacity * b) + ')';

      // Two overlapping fog ellipses for natural look
      ctx.beginPath();
      ctx.ellipse(ox, H * m.y, W * m.stretch, H * 0.04, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(ox + W * 0.6, H * m.y + 8, W * m.stretch * 0.7, H * 0.03, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawGrass() {
    var b = brightness;
    ctx.strokeStyle = 'rgba(' + Math.round(40 * b + 15) + ',' + Math.round(70 * b + 15) + ',' + Math.round(35 * b + 10) + ',' + (0.5 * b) + ')';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';

    for (var i = 0; i < grassTufts.length; i++) {
      var g = grassTufts[i];
      var windSway = Math.sin(time * 0.0015 + g.phase) * 2;
      for (var j = 0; j < g.blades; j++) {
        var angle = -Math.PI / 2 + (j - g.blades / 2) * 0.3 + windSway * 0.05;
        var len = g.h * (0.7 + Math.random() * 0.3);
        ctx.beginPath();
        ctx.moveTo(g.x + j * 2, g.y);
        ctx.quadraticCurveTo(
          g.x + j * 2 + windSway,
          g.y - len * 0.6,
          g.x + j * 2 + windSway * 1.5 + Math.cos(angle) * 2,
          g.y - len
        );
        ctx.stroke();
      }
    }
  }

  function drawMushrooms() {
    var b = brightness;
    for (var i = 0; i < mushrooms.length; i++) {
      var m = mushrooms[i];
      var glowAmount = progress > m.bloomAt ? Math.min((progress - m.bloomAt) * 4, 1) : 0;
      var pulse = 0.7 + 0.3 * Math.sin(time * 0.002 + m.glowPhase);

      // Stem
      ctx.fillStyle = 'rgba(180,170,150,' + (0.3 * b) + ')';
      ctx.fillRect(m.x - 1, m.y - m.size * 1.5, 2.5, m.size * 1.5);

      // Cap
      ctx.fillStyle = m.color;
      ctx.globalAlpha = (0.2 + glowAmount * 0.6) * b * pulse;
      ctx.beginPath();
      ctx.ellipse(m.x, m.y - m.size * 1.5, m.size * 1.2, m.size * 0.7, 0, Math.PI, Math.PI * 2);
      ctx.fill();

      // Glow aura when lit
      if (glowAmount > 0.1) {
        ctx.globalAlpha = glowAmount * 0.15 * b * pulse;
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.arc(m.x, m.y - m.size, m.size * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawFlowers() {
    var b = brightness;
    for (var i = 0; i < flowers.length; i++) {
      var f = flowers[i];
      // Update bloom based on progress
      if (progress > f.bloomAt) {
        f.bloom = Math.min(f.bloom + 0.01, 1);
      }

      if (f.bloom < 0.05) {
        // Tiny bud
        ctx.fillStyle = 'rgba(80,90,70,' + (0.35 * b) + ')';
        ctx.beginPath();
        ctx.arc(f.x, f.y, 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }

      var r = 2.5 + f.bloom * 5;
      var sway = Math.sin(time * 0.0018 + f.swayPhase) * 1.5 * f.bloom;

      // Stem
      ctx.strokeStyle = 'rgba(60,100,50,' + (0.4 * b) + ')';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(f.x, f.y + 4);
      ctx.quadraticCurveTo(f.x + sway * 0.5, f.y + 2, f.x + sway, f.y - r * 0.3);
      ctx.stroke();

      // Petals
      ctx.globalAlpha = f.bloom * b;
      for (var p = 0; p < f.petals; p++) {
        var angle = (p / f.petals) * Math.PI * 2 + Math.sin(time * 0.001 + i) * 0.1;
        var px = f.x + sway + Math.cos(angle) * r * 0.55;
        var py = f.y + Math.sin(angle) * r * 0.55;
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.ellipse(px, py, r * 0.35, r * 0.2, angle, 0, Math.PI * 2);
        ctx.fill();
      }

      // Center
      ctx.fillStyle = '#fdcb6e';
      ctx.beginPath();
      ctx.arc(f.x + sway, f.y, r * 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function drawFireflies() {
    var b = brightness;
    for (var i = 0; i < fireflies.length; i++) {
      var f = fireflies[i];
      // Only show based on progress
      var visibility = progress > f.visibleAt ? Math.min((progress - f.visibleAt) * 5, 1) : 0.12;

      f.x += Math.sin(time * 0.0008 * f.speed + f.phase) * 0.4;
      f.y += Math.cos(time * 0.0006 * f.speed + f.phase * 1.3) * 0.3;
      f.glow = 0.2 + 0.8 * Math.pow(Math.sin(time * 0.0025 + f.phase), 2);

      // Keep in bounds
      if (f.x < 0) f.x = W;
      if (f.x > W) f.x = 0;
      if (f.y < H * 0.15) f.y = H * 0.15;
      if (f.y > H * 0.85) f.y = H * 0.85;

      // Trail
      f.trail.push({ x: f.x, y: f.y });
      if (f.trail.length > 6) f.trail.shift();

      // Draw trail
      var alpha = f.glow * visibility * b;
      if (alpha < 0.03) continue;

      for (var t = 0; t < f.trail.length - 1; t++) {
        var tp = f.trail[t];
        ctx.globalAlpha = (t / f.trail.length) * alpha * 0.2;
        ctx.fillStyle = '#fdeb96';
        ctx.beginPath();
        ctx.arc(tp.x, tp.y, f.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main glow
      ctx.globalAlpha = alpha * 0.6;
      ctx.fillStyle = '#fdeb96';
      ctx.shadowColor = '#fdeb96';
      ctx.shadowBlur = f.size * 6 * f.glow;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
      ctx.fill();

      // Core bright point
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = f.size * 3;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  function drawNearTrees() {
    var b = brightness;
    ctx.fillStyle = 'rgb(' + Math.round(5 * b + 2) + ',' + Math.round(10 * b + 3) + ',' + Math.round(8 * b + 2) + ')';

    for (var i = 0; i < nearTrees.length; i++) {
      var t = nearTrees[i];
      var baseY = H * 0.55;
      var topY = H * 0.08;
      if (t.side === 'left') {
        ctx.beginPath();
        ctx.moveTo(t.x - t.w, H);
        ctx.lineTo(t.x - t.w, baseY);
        ctx.lineTo(t.x - t.w * 0.1, topY);
        ctx.lineTo(t.x + t.w * 0.5, baseY * 0.7);
        ctx.lineTo(t.x + t.w * 0.8, H);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(t.x + t.w, H);
        ctx.lineTo(t.x + t.w, baseY);
        ctx.lineTo(t.x + t.w * 0.1, topY);
        ctx.lineTo(t.x - t.w * 0.5, baseY * 0.7);
        ctx.lineTo(t.x - t.w * 0.8, H);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // ==================== SOUND ENGINE ====================
  var audioCtx = null;

  function getAudio() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    return audioCtx;
  }

  function playNote(freq, duration, type, volume, delay) {
    var ac = getAudio();
    if (!ac) return;
    var t = ac.currentTime + (delay || 0);
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume || 0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration);
  }

  // Pentatonic scale — sounds magical, can't go wrong
  var SCALE = [262, 294, 330, 392, 440, 523, 587, 659, 784, 880, 1047, 1175, 1319, 1568, 1760];

  function sfxLetterReveal(noteIndex) {
    var freq = SCALE[Math.min(noteIndex, SCALE.length - 1)];
    playNote(freq, 0.25, 'sine', 0.1);
    playNote(freq * 1.5, 0.18, 'sine', 0.05, 0.04);
    // Soft chime shimmer
    playNote(freq * 2, 0.12, 'sine', 0.02, 0.08);
  }

  function sfxKeyTick() {
    var ac = getAudio();
    if (!ac) return;
    var t = ac.currentTime;
    var buf = ac.createBuffer(1, ac.sampleRate * 0.015, ac.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.02;
    var src = ac.createBufferSource();
    src.buffer = buf;
    var filter = ac.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3500;
    src.connect(filter);
    filter.connect(ac.destination);
    src.start(t);
  }

  function sfxWordComplete() {
    // Magical forest chime: pentatonic arpeggio
    var notes = [523, 659, 784, 1047, 1319];
    for (var i = 0; i < notes.length; i++) {
      playNote(notes[i], 0.45 - i * 0.04, 'sine', 0.08, i * 0.09);
      playNote(notes[i] * 0.5, 0.5, 'triangle', 0.03, i * 0.09);
    }
  }

  function sfxGentleWrong() {
    playNote(280, 0.2, 'sine', 0.06);
    playNote(230, 0.25, 'sine', 0.04, 0.07);
  }

  function sfxNearMiss() {
    playNote(392, 0.22, 'triangle', 0.06);
    playNote(349, 0.25, 'triangle', 0.05, 0.08);
    playNote(330, 0.3, 'triangle', 0.03, 0.16);
  }

  function sfxGameComplete() {
    // Full forest celebration — two waves
    var wave1 = [523, 659, 784, 1047];
    for (var i = 0; i < wave1.length; i++) {
      playNote(wave1[i], 0.5, 'sine', 0.1, i * 0.1);
      playNote(wave1[i] * 0.5, 0.6, 'triangle', 0.04, i * 0.1);
    }
    // Descending sparkle
    setTimeout(function() {
      playNote(1319, 0.3, 'sine', 0.08);
      playNote(1047, 0.3, 'sine', 0.07, 0.1);
      playNote(784, 0.4, 'sine', 0.06, 0.2);
      playNote(1568, 0.5, 'sine', 0.05, 0.3);
    }, 500);
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

    // Smooth progress and brightness
    progress += (targetProgress - progress) * 0.03;
    var targetBright = 0.55 + progress * 0.45;
    brightness += (targetBright - brightness) * 0.02;

    // Draw all layers back-to-front
    drawSky();
    drawStars();
    drawMoon();
    drawAurora();
    drawShootingStars(dt);
    drawMountains();
    drawFarTreeLine();
    drawMist();
    drawHills();
    drawMidTrees();
    drawStream();
    drawGrass();
    drawMushrooms();
    drawFlowers();
    drawFireflies();
    drawNearTrees();

    // Particles on top of everything
    updateParticles(dt);
    drawParticles();

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
    targetProgress = 0;
    progress = 0;
    brightness = 0.55;
    particles = [];
    shootingStars = [];
    nextShootingStar = 4000 + Math.random() * 8000;
    lastTime = performance.now();
    animId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    animId = null;
  }

  function onCorrectLetter(slotIndex, totalRevealed) {
    if (!canvas) return;
    var slotX = W * 0.2 + (W * 0.6) * (slotIndex / 12);
    var slotY = H * 0.45;
    // Gold sparkle burst
    emitBurst(slotX, slotY, 8, {
      spread: 5, rise: 2, decay: 0.025, size: 3,
      color: 'rgba(253,203,110,0.9)', shape: 'star'
    });
    // A few green forest sparks
    emitBurst(slotX, slotY, 4, {
      spread: 3, rise: 1.5, decay: 0.03, size: 2,
      color: 'rgba(85,239,196,0.7)'
    });
    sfxLetterReveal(totalRevealed || slotIndex);
    sfxKeyTick();
  }

  function onWrongLetter(livesLeft) {
    if (!canvas) return;
    // Soft falling embers
    emitBurst(W * 0.5, H * 0.4, 6, {
      spread: 3, rise: -0.5, gravity: 0.04, decay: 0.012, size: 2,
      color: 'rgba(220,80,60,0.5)'
    });
    sfxGentleWrong();
  }

  function onWordComplete(progressPct) {
    targetProgress = progressPct;
    if (!canvas) return;

    // Big celebration burst — green and gold
    emitBurst(W * 0.5, H * 0.4, 18, {
      spread: 8, rise: 3, decay: 0.012, size: 4,
      color: 'rgba(85,239,196,0.8)', shape: 'star'
    });
    emitBurst(W * 0.5, H * 0.4, 10, {
      spread: 6, rise: 2, decay: 0.015, size: 3,
      color: 'rgba(253,203,110,0.8)', shape: 'star'
    });
    sfxWordComplete();
  }

  function onWordFailed(wasClose) {
    if (!canvas) return;
    // Gentle grey motes drift down
    emitBurst(W * 0.5, H * 0.25, 6, {
      spread: 5, rise: -1.5, gravity: 0.06, decay: 0.01, size: 2,
      color: 'rgba(178,190,195,0.4)'
    });
    if (wasClose) sfxNearMiss();
    else sfxGentleWrong();
  }

  function onGameComplete(correct, total) {
    if (!canvas) return;
    targetProgress = 1;
    progress = 1;
    brightness = 1;

    // All flowers bloom instantly
    for (var i = 0; i < flowers.length; i++) flowers[i].bloom = 1;

    // Rainbow celebration burst
    var colors = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#55efc4'];
    for (var j = 0; j < 50; j++) {
      emitBurst(W * (0.3 + Math.random() * 0.4), H * (0.3 + Math.random() * 0.2), 1, {
        spread: 10, rise: 3 + Math.random() * 3, decay: 0.008, size: 3 + Math.random() * 4,
        color: colors[j % colors.length], shape: 'star'
      });
    }

    sfxGameComplete();
  }

  window.ClassmatesSpellingFX = {
    init: init,
    start: start,
    stop: stop,
    onCorrectLetter: onCorrectLetter,
    onWrongLetter: onWrongLetter,
    onWordComplete: onWordComplete,
    onWordFailed: onWordFailed,
    onGameComplete: onGameComplete
  };
})();
