(function(){
  const LANE_X = [-6, 0, 6];
  const TOUCH_QUERY = '(hover: none), (pointer: coarse)';
  const RACER = {
    active: false,
    frameId: null,
    renderer: null,
    scene: null,
    camera: null,
    clock: null,
    roadSegments: [],
    props: [],
    car: null,
    currentGate: null,
    nextGateTimer: 0,
    touchMode: false,
    keyHandlers: null,
    resizeHandler: null,
    launchSource: null,
    trailParticles: [],
    countdownTimer: null,
    streakHudTimer: null,
    messageTimer: null,
    session: null
  };

  function clearChildren(node) {
    if (node) node.innerHTML = '';
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  const RACER_COSMETICS = {
    colors: {
      ember: { label: 'Ember Orange', body: 0xed6a2c, cab: 0xfff2d9, bumper: 0x163545 },
      aurora: { label: 'Aurora Green', body: 0x11998e, cab: 0xe9fff8, bumper: 0x0f4b52 }
    },
    trails: {
      none: { label: 'None', color: 0xffffff, density: 0, rise: 0, size: 0.14 },
      spark: { label: 'Spark Trail', color: 0xffd93d, density: 1, rise: 2.0, size: 0.16 }
    },
    titles: {
      rookie: { label: 'Racing Rookie' },
      track_star: { label: 'Track Star' }
    }
  };
  const RACER_COSMETIC_UNLOCKS = [
    { id: 'sr_spark_trail', type: 'trail', cosmeticId: 'spark', name: 'Spark Trail', description: 'Unlocks a sparkling trail effect.', threshold: 0.8 },
    { id: 'sr_aurora_paint', type: 'color', cosmeticId: 'aurora', name: 'Aurora Green', description: 'Unlocks a brighter car colour.', threshold: 0.84 },
    { id: 'sr_track_star_title', type: 'title', cosmeticId: 'track_star', name: 'Track Star', description: 'Unlocks a new racer title.', threshold: 0.88 }
  ];

  function normalizeRacerProgression() {
    if (!window.ClassmatesAppState || typeof state === 'undefined') {
      return { unlocked: [], equipped: { color: 'ember', trail: 'none', title: 'rookie' } };
    }
    return ClassmatesAppState.getRacerProgression(state);
  }

  function getRacerLoadout() {
    const progression = normalizeRacerProgression();
    const equipped = progression.equipped || {};
    return {
      colorId: equipped.color || 'ember',
      trailId: equipped.trail || 'none',
      titleId: equipped.title || 'rookie'
    };
  }

  function getLoadoutLabels(loadout) {
    const color = RACER_COSMETICS.colors[loadout.colorId] || RACER_COSMETICS.colors.ember;
    const trail = RACER_COSMETICS.trails[loadout.trailId] || RACER_COSMETICS.trails.none;
    const title = RACER_COSMETICS.titles[loadout.titleId] || RACER_COSMETICS.titles.rookie;
    return {
      colorLabel: color.label,
      trailLabel: trail.label,
      titleLabel: title.label,
      trail: trail,
      color: color
    };
  }

  function applyCarLoadout(loadout) {
    if (!RACER.car || !RACER.car.userData || !RACER.car.userData.materials) return;
    const materials = RACER.car.userData.materials;
    const color = RACER_COSMETICS.colors[(loadout && loadout.colorId) || 'ember'] || RACER_COSMETICS.colors.ember;
    materials.body.color.setHex(color.body);
    materials.cab.color.setHex(color.cab);
    materials.bumper.color.setHex(color.bumper);
  }

  function setHudStateClass(stateName) {
    const hud = document.getElementById('hdashHud');
    if (!hud) return;
    hud.classList.remove('streak-spark', 'streak-boost', 'streak-champion');
    if (!stateName) return;
    hud.classList.add('streak-' + stateName);
    clearTimeout(RACER.streakHudTimer);
    RACER.streakHudTimer = setTimeout(function(){
      hud.classList.remove('streak-' + stateName);
    }, 900);
  }

  function showRacerRewardPopup(lines, accent) {
    const popup = document.createElement('div');
    popup.className = 'ach-popup';
    popup.onclick = function(){ popup.remove(); };
    popup.innerHTML = '<div class="ach-popup-card racer-reward-card" style="border-color:' + (accent || '#FFD93D') + '">'
      + '<div class="ach-popup-label">Mission reward</div>'
      + '<div class="ach-popup-icon">🏁</div>'
      + '<div class="ach-popup-title">Southlodge Racers</div>'
      + '<div class="ach-popup-desc">' + lines.map(function(line){ return escapeHtml(String(line)); }).join('<br>') + '</div>'
      + '</div>';
    document.body.appendChild(popup);
    setTimeout(function(){ if (popup.parentNode) popup.remove(); }, 3200);
  }

  function spawnTrailParticle() {
    if (!RACER.session || !RACER.session.trailEffect || !RACER.session.trailEffect.enabled || !RACER.car || !RACER.scene) return;
    const trail = RACER.session.trailEffect;
    const geometry = new THREE.SphereGeometry(trail.size || 0.14, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: trail.color || 0xffd93d, transparent: true, opacity: 0.92 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      RACER.car.position.x + (Math.random() - 0.5) * 1.2,
      RACER.car.position.y + 0.35 + Math.random() * 0.4,
      RACER.car.position.z + 2.2 + Math.random() * 0.8
    );
    RACER.scene.add(mesh);
    RACER.trailParticles.push({
      mesh: mesh,
      life: 0.7 + Math.random() * 0.35,
      maxLife: 0.7 + Math.random() * 0.35,
      rise: trail.rise || 0,
      drift: (Math.random() - 0.5) * 0.75
    });
  }

  function updateTrailParticles(delta) {
    if (!RACER.session || !RACER.session.trailEffect || !RACER.session.trailEffect.enabled) {
      if (RACER.trailParticles.length) {
        RACER.trailParticles.forEach(function(particle){
          if (particle.mesh && particle.mesh.parent) particle.mesh.parent.remove(particle.mesh);
          if (particle.mesh && particle.mesh.geometry) particle.mesh.geometry.dispose();
          if (particle.mesh && particle.mesh.material) particle.mesh.material.dispose();
        });
        RACER.trailParticles = [];
      }
      return;
    }
    const trail = RACER.session.trailEffect;
    RACER.session.trailSpawnTimer = (RACER.session.trailSpawnTimer || 0) - delta;
    const streakScale = RACER.session.streak >= 8 ? 0.42 : RACER.session.streak >= 5 ? 0.58 : RACER.session.streak >= 3 ? 0.76 : 1;
    const spawnDelay = Math.max(0.05, 0.12 * streakScale / Math.max(1, trail.density || 1));
    if (RACER.session.trailSpawnTimer <= 0) {
      RACER.session.trailSpawnTimer = spawnDelay;
      spawnTrailParticle();
    }
    for (let index = RACER.trailParticles.length - 1; index >= 0; index--) {
      const particle = RACER.trailParticles[index];
      particle.life -= delta;
      particle.mesh.position.y += delta * (particle.rise + 0.8);
      particle.mesh.position.z += delta * (1.5 + particle.drift);
      particle.mesh.scale.multiplyScalar(Math.max(0.84, 1 - delta * 0.75));
      particle.mesh.material.opacity = Math.max(0, particle.life / particle.maxLife);
      if (particle.life <= 0) {
        if (particle.mesh.parent) particle.mesh.parent.remove(particle.mesh);
        particle.mesh.geometry.dispose();
        particle.mesh.material.dispose();
        RACER.trailParticles.splice(index, 1);
      }
    }
  }

  function clearTrailParticles() {
    if (!RACER.trailParticles.length) return;
    RACER.trailParticles.forEach(function(particle){
      if (particle.mesh && particle.mesh.parent) particle.mesh.parent.remove(particle.mesh);
      if (particle.mesh && particle.mesh.geometry) particle.mesh.geometry.dispose();
      if (particle.mesh && particle.mesh.material) particle.mesh.material.dispose();
    });
    RACER.trailParticles = [];
  }

  function triggerStreakReward() {
    if (!RACER.session) return;
    const streak = RACER.session.streak || 0;
    let tier = RACER.session.streakTier || 0;
    const milestones = [
      { streak: 3, tone: 'spark', text: 'Spark streak x3', boost: 0.6 },
      { streak: 5, tone: 'boost', text: 'Boost streak x5', boost: 1.1 },
      { streak: 8, tone: 'champion', text: 'Champion streak x8', boost: 1.8, confetti: true }
    ];
    let milestone = null;
    for (let index = milestones.length - 1; index >= 0; index--) {
      if (streak >= milestones[index].streak && tier < index + 1) {
        milestone = milestones[index];
        tier = index + 1;
        break;
      }
    }
    RACER.session.streakTier = tier;
    if (!milestone) return;
    setHudStateClass(milestone.tone);
    setMessage(milestone.text, milestone.tone, milestone.streak >= 8 ? 1200 : 900);
    RACER.session.speedBoost += milestone.boost;
    RACER.session.cameraKick += milestone.boost * 0.12;
    // Shield regeneration: earn a shield back at streak 5 and 8
    if (milestone.streak >= 5 && RACER.session.shields < 3) {
      RACER.session.shields = Math.min(3, RACER.session.shields + 1);
      setMessage(milestone.text + ' +Shield!', milestone.tone, 1200);
    }
    if (milestone.confetti && typeof launchConfetti === 'function') launchConfetti(900);
    if (typeof sfxLevelUp === 'function' && milestone.streak >= 5) sfxLevelUp();
    else if (typeof sfxStreak === 'function') sfxStreak();
    else if (typeof sfxCorrect === 'function') sfxCorrect();
  }

  function awardRacerCosmetics(accuracy) {
    if (!window.ClassmatesAppState || typeof state === 'undefined' || accuracy < 0.8) return [];
    const progression = ClassmatesAppState.getRacerProgression(state);
    const unlocked = progression.unlocked || [];
    const unlockedRewards = [];
    RACER_COSMETIC_UNLOCKS.forEach(function(reward){
      if (unlocked.indexOf(reward.id) !== -1) return;
      if (unlockedRewards.length > 0) return;
      state = ClassmatesAppState.unlockRacerCosmetic(state, {
        unlockId: reward.id,
        id: reward.cosmeticId,
        type: reward.type,
        name: reward.name,
        cosmeticId: reward.cosmeticId
      });
      unlockedRewards.push(reward);
      if (typeof saveState === 'function') saveState();
    });
    return unlockedRewards;
  }

  function speakPrompt(text) {
    if (!window.speechSynthesis || !text) return false;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    utterance.pitch = 1.02;
    window.speechSynthesis.speak(utterance);
    return true;
  }

  function getPackOutcomes(pack) {
    if (!pack || !Array.isArray(pack.cfeOutcomeLabels)) return [];
    if (window.ClassmatesCurriculum && typeof ClassmatesCurriculum.getOutcomesForPack === 'function') {
      return ClassmatesCurriculum.getOutcomesForPack(pack);
    }
    return pack.cfeOutcomeLabels.map(function(code){
      return { code: code, title: code, description: '' };
    });
  }

  function getIntroOutcomeCopy(pack) {
    const outcomes = getPackOutcomes(pack);
    if (!outcomes.length) return '';
    const primary = outcomes[0];
    const extraCodes = outcomes.slice(1).map(function(outcome){
      return outcome.code;
    }).join(', ');
    return primary.code + ' · ' + primary.title + (primary.description ? (' - ' + primary.description) : '') + (extraCodes ? (' Additional outcomes: ' + extraCodes + '.') : '');
  }

  function recommendStageBand(snapshot) {
    const words = snapshot && snapshot.spellingCorrect ? snapshot.spellingCorrect : 0;
    if (words < 35) return 'Early';
    if (words < 120) return 'First';
    return 'Second';
  }

  function getMissionConfig() {
    const assignment = window.ClassmatesAssignments ? ClassmatesAssignments.getAssignment() : null;
    const isAssignedLaunch = window.__classmatesLaunchSource === 'assignment' && assignment && assignment.activityId === 'southlodgeracers';
    window.__classmatesLaunchSource = null;
    const snapshot = typeof getCurrentPupil === 'function' && getCurrentPupil() ? ClassmatesAppState.loadState(getCurrentPupil()) : {};
    const stageBand = isAssignedLaunch ? assignment.stageBand : recommendStageBand(snapshot);
    const pack = window.ClassmatesSouthlodgeRacersPacks
      ? (isAssignedLaunch
          ? ClassmatesSouthlodgeRacersPacks.getPack(assignment.packId)
          : ClassmatesSouthlodgeRacersPacks.getDefaultPack(stageBand))
      : null;
    const missionLength = isAssignedLaunch ? assignment.missionLength : (stageBand === 'Early' ? 5 : stageBand === 'First' ? 7 : 9);
    return {
      assignment: isAssignedLaunch ? assignment : null,
      stageBand: stageBand,
      pack: pack,
      missionLength: missionLength,
      missionId: 'sr_' + Date.now().toString(36),
      words: window.ClassmatesSouthlodgeRacersPacks
        ? ClassmatesSouthlodgeRacersPacks.buildMissionWords(pack ? pack.id : '', missionLength)
        : []
    };
  }

  function renderMissionIntro() {
    if (!RACER.session) return;
    const introTitle = document.getElementById('racerIntroTitle');
    const introBody = document.getElementById('racerIntroBody');
    const introNote = document.getElementById('racerIntroNote');
    const introCfe = document.getElementById('racerCfeBrief');
    const introLoadout = document.getElementById('racerIntroLoadout');
    const introStart = document.getElementById('racerIntroStart');
    const cfeCopy = getIntroOutcomeCopy(RACER.session.pack);

    if (introTitle) introTitle.textContent = RACER.session.pack.title;
    if (introBody) {
      introBody.textContent = RACER.session.assignment
        ? 'Your teacher launched this class route. Listen for the word, steer into the matching gate, and get set for the 3-2-1 countdown.'
        : 'Listen for the word, steer into the matching gate, and build a clean streak through the route.';
    }
    if (introNote) {
      introNote.textContent = RACER.session.stageBand + ' Level · ' + RACER.session.words.length + ' gates · Pack ' + RACER.session.pack.shortTitle;
    }
    if (introCfe) {
      introCfe.textContent = cfeCopy ? ('CfE focus: ' + cfeCopy) : '';
      introCfe.style.display = cfeCopy ? 'block' : 'none';
    }
    if (introLoadout) {
      introLoadout.textContent = 'Car: ' + RACER.session.loadoutLabels.colorLabel + ' · Trail: ' + RACER.session.loadoutLabels.trailLabel + ' · Title: ' + RACER.session.loadoutLabels.titleLabel;
      introLoadout.style.display = 'block';
    }
    if (introStart) {
      introStart.disabled = false;
      introStart.textContent = RACER.session.assignment ? 'Start class race' : 'Start race';
    }
  }

  function setIntroCountdown(text, stateName) {
    const countdown = document.getElementById('racerIntroCountdown');
    if (!countdown) return;
    countdown.classList.remove('visible', 'pulse');
    countdown.textContent = text || '';
    countdown.dataset.state = stateName || '';
    if (!text) return;
    void countdown.offsetWidth;
    countdown.classList.add('visible', 'pulse');
  }

  function clearMissionCountdown() {
    clearTimeout(RACER.countdownTimer);
    RACER.countdownTimer = null;
    if (RACER.session) RACER.session.countdownActive = false;
    setIntroCountdown('', '');
    const introStart = document.getElementById('racerIntroStart');
    if (introStart) {
      introStart.disabled = false;
      introStart.textContent = RACER.session && RACER.session.assignment ? 'Start class race' : 'Start race';
    }
  }

  function getMissionProgress() {
    if (!RACER.session || !RACER.session.words.length) return 0;
    const total = RACER.session.words.length;
    const currentGateProgress = RACER.currentGate
      ? clamp(
          (RACER.currentGate.position.z - (RACER.currentGate.userData.startZ || -180))
            / (44 - (RACER.currentGate.userData.startZ || -180)),
          0,
          1
        )
      : 0;
    return clamp((RACER.session.completed + currentGateProgress) / total, 0, 1);
  }

  function getPacingProfile(progress) {
    const missionProgress = clamp(typeof progress === 'number' ? progress : getMissionProgress(), 0, 1);
    const midRacePressure = clamp(1 - (Math.abs(missionProgress - 0.58) / 0.34), 0, 1);
    const finishEase = clamp((missionProgress - 0.82) / 0.18, 0, 1);
    return {
      cruiseSpeed: 18 + (missionProgress * 4.4) + (midRacePressure * 3.1) - (finishEase * 5.3),
      gateDelay: 0.94 - (midRacePressure * 0.28) + (finishEase * 0.18)
    };
  }

  function animateRacerFeedback(kind) {
    const brief = document.querySelector('#hdashHud .racer-brief');
    if (!brief) {
      if (typeof flashScreen === 'function') flashScreen(kind !== 'bad');
      return;
    }
    brief.classList.remove('racer-brief-good', 'racer-brief-bad', 'racer-brief-shake');
    void brief.offsetWidth;
    if (kind === 'good') {
      brief.classList.add('racer-brief-good');
      if (typeof flashScreen === 'function') flashScreen(true);
      return;
    }
    brief.classList.add('racer-brief-bad', 'racer-brief-shake');
    if (typeof flashScreen === 'function') flashScreen(false);
  }

  function getNextGateDelay() {
    return getPacingProfile(getMissionProgress()).gateDelay;
  }

  function disposeObject(object) {
    if (!object) return;
    object.traverse(function(node){
      if (node.geometry) node.geometry.dispose();
      if (node.material) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        materials.forEach(function(material){
          if (material.map) material.map.dispose();
          material.dispose();
        });
      }
    });
    if (object.parent) object.parent.remove(object);
  }

  function makeLabelMaterial(text, accent) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 220;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fef8ef';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = accent || '#0f8b63';
    ctx.fillRect(14, 14, canvas.width - 28, canvas.height - 28);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(30, 30, canvas.width - 60, canvas.height - 60);
    ctx.fillStyle = '#163545';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '700 66px Arial';
    ctx.fillText(String(text || '').toUpperCase(), canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return new THREE.MeshBasicMaterial({ map: texture, transparent: false });
  }

  function buildGate(entry, accent) {
    const group = new THREE.Group();
    const barMaterial = new THREE.MeshStandardMaterial({ color: 0x17313f, roughness: 0.7 });
    const signFrame = new THREE.MeshStandardMaterial({ color: 0xf3b53f, roughness: 0.55 });
    const poleGeometry = new THREE.BoxGeometry(0.5, 5.2, 0.5);
    const signGeometry = new THREE.BoxGeometry(4.5, 2.3, 0.3);
    const archGeometry = new THREE.BoxGeometry(4.9, 0.4, 0.5);
    const lanes = [];
    const correctLane = Math.floor(Math.random() * 3);

    for (let index = 0; index < 3; index++) {
      const laneGroup = new THREE.Group();
      laneGroup.position.x = LANE_X[index];

      const leftPole = new THREE.Mesh(poleGeometry, barMaterial);
      leftPole.position.set(-2.1, 2.1, 0);
      const rightPole = leftPole.clone();
      rightPole.position.x = 2.1;
      const arch = new THREE.Mesh(archGeometry, barMaterial);
      arch.position.set(0, 4.4, 0);
      const sign = new THREE.Mesh(signGeometry, signFrame);
      sign.position.set(0, 6.7, 0);
      const signFace = new THREE.Mesh(new THREE.PlaneGeometry(3.7, 1.6), makeLabelMaterial(index === correctLane ? entry.word : entry.confusions[index > correctLane ? index - 1 : index], accent));
      signFace.position.set(0, 6.7, 0.18);

      laneGroup.add(leftPole, rightPole, arch, sign, signFace);
      group.add(laneGroup);
      lanes.push(laneGroup);
    }

    group.userData = {
      wordEntry: entry,
      correctLane: correctLane,
      lanes: lanes
    };
    group.position.z = -180;
    return group;
  }

  function buildCar() {
    const group = new THREE.Group();
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xed6a2c, roughness: 0.55 });
    const cabMaterial = new THREE.MeshStandardMaterial({ color: 0xfff2d9, roughness: 0.45 });
    const bumperMaterial = new THREE.MeshStandardMaterial({ color: 0x163545, roughness: 0.65 });
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x1d2228, roughness: 0.8 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.1, 6.2), bodyMaterial);
    body.position.y = 1;
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.9, 2.4), cabMaterial);
    cab.position.set(0, 1.7, -0.3);
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.35, 0.6), bumperMaterial);
    bumper.position.set(0, 0.55, -3.15);
    group.add(body, cab, bumper);

    const wheelGeometry = new THREE.CylinderGeometry(0.65, 0.65, 0.8, 20);
    [[-1.4, 0.6, -2], [1.4, 0.6, -2], [-1.4, 0.6, 2], [1.4, 0.6, 2]].forEach(function(position){
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(position[0], position[1], position[2]);
      group.add(wheel);
    });

    group.userData.materials = {
      body: bodyMaterial,
      cab: cabMaterial,
      bumper: bumperMaterial,
      wheel: wheelMaterial
    };
    group.position.set(0, 0.2, 48);
    return group;
  }

  function buildRoadSegment(z) {
    const group = new THREE.Group();
    const road = new THREE.Mesh(new THREE.BoxGeometry(18, 0.2, 40), new THREE.MeshStandardMaterial({ color: 0x24313a, roughness: 0.95 }));
    road.position.y = -0.15;
    const vergeLeft = new THREE.Mesh(new THREE.BoxGeometry(22, 0.1, 40), new THREE.MeshStandardMaterial({ color: 0x7f9f52, roughness: 1 }));
    vergeLeft.position.set(-18, -0.18, 0);
    const vergeRight = vergeLeft.clone();
    vergeRight.position.x = 18;
    group.add(road, vergeLeft, vergeRight);

    [-3, 3].forEach(function(x){
      const marker = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.03, 4.4), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 }));
      marker.position.set(x, -0.02, 0);
      group.add(marker);
    });
    group.position.z = z;
    return group;
  }

  function buildTree(side, z) {
    const group = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.4, 2.2, 10), new THREE.MeshStandardMaterial({ color: 0x6a4b2f, roughness: 0.9 }));
    trunk.position.y = 1;
    const crown = new THREE.Mesh(new THREE.ConeGeometry(1.6, 3.8, 12), new THREE.MeshStandardMaterial({ color: 0x2d6b45, roughness: 0.8 }));
    crown.position.y = 3.8;
    group.add(trunk, crown);
    group.position.set(side * (12 + Math.random() * 8), 0, z);
    return group;
  }

  function setupWorld(config) {
    const canvas = document.getElementById('hdash-canvas');
    const container = document.getElementById('hdash');
    RACER.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    RACER.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
    RACER.renderer.setSize(container.clientWidth, container.clientHeight);
    RACER.renderer.setClearColor(0x92d4ee);

    RACER.scene = new THREE.Scene();
    RACER.scene.fog = new THREE.Fog(0x92d4ee, 90, 280);
    RACER.camera = new THREE.PerspectiveCamera(58, container.clientWidth / container.clientHeight, 0.1, 500);
    RACER.camera.position.set(0, 6.4, 68);
    RACER.camera.lookAt(0, 4, -30);
    RACER.clock = new THREE.Clock();

    RACER.scene.add(new THREE.AmbientLight(0xffffff, 0.72));
    const sun = new THREE.DirectionalLight(0xfff2d4, 1.05);
    sun.position.set(20, 35, 16);
    RACER.scene.add(sun);

    for (let index = 0; index < 11; index++) {
      const segment = buildRoadSegment(-index * 40);
      RACER.roadSegments.push(segment);
      RACER.scene.add(segment);
    }
    for (let index = 0; index < 18; index++) {
      const prop = buildTree(index % 2 === 0 ? -1 : 1, -index * 22);
      RACER.props.push(prop);
      RACER.scene.add(prop);
    }

    const mountainMaterial = new THREE.MeshStandardMaterial({ color: 0x7088a1, flatShading: true, roughness: 1 });
    [-55, -32, 0, 30, 56].forEach(function(x, index){
      const mountain = new THREE.Mesh(new THREE.ConeGeometry(16 + (index % 2) * 10, 28 + index * 2, 6), mountainMaterial);
      mountain.position.set(x, 12, -160 - index * 12);
      RACER.scene.add(mountain);
    });

    RACER.car = buildCar();
    RACER.scene.add(RACER.car);
    RACER.touchMode = window.matchMedia && window.matchMedia(TOUCH_QUERY).matches;
    document.getElementById('hdashHud').style.display = 'grid';
  }

  function updateHud() {
    const progress = RACER.session.completed + '/' + RACER.session.words.length;
    const speed = RACER.session.currentSpeed || RACER.session.speed || 0;
    const gateLabel = RACER.session.currentWord ? (RACER.session.completed + 1) : RACER.session.words.length;
    const loadoutLabels = RACER.session.loadoutLabels || getLoadoutLabels(RACER.session.loadout || getRacerLoadout());
    setText('racerStage', RACER.session.stageBand + ' Level');
    setText('racerPack', RACER.session.pack.shortTitle);
    setText('racerObjective', RACER.session.currentWord ? 'Gate ' + gateLabel + ' of ' + RACER.session.words.length : 'Finish line ahead');
    setText('racerTitle', loadoutLabels.titleLabel);
    setText('racerLoadout', 'Car: ' + loadoutLabels.colorLabel + ' · Trail: ' + loadoutLabels.trailLabel);
    setText('racerPromptWord', RACER.session.currentWord ? RACER.session.currentWord.word : 'Get ready');
    setText('racerPromptSentence', RACER.session.currentWord ? RACER.session.currentWord.sentence : 'Press start to open the first spelling gate.');
    setText('racerProgress', progress);
    setText('racerStreak', 'Streak ' + RACER.session.streak + ' · Best ' + RACER.session.maxStreak);
    setText('racerSpeed', Math.round(speed * 4) + ' mph');
    setText('racerShield', RACER.session.shields >= 3 ? 'Full shield' : 'Shield ' + RACER.session.shields);
    var dist = RACER.session.distance || 0;
    setText('racerDist', dist >= 1000 ? (dist / 1000).toFixed(1) + ' km' : Math.round(dist) + ' m');
  }

  function setMessage(text, tone, duration) {
    const element = document.getElementById('racerMessage');
    if (!element) return;
    element.textContent = text || '';
    element.dataset.tone = tone || 'neutral';
    element.classList.add('visible');
    clearTimeout(RACER.messageTimer);
    RACER.messageTimer = setTimeout(function(){
      element.classList.remove('visible');
    }, typeof duration === 'number' ? duration : 1000);
  }

  function setTouchControlsEnabled(enabled) {
    const touch = document.getElementById('racerTouchControls');
    if (!touch) return;
    touch.style.display = RACER.touchMode && enabled ? 'flex' : 'none';
  }

  function canSteer() {
    return !!(RACER.active && RACER.session && RACER.session.running);
  }

  function getSteerDirection(key) {
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') return -1;
    if (key === 'ArrowRight' || key === 'd' || key === 'D') return 1;
    return 0;
  }

  function setHeldDirection(direction) {
    if (!RACER.session) return;
    RACER.session.heldDirection = direction;
  }

  function steerLane(direction, source) {
    if (!canSteer() || !direction) return false;
    const now = (window.performance && performance.now) ? performance.now() : Date.now();
    const nextLane = clamp(RACER.session.targetLane + direction, 0, 2);
    if (nextLane === RACER.session.targetLane) return false;

    RACER.session.targetLane = nextLane;
    RACER.session.lastSteerAt = now;
    RACER.session.nextSteerAt = now + (source === 'touch' ? 105 : 130);
    RACER.session.laneLean = direction * 0.22;
    RACER.session.cameraKick = direction * 0.45;
    return true;
  }

  function refreshHoldSteer(now) {
    if (!canSteer()) return;
    const direction = RACER.session.heldDirection || 0;
    if (!direction) return;
    if (now < (RACER.session.nextSteerAt || 0)) return;
    steerLane(direction, 'hold');
  }

  function bindInput() {
    RACER.keyHandlers = {
      down: function(event){
        if (!canSteer()) return;
        const direction = getSteerDirection(event.key);
        if (direction) {
          if (event.repeat && RACER.session.heldDirection === direction) return;
          setHeldDirection(direction);
          steerLane(direction, 'keyboard');
          return;
        }
        if (event.key === 'r' || event.key === 'R') speakPrompt(RACER.session.currentWord ? RACER.session.currentWord.audioText : '');
      },
      up: function(event){
        const direction = getSteerDirection(event.key);
        if (direction && RACER.session && RACER.session.heldDirection === direction) {
          setHeldDirection(0);
        }
      },
      blur: function(){
        setHeldDirection(0);
      }
    };
    RACER.resizeHandler = function(){
      const container = document.getElementById('hdash');
      if (!RACER.renderer || !RACER.camera || !container) return;
      RACER.camera.aspect = container.clientWidth / container.clientHeight;
      RACER.camera.updateProjectionMatrix();
      RACER.renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('keydown', RACER.keyHandlers.down);
    window.addEventListener('keyup', RACER.keyHandlers.up);
    window.addEventListener('blur', RACER.keyHandlers.blur);
    window.addEventListener('resize', RACER.resizeHandler);

    const left = document.getElementById('racerTouchLeft');
    const right = document.getElementById('racerTouchRight');
    if (left) {
      left.style.touchAction = 'manipulation';
      left.onpointerdown = function(event){
        event.preventDefault();
        if (!canSteer()) return;
        setHeldDirection(-1);
        steerLane(-1, 'touch');
      };
      left.onpointerup = function(){
        if (RACER.session && RACER.session.heldDirection === -1) setHeldDirection(0);
      };
      left.onpointercancel = function(){
        if (RACER.session && RACER.session.heldDirection === -1) setHeldDirection(0);
      };
      left.onpointerleave = function(){
        if (RACER.session && RACER.session.heldDirection === -1) setHeldDirection(0);
      };
    }
    if (right) {
      right.style.touchAction = 'manipulation';
      right.onpointerdown = function(event){
        event.preventDefault();
        if (!canSteer()) return;
        setHeldDirection(1);
        steerLane(1, 'touch');
      };
      right.onpointerup = function(){
        if (RACER.session && RACER.session.heldDirection === 1) setHeldDirection(0);
      };
      right.onpointercancel = function(){
        if (RACER.session && RACER.session.heldDirection === 1) setHeldDirection(0);
      };
      right.onpointerleave = function(){
        if (RACER.session && RACER.session.heldDirection === 1) setHeldDirection(0);
      };
    }
    const replay = document.getElementById('racerReplayPrompt');
    if (replay) replay.onclick = function(){ speakPrompt(RACER.session.currentWord ? RACER.session.currentWord.audioText : ''); };
  }

  function removeGate() {
    if (!RACER.currentGate) return;
    disposeObject(RACER.currentGate);
    RACER.currentGate = null;
  }

  function spawnGate(initial) {
    removeGate();
    if (RACER.session.wordIndex >= RACER.session.words.length) return;
    const entry = RACER.session.words[RACER.session.wordIndex];
    const startZ = initial ? -110 : -180;
    RACER.session.currentWord = entry;
    RACER.currentGate = buildGate(entry, RACER.session.pack.accent);
    RACER.currentGate.position.z = startZ;
    RACER.currentGate.userData.startZ = startZ;
    RACER.scene.add(RACER.currentGate);
    speakPrompt(entry.audioText);
    updateHud();
  }

  function applyWeakItem(entry) {
    if (!window.ClassmatesAppState || typeof state === 'undefined') return;
    state = ClassmatesAppState.addWeakItem(state, 'southlodgeracers', {
      word: entry.word,
      sentence: entry.sentence,
      errorPatternTag: entry.errorPatternTag
    });
  }

  function resolveGate(isCorrect) {
    if (!RACER.currentGate) return;
    const entry = RACER.currentGate.userData.wordEntry;
    RACER.session.completed++;
    if (isCorrect) {
      RACER.session.correct++;
      RACER.session.streak++;
      RACER.session.maxStreak = Math.max(RACER.session.maxStreak, RACER.session.streak);
      RACER.session.speedBoost = 7.5;
      RACER.session.cameraKick = 0.55;
      RACER.session.laneLean = 0;
      animateRacerFeedback('good');
      if (typeof sfxCorrect === 'function') sfxCorrect();
      setMessage(RACER.session.streak >= 2 ? 'Clean line!' : 'Boost!', 'good', 850);
      triggerStreakReward();
    } else {
      RACER.session.streak = 0;
      RACER.session.streakTier = 0;
      RACER.session.shields = Math.max(0, RACER.session.shields - 1);
      RACER.session.penalty = 5.5;
      RACER.session.cameraKick = -0.75;
      RACER.session.laneLean = 0;
      RACER.session.missed.push({ w: entry.word, h: entry.sentence });
      RACER.session.errorPatternCounts[entry.errorPatternTag] = (RACER.session.errorPatternCounts[entry.errorPatternTag] || 0) + 1;
      applyWeakItem(entry);
      animateRacerFeedback('bad');
      if (typeof sfxWrong === 'function') sfxWrong();
      setMessage('Shield hit. Correct word: ' + entry.word, 'bad', 1500);
    }
    removeGate();
    RACER.session.wordIndex++;
    RACER.session.nextSpawnDelay = getNextGateDelay();
    updateHud();
  }

  function finishMission() {
    if (!RACER.active) return;
    const total = RACER.session.words.length || 1;
    const accuracy = RACER.session.correct / total;
    const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.65 ? 2 : accuracy >= 0.35 ? 1 : 0;
    const unlockedCosmetics = awardRacerCosmetics(accuracy);
    const coinBonus = Math.max(8, Math.round(accuracy * 20) + (stars * 4) + (unlockedCosmetics.length * 6));

    if (typeof state !== 'undefined' && window.ClassmatesAppState) {
      state.spellingCorrect = (state.spellingCorrect || 0) + RACER.session.correct;
      if (accuracy >= 0.8) ClassmatesAppState.adaptiveCorrect(state, 'spelling');
      else if (accuracy < 0.45) ClassmatesAppState.adaptiveWrong(state, 'spelling');
      if (typeof addStars === 'function') addStars(stars); else state = ClassmatesAppState.applyStars(state, stars);
      if (typeof recordPlay === 'function') recordPlay(); else state = ClassmatesAppState.applyPlayProgress(state);
      if (typeof checkAch === 'function') {
        checkAch('first_game', true);
        checkAch('spell_10', (state.spellingCorrect || 0) >= 10);
        checkAch('spell_50', (state.spellingCorrect || 0) >= 50);
      }
      if (typeof saveState === 'function') saveState();
    }

    RACER.session.rewardUnlocks = unlockedCosmetics;
    RACER.session.loadout = getRacerLoadout();
    RACER.session.loadoutLabels = getLoadoutLabels(RACER.session.loadout);
    RACER.session.trailEffect = RACER.session.loadout.trailId === 'none' ? { enabled: false } : {
      enabled: true,
      color: RACER.session.loadoutLabels.trail.color,
      density: RACER.session.loadoutLabels.trail.density,
      rise: RACER.session.loadoutLabels.trail.rise,
      size: RACER.session.loadoutLabels.trail.size
    };
    applyCarLoadout(RACER.session.loadout);

    window.__classmatesAttemptMeta = {
      activityId: 'southlodgeracers',
      gameId: 'hdash',
      category: 'literacy',
      title: 'Southlodge Racers',
      subtitle: RACER.session.pack.title + ' · ' + RACER.session.stageBand,
      resultsSubtitle: unlockedCosmetics.length > 0 ? ('Unlocked ' + unlockedCosmetics.map(function(reward){ return reward.name; }).join(' and ') + '.') : (RACER.session.assignment ? 'Assigned spelling mission complete.' : 'Free-play spelling mission complete.'),
      stageBand: RACER.session.stageBand,
      packId: RACER.session.pack.id,
      missionId: RACER.session.config.missionId,
      errorPatternCounts: RACER.session.errorPatternCounts,
      assignment: RACER.session.assignment,
      maxStreak: RACER.session.maxStreak,
      coinBonus: coinBonus,
      loadout: RACER.session.loadout
    };

    window.hdashStop();
    showResults(RACER.session.pack.accent || '#11998e', 'Aa', 'Southlodge Racers Complete!', RACER.session.pack.title, stars, RACER.session.correct, total, function(){ startGame('hdash'); }, RACER.session.missed, coinBonus);
    const rewardLines = [];
    if (unlockedCosmetics.length > 0) rewardLines.push('Unlocked: ' + unlockedCosmetics.map(function(reward){ return reward.name; }).join(' and '));
    rewardLines.push('Coins earned: ' + coinBonus);
    rewardLines.push('Stars earned: ' + stars);
    setTimeout(function(){
      showRacerRewardPopup(rewardLines, RACER.session.pack.accent || '#ffd93d');
    }, 350);
  }

  function stepWorld(delta) {
    if (!RACER.session) return;

    const now = (window.performance && performance.now) ? performance.now() : Date.now();
    refreshHoldSteer(now);

    const pacing = getPacingProfile();
    RACER.session.speed += (pacing.cruiseSpeed - RACER.session.speed) * Math.min(1, delta * 1.8);
    const targetSpeed = clamp(RACER.session.speed + RACER.session.speedBoost - RACER.session.penalty, 14, 32);
    RACER.session.currentSpeed = targetSpeed;
    RACER.session.speedBoost = Math.max(0, RACER.session.speedBoost - delta * 4.2);
    RACER.session.penalty = Math.max(0, RACER.session.penalty - delta * 3.6);
    RACER.session.distance += targetSpeed * delta * 0.5;
    RACER.session.elapsedTime += delta;
    RACER.session.cameraKick = (RACER.session.cameraKick || 0) * Math.max(0, 1 - delta * 4.5);
    RACER.session.laneLean = (RACER.session.laneLean || 0) * Math.max(0, 1 - delta * 6);

    RACER.roadSegments.forEach(function(segment){
      const moveSpeed = targetSpeed;
      segment.position.z += moveSpeed * delta;
      if (segment.position.z > 80) segment.position.z -= RACER.roadSegments.length * 40;
    });
    RACER.props.forEach(function(prop){
      prop.position.z += targetSpeed * delta * 1.08;
      if (prop.position.z > 70) {
        prop.position.z -= 420;
        prop.position.x = (Math.random() > 0.5 ? 1 : -1) * (12 + Math.random() * 8);
      }
    });

    RACER.session.playerX += (LANE_X[RACER.session.targetLane] - RACER.session.playerX) * Math.min(1, delta * 9);
    RACER.car.position.x = RACER.session.playerX;
    RACER.car.position.y = 0.2 + Math.min(0.18, Math.abs(LANE_X[RACER.session.targetLane] - RACER.session.playerX) * 0.04);
    RACER.car.rotation.z = clamp(-((LANE_X[RACER.session.targetLane] - RACER.session.playerX) * 0.06) + (RACER.session.laneLean || 0), -0.28, 0.28);
    RACER.car.rotation.y = clamp((LANE_X[RACER.session.targetLane] - RACER.session.playerX) * 0.03, -0.16, 0.16);
    if (RACER.camera) {
      RACER.camera.position.x += ((RACER.session.playerX * 0.14) - RACER.camera.position.x) * Math.min(1, delta * 4.5);
      RACER.camera.position.y = 6.4 + Math.sin((RACER.session.currentSpeed || targetSpeed) * 0.12) * 0.08;
      RACER.camera.position.z = 68 + (RACER.session.cameraKick || 0) * 0.7;
      RACER.camera.lookAt(RACER.session.playerX * 0.35, 4, -30);
    }

    updateTrailParticles(delta);

    if (RACER.currentGate) {
      RACER.currentGate.position.z += targetSpeed * delta;
      RACER.currentGate.rotation.y = (RACER.session.playerX - LANE_X[RACER.currentGate.userData.correctLane]) * 0.01;
      if (RACER.currentGate.position.z >= 44) {
        const laneDistances = LANE_X.map(function(x){ return Math.abs(x - RACER.session.playerX); });
        let chosenLane = 0;
        laneDistances.forEach(function(value, index){
          if (value < laneDistances[chosenLane]) chosenLane = index;
        });
        resolveGate(chosenLane === RACER.currentGate.userData.correctLane);
      }
    } else if (RACER.session.running) {
      RACER.session.nextSpawnDelay -= delta;
      if (RACER.session.wordIndex >= RACER.session.words.length) finishMission();
      else if (RACER.session.nextSpawnDelay <= 0) spawnGate(false);
    }

    updateHud();
  }

  function loop() {
    if (!RACER.active) return;
    RACER.frameId = requestAnimationFrame(loop);
    const delta = Math.min(RACER.clock.getDelta(), 0.05);
    stepWorld(delta);
    if (!RACER.active || !RACER.renderer || !RACER.scene || !RACER.camera) return;
    RACER.renderer.render(RACER.scene, RACER.camera);
  }

  function launchMissionRun() {
    clearMissionCountdown();
    RACER.session.running = true;
    RACER.session.nextSpawnDelay = 0.18;
    RACER.session.heldDirection = 0;
    RACER.session.currentSpeed = RACER.session.speed;
    RACER.session.streakTier = 0;
    RACER.session.trailSpawnTimer = 0;
    setHudStateClass(null);
    document.getElementById('racerIntro').style.display = 'none';
    setMessage('Go!', 'good', 700);
    spawnGate(true);
    setTouchControlsEnabled(true);
    updateHud();
  }

  function runMissionCountdown(stepIndex) {
    const steps = [
      { text: '3', state: 'countdown', delay: 700 },
      { text: '2', state: 'countdown', delay: 700 },
      { text: '1', state: 'countdown', delay: 700 },
      { text: 'Go!', state: 'go', delay: 380 }
    ];
    if (stepIndex >= steps.length) {
      launchMissionRun();
      return;
    }
    setIntroCountdown(steps[stepIndex].text, steps[stepIndex].state);
    RACER.countdownTimer = setTimeout(function(){
      runMissionCountdown(stepIndex + 1);
    }, steps[stepIndex].delay);
  }

  function startMission() {
    if (!RACER.session || RACER.session.running || RACER.session.countdownActive) return;
    RACER.session.countdownActive = true;
    const introStart = document.getElementById('racerIntroStart');
    if (introStart) {
      introStart.disabled = true;
      introStart.textContent = 'Countdown...';
    }
    setTouchControlsEnabled(false);
    runMissionCountdown(0);
  }

  function completeDebug(mode) {
    if (!RACER.active) return null;
    while (RACER.session.wordIndex < RACER.session.words.length || RACER.currentGate) {
      if (!RACER.currentGate) spawnGate(true);
      resolveGate(mode !== 'wrong');
    }
    finishMission();
    return {
      correct: RACER.session.correct,
      total: RACER.session.words.length
    };
  }

  window.hdashInit = function(){
    window.hdashStop();
    const config = getMissionConfig();
    setupWorld(config);
    RACER.session = {
      config: config,
      assignment: config.assignment,
      words: config.words,
      wordIndex: 0,
      completed: 0,
      correct: 0,
      missed: [],
      errorPatternCounts: {},
      speed: 18,
      speedBoost: 0,
      penalty: 0,
      stageBand: config.stageBand,
      pack: config.pack || { id: 'first-silent-e', title: 'Southlodge Racers', shortTitle: 'Spelling route', accent: '#11998e' },
      shields: 3,
      streak: 0,
      maxStreak: 0,
      playerX: 0,
      targetLane: 1,
      holdDirection: 0,
      currentSpeed: 18,
      nextSteerAt: 0,
      lastSteerAt: 0,
      laneLean: 0,
      cameraKick: 0,
      currentWord: null,
      streakTier: 0,
      trailSpawnTimer: 0,
      loadout: getRacerLoadout(),
      loadoutLabels: null,
      trailEffect: null,
      rewardUnlocks: [],
      rewardPreview: config.rewardPreview || null,
      countdownActive: false,
      running: false,
      nextSpawnDelay: 0,
      distance: 0,
      elapsedTime: 0
    };
    RACER.active = true;
    bindInput();
    RACER.session.loadoutLabels = getLoadoutLabels(RACER.session.loadout);
    RACER.session.trailEffect = RACER.session.loadout.trailId === 'none' ? { enabled: false } : {
      enabled: true,
      color: RACER.session.loadoutLabels.trail.color,
      density: RACER.session.loadoutLabels.trail.density,
      rise: RACER.session.loadoutLabels.trail.rise,
      size: RACER.session.loadoutLabels.trail.size
    };
    applyCarLoadout(RACER.session.loadout);
    clearMissionCountdown();
    renderMissionIntro();
    document.getElementById('racerIntro').style.display = 'grid';
    document.getElementById('racerIntroStart').onclick = startMission;
    setTouchControlsEnabled(false);
    updateHud();
    loop();
  };

  window.hdashStop = function(){
    RACER.active = false;
    if (RACER.frameId) cancelAnimationFrame(RACER.frameId);
    RACER.frameId = null;
    removeGate();
    RACER.roadSegments.forEach(disposeObject);
    RACER.props.forEach(disposeObject);
    RACER.roadSegments = [];
    RACER.props = [];
    if (RACER.car) disposeObject(RACER.car);
    RACER.car = null;
    if (RACER.renderer) RACER.renderer.dispose();
    RACER.renderer = null;
    RACER.scene = null;
    RACER.camera = null;
    RACER.clock = null;
    if (RACER.keyHandlers) {
      window.removeEventListener('keydown', RACER.keyHandlers.down);
      window.removeEventListener('keyup', RACER.keyHandlers.up);
      window.removeEventListener('blur', RACER.keyHandlers.blur);
    }
    if (RACER.resizeHandler) window.removeEventListener('resize', RACER.resizeHandler);
    RACER.keyHandlers = null;
    RACER.resizeHandler = null;
    clearMissionCountdown();
    clearTrailParticles();
    clearTimeout(RACER.streakHudTimer);
    RACER.streakHudTimer = null;
    setTouchControlsEnabled(false);
    const hud = document.getElementById('hdashHud');
    if (hud) hud.style.display = 'none';
    const intro = document.getElementById('racerIntro');
    if (intro) intro.style.display = 'none';
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  window.__southlodgeRacersDebug = {
    completePerfect: function(){ return completeDebug('perfect'); },
    completeWithMisses: function(){ return completeDebug('wrong'); },
    snapshot: function(){
      return RACER.session ? {
        completed: RACER.session.completed,
        total: RACER.session.words.length,
        correct: RACER.session.correct,
        packId: RACER.session.pack.id,
        stageBand: RACER.session.stageBand,
        loadout: RACER.session.loadout,
        rewardUnlocks: RACER.session.rewardUnlocks ? RACER.session.rewardUnlocks.map(function(reward){ return reward.name; }) : [],
        rewardPreview: RACER.session.rewardPreview ? RACER.session.rewardPreview.name : null
      } : null;
    }
  };

  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerModule === 'function') {
    window.ClassmatesPlatform.registerModule('flagship', 'southlodge-racers', {
      owner: 'flagship',
      exports: ['hdashInit', 'hdashStop', '__southlodgeRacersDebug']
    });
  }
  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerService === 'function') {
    window.ClassmatesPlatform.registerService('southlodgeRacers', {
      debug: window.__southlodgeRacersDebug,
      init: window.hdashInit,
      stop: window.hdashStop
    });
  }
})();
