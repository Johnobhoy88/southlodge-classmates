(function(){
  // ============================================================
  // WORD FOREST PLATFORMER — Spelling Adventure
  // A narrative platformer where players spell words to progress
  // through an enchanted forest and defeat the Word Weaver boss.
  // 3 levels (Easy/Medium/Hard) + Boss Fight + Cutscenes
  // For the kids of South Lodge Primary, Invergordon
  // ============================================================

  // ==================== CONSTANTS ====================
  var GRAVITY = 0.6;
  var JUMP_FORCE = -11;
  var MOVE_SPEED = 3.5;
  var TILE = 32;
  var MAX_HP = 3;

  // ==================== STATE ====================
  var canvas, ctx, animId, running = false;
  var W = 0, H = 0, time = 0, dt = 0;
  var keys = {};
  var touchLeft = false, touchRight = false, touchJump = false;
  var levelStartTime = 0;

  var gameState = {
    stage: 'title',       // title, cutscene, playing, boss, win, lose
    level: 1,             // 1=easy, 2=medium, 3=hard
    playerHP: MAX_HP,
    score: 0,
    wordsSpelled: 0,
    totalWords: 0,
    currentWord: null,
    currentLetterIdx: 0,
    bossHP: 15,
    bossPhase: 1,
    cutsceneIdx: 0,
    cutsceneTimer: 0,
    flashTimer: 0,
    flashColor: '',
    shakeTimer: 0,
    shakeAmount: 0,
    wordPromptActive: false,
    wordChoices: [],
    checkpoint: null,
    invulnTimer: 0,
    transitionTimer: 0,
    transitionTarget: ''
  };

  // ==================== PLAYER ====================
  var player = {
    x: 64, y: 0, vx: 0, vy: 0,
    w: 20, h: 28,
    onGround: false, facingRight: true,
    animFrame: 0, animTimer: 0,
    jumpHeld: false
  };

  // ==================== CAMERA ====================
  var camera = { x: 0, y: 0 };

  // ==================== WORLD ====================
  var platforms = [];
  var collectibles = [];  // letters to collect
  var enemies = [];
  var checkpoints = [];
  var triggers = [];      // invisible zones that start spelling prompts
  var particles = [];
  var decorations = [];
  var levelWidth = 0;
  var levelHeight = 0;

  // ==================== WORD DATA ====================
  var wordList = [];
  var wordQueue = [];

  function getWords(level) {
    if (window.ClassmatesSpelling && window.ClassmatesSpelling.SPELLING) {
      return window.ClassmatesSpelling.SPELLING[level] || [];
    }
    // Fallback minimal words
    return [
      {w:'cat',h:'A furry pet'},{w:'dog',h:'A pet that barks'},{w:'sun',h:'Shines in the sky'},
      {w:'hat',h:'Wear on head'},{w:'run',h:'Move fast'},{w:'big',h:'Not small'}
    ];
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function nextWord() {
    if (wordQueue.length === 0) wordQueue = shuffle(wordList.slice());
    return wordQueue.pop();
  }

  // ==================== LEVEL GENERATION ====================
  function rand(a, b) { return a + Math.random() * (b - a); }

  function generateLevel(lvl) {
    platforms = [];
    collectibles = [];
    enemies = [];
    checkpoints = [];
    triggers = [];
    decorations = [];
    particles = [];

    var wordsNeeded = lvl === 1 ? 5 : lvl === 2 ? 6 : 7;
    gameState.totalWords = wordsNeeded;
    gameState.wordsSpelled = 0;
    gameState.currentWord = null;
    gameState.wordPromptActive = false;
    gameState.currentLetterIdx = 0;

    wordList = getWords(lvl);
    wordQueue = shuffle(wordList.slice());

    levelHeight = H;
    var sections = wordsNeeded + 2; // start + word sections + end
    levelWidth = sections * W * 0.8;

    // Ground
    platforms.push({ x: 0, y: H - TILE, w: levelWidth, h: TILE, type: 'ground' });

    var sectionW = levelWidth / sections;
    var groundY = H - TILE;

    for (var s = 0; s < sections; s++) {
      var sx = s * sectionW;

      // Add platforms per section
      var platCount = lvl === 1 ? 2 : lvl === 2 ? 3 : 4;
      for (var p = 0; p < platCount; p++) {
        var px = sx + rand(30, sectionW - 80);
        var py = groundY - rand(60, 180);
        var pw = rand(60, 120);
        var ptype = 'wood';
        if (lvl >= 2 && Math.random() > 0.7) ptype = 'moving';
        if (lvl >= 3 && Math.random() > 0.6) ptype = 'crumble';
        platforms.push({
          x: px, y: py, w: pw, h: 12, type: ptype,
          origX: px, origY: py,
          moveRange: ptype === 'moving' ? rand(40, 80) : 0,
          moveSpeed: rand(0.5, 1.5),
          movePhase: rand(0, Math.PI * 2),
          crumbleTimer: 0
        });
      }

      // Word trigger zones — visible portal gates at ground level
      if (s > 0 && s <= wordsNeeded) {
        triggers.push({
          x: sx + sectionW * 0.45, y: groundY - 60, w: 30, h: 60,
          triggered: false, wordIdx: s - 1
        });
      }

      // Checkpoint
      if (s > 0 && s % 2 === 0) {
        checkpoints.push({
          x: sx + sectionW * 0.5, y: groundY - 40,
          active: false
        });
      }

      // Enemies (level 2+)
      if (lvl >= 2 && s > 0 && s < sections - 1 && Math.random() > 0.5) {
        enemies.push({
          x: sx + rand(50, sectionW - 50), y: groundY - 24,
          w: 20, h: 24, vx: rand(0.5, 1.5) * (Math.random() > 0.5 ? 1 : -1),
          hp: 1, type: 'walker',
          patrolLeft: sx + 20, patrolRight: sx + sectionW - 20,
          animTimer: 0, dead: false
        });
      }

      // Decorations (trees, bushes, rocks)
      for (var d = 0; d < 3; d++) {
        decorations.push({
          x: sx + rand(10, sectionW - 10),
          y: groundY,
          type: ['tree', 'bush', 'rock', 'flower'][Math.floor(rand(0, 4))],
          size: rand(0.6, 1.4),
          layer: Math.floor(rand(0, 3)) // 0=far, 1=mid, 2=near
        });
      }
    }

    // Player start
    player.x = 64;
    player.y = groundY - player.h - 4;
    player.vx = 0;
    player.vy = 0;
    player.onGround = true;

    camera.x = 0;
    camera.y = 0;
    levelStartTime = time;
  }

  // ==================== PHYSICS ====================
  function updatePlayer() {
    // Input
    var moveDir = 0;
    if (keys['ArrowLeft'] || keys['a'] || keys['A'] || touchLeft) moveDir = -1;
    if (keys['ArrowRight'] || keys['d'] || keys['D'] || touchRight) moveDir = 1;
    var jumpPressed = keys['ArrowUp'] || keys['w'] || keys['W'] || keys[' '] || touchJump;

    // Don't move during word prompts
    if (gameState.wordPromptActive) {
      moveDir = 0;
      jumpPressed = false;
    }

    // Horizontal movement
    player.vx = moveDir * MOVE_SPEED;
    if (moveDir !== 0) player.facingRight = moveDir > 0;

    // Jump
    if (jumpPressed && player.onGround && !player.jumpHeld) {
      player.vy = JUMP_FORCE;
      player.onGround = false;
      player.jumpHeld = true;
      playSound('jump');
    }
    if (!jumpPressed) player.jumpHeld = false;

    // Gravity
    player.vy += GRAVITY;
    if (player.vy > 12) player.vy = 12;

    // Move and collide
    player.x += player.vx;
    player.y += player.vy;
    player.onGround = false;

    // Platform collision
    for (var i = 0; i < platforms.length; i++) {
      var p = platforms[i];
      if (p.type === 'crumble' && p.crumbleTimer > 30) continue; // crumbled

      // Horizontal bounds
      if (player.x + player.w > p.x && player.x < p.x + p.w) {
        // Landing on top
        if (player.vy >= 0 && player.y + player.h > p.y && player.y + player.h < p.y + p.h + player.vy + 2) {
          player.y = p.y - player.h;
          player.vy = 0;
          player.onGround = true;

          // Moving platform carries player
          if (p.type === 'moving') {
            player.x += Math.cos(time * 0.001 * p.moveSpeed + p.movePhase) * p.moveRange * 0.02;
          }

          // Start crumble timer
          if (p.type === 'crumble' && p.crumbleTimer === 0) {
            p.crumbleTimer = 0.01;
          }
        }
      }
    }

    // World bounds
    if (player.x < 0) player.x = 0;
    if (player.x > levelWidth - player.w) player.x = levelWidth - player.w;
    if (player.y > H + 50) {
      // Fell off — respawn at checkpoint or start
      damagePlayer();
      respawnPlayer();
    }

    // Animation
    player.animTimer += dt;
    if (Math.abs(player.vx) > 0.1 && player.onGround) {
      if (player.animTimer > 0.12) {
        player.animFrame = (player.animFrame + 1) % 4;
        player.animTimer = 0;
      }
    } else {
      player.animFrame = 0;
    }

    // Invulnerability countdown
    if (gameState.invulnTimer > 0) gameState.invulnTimer -= dt;
  }

  function updateMovingPlatforms() {
    var t = time * 0.001;
    for (var i = 0; i < platforms.length; i++) {
      var p = platforms[i];
      if (p.type === 'moving') {
        p.x = p.origX + Math.sin(t * p.moveSpeed + p.movePhase) * p.moveRange;
      }
      if (p.type === 'crumble' && p.crumbleTimer > 0) {
        p.crumbleTimer += dt;
      }
    }
  }

  function updateEnemies() {
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (e.dead) continue;

      e.x += e.vx;
      e.animTimer += dt;

      // Patrol bounds
      if (e.x <= e.patrolLeft || e.x + e.w >= e.patrolRight) {
        e.vx = -e.vx;
      }

      // Collision with player
      if (gameState.invulnTimer <= 0 && !gameState.wordPromptActive) {
        if (player.x + player.w > e.x && player.x < e.x + e.w &&
            player.y + player.h > e.y && player.y < e.y + e.h) {
          // Player jumping on top = kill enemy
          if (player.vy > 0 && player.y + player.h < e.y + e.h * 0.5) {
            e.dead = true;
            player.vy = JUMP_FORCE * 0.6;
            gameState.score += 50;
            playSound('enemyDefeat');
            spawnParticles(e.x + e.w / 2, e.y + e.h / 2, 8, '#ff6b6b');
          } else {
            damagePlayer();
          }
        }
      }
    }
  }

  function updateTriggers() {
    for (var i = 0; i < triggers.length; i++) {
      var t = triggers[i];
      if (t.triggered) continue;
      if (player.x + player.w > t.x && player.x < t.x + t.w &&
          player.y + player.h > t.y && player.y < t.y + t.h) {
        t.triggered = true;
        startWordChallenge();
      }
    }
  }

  function updateCheckpoints() {
    for (var i = 0; i < checkpoints.length; i++) {
      var c = checkpoints[i];
      if (!c.active && Math.abs(player.x - c.x) < 30 && Math.abs(player.y - (c.y - player.h)) < 40) {
        c.active = true;
        gameState.checkpoint = { x: c.x, y: c.y - player.h - 4 };
        playSound('checkpoint');
        spawnParticles(c.x, c.y, 12, '#4ecdc4');
      }
    }
  }

  // ==================== SPELLING MECHANICS ====================
  function startWordChallenge() {
    var wordObj = nextWord();
    gameState.currentWord = wordObj;
    gameState.currentLetterIdx = 0;
    gameState.wordPromptActive = true;
    gameState.wordChoices = generateLetterChoices(wordObj.w, 0);
  }

  function generateLetterChoices(word, idx) {
    if (idx >= word.length) return [];
    var correct = word[idx];
    var choices = [correct];
    var alphabet = 'abcdefghijklmnopqrstuvwxyz';
    while (choices.length < 4) {
      var c = alphabet[Math.floor(Math.random() * 26)];
      if (choices.indexOf(c) === -1) choices.push(c);
    }
    return shuffle(choices);
  }

  function selectLetter(letter) {
    if (!gameState.wordPromptActive || !gameState.currentWord) return;
    var word = gameState.currentWord.w;
    var expected = word[gameState.currentLetterIdx];

    if (letter === expected) {
      // Correct letter
      gameState.currentLetterIdx++;
      playSound('correct');
      spawnParticles(W / 2, H * 0.35, 6, '#ffd700');

      if (gameState.currentLetterIdx >= word.length) {
        // Word complete!
        gameState.wordsSpelled++;
        gameState.score += 100;
        gameState.wordPromptActive = false;
        gameState.currentWord = null;
        playSound('wordComplete');
        spawnParticles(W / 2, H * 0.3, 15, '#4ecdc4');

        // Check level complete
        if (gameState.wordsSpelled >= gameState.totalWords) {
          if (gameState.level < 3) {
            startTransition('nextLevel');
          } else {
            startTransition('boss');
          }
        }
      } else {
        gameState.wordChoices = generateLetterChoices(word, gameState.currentLetterIdx);
      }
    } else {
      // Wrong letter
      playSound('wrong');
      gameState.flashTimer = 0.3;
      gameState.flashColor = 'rgba(255,50,50,0.2)';
      damagePlayer();
    }
  }

  // ==================== BOSS FIGHT ====================
  var boss = {
    x: 0, y: 0, w: 40, h: 56,
    phase: 1, hp: 15,
    attackTimer: 0, attackPattern: 0,
    floatingWords: [],
    animTimer: 0,
    shieldAngle: 0
  };

  function initBoss() {
    gameState.stage = 'boss';
    gameState.bossHP = 15;
    gameState.bossPhase = 1;
    boss.x = W * 0.5 - boss.w / 2;
    boss.y = H * 0.25;
    boss.hp = 15;
    boss.phase = 1;
    boss.attackTimer = 2;
    boss.floatingWords = [];

    // Simple arena
    platforms = [
      { x: 0, y: H - TILE, w: W, h: TILE, type: 'ground' },
      { x: W * 0.15, y: H - TILE * 4, w: 80, h: 12, type: 'wood' },
      { x: W * 0.65, y: H - TILE * 4, w: 80, h: 12, type: 'wood' },
      { x: W * 0.35, y: H - TILE * 7, w: 100, h: 12, type: 'wood' }
    ];
    enemies = [];
    triggers = [];
    collectibles = [];
    levelWidth = W;

    player.x = W * 0.5 - player.w / 2;
    player.y = H - TILE - player.h - 4;
    player.vx = 0; player.vy = 0;
    camera.x = 0; camera.y = 0;

    // Start word challenge for boss
    startWordChallenge();
  }

  function updateBoss() {
    var t = time * 0.001;
    boss.animTimer += dt;
    boss.shieldAngle += dt * 1.5;

    // Bob up and down
    boss.y = H * 0.2 + Math.sin(t * 0.8) * 15;

    // Move side to side slowly
    boss.x = W * 0.5 - boss.w / 2 + Math.sin(t * 0.3) * W * 0.15;

    // Attack timer — spawn hazard words
    boss.attackTimer -= dt;
    if (boss.attackTimer <= 0 && boss.floatingWords.length < 4) {
      boss.attackTimer = boss.phase === 1 ? 2.5 : 1.8;
      var isMisspelled = Math.random() > 0.5;
      var wordObj = nextWord();
      var displayWord = isMisspelled ? misspell(wordObj.w) : wordObj.w;
      boss.floatingWords.push({
        x: boss.x + boss.w / 2,
        y: boss.y + boss.h,
        word: displayWord,
        correct: !isMisspelled,
        vy: 1.5 + Math.random(),
        vx: (Math.random() - 0.5) * 2,
        life: 1
      });
    }

    // Update floating words
    for (var i = boss.floatingWords.length - 1; i >= 0; i--) {
      var fw = boss.floatingWords[i];
      fw.x += fw.vx;
      fw.y += fw.vy;
      fw.life -= dt * 0.15;
      if (fw.life <= 0 || fw.y > H + 20) {
        boss.floatingWords.splice(i, 1);
        continue;
      }

      // Collision with player (when not spelling)
      if (!gameState.wordPromptActive && gameState.invulnTimer <= 0) {
        if (player.x + player.w > fw.x - 20 && player.x < fw.x + 20 &&
            player.y + player.h > fw.y - 10 && player.y < fw.y + 10) {
          boss.floatingWords.splice(i, 1);
          if (fw.correct) {
            // Touched a correctly spelled word — damages boss
            boss.hp--;
            gameState.bossHP = boss.hp;
            gameState.score += 200;
            playSound('bossHit');
            spawnParticles(fw.x, fw.y, 10, '#ffd700');
            if (boss.hp <= 10 && boss.phase === 1) {
              boss.phase = 2;
              gameState.bossPhase = 2;
            }
            if (boss.hp <= 0) {
              startTransition('win');
            }
          } else {
            // Touched misspelled word — damages player
            damagePlayer();
          }
        }
      }
    }
  }

  function misspell(word) {
    var arr = word.split('');
    var idx = Math.floor(Math.random() * arr.length);
    var alphabet = 'abcdefghijklmnopqrstuvwxyz';
    var replacement;
    do { replacement = alphabet[Math.floor(Math.random() * 26)]; } while (replacement === arr[idx]);
    arr[idx] = replacement;
    return arr.join('');
  }

  // ==================== DAMAGE & RESPAWN ====================
  function damagePlayer() {
    if (gameState.invulnTimer > 0) return;
    gameState.playerHP--;
    gameState.invulnTimer = 1.5;
    gameState.shakeTimer = 0.3;
    gameState.shakeAmount = 4;
    playSound('wrong');
    spawnParticles(player.x + player.w / 2, player.y + player.h / 2, 6, '#ff6b6b');

    if (gameState.playerHP <= 0) {
      startTransition('lose');
    }
  }

  function respawnPlayer() {
    if (gameState.checkpoint) {
      player.x = gameState.checkpoint.x;
      player.y = gameState.checkpoint.y;
    } else {
      player.x = 64;
      player.y = H - TILE - player.h - 4;
    }
    player.vx = 0;
    player.vy = 0;
  }

  // ==================== TRANSITIONS ====================
  function startTransition(target) {
    gameState.transitionTimer = 1.5;
    gameState.transitionTarget = target;
  }

  function updateTransition() {
    if (gameState.transitionTimer <= 0) return;
    gameState.transitionTimer -= dt;
    if (gameState.transitionTimer <= 0) {
      var target = gameState.transitionTarget;
      if (target === 'nextLevel') {
        gameState.level++;
        gameState.playerHP = MAX_HP;
        gameState.checkpoint = null;
        gameState.stage = 'cutscene';
        gameState.cutsceneIdx = gameState.level - 1;
        gameState.cutsceneTimer = 0;
      } else if (target === 'boss') {
        gameState.stage = 'cutscene';
        gameState.cutsceneIdx = 3; // boss intro
        gameState.cutsceneTimer = 0;
      } else if (target === 'win') {
        gameState.stage = 'win';
      } else if (target === 'lose') {
        gameState.stage = 'lose';
      } else if (target === 'startLevel') {
        gameState.stage = 'playing';
        generateLevel(gameState.level);
      } else if (target === 'startBoss') {
        initBoss();
      }
    }
  }

  // ==================== PARTICLES ====================
  function spawnParticles(x, y, count, color) {
    for (var i = 0; i < count; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        life: 1, decay: 0.02 + Math.random() * 0.02,
        size: 2 + Math.random() * 3,
        color: color
      });
    }
  }

  function updateParticles() {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life -= p.decay;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  // ==================== SOUND ====================
  function playSound(name) {
    if (window.FXSound) FXSound.play(name);
  }

  // ==================== CUTSCENES ====================
  var CUTSCENES = [
    // 0: Opening — before Level 1
    { lines: [
      'Welcome to the Word Forest!',
      'The Word Weaver has scattered\nletters across the land.',
      'Spell words correctly to\nclear the path ahead!',
      'Tap the right letters in order.\nGood luck, young speller!'
    ]},
    // 1: Before Level 2
    { lines: [
      'You cleared the forest clearing!',
      'But the mist grows thicker...',
      'Enemies now guard the path.\nDefeat them by jumping on top!',
      'Keep spelling to push forward!'
    ]},
    // 2: Before Level 3
    { lines: [
      'The dark tower looms ahead...',
      'Platforms crumble underfoot!',
      'The hardest words await.\nStay sharp, stay brave!',
      'The Word Weaver awaits at the top!'
    ]},
    // 3: Boss intro
    { lines: [
      'You\'ve reached the Word Weaver!',
      'Touch correctly spelled words\nto damage the boss!',
      'Avoid misspelled words —\nthey hurt YOU!',
      'Defeat the Word Weaver\nto save the forest!'
    ]}
  ];

  function updateCutscene() {
    gameState.cutsceneTimer += dt;
    // Auto-advance or tap to advance
    if (gameState.cutsceneTimer > 3) {
      advanceCutscene();
    }
  }

  function advanceCutscene() {
    var cs = CUTSCENES[gameState.cutsceneIdx];
    if (!cs) { startTransition('startLevel'); return; }
    gameState.cutsceneTimer = 0;

    // Track which line we're on
    if (!gameState.cutsceneLine) gameState.cutsceneLine = 0;
    gameState.cutsceneLine++;

    if (gameState.cutsceneLine >= cs.lines.length) {
      gameState.cutsceneLine = 0;
      if (gameState.cutsceneIdx === 3) {
        startTransition('startBoss');
      } else {
        startTransition('startLevel');
      }
    }
  }

  // ==================== CAMERA ====================
  function updateCamera() {
    var targetX = player.x - W * 0.35;
    var targetY = 0;
    camera.x += (targetX - camera.x) * 0.1;
    if (camera.x < 0) camera.x = 0;
    if (camera.x > levelWidth - W) camera.x = levelWidth - W;
    camera.y = targetY;
  }

  // ==================== RENDERING ====================

  function drawBackground(lvl) {
    var b = 0.8;
    var t = time * 0.001;

    if (lvl === 1) {
      // Green forest — bright sky
      var grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, 'hsl(200,55%,' + Math.round(55 * b) + '%)');
      grad.addColorStop(0.5, 'hsl(160,40%,' + Math.round(45 * b) + '%)');
      grad.addColorStop(1, 'hsl(120,35%,' + Math.round(30 * b) + '%)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else if (lvl === 2) {
      // Misty forest — blue/grey
      var grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, 'hsl(220,30%,' + Math.round(35 * b) + '%)');
      grad.addColorStop(0.5, 'hsl(200,25%,' + Math.round(30 * b) + '%)');
      grad.addColorStop(1, 'hsl(150,20%,' + Math.round(22 * b) + '%)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else {
      // Dark tower — deep purple
      var grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, 'hsl(270,35%,' + Math.round(15 * b) + '%)');
      grad.addColorStop(0.5, 'hsl(260,30%,' + Math.round(12 * b) + '%)');
      grad.addColorStop(1, 'hsl(250,25%,' + Math.round(10 * b) + '%)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    }

    // Stars (level 3 only)
    if (lvl === 3) {
      ctx.globalAlpha = 0.6;
      for (var si = 0; si < 40; si++) {
        var starX = ((si * 137 + 53) % W);
        var starY = ((si * 89 + 17) % (H * 0.5));
        var twinkle = 0.4 + Math.sin(t * 2 + si * 0.7) * 0.3;
        ctx.globalAlpha = twinkle;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(starX, starY, 1 + (si % 3) * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Distant mountains/hills silhouette
    var mountainParallax = camera.x * 0.15;
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = lvl === 1 ? '#1a6a30' : lvl === 2 ? '#1a3a4a' : '#1a0a2a';
    ctx.beginPath();
    ctx.moveTo(0, H * 0.65);
    for (var mi = 0; mi <= W; mi += 40) {
      var mh = Math.sin((mi + mountainParallax) * 0.008) * 40 + Math.sin((mi + mountainParallax) * 0.015) * 20;
      ctx.lineTo(mi, H * 0.55 - mh);
    }
    ctx.lineTo(W, H * 0.65);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // Animated clouds
    ctx.globalAlpha = lvl === 3 ? 0.08 : 0.15;
    for (var ci = 0; ci < 5; ci++) {
      var cloudX = ((ci * 200 + t * (12 + ci * 3)) % (W + 200)) - 100;
      var cloudY = 30 + ci * 25;
      ctx.fillStyle = lvl === 3 ? '#554488' : '#fff';
      ctx.beginPath();
      ctx.arc(cloudX, cloudY, 18, 0, Math.PI * 2);
      ctx.arc(cloudX + 20, cloudY - 5, 22, 0, Math.PI * 2);
      ctx.arc(cloudX + 40, cloudY, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Parallax trees (background layer)
    var parallax = camera.x * 0.3;
    ctx.globalAlpha = 0.25;
    for (var i = 0; i < decorations.length; i++) {
      var d = decorations[i];
      if (d.layer !== 0) continue;
      var dx = d.x - parallax - camera.x;
      if (dx < -50 || dx > W + 50) continue;
      if (d.type === 'tree') {
        ctx.fillStyle = lvl === 1 ? '#1a5a20' : lvl === 2 ? '#2a4a3a' : '#2a1a3a';
        // Trunk
        ctx.fillRect(dx - 3, d.y - 12 * d.size, 6, 14 * d.size);
        // Canopy — layered circles
        ctx.beginPath();
        ctx.arc(dx, d.y - 20 * d.size, 15 * d.size, 0, Math.PI * 2);
        ctx.arc(dx - 8 * d.size, d.y - 16 * d.size, 10 * d.size, 0, Math.PI * 2);
        ctx.arc(dx + 8 * d.size, d.y - 16 * d.size, 10 * d.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawPlatforms() {
    for (var i = 0; i < platforms.length; i++) {
      var p = platforms[i];
      if (p.type === 'crumble' && p.crumbleTimer > 30) continue;

      var px = p.x - camera.x;
      var py = p.y - camera.y;
      if (px > W + 20 || px + p.w < -20) continue;

      if (p.type === 'ground') {
        ctx.fillStyle = gameState.level === 1 ? '#4a8a30' : gameState.level === 2 ? '#3a5a4a' : '#3a2a4a';
        ctx.fillRect(px, py, p.w, p.h);
        // Grass top strip
        ctx.fillStyle = gameState.level === 1 ? '#5aa040' : gameState.level === 2 ? '#4a6a5a' : '#4a3a5a';
        ctx.fillRect(px, py, p.w, 4);
        // Grass tufts
        ctx.fillStyle = gameState.level === 1 ? '#6ab850' : gameState.level === 2 ? '#5a7a6a' : '#5a4a6a';
        var visibleLeft = Math.max(0, Math.floor(-px / 18));
        var visibleRight = Math.min(Math.ceil(p.w / 18), Math.ceil((W - px) / 18));
        for (var g = visibleLeft; g < visibleRight; g++) {
          var gx = px + g * 18 + ((g * 7) % 5);
          ctx.beginPath();
          ctx.moveTo(gx, py);
          ctx.lineTo(gx + 2, py - 4 - (g % 3));
          ctx.lineTo(gx + 4, py);
          ctx.fill();
          ctx.beginPath();
          ctx.moveTo(gx + 7, py);
          ctx.lineTo(gx + 9, py - 3 - (g % 2));
          ctx.lineTo(gx + 11, py);
          ctx.fill();
        }
        // Occasional flowers/mushrooms on ground
        for (var fi = visibleLeft; fi < visibleRight; fi += 4) {
          var fx = px + fi * 18 + 10;
          if ((fi * 13) % 7 < 2) {
            // Small flower
            ctx.fillStyle = (fi % 2 === 0) ? '#ff6b9d' : '#ffd700';
            ctx.beginPath();
            ctx.arc(fx, py - 3, 2.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = gameState.level === 1 ? '#3a7a20' : '#3a5a4a';
            ctx.fillRect(fx - 0.5, py - 2, 1, 3);
          } else if ((fi * 13) % 7 === 3) {
            // Small mushroom
            ctx.fillStyle = '#cc4444';
            ctx.beginPath();
            ctx.arc(fx, py - 4, 3, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = '#ddc8a0';
            ctx.fillRect(fx - 1, py - 4, 2, 4);
            // Mushroom dots
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(fx - 1, py - 5, 0.8, 0, Math.PI * 2);
            ctx.arc(fx + 1.5, py - 5.5, 0.6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else {
        var alpha = p.type === 'crumble' && p.crumbleTimer > 0 ? Math.max(0, 1 - p.crumbleTimer / 30) : 1;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.type === 'moving' ? '#6a9aff' : p.type === 'crumble' ? '#c4a060' : '#8a6a40';
        ctx.fillRect(px, py, p.w, p.h);
        // Highlight strip
        ctx.fillStyle = p.type === 'moving' ? '#8ab4ff' : p.type === 'crumble' ? '#d4b070' : '#9a7a50';
        ctx.fillRect(px, py, p.w, 3);
        // Wood grain lines for wood platforms
        if (p.type === 'wood') {
          ctx.strokeStyle = 'rgba(0,0,0,0.15)';
          ctx.lineWidth = 0.5;
          for (var wg = 0; wg < p.w; wg += 12) {
            ctx.beginPath();
            ctx.moveTo(px + wg, py + 4);
            ctx.bezierCurveTo(px + wg + 3, py + 3, px + wg + 6, py + 7, px + wg + 10, py + 5);
            ctx.stroke();
          }
          // Wood end caps
          ctx.fillStyle = 'rgba(0,0,0,0.1)';
          ctx.fillRect(px, py, 3, p.h);
          ctx.fillRect(px + p.w - 3, py, 3, p.h);
        }
        // Moving platform glow
        if (p.type === 'moving') {
          ctx.strokeStyle = 'rgba(106,154,255,0.4)';
          ctx.lineWidth = 1;
          ctx.strokeRect(px - 1, py - 1, p.w + 2, p.h + 2);
        }
        // Crumble cracks
        if (p.type === 'crumble' && p.crumbleTimer > 0) {
          ctx.strokeStyle = 'rgba(0,0,0,0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px + p.w * 0.3, py);
          ctx.lineTo(px + p.w * 0.35, py + p.h);
          ctx.moveTo(px + p.w * 0.7, py);
          ctx.lineTo(px + p.w * 0.65, py + p.h);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }
    }
  }

  function drawPlayer() {
    var px = player.x - camera.x;
    var py = player.y - camera.y;

    // Invulnerability blink
    if (gameState.invulnTimer > 0 && Math.floor(gameState.invulnTimer * 10) % 2 === 0) return;

    // Footstep trail particles when moving on ground
    if (player.onGround && Math.abs(player.vx) > 0.5 && Math.floor(time * 0.05) % 3 === 0) {
      particles.push({
        x: player.x + player.w / 2, y: player.y + player.h,
        vx: (Math.random() - 0.5) * 0.5, vy: -Math.random() * 0.5,
        life: 0.5, decay: 0.03, size: 2 + Math.random(), color: 'rgba(78,205,196,0.4)'
      });
    }

    ctx.save();
    ctx.translate(px + player.w / 2, py + player.h / 2);
    if (!player.facingRight) ctx.scale(-1, 1);

    // Squash/stretch on jump
    var scaleX = 1, scaleY = 1;
    if (!player.onGround) {
      if (player.vy < -3) { scaleX = 0.85; scaleY = 1.15; }  // stretching up
      else if (player.vy > 3) { scaleX = 1.1; scaleY = 0.9; } // squashing down
    }
    ctx.scale(scaleX, scaleY);

    // Leaf cape/wings (behind body)
    var t = time * 0.001;
    var capeWave = Math.sin(t * 3) * 3;
    ctx.fillStyle = '#2a8a50';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.moveTo(-3, -player.h / 2 + 10);
    ctx.quadraticCurveTo(-14 - capeWave, 0, -10 - capeWave, player.h / 2 - 6);
    ctx.lineTo(-3, player.h / 2 - 8);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 1;

    // Body (rounded)
    ctx.fillStyle = '#4ecdc4';
    ctx.beginPath();
    ctx.ellipse(0, 2, player.w / 2, player.h / 2 - 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly highlight
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.beginPath();
    ctx.ellipse(1, 4, player.w / 2 - 4, player.h / 2 - 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#45b7d1';
    ctx.beginPath();
    ctx.arc(0, -player.h / 2 + 6, 10, 0, Math.PI * 2);
    ctx.fill();

    // Pointed ears
    ctx.fillStyle = '#45b7d1';
    ctx.beginPath();
    ctx.moveTo(-7, -player.h / 2 + 0);
    ctx.lineTo(-11, -player.h / 2 - 6);
    ctx.lineTo(-3, -player.h / 2 + 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(7, -player.h / 2 + 0);
    ctx.lineTo(11, -player.h / 2 - 6);
    ctx.lineTo(3, -player.h / 2 + 2);
    ctx.fill();
    // Inner ear
    ctx.fillStyle = '#ff9aa2';
    ctx.beginPath();
    ctx.moveTo(-7, -player.h / 2 + 1);
    ctx.lineTo(-9, -player.h / 2 - 3);
    ctx.lineTo(-4, -player.h / 2 + 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(7, -player.h / 2 + 1);
    ctx.lineTo(9, -player.h / 2 - 3);
    ctx.lineTo(4, -player.h / 2 + 2);
    ctx.fill();

    // Eyes (larger, expressive)
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(4, -player.h / 2 + 5, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-2, -player.h / 2 + 5, 2.5, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    // Pupils
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(5, -player.h / 2 + 5, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-1, -player.h / 2 + 5, 1.3, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(5.5, -player.h / 2 + 4, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#2a6a6a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(3, -player.h / 2 + 8, 4, 0.1, Math.PI - 0.1);
    ctx.stroke();

    // Legs (animated, rounder)
    var legOffset = player.onGround ? Math.sin(player.animFrame * Math.PI / 2) * 4 : 2;
    ctx.fillStyle = '#3a9a8a';
    ctx.beginPath();
    ctx.ellipse(-4, player.h / 2 - 2 + legOffset * 0.5, 3, 4 + legOffset * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(4, player.h / 2 - 2 - legOffset * 0.5, 3, 4 - legOffset * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawEnemies() {
    for (var i = 0; i < enemies.length; i++) {
      var e = enemies[i];
      if (e.dead) continue;
      var ex = e.x - camera.x;
      var ey = e.y - camera.y;
      if (ex < -30 || ex > W + 30) continue;

      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(ex, ey, e.w, e.h);
      // Eyes
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ex + 7, ey + 8, 3, 0, Math.PI * 2);
      ctx.arc(ex + e.w - 7, ey + 8, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(ex + 8, ey + 8, 1.5, 0, Math.PI * 2);
      ctx.arc(ex + e.w - 6, ey + 8, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawCheckpoints() {
    for (var i = 0; i < checkpoints.length; i++) {
      var c = checkpoints[i];
      var cx = c.x - camera.x;
      var cy = c.y - camera.y;
      if (cx < -20 || cx > W + 20) continue;

      ctx.fillStyle = c.active ? '#4ecdc4' : '#888';
      ctx.fillRect(cx - 2, cy - 20, 4, 25);
      // Flag
      ctx.fillStyle = c.active ? '#ffd700' : '#aaa';
      ctx.beginPath();
      ctx.moveTo(cx + 2, cy - 20);
      ctx.lineTo(cx + 14, cy - 14);
      ctx.lineTo(cx + 2, cy - 8);
      ctx.fill();
    }
  }

  function drawBoss() {
    if (gameState.stage !== 'boss') return;
    var t = time * 0.001;

    // Boss body
    ctx.save();
    ctx.translate(boss.x + boss.w / 2, boss.y + boss.h / 2);

    // Glow
    ctx.globalAlpha = 0.15;
    var glowR = 50 + Math.sin(t * 2) * 10;
    var gg = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR);
    gg.addColorStop(0, boss.phase === 2 ? 'rgba(255,50,50,0.4)' : 'rgba(160,50,255,0.4)');
    gg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gg;
    ctx.beginPath(); ctx.arc(0, 0, glowR, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    // Robe
    ctx.fillStyle = boss.phase === 2 ? '#8a1a1a' : '#3a1a5a';
    ctx.beginPath();
    ctx.moveTo(-boss.w / 2, -boss.h / 4);
    ctx.lineTo(boss.w / 2, -boss.h / 4);
    ctx.lineTo(boss.w / 2 + 5, boss.h / 2);
    ctx.lineTo(-boss.w / 2 - 5, boss.h / 2);
    ctx.closePath();
    ctx.fill();

    // Head
    ctx.fillStyle = boss.phase === 2 ? '#cc3030' : '#6a3a8a';
    ctx.beginPath();
    ctx.arc(0, -boss.h / 3, 16, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(-5, -boss.h / 3 - 2, 3, 0, Math.PI * 2);
    ctx.arc(5, -boss.h / 3 - 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Orbiting letters
    for (var i = 0; i < 6; i++) {
      var angle = boss.shieldAngle + (i / 6) * Math.PI * 2;
      var ox = Math.cos(angle) * 35;
      var oy = Math.sin(angle) * 20;
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = '#ffd700';
      ctx.font = '12px "Fredoka One",cursive';
      ctx.textAlign = 'center';
      ctx.fillText(String.fromCharCode(65 + Math.floor(Math.random() * 26)), ox, oy);
    }
    ctx.globalAlpha = 1;

    ctx.restore();

    // Floating words
    for (var i = 0; i < boss.floatingWords.length; i++) {
      var fw = boss.floatingWords[i];
      ctx.globalAlpha = fw.life;
      ctx.fillStyle = fw.correct ? '#4ecdc4' : '#e74c3c';
      ctx.font = 'bold 14px "Fredoka One",cursive';
      ctx.textAlign = 'center';
      ctx.fillText(fw.word, fw.x, fw.y);
      // Border
      ctx.strokeStyle = fw.correct ? '#2a9a8a' : '#c0392b';
      ctx.lineWidth = 1;
      ctx.strokeText(fw.word, fw.x, fw.y);
    }
    ctx.globalAlpha = 1;
  }

  function drawParticles() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x - (gameState.stage === 'boss' ? 0 : camera.x), p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawTriggerGates() {
    var t = time * 0.001;
    for (var i = 0; i < triggers.length; i++) {
      var tr = triggers[i];
      if (tr.triggered) continue;
      var tx = tr.x - camera.x;
      var ty = tr.y - camera.y;
      if (tx < -40 || tx > W + 40) continue;

      // Glowing portal
      var pulse = 0.6 + Math.sin(t * 3 + i) * 0.3;
      ctx.globalAlpha = pulse * 0.3;
      var glow = ctx.createRadialGradient(tx + tr.w / 2, ty + tr.h / 2, 5, tx + tr.w / 2, ty + tr.h / 2, 40);
      glow.addColorStop(0, 'rgba(78,205,196,0.5)');
      glow.addColorStop(1, 'rgba(78,205,196,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(tx - 20, ty - 10, tr.w + 40, tr.h + 20);

      // Portal frame
      ctx.globalAlpha = pulse * 0.7;
      ctx.strokeStyle = '#4ecdc4';
      ctx.lineWidth = 3;
      ctx.strokeRect(tx, ty, tr.w, tr.h);

      // Inner shimmer
      ctx.fillStyle = 'rgba(78,205,196,' + (pulse * 0.15) + ')';
      ctx.fillRect(tx + 2, ty + 2, tr.w - 4, tr.h - 4);

      // Sparkle particles inside portal
      for (var sp = 0; sp < 3; sp++) {
        var sparkY = ty + tr.h * (0.2 + (Math.sin(t * 2 + sp * 2 + i) + 1) * 0.3);
        var sparkX = tx + tr.w * 0.3 + Math.sin(t * 3 + sp * 1.5) * tr.w * 0.2;
        ctx.globalAlpha = pulse * 0.5;
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // "SPELL!" label
      ctx.globalAlpha = pulse;
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 11px "Fredoka One",cursive';
      ctx.textAlign = 'center';
      ctx.fillText('SPELL!', tx + tr.w / 2, ty - 8);

      // Arrow pointing down
      ctx.beginPath();
      ctx.moveTo(tx + tr.w / 2 - 5, ty - 3);
      ctx.lineTo(tx + tr.w / 2 + 5, ty - 3);
      ctx.lineTo(tx + tr.w / 2, ty + 3);
      ctx.fill();
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }
  }

  function drawDirectionArrow() {
    // Find next untriggered gate
    var nextGate = null;
    for (var i = 0; i < triggers.length; i++) {
      if (!triggers[i].triggered) { nextGate = triggers[i]; break; }
    }
    if (!nextGate) return;

    var t = time * 0.001;
    var arrowX, arrowDir;
    var gateScreenX = nextGate.x + nextGate.w / 2 - camera.x;

    if (gateScreenX > W - 30) {
      arrowX = W - 40;
      arrowDir = 1;
    } else if (gateScreenX < 30) {
      arrowX = 40;
      arrowDir = -1;
    } else {
      return; // gate is on screen, no arrow needed
    }

    var bob = Math.sin(t * 4) * 3;
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    if (arrowDir > 0) {
      ctx.moveTo(arrowX + bob, H * 0.5 - 10);
      ctx.lineTo(arrowX + 15 + bob, H * 0.5);
      ctx.lineTo(arrowX + bob, H * 0.5 + 10);
    } else {
      ctx.moveTo(arrowX - bob, H * 0.5 - 10);
      ctx.lineTo(arrowX - 15 - bob, H * 0.5);
      ctx.lineTo(arrowX - bob, H * 0.5 + 10);
    }
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawTutorial() {
    if (gameState.stage !== 'playing') return;
    var elapsed = (time - levelStartTime) * 0.001;
    if (elapsed > 8) return;
    var alpha = elapsed < 6 ? 0.8 : (8 - elapsed) / 2;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(W * 0.1, H * 0.02, W * 0.8, 28);
    ctx.fillStyle = '#fff';
    ctx.font = '12px "Fredoka One",cursive';
    ctx.textAlign = 'center';
    ctx.fillText('Walk to the glowing portals \u2192 Spell words to progress!', W / 2, H * 0.02 + 18);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  function drawHUD() {
    // HP hearts
    for (var i = 0; i < MAX_HP; i++) {
      ctx.fillStyle = i < gameState.playerHP ? '#e74c3c' : '#444';
      ctx.font = '20px serif';
      ctx.fillText(i < gameState.playerHP ? '\u2764' : '\u2661', 12 + i * 24, 28);
    }

    // Score
    ctx.fillStyle = '#fff';
    ctx.font = '14px "Fredoka One",cursive';
    ctx.textAlign = 'right';
    ctx.fillText('Score: ' + gameState.score, W - 12, 24);
    ctx.textAlign = 'left';

    // Word progress
    if (gameState.stage === 'playing') {
      ctx.fillStyle = '#ffd700';
      ctx.font = '12px "Fredoka One",cursive';
      ctx.fillText('Words: ' + gameState.wordsSpelled + '/' + gameState.totalWords, 12, 48);
    }

    // Boss HP bar
    if (gameState.stage === 'boss') {
      var barW = W * 0.6;
      var barX = (W - barW) / 2;
      ctx.fillStyle = '#333';
      ctx.fillRect(barX, 8, barW, 12);
      ctx.fillStyle = boss.phase === 2 ? '#e74c3c' : '#9b59b6';
      ctx.fillRect(barX, 8, barW * (boss.hp / 15), 12);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, 8, barW, 12);
      ctx.fillStyle = '#fff';
      ctx.font = '10px "Fredoka One",cursive';
      ctx.textAlign = 'center';
      ctx.fillText('WORD WEAVER', W / 2, 18);
      ctx.textAlign = 'left';
    }
  }

  function drawWordPrompt() {
    if (!gameState.wordPromptActive || !gameState.currentWord) return;

    var word = gameState.currentWord.w;
    var hint = gameState.currentWord.h;
    var idx = gameState.currentLetterIdx;

    // Overlay
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, H * 0.2, W, H * 0.35);

    // Hint
    ctx.fillStyle = '#ffd700';
    ctx.font = '14px "Fredoka One",cursive';
    ctx.textAlign = 'center';
    ctx.fillText(hint, W / 2, H * 0.28);

    // Word progress
    var wordY = H * 0.35;
    ctx.font = 'bold 28px "Fredoka One",cursive';
    for (var i = 0; i < word.length; i++) {
      var lx = W / 2 - (word.length * 18) / 2 + i * 18 + 9;
      if (i < idx) {
        ctx.fillStyle = '#4ecdc4';
        ctx.fillText(word[i].toUpperCase(), lx, wordY);
      } else {
        ctx.fillStyle = '#666';
        ctx.fillText('_', lx, wordY);
      }
    }

    // Letter choices (large buttons)
    var choiceY = H * 0.45;
    var choiceSpacing = 70;
    var startX = W / 2 - (gameState.wordChoices.length * choiceSpacing) / 2 + choiceSpacing / 2;
    ctx.font = 'bold 26px "Fredoka One",cursive';
    for (var i = 0; i < gameState.wordChoices.length; i++) {
      var cx = startX + i * choiceSpacing;
      // Button shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.arc(cx, choiceY + 2, 28, 0, Math.PI * 2);
      ctx.fill();
      // Button background
      ctx.fillStyle = '#2a5a8a';
      ctx.beginPath();
      ctx.arc(cx, choiceY, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4a8acc';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      // Letter
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(gameState.wordChoices[i].toUpperCase(), cx, choiceY);
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  function drawCutscene() {
    // Dark background
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, W, H);

    var cs = CUTSCENES[gameState.cutsceneIdx];
    if (!cs) return;

    var lineIdx = gameState.cutsceneLine || 0;
    if (lineIdx >= cs.lines.length) return;
    var text = cs.lines[lineIdx];

    // Text
    ctx.fillStyle = '#ffd700';
    ctx.font = '18px "Fredoka One",cursive';
    ctx.textAlign = 'center';

    var lines = text.split('\n');
    for (var i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], W / 2, H * 0.4 + i * 28);
    }

    // Tap to continue
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '12px "Fredoka One",cursive';
    ctx.fillText('Tap to continue', W / 2, H * 0.75);
    ctx.textAlign = 'left';
  }

  function drawTitleScreen() {
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(0, 0, W, H);

    // Simple animated background
    var t = time * 0.001;
    ctx.globalAlpha = 0.15;
    for (var i = 0; i < 20; i++) {
      var tx = (i * 50 + t * 20) % (W + 40) - 20;
      ctx.fillStyle = '#1a4a1a';
      ctx.beginPath();
      ctx.arc(tx, H * 0.7, 20, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#4ecdc4';
    ctx.font = 'bold 32px "Fredoka One",cursive';
    ctx.textAlign = 'center';
    ctx.fillText('WORD FOREST', W / 2, H * 0.3);

    ctx.fillStyle = '#ffd700';
    ctx.font = '16px "Fredoka One",cursive';
    ctx.fillText('Spelling Platformer', W / 2, H * 0.4);

    ctx.fillStyle = '#fff';
    ctx.font = '14px "Fredoka One",cursive';
    ctx.fillText('Tap to Start!', W / 2, H * 0.6);

    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '11px "Fredoka One",cursive';
    ctx.fillText('Arrow keys to move, Up to jump', W / 2, H * 0.72);

    ctx.textAlign = 'left';
  }

  function drawWinScreen() {
    ctx.fillStyle = '#0a1a2a';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 28px "Fredoka One",cursive';
    ctx.textAlign = 'center';
    ctx.fillText('YOU WIN!', W / 2, H * 0.3);
    ctx.fillStyle = '#4ecdc4';
    ctx.font = '16px "Fredoka One",cursive';
    ctx.fillText('The Word Weaver is defeated!', W / 2, H * 0.42);
    ctx.fillText('Score: ' + gameState.score, W / 2, H * 0.55);
    ctx.fillStyle = '#fff';
    ctx.font = '14px "Fredoka One",cursive';
    ctx.fillText('Tap to play again', W / 2, H * 0.72);
    ctx.textAlign = 'left';
  }

  function drawLoseScreen() {
    ctx.fillStyle = '#1a0a0a';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#e74c3c';
    ctx.font = 'bold 28px "Fredoka One",cursive';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', W / 2, H * 0.3);
    ctx.fillStyle = '#fff';
    ctx.font = '16px "Fredoka One",cursive';
    ctx.fillText('Don\'t give up!', W / 2, H * 0.42);
    ctx.fillText('Score: ' + gameState.score, W / 2, H * 0.52);
    ctx.font = '14px "Fredoka One",cursive';
    ctx.fillText('Tap to try again', W / 2, H * 0.72);
    ctx.textAlign = 'left';
  }

  function drawFlash() {
    if (gameState.flashTimer > 0) {
      ctx.fillStyle = gameState.flashColor;
      ctx.fillRect(0, 0, W, H);
      gameState.flashTimer -= dt;
    }
  }

  function drawTransition() {
    if (gameState.transitionTimer > 0) {
      var alpha = gameState.transitionTimer > 0.75 ?
        (1.5 - gameState.transitionTimer) / 0.75 :
        gameState.transitionTimer / 0.75;
      ctx.fillStyle = 'rgba(0,0,0,' + Math.min(1, alpha) + ')';
      ctx.fillRect(0, 0, W, H);
    }
  }

  // ==================== TOUCH CONTROLS ====================
  function drawTouchControls() {
    if (gameState.stage !== 'playing' && gameState.stage !== 'boss') return;
    if (gameState.wordPromptActive) return;

    ctx.globalAlpha = 0.25;
    // Left button
    ctx.fillStyle = touchLeft ? '#4ecdc4' : '#fff';
    ctx.beginPath(); ctx.arc(50, H - 50, 28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('\u25C0', 50, H - 44);

    // Right button
    ctx.fillStyle = touchRight ? '#4ecdc4' : '#fff';
    ctx.beginPath(); ctx.arc(120, H - 50, 28, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.fillText('\u25B6', 120, H - 44);

    // Jump button
    ctx.fillStyle = touchJump ? '#4ecdc4' : '#fff';
    ctx.beginPath(); ctx.arc(W - 60, H - 50, 32, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.fillText('\u25B2', W - 60, H - 44);

    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  // ==================== MAIN LOOP ====================
  var lastTime = 0;

  function loop(t) {
    if (!running) return;
    dt = Math.min((t - lastTime) / 1000, 0.05);
    lastTime = t;
    time = t;

    // Resize
    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      W = canvas.width = canvas.clientWidth;
      H = canvas.height = canvas.clientHeight;
    }

    // Screen shake
    ctx.save();
    if (gameState.shakeTimer > 0) {
      gameState.shakeTimer -= dt;
      var sx = (Math.random() - 0.5) * gameState.shakeAmount * (gameState.shakeTimer / 0.3);
      var sy = (Math.random() - 0.5) * gameState.shakeAmount * (gameState.shakeTimer / 0.3);
      ctx.translate(sx, sy);
    }

    // Update & draw by stage
    updateTransition();

    if (gameState.stage === 'title') {
      drawTitleScreen();
    } else if (gameState.stage === 'cutscene') {
      updateCutscene();
      drawCutscene();
    } else if (gameState.stage === 'playing') {
      updatePlayer();
      updateMovingPlatforms();
      updateEnemies();
      updateTriggers();
      updateCheckpoints();
      updateCamera();
      updateParticles();

      drawBackground(gameState.level);
      drawPlatforms();
      drawTriggerGates();
      drawCheckpoints();
      drawEnemies();
      drawPlayer();
      drawParticles();
      drawHUD();
      drawTutorial();
      drawDirectionArrow();
      drawWordPrompt();
      drawTouchControls();
      drawFlash();
    } else if (gameState.stage === 'boss') {
      updatePlayer();
      updateBoss();
      updateParticles();

      drawBackground(3);
      drawPlatforms();
      drawBoss();
      drawPlayer();
      drawParticles();
      drawHUD();
      drawWordPrompt();
      drawTouchControls();
      drawFlash();
    } else if (gameState.stage === 'win') {
      drawWinScreen();
    } else if (gameState.stage === 'lose') {
      drawLoseScreen();
    }

    drawTransition();
    ctx.restore();

    animId = requestAnimationFrame(loop);
  }

  // ==================== INPUT ====================
  function handleKeyDown(e) {
    keys[e.key] = true;
    // Letter selection during word prompt
    if (gameState.wordPromptActive && /^[a-z]$/i.test(e.key)) {
      selectLetter(e.key.toLowerCase());
    }
  }

  function handleKeyUp(e) {
    keys[e.key] = false;
  }

  function handleTap(e) {
    var rect = canvas.getBoundingClientRect();
    var touches = e.changedTouches || [{ clientX: e.clientX, clientY: e.clientY }];

    for (var i = 0; i < touches.length; i++) {
      var tx = touches[i].clientX - rect.left;
      var ty = touches[i].clientY - rect.top;

      if (gameState.stage === 'title') {
        gameState.stage = 'cutscene';
        gameState.cutsceneIdx = 0;
        gameState.cutsceneLine = 0;
        gameState.cutsceneTimer = 0;
        gameState.level = 1;
        gameState.playerHP = MAX_HP;
        gameState.score = 0;
        return;
      }

      if (gameState.stage === 'cutscene') {
        advanceCutscene();
        return;
      }

      if (gameState.stage === 'win' || gameState.stage === 'lose') {
        gameState.stage = 'title';
        return;
      }

      // Word prompt letter selection
      if (gameState.wordPromptActive) {
        var choiceY = H * 0.45;
        var choiceSpacing = 70;
        var startX = W / 2 - (gameState.wordChoices.length * choiceSpacing) / 2 + choiceSpacing / 2;
        for (var c = 0; c < gameState.wordChoices.length; c++) {
          var cx = startX + c * choiceSpacing;
          var dist = Math.sqrt((tx - cx) * (tx - cx) + (ty - choiceY) * (ty - choiceY));
          if (dist < 32) {
            selectLetter(gameState.wordChoices[c]);
            return;
          }
        }
        return;
      }
    }
  }

  function updateTouchButtons(touches) {
    var rect = canvas.getBoundingClientRect();
    touchLeft = false; touchRight = false; touchJump = false;
    for (var i = 0; i < touches.length; i++) {
      var tx = touches[i].clientX - rect.left;
      var ty = touches[i].clientY - rect.top;
      if (ty > H - 90) {
        if (tx < 80) touchLeft = true;
        else if (tx < 150) touchRight = true;
        else if (tx > W - 95) touchJump = true;
      }
    }
  }

  function handleTouchStart(e) {
    e.preventDefault();
    updateTouchButtons(e.touches);
    handleTap(e);
  }

  function handleTouchMove(e) {
    e.preventDefault();
    updateTouchButtons(e.touches);
  }

  function handleTouchEnd(e) {
    e.preventDefault();
    updateTouchButtons(e.touches);
  }

  // ==================== PUBLIC API ====================
  function init(canvasEl) {
    canvas = canvasEl;
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    W = canvas.width = canvas.clientWidth || 600;
    H = canvas.height = canvas.clientHeight || 400;
  }

  function start() {
    if (!canvas || running) return;
    running = true;
    gameState.stage = 'title';
    lastTime = performance.now();

    // Event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('click', handleTap);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    canvas.style.pointerEvents = 'auto';
    animId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    animId = null;
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('keyup', handleKeyUp);
    canvas.removeEventListener('click', handleTap);
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchmove', handleTouchMove);
    canvas.removeEventListener('touchend', handleTouchEnd);
    canvas.style.pointerEvents = 'none';
  }

  window.ClassmatesSpellingPlatformer = {
    init: init,
    start: start,
    stop: stop
  };
})();
