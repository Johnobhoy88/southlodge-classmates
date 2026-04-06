(function(){
  // ============================================================
  // SPELLBOUND FOREST — Flagship Literacy Adventure
  // Canvas 2D forest scene with phonics, spelling, and word building.
  // Correct answers grow paths and restore the enchanted forest.
  // ============================================================

  var SF = {
    active: false,
    canvas: null,
    ctx: null,
    frameId: null,
    session: null,
    trees: [],
    particles: [],
    pathProgress: 0,
    targetPathProgress: 0,
    glowAlpha: 0,
    starField: []
  };

  // Forest colour palette
  var COLORS = {
    skyTop: '#0b1a2e',
    skyBottom: '#1a3a4a',
    groundDark: '#1a3a2a',
    groundLight: '#2a5a3a',
    pathDim: '#3a4a3a',
    pathGlow: '#7fdd6a',
    treeTrunk: '#4a3020',
    treeLeaf: '#1a5a2a',
    treeLeafGlow: '#3aaa4a',
    flowerPink: '#ff8aaa',
    flowerYellow: '#ffdd4a',
    starGold: '#ffd93d',
    textLight: '#e8f0e0',
    textDark: '#1a2a1a',
    correct: '#6aee6a',
    wrong: '#ee6a6a',
    hintBlue: '#6ab8ee'
  };

  // Question types for variety
  var QUESTION_TYPES = ['spell_word', 'pick_phonics', 'fill_vowel', 'word_build'];

  function generateQuestions(count) {
    var questions = [];
    var spellingWords = window.ClassmatesSpelling ? ClassmatesSpelling.SPELLING : null;
    var phonicsData = window.ClassmatesPhonics ? ClassmatesPhonics.PHONICS_DATA : null;

    // Get adaptive level
    var level = 1;
    if (typeof state !== 'undefined' && state.adaptive && state.adaptive.spelling) {
      level = state.adaptive.spelling.level || 1;
    }
    var pool = spellingWords ? spellingWords[level] || spellingWords[1] : [];
    if (typeof shuffle === 'function') pool = shuffle(pool.slice());

    for (var i = 0; i < count; i++) {
      var type = QUESTION_TYPES[i % QUESTION_TYPES.length];
      var q = null;

      if (type === 'spell_word' && pool.length > 0) {
        var item = pool[i % pool.length];
        var word = item.w.toLowerCase();
        var hideIdx = Math.floor(Math.random() * word.length);
        var display = word.split('').map(function(ch, idx) { return idx === hideIdx ? '_' : ch; }).join('');
        q = {
          type: 'spell_word',
          prompt: item.h,
          display: display,
          answer: word[hideIdx],
          word: word,
          options: generateLetterOptions(word[hideIdx]),
          hint: 'The word is "' + word + '". Which letter is missing?'
        };
      } else if (type === 'pick_phonics' && phonicsData && phonicsData.levels) {
        var phonicsLevel = phonicsData.levels[Math.min(level, phonicsData.levels.length) - 1];
        if (phonicsLevel && phonicsLevel.length > 0) {
          var pItem = phonicsLevel[i % phonicsLevel.length];
          var correctWord = pItem.words[0];
          var wrongWords = pItem.wrong || pItem.words.slice(1);
          var opts = [correctWord];
          for (var w = 0; w < wrongWords.length && opts.length < 4; w++) {
            if (opts.indexOf(wrongWords[w]) === -1) opts.push(wrongWords[w]);
          }
          while (opts.length < 4) opts.push(pItem.words[opts.length % pItem.words.length] || 'word');
          if (typeof shuffle === 'function') shuffle(opts);
          q = {
            type: 'pick_phonics',
            prompt: 'Which word has the "' + pItem.sound + '" sound?',
            display: pItem.sound,
            answer: correctWord,
            word: correctWord,
            options: opts,
            hint: '"' + correctWord + '" contains the "' + pItem.sound + '" sound.'
          };
        }
      } else if (type === 'fill_vowel' && pool.length > 0) {
        var vItem = pool[(i + 2) % pool.length];
        var vWord = vItem.w.toLowerCase();
        var vowels = [];
        for (var v = 0; v < vWord.length; v++) {
          if ('aeiou'.indexOf(vWord[v]) >= 0) vowels.push(v);
        }
        if (vowels.length > 0) {
          var vIdx = vowels[Math.floor(Math.random() * vowels.length)];
          var vDisplay = vWord.split('').map(function(ch, idx) { return idx === vIdx ? '_' : ch; }).join('');
          q = {
            type: 'fill_vowel',
            prompt: 'Fill in the missing vowel: ' + vItem.h,
            display: vDisplay,
            answer: vWord[vIdx],
            word: vWord,
            options: ['a', 'e', 'i', 'o', 'u'],
            hint: 'The missing vowel in "' + vWord + '" is "' + vWord[vIdx] + '".'
          };
        }
      }

      if (!q && pool.length > 0) {
        // Fallback: word building
        var bItem = pool[(i + 3) % pool.length];
        var bWord = bItem.w.toLowerCase();
        var letters = bWord.split('');
        var scrambled = letters.slice();
        if (typeof shuffle === 'function') shuffle(scrambled);
        q = {
          type: 'word_build',
          prompt: bItem.h,
          display: scrambled.join(' '),
          answer: bWord,
          word: bWord,
          options: [bWord, scrambled.reverse().join(''), bWord.split('').reverse().join(''), bWord + 's'],
          hint: 'Unscramble the letters to spell "' + bWord + '".'
        };
        if (typeof shuffle === 'function') shuffle(q.options);
      }

      if (q) questions.push(q);
    }

    return questions;
  }

  function generateLetterOptions(correct) {
    var letters = 'abcdefghijklmnopqrstuvwxyz';
    var opts = [correct];
    while (opts.length < 4) {
      var ch = letters[Math.floor(Math.random() * 26)];
      if (opts.indexOf(ch) === -1) opts.push(ch);
    }
    if (typeof shuffle === 'function') shuffle(opts);
    return opts;
  }

  // === FOREST RENDERING ===

  function initForest() {
    SF.trees = [];
    SF.starField = [];
    // Generate trees at fixed positions
    for (var i = 0; i < 20; i++) {
      SF.trees.push({
        x: Math.random() * SF.canvas.width,
        y: SF.canvas.height * 0.35 + Math.random() * SF.canvas.height * 0.3,
        size: 20 + Math.random() * 40,
        glow: 0,
        leafHue: Math.random() * 40 - 20
      });
    }
    // Star field
    for (var s = 0; s < 30; s++) {
      SF.starField.push({
        x: Math.random() * SF.canvas.width,
        y: Math.random() * SF.canvas.height * 0.4,
        size: 1 + Math.random() * 2,
        twinkle: Math.random() * Math.PI * 2
      });
    }
  }

  function drawForest(t) {
    var ctx = SF.ctx;
    var w = SF.canvas.width;
    var h = SF.canvas.height;

    // Sky gradient
    var skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.5);
    skyGrad.addColorStop(0, COLORS.skyTop);
    skyGrad.addColorStop(1, COLORS.skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.5);

    // Stars
    SF.starField.forEach(function(star) {
      var twinkle = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.001 + star.twinkle));
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = COLORS.starGold;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Ground
    var groundGrad = ctx.createLinearGradient(0, h * 0.45, 0, h);
    groundGrad.addColorStop(0, COLORS.groundDark);
    groundGrad.addColorStop(1, COLORS.groundLight);
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, h * 0.45, w, h * 0.55);

    // Forest path (grows with progress)
    drawPath(ctx, w, h, t);

    // Trees
    SF.trees.forEach(function(tree) {
      drawTree(ctx, tree, t);
    });

    // Glow particles
    SF.particles = SF.particles.filter(function(p) {
      p.life -= 0.016;
      p.y -= p.vy;
      p.x += p.vx;
      if (p.life <= 0) return false;
      ctx.globalAlpha = p.life * 0.7;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });
    ctx.globalAlpha = 1;
  }

  function drawPath(ctx, w, h, t) {
    var pathY = h * 0.7;
    var pathWidth = 30;
    var progress = SF.pathProgress;

    // Path background (dim)
    ctx.strokeStyle = COLORS.pathDim;
    ctx.lineWidth = pathWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(w * 0.1, pathY);
    ctx.bezierCurveTo(w * 0.3, pathY - 40, w * 0.5, pathY + 30, w * 0.9, pathY - 20);
    ctx.stroke();

    // Path glow (progress)
    if (progress > 0) {
      var glowGrad = ctx.createLinearGradient(w * 0.1, 0, w * 0.9, 0);
      glowGrad.addColorStop(0, COLORS.pathGlow);
      glowGrad.addColorStop(Math.min(progress, 1), COLORS.pathGlow);
      if (progress < 1) glowGrad.addColorStop(Math.min(progress + 0.01, 1), 'transparent');

      ctx.strokeStyle = glowGrad;
      ctx.lineWidth = pathWidth - 4;
      ctx.shadowColor = COLORS.pathGlow;
      ctx.shadowBlur = 12 + Math.sin(t * 0.003) * 4;
      ctx.beginPath();
      ctx.moveTo(w * 0.1, pathY);
      ctx.bezierCurveTo(w * 0.3, pathY - 40, w * 0.5, pathY + 30, w * 0.9, pathY - 20);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }

  function drawTree(ctx, tree, t) {
    var x = tree.x;
    var y = tree.y;
    var s = tree.size;

    // Trunk
    ctx.fillStyle = COLORS.treeTrunk;
    ctx.fillRect(x - s * 0.08, y - s * 0.3, s * 0.16, s * 0.4);

    // Foliage layers
    var glowAmount = tree.glow;
    for (var layer = 0; layer < 3; layer++) {
      var ly = y - s * 0.3 - layer * s * 0.25;
      var lr = s * 0.4 - layer * 0.08 * s;
      ctx.fillStyle = glowAmount > 0.5 ? COLORS.treeLeafGlow : COLORS.treeLeaf;
      ctx.globalAlpha = 0.7 + glowAmount * 0.3;
      ctx.beginPath();
      ctx.moveTo(x, ly - lr);
      ctx.lineTo(x - lr, ly + lr * 0.3);
      ctx.lineTo(x + lr, ly + lr * 0.3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Flowers on glowing trees
    if (glowAmount > 0.3) {
      var flowerColors = [COLORS.flowerPink, COLORS.flowerYellow, COLORS.starGold];
      for (var f = 0; f < 3; f++) {
        var fx = x + (Math.sin(t * 0.001 + f * 2) * s * 0.3);
        var fy = y - s * 0.4 - f * s * 0.15;
        ctx.fillStyle = flowerColors[f % flowerColors.length];
        ctx.globalAlpha = glowAmount;
        ctx.beginPath();
        ctx.arc(fx, fy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  function spawnParticles(x, y, color, count) {
    for (var i = 0; i < count; i++) {
      SF.particles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 0.5 + Math.random() * 1.5,
        size: 3 + Math.random() * 4,
        life: 0.6 + Math.random() * 0.6,
        color: color
      });
    }
  }

  // === GAME UI ===

  function renderQuestion() {
    if (!SF.session || SF.session.questionIdx >= SF.session.questions.length) return;
    var q = SF.session.questions[SF.session.questionIdx];
    var panel = document.getElementById('sfPanel');
    if (!panel) return;

    var h = '<div class="sf-question">';
    h += '<div class="sf-prompt">' + (typeof escapeHtml === 'function' ? escapeHtml(q.prompt) : q.prompt) + '</div>';
    h += '<div class="sf-display">' + (typeof escapeHtml === 'function' ? escapeHtml(q.display) : q.display) + '</div>';
    h += '<div class="sf-options">';
    q.options.forEach(function(opt, idx) {
      h += '<button class="sf-opt" data-idx="' + idx + '" onclick="SpellboundForest.answer(' + idx + ')">' + (typeof escapeHtml === 'function' ? escapeHtml(opt) : opt) + '</button>';
    });
    h += '</div>';
    h += '<div class="sf-hint-area" id="sfHint" style="display:none"></div>';
    h += '<div class="sf-progress-bar"><div class="sf-progress-fill" style="width:' + Math.round((SF.session.questionIdx / SF.session.questions.length) * 100) + '%"></div></div>';
    h += '<div class="sf-stats">';
    h += '<span class="sf-stat">' + SF.session.correct + '/' + SF.session.questionIdx + ' correct</span>';
    h += '<span class="sf-stat">Forest: ' + Math.round(SF.pathProgress * 100) + '%</span>';
    if (SF.session.streak >= 2) h += '<span class="sf-stat sf-streak-badge">' + SF.session.streak + ' streak!</span>';
    h += '</div>';
    h += '</div>';
    panel.innerHTML = h;
    panel.style.display = 'block';
  }

  function answer(optIdx) {
    if (!SF.session || SF.session.answered) return;
    SF.session.answered = true;
    var q = SF.session.questions[SF.session.questionIdx];
    var chosen = q.options[optIdx];
    var isCorrect = (chosen === q.answer);

    var buttons = document.querySelectorAll('#sfPanel .sf-opt');
    buttons.forEach(function(btn, idx) {
      btn.disabled = true;
      if (q.options[idx] === q.answer) btn.classList.add('sf-correct');
      if (idx === optIdx && !isCorrect) btn.classList.add('sf-wrong');
    });

    if (isCorrect) {
      SF.session.correct++;
      SF.session.streak++;
      SF.session.bestStreak = Math.max(SF.session.bestStreak, SF.session.streak);
      SF.targetPathProgress = (SF.session.correct) / SF.session.questions.length;

      // Grow trees near the path
      var growCount = Math.min(3, SF.trees.length);
      for (var g = 0; g < growCount; g++) {
        var treeIdx = (SF.session.correct * 3 + g) % SF.trees.length;
        SF.trees[treeIdx].glow = Math.min(1, SF.trees[treeIdx].glow + 0.4);
      }

      // Particles
      spawnParticles(SF.canvas.width / 2, SF.canvas.height * 0.65, COLORS.correct, 8);
      if (typeof sfxCorrect === 'function') sfxCorrect();

      // Streak rewards
      if (SF.session.streak === 3) {
        spawnParticles(SF.canvas.width / 2, SF.canvas.height * 0.4, COLORS.starGold, 15);
        if (typeof sfxStreak === 'function') sfxStreak();
      } else if (SF.session.streak === 5) {
        spawnParticles(SF.canvas.width / 2, SF.canvas.height * 0.3, COLORS.flowerPink, 20);
        if (typeof sfxLevelUp === 'function') sfxLevelUp();
      }

      // Adaptive: track correct
      if (typeof state !== 'undefined' && window.ClassmatesAppState && SF.session.correct % 3 === 0) {
        ClassmatesAppState.adaptiveCorrect(state, 'spelling');
      }
    } else {
      SF.session.streak = 0;
      SF.session.missed.push({ w: q.word, h: q.hint });
      spawnParticles(SF.canvas.width / 2, SF.canvas.height * 0.65, COLORS.wrong, 4);
      if (typeof sfxWrong === 'function') sfxWrong();

      // Scaffolded failure: show hint
      var hintEl = document.getElementById('sfHint');
      if (hintEl) {
        hintEl.textContent = q.hint;
        hintEl.style.display = 'block';
      }

      // Track weak item
      if (typeof state !== 'undefined' && window.ClassmatesAppState) {
        ClassmatesAppState.addWeakItem(state, 'spelling', { w: q.word, h: q.prompt });
      }
    }

    setTimeout(function() {
      SF.session.questionIdx++;
      SF.session.answered = false;
      if (SF.session.questionIdx >= SF.session.questions.length) {
        finishForest();
      } else {
        renderQuestion();
      }
    }, isCorrect ? 800 : 2000);
  }

  function finishForest() {
    var panel = document.getElementById('sfPanel');
    if (panel) panel.style.display = 'none';
    SF.targetPathProgress = 1;

    // Celebrate
    SF.trees.forEach(function(tree) { tree.glow = 1; });
    spawnParticles(SF.canvas.width / 2, SF.canvas.height * 0.4, COLORS.starGold, 30);
    if (typeof launchConfetti === 'function') launchConfetti(1500);

    var total = SF.session.questions.length;
    var correct = SF.session.correct;
    var pct = correct / total;
    var stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= 0.3 ? 1 : 0;

    // Update mastery
    if (typeof state !== 'undefined' && window.ClassmatesAppState) {
      if (pct >= 0.8) ClassmatesAppState.adaptiveCorrect(state, 'spelling');
      else if (pct < 0.4) ClassmatesAppState.adaptiveWrong(state, 'spelling');
    }
    if (typeof addStars === 'function') addStars(stars);
    if (typeof recordPlay === 'function') recordPlay();

    setTimeout(function() {
      stop();
      if (typeof showResults === 'function') {
        showResults('#2a7a3a', '\u{1F332}', 'Forest Restored!', 'Spellbound Forest', stars, correct, total, function() {
          if (typeof showScreen === 'function') showScreen('home');
        }, SF.session.missed);
      }
    }, 1500);
  }

  // === GAME LIFECYCLE ===

  function init(canvas) {
    SF.canvas = canvas;
    SF.ctx = canvas.getContext('2d');
    resize();
  }

  function resize() {
    if (!SF.canvas) return;
    var parent = SF.canvas.parentElement;
    if (parent) {
      SF.canvas.width = parent.clientWidth || 400;
      SF.canvas.height = parent.clientHeight || 500;
    }
    initForest();
  }

  function start() {
    var questions = generateQuestions(10);
    if (questions.length === 0) {
      if (typeof showScreen === 'function') showScreen('home');
      return;
    }

    SF.session = {
      questions: questions,
      questionIdx: 0,
      correct: 0,
      streak: 0,
      bestStreak: 0,
      missed: [],
      answered: false,
      startTime: Date.now()
    };

    SF.pathProgress = 0;
    SF.targetPathProgress = 0;
    SF.particles = [];
    SF.trees.forEach(function(tree) { tree.glow = 0; });
    SF.active = true;
    renderQuestion();
    loop();
  }

  function stop() {
    SF.active = false;
    if (SF.frameId) cancelAnimationFrame(SF.frameId);
    SF.frameId = null;
    var panel = document.getElementById('sfPanel');
    if (panel) panel.style.display = 'none';
  }

  function loop() {
    if (!SF.active) return;
    SF.frameId = requestAnimationFrame(loop);
    var t = Date.now();

    // Smooth path progress
    SF.pathProgress += (SF.targetPathProgress - SF.pathProgress) * 0.03;

    drawForest(t);
  }

  // === PUBLIC API ===
  var api = {
    init: init,
    start: start,
    stop: stop,
    answer: answer,
    resize: resize
  };

  window.SpellboundForest = api;
  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerModule === 'function') {
    window.ClassmatesPlatform.registerModule('games', 'spellbound-forest', {
      owner: 'games',
      exports: ['SpellboundForest']
    });
  }
})();
