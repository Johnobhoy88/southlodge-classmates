(function(){
  // ============================================================
  // NUMBER FORGE — Flagship Numeracy Puzzle Game
  // Solve arithmetic to build and power a forge. Correct answers
  // heat the metal, fill the progress bar, and craft items.
  // ============================================================

  var NF = {
    active: false,
    canvas: null,
    ctx: null,
    frameId: null,
    session: null,
    sparks: [],
    forgeHeat: 0,
    targetHeat: 0,
    anvilGlow: 0,
    hammerAngle: 0
  };

  var COLORS = {
    bgDark: '#1a0a0a',
    bgWarm: '#2a1208',
    forgeOrange: '#ff6a1a',
    forgeYellow: '#ffd93d',
    forgeRed: '#cc2200',
    metalGrey: '#8a8a8a',
    metalHot: '#ff4400',
    anvilDark: '#3a3a4a',
    sparkGold: '#ffdd6a',
    sparkWhite: '#ffffee',
    textLight: '#f0e0d0',
    correct: '#6aee6a',
    wrong: '#ee6a6a'
  };

  var CRAFT_ITEMS = [
    { name: 'Iron Nail', emoji: '\u{1F528}', threshold: 3 },
    { name: 'Bronze Key', emoji: '\u{1F511}', threshold: 5 },
    { name: 'Silver Shield', emoji: '\u{1F6E1}', threshold: 7 },
    { name: 'Gold Crown', emoji: '\u{1F451}', threshold: 9 }
  ];

  function generateQuestions(count) {
    var questions = [];
    var level = 1;
    if (typeof state !== 'undefined' && state.adaptive && state.adaptive.maths) {
      level = state.adaptive.maths.level || 1;
    }

    var genMath = window.ClassmatesMaths && typeof ClassmatesMaths.genMathQuestion === 'function'
      ? ClassmatesMaths.genMathQuestion : genLocalMathQ;

    for (var i = 0; i < count; i++) {
      // Mix difficulty: 70% at level, 20% one up, 10% one down
      var qLevel = level;
      var r = Math.random();
      if (r < 0.2 && level < 3) qLevel = level + 1;
      else if (r < 0.3 && level > 1) qLevel = level - 1;

      var q = genMath(qLevel);
      var options = generateNumberOptions(q.answer);
      questions.push({
        text: q.text,
        answer: q.answer,
        options: options,
        level: qLevel
      });
    }
    return questions;
  }

  function genLocalMathQ(lv) {
    var a, b, op, ans;
    if (lv === 1) {
      op = Math.random() < 0.5 ? '+' : '-';
      if (op === '+') { a = randInt(1, 9); b = randInt(1, 10 - a); ans = a + b; }
      else { a = randInt(2, 10); b = randInt(1, a); ans = a - b; }
    } else if (lv === 2) {
      var r = Math.random();
      if (r < 0.4) { op = '+'; a = randInt(1, 15); b = randInt(1, 20 - a); ans = a + b; }
      else if (r < 0.8) { op = '-'; a = randInt(5, 20); b = randInt(1, a); ans = a - b; }
      else { op = '\u00D7'; a = randInt(2, 5); b = randInt(2, 5); ans = a * b; }
    } else {
      var r2 = Math.random();
      if (r2 < 0.3) { op = '+'; a = randInt(10, 90); b = randInt(5, 100 - a); ans = a + b; }
      else if (r2 < 0.6) { op = '-'; a = randInt(20, 100); b = randInt(5, a); ans = a - b; }
      else if (r2 < 0.85) { op = '\u00D7'; a = randInt(2, 12); b = randInt(2, 12); ans = a * b; }
      else { ans = randInt(2, 12); b = randInt(2, 12); a = ans * b; op = '\u00F7'; }
    }
    return { text: a + ' ' + op + ' ' + b + ' = ?', answer: ans };
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateNumberOptions(correct) {
    var opts = [correct];
    while (opts.length < 4) {
      var offset = randInt(1, Math.max(3, Math.abs(correct) * 0.3 + 1));
      var wrong = correct + (Math.random() < 0.5 ? offset : -offset);
      if (wrong < 0) wrong = Math.abs(wrong);
      if (opts.indexOf(wrong) === -1 && wrong !== correct) opts.push(wrong);
    }
    if (typeof shuffle === 'function') shuffle(opts);
    return opts;
  }

  // === FORGE RENDERING ===

  function drawForge(t) {
    var ctx = NF.ctx;
    var w = NF.canvas.width;
    var h = NF.canvas.height;

    // Background
    var bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, COLORS.bgDark);
    bgGrad.addColorStop(1, COLORS.bgWarm);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Forge fire glow
    var fireY = h * 0.45;
    var heat = NF.forgeHeat;
    if (heat > 0) {
      var fireGrad = ctx.createRadialGradient(w / 2, fireY, 10, w / 2, fireY, 80 + heat * 40);
      fireGrad.addColorStop(0, 'rgba(255,106,26,' + (heat * 0.6) + ')');
      fireGrad.addColorStop(0.5, 'rgba(255,217,61,' + (heat * 0.3) + ')');
      fireGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = fireGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // Anvil
    var anvilX = w / 2;
    var anvilY = h * 0.55;
    ctx.fillStyle = COLORS.anvilDark;
    // Anvil base
    ctx.fillRect(anvilX - 40, anvilY, 80, 30);
    ctx.fillRect(anvilX - 50, anvilY + 20, 100, 15);
    // Anvil top
    ctx.fillRect(anvilX - 35, anvilY - 8, 70, 12);
    ctx.fillRect(anvilX - 25, anvilY - 14, 50, 8);

    // Metal on anvil (glows with heat)
    if (heat > 0.1) {
      var metalColor = heat > 0.7 ? COLORS.forgeYellow : heat > 0.4 ? COLORS.forgeOrange : COLORS.metalHot;
      ctx.fillStyle = metalColor;
      ctx.shadowColor = metalColor;
      ctx.shadowBlur = heat * 20;
      ctx.fillRect(anvilX - 15, anvilY - 10, 30, 6);
      ctx.shadowBlur = 0;
    }

    // Hammer (animated on correct answer)
    if (NF.hammerAngle > 0.01) {
      ctx.save();
      ctx.translate(anvilX + 30, anvilY - 30);
      ctx.rotate(-NF.hammerAngle);
      ctx.fillStyle = '#5a3a2a';
      ctx.fillRect(-3, -40, 6, 35);
      ctx.fillStyle = COLORS.metalGrey;
      ctx.fillRect(-10, -45, 20, 12);
      ctx.restore();
    }

    // Sparks
    NF.sparks = NF.sparks.filter(function(s) {
      s.life -= 0.02;
      s.y -= s.vy;
      s.x += s.vx;
      s.vy -= 0.05;
      if (s.life <= 0) return false;
      ctx.globalAlpha = s.life;
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });
    ctx.globalAlpha = 1;

    // Crafted items display
    if (NF.session) {
      var crafted = NF.session.crafted;
      if (crafted.length > 0) {
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';
        crafted.forEach(function(item, idx) {
          ctx.fillText(item.emoji, w / 2 - 40 + idx * 30, h * 0.35);
        });
      }
    }
  }

  function spawnSparks(x, y, count) {
    for (var i = 0; i < count; i++) {
      NF.sparks.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y,
        vx: (Math.random() - 0.5) * 3,
        vy: 1 + Math.random() * 3,
        size: 2 + Math.random() * 3,
        life: 0.5 + Math.random() * 0.5,
        color: Math.random() > 0.5 ? COLORS.sparkGold : COLORS.sparkWhite
      });
    }
  }

  // === GAME UI ===

  function renderQuestion() {
    if (!NF.session || NF.session.questionIdx >= NF.session.questions.length) return;
    var q = NF.session.questions[NF.session.questionIdx];
    var panel = document.getElementById('nfPanel');
    if (!panel) return;

    var craftProgress = '';
    var nextCraft = null;
    for (var c = 0; c < CRAFT_ITEMS.length; c++) {
      if (NF.session.correct < CRAFT_ITEMS[c].threshold) {
        nextCraft = CRAFT_ITEMS[c];
        break;
      }
    }
    if (nextCraft) {
      craftProgress = '<div class="nf-craft-hint">Next craft: ' + nextCraft.emoji + ' ' + nextCraft.name + ' (' + NF.session.correct + '/' + nextCraft.threshold + ')</div>';
    }

    var esc = typeof escapeHtml === 'function' ? escapeHtml : function(v) { return String(v); };
    var h = '<div class="nf-question">';
    h += '<div class="nf-prompt">' + esc(q.text) + '</div>';
    h += '<div class="nf-options">';
    q.options.forEach(function(opt, idx) {
      h += '<button class="nf-opt" onclick="NumberForge.answer(' + idx + ')">' + esc(opt) + '</button>';
    });
    h += '</div>';
    h += craftProgress;
    h += '<div class="nf-progress-bar"><div class="nf-progress-fill" style="width:' + Math.round((NF.session.questionIdx / NF.session.questions.length) * 100) + '%"></div></div>';
    h += '<div class="nf-stats">';
    h += '<span class="nf-stat">' + NF.session.correct + '/' + NF.session.questionIdx + ' correct</span>';
    h += '<span class="nf-stat">Heat: ' + Math.round(NF.forgeHeat * 100) + '%</span>';
    if (NF.session.streak >= 2) h += '<span class="nf-stat nf-streak-badge">' + NF.session.streak + ' streak!</span>';
    h += '</div>';
    h += '</div>';
    panel.innerHTML = h;
    panel.style.display = 'block';
  }

  function answer(optIdx) {
    if (!NF.session || NF.session.answered) return;
    NF.session.answered = true;
    var q = NF.session.questions[NF.session.questionIdx];
    var chosen = q.options[optIdx];
    var isCorrect = (chosen === q.answer);

    var buttons = document.querySelectorAll('#nfPanel .nf-opt');
    buttons.forEach(function(btn, idx) {
      btn.disabled = true;
      if (q.options[idx] === q.answer) btn.classList.add('nf-correct');
      if (idx === optIdx && !isCorrect) btn.classList.add('nf-wrong');
    });

    if (isCorrect) {
      NF.session.correct++;
      NF.session.streak++;
      NF.session.bestStreak = Math.max(NF.session.bestStreak, NF.session.streak);
      NF.targetHeat = Math.min(1, NF.session.correct / NF.session.questions.length + 0.1);
      NF.hammerAngle = 0.8;
      spawnSparks(NF.canvas.width / 2, NF.canvas.height * 0.5, 10);
      if (typeof sfxCorrect === 'function') sfxCorrect();

      // Check crafting
      CRAFT_ITEMS.forEach(function(item) {
        if (NF.session.correct === item.threshold && NF.session.crafted.indexOf(item) === -1) {
          NF.session.crafted.push(item);
          spawnSparks(NF.canvas.width / 2, NF.canvas.height * 0.35, 20);
          if (typeof sfxLevelUp === 'function') sfxLevelUp();
          if (typeof launchConfetti === 'function') launchConfetti(800);
        }
      });

      if (NF.session.streak >= 3 && typeof sfxStreak === 'function') sfxStreak();

      if (typeof state !== 'undefined' && window.ClassmatesAppState && NF.session.correct % 3 === 0) {
        ClassmatesAppState.adaptiveCorrect(state, 'maths');
      }
    } else {
      NF.session.streak = 0;
      NF.targetHeat = Math.max(0, NF.targetHeat - 0.1);
      NF.session.missed.push({ w: q.text, h: 'Answer: ' + q.answer });
      if (typeof sfxWrong === 'function') sfxWrong();
    }

    setTimeout(function() {
      NF.session.questionIdx++;
      NF.session.answered = false;
      NF.hammerAngle = 0;
      if (NF.session.questionIdx >= NF.session.questions.length) {
        finishForge();
      } else {
        renderQuestion();
      }
    }, isCorrect ? 700 : 1500);
  }

  function finishForge() {
    var panel = document.getElementById('nfPanel');
    if (panel) panel.style.display = 'none';
    NF.targetHeat = 1;
    spawnSparks(NF.canvas.width / 2, NF.canvas.height * 0.4, 30);
    if (typeof launchConfetti === 'function') launchConfetti(1500);

    var total = NF.session.questions.length;
    var correct = NF.session.correct;
    var pct = correct / total;
    var stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;

    if (typeof state !== 'undefined' && window.ClassmatesAppState) {
      state.mathsCorrect = (state.mathsCorrect || 0) + correct;
      if (pct >= 0.8) ClassmatesAppState.adaptiveCorrect(state, 'maths');
      else if (pct < 0.4) ClassmatesAppState.adaptiveWrong(state, 'maths');
    }
    if (typeof addStars === 'function') addStars(stars);
    if (typeof recordPlay === 'function') recordPlay();

    setTimeout(function() {
      stop();
      var sub = NF.session.crafted.length > 0
        ? 'Crafted: ' + NF.session.crafted.map(function(i) { return i.emoji; }).join(' ')
        : 'Number Forge';
      if (typeof showResults === 'function') {
        showResults('#cc4400', '\u{1F525}', 'Forge Complete!', sub, stars, correct, total, function() {
          if (typeof showScreen === 'function') showScreen('home');
        }, NF.session.missed);
      }
    }, 1500);
  }

  // === LIFECYCLE ===

  function init(canvas) {
    NF.canvas = canvas;
    NF.ctx = canvas.getContext('2d');
    var parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth || 400;
      canvas.height = parent.clientHeight || 500;
    }
  }

  function start() {
    var questions = generateQuestions(10);
    NF.session = {
      questions: questions,
      questionIdx: 0,
      correct: 0,
      streak: 0,
      bestStreak: 0,
      missed: [],
      answered: false,
      crafted: []
    };
    NF.forgeHeat = 0;
    NF.targetHeat = 0;
    NF.sparks = [];
    NF.hammerAngle = 0;
    NF.active = true;
    renderQuestion();
    loop();
  }

  function stop() {
    NF.active = false;
    if (NF.frameId) cancelAnimationFrame(NF.frameId);
    NF.frameId = null;
    var panel = document.getElementById('nfPanel');
    if (panel) panel.style.display = 'none';
  }

  function loop() {
    if (!NF.active) return;
    NF.frameId = requestAnimationFrame(loop);
    NF.forgeHeat += (NF.targetHeat - NF.forgeHeat) * 0.04;
    NF.hammerAngle *= 0.85;
    drawForge(Date.now());
  }

  var api = {
    init: init,
    start: start,
    stop: stop,
    answer: answer
  };

  window.NumberForge = api;
  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerModule === 'function') {
    window.ClassmatesPlatform.registerModule('games', 'number-forge', {
      owner: 'games',
      exports: ['NumberForge']
    });
  }
})();
