(function(){
  // ============================================================
  // WORD FOREST PLATFORMER — TICK 8: Final polish — pause, stars, save, back button
  // Mario/Sonic quality platformer with spelling integration.
  // Tile-based levels, proper physics, hand-crafted maps.
  // For the kids of South Lodge Primary, Invergordon
  // ============================================================

  // ==================== CONSTANTS ====================
  var T = 32;                   // Tile size in pixels
  var ACCEL = 0.6;              // Horizontal acceleration
  var DECEL = 0.85;             // Friction multiplier when no input
  var MAX_SPEED = 4.5;          // Max horizontal speed
  var RUN_SPEED = 6;            // Max speed when running
  var GRAVITY = 0.55;           // Gravity per frame
  var JUMP_FORCE = -10.5;       // Initial jump velocity
  var JUMP_CUT = -3;            // Velocity set when releasing jump early
  var MAX_FALL = 10;            // Terminal velocity
  var COYOTE_FRAMES = 6;        // Grace frames after leaving edge
  var JUMP_BUFFER = 6;          // Buffer frames for early jump press
  var MAX_HP = 3;
  var INVULN_TIME = 1.5;

  // ==================== TILE TYPES ====================
  // . = air, G = ground, B = brick, ? = question block, S = spring
  // P = one-way platform, X = spike, C = coin, E = enemy spawn
  // W = spell gate, F = finish flag, M = moving platform marker
  // K = crumble platform, H = hidden block, D = decoration
  // 1-4 = enemy type spawns (1=walker, 2=shell, 3=flyer, 4=shooter)

  var SOLID_TILES = { G: 1, B: 1, '?': 1, H: 1 };
  var ONEWAY_TILES = { P: 1, K: 1 };
  var HURT_TILES = { X: 1 };

  // ==================== STATE ====================
  var canvas, ctx, animId, running = false;
  var W = 0, H = 0, time = 0, dt = 0, frames = 0;
  var keys = {};
  var touchL = false, touchR = false, touchJ = false, touchActive = false;

  var stage = 'title'; // title, cutscene, playing, boss, win, lose, paused
  var level = 1;
  var score = 0;
  var coins = 0;
  var levelTime = 0;
  var levelStartTime = 0;
  var cutsceneIdx = 0;
  var cutsceneLine = 0;
  var cutsceneTimer = 0;
  var transTimer = 0;
  var transTarget = '';
  var flashTimer = 0;
  var flashColor = '';
  var shakeTimer = 0;
  var shakeAmt = 0;

  // ==================== PLAYER ====================
  var P = {
    x: 0, y: 0, vx: 0, vy: 0,
    w: 14, h: 24,              // Hitbox slightly smaller than tile
    hp: MAX_HP,
    onGround: false,
    coyote: 0,                 // Coyote time counter
    jumpBuffer: 0,             // Jump buffer counter
    jumpHeld: false,
    canJump: true,
    facingR: true,
    state: 'idle',             // idle, run, jump, fall, hurt
    animFrame: 0,
    animTimer: 0,
    invuln: 0,
    hasShield: false,
    hasDoubleJump: false,
    usedDoubleJump: false,
    speedBoostTimer: 0,
    dead: false,
    deathTimer: 0,
    landSquash: 0              // Squash timer on landing
  };

  // ==================== CAMERA ====================
  var cam = { x: 0, y: 0, targetX: 0, targetY: 0 };

  // ==================== WORLD ====================
  var map = [];                 // 2D array of tile chars
  var mapW = 0, mapH = 0;      // Map dimensions in tiles
  var entities = [];            // Enemies, projectiles
  var collectibles = [];        // Coins spawned from map
  var spellGates = [];          // Spell gate objects
  var particles = [];
  var springs = [];
  var questionBlocks = [];      // Track ? block state
  var crumblePlatforms = [];
  var checkpoint = null;
  var finishPos = null;
  var bgTheme = 'forest';
  var powerups = [];           // Active power-up items floating in world
  var brickDebris = [];        // Brick shatter pieces

  // ==================== GAME FEEL ====================
  var floatingTexts = [];     // Score popups, combo text
  var freezeTimer = 0;        // Freeze-frame on stomp (Mario-style hit stop)
  var comboCount = 0;         // Consecutive stomps without touching ground
  var comboTimer = 0;

  // ==================== SPELLING ====================
  var wordList = [];
  var wordQueue = [];
  var spellActive = false;
  var spellWord = null;
  var spellLetterIdx = 0;
  var spellChoices = [];
  var wordsSpelled = 0;
  var totalGates = 0;

  // ==================== BOSS ====================
  var boss = null;
  var bossArena = false;
  var celebrationTimer = 0;    // Level complete celebration
  var celebrationParticles = [];

  // ==================== LEVELS ====================
  // Level 1: Forest Clearing (Easy) — test level for Tick 1
  var LEVELS = [
    // ==========================================
    // LEVEL 1 — "Forest Clearing" (Easy)
    // Teaches: running, jumping gaps, coins, spell gates
    // Gentle difficulty curve, wide platforms, small gaps
    // ==========================================
    {
      name: 'Forest Clearing',
      theme: 'forest',
      map: [
        //         1111111111222222222233333333334444444444555555555566666666667777777777888888888899999999990000000000
        //1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345
        '...........................................................................................................',
        '...........................................................................................................',
        '.........C.C.C...............C...............C.C...............CCC....................C.C....................',
        '.........?B?..............................................?..?.....?B?B?...................................',
        '...........................................................................................................',
        '.......................C.C........PP..PP.........C.C.C..............................................C.C.C...',
        '..................GGGGG...........E.........GGGGGGG....E.....PP..PP..PP.........C.C..C...................',
        '...........C.C.............C.C.GGGGGGGGG.............GGGGG..............C.C..GGGGGGGG.....C..C....F......',
        '..C......GGGGG...GGGGG.....................W..GGGGG..........W..GGGGG..GGGG.........W..GGGGGGG..GGGG.....',
        '..GG.............................................................S............................S.........GGG',
        'GGGGGGGGGGG...GGGGGGGGGGG...GGGGGGGGGGGGGGGGGGGGGGG...GGGGGGGGGGGGGGGG...GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
        'GGGGGGGGGGG...GGGGGGGGGGG...GGGGGGGGGGGGGGGGGGGGGGG...GGGGGGGGGGGGGGGG...GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
        'GGGGGGGGGGG...GGGGGGGGGGG...GGGGGGGGGGGGGGGGGGGGGGG...GGGGGGGGGGGGGGGG...GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG',
      ],
      words: 1
    },
    // ==========================================
    // LEVEL 2 — "Misty Cavern" (Medium)
    // Teaches: tighter jumps, more enemies, springs, ?-blocks
    // Underground theme, narrower platforms, longer gaps
    // ==========================================
    {
      name: 'Misty Cavern',
      theme: 'cave',
      map: [
        '...............................................................................................................',
        '........CCC....................C.C.....................CCC...............C.C.C.................CCC..............',
        '.......?B?B?...............................................................?..?B?...........?..?B?............',
        '.........................PP..PP.......E..........PP..PP.PP.....E...............................................',
        '..............E......GGGGG.....C.C.GGGGGGG............E.....GGGGG..C.C..............C.C.C...................',
        '..........GGGGGG...........C.C..........E....GGGGGGG.....GGGGG.........PP..PP..PP.........C.C...C.........',
        '....C.C.............GGGG...........W..GGGGG.........W..GGGGG......W..GGGGGGG......W..GGGGGG.GGGG..F.......',
        '...GGG........S.............S...................S................S...................S...............S...GGG..',
        'GGGGGGGG...GGGGGGGG...GGGGGGGG...GGGGGGGG...GGGGGGGG...GGGGGGGG...GGGGGGGG...GGGGGGGG...GGGGGGGGGGGGGGGGG',
        'GGGGGGGG...GGGGGGGG...GGGGGGGG...GGGGGGGG...GGGGGGGG...GGGGGGGG...GGGGGGGG...GGGGGGGG...GGGGGGGGGGGGGGGGG',
        'GGGGGGGG...GGGGGGGG...GGGGGGGG...GGGGGGGG...GGGGGGGG...GGGGGGGG...GGGGGGGG...GGGGGGGG...GGGGGGGGGGGGGGGGG',
      ],
      words: 2
    },
    // ==========================================
    // LEVEL 3 — "Dark Tower" (Hard)
    // Teaches: precision jumps, crumble platforms, multiple enemies
    // Vertical emphasis, smallest platforms, most gates
    // ==========================================
    {
      name: 'Dark Tower',
      theme: 'tower',
      map: [
        '.......................................................................................................................',
        '..........CCC.................C.C.C.................CCC.................C.C.C.................CCC.................C.C.....',
        '.........?B?B?...............................................?..?B?..............?B?..?..............?..?B?B?............',
        '...............3.........PP..PP.......E..3..........PP..PP.......3.E..........PP..PP......3.E..........PP..PP...........',
        '............GGGGG.....C.C.GGGGGG..GGGGG......C.C.GGGGGGG..GGGGG.....C.C.GGGGGG..GGGGG.....C.C.GGGGGG..GGGGG........',
        '........GGGG.....E........E.....GGGG...E..........E....GGGG...E........E.....GGGG...E.........E.....GGGG...E.........',
        '...C.C..........W..GGGGG.....W..GGGGG......W..GGGGG.....W..GGGGG......W..GGGGG................GGGG.GGGG..F...........',
        '..GGG.......S...........S...........S...........S...........S...........S...........S...................S.........GGG...',
        'GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGGGGGGGGGG',
        'GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGGGGGGGGGG',
        'GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGG..GGGGGGGGGGGGGGG',
      ],
      words: 3
    }
  ];

  // ==================== WORD DATA ====================
  function getWords(lvl) {
    if (window.ClassmatesSpelling && window.ClassmatesSpelling.SPELLING) {
      return window.ClassmatesSpelling.SPELLING[lvl] || [];
    }
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

  // ==================== MAP LOADING ====================
  function loadLevel(idx) {
    var lvl = LEVELS[idx - 1];
    if (!lvl) return;

    bgTheme = lvl.theme;
    map = [];
    entities = [];
    collectibles = [];
    spellGates = [];
    particles = [];
    springs = [];
    questionBlocks = [];
    crumblePlatforms = [];
    powerups = [];
    brickDebris = [];
    floatingTexts = [];
    checkpoint = null;
    finishPos = null;
    boss = null;

    var rows = lvl.map;
    mapH = rows.length;
    mapW = rows[0].length;

    for (var r = 0; r < mapH; r++) {
      map[r] = [];
      for (var c = 0; c < mapW; c++) {
        var ch = rows[r][c] || '.';
        map[r][c] = ch;

        var wx = c * T;
        var wy = r * T;

        // Spawn entities from tile markers
        if (ch === 'C') {
          collectibles.push({ x: wx + 8, y: wy + 8, w: 16, h: 16, alive: true, type: 'coin', animTimer: 0 });
          map[r][c] = '.';
        } else if (ch === 'E' || ch === '1') {
          entities.push({ x: wx, y: wy, w: 20, h: 24, vx: 1, vy: 0, type: 'walker', alive: true, animTimer: 0, facingR: true, onGround: false, startX: wx, patrolDist: T * 5 });
          map[r][c] = '.';
        } else if (ch === '2') {
          entities.push({ x: wx, y: wy, w: 20, h: 24, vx: 1, vy: 0, type: 'shell', alive: true, animTimer: 0, facingR: true, onGround: false, isShell: false, shellVx: 0, startX: wx, patrolDist: T * 4 });
          map[r][c] = '.';
        } else if (ch === '3') {
          entities.push({ x: wx, y: wy + 4, w: 20, h: 20, vx: 0.5, vy: 0, type: 'flyer', alive: true, animTimer: 0, baseY: wy, amplitude: 40, facingR: true });
          map[r][c] = '.';
        } else if (ch === '4') {
          entities.push({ x: wx, y: wy, w: 20, h: 24, vx: 0, vy: 0, type: 'shooter', alive: true, animTimer: 0, shootTimer: 2, facingR: false });
          map[r][c] = '.';
        } else if (ch === 'W') {
          spellGates.push({ x: wx, y: wy - T, w: T, h: T * 2, open: false, dissolveTimer: 0, col: c, row: r });
          map[r][c] = '.';
        } else if (ch === 'F') {
          finishPos = { x: wx, y: wy };
          map[r][c] = '.';
        } else if (ch === 'S') {
          springs.push({ x: wx, y: wy, compressed: 0 });
          map[r][c] = '.';
        } else if (ch === '?') {
          questionBlocks.push({ col: c, row: r, hit: false, bounceTimer: 0, contents: 'coin' });
        } else if (ch === 'K') {
          crumblePlatforms.push({ col: c, row: r, timer: 0, active: true });
        }
      }
    }

    totalGates = spellGates.length;
    wordsSpelled = 0;
    wordList = getWords(lvl.words);
    wordQueue = shuffle(wordList.slice());

    // Find player start — leftmost ground with air above
    P.x = T * 2;
    P.y = T * 2;
    for (var r = 0; r < mapH - 1; r++) {
      for (var c = 0; c < mapW; c++) {
        if (map[r][c] === '.' && r + 1 < mapH && map[r + 1][c] === 'G') {
          P.x = c * T + (T - P.w) / 2;
          P.y = r * T + T - P.h;
          r = mapH; // break outer
          break;
        }
      }
    }

    P.vx = 0; P.vy = 0;
    P.onGround = false;
    P.state = 'idle';
    P.dead = false;
    P.hp = MAX_HP;
    P.invuln = 0;
    P.hasShield = false;
    P.hasDoubleJump = false;
    P.usedDoubleJump = false;
    P.speedBoostTimer = 0;
    P.coyote = 0;
    P.jumpBuffer = 0;
    P.facingR = true;
    P.landSquash = 0;

    cam.x = P.x - W * 0.35;
    cam.y = 0;
    levelStartTime = time;
    coins = 0;
  }

  // ==================== TILE COLLISION ====================
  function tileAt(c, r) {
    if (r < 0 || r >= mapH || c < 0 || c >= mapW) return '.';
    return map[r][c];
  }

  function isSolid(c, r) {
    var t = tileAt(c, r);
    return !!SOLID_TILES[t];
  }

  function isOneWay(c, r) {
    var t = tileAt(c, r);
    return !!ONEWAY_TILES[t];
  }

  function isHurt(c, r) {
    return !!HURT_TILES[tileAt(c, r)];
  }

  // Resolve collisions for a moving AABB against the tile map
  // Returns adjusted position. obj needs {x, y, w, h, vx, vy}
  function moveAndCollide(obj) {
    // --- Horizontal ---
    obj.x += obj.vx;
    var left = Math.floor(obj.x / T);
    var right = Math.floor((obj.x + obj.w - 1) / T);
    var top = Math.floor(obj.y / T);
    var bot = Math.floor((obj.y + obj.h - 1) / T);

    for (var r = top; r <= bot; r++) {
      for (var c = left; c <= right; c++) {
        if (isSolid(c, r)) {
          if (obj.vx > 0) {
            obj.x = c * T - obj.w;
            obj.vx = 0;
          } else if (obj.vx < 0) {
            obj.x = (c + 1) * T;
            obj.vx = 0;
          }
        }
      }
    }

    // --- Vertical ---
    var wasAbove = obj.y + obj.h; // bottom edge before move
    obj.y += obj.vy;
    left = Math.floor(obj.x / T);
    right = Math.floor((obj.x + obj.w - 1) / T);
    top = Math.floor(obj.y / T);
    bot = Math.floor((obj.y + obj.h - 1) / T);

    obj.onGround = false;
    for (var r = top; r <= bot; r++) {
      for (var c = left; c <= right; c++) {
        if (isSolid(c, r)) {
          if (obj.vy > 0) {
            // Landing on top
            obj.y = r * T - obj.h;
            obj.vy = 0;
            obj.onGround = true;
          } else if (obj.vy < 0) {
            // Hit head on bottom of block
            obj.y = (r + 1) * T;
            obj.vy = 0;
            // Check for ? block hit
            hitBlockBelow(c, r);
          }
        }
        // One-way platforms: only block when falling and was above
        if (isOneWay(c, r) && obj.vy > 0) {
          var platTop = r * T;
          if (wasAbove <= platTop + 2 && obj.y + obj.h > platTop) {
            obj.y = platTop - obj.h;
            obj.vy = 0;
            obj.onGround = true;
          }
        }
      }
    }

    // Hurt tiles
    left = Math.floor(obj.x / T);
    right = Math.floor((obj.x + obj.w - 1) / T);
    top = Math.floor(obj.y / T);
    bot = Math.floor((obj.y + obj.h - 1) / T);
    for (var r = top; r <= bot; r++) {
      for (var c = left; c <= right; c++) {
        if (isHurt(c, r)) return 'hurt';
      }
    }

    return null;
  }

  var qBlockHitCount = 0; // Track how many ?-blocks hit to cycle power-up types

  function hitBlockBelow(c, r) {
    // === QUESTION BLOCK ===
    for (var i = 0; i < questionBlocks.length; i++) {
      var qb = questionBlocks[i];
      if (qb.col === c && qb.row === r && !qb.hit) {
        qb.hit = true;
        qb.bounceTimer = 0.3;
        map[r][c] = 'G'; // Becomes solid used block
        freezeTimer = 0.04;
        qBlockHitCount++;

        // Every 3rd ?-block gives a power-up, others give coins
        if (qBlockHitCount % 3 === 0) {
          // Spawn power-up — cycle through types
          var puTypes = ['shield', 'speed', 'doublejump'];
          var puType = puTypes[Math.floor(qBlockHitCount / 3 - 1) % puTypes.length];
          powerups.push({
            x: c * T + 4, y: (r - 1) * T,
            w: 24, h: 24, type: puType, alive: true,
            vy: -3, floatY: (r - 1) * T, emerged: false,
            animTimer: 0
          });
          playSound('powerup');
          spawnText(c * T + T / 2, (r - 2) * T, 'POWER-UP!', '#a78bfa', 14);
        } else {
          // Spawn coin with pop-up animation
          collectibles.push({
            x: c * T + 8, y: (r - 1) * T, w: 16, h: 16,
            alive: true, type: 'coin', animTimer: 0, popUp: 1
          });
          score += 10;
          coins++;
          spawnText(c * T + T / 2, (r - 1) * T - 5, '+10', '#ffd700', 12);
        }
        playSound('starCollect');
        spawnParticles(c * T + T / 2, r * T, 6, '#f1c40f', 2);
        // Bump enemies standing on top of block
        for (var j = 0; j < entities.length; j++) {
          var e = entities[j];
          if (!e.alive) continue;
          var ec = Math.floor((e.x + e.w / 2) / T);
          var er = Math.floor((e.y + e.h) / T);
          if (ec === c && er === r) {
            e.alive = false;
            score += 100;
            spawnParticles(e.x + e.w / 2, e.y, 8, '#ff6b6b', 3);
            spawnText(e.x + e.w / 2, e.y - 10, '+100', '#ff6b6b', 14);
          }
        }
        return;
      }
    }

    // === BRICK BLOCK ===
    if (tileAt(c, r) === 'B') {
      if (P.hasShield || P.speedBoostTimer > 0) {
        // Powered-up player can SHATTER bricks
        map[r][c] = '.';
        shakeTimer = 0.06;
        shakeAmt = 3;
        playSound('correct');
        // Spawn 4 debris pieces that fly outward
        for (var d = 0; d < 4; d++) {
          brickDebris.push({
            x: c * T + (d % 2) * T / 2 + 4,
            y: r * T + Math.floor(d / 2) * T / 2 + 4,
            vx: (d % 2 === 0 ? -1 : 1) * (2 + Math.random() * 2),
            vy: -4 - Math.random() * 3,
            size: 8 + Math.random() * 4,
            rot: 0, rotSpeed: (Math.random() - 0.5) * 0.3,
            life: 1
          });
        }
        // May contain a hidden coin
        if (Math.random() > 0.5) {
          collectibles.push({
            x: c * T + 8, y: (r - 1) * T, w: 16, h: 16,
            alive: true, type: 'coin', animTimer: 0, popUp: 1
          });
          score += 10;
          coins++;
          spawnText(c * T + T / 2, (r - 1) * T - 5, '+10', '#ffd700', 12);
        }
        spawnParticles(c * T + T / 2, r * T + T / 2, 10, '#b07040', 3);
      } else {
        // Non-powered: bricks just bounce
        spawnParticles(c * T + T / 2, r * T + T, 3, '#8a6a40', 2);
        // Still bump enemies on top
        for (var j = 0; j < entities.length; j++) {
          var e = entities[j];
          if (!e.alive) continue;
          var ec = Math.floor((e.x + e.w / 2) / T);
          var er = Math.floor((e.y + e.h) / T);
          if (ec === c && er === r) {
            e.alive = false;
            score += 100;
            spawnParticles(e.x + e.w / 2, e.y, 6, '#ff6b6b', 3);
            spawnText(e.x + e.w / 2, e.y - 10, '+100', '#ff6b6b', 14);
          }
        }
      }
    }
  }

  // ==================== PLAYER UPDATE ====================
  function updatePlayer() {
    if (P.dead) {
      P.deathTimer += dt;
      P.vy += GRAVITY * 0.5;
      P.y += P.vy;
      P.x += P.vx;
      P.deathSpin = (P.deathSpin || 0) + dt * 8; // Spin animation
      return;
    }

    if (spellActive) return; // Frozen during spelling

    // --- Input ---
    var inputL = keys['ArrowLeft'] || keys['a'] || keys['A'] || touchL;
    var inputR = keys['ArrowRight'] || keys['d'] || keys['D'] || touchR;
    var inputJump = keys['ArrowUp'] || keys['w'] || keys['W'] || keys[' '] || touchJ;
    var moveDir = (inputR ? 1 : 0) - (inputL ? 1 : 0);

    // --- Horizontal movement with acceleration ---
    var maxSpd = P.speedBoostTimer > 0 ? RUN_SPEED : MAX_SPEED;
    if (moveDir !== 0) {
      P.vx += moveDir * ACCEL;
      if (P.vx > maxSpd) P.vx = maxSpd;
      if (P.vx < -maxSpd) P.vx = -maxSpd;
      P.facingR = moveDir > 0;
    } else {
      P.vx *= DECEL; // Friction
      if (Math.abs(P.vx) < 0.2) P.vx = 0;
    }

    // --- Coyote time ---
    if (P.onGround) {
      P.coyote = COYOTE_FRAMES;
      P.usedDoubleJump = false;
    } else {
      if (P.coyote > 0) P.coyote--;
    }

    // --- Jump buffer ---
    if (inputJump && !P.jumpHeld) {
      P.jumpBuffer = JUMP_BUFFER;
    }
    if (P.jumpBuffer > 0) P.jumpBuffer--;

    // --- Jump ---
    if (P.jumpBuffer > 0 && P.coyote > 0) {
      P.vy = JUMP_FORCE;
      P.onGround = false;
      P.coyote = 0;
      P.jumpBuffer = 0;
      P.jumpHeld = true;
      playSound('jump');
      spawnParticles(P.x + P.w / 2, P.y + P.h, 4, '#fff', 2);
    }

    // Variable jump height — cut velocity when releasing
    if (!inputJump && P.vy < JUMP_CUT && P.jumpHeld) {
      P.vy = JUMP_CUT;
    }
    if (!inputJump) P.jumpHeld = false;

    // Double jump
    if (P.hasDoubleJump && !P.onGround && inputJump && !P.jumpHeld && !P.usedDoubleJump && P.coyote <= 0) {
      P.vy = JUMP_FORCE * 0.85;
      P.usedDoubleJump = true;
      P.jumpHeld = true;
      playSound('jump');
      spawnParticles(P.x + P.w / 2, P.y + P.h, 6, '#a78bfa', 2);
    }

    // --- Gravity ---
    P.vy += GRAVITY;
    if (P.vy > MAX_FALL) P.vy = MAX_FALL;

    // --- Move and collide ---
    var wasOnGround = P.onGround;
    var result = moveAndCollide(P);

    // Landing squash
    if (P.onGround && !wasOnGround && P.vy >= 0) {
      P.landSquash = 0.15;
      spawnParticles(P.x + P.w / 2, P.y + P.h, 3, '#ccc', 2);
    }
    if (P.landSquash > 0) P.landSquash -= dt;

    // Hurt from spikes
    if (result === 'hurt') {
      damagePlayer();
    }

    // --- Spring collision ---
    for (var i = 0; i < springs.length; i++) {
      var sp = springs[i];
      if (P.vy > 0 && P.x + P.w > sp.x && P.x < sp.x + T && P.y + P.h > sp.y && P.y + P.h < sp.y + T) {
        P.vy = JUMP_FORCE * 1.6;
        P.onGround = false;
        sp.compressed = 0.3;
        playSound('jump');
        spawnParticles(sp.x + T / 2, sp.y, 6, '#4ecdc4', 3);
      }
    }

    // --- Fell off map ---
    if (P.y > mapH * T + 100) {
      damagePlayer();
      respawnPlayer();
    }

    // --- World bounds ---
    if (P.x < 0) { P.x = 0; P.vx = 0; }
    if (P.x > mapW * T - P.w) { P.x = mapW * T - P.w; P.vx = 0; }

    // --- State ---
    if (P.invuln > 0) { P.state = 'hurt'; P.invuln -= dt; }
    else if (!P.onGround && P.vy < 0) P.state = 'jump';
    else if (!P.onGround && P.vy > 0) P.state = 'fall';
    else if (Math.abs(P.vx) > 0.5) P.state = 'run';
    else P.state = 'idle';

    // --- Animation ---
    P.animTimer += dt;
    if (P.state === 'run') {
      if (P.animTimer > 0.08) { P.animFrame = (P.animFrame + 1) % 4; P.animTimer = 0; }
    } else if (P.state === 'idle') {
      if (P.animTimer > 0.5) { P.animFrame = (P.animFrame + 1) % 2; P.animTimer = 0; }
    }

    // Speed boost timer
    if (P.speedBoostTimer > 0) P.speedBoostTimer -= dt;

    // Running dust particles
    if (P.onGround && Math.abs(P.vx) > 2 && frames % 6 === 0) {
      spawnParticles(P.x + (P.facingR ? 0 : P.w), P.y + P.h, 1, '#aa9977', 1.5);
    }

    // --- Collectibles ---
    for (var i = collectibles.length - 1; i >= 0; i--) {
      var co = collectibles[i];
      if (!co.alive) continue;
      if (co.popUp) {
        co.y -= 3;
        co.popUp -= dt * 3;
        if (co.popUp <= 0) co.alive = false;
        continue;
      }
      if (P.x + P.w > co.x && P.x < co.x + co.w && P.y + P.h > co.y && P.y < co.y + co.h) {
        co.alive = false;
        score += 10;
        coins++;
        playSound('starCollect');
        spawnParticles(co.x + co.w / 2, co.y + co.h / 2, 6, '#ffd700', 2);
        spawnText(co.x + co.w / 2, co.y - 5, '+10', '#ffd700', 12);
      }
    }

    // --- Power-up pickup ---
    for (var i = powerups.length - 1; i >= 0; i--) {
      var pu = powerups[i];
      if (!pu.alive) continue;
      // Float up from block then hover
      if (!pu.emerged) {
        pu.y += pu.vy;
        pu.vy += 0.1;
        if (pu.vy >= 0) { pu.emerged = true; pu.floatY = pu.y; }
      } else {
        pu.y = pu.floatY + Math.sin(time * 0.004 + i) * 4;
      }
      pu.animTimer += dt;
      // Pickup collision
      if (P.x + P.w > pu.x && P.x < pu.x + pu.w && P.y + P.h > pu.y && P.y < pu.y + pu.h) {
        pu.alive = false;
        freezeTimer = 0.08;
        playSound('streak');
        if (pu.type === 'shield') {
          P.hasShield = true;
          spawnText(P.x + P.w / 2, P.y - 15, 'SHIELD!', '#4ecdc4', 16);
          spawnParticles(P.x + P.w / 2, P.y + P.h / 2, 12, '#4ecdc4', 3);
        } else if (pu.type === 'speed') {
          P.speedBoostTimer = 8;
          spawnText(P.x + P.w / 2, P.y - 15, 'SPEED!', '#f1c40f', 16);
          spawnParticles(P.x + P.w / 2, P.y + P.h / 2, 12, '#f1c40f', 3);
        } else if (pu.type === 'doublejump') {
          P.hasDoubleJump = true;
          spawnText(P.x + P.w / 2, P.y - 15, 'DOUBLE JUMP!', '#a78bfa', 16);
          spawnParticles(P.x + P.w / 2, P.y + P.h / 2, 12, '#a78bfa', 3);
        }
        score += 50;
        shakeTimer = 0.1;
        shakeAmt = 3;
      }
    }

    // --- Spell gate collision ---
    for (var i = 0; i < spellGates.length; i++) {
      var gate = spellGates[i];
      if (gate.open) continue;
      if (P.x + P.w > gate.x + 4 && P.x < gate.x + gate.w - 4 && P.y + P.h > gate.y && P.y < gate.y + gate.h) {
        startSpelling();
        break;
      }
    }

    // --- Finish flag ---
    if (finishPos && P.x + P.w > finishPos.x && P.x < finishPos.x + T && P.y + P.h > finishPos.y && P.y < finishPos.y + T) {
      levelComplete();
    }
  }

  // ==================== ENEMY UPDATE ====================
  function updateEntities() {
    for (var i = entities.length - 1; i >= 0; i--) {
      var e = entities[i];
      if (!e.alive) continue;
      e.animTimer += dt;

      if (e.type === 'walker' || (e.type === 'shell' && !e.isShell)) {
        e.vy += GRAVITY;
        if (e.vy > MAX_FALL) e.vy = MAX_FALL;
        e.x += e.vx;
        e.y += e.vy;

        // Simple ground check
        var bc = Math.floor((e.x + e.w / 2) / T);
        var br = Math.floor((e.y + e.h) / T);
        if (br < mapH && isSolid(bc, br)) {
          e.y = br * T - e.h;
          e.vy = 0;
          e.onGround = true;
        } else {
          e.onGround = false;
        }

        // Wall check
        var fc = e.vx > 0 ? Math.floor((e.x + e.w) / T) : Math.floor(e.x / T);
        var fr = Math.floor((e.y + e.h / 2) / T);
        if (isSolid(fc, fr)) {
          e.vx = -e.vx;
          e.facingR = e.vx > 0;
        }

        // Edge detection — turn at ledges
        if (e.onGround) {
          var aheadC = e.vx > 0 ? Math.floor((e.x + e.w + 2) / T) : Math.floor((e.x - 2) / T);
          var belowR = Math.floor((e.y + e.h + 4) / T);
          if (!isSolid(aheadC, belowR)) {
            e.vx = -e.vx;
            e.facingR = e.vx > 0;
          }
        }
      }

      if (e.type === 'flyer') {
        e.x += e.vx;
        e.y = e.baseY + Math.sin(time * 0.003 + i * 2) * e.amplitude;
        // Reverse at bounds
        if (e.x < e.startX - 60 || e.x > e.startX + 60) {
          e.vx = -e.vx;
          e.facingR = e.vx > 0;
        }
      }

      if (e.type === 'shell' && e.isShell) {
        e.x += e.shellVx;
        // Wall bounce
        var sc = e.shellVx > 0 ? Math.floor((e.x + e.w) / T) : Math.floor(e.x / T);
        var sr = Math.floor((e.y + e.h / 2) / T);
        if (isSolid(sc, sr)) e.shellVx = -e.shellVx;
        // Kill other enemies
        for (var j = entities.length - 1; j >= 0; j--) {
          if (j === i || !entities[j].alive) continue;
          var o = entities[j];
          if (e.x + e.w > o.x && e.x < o.x + o.w && e.y + e.h > o.y && e.y < o.y + o.h) {
            o.alive = false;
            score += 100;
            spawnParticles(o.x + o.w / 2, o.y + o.h / 2, 8, '#ff6b6b', 3);
          }
        }
      }

      if (e.type === 'shooter') {
        e.shootTimer -= dt;
        e.facingR = P.x > e.x;
        if (e.shootTimer <= 0) {
          e.shootTimer = 2.5;
          var dir = e.facingR ? 1 : -1;
          entities.push({ x: e.x + (dir > 0 ? e.w : -8), y: e.y + 8, w: 8, h: 8, vx: dir * 4, vy: 0, type: 'projectile', alive: true, animTimer: 0 });
        }
      }

      if (e.type === 'projectile') {
        e.x += e.vx;
        var pc = Math.floor((e.x + e.w / 2) / T);
        var pr = Math.floor((e.y + e.h / 2) / T);
        if (isSolid(pc, pr) || e.x < cam.x - 50 || e.x > cam.x + W + 50) {
          e.alive = false;
          continue;
        }
      }

      // Player collision
      if (P.invuln <= 0 && !P.dead && !spellActive) {
        if (P.x + P.w > e.x + 2 && P.x < e.x + e.w - 2 && P.y + P.h > e.y + 2 && P.y < e.y + e.h - 2) {
          if (e.type === 'projectile') {
            damagePlayer();
            e.alive = false;
          } else if (P.vy > 0 && P.y + P.h < e.y + e.h * 0.6) {
            // === STOMP! Mario-style juice ===
            freezeTimer = 0.06; // Hit-stop freeze frame
            comboCount++;
            comboTimer = 1.5;
            var stompScore = 100 * comboCount; // Combo multiplier!

            if (e.type === 'shell' && !e.isShell) {
              e.isShell = true;
              e.shellVx = P.facingR ? 5 : -5;
              P.vy = JUMP_FORCE * 0.5;
              spawnText(e.x + e.w / 2, e.y - 10, 'SHELL!', '#f1c40f', 16);
            } else if (e.type === 'shell' && e.isShell) {
              e.shellVx = P.facingR ? 5 : -5;
              P.vy = JUMP_FORCE * 0.5;
            } else {
              e.alive = false;
              P.vy = JUMP_FORCE * 0.6;
            }
            score += stompScore;
            spawnText(e.x + e.w / 2, e.y - 5, '+' + stompScore, '#ffd700', comboCount > 1 ? 18 : 14);
            if (comboCount > 1) spawnText(e.x + e.w / 2, e.y - 25, comboCount + 'x COMBO!', '#ff6b6b', 12);
            playSound(comboCount > 2 ? 'streak' : 'correct');
            spawnParticles(e.x + e.w / 2, e.y + e.h / 2, 8 + comboCount * 2, '#ffd700', 3);
            // Screen shake scales with combo
            shakeTimer = 0.08 + comboCount * 0.02;
            shakeAmt = 2 + comboCount;
          } else {
            damagePlayer();
            comboCount = 0;
          }
        }
      }
    }

    // Clean dead
    for (var i = entities.length - 1; i >= 0; i--) {
      if (!entities[i].alive) entities.splice(i, 1);
    }
  }

  // ==================== SPELLING ====================
  function startSpelling() {
    var wordObj = nextWord();
    spellWord = wordObj;
    spellLetterIdx = 0;
    spellActive = true;
    spellChoices = makeChoices(wordObj.w, 0);
    P.vx = 0;
  }

  function makeChoices(word, idx) {
    if (idx >= word.length) return [];
    var correct = word[idx];
    var ch = [correct];
    var alpha = 'abcdefghijklmnopqrstuvwxyz';
    while (ch.length < 4) {
      var c = alpha[Math.floor(Math.random() * 26)];
      if (ch.indexOf(c) === -1) ch.push(c);
    }
    return shuffle(ch);
  }

  function pickLetter(letter) {
    if (!spellActive || !spellWord) return;
    var expected = spellWord.w[spellLetterIdx];
    if (letter === expected) {
      spellLetterIdx++;
      playSound('correct');
      spawnParticles(W / 2, H * 0.35, 6, '#ffd700', 3);
      if (spellLetterIdx >= spellWord.w.length) {
        // Word complete — open gate
        spellActive = false;
        wordsSpelled++;
        score += 200;
        playSound('streak');
        spawnText(P.x + P.w / 2, P.y - 20, '+200 WORD!', '#4ecdc4', 18);
        freezeTimer = 0.1; // Satisfying pause on word complete
        // Open the nearest closed gate
        for (var i = 0; i < spellGates.length; i++) {
          if (!spellGates[i].open) {
            spellGates[i].open = true;
            spellGates[i].dissolveTimer = 0.5;
            spawnParticles(spellGates[i].x + T / 2, spellGates[i].y + T, 20, '#4ecdc4', 4);
            break;
          }
        }
      } else {
        spellChoices = makeChoices(spellWord.w, spellLetterIdx);
      }
    } else {
      playSound('wrong');
      flashTimer = 0.2;
      flashColor = 'rgba(255,50,50,0.2)';
      damagePlayer();
    }
  }

  // ==================== DAMAGE / RESPAWN ====================
  function damagePlayer() {
    if (P.invuln > 0 || P.dead) return;
    if (P.hasShield) { P.hasShield = false; P.invuln = 0.5; return; }
    P.hp--;
    P.invuln = INVULN_TIME;
    shakeTimer = 0.25;
    shakeAmt = 5;
    playSound('wrong');
    spawnParticles(P.x + P.w / 2, P.y + P.h / 2, 8, '#ff6b6b', 3);
    if (P.hp <= 0) {
      P.dead = true;
      P.vy = JUMP_FORCE * 1.2;
      P.vx = (Math.random() - 0.5) * 3;
      P.deathTimer = 0;
      P.deathSpin = 0;
      playSound('die');
      freezeTimer = 0.3; // Long freeze on death for dramatic impact
    }
  }

  function respawnPlayer() {
    if (checkpoint) {
      P.x = checkpoint.x; P.y = checkpoint.y;
    } else {
      // Re-find start
      for (var r = 0; r < mapH - 1; r++) {
        for (var c = 0; c < mapW; c++) {
          if (map[r][c] === '.' && r + 1 < mapH && map[r + 1][c] === 'G') {
            P.x = c * T + (T - P.w) / 2;
            P.y = r * T + T - P.h;
            r = mapH; break;
          }
        }
      }
    }
    P.vx = 0; P.vy = 0;
  }

  function levelComplete() {
    // Start celebration before transitioning
    stage = 'celebration';
    celebrationTimer = 3;
    celebrationParticles = [];
    playSound('streak');
    P.vx = 0;
    // Burst of confetti
    for (var i = 0; i < 40; i++) {
      celebrationParticles.push({
        x: P.x + P.w / 2 + (Math.random() - 0.5) * 60,
        y: P.y - 20 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 8,
        vy: -Math.random() * 8 - 3,
        size: 3 + Math.random() * 4,
        color: ['#ffd700','#4ecdc4','#e74c3c','#3498db','#2ecc71','#f39c12','#a78bfa'][Math.floor(Math.random() * 7)],
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        life: 1
      });
    }
  }

  function updateCelebration() {
    if (stage !== 'celebration') return;
    celebrationTimer -= dt;
    // Update confetti particles
    for (var i = celebrationParticles.length - 1; i >= 0; i--) {
      var p = celebrationParticles[i];
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.15; p.rot += p.rotSpeed;
      p.life -= dt * 0.4;
      if (p.life <= 0) celebrationParticles.splice(i, 1);
    }
    // Spawn more confetti periodically
    if (Math.random() > 0.7) {
      celebrationParticles.push({
        x: P.x + (Math.random() - 0.5) * W * 0.5,
        y: cam.y - 10,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 2 + 1,
        size: 3 + Math.random() * 3,
        color: ['#ffd700','#4ecdc4','#e74c3c','#3498db','#2ecc71'][Math.floor(Math.random() * 5)],
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15,
        life: 1
      });
    }
    if (celebrationTimer <= 0) {
      if (level < 3) {
        startTransition('nextLevel');
      } else {
        startTransition('boss');
      }
    }
  }

  function drawCelebration() {
    // Draw the level behind the celebration
    drawBackground(); drawTiles(); drawSprings(); drawCollectibles();
    drawPowerups(); drawFinishFlag(); drawSpellGates();
    drawEnemies(); drawPlayer();
    // Confetti
    for (var i = 0; i < celebrationParticles.length; i++) {
      var p = celebrationParticles[i];
      ctx.save();
      ctx.translate(p.x - cam.x, p.y - cam.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    // Banner
    var bannerAlpha = Math.min(1, (3 - celebrationTimer) * 2);
    ctx.globalAlpha = bannerAlpha;
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, H * 0.3, W, H * 0.2);
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 28px "Fredoka One",cursive';
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL COMPLETE!', W / 2, H * 0.38);
    ctx.fillStyle = '#fff';
    ctx.font = '16px "Fredoka One",cursive';
    ctx.fillText('Score: ' + score + '  Coins: ' + coins, W / 2, H * 0.46);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  // ==================== BOSS FIGHT ====================
  function initBoss() {
    bossArena = true;
    stage = 'playing';
    bgTheme = 'tower';
    // Build a flat arena map
    var arenaW = 20;
    var arenaH = 10;
    map = [];
    mapW = arenaW; mapH = arenaH;
    for (var r = 0; r < arenaH; r++) {
      map[r] = [];
      for (var c = 0; c < arenaW; c++) {
        if (r >= arenaH - 2) map[r][c] = 'G';
        else if (r === arenaH - 5 && (c === 3 || c === 4 || c === 15 || c === 16)) map[r][c] = 'P';
        else map[r][c] = '.';
      }
    }
    // Clear level entities
    entities = []; collectibles = []; spellGates = [];
    springs = []; questionBlocks = []; crumblePlatforms = [];
    powerups = []; brickDebris = []; floatingTexts = []; particles = [];
    finishPos = null;

    // Boss object
    boss = {
      x: arenaW * T / 2 - 24, y: 2 * T,
      w: 48, h: 56, hp: 12, maxHp: 12,
      phase: 1, attackTimer: 2,
      floatingWords: [],
      shieldAngle: 0, hitFlash: 0,
      defeated: false, defeatTimer: 0
    };

    // Player in arena
    P.x = 3 * T; P.y = (arenaH - 3) * T;
    P.vx = 0; P.vy = 0; P.hp = MAX_HP;
    P.dead = false; P.invuln = 0;
    cam.x = 0; cam.y = 0;

    wordList = getWords(3);
    wordQueue = shuffle(wordList.slice());
  }

  function updateBoss() {
    if (!boss || boss.defeated) {
      if (boss && boss.defeatTimer > 0) {
        boss.defeatTimer -= dt;
        if (boss.defeatTimer <= 0) startTransition('win');
        // Explosion particles
        if (Math.random() > 0.5) {
          spawnParticles(boss.x + Math.random() * boss.w, boss.y + Math.random() * boss.h, 3, ['#ffd700','#e74c3c','#a78bfa'][Math.floor(Math.random()*3)], 4);
        }
      }
      return;
    }
    var t = time * 0.001;
    boss.shieldAngle += dt * 2;
    if (boss.hitFlash > 0) boss.hitFlash -= dt;

    // Movement — bob and strafe
    boss.y = 2 * T + Math.sin(t * 0.8) * 20;
    boss.x = mapW * T / 2 - boss.w / 2 + Math.sin(t * 0.4) * (mapW * T * 0.2);

    // Phase 2: faster + more words
    var spawnRate = boss.phase === 1 ? 2.2 : 1.4;
    var maxWords = boss.phase === 1 ? 3 : 5;

    boss.attackTimer -= dt;
    if (boss.attackTimer <= 0 && boss.floatingWords.length < maxWords) {
      boss.attackTimer = spawnRate;
      var wordObj = nextWord();
      var isMisspelled = Math.random() > 0.5;
      var display = isMisspelled ? misspell(wordObj.w) : wordObj.w;
      boss.floatingWords.push({
        x: boss.x + boss.w / 2 + (Math.random() - 0.5) * 30,
        y: boss.y + boss.h,
        word: display, correct: !isMisspelled,
        vx: (Math.random() - 0.5) * 2,
        vy: 1.2 + Math.random() * 0.8,
        life: 1, size: 16
      });
    }

    // Update floating words
    for (var i = boss.floatingWords.length - 1; i >= 0; i--) {
      var fw = boss.floatingWords[i];
      fw.x += fw.vx; fw.y += fw.vy;
      fw.life -= dt * 0.12;
      if (fw.life <= 0 || fw.y > mapH * T + 20) {
        boss.floatingWords.splice(i, 1); continue;
      }
      // Player collision
      if (P.invuln <= 0 && !P.dead) {
        if (P.x + P.w > fw.x - 25 && P.x < fw.x + 25 &&
            P.y + P.h > fw.y - 12 && P.y < fw.y + 12) {
          boss.floatingWords.splice(i, 1);
          if (fw.correct) {
            // Correct word — damage boss!
            boss.hp--;
            boss.hitFlash = 0.2;
            score += 300;
            freezeTimer = 0.08;
            shakeTimer = 0.15; shakeAmt = 5;
            playSound('streak');
            spawnParticles(fw.x, fw.y, 12, '#ffd700', 4);
            spawnText(fw.x, fw.y - 15, '-1 HP!', '#ffd700', 18);
            if (boss.hp <= 6 && boss.phase === 1) {
              boss.phase = 2;
              spawnText(boss.x + boss.w / 2, boss.y - 20, 'PHASE 2!', '#e74c3c', 22);
              shakeTimer = 0.5; shakeAmt = 8;
            }
            if (boss.hp <= 0) {
              boss.defeated = true;
              boss.defeatTimer = 2.5;
              playSound('streak');
              shakeTimer = 1; shakeAmt = 10;
              // Massive explosion
              for (var j = 0; j < 30; j++) {
                spawnParticles(boss.x + Math.random() * boss.w, boss.y + Math.random() * boss.h, 2, '#ffd700', 5);
              }
              spawnText(boss.x + boss.w / 2, boss.y - 10, 'DEFEATED!', '#ffd700', 28);
            }
          } else {
            // Misspelled word — hurts player
            damagePlayer();
            spawnText(fw.x, fw.y - 10, 'MISSPELLED!', '#e74c3c', 14);
          }
        }
      }
    }
  }

  function misspell(word) {
    var arr = word.split('');
    var idx = Math.floor(Math.random() * arr.length);
    var alpha = 'abcdefghijklmnopqrstuvwxyz';
    var rep;
    do { rep = alpha[Math.floor(Math.random() * 26)]; } while (rep === arr[idx]);
    arr[idx] = rep;
    return arr.join('');
  }

  function drawBoss() {
    if (!boss) return;
    var t = time * 0.001;
    var bx = boss.x - cam.x, by = boss.y - cam.y;

    if (boss.defeated) {
      // Exploding boss
      ctx.globalAlpha = Math.max(0, boss.defeatTimer / 2.5);
      ctx.fillStyle = '#6a3a8a';
      ctx.beginPath(); ctx.ellipse(bx + boss.w / 2, by + boss.h / 2, boss.w / 2, boss.h / 2, 0, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      return;
    }

    // Glow aura
    ctx.globalAlpha = 0.15 + (boss.phase === 2 ? 0.1 : 0);
    var glowR = 60 + Math.sin(t * 2) * 10;
    var gg = ctx.createRadialGradient(bx + boss.w / 2, by + boss.h / 2, 0, bx + boss.w / 2, by + boss.h / 2, glowR);
    gg.addColorStop(0, boss.phase === 2 ? 'rgba(255,50,50,0.4)' : 'rgba(160,50,255,0.4)');
    gg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(bx + boss.w / 2, by + boss.h / 2, glowR, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    // Hit flash
    if (boss.hitFlash > 0) { ctx.globalAlpha = 0.5 + Math.sin(boss.hitFlash * 30) * 0.5; }

    // Robe body
    ctx.fillStyle = boss.phase === 2 ? '#8a1a1a' : '#3a1a5a';
    ctx.beginPath();
    ctx.moveTo(bx + 4, by + boss.h * 0.35);
    ctx.quadraticCurveTo(bx - 4, by + boss.h, bx + boss.w / 2, by + boss.h + 5);
    ctx.quadraticCurveTo(bx + boss.w + 4, by + boss.h, bx + boss.w - 4, by + boss.h * 0.35);
    ctx.closePath(); ctx.fill();

    // Head
    ctx.fillStyle = boss.phase === 2 ? '#cc2020' : '#5a2a7a';
    ctx.beginPath(); ctx.arc(bx + boss.w / 2, by + boss.h * 0.25, 18, 0, Math.PI * 2); ctx.fill();

    // Hood
    ctx.fillStyle = boss.phase === 2 ? '#6a0a0a' : '#2a0a4a';
    ctx.beginPath();
    ctx.moveTo(bx + boss.w / 2 - 20, by + boss.h * 0.35);
    ctx.quadraticCurveTo(bx + boss.w / 2, by - 5, bx + boss.w / 2 + 20, by + boss.h * 0.35);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(bx + boss.w / 2 - 6, by + boss.h * 0.23, 3.5, 0, Math.PI * 2);
    ctx.arc(bx + boss.w / 2 + 6, by + boss.h * 0.23, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // Pupils
    ctx.fillStyle = '#1a0a0a';
    var lookDir = P.x > boss.x + boss.w / 2 ? 1 : -1;
    ctx.beginPath();
    ctx.arc(bx + boss.w / 2 - 6 + lookDir, by + boss.h * 0.23, 1.5, 0, Math.PI * 2);
    ctx.arc(bx + boss.w / 2 + 6 + lookDir, by + boss.h * 0.23, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Orbiting letter shield
    ctx.globalAlpha = 0.5;
    var orbitR = 35 + boss.phase * 5;
    for (var i = 0; i < 8; i++) {
      var angle = boss.shieldAngle + (i / 8) * Math.PI * 2;
      var ox = bx + boss.w / 2 + Math.cos(angle) * orbitR;
      var oy = by + boss.h / 2 + Math.sin(angle) * orbitR * 0.5;
      ctx.fillStyle = i % 2 === 0 ? '#ffd700' : '#a78bfa';
      ctx.font = 'bold 12px "Fredoka One",cursive';
      ctx.textAlign = 'center';
      ctx.fillText(String.fromCharCode(65 + (i * 3 + Math.floor(t)) % 26), ox, oy + 4);
    }
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;

    // Floating words
    for (var i = 0; i < boss.floatingWords.length; i++) {
      var fw = boss.floatingWords[i];
      var fwx = fw.x - cam.x, fwy = fw.y - cam.y;
      ctx.globalAlpha = fw.life;
      // Word bubble background
      var wordW = ctx.measureText ? fw.word.length * 9 : fw.word.length * 8;
      ctx.fillStyle = fw.correct ? 'rgba(78,205,196,0.3)' : 'rgba(231,76,60,0.3)';
      ctx.beginPath();
      ctx.arc(fwx, fwy, wordW / 2 + 8, 0, Math.PI * 2);
      ctx.fill();
      // Word text
      ctx.fillStyle = fw.correct ? '#4ecdc4' : '#e74c3c';
      ctx.font = 'bold ' + fw.size + 'px "Fredoka One",cursive';
      ctx.textAlign = 'center';
      ctx.fillText(fw.word, fwx, fwy + 5);
      // Border glow
      ctx.strokeStyle = fw.correct ? '#2a9a8a' : '#c0392b';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(fwx, fwy, wordW / 2 + 8, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;

    // HP bar
    var barW = boss.w * 2;
    var barX = bx + boss.w / 2 - barW / 2;
    var barY = by - 20;
    ctx.fillStyle = '#333'; ctx.fillRect(barX, barY, barW, 8);
    ctx.fillStyle = boss.phase === 2 ? '#e74c3c' : '#9b59b6';
    ctx.fillRect(barX, barY, barW * (boss.hp / boss.maxHp), 8);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.strokeRect(barX, barY, barW, 8);
    ctx.fillStyle = '#fff'; ctx.font = '8px "Fredoka One",cursive'; ctx.textAlign = 'center';
    ctx.fillText('WORD WEAVER', bx + boss.w / 2, barY - 4);
    ctx.textAlign = 'left';
  }

  // ==================== TRANSITIONS ====================
  function startTransition(target) { transTimer = 1.2; transTarget = target; }

  function updateTransition() {
    if (transTimer <= 0) return;
    transTimer -= dt;
    if (transTimer <= 0) {
      if (transTarget === 'nextLevel') {
        level++;
        bossArena = false;
        stage = 'playing';
        loadLevel(level);
      } else if (transTarget === 'boss') {
        initBoss();
      } else if (transTarget === 'win') {
        stage = 'win';
      } else if (transTarget === 'lose') {
        stage = 'lose';
      } else if (transTarget === 'startLevel') {
        stage = 'playing';
        loadLevel(level);
      }
    }
  }

  // ==================== PARTICLES ====================
  function spawnParticles(x, y, count, color, size) {
    for (var i = 0; i < count; i++) {
      particles.push({
        x: x, y: y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5 - 2,
        life: 1, decay: 0.025 + Math.random() * 0.02,
        size: (size || 2) + Math.random() * 2,
        color: color || '#fff'
      });
    }
  }

  function updateParticles() {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.12;
      p.life -= p.decay;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  // ==================== FLOATING TEXT ====================
  function spawnText(x, y, text, color, size) {
    floatingTexts.push({ x: x, y: y, text: text, color: color || '#fff', size: size || 14, life: 1, vy: -2 });
  }

  function updateFloatingTexts() {
    for (var i = floatingTexts.length - 1; i >= 0; i--) {
      var ft = floatingTexts[i];
      ft.y += ft.vy;
      ft.vy *= 0.95;
      ft.life -= dt * 1.2;
      if (ft.life <= 0) floatingTexts.splice(i, 1);
    }
  }

  function drawFloatingTexts() {
    for (var i = 0; i < floatingTexts.length; i++) {
      var ft = floatingTexts[i];
      ctx.globalAlpha = ft.life;
      ctx.fillStyle = ft.color;
      ctx.font = 'bold ' + ft.size + 'px "Fredoka One",cursive';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x - cam.x, ft.y - cam.y);
    }
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  // ==================== SOUND ====================
  // Map game actions to FXSound library names
  var SOUND_MAP = {
    jump: 'pop',
    land: 'tap',
    coin: 'starCollect',
    stomp: 'correct',
    comboStomp: 'streak',
    damage: 'wrong',
    die: 'wrongDeep',
    spring: 'whoosh',
    gateOpen: 'celebration',
    wordComplete: 'levelUp',
    letterCorrect: 'correctHigh',
    letterWrong: 'wrongGentle',
    powerup: 'streak',
    brickBreak: 'pop',
    bossHit: 'correctHigh',
    bossDefeat: 'complete',
    levelComplete: 'celebration',
    blockHit: 'click',
    checkpoint: 'correctSoft'
  };
  function playSound(name) {
    try {
      var mapped = SOUND_MAP[name] || name;
      if (window.FXSound) FXSound.play(mapped);
    } catch(e) {}
  }

  // ==================== CAMERA ====================
  function updateCamera() {
    var lookAhead = P.facingR ? W * 0.1 : -W * 0.1;
    cam.targetX = P.x - W * 0.35 + lookAhead;
    cam.targetY = P.y - H * 0.5;
    cam.x += (cam.targetX - cam.x) * 0.08;
    cam.y += (cam.targetY - cam.y) * 0.06;
    if (cam.x < 0) cam.x = 0;
    if (cam.x > mapW * T - W) cam.x = Math.max(0, mapW * T - W);
    // Clamp vertical
    if (cam.y > mapH * T - H) cam.y = mapH * T - H;
    if (cam.y < 0) cam.y = 0;
  }

  // ==================== RENDERING ====================

  function drawBackground() {
    var t = time * 0.001;

    // === LAYER 0: SKY GRADIENT ===
    var g = ctx.createLinearGradient(0, 0, 0, H);
    if (bgTheme === 'forest') {
      g.addColorStop(0, '#3a80d0'); g.addColorStop(0.35, '#6ab8e8');
      g.addColorStop(0.65, '#a8dce8'); g.addColorStop(1, '#d0ecc8');
    } else if (bgTheme === 'cave') {
      g.addColorStop(0, '#0a0a1a'); g.addColorStop(0.3, '#12182e');
      g.addColorStop(0.7, '#0f2848'); g.addColorStop(1, '#0a1830');
    } else {
      g.addColorStop(0, '#1a0840'); g.addColorStop(0.3, '#2a1060');
      g.addColorStop(0.7, '#180838'); g.addColorStop(1, '#0a0420');
    }
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // === SUN / MOON ===
    if (bgTheme === 'forest') {
      // Sun with rays
      var sunX = W * 0.78, sunY = H * 0.12;
      ctx.globalAlpha = 0.15;
      var sg = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 80);
      sg.addColorStop(0, '#fff8d0'); sg.addColorStop(0.3, 'rgba(255,240,180,0.3)'); sg.addColorStop(1, 'rgba(255,200,100,0)');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sunX, sunY, 80, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#fff8e0'; ctx.beginPath(); ctx.arc(sunX, sunY, 14, 0, Math.PI * 2); ctx.fill();
    } else if (bgTheme === 'tower') {
      // Moon
      var moonX = W * 0.2, moonY = H * 0.1;
      ctx.globalAlpha = 0.12;
      var mg = ctx.createRadialGradient(moonX, moonY, 5, moonX, moonY, 60);
      mg.addColorStop(0, '#e0e8ff'); mg.addColorStop(1, 'rgba(200,210,255,0)');
      ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(moonX, moonY, 60, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#e8ecff'; ctx.beginPath(); ctx.arc(moonX, moonY, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a0840'; ctx.beginPath(); ctx.arc(moonX + 5, moonY - 3, 10, 0, Math.PI * 2); ctx.fill();
    }

    // === STARS (cave + tower) ===
    if (bgTheme !== 'forest') {
      ctx.fillStyle = '#fff';
      for (var i = 0; i < 50; i++) {
        var sx = (i * 97 + 13) % W;
        var sy = (i * 53 + 7) % (H * 0.55);
        var twink = 0.2 + Math.sin(t * (1.5 + (i % 5) * 0.4) + i * 1.7) * 0.3;
        ctx.globalAlpha = twink;
        ctx.beginPath(); ctx.arc(sx, sy, 0.8 + (i % 4) * 0.4, 0, Math.PI * 2); ctx.fill();
      }
    }

    // === LAYER 1: FAR MOUNTAINS (parallax 0.08) ===
    ctx.globalAlpha = bgTheme === 'forest' ? 0.2 : 0.15;
    var farCol = bgTheme === 'forest' ? '#6aaa70' : bgTheme === 'cave' ? '#0a1a3a' : '#2a1050';
    var px1 = -(cam.x * 0.08);
    ctx.fillStyle = farCol;
    ctx.beginPath(); ctx.moveTo(0, H);
    for (var x = -20; x <= W + 40; x += 10) {
      var worldX = x - px1;
      var mh = 55 + Math.sin(worldX * 0.008) * 25 + Math.sin(worldX * 0.003) * 15;
      ctx.lineTo(x, H - mh);
    }
    ctx.lineTo(W + 40, H); ctx.fill();

    // === LAYER 2: MID HILLS (parallax 0.2) ===
    ctx.globalAlpha = bgTheme === 'forest' ? 0.3 : 0.2;
    var midCol = bgTheme === 'forest' ? '#3a8a40' : bgTheme === 'cave' ? '#0a1530' : '#1a0838';
    var px2 = -(cam.x * 0.2);
    ctx.fillStyle = midCol;
    ctx.beginPath(); ctx.moveTo(0, H);
    for (var x = -20; x <= W + 40; x += 8) {
      var worldX = x - px2;
      var mh = 35 + Math.sin(worldX * 0.012 + 2) * 18 + Math.sin(worldX * 0.005 + 1) * 12;
      ctx.lineTo(x, H - mh);
    }
    ctx.lineTo(W + 40, H); ctx.fill();

    // === LAYER 3: NEAR TREES/STALACTITES (parallax 0.35) ===
    ctx.globalAlpha = bgTheme === 'forest' ? 0.35 : 0.25;
    var px3 = -(cam.x * 0.35);
    if (bgTheme === 'forest') {
      // Pine tree silhouettes
      ctx.fillStyle = '#1a5a20';
      for (var i = -2; i < Math.ceil(W / 55) + 3; i++) {
        var tx = ((i * 55 + px3) % (W + 110)) - 55;
        var th = 30 + (i * 7 + 13) % 20;
        // Trunk
        ctx.fillRect(tx - 2, H - 5, 4, 8);
        // Canopy layers
        for (var l = 0; l < 3; l++) {
          var lw = (14 - l * 3) + Math.sin(i * 2.3) * 3;
          ctx.beginPath();
          ctx.moveTo(tx, H - 8 - th + l * 10);
          ctx.lineTo(tx - lw, H - 8 - th + l * 10 + 14);
          ctx.lineTo(tx + lw, H - 8 - th + l * 10 + 14);
          ctx.fill();
        }
      }
    } else if (bgTheme === 'cave') {
      // Stalactites hanging from top
      ctx.fillStyle = '#0a1528';
      for (var i = -2; i < Math.ceil(W / 40) + 3; i++) {
        var sx = ((i * 40 + px3) % (W + 80)) - 40;
        var sh = 15 + (i * 11 + 7) % 25;
        ctx.beginPath();
        ctx.moveTo(sx - 8, 0); ctx.lineTo(sx, sh); ctx.lineTo(sx + 8, 0);
        ctx.fill();
      }
      // Stalagmites from bottom
      for (var i = -2; i < Math.ceil(W / 50) + 3; i++) {
        var sx = ((i * 50 + 20 + px3) % (W + 100)) - 50;
        var sh = 10 + (i * 13 + 3) % 18;
        ctx.beginPath();
        ctx.moveTo(sx - 6, H); ctx.lineTo(sx, H - sh); ctx.lineTo(sx + 6, H);
        ctx.fill();
      }
    } else {
      // Tower: broken columns and arches
      ctx.fillStyle = '#12062a';
      for (var i = -1; i < Math.ceil(W / 70) + 2; i++) {
        var cx = ((i * 70 + px3) % (W + 140)) - 70;
        var ch = 20 + (i * 9 + 5) % 30;
        ctx.fillRect(cx - 4, H - ch, 8, ch);
        ctx.fillRect(cx - 6, H - ch, 12, 3);
      }
    }

    // === CLOUDS (forest + tower) ===
    if (bgTheme === 'forest') {
      ctx.fillStyle = '#fff';
      for (var i = 0; i < 5; i++) {
        var cx = ((t * (6 + i * 2.5) + i * 180) % (W + 250)) - 120;
        var cy = 25 + i * 22 + Math.sin(t * 0.3 + i) * 4;
        ctx.globalAlpha = 0.4 + (i % 2) * 0.15;
        ctx.beginPath();
        ctx.arc(cx, cy, 18 + i * 2, 0, Math.PI * 2);
        ctx.arc(cx + 14, cy - 6, 14 + i, 0, Math.PI * 2);
        ctx.arc(cx + 28, cy - 2, 16 + i, 0, Math.PI * 2);
        ctx.arc(cx + 10, cy + 4, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (bgTheme === 'tower') {
      // Wispy clouds
      ctx.fillStyle = 'rgba(100,80,140,0.15)';
      for (var i = 0; i < 3; i++) {
        var cx = ((t * (4 + i * 2) + i * 250) % (W + 300)) - 150;
        var cy = 40 + i * 30;
        ctx.globalAlpha = 0.12;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 60, 8, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;
  }

  function drawTiles() {
    var startC = Math.floor(cam.x / T);
    var endC = Math.ceil((cam.x + W) / T);
    var startR = Math.floor(cam.y / T);
    var endR = Math.ceil((cam.y + H) / T);

    for (var r = startR; r <= endR && r < mapH; r++) {
      for (var c = startC; c <= endC && c < mapW; c++) {
        var tile = tileAt(c, r);
        if (tile === '.') continue;

        var sx = c * T - cam.x;
        var sy = r * T - cam.y;

        if (tile === 'G') {
          // Ground tile — rich layered detail
          var isTop = r === 0 || tileAt(c, r - 1) !== 'G';
          var isBot = r >= mapH - 1 || tileAt(c, r + 1) !== 'G';
          // Main body
          if (bgTheme === 'forest') {
            ctx.fillStyle = isTop ? '#5a9a40' : '#6a5a3a';
          } else if (bgTheme === 'cave') {
            ctx.fillStyle = isTop ? '#4a5a6a' : '#3a4a5a';
          } else {
            ctx.fillStyle = isTop ? '#4a3a5a' : '#3a2a4a';
          }
          ctx.fillRect(sx, sy, T, T);
          if (isTop) {
            // Top surface highlight
            ctx.fillStyle = bgTheme === 'forest' ? '#6ab450' : bgTheme === 'cave' ? '#5a6a7a' : '#5a4a6a';
            ctx.fillRect(sx, sy, T, 5);
            // Bright edge line
            ctx.fillStyle = bgTheme === 'forest' ? '#7cc860' : bgTheme === 'cave' ? '#6a7a8a' : '#6a5a7a';
            ctx.fillRect(sx, sy, T, 2);
            // Grass tufts (forest) / crystals (cave) / cracks (tower)
            if (bgTheme === 'forest') {
              ctx.fillStyle = '#7ac460';
              var seed = c * 7 + r * 13;
              ctx.fillRect(sx + (seed % 8) + 2, sy - 3, 2, 4);
              ctx.fillRect(sx + (seed % 12) + 8, sy - 5, 2, 6);
              ctx.fillRect(sx + (seed % 10) + 18, sy - 2, 2, 3);
              if (c % 3 === 0) { // Occasional flower
                ctx.fillStyle = ['#f472b6','#facc15','#fb923c','#a78bfa'][(c + r) % 4];
                ctx.beginPath(); ctx.arc(sx + 14, sy - 3, 2, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#4ade80';
                ctx.fillRect(sx + 13, sy - 1, 2, 3);
              }
            } else if (bgTheme === 'cave') {
              if (c % 4 === 0) {
                ctx.fillStyle = 'rgba(100,180,255,0.2)';
                ctx.beginPath(); ctx.arc(sx + 10, sy - 1, 3, 0, Math.PI * 2); ctx.fill();
              }
            }
          } else {
            // Sub-surface texture — darker patches for depth
            ctx.fillStyle = 'rgba(0,0,0,0.06)';
            var hash = (c * 31 + r * 17) % 29;
            ctx.fillRect(sx + (hash % 12) + 2, sy + (hash % 8) + 4, 4 + hash % 5, 3 + hash % 4);
            // Occasional stone/pebble
            if (hash % 7 === 0) {
              ctx.fillStyle = 'rgba(0,0,0,0.04)';
              ctx.beginPath(); ctx.arc(sx + 16 + hash % 10, sy + 12 + hash % 12, 3, 0, Math.PI * 2); ctx.fill();
            }
          }
        } else if (tile === 'B') {
          // Brick
          ctx.fillStyle = '#b07040';
          ctx.fillRect(sx, sy, T, T);
          ctx.strokeStyle = '#8a5a30';
          ctx.lineWidth = 1;
          ctx.strokeRect(sx + 0.5, sy + 0.5, T - 1, T - 1);
          // Brick lines
          ctx.beginPath();
          ctx.moveTo(sx, sy + T / 2); ctx.lineTo(sx + T, sy + T / 2);
          ctx.moveTo(sx + T / 2, sy); ctx.lineTo(sx + T / 2, sy + T / 2);
          ctx.moveTo(sx + T / 4, sy + T / 2); ctx.lineTo(sx + T / 4, sy + T);
          ctx.moveTo(sx + T * 3 / 4, sy + T / 2); ctx.lineTo(sx + T * 3 / 4, sy + T);
          ctx.stroke();
        } else if (tile === '?') {
          // Question block
          var qb = null;
          for (var q = 0; q < questionBlocks.length; q++) {
            if (questionBlocks[q].col === c && questionBlocks[q].row === r) { qb = questionBlocks[q]; break; }
          }
          var bounceOff = qb && qb.bounceTimer > 0 ? Math.sin(qb.bounceTimer * Math.PI / 0.3) * -4 : 0;
          ctx.fillStyle = qb && qb.hit ? '#8a7a60' : '#f0c030';
          ctx.fillRect(sx, sy + bounceOff, T, T);
          ctx.strokeStyle = '#c4a020';
          ctx.lineWidth = 2;
          ctx.strokeRect(sx + 1, sy + 1 + bounceOff, T - 2, T - 2);
          if (!qb || !qb.hit) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 18px "Fredoka One",cursive';
            ctx.textAlign = 'center';
            ctx.fillText('?', sx + T / 2, sy + T / 2 + 6 + bounceOff);
            ctx.textAlign = 'left';
          }
        } else if (tile === 'P') {
          // One-way platform
          ctx.fillStyle = bgTheme === 'forest' ? '#8a6a40' : bgTheme === 'cave' ? '#5a6a7a' : '#6a5a7a';
          ctx.fillRect(sx, sy, T, 8);
          ctx.fillStyle = bgTheme === 'forest' ? '#9a7a50' : '#6a7a8a';
          ctx.fillRect(sx, sy, T, 3);
        } else if (tile === 'X') {
          // Spikes
          ctx.fillStyle = '#888';
          for (var s = 0; s < 4; s++) {
            ctx.beginPath();
            ctx.moveTo(sx + s * 8, sy + T);
            ctx.lineTo(sx + s * 8 + 4, sy + T * 0.4);
            ctx.lineTo(sx + s * 8 + 8, sy + T);
            ctx.fill();
          }
        } else if (tile === 'K') {
          // Crumble platform
          var kp = null;
          for (var k = 0; k < crumblePlatforms.length; k++) {
            if (crumblePlatforms[k].col === c && crumblePlatforms[k].row === r) { kp = crumblePlatforms[k]; break; }
          }
          if (kp && !kp.active) continue;
          var shake = kp && kp.timer > 0 ? (Math.random() - 0.5) * 2 : 0;
          ctx.fillStyle = '#c4a060';
          ctx.fillRect(sx + shake, sy, T, 10);
          // Crack lines
          ctx.strokeStyle = '#8a7040';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(sx + 6 + shake, sy + 2); ctx.lineTo(sx + 14 + shake, sy + 8);
          ctx.moveTo(sx + 20 + shake, sy + 1); ctx.lineTo(sx + 26 + shake, sy + 7);
          ctx.stroke();
        }
      }
    }

    // Question block bounce timers
    for (var i = 0; i < questionBlocks.length; i++) {
      if (questionBlocks[i].bounceTimer > 0) questionBlocks[i].bounceTimer -= dt;
    }
  }

  function drawSpellGates() {
    var t = time * 0.001;
    for (var i = 0; i < spellGates.length; i++) {
      var g = spellGates[i];
      var gx = g.x - cam.x;
      var gy = g.y - cam.y;
      if (gx < -T * 2 || gx > W + T * 2) continue;

      if (g.open) {
        if (g.dissolveTimer > 0) {
          g.dissolveTimer -= dt;
          ctx.globalAlpha = g.dissolveTimer / 0.5;
        } else continue;
      } else {
        ctx.globalAlpha = 1;
      }

      // Portal frame
      var pulse = 0.7 + Math.sin(t * 3 + i * 2) * 0.3;

      // Glow
      ctx.globalAlpha *= pulse * 0.2;
      var glow = ctx.createRadialGradient(gx + g.w / 2, gy + g.h / 2, 5, gx + g.w / 2, gy + g.h / 2, 50);
      glow.addColorStop(0, 'rgba(78,205,196,0.5)');
      glow.addColorStop(1, 'rgba(78,205,196,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(gx - 30, gy - 10, g.w + 60, g.h + 20);

      // Frame pillars
      ctx.globalAlpha = g.open ? g.dissolveTimer / 0.5 : pulse;
      ctx.fillStyle = '#2a8a7a';
      ctx.fillRect(gx - 3, gy, 6, g.h);
      ctx.fillRect(gx + g.w - 3, gy, 6, g.h);
      // Top arch
      ctx.beginPath();
      ctx.arc(gx + g.w / 2, gy, g.w / 2, Math.PI, 0);
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#2a8a7a';
      ctx.stroke();

      // Inner shimmer
      ctx.fillStyle = 'rgba(78,205,196,' + (pulse * 0.12) + ')';
      ctx.fillRect(gx + 3, gy, g.w - 6, g.h);

      // Sparkle particles inside
      for (var s = 0; s < 3; s++) {
        var sy = gy + (t * 40 + s * 25) % g.h;
        var sx = gx + g.w * 0.2 + Math.sin(t * 2 + s * 3) * g.w * 0.3;
        ctx.fillStyle = 'rgba(255,255,255,' + (pulse * 0.4) + ')';
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // "SPELL!" label
      ctx.fillStyle = '#ffd700';
      ctx.font = 'bold 12px "Fredoka One",cursive';
      ctx.textAlign = 'center';
      ctx.fillText('SPELL!', gx + g.w / 2, gy - 12);
      ctx.textAlign = 'left';

      ctx.globalAlpha = 1;
    }
  }

  function drawSprings() {
    for (var i = 0; i < springs.length; i++) {
      var sp = springs[i];
      var sx = sp.x - cam.x;
      var sy = sp.y - cam.y;
      sp.compressed = Math.max(0, sp.compressed - dt);
      var squash = sp.compressed > 0 ? 0.5 : 1;
      // Base
      ctx.fillStyle = '#888';
      ctx.fillRect(sx + 4, sy + T * (1 - squash * 0.3), T - 8, T * squash * 0.3);
      // Coil
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(sx + 6, sy + T * (1 - squash * 0.6), T - 12, T * squash * 0.3);
      // Top plate
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(sx + 2, sy + T * (1 - squash * 0.7), T - 4, 4);
    }
  }

  function drawCollectibles() {
    var t = time * 0.001;
    for (var i = 0; i < collectibles.length; i++) {
      var co = collectibles[i];
      if (!co.alive) continue;
      var cx = co.x - cam.x;
      var cy = co.y - cam.y;
      if (cx < -20 || cx > W + 20) continue;

      co.animTimer += dt;
      // Spinning coin — squash horizontally
      var spinW = Math.abs(Math.cos(t * 5 + i)) * 8;
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.ellipse(cx + co.w / 2, cy + co.h / 2, spinW, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      // Shine
      ctx.fillStyle = '#fff';
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.ellipse(cx + co.w / 2 - 2, cy + co.h / 2 - 2, spinW * 0.3, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function drawPowerups() {
    var t = time * 0.001;
    for (var i = 0; i < powerups.length; i++) {
      var pu = powerups[i];
      if (!pu.alive) continue;
      var px = pu.x - cam.x;
      var py = pu.y - cam.y;
      if (px < -30 || px > W + 30) continue;

      var pulse = 0.8 + Math.sin(t * 4 + i) * 0.2;

      // Glow halo
      ctx.globalAlpha = 0.2 * pulse;
      var glowColor = pu.type === 'shield' ? '#4ecdc4' : pu.type === 'speed' ? '#f1c40f' : '#a78bfa';
      var glow = ctx.createRadialGradient(px + 12, py + 12, 0, px + 12, py + 12, 20);
      glow.addColorStop(0, glowColor); glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(px + 12, py + 12, 20, 0, Math.PI * 2); ctx.fill();

      ctx.globalAlpha = pulse;
      // Box body
      ctx.fillStyle = pu.type === 'shield' ? '#4ecdc4' : pu.type === 'speed' ? '#f1c40f' : '#a78bfa';
      ctx.beginPath();
      ctx.arc(px + 12, py + 12, 11, 0, Math.PI * 2);
      ctx.fill();
      // Icon
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 13px "Fredoka One",cursive';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(pu.type === 'shield' ? '\uD83D\uDEE1' : pu.type === 'speed' ? '\u26A1' : '\uD83E\uDEB6', px + 12, py + 12);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.globalAlpha = 1;
    }
  }

  function drawBrickDebris() {
    for (var i = brickDebris.length - 1; i >= 0; i--) {
      var d = brickDebris[i];
      d.x += d.vx;
      d.y += d.vy;
      d.vy += 0.3;
      d.rot += d.rotSpeed;
      d.life -= dt * 1.5;
      if (d.life <= 0) { brickDebris.splice(i, 1); continue; }

      ctx.save();
      ctx.translate(d.x - cam.x, d.y - cam.y);
      ctx.rotate(d.rot);
      ctx.globalAlpha = d.life;
      ctx.fillStyle = '#b07040';
      ctx.fillRect(-d.size / 2, -d.size / 2, d.size, d.size);
      ctx.strokeStyle = '#8a5a30';
      ctx.lineWidth = 1;
      ctx.strokeRect(-d.size / 2, -d.size / 2, d.size, d.size);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  function drawFinishFlag() {
    if (!finishPos) return;
    var fx = finishPos.x - cam.x;
    var fy = finishPos.y - cam.y;
    var t = time * 0.001;
    // Pole
    ctx.fillStyle = '#888';
    ctx.fillRect(fx + T / 2 - 2, fy - 40, 4, T + 40);
    // Flag
    var wave = Math.sin(t * 3) * 3;
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(fx + T / 2 + 2, fy - 38);
    ctx.lineTo(fx + T / 2 + 22 + wave, fy - 30);
    ctx.lineTo(fx + T / 2 + 2, fy - 20);
    ctx.fill();
    // Star on top
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(fx + T / 2, fy - 42, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawPlayer() {
    if (P.dead && P.deathTimer > 2.5) return;
    var px = P.x - cam.x;
    var py = P.y - cam.y;

    // Death spin animation
    if (P.dead) {
      ctx.save();
      ctx.translate(px + P.w / 2, py + P.h / 2);
      ctx.rotate(P.deathSpin || 0);
      ctx.globalAlpha = Math.max(0, 1 - P.deathTimer / 2.5);
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.ellipse(0, 0, P.w * 0.55, P.h * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(3, -4, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#1a1a2e';
      // X eyes for dead
      ctx.lineWidth = 2; ctx.strokeStyle = '#1a1a2e';
      ctx.beginPath(); ctx.moveTo(1, -6); ctx.lineTo(5, -2); ctx.moveTo(5, -6); ctx.lineTo(1, -2); ctx.stroke();
      ctx.restore();
      ctx.globalAlpha = 1;
      return;
    }

    // Blink when invulnerable
    if (P.invuln > 0 && Math.floor(P.invuln * 10) % 2 === 0) return;

    ctx.save();
    ctx.translate(px + P.w / 2, py + P.h / 2);
    if (!P.facingR) ctx.scale(-1, 1);

    // Squash/stretch
    var sx = 1, sy = 1;
    if (P.landSquash > 0) { sx = 1.2; sy = 0.8; }
    else if (P.state === 'jump') { sx = 0.85; sy = 1.15; }
    else if (P.state === 'fall') { sx = 0.9; sy = 1.1; }
    ctx.scale(sx, sy);

    // Shield bubble
    if (P.hasShield) {
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#4ecdc4';
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Body — rounded green creature
    ctx.fillStyle = '#4ecdc4';
    ctx.beginPath();
    ctx.ellipse(0, 2, P.w * 0.55, P.h * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = '#8ae8d8';
    ctx.beginPath();
    ctx.ellipse(0, 4, P.w * 0.35, P.h * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#4ecdc4';
    ctx.beginPath();
    ctx.arc(0, -P.h * 0.28, 9, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = '#3ab8a8';
    ctx.beginPath();
    ctx.moveTo(-5, -P.h * 0.38);
    ctx.lineTo(-8, -P.h * 0.55);
    ctx.lineTo(-2, -P.h * 0.4);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(5, -P.h * 0.38);
    ctx.lineTo(8, -P.h * 0.55);
    ctx.lineTo(2, -P.h * 0.4);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(3, -P.h * 0.3, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath();
    ctx.arc(4, -P.h * 0.3, 2, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(5, -P.h * 0.32, 1, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#2a7a6a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(2, -P.h * 0.22, 3, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // Legs (animated)
    var legOff = P.state === 'run' ? Math.sin(P.animFrame * Math.PI / 2) * 4 : 0;
    ctx.fillStyle = '#3ab8a8';
    ctx.fillRect(-5, P.h * 0.25, 4, 6 + legOff);
    ctx.fillRect(1, P.h * 0.25, 4, 6 - legOff);

    // Speed boost trail
    if (P.speedBoostTimer > 0) {
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(-P.w * 0.6, -2);
      ctx.lineTo(-P.w * 0.6 - 12, 0);
      ctx.lineTo(-P.w * 0.6, 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function drawEnemies() {
    for (var i = 0; i < entities.length; i++) {
      var e = entities[i];
      if (!e.alive) continue;
      var ex = e.x - cam.x;
      var ey = e.y - cam.y;
      if (ex < -30 || ex > W + 30) continue;

      if (e.type === 'walker') {
        ctx.save();
        ctx.translate(ex + e.w / 2, ey + e.h / 2);
        if (!e.facingR) ctx.scale(-1, 1);
        // Body
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.ellipse(0, 2, e.w * 0.5, e.h * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Eyes (angry)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(3, -4, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(4, -4, 1.5, 0, Math.PI * 2);
        ctx.fill();
        // Eyebrow
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -7); ctx.lineTo(6, -6);
        ctx.stroke();
        // Feet
        var fOff = Math.sin(e.animTimer * 6) * 2;
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(-5, e.h * 0.3, 4, 4 + fOff);
        ctx.fillRect(1, e.h * 0.3, 4, 4 - fOff);
        ctx.restore();
      } else if (e.type === 'flyer') {
        ctx.save();
        ctx.translate(ex + e.w / 2, ey + e.h / 2);
        // Body
        ctx.fillStyle = '#9b59b6';
        ctx.beginPath();
        ctx.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Wings
        var wingFlap = Math.sin(time * 0.01) * 5;
        ctx.fillStyle = '#c39bd3';
        ctx.beginPath();
        ctx.ellipse(-10, -wingFlap, 8, 4, -0.3, 0, Math.PI * 2);
        ctx.ellipse(10, -wingFlap, 8, 4, 0.3, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-3, -2, 2.5, 0, Math.PI * 2);
        ctx.arc(3, -2, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(-2, -2, 1, 0, Math.PI * 2);
        ctx.arc(4, -2, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (e.type === 'projectile') {
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(ex + 4, ey + 4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(ex + 4, ey + 4, 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === 'shooter') {
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(ex, ey, e.w, e.h);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(ex + (e.facingR ? e.w - 6 : 0), ey + 6, 6, 8);
        // Eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ex + e.w / 2, ey + 8, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = e.facingR ? '#1a1a1a' : '#1a1a1a';
        ctx.beginPath();
        ctx.arc(ex + e.w / 2 + (e.facingR ? 1 : -1), ey + 8, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawParticles() {
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x - cam.x, p.y - cam.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawHUD() {
    // === HUD BACKGROUND STRIP ===
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, W, 56);

    // === HP HEARTS (left) ===
    for (var i = 0; i < MAX_HP; i++) {
      var hx = 10 + i * 24, hy = 8;
      if (i < P.hp) {
        ctx.fillStyle = '#e74c3c';
        // Draw a heart shape
        ctx.beginPath();
        ctx.moveTo(hx + 8, hy + 6);
        ctx.bezierCurveTo(hx + 8, hy + 2, hx + 2, hy, hx + 2, hy + 4);
        ctx.bezierCurveTo(hx + 2, hy + 8, hx + 8, hy + 12, hx + 8, hy + 14);
        ctx.bezierCurveTo(hx + 8, hy + 12, hx + 14, hy + 8, hx + 14, hy + 4);
        ctx.bezierCurveTo(hx + 14, hy, hx + 8, hy + 2, hx + 8, hy + 6);
        ctx.fill();
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath(); ctx.arc(hx + 5, hy + 5, 2, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.moveTo(hx + 8, hy + 6);
        ctx.bezierCurveTo(hx + 8, hy + 2, hx + 2, hy, hx + 2, hy + 4);
        ctx.bezierCurveTo(hx + 2, hy + 8, hx + 8, hy + 12, hx + 8, hy + 14);
        ctx.bezierCurveTo(hx + 8, hy + 12, hx + 14, hy + 8, hx + 14, hy + 4);
        ctx.bezierCurveTo(hx + 14, hy, hx + 8, hy + 2, hx + 8, hy + 6);
        ctx.fill();
      }
    }

    // === COINS (center-left) ===
    ctx.fillStyle = '#ffd700';
    ctx.font = 'bold 13px "Fredoka One",cursive';
    var coinIconX = 10 + MAX_HP * 24 + 8;
    // Spinning coin icon
    var coinSpin = Math.abs(Math.cos(time * 0.004)) * 6;
    ctx.beginPath(); ctx.ellipse(coinIconX + 6, 16, coinSpin, 6, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('x' + coins, coinIconX + 16, 20);

    // === SCORE (right) ===
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px "Fredoka One",cursive';
    ctx.textAlign = 'right';
    ctx.fillText(score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','), W - 10, 18);

    // === LEVEL NAME (right, below score) ===
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font = '10px "Fredoka One",cursive';
    var lvlName = bossArena ? 'BOSS FIGHT' : (LEVELS[level - 1] ? LEVELS[level - 1].name : '');
    ctx.fillText(lvlName, W - 10, 32);
    ctx.textAlign = 'left';

    // === GATE PROGRESS BAR (bottom of HUD strip) ===
    if (!bossArena && totalGates > 0) {
      var barW = W * 0.4;
      var barX = (W - barW) / 2;
      var barY = 42;
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.fillRect(barX, barY, barW, 8);
      ctx.fillStyle = '#4ecdc4';
      ctx.fillRect(barX, barY, barW * (wordsSpelled / totalGates), 8);
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barW, 8);
      // Gate markers
      for (var i = 0; i < totalGates; i++) {
        var mx = barX + barW * ((i + 1) / totalGates);
        ctx.fillStyle = i < wordsSpelled ? '#ffd700' : 'rgba(255,255,255,0.3)';
        ctx.beginPath(); ctx.arc(mx, barY + 4, 3, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#fff';
      ctx.font = '8px "Fredoka One",cursive';
      ctx.textAlign = 'center';
      ctx.fillText('GATES ' + wordsSpelled + '/' + totalGates, W / 2, barY - 2);
      ctx.textAlign = 'left';
    }

    // === LEVEL TIMER (top center) ===
    var elapsed = Math.floor((time - levelStartTime) / 1000);
    var mins = Math.floor(elapsed / 60);
    var secs = elapsed % 60;
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '10px "Fredoka One",cursive';
    ctx.textAlign = 'center';
    ctx.fillText((mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs, W / 2, 18);
    ctx.textAlign = 'left';

    // Active power-up indicators
    var puY = 82;
    if (P.hasShield) {
      ctx.fillStyle = '#4ecdc4'; ctx.font = '10px "Fredoka One",cursive';
      ctx.fillText('\uD83D\uDEE1 Shield', 10, puY); puY += 14;
    }
    if (P.speedBoostTimer > 0) {
      ctx.fillStyle = '#f1c40f'; ctx.font = '10px "Fredoka One",cursive';
      ctx.fillText('\u26A1 Speed ' + Math.ceil(P.speedBoostTimer) + 's', 10, puY); puY += 14;
    }
    if (P.hasDoubleJump) {
      ctx.fillStyle = '#a78bfa'; ctx.font = '10px "Fredoka One",cursive';
      ctx.fillText('\uD83E\uDEB6 Double Jump', 10, puY);
    }

    // Direction arrow to next gate
    drawDirectionArrow();
  }

  function drawDirectionArrow() {
    var nextGate = null;
    for (var i = 0; i < spellGates.length; i++) {
      if (!spellGates[i].open) { nextGate = spellGates[i]; break; }
    }
    if (!nextGate && finishPos) {
      // Point to finish
      var fx = finishPos.x + T / 2 - cam.x;
      if (fx > W - 20 || fx < 20) {
        var t = time * 0.001;
        var arrowX = fx > W - 20 ? W - 30 : 30;
        var dir = fx > W - 20 ? 1 : -1;
        var bob = Math.sin(t * 4) * 3;
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(arrowX + dir * bob, H * 0.4 - 8);
        ctx.lineTo(arrowX + dir * 12 + dir * bob, H * 0.4);
        ctx.lineTo(arrowX + dir * bob, H * 0.4 + 8);
        ctx.fill();
        ctx.font = '10px "Fredoka One",cursive';
        ctx.textAlign = 'center';
        ctx.fillText('FINISH', arrowX + dir * 6, H * 0.4 - 14);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
      }
      return;
    }
    if (!nextGate) return;
    var gx = nextGate.x + nextGate.w / 2 - cam.x;
    if (gx > W - 20 || gx < 20) {
      var t = time * 0.001;
      var arrowX = gx > W - 20 ? W - 30 : 30;
      var dir = gx > W - 20 ? 1 : -1;
      var bob = Math.sin(t * 4) * 3;
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = '#4ecdc4';
      ctx.beginPath();
      ctx.moveTo(arrowX + dir * bob, H * 0.4 - 8);
      ctx.lineTo(arrowX + dir * 12 + dir * bob, H * 0.4);
      ctx.lineTo(arrowX + dir * bob, H * 0.4 + 8);
      ctx.fill();
      ctx.font = '10px "Fredoka One",cursive';
      ctx.textAlign = 'center';
      ctx.fillText('SPELL!', arrowX + dir * 6, H * 0.4 - 14);
      ctx.textAlign = 'left';
      ctx.globalAlpha = 1;
    }
  }

  function drawSpellPrompt() {
    if (!spellActive || !spellWord) return;
    var word = spellWord.w;
    var hint = spellWord.h;

    // Overlay
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, H * 0.15, W, H * 0.45);

    // Hint
    ctx.fillStyle = '#ffd700';
    ctx.font = '14px "Fredoka One",cursive';
    ctx.textAlign = 'center';
    ctx.fillText(hint, W / 2, H * 0.24);

    // Word progress
    ctx.font = 'bold 30px "Fredoka One",cursive';
    var wordY = H * 0.34;
    for (var i = 0; i < word.length; i++) {
      var lx = W / 2 - (word.length * 20) / 2 + i * 20 + 10;
      ctx.fillStyle = i < spellLetterIdx ? '#4ecdc4' : '#555';
      ctx.fillText(i < spellLetterIdx ? word[i].toUpperCase() : '_', lx, wordY);
    }

    // Letter choice buttons
    var choiceY = H * 0.48;
    var spacing = 70;
    var startX = W / 2 - (spellChoices.length * spacing) / 2 + spacing / 2;
    for (var i = 0; i < spellChoices.length; i++) {
      var cx = startX + i * spacing;
      // Shadow
      ctx.fillStyle = '#1a3a5a';
      ctx.beginPath();
      ctx.arc(cx, choiceY + 3, 28, 0, Math.PI * 2);
      ctx.fill();
      // Button
      ctx.fillStyle = '#2a6aaa';
      ctx.beginPath();
      ctx.arc(cx, choiceY, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#4a9aee';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      // Letter
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 26px "Fredoka One",cursive';
      ctx.textBaseline = 'middle';
      ctx.fillText(spellChoices[i].toUpperCase(), cx, choiceY);
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
  }

  function drawTouchControls() {
    if (stage !== 'playing' && stage !== 'boss') return;
    if (spellActive) return;
    ctx.globalAlpha = 0.3;
    // Left
    ctx.fillStyle = touchL ? '#4ecdc4' : '#fff';
    ctx.beginPath(); ctx.arc(50, H - 50, 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000'; ctx.font = '22px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('\u25C0', 50, H - 43);
    // Right
    ctx.fillStyle = touchR ? '#4ecdc4' : '#fff';
    ctx.beginPath(); ctx.arc(120, H - 50, 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.fillText('\u25B6', 120, H - 43);
    // Jump
    ctx.fillStyle = touchJ ? '#4ecdc4' : '#fff';
    ctx.beginPath(); ctx.arc(W - 60, H - 50, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000'; ctx.font = '16px "Fredoka One",cursive';
    ctx.fillText('JUMP', W - 60, H - 44);
    // Pause button (top-right)
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#fff';
    ctx.fillRect(W - 38, 62, 10, 18);
    ctx.fillRect(W - 24, 62, 10, 18);
    ctx.textAlign = 'left';
    ctx.globalAlpha = 1;
  }

  function drawTitleScreen() {
    var t = time * 0.001;
    ctx.fillStyle = '#0a1a0a';
    ctx.fillRect(0, 0, W, H);
    // Trees bg
    ctx.globalAlpha = 0.2;
    for (var i = 0; i < 15; i++) {
      var tx = (i * 50 + t * 15) % (W + 40) - 20;
      ctx.fillStyle = '#1a4a1a';
      ctx.beginPath(); ctx.arc(tx, H * 0.75, 18, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // Title
    ctx.fillStyle = '#4ecdc4';
    ctx.font = 'bold 36px "Fredoka One",cursive';
    ctx.textAlign = 'center';
    ctx.fillText('WORD FOREST', W / 2, H * 0.28);
    ctx.fillStyle = '#ffd700';
    ctx.font = '18px "Fredoka One",cursive';
    ctx.fillText('Spelling Platformer', W / 2, H * 0.38);
    // Character
    ctx.fillStyle = '#4ecdc4';
    ctx.beginPath();
    ctx.ellipse(W / 2, H * 0.52, 16, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(W / 2 + 4, H * 0.5, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1a2e';
    ctx.beginPath(); ctx.arc(W / 2 + 5, H * 0.5, 2, 0, Math.PI * 2); ctx.fill();
    // CTA
    var bob = Math.sin(t * 2) * 3;
    ctx.fillStyle = '#fff';
    ctx.font = '16px "Fredoka One",cursive';
    ctx.fillText('Tap to Start!', W / 2, H * 0.7 + bob);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.font = '11px "Fredoka One",cursive';
    ctx.fillText('\u2190\u2192 Move  |  \u2191 / Space = Jump', W / 2, H * 0.82);
    ctx.textAlign = 'left';
  }

  // ==================== SAVE / LOAD ====================
  function saveProgress() {
    try {
      var data = {
        highScore: Math.max(score, loadHighScore()),
        bestCoins: Math.max(coins, loadBestCoins()),
        levelsBeaten: Math.max(level, loadLevelsBeaten()),
        bossBeaten: stage === 'win' && bossArena
      };
      localStorage.setItem('classmates_platformer', JSON.stringify(data));
    } catch(e) {}
  }
  function loadHighScore() { try { var d = JSON.parse(localStorage.getItem('classmates_platformer')); return d && d.highScore || 0; } catch(e) { return 0; } }
  function loadBestCoins() { try { var d = JSON.parse(localStorage.getItem('classmates_platformer')); return d && d.bestCoins || 0; } catch(e) { return 0; } }
  function loadLevelsBeaten() { try { var d = JSON.parse(localStorage.getItem('classmates_platformer')); return d && d.levelsBeaten || 0; } catch(e) { return 0; } }

  function calcStars() {
    // 3 stars: beat boss + high coins. 2 stars: beat all levels. 1 star: beat level 1
    if (bossArena && boss && boss.defeated) return 3;
    if (level >= 3) return 2;
    return 1;
  }

  function drawStar(x, y, r, filled) {
    ctx.fillStyle = filled ? '#ffd700' : '#444';
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var rad = i % 2 === 0 ? r : r * 0.4;
      var angle = (i * Math.PI / 5) - Math.PI / 2;
      if (i === 0) ctx.moveTo(x + Math.cos(angle) * rad, y + Math.sin(angle) * rad);
      else ctx.lineTo(x + Math.cos(angle) * rad, y + Math.sin(angle) * rad);
    }
    ctx.closePath(); ctx.fill();
    if (filled) {
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath(); ctx.arc(x - r * 0.15, y - r * 0.2, r * 0.3, 0, Math.PI * 2); ctx.fill();
    }
  }

  function drawWinScreen() {
    var t = time * 0.001;
    ctx.fillStyle = '#0a1a2a'; ctx.fillRect(0, 0, W, H);

    // Animated confetti in background
    ctx.globalAlpha = 0.3;
    for (var i = 0; i < 20; i++) {
      var cx = ((t * (10 + i * 3) + i * 80) % (W + 40)) - 20;
      var cy = ((t * (20 + i * 5) + i * 60) % (H + 40)) - 20;
      ctx.fillStyle = ['#ffd700','#4ecdc4','#e74c3c','#3498db','#2ecc71'][i % 5];
      ctx.fillRect(cx, cy, 4 + i % 3, 3);
    }
    ctx.globalAlpha = 1;

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 30px "Fredoka One",cursive';
    ctx.fillText('YOU WIN!', W / 2, H * 0.18);
    ctx.fillStyle = '#4ecdc4'; ctx.font = '15px "Fredoka One",cursive';
    ctx.fillText('The Word Weaver is defeated!', W / 2, H * 0.27);

    // Stars
    var stars = calcStars();
    for (var i = 0; i < 3; i++) {
      var sx = W / 2 - 50 + i * 50;
      var bob = Math.sin(t * 2 + i * 0.5) * 3;
      drawStar(sx, H * 0.36 + bob, i < stars ? 16 : 14, i < stars);
    }

    // Stats
    ctx.fillStyle = '#fff'; ctx.font = '13px "Fredoka One",cursive';
    ctx.fillText('Score: ' + score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','), W / 2, H * 0.5);
    ctx.fillText('Coins: ' + coins + '  |  Time: ' + formatTime(), W / 2, H * 0.57);
    var hs = loadHighScore();
    if (score > hs) {
      ctx.fillStyle = '#ffd700'; ctx.font = 'bold 12px "Fredoka One",cursive';
      ctx.fillText('NEW HIGH SCORE!', W / 2, H * 0.64);
    } else if (hs > 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '11px "Fredoka One",cursive';
      ctx.fillText('Best: ' + hs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','), W / 2, H * 0.64);
    }

    // Buttons
    drawScreenButton(W / 2, H * 0.78, 'Play Again', '#4ecdc4');
    drawScreenButton(W / 2, H * 0.9, 'Back to Spelling', '#888');

    ctx.textAlign = 'left';
    saveProgress();
  }

  function drawLoseScreen() {
    ctx.fillStyle = '#1a0a0a'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e74c3c'; ctx.font = 'bold 30px "Fredoka One",cursive';
    ctx.fillText('GAME OVER', W / 2, H * 0.2);
    ctx.fillStyle = '#fff'; ctx.font = '15px "Fredoka One",cursive';
    ctx.fillText('Don\'t give up!', W / 2, H * 0.32);
    ctx.fillText('Score: ' + score + '  |  Coins: ' + coins, W / 2, H * 0.42);

    // Encouragement
    var msgs = ['Every expert was once a beginner!', 'Try again — you\'ll get further!', 'Practice makes perfect!', 'The forest needs you!'];
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '12px "Fredoka One",cursive';
    ctx.fillText(msgs[Math.floor(time * 0.0001) % msgs.length], W / 2, H * 0.52);

    drawScreenButton(W / 2, H * 0.68, 'Try Again', '#e74c3c');
    drawScreenButton(W / 2, H * 0.8, 'Back to Spelling', '#888');

    ctx.textAlign = 'left';
    saveProgress();
  }

  function drawScreenButton(x, y, text, color) {
    var bw = 160, bh = 34;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - bw / 2 + 8, y - bh / 2);
    ctx.lineTo(x + bw / 2 - 8, y - bh / 2);
    ctx.quadraticCurveTo(x + bw / 2, y - bh / 2, x + bw / 2, y - bh / 2 + 8);
    ctx.lineTo(x + bw / 2, y + bh / 2 - 8);
    ctx.quadraticCurveTo(x + bw / 2, y + bh / 2, x + bw / 2 - 8, y + bh / 2);
    ctx.lineTo(x - bw / 2 + 8, y + bh / 2);
    ctx.quadraticCurveTo(x - bw / 2, y + bh / 2, x - bw / 2, y + bh / 2 - 8);
    ctx.lineTo(x - bw / 2, y - bh / 2 + 8);
    ctx.quadraticCurveTo(x - bw / 2, y - bh / 2, x - bw / 2 + 8, y - bh / 2);
    ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = '13px "Fredoka One",cursive';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
    ctx.textBaseline = 'alphabetic';
  }

  function formatTime() {
    var elapsed = Math.floor((time - levelStartTime) / 1000);
    var mins = Math.floor(elapsed / 60);
    var secs = elapsed % 60;
    return (mins < 10 ? '0' : '') + mins + ':' + (secs < 10 ? '0' : '') + secs;
  }

  // ==================== PAUSE ====================
  function drawPauseScreen() {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff'; ctx.font = 'bold 28px "Fredoka One",cursive';
    ctx.fillText('PAUSED', W / 2, H * 0.3);
    drawScreenButton(W / 2, H * 0.5, 'Resume', '#4ecdc4');
    drawScreenButton(W / 2, H * 0.62, 'Restart Level', '#f39c12');
    drawScreenButton(W / 2, H * 0.74, 'Quit to Menu', '#888');
    ctx.textAlign = 'left';
  }

  function drawTutorial() {
    if (stage !== 'playing') return;
    var elapsed = (time - levelStartTime) / 1000;
    if (elapsed > 8) return;
    var alpha = elapsed < 6 ? 0.85 : (8 - elapsed) / 2;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(W * 0.05, 60, W * 0.9, 30);
    ctx.fillStyle = '#fff';
    ctx.font = '12px "Fredoka One",cursive';
    ctx.textAlign = 'center';
    ctx.fillText('Run right \u2192  Jump over gaps  \u2B50 Collect coins  \u2728 Enter SPELL gates!', W / 2, 80);
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
    frames++;

    if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
      W = canvas.width = canvas.clientWidth;
      H = canvas.height = canvas.clientHeight;
    }

    // Screen shake
    ctx.save();
    if (shakeTimer > 0) {
      shakeTimer -= dt;
      var s = shakeAmt * (shakeTimer / 0.25);
      ctx.translate((Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
    }

    updateTransition();

    // Freeze-frame (hit stop on stomp — makes it feel impactful)
    if (freezeTimer > 0) { freezeTimer -= dt; ctx.restore(); animId = requestAnimationFrame(loop); return; }

    // Combo timer decay
    if (comboTimer > 0) { comboTimer -= dt; if (comboTimer <= 0) comboCount = 0; }
    // Reset combo when landing
    if (P.onGround && comboCount > 0 && comboTimer < 0.5) comboCount = 0;

    if (stage === 'title') {
      drawTitleScreen();
    } else if (stage === 'playing') {
      updatePlayer();
      updateEntities();
      updateCamera();
      updateParticles();
      updateFloatingTexts();
      // Crumble platform timers + activation when player stands on them
      for (var i = 0; i < crumblePlatforms.length; i++) {
        var kp = crumblePlatforms[i];
        if (!kp.active) continue;
        // Start crumbling when player stands on this tile
        if (kp.timer === 0 && P.onGround) {
          var pc = Math.floor((P.x + P.w / 2) / T);
          var pr = Math.floor((P.y + P.h + 2) / T);
          if (pc === kp.col && pr === kp.row) {
            kp.timer = 0.01; // Start crumble countdown
          }
        }
        if (kp.timer > 0) {
          kp.timer += dt;
          if (kp.timer > 0.8) {
            kp.active = false;
            map[kp.row][kp.col] = '.';
            spawnParticles(kp.col * T + T / 2, kp.row * T + 5, 8, '#c4a060', 2);
            playSound('wrong');
          }
        }
      }
      // Death check
      if (P.dead && P.deathTimer > 2) {
        stage = 'lose';
      }
      // Boss update
      if (bossArena && boss) updateBoss();

      drawBackground();
      drawTiles();
      drawBrickDebris();
      drawSprings();
      drawCollectibles();
      drawPowerups();
      drawFinishFlag();
      drawSpellGates();
      drawEnemies();
      if (bossArena && boss) drawBoss();
      drawPlayer();
      drawParticles();
      drawFloatingTexts();
      drawHUD();
      if (!bossArena) drawTutorial();
      drawSpellPrompt();
      drawTouchControls();
      // Flash
      if (flashTimer > 0) {
        ctx.fillStyle = flashColor;
        ctx.fillRect(0, 0, W, H);
        flashTimer -= dt;
      }
    } else if (stage === 'celebration') {
      updateCelebration();
      drawCelebration();
    } else if (stage === 'paused') {
      // Draw the level frozen behind the pause overlay
      drawBackground(); drawTiles(); drawSprings(); drawCollectibles();
      drawPowerups(); drawFinishFlag(); drawSpellGates(); drawEnemies();
      if (bossArena && boss) drawBoss();
      drawPlayer(); drawHUD();
      drawPauseScreen();
    } else if (stage === 'win') {
      drawWinScreen();
    } else if (stage === 'lose') {
      drawLoseScreen();
    }

    // Transition fade
    if (transTimer > 0) {
      var alpha = transTimer > 0.6 ? (1.2 - transTimer) / 0.6 : transTimer / 0.6;
      ctx.fillStyle = 'rgba(0,0,0,' + Math.min(1, alpha) + ')';
      ctx.fillRect(0, 0, W, H);
    }

    ctx.restore();
    animId = requestAnimationFrame(loop);
  }

  // ==================== INPUT ====================
  function onKeyDown(e) {
    keys[e.key] = true;
    if (spellActive && /^[a-z]$/i.test(e.key)) pickLetter(e.key.toLowerCase());
    if (e.key === ' ') e.preventDefault();
    // Pause toggle
    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      if (stage === 'playing') { stage = 'paused'; return; }
      if (stage === 'paused') { stage = 'playing'; return; }
    }
  }
  function onKeyUp(e) { keys[e.key] = false; }

  function updateTouchZones(touches) {
    var rect = canvas.getBoundingClientRect();
    touchL = false; touchR = false; touchJ = false;
    for (var i = 0; i < touches.length; i++) {
      var tx = touches[i].clientX - rect.left;
      var ty = touches[i].clientY - rect.top;
      if (ty > H - 95) {
        if (tx < 85) touchL = true;
        else if (tx < 155) touchR = true;
        if (tx > W - 100) touchJ = true;
      }
    }
  }

  function onTouchStart(e) {
    e.preventDefault();
    touchActive = true;
    updateTouchZones(e.touches);

    var rect = canvas.getBoundingClientRect();
    var tx = e.changedTouches[0].clientX - rect.left;
    var ty = e.changedTouches[0].clientY - rect.top;

    if (stage === 'title') {
      stage = 'playing'; level = 1; score = 0; coins = 0; bossArena = false; loadLevel(1);
      return;
    }
    // Delegate win/lose/pause button taps to onClick logic
    if (stage === 'win' || stage === 'lose' || stage === 'paused') {
      onClick({ clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY });
      return;
    }

    // Pause button tap (top-right corner)
    if (stage === 'playing' && tx > W - 50 && ty < 90 && ty > 55) {
      stage = 'paused'; return;
    }

    // Spell prompt letter tap
    if (spellActive && spellChoices.length > 0) {
      var choiceY = H * 0.48;
      var spacing = 70;
      var startX = W / 2 - (spellChoices.length * spacing) / 2 + spacing / 2;
      for (var i = 0; i < spellChoices.length; i++) {
        var cx = startX + i * spacing;
        var dist = Math.sqrt((tx - cx) * (tx - cx) + (ty - choiceY) * (ty - choiceY));
        if (dist < 32) { pickLetter(spellChoices[i]); return; }
      }
    }
  }

  function onTouchMove(e) {
    e.preventDefault();
    if (touchActive) updateTouchZones(e.touches);
  }

  function onTouchEnd(e) {
    e.preventDefault();
    if (e.touches.length === 0) {
      touchL = false; touchR = false; touchJ = false; touchActive = false;
    } else {
      updateTouchZones(e.touches);
    }
  }

  function hitButton(tx, ty, btnX, btnY) {
    return Math.abs(tx - btnX) < 80 && Math.abs(ty - btnY) < 18;
  }

  function goBackToSpelling() {
    stop();
    if (window.stopSpellingPlatformer) stopSpellingPlatformer();
  }

  function onClick(e) {
    var rect = canvas.getBoundingClientRect();
    var tx = e.clientX - rect.left;
    var ty = e.clientY - rect.top;

    if (stage === 'title') {
      stage = 'playing'; level = 1; score = 0; coins = 0; bossArena = false; loadLevel(1);
      return;
    }

    if (stage === 'win') {
      if (hitButton(tx, ty, W / 2, H * 0.78)) { stage = 'title'; return; } // Play again
      if (hitButton(tx, ty, W / 2, H * 0.9)) { goBackToSpelling(); return; } // Back
      return;
    }

    if (stage === 'lose') {
      if (hitButton(tx, ty, W / 2, H * 0.68)) { stage = 'title'; return; } // Try again
      if (hitButton(tx, ty, W / 2, H * 0.8)) { goBackToSpelling(); return; } // Back
      return;
    }

    if (stage === 'paused') {
      if (hitButton(tx, ty, W / 2, H * 0.5)) { stage = 'playing'; return; } // Resume
      if (hitButton(tx, ty, W / 2, H * 0.62)) { loadLevel(level); stage = 'playing'; return; } // Restart
      if (hitButton(tx, ty, W / 2, H * 0.74)) { goBackToSpelling(); return; } // Quit
      return;
    }

    // Spell prompt click
    if (spellActive && spellChoices.length > 0) {
      var choiceY = H * 0.48;
      var spacing = 70;
      var startX = W / 2 - (spellChoices.length * spacing) / 2 + spacing / 2;
      for (var i = 0; i < spellChoices.length; i++) {
        var cx = startX + i * spacing;
        var dist = Math.sqrt((tx - cx) * (tx - cx) + (ty - choiceY) * (ty - choiceY));
        if (dist < 32) { pickLetter(spellChoices[i]); return; }
      }
    }
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
    stage = 'title';
    lastTime = performance.now();
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });
    canvas.style.pointerEvents = 'auto';
    animId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (animId) cancelAnimationFrame(animId);
    animId = null;
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    canvas.removeEventListener('click', onClick);
    canvas.removeEventListener('touchstart', onTouchStart);
    canvas.removeEventListener('touchmove', onTouchMove);
    canvas.removeEventListener('touchend', onTouchEnd);
    canvas.style.pointerEvents = 'none';
  }

  window.ClassmatesSpellingPlatformer = { init: init, start: start, stop: stop };
})();
