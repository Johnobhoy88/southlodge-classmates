(function(){
  // ============================================================
  // MISSING VOWELS — "Sunken Library"
  // An ancient library at the bottom of the sea. Fish swim between
  // bookshelves, bubbles rise toward distant light, vowel letters
  // drift free from waterlogged books. The ocean is alive.
  // For the kids of South Lodge Primary, Invergordon
  // ============================================================

  var canvas, ctx, animId, running = false;
  var W = 0, H = 0;
  var progress = 0, targetProgress = 0, brightness = 0.5;
  var particles = [];
  var time = 0;

  // Scene elements
  var bubbles = [];
  var fish = [];
  var seaweed = [];
  var shelves = [];
  var floatingVowels = [];
  var caustics = [];
  var sandParticles = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

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
      color: c.color || 'rgba(100,200,255,0.8)',
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
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ==================== SCENE GENERATION ====================
  function generateScene() {
    if (!W || !H) return;

    // Bubbles — 25 at various sizes
    bubbles = [];
    for (var i = 0; i < 25; i++) {
      bubbles.push({
        x: rand(W * 0.05, W * 0.95),
        y: rand(0, H),
        size: rand(2, 8),
        speed: rand(0.3, 0.8),
        wobblePhase: rand(0, Math.PI * 2),
        wobbleAmp: rand(0.5, 2),
        wobbleSpeed: rand(1, 3),
        highlightAngle: rand(0, Math.PI * 2)
      });
    }

    // Fish — 10 tropical fish
    var fishColors = [
      { body: '#ff6b35', fin: '#ff9a5c', name: 'clownfish' },     // orange
      { body: '#4ecdc4', fin: '#2ab7ca', name: 'tang' },           // teal
      { body: '#ffe66d', fin: '#f7d734', name: 'butterfly' },      // yellow
      { body: '#ff6b9d', fin: '#ff8eb5', name: 'pink' },           // pink
      { body: '#95e1d3', fin: '#78d1c0', name: 'mint' },           // mint
      { body: '#a29bfe', fin: '#7c73e6', name: 'purple' },         // purple
      { body: '#fd7e14', fin: '#fca311', name: 'goldfish' },       // gold
      { body: '#56ccf2', fin: '#2d9cdb', name: 'blue' }            // blue
    ];
    fish = [];
    for (var i = 0; i < 10; i++) {
      var fc = fishColors[i % fishColors.length];
      fish.push({
        x: rand(-W * 0.2, W * 1.2),
        y: rand(H * 0.15, H * 0.7),
        size: rand(8, 18),
        speed: rand(0.3, 1.0) * (Math.random() > 0.5 ? 1 : -1),
        bodyColor: fc.body,
        finColor: fc.fin,
        swimPhase: rand(0, Math.PI * 2),
        swimSpeed: rand(2, 4),
        yDrift: rand(-0.15, 0.15),
        minProgress: i < 5 ? 0 : (i < 8 ? 0.25 : 0.5)
      });
    }

    // Seaweed — 8 strands from the ocean floor
    var seaweedColors = ['#2ecc71', '#27ae60', '#1abc9c', '#16a085', '#3d9970', '#2ecc71', '#1dd1a1', '#10ac84'];
    seaweed = [];
    for (var i = 0; i < 8; i++) {
      var segments = Math.floor(rand(5, 9));
      var segArr = [];
      for (var s = 0; s < segments; s++) {
        segArr.push({ len: rand(12, 22), width: rand(3, 7) * (1 - s / segments * 0.6) });
      }
      seaweed.push({
        x: rand(W * 0.05, W * 0.95),
        baseY: H - rand(0, 10),
        segments: segArr,
        color: seaweedColors[i % seaweedColors.length],
        swayPhase: rand(0, Math.PI * 2),
        swaySpeed: rand(0.5, 1.2),
        swayAmp: rand(0.08, 0.2)
      });
    }

    // Bookshelf silhouettes — 2 tall shelves on sides
    shelves = [
      { x: W * 0.02, y: H * 0.2, w: W * 0.12, h: H * 0.65, books: [] },
      { x: W * 0.86, y: H * 0.15, w: W * 0.12, h: H * 0.7, books: [] }
    ];
    for (var s = 0; s < shelves.length; s++) {
      var sh = shelves[s];
      var shelfCount = Math.floor(sh.h / 35);
      for (var r = 0; r < shelfCount; r++) {
        var booksInRow = Math.floor(rand(3, 7));
        for (var b = 0; b < booksInRow; b++) {
          sh.books.push({
            rx: b * (sh.w / booksInRow) + rand(0, 3),
            ry: r * 35 + rand(0, 5),
            w: rand(4, 10),
            h: rand(22, 32),
            tilt: rand(-0.1, 0.1),
            glows: Math.random() > 0.7,
            glowColor: ['rgba(255,200,100,','rgba(100,220,255,','rgba(255,150,200,'][Math.floor(rand(0, 3))]
          });
        }
      }
    }

    // Floating vowel letters
    floatingVowels = [];
    var vowels = 'AEIOUAEIOU';
    for (var i = 0; i < 10; i++) {
      floatingVowels.push({
        x: rand(W * 0.15, W * 0.85),
        y: rand(H * 0.1, H * 0.8),
        char: vowels[i],
        size: rand(24, 50),
        speed: rand(0.05, 0.15),
        drift: rand(-0.1, 0.1),
        rotation: rand(-0.2, 0.2),
        rotSpeed: rand(-0.002, 0.002),
        opacity: rand(0.03, 0.07)
      });
    }

    // Caustic light nodes — for the ripple pattern
    caustics = [];
    for (var i = 0; i < 12; i++) {
      caustics.push({
        x: rand(W * 0.1, W * 0.9),
        y: rand(H * 0.75, H * 0.95),
        size: rand(15, 40),
        phase: rand(0, Math.PI * 2),
        speed: rand(0.5, 1.5),
        driftX: rand(-0.2, 0.2)
      });
    }

    // Sand particles on ocean floor
    sandParticles = [];
    for (var i = 0; i < 15; i++) {
      sandParticles.push({
        x: rand(0, W), y: H - rand(5, 30),
        size: rand(0.5, 1.5),
        drift: rand(-0.05, 0.05),
        opacity: rand(0.04, 0.1)
      });
    }
  }

  // ==================== DRAWING LAYERS ====================

  // Layer 1: Ocean gradient + light rays from above
  function drawOcean() {
    var b = brightness;
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'hsl(195,' + Math.round(45 + progress * 15) + '%,' + Math.round(18 * b) + '%)');
    grad.addColorStop(0.3, 'hsl(200,' + Math.round(50 + progress * 10) + '%,' + Math.round(14 * b) + '%)');
    grad.addColorStop(0.7, 'hsl(210,' + Math.round(55 + progress * 10) + '%,' + Math.round(10 * b) + '%)');
    grad.addColorStop(1, 'hsl(220,' + Math.round(50) + '%,' + Math.round(8 * b) + '%)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Light rays from surface — 4-5 diagonal beams
    var t = time * 0.001;
    var rayAlpha = 0.03 + progress * 0.04;
    for (var i = 0; i < 5; i++) {
      var rx = W * (0.15 + i * 0.18) + Math.sin(t * 0.3 + i * 2) * 20;
      var rw = 20 + Math.sin(t * 0.5 + i) * 8;
      ctx.globalAlpha = rayAlpha * (0.5 + Math.sin(t * 0.4 + i * 1.5) * 0.3);
      var rg = ctx.createLinearGradient(rx, 0, rx + rw * 2, H * 0.8);
      rg.addColorStop(0, 'rgba(180,230,255,0.15)');
      rg.addColorStop(0.5, 'rgba(180,230,255,0.05)');
      rg.addColorStop(1, 'rgba(180,230,255,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.moveTo(rx, 0);
      ctx.lineTo(rx + rw, 0);
      ctx.lineTo(rx + rw * 3, H * 0.8);
      ctx.lineTo(rx + rw * 1.5, H * 0.8);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Layer 2: Sandy ocean floor
  function drawOceanFloor() {
    var floorY = H * 0.88;
    var fg = ctx.createLinearGradient(0, floorY, 0, H);
    fg.addColorStop(0, 'rgba(194,178,128,' + (0.08 + progress * 0.06) + ')');
    fg.addColorStop(0.5, 'rgba(160,140,100,' + (0.12 + progress * 0.06) + ')');
    fg.addColorStop(1, 'rgba(120,100,70,' + (0.15 + progress * 0.05) + ')');
    ctx.fillStyle = fg;

    // Gentle undulating floor
    var t = time * 0.001;
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (var x = 0; x <= W; x += 8) {
      var y = floorY + Math.sin(x * 0.01 + t * 0.3) * 4 + Math.sin(x * 0.025) * 3;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.fill();

    // Sand particles
    for (var i = 0; i < sandParticles.length; i++) {
      var sp = sandParticles[i];
      sp.x += sp.drift;
      if (sp.x < 0) sp.x = W;
      if (sp.x > W) sp.x = 0;
      ctx.globalAlpha = sp.opacity * brightness;
      ctx.fillStyle = '#d4c5a0';
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Layer 3: Bookshelves
  function drawShelves() {
    var t = time * 0.001;
    for (var s = 0; s < shelves.length; s++) {
      var sh = shelves[s];
      // Shelf frame
      ctx.globalAlpha = 0.3 * brightness;
      ctx.fillStyle = 'hsl(25,30%,' + Math.round(12 * brightness) + '%)';
      ctx.fillRect(sh.x, sh.y, sh.w, sh.h);

      // Shelf planks
      ctx.strokeStyle = 'rgba(80,60,40,' + (0.2 * brightness) + ')';
      ctx.lineWidth = 1;
      var shelfSpacing = 35;
      for (var r = 0; r < Math.floor(sh.h / shelfSpacing); r++) {
        var py = sh.y + r * shelfSpacing;
        ctx.beginPath();
        ctx.moveTo(sh.x, py);
        ctx.lineTo(sh.x + sh.w, py);
        ctx.stroke();
      }

      // Books
      for (var b = 0; b < sh.books.length; b++) {
        var bk = sh.books[b];
        ctx.save();
        ctx.translate(sh.x + bk.rx + bk.w * 0.5, sh.y + bk.ry + bk.h * 0.5);
        ctx.rotate(bk.tilt);

        // Book body
        ctx.globalAlpha = 0.35 * brightness;
        ctx.fillStyle = 'hsl(' + Math.round(bk.rx * 3 + bk.ry) + ',25%,' + Math.round(20 * brightness) + '%)';
        ctx.fillRect(-bk.w * 0.5, -bk.h * 0.5, bk.w, bk.h);

        // Glowing books
        if (bk.glows) {
          var glowInt = 0.1 + progress * 0.2 + Math.sin(t * 1.5 + b) * 0.05;
          ctx.globalAlpha = glowInt;
          var bg = ctx.createRadialGradient(0, 0, 0, 0, 0, bk.h * 0.8);
          bg.addColorStop(0, bk.glowColor + '0.3)');
          bg.addColorStop(1, bk.glowColor + '0)');
          ctx.fillStyle = bg;
          ctx.beginPath();
          ctx.arc(0, 0, bk.h * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }
    ctx.globalAlpha = 1;
  }

  // Layer 4: Seaweed
  function drawSeaweed() {
    var t = time * 0.001;
    for (var i = 0; i < seaweed.length; i++) {
      var sw = seaweed[i];
      var growthFactor = 0.5 + progress * 0.5; // grows taller with progress
      ctx.strokeStyle = sw.color;
      ctx.lineCap = 'round';

      var cx = sw.x, cy = sw.baseY;
      for (var s = 0; s < sw.segments.length; s++) {
        var seg = sw.segments[s];
        var sway = Math.sin(t * sw.swaySpeed + sw.swayPhase + s * 0.4) * sw.swayAmp * (s + 1);
        var nx = cx + sway * seg.len;
        var ny = cy - seg.len * growthFactor;

        ctx.globalAlpha = (0.4 + progress * 0.3) * brightness;
        ctx.lineWidth = seg.width;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.quadraticCurveTo(cx + sway * seg.len * 0.5, (cy + ny) * 0.5, nx, ny);
        ctx.stroke();

        cx = nx;
        cy = ny;
      }

      // Leaf tip — small filled ellipse
      ctx.globalAlpha = (0.3 + progress * 0.25) * brightness;
      ctx.fillStyle = sw.color;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 3, 6, Math.sin(t * sw.swaySpeed + sw.swayPhase) * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Layer 5: Fish
  function drawFish() {
    var t = time * 0.001;
    for (var i = 0; i < fish.length; i++) {
      var f = fish[i];
      if (progress < f.minProgress) continue;

      // Movement
      f.x += f.speed * 0.5;
      f.y += f.yDrift + Math.sin(t * 0.5 + f.swimPhase) * 0.2;
      var tailWag = Math.sin(t * f.swimSpeed + f.swimPhase) * 0.3;

      // Wrap
      if (f.speed > 0 && f.x > W + f.size * 3) f.x = -f.size * 3;
      if (f.speed < 0 && f.x < -f.size * 3) f.x = W + f.size * 3;
      if (f.y < H * 0.1) f.y = H * 0.1;
      if (f.y > H * 0.75) f.y = H * 0.75;

      var dir = f.speed > 0 ? 1 : -1;
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.scale(dir, 1);

      ctx.globalAlpha = (0.6 + progress * 0.3) * brightness;

      // Tail
      ctx.fillStyle = f.finColor;
      ctx.beginPath();
      ctx.moveTo(-f.size * 0.8, 0);
      ctx.lineTo(-f.size * 1.4, -f.size * 0.5 + tailWag * f.size);
      ctx.lineTo(-f.size * 1.4, f.size * 0.5 + tailWag * f.size);
      ctx.closePath();
      ctx.fill();

      // Body
      ctx.fillStyle = f.bodyColor;
      ctx.beginPath();
      ctx.ellipse(0, 0, f.size, f.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dorsal fin
      ctx.fillStyle = f.finColor;
      ctx.beginPath();
      ctx.moveTo(-f.size * 0.2, -f.size * 0.45);
      ctx.quadraticCurveTo(f.size * 0.1, -f.size * 0.9, f.size * 0.3, -f.size * 0.45);
      ctx.fill();

      // Eye
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(f.size * 0.5, -f.size * 0.1, f.size * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1a2e';
      ctx.beginPath();
      ctx.arc(f.size * 0.55, -f.size * 0.1, f.size * 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Belly highlight
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(f.size * 0.1, f.size * 0.1, f.size * 0.6, f.size * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // Layer 6: Bubbles
  function drawBubbles() {
    var t = time * 0.001;
    for (var i = 0; i < bubbles.length; i++) {
      var b = bubbles[i];
      b.y -= b.speed * 0.4;
      b.x += Math.sin(t * b.wobbleSpeed + b.wobblePhase) * b.wobbleAmp * 0.3;

      // Wrap
      if (b.y < -b.size * 3) {
        b.y = H + b.size * 2;
        b.x = rand(W * 0.05, W * 0.95);
      }

      ctx.globalAlpha = (0.15 + progress * 0.15) * brightness;
      // Bubble outline
      ctx.strokeStyle = 'rgba(180,230,255,0.4)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.stroke();

      // Inner subtle fill
      ctx.globalAlpha = 0.04 * brightness;
      ctx.fillStyle = 'rgba(200,240,255,0.3)';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fill();

      // Highlight dot — catches the light
      ctx.globalAlpha = (0.3 + progress * 0.2) * brightness;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(
        b.x - b.size * 0.3,
        b.y - b.size * 0.3,
        b.size * 0.2,
        0, Math.PI * 2
      );
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Layer 7: Floating vowel letters
  function drawFloatingVowels() {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (var i = 0; i < floatingVowels.length; i++) {
      var v = floatingVowels[i];
      v.y -= v.speed * 0.3;
      v.x += v.drift * 0.2;
      v.rotation += v.rotSpeed;
      if (v.y < -v.size) { v.y = H + v.size; v.x = rand(W * 0.15, W * 0.85); }

      ctx.save();
      ctx.translate(v.x, v.y);
      ctx.rotate(v.rotation);
      ctx.globalAlpha = v.opacity * (0.4 + progress * 0.6) * brightness;
      ctx.font = 'bold ' + v.size + 'px "Fredoka One","Comic Sans MS",cursive';
      ctx.fillStyle = 'rgba(180,230,255,0.6)';
      ctx.fillText(v.char, 0, 0);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // Layer 8: Caustic light on ocean floor
  function drawCaustics() {
    var t = time * 0.001;
    var caustAlpha = 0.04 + progress * 0.08;
    for (var i = 0; i < caustics.length; i++) {
      var c = caustics[i];
      var cx = c.x + Math.sin(t * c.speed + c.phase) * 20 + c.driftX * t * 10;
      var cy = c.y + Math.cos(t * c.speed * 0.7 + c.phase) * 8;
      var sz = c.size * (0.8 + Math.sin(t * c.speed * 1.3 + c.phase) * 0.3);

      ctx.globalAlpha = caustAlpha * (0.5 + Math.sin(t * c.speed + c.phase) * 0.4);
      var cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, sz);
      cg.addColorStop(0, 'rgba(180,230,255,0.2)');
      cg.addColorStop(0.5, 'rgba(180,230,255,0.05)');
      cg.addColorStop(1, 'rgba(180,230,255,0)');
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(cx, cy, sz, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
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
    if (window._classmatesMuted) return;
    var t = ac.currentTime + (delay || 0);
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume || 0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration);
  }

  // Bubble pop — quick frequency sweep for underwater feel
  function playBubble(freq, volume, delay) {
    var ac = getAudio();
    if (!ac) return;
    if (window._classmatesMuted) return;
    var t = ac.currentTime + (delay || 0);
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 0.8, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.04);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.08);
    gain.gain.setValueAtTime(volume || 0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  // Ocean scale — lydian mode, watery and bright
  var OCEAN_SCALE = [392, 440, 494, 554, 587, 659, 740, 784, 880, 988];

  function sfxCorrect(noteIndex) {
    var freq = OCEAN_SCALE[Math.min(noteIndex || 0, OCEAN_SCALE.length - 1)];
    // Bubble pop chord — 3 ascending pops
    playBubble(freq, 0.07, 0);
    playBubble(freq * 1.25, 0.06, 0.06);
    playBubble(freq * 1.5, 0.05, 0.12);
    // Subtle water shimmer
    playNote(freq * 2, 0.3, 'sine', 0.02, 0.15);
  }

  function sfxWrong() {
    // Deep whale tone
    playNote(130, 0.6, 'sine', 0.05);
    playNote(125, 0.7, 'triangle', 0.025, 0.05);
    playNote(120, 0.5, 'sine', 0.015, 0.1);
  }

  function sfxGameComplete() {
    // School of fish — rapid ascending bubble cascade
    var notes = [392, 440, 494, 554, 587, 659, 740, 784];
    for (var i = 0; i < notes.length; i++) {
      playBubble(notes[i], 0.06, i * 0.07);
    }
    // Deep resonant chord
    setTimeout(function() {
      playNote(392, 0.8, 'sine', 0.05);
      playNote(494, 0.8, 'sine', 0.04);
      playNote(587, 0.7, 'triangle', 0.03);
      playNote(784, 0.6, 'sine', 0.02);
    }, 600);
  }

  // ==================== MAIN LOOP ====================
  var lastTime = 0;

  function loop(t) {
    if (!running) return;
    var dt = Math.min((t - lastTime) / 1000, 0.05);
    lastTime = t;
    time = t;

    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      W = canvas.width = canvas.clientWidth;
      H = canvas.height = canvas.clientHeight;
      generateScene();
    }

    progress += (targetProgress - progress) * 0.03;
    var targetBright = 0.5 + progress * 0.5;
    brightness += (targetBright - brightness) * 0.02;

    // Draw all layers
    drawOcean();
    drawOceanFloor();
    drawCaustics();
    drawShelves();
    drawSeaweed();
    drawFish();
    drawFloatingVowels();
    drawBubbles();

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
    brightness = 0.5;
    particles = [];
    lastTime = performance.now();
    animId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    animId = null;
  }

  function onCorrect(noteIndex) {
    if (!canvas) return;
    var cx = W * 0.5, cy = H * 0.4;
    // Bubble burst — light blue + white
    emitBurst(cx, cy, 14, {
      spread: 6, rise: 2.5, decay: 0.018, size: 4,
      color: 'rgba(120,220,255,0.8)'
    });
    emitBurst(cx, cy, 8, {
      spread: 4, rise: 3, decay: 0.022, size: 2.5,
      color: 'rgba(255,255,255,0.6)'
    });
    sfxCorrect(noteIndex);
  }

  function onWrong() {
    if (!canvas) return;
    emitBurst(W * 0.5, H * 0.5, 5, {
      spread: 2, rise: -0.2, gravity: 0.02, decay: 0.015, size: 2,
      color: 'rgba(60,80,120,0.4)'
    });
    sfxWrong();
  }

  function onComplete(pct) {
    targetProgress = pct || 1;
    if (!canvas) return;
    // Massive bubble cascade from bottom
    for (var w = 0; w < 3; w++) {
      for (var i = 0; i < 8; i++) {
        emitBurst(W * (0.1 + i * 0.11), H * (0.6 - w * 0.15), 3, {
          spread: 5, rise: 3 + w, decay: 0.01, size: 3 + w,
          color: 'rgba(120,220,255,0.7)'
        });
      }
    }
    sfxGameComplete();
  }

  function setProgress(pct) {
    targetProgress = Math.max(0, Math.min(1, pct || 0));
  }

  window.ClassmatesVowelsScene = {
    init: init,
    start: start,
    stop: stop,
    onCorrect: onCorrect,
    onWrong: onWrong,
    onComplete: onComplete,
    setProgress: setProgress
  };
})();
