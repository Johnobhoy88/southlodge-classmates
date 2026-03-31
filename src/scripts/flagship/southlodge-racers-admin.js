(function(){
  const ACTIVITY_ID = 'southlodgeracers';
  const DEFAULT_STAGE = 'First';
  const PROGRESS_HEADERS = [
    'Pupil',
    'Stars',
    'Games',
    'Words',
    'Racer Accuracy',
    'Current Pack',
    'Status',
    'Trend',
    'Last Active'
  ];

  const baseAuthoring = window.ClassmatesTeacherAuthoring || {};

  function escapeHtmlSafe(value) {
    if (typeof escapeHtml === 'function') return escapeHtml(value);
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function formatShortDate(value) {
    if (!value) return 'Never';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('en-GB');
  }

  function formatDateTime(value) {
    if (!value) return 'Never';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getStatusClass(status) {
    if (status === 'Secure') return 'status-secure';
    if (status === 'Watch') return 'status-watch';
    if (status === 'Needs support') return 'status-support';
    return 'status-neutral';
  }

  function getStatusRank(status) {
    if (status === 'Needs support') return 0;
    if (status === 'Watch') return 1;
    if (status === 'Secure') return 2;
    return 3;
  }

  function getTrendRank(trend) {
    if (trend === 'Improving') return 2;
    if (trend === 'Steady') return 1;
    if (trend === 'Starting') return 0;
    return -1;
  }

  function loadPupilState(name) {
    return window.ClassmatesAppState
      ? ClassmatesAppState.loadState(name)
      : {};
  }

  function getDefaultPackId(stageBand) {
    const pack = window.ClassmatesSouthlodgeRacersPacks
      ? ClassmatesSouthlodgeRacersPacks.getDefaultPack(stageBand || DEFAULT_STAGE)
      : null;
    return pack ? pack.id : '';
  }

  function getPackMetaSummary(pack) {
    if (!pack) return '';
    const outcomes = window.ClassmatesCurriculum && typeof ClassmatesCurriculum.getOutcomesForPack === 'function'
      ? ClassmatesCurriculum.getOutcomesForPack(pack)
      : [];
    const primaryOutcome = outcomes[0] || null;
    return [
      primaryOutcome ? primaryOutcome.code : (Array.isArray(pack.cfeOutcomeLabels) ? pack.cfeOutcomeLabels[0] : ''),
      primaryOutcome ? primaryOutcome.title : ''
    ].filter(Boolean).join(' · ');
  }

  function getAssignmentFormState() {
    const assignment = window.ClassmatesAssignments
      ? ClassmatesAssignments.getAssignment()
      : null;
    const stageBand = assignment && assignment.stageBand
      ? assignment.stageBand
      : DEFAULT_STAGE;

    return {
      activity: ACTIVITY_ID,
      activityId: ACTIVITY_ID,
      level: stageBand,
      stageBand: stageBand,
      packId: assignment && assignment.packId ? assignment.packId : getDefaultPackId(stageBand),
      missionLength: assignment && assignment.missionLength ? assignment.missionLength : 7,
      message: assignment && assignment.message ? assignment.message : ''
    };
  }

  function buildAssignment(input) {
    const stageBand = window.ClassmatesAssignments
      ? ClassmatesAssignments.normalizeStageBand(input.stageBand || input.level)
      : (input.stageBand || input.level || DEFAULT_STAGE);

    return {
      activityId: ACTIVITY_ID,
      stageBand: stageBand,
      packId: String(input.packId || '').trim() || getDefaultPackId(stageBand),
      missionLength: window.ClassmatesAssignments
        ? ClassmatesAssignments.normalizeMissionLength(input.missionLength)
        : 7,
      message: String(input.message || '').trim(),
      assignedAt: new Date().toISOString()
    };
  }

  function saveAssignmentRecord(input) {
    const assignment = window.ClassmatesAssignments
      ? ClassmatesAssignments.saveAssignment(buildAssignment(input))
      : null;

    if (!assignment) {
      return { ok: false, error: 'The flagship assignment could not be saved.' };
    }

    return {
      ok: true,
      assignment: assignment,
      message: 'Southlodge Racers assignment set.'
    };
  }

  function clearAssignmentRecord() {
    if (window.ClassmatesAssignments) ClassmatesAssignments.clearAssignment();
    return {
      ok: true,
      state: getAssignmentFormState(),
      message: 'Southlodge Racers assignment cleared.'
    };
  }

  function getAssignmentBanner() {
    const assignment = window.ClassmatesAssignments
      ? ClassmatesAssignments.getAssignment()
      : null;
    if (!assignment || assignment.activityId !== ACTIVITY_ID) {
      return {
        visible: false,
        activity: '',
        title: '',
        text: '',
        meta: ''
      };
    }

    const pack = window.ClassmatesSouthlodgeRacersPacks
      ? ClassmatesSouthlodgeRacersPacks.getPack(assignment.packId)
      : null;

    return {
      visible: true,
      activity: ACTIVITY_ID,
      launchId: 'hdash',
      title: 'Teacher mission ready',
      text: assignment.message || ('Race the ' + (pack ? pack.title : 'spelling') + ' route for your class task.'),
      meta: [
        assignment.stageBand + ' Level',
        pack ? pack.title : 'Spelling route',
        assignment.missionLength + ' gates',
        getPackMetaSummary(pack)
      ].filter(Boolean).join(' · ')
    };
  }

  window.ClassmatesTeacherAuthoring = {
    getAssignmentFormState: getAssignmentFormState,
    saveAssignment: saveAssignmentRecord,
    clearAssignment: clearAssignmentRecord,
    getAssignmentBanner: getAssignmentBanner,
    listCustomQuizQuestions: typeof baseAuthoring.listCustomQuizQuestions === 'function' ? baseAuthoring.listCustomQuizQuestions : function(){ return []; },
    addCustomQuizQuestion: typeof baseAuthoring.addCustomQuizQuestion === 'function' ? baseAuthoring.addCustomQuizQuestion : function(){ return { ok: false, error: 'Custom quiz builder unavailable.' }; },
    removeCustomQuizQuestion: typeof baseAuthoring.removeCustomQuizQuestion === 'function' ? baseAuthoring.removeCustomQuizQuestion : function(){ return { ok: false, error: 'Custom quiz builder unavailable.' }; },
    hasCustomQuiz: typeof baseAuthoring.hasCustomQuiz === 'function' ? baseAuthoring.hasCustomQuiz : function(){ return false; },
    getPlayableCustomQuiz: typeof baseAuthoring.getPlayableCustomQuiz === 'function' ? baseAuthoring.getPlayableCustomQuiz : function(){ return []; }
  };

  function buildPupilDetail(name) {
    const stateSnapshot = loadPupilState(name);
    const packMasteries = window.ClassmatesMastery
      ? ClassmatesMastery.listPupilPackMasteries(name)
      : [];
    const overview = window.ClassmatesMastery
      ? ClassmatesMastery.getPupilOverview(name)
      : { recentAttempts: [], weakestPack: null };
    const leadPack = packMasteries[0] || null;
    const racerAccuracy = leadPack ? leadPack.accuracy + '%' : 'No data';
    const currentPack = leadPack ? leadPack.shortTitle : 'No runs yet';
    const status = leadPack ? leadPack.status : 'No data';
    const trend = leadPack ? leadPack.recentTrend : 'Starting';
    const tablesDone = safeArray(stateSnapshot.ttCompleted);
    const storiesRead = safeArray(stateSnapshot.storiesRead);

    return {
      name: name,
      title: name + ' — Southlodge view',
      lastActiveLabel: formatShortDate(stateSnapshot.lastPlayed),
      achievements: safeArray(stateSnapshot.achievements),
      packMasteries: packMasteries,
      recentAttempts: overview.recentAttempts,
      weakestPack: overview.weakestPack,
      stats: [
        { label: 'Stars', value: stateSnapshot.stars || 0 },
        { label: 'Games', value: stateSnapshot.games || 0 },
        { label: 'Words Spelled', value: stateSnapshot.spellingCorrect || 0 },
        { label: 'Rewards Unlocked', value: safeArray(stateSnapshot.unlockedRewards).length },
        { label: 'Racer Accuracy', value: racerAccuracy },
        { label: 'Current Pack', value: currentPack },
        { label: 'Racer Status', value: status }
      ],
      reportStats: [
        { label: 'Stars', value: stateSnapshot.stars || 0 },
        { label: 'Games', value: stateSnapshot.games || 0 },
        { label: 'Words', value: stateSnapshot.spellingCorrect || 0 },
        { label: 'Rewards', value: safeArray(stateSnapshot.unlockedRewards).length },
        { label: 'Maths', value: stateSnapshot.mathsCorrect || 0 },
        { label: 'Stories', value: storiesRead.length + '/18' },
        { label: 'Tables', value: tablesDone.length + '/11' }
      ],
      progressCells: [
        name,
        stateSnapshot.stars || 0,
        stateSnapshot.games || 0,
        stateSnapshot.spellingCorrect || 0,
        racerAccuracy,
        currentPack,
        status,
        trend,
        formatShortDate(stateSnapshot.lastPlayed)
      ],
      sortValues: [
        name.toLowerCase(),
        stateSnapshot.stars || 0,
        stateSnapshot.games || 0,
        stateSnapshot.spellingCorrect || 0,
        leadPack ? leadPack.accuracy : -1,
        currentPack.toLowerCase(),
        getStatusRank(status),
        getTrendRank(trend),
        stateSnapshot.lastPlayed ? new Date(stateSnapshot.lastPlayed).getTime() : 0
      ],
      csvCells: [
        name,
        stateSnapshot.stars || 0,
        stateSnapshot.games || 0,
        stateSnapshot.spellingCorrect || 0,
        leadPack ? leadPack.accuracy : '',
        currentPack,
        status,
        trend,
        stateSnapshot.lastPlayed || 'Never'
      ]
    };
  }

  function listProgressRows() {
    return window.ClassmatesPupils
      ? ClassmatesPupils.listPupils().map(function(name){
          const detail = buildPupilDetail(name);
          return {
            name: name,
            cells: detail.progressCells.slice(),
            sortValues: detail.sortValues.slice(),
            csvCells: detail.csvCells.slice()
          };
        })
      : [];
  }

  function getClassSummary() {
    const pupils = window.ClassmatesPupils ? ClassmatesPupils.listPupils() : [];
    const recentRuns = window.ClassmatesMastery ? ClassmatesMastery.listRecentFlagshipAttempts(6) : [];
    const interventions = window.ClassmatesMastery ? ClassmatesMastery.listInterventionSignals(6) : [];
    const packMasteries = window.ClassmatesMastery ? ClassmatesMastery.listClassPackMasteries() : [];
    let activeToday = 0;
    let totalStars = 0;
    const today = new Date().toDateString();

    pupils.forEach(function(name){
      const snapshot = loadPupilState(name);
      totalStars += snapshot.stars || 0;
      if (snapshot.lastPlayed === today) activeToday++;
    });

    return {
      pupilCount: pupils.length,
      cards: [
        { label: 'Active Today', value: activeToday + '/' + pupils.length, background: '#ecfff7', color: '#0f8b63' },
        { label: 'Total Stars', value: totalStars, background: '#fff8e9', color: '#d08d00' },
        { label: 'Flagship Runs', value: recentRuns.length, background: '#edf5ff', color: '#2563eb' },
        { label: 'Need Support', value: interventions.filter(function(item){ return item.status === 'Needs support'; }).length, background: '#fff1ed', color: '#d9480f' }
      ],
      packMasteries: packMasteries,
      interventions: interventions,
      recentRuns: recentRuns
    };
  }

  window.ClassmatesTeacherSummary = {
    getClassSummary: getClassSummary,
    getPupilDetail: buildPupilDetail,
    getProgressHeaders: function(){
      return PROGRESS_HEADERS.slice();
    },
    listProgressRows: listProgressRows
  };

  function csvEscape(value) {
    const text = String(value == null ? '' : value);
    return /[",\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  }

  function buildPupilReportHtml(name) {
    const detail = buildPupilDetail(name);
    const schoolName = typeof getSchoolName === 'function' ? getSchoolName() : 'South Lodge Primary';
    const masteryHtml = detail.packMasteries.length
      ? detail.packMasteries.map(function(pack){
          return '<tr><td>' + escapeHtmlSafe(pack.packTitle) + '</td><td>' + escapeHtmlSafe(pack.stageBand) + '</td><td>' + escapeHtmlSafe(pack.accuracy) + '%</td><td>' + escapeHtmlSafe(pack.status) + '</td><td>' + escapeHtmlSafe(pack.recentTrend) + '</td></tr>';
        }).join('')
      : '<tr><td colspan="5">No Southlodge Racers runs yet.</td></tr>';

    return '<!DOCTYPE html><html><head><title>Pupil Report</title><style>@page{margin:16mm}body{font-family:Arial,sans-serif;color:#223}h1{font-size:1.4rem;color:#0f8b63}h2{font-size:1rem;margin-top:24px}table{width:100%;border-collapse:collapse;margin-top:10px}th,td{border:1px solid #dde3ea;padding:8px;text-align:left;font-size:0.85rem}.meta{color:#667;font-size:0.85rem}.stats{display:flex;flex-wrap:wrap;gap:8px}.stat{background:#f4f7fb;border-radius:10px;padding:10px 14px;min-width:110px}.stat strong{display:block;font-size:1.3rem;color:#0f8b63}</style></head><body><h1>' + escapeHtmlSafe(schoolName) + '</h1><p class="meta">Southlodge Racers report generated ' + escapeHtmlSafe(formatDateTime(new Date().toISOString())) + '</p><h2>' + escapeHtmlSafe(detail.name) + '</h2><div class="stats">' + detail.reportStats.map(function(stat){ return '<div class="stat"><strong>' + escapeHtmlSafe(stat.value) + '</strong>' + escapeHtmlSafe(stat.label) + '</div>'; }).join('') + '</div><h2>Pack Mastery</h2><table><thead><tr><th>Pack</th><th>Stage</th><th>Accuracy</th><th>Status</th><th>Trend</th></tr></thead><tbody>' + masteryHtml + '</tbody></table></body></html>';
  }

  function buildClassReportHtml() {
    const rows = listProgressRows();
    const summary = getClassSummary();
    const schoolName = typeof getSchoolName === 'function' ? getSchoolName() : 'South Lodge Primary';
    const progressRows = rows.length
      ? rows.map(function(row){
          return '<tr>' + row.cells.map(function(cell){
            return '<td>' + escapeHtmlSafe(cell) + '</td>';
          }).join('') + '</tr>';
        }).join('')
      : '<tr><td colspan="' + PROGRESS_HEADERS.length + '">No pupils registered.</td></tr>';
    const masteryRows = summary.packMasteries.length
      ? summary.packMasteries.map(function(pack){
          return '<tr><td>' + escapeHtmlSafe(pack.packTitle) + '</td><td>' + escapeHtmlSafe(pack.stageBand) + '</td><td>' + escapeHtmlSafe(pack.pupilCount) + '</td><td>' + escapeHtmlSafe(pack.accuracy) + '%</td><td>' + escapeHtmlSafe(pack.status) + '</td></tr>';
        }).join('')
      : '<tr><td colspan="5">No Southlodge Racers data yet.</td></tr>';

    return '<!DOCTYPE html><html><head><title>Classmates Progress Report</title><style>@page{size:landscape;margin:16mm}body{font-family:Arial,sans-serif;color:#223}h1{font-size:1.4rem;color:#0f8b63}h2{font-size:1rem;margin-top:24px}table{width:100%;border-collapse:collapse;margin-top:10px}th,td{border:1px solid #dde3ea;padding:8px;text-align:left;font-size:0.78rem}th{background:#163545;color:#fff}.meta{color:#667;font-size:0.85rem}</style></head><body><h1>' + escapeHtmlSafe(schoolName) + ' — Classmates</h1><p class="meta">Report generated ' + escapeHtmlSafe(formatDateTime(new Date().toISOString())) + '</p><h2>Pupil Overview</h2><table><thead><tr>' + PROGRESS_HEADERS.map(function(header){ return '<th>' + escapeHtmlSafe(header) + '</th>'; }).join('') + '</tr></thead><tbody>' + progressRows + '</tbody></table><h2>Southlodge Racers Class Pack Mastery</h2><table><thead><tr><th>Pack</th><th>Stage</th><th>Pupils</th><th>Accuracy</th><th>Status</th></tr></thead><tbody>' + masteryRows + '</tbody></table></body></html>';
  }

  function buildProgressCsv() {
    const rows = [PROGRESS_HEADERS];
    listProgressRows().forEach(function(row){
      rows.push(row.csvCells.slice());
    });
    return rows.map(function(row){
      return row.map(csvEscape).join(',');
    }).join('\n');
  }

  window.ClassmatesTeacherReports = {
    buildPupilReportHtml: buildPupilReportHtml,
    buildClassReportHtml: buildClassReportHtml,
    buildProgressCsv: buildProgressCsv,
    createCsvFileName: function(){
      return 'classmates-progress-' + new Date().toISOString().slice(0, 10) + '.csv';
    }
  };

  function syncSouthlodgeAssignmentForm(stageBandOverride) {
    const stageEl = document.getElementById('assignLevel');
    const packEl = document.getElementById('assignPackId');
    const activityEl = document.getElementById('assignActivity');
    const metaEl = document.getElementById('assignPackMeta');
    if (!stageEl || !packEl || !activityEl) return;

    const stageBand = stageBandOverride
      ? (window.ClassmatesAssignments ? ClassmatesAssignments.normalizeStageBand(stageBandOverride) : stageBandOverride)
      : stageEl.value;
    const packs = window.ClassmatesSouthlodgeRacersPacks
      ? ClassmatesSouthlodgeRacersPacks.listPacks(stageBand)
      : [];
    const currentValue = packEl.value;
    const nextValue = packs.some(function(pack){ return pack.id === currentValue; })
      ? currentValue
      : getDefaultPackId(stageBand);

    activityEl.value = ACTIVITY_ID;
    stageEl.value = stageBand;
    packEl.innerHTML = packs.map(function(pack){
      return '<option value="' + escapeHtmlSafe(pack.id) + '">' + escapeHtmlSafe(pack.title) + '</option>';
    }).join('');
    packEl.value = nextValue;

    if (metaEl) {
      const selectedPack = window.ClassmatesSouthlodgeRacersPacks
        ? ClassmatesSouthlodgeRacersPacks.getPack(nextValue)
        : null;
      metaEl.innerHTML = selectedPack
        ? '<strong>' + escapeHtmlSafe(selectedPack.skillFocus) + '</strong> · ' + escapeHtmlSafe(getPackMetaSummary(selectedPack))
        : '';
    }
  }

  window.syncSouthlodgeAssignmentForm = syncSouthlodgeAssignmentForm;

  window.showTeacherTab = function(tabId, btn){
    document.querySelectorAll('.teacher-page').forEach(function(page){
      page.classList.remove('active');
    });
    document.querySelectorAll('.teacher-tab').forEach(function(tab){
      tab.classList.remove('active');
    });

    const page = document.getElementById('tp-' + tabId);
    if (page) page.classList.add('active');
    if (btn) btn.classList.add('active');

    if (tabId === 'progress') renderProgressTable();
    if (tabId === 'overview') renderClassSummary();
    if (tabId === 'settings') {
      const schoolNameInput = document.getElementById('schoolNameInput');
      if (schoolNameInput && typeof getSchoolName === 'function') schoolNameInput.value = getSchoolName();
      if (typeof renderBackupPanel === 'function') renderBackupPanel();
    }
    if (tabId === 'assign') {
      const assignment = window.ClassmatesTeacherAuthoring.getAssignmentFormState();
      const stageEl = document.getElementById('assignLevel');
      const messageEl = document.getElementById('assignMessage');
      const lengthEl = document.getElementById('assignMissionLength');
      if (stageEl) stageEl.value = assignment.stageBand;
      if (messageEl) messageEl.value = assignment.message;
      if (lengthEl) lengthEl.value = String(assignment.missionLength);
      syncSouthlodgeAssignmentForm(assignment.stageBand);
      const packEl = document.getElementById('assignPackId');
      if (packEl) packEl.value = assignment.packId;
      syncSouthlodgeAssignmentForm(assignment.stageBand);
    }
  };

  window.saveAssignment = function(){
    const result = window.ClassmatesTeacherAuthoring.saveAssignment({
      activityId: ACTIVITY_ID,
      stageBand: document.getElementById('assignLevel').value,
      packId: document.getElementById('assignPackId').value,
      missionLength: document.getElementById('assignMissionLength').value,
      message: document.getElementById('assignMessage').value
    });
    const statusEl = document.getElementById('assignStatus');
    if (statusEl) {
      statusEl.innerHTML = '<span style="color:' + (result.ok ? '#11998e' : '#d9480f') + '">' + escapeHtmlSafe(result.ok ? result.message : result.error) + '</span>';
    }
    renderAssignmentBanner();
    if (typeof renderBackupPanel === 'function') renderBackupPanel();
  };

  window.clearAssignment = function(){
    const result = window.ClassmatesTeacherAuthoring.clearAssignment();
    const messageEl = document.getElementById('assignMessage');
    const lengthEl = document.getElementById('assignMissionLength');
    if (messageEl) messageEl.value = result.state.message;
    if (lengthEl) lengthEl.value = String(result.state.missionLength);
    syncSouthlodgeAssignmentForm(result.state.stageBand);
    const statusEl = document.getElementById('assignStatus');
    if (statusEl) statusEl.innerHTML = '<span style="color:#667788">' + escapeHtmlSafe(result.message) + '</span>';
    renderAssignmentBanner();
    if (typeof renderBackupPanel === 'function') renderBackupPanel();
  };

  window.renderAssignmentBanner = function(){
    const banner = document.getElementById('assignBanner');
    if (!banner) return;
    const titleEl = document.getElementById('assignBannerTitle');
    const textEl = document.getElementById('assignBannerText');
    const metaEl = document.getElementById('assignBannerMeta');
    const assignment = window.ClassmatesTeacherAuthoring.getAssignmentBanner();

    if (!assignment.visible) {
      banner.style.display = 'none';
      return;
    }

    banner.style.display = 'block';
    if (titleEl) titleEl.textContent = assignment.title;
    if (textEl) textEl.textContent = assignment.text;
    if (metaEl) metaEl.textContent = assignment.meta;
  };

  window.launchAssignment = function(){
    const assignment = window.ClassmatesTeacherAuthoring.getAssignmentBanner();
    if (!assignment.visible) return;
    window.__classmatesLaunchSource = 'assignment';
    startGame(assignment.launchId || 'hdash');
  };

  window.renderClassSummary = function(){
    const el = document.getElementById('classSummary');
    if (!el) return;
    const summary = window.ClassmatesTeacherSummary.getClassSummary();
    if (!summary.pupilCount) {
      el.innerHTML = '';
      return;
    }

    const cardsHtml = summary.cards.map(function(card){
      return '<div class="summary-card" style="background:' + card.background + ';color:' + card.color + '"><div class="summary-value">' + escapeHtmlSafe(card.value) + '</div><div class="summary-label">' + escapeHtmlSafe(card.label) + '</div></div>';
    }).join('');
    const packHtml = summary.packMasteries.length
      ? summary.packMasteries.map(function(pack){
          const errors = pack.commonErrors.length
            ? '<div class="overview-copy">Watch: ' + escapeHtmlSafe(pack.commonErrors.map(function(item){ return item.label; }).join(', ')) + '</div>'
            : '';
          return '<div class="overview-card"><div class="mastery-top"><div><div class="mastery-title">' + escapeHtmlSafe(pack.packTitle) + '</div><div class="overview-stage">' + escapeHtmlSafe(pack.stageBand) + ' · ' + escapeHtmlSafe(pack.pupilCount) + ' pupils</div></div><span class="status-pill ' + getStatusClass(pack.status) + '">' + escapeHtmlSafe(pack.status) + '</span></div><div class="overview-copy">' + escapeHtmlSafe(pack.accuracy) + '% accuracy · ' + escapeHtmlSafe(pack.attemptCount) + ' runs · ' + escapeHtmlSafe(pack.recentTrend) + '</div>' + errors + '</div>';
        }).join('')
      : '<div class="overview-copy">No Southlodge Racers class data yet.</div>';
    const interventionHtml = summary.interventions.length
      ? summary.interventions.map(function(item){
          const errors = item.commonErrors.length ? item.commonErrors.map(function(error){ return error.label; }).join(', ') : 'No repeated error pattern yet';
          return '<div class="overview-list-item"><div><strong>' + escapeHtmlSafe(item.pupilName) + '</strong><div class="overview-copy">' + escapeHtmlSafe(item.packTitle) + ' · ' + escapeHtmlSafe(item.accuracy) + '% · ' + escapeHtmlSafe(item.recentTrend) + '</div><div class="overview-date">' + escapeHtmlSafe(errors) + '</div></div><span class="status-pill ' + getStatusClass(item.status) + '">' + escapeHtmlSafe(item.status) + '</span></div>';
        }).join('')
      : '<div class="overview-copy">No intervention signals right now.</div>';
    const recentHtml = summary.recentRuns.length
      ? summary.recentRuns.map(function(attempt){
          const label = attempt.assignment ? 'Assigned run' : 'Free play';
          const scoreStatus = (attempt.scorePercent || 0) >= 85 ? 'Secure' : (attempt.scorePercent || 0) >= 60 ? 'Watch' : 'Needs support';
          return '<div class="overview-list-item"><div><strong>' + escapeHtmlSafe(attempt.pupilName || 'Unknown pupil') + '</strong><div class="overview-copy">' + escapeHtmlSafe(attempt.title || 'Southlodge Racers') + ' · ' + escapeHtmlSafe(attempt.correct || 0) + '/' + escapeHtmlSafe(attempt.total || 0) + ' · ' + escapeHtmlSafe(label) + '</div><div class="overview-date">' + escapeHtmlSafe(formatDateTime(attempt.recordedAt)) + '</div></div><span class="status-pill ' + getStatusClass(scoreStatus) + '">' + escapeHtmlSafe((attempt.scorePercent || 0) + '%') + '</span></div>';
        }).join('')
      : '<div class="overview-copy">No recent flagship attempts yet.</div>';

    el.innerHTML = '<div class="summary-cards">' + cardsHtml + '</div><div class="overview-grid"><div class="overview-section"><h4>Class Pack Mastery</h4><div class="overview-list">' + packHtml + '</div></div><div class="overview-section"><h4>Intervention Signals</h4><div class="overview-list">' + interventionHtml + '</div></div><div class="overview-section"><h4>Recent Runs</h4><div class="overview-list">' + recentHtml + '</div></div></div>';
  };

  window.renderProgressTable = function(){
    const area = document.getElementById('progressArea');
    if (!area) return;
    const headers = window.ClassmatesTeacherSummary.getProgressHeaders();
    const rows = window.ClassmatesTeacherSummary.listProgressRows();
    if (!rows.length) {
      area.innerHTML = '<p style="color:#8899aa;font-size:0.85rem">No pupils added yet. Add pupils to start tracking Southlodge Racers mastery.</p>';
      return;
    }

    let sortCol = 0;
    let sortDir = 1;

    function renderTable() {
      const sorted = rows.slice().sort(function(left, right){
        const leftValue = left.sortValues[sortCol];
        const rightValue = right.sortValues[sortCol];
        if (leftValue < rightValue) return -sortDir;
        if (leftValue > rightValue) return sortDir;
        return 0;
      });

      let html = '<div class="progress-table-wrap"><table class="progress-table"><thead><tr>';
      headers.forEach(function(header, index){
        html += '<th data-col="' + index + '">' + escapeHtmlSafe(header) + (sortCol === index ? (sortDir === 1 ? ' &#x25B2;' : ' &#x25BC;') : '') + '</th>';
      });
      html += '</tr></thead><tbody>';
      sorted.forEach(function(row){
        html += '<tr>';
        row.cells.forEach(function(cell, index){
          if (index === 0) html += '<td style="cursor:pointer;color:#11998e;font-weight:700" onclick="showPupilDetail(\'' + String(row.name).replace(/'/g, "\\'") + '\')">' + escapeHtmlSafe(cell) + '</td>';
          else html += '<td>' + escapeHtmlSafe(cell) + '</td>';
        });
        html += '</tr>';
      });
      html += '</tbody></table></div>';
      area.innerHTML = html;
      area.querySelectorAll('th').forEach(function(th){
        th.onclick = function(){
          const next = parseInt(th.dataset.col, 10);
          if (sortCol === next) sortDir *= -1;
          else {
            sortCol = next;
            sortDir = 1;
          }
          renderTable();
        };
      });
    }

    renderTable();
  };

  window.showPupilDetail = function(name){
    const detail = window.ClassmatesTeacherSummary.getPupilDetail(name);
    const section = document.getElementById('pupilDetailSection');
    if (!section) return;
    section.style.display = 'block';
    document.getElementById('pupilDetailTitle').textContent = detail.title;

    const statsHtml = detail.stats.map(function(stat){
      return '<div class="stat-card"><span class="sc-val">' + escapeHtmlSafe(stat.value) + '</span><span class="sc-label">' + escapeHtmlSafe(stat.label) + '</span></div>';
    }).join('');
    const masteryHtml = detail.packMasteries.length
      ? detail.packMasteries.map(function(pack){
          const errorHtml = pack.commonErrors.length
            ? '<div class="topic-chip-row">' + pack.commonErrors.map(function(error){
                return '<span class="topic-chip">' + escapeHtmlSafe(error.label) + ' · ' + escapeHtmlSafe(error.count) + '</span>';
              }).join('') + '</div>'
            : '<div class="detail-copy">No repeated error pattern yet.</div>';
          return '<div class="mastery-card"><div class="mastery-top"><div><div class="mastery-title">' + escapeHtmlSafe(pack.packTitle) + '</div><div class="overview-stage">' + escapeHtmlSafe(pack.stageBand) + ' · ' + escapeHtmlSafe(pack.skillFocus) + '</div></div><span class="status-pill ' + getStatusClass(pack.status) + '">' + escapeHtmlSafe(pack.status) + '</span></div><div class="detail-copy">' + escapeHtmlSafe(pack.accuracy) + '% accuracy across ' + escapeHtmlSafe(pack.attemptCount) + ' runs · ' + escapeHtmlSafe(pack.recentTrend) + '</div>' + errorHtml + '</div>';
        }).join('')
      : '<div class="detail-copy">No Southlodge Racers runs yet.</div>';
    const recentHtml = detail.recentAttempts.length
      ? detail.recentAttempts.map(function(attempt){
          const label = attempt.assignment ? 'Assigned run' : 'Free play';
          const scoreStatus = (attempt.scorePercent || 0) >= 85 ? 'Secure' : (attempt.scorePercent || 0) >= 60 ? 'Watch' : 'Needs support';
          return '<div class="overview-list-item"><div><strong>' + escapeHtmlSafe(attempt.title || 'Southlodge Racers') + '</strong><div class="overview-copy">' + escapeHtmlSafe((attempt.correct || 0) + '/' + (attempt.total || 0)) + ' · ' + escapeHtmlSafe(label) + '</div><div class="overview-date">' + escapeHtmlSafe(formatDateTime(attempt.recordedAt)) + '</div></div><span class="status-pill ' + getStatusClass(scoreStatus) + '">' + escapeHtmlSafe((attempt.scorePercent || 0) + '%') + '</span></div>';
        }).join('')
      : '<div class="detail-copy">No recent flagship attempts yet.</div>';

    document.getElementById('pupilDetailContent').innerHTML = '<div class="detail-stat-grid">' + statsHtml + '</div><div class="detail-section"><h4>Pack Mastery</h4><div class="mastery-list">' + masteryHtml + '</div></div><div class="detail-section"><h4>Recent Runs</h4><div class="overview-list">' + recentHtml + '</div></div><div class="detail-footer">Last active: ' + escapeHtmlSafe(detail.lastActiveLabel) + '</div>';
    section.scrollIntoView({ behavior: 'smooth' });
  };

  window.renderTeacher = function(){
    if (typeof renderPupilList === 'function') renderPupilList();
    window.renderClassSummary();
    window.renderProgressTable();
    if (typeof renderCQList === 'function') renderCQList();
    if (typeof getSchoolName === 'function') {
      const schoolNameEl = document.getElementById('schoolName');
      if (schoolNameEl) schoolNameEl.textContent = getSchoolName();
    }
    const pupilCountEl = document.getElementById('pupilCount');
    if (pupilCountEl && window.ClassmatesPupils) pupilCountEl.textContent = ClassmatesPupils.listPupils().length + ' pupils registered';
    if (typeof renderBackupPanel === 'function') renderBackupPanel();
    window.showTeacherTab('overview', document.querySelector('.teacher-tab'));
  };

  window.showResults = function(color, iconText, title, sub, stars, correct, total, playAgainFn, missed){
    const activeScreen = document.querySelector('.screen.active');
    const gameId = activeScreen && activeScreen.id !== 'results' ? activeScreen.id : null;
    const meta = window.__classmatesAttemptMeta || {};
    const hasAssignment = Object.prototype.hasOwnProperty.call(meta, 'assignment');
    const attempt = gameId && window.ClassmatesAttempts
      ? ClassmatesAttempts.recordAttempt({
          pupilName: typeof getCurrentPupil === 'function' ? getCurrentPupil() : null,
          gameId: meta.gameId || gameId,
          activityId: meta.activityId || gameId,
          category: meta.category || (typeof GAME_CATS !== 'undefined' ? GAME_CATS[gameId] || null : null),
          title: meta.title || title,
          subtitle: meta.subtitle || sub,
          stageBand: meta.stageBand || null,
          packId: meta.packId || null,
          missionId: meta.missionId || null,
          correct: correct,
          total: total,
          stars: stars,
          errorPatternCounts: meta.errorPatternCounts || null,
          assignment: hasAssignment ? meta.assignment : (typeof getAssignment === 'function' ? getAssignment() : null)
        })
      : null;

    showScreen('results');
    const icon = document.getElementById('resultsIcon');
    icon.style.background = 'linear-gradient(135deg,' + color + ',' + (typeof lighten === 'function' ? lighten(color) : color) + ')';
    icon.textContent = iconText;
    document.getElementById('resultsTitle').textContent = title;
    document.getElementById('resultsSub').textContent = meta.resultsSubtitle || (typeof getEncouragement === 'function' ? getEncouragement(stars) : sub);

    const starRow = document.getElementById('starRow');
    starRow.innerHTML = '';
    for (let index = 0; index < 3; index++) {
      const star = document.createElement('div');
      star.className = 'star ' + (index < stars ? 'earned' : 'empty');
      star.innerHTML = typeof STAR_SVG !== 'undefined' ? STAR_SVG : '★';
      if (index < stars) star.style.animationDelay = (index * 0.15) + 's';
      starRow.appendChild(star);
    }

    const scorePercent = total ? Math.round((correct / total) * 100) : 0;
    const streakValue = meta.maxStreak || 0;
    document.getElementById('resultsStats').innerHTML = '<div class="rs-item"><div class="rs-num" id="rsCorrect">0/' + total + '</div><div class="rs-lbl">Correct</div></div><div class="rs-item"><div class="rs-num" id="rsScore">0%</div><div class="rs-lbl">Score</div></div><div class="rs-item"><div class="rs-num" id="rsStreak">0</div><div class="rs-lbl">Best Streak</div></div>';
    setTimeout(function(){
      const correctEl = document.getElementById('rsCorrect');
      const scoreEl = document.getElementById('rsScore');
      const streakEl = document.getElementById('rsStreak');
      if (correctEl && typeof animateCounterSuffix === 'function') animateCounterSuffix(correctEl, correct, '/' + total, 600); else if (correctEl) correctEl.textContent = correct + '/' + total;
      if (scoreEl && typeof animateCounterSuffix === 'function') animateCounterSuffix(scoreEl, scorePercent, '%', 600); else if (scoreEl) scoreEl.textContent = scorePercent + '%';
      if (streakEl && typeof animateCounter === 'function') animateCounter(streakEl, streakValue, 600); else if (streakEl) streakEl.textContent = String(streakValue);
    }, 80);

    let packProgressHtml = '';
    if (attempt && attempt.activityId === ACTIVITY_ID && window.ClassmatesMastery && attempt.packId && attempt.pupilName) {
      const packSummary = ClassmatesMastery.buildPackSummary(attempt.pupilName, attempt.packId);
      const assignmentLabel = attempt.assignment ? 'Assigned run' : 'Free play';
      const errorSummary = packSummary.commonErrors.length
        ? '<div class="topic-chip-row">' + packSummary.commonErrors.map(function(error){
            return '<span class="topic-chip">' + escapeHtmlSafe(error.label) + ' · ' + escapeHtmlSafe(error.count) + '</span>';
          }).join('') + '</div>'
        : '<div class="detail-copy">No repeated spelling trap yet.</div>';
      packProgressHtml = '<div class="detail-section" style="max-width:420px;margin:16px auto 0;text-align:left"><h4>Pack Progress</h4><div class="mastery-card"><div class="mastery-top"><div><div class="mastery-title">' + escapeHtmlSafe(packSummary.packTitle) + '</div><div class="overview-stage">' + escapeHtmlSafe(packSummary.stageBand) + ' · ' + escapeHtmlSafe(assignmentLabel) + '</div></div><span class="status-pill ' + getStatusClass(packSummary.status) + '">' + escapeHtmlSafe(packSummary.status) + '</span></div><div class="detail-copy">' + escapeHtmlSafe(packSummary.accuracy) + '% accuracy across ' + escapeHtmlSafe(packSummary.attemptCount) + ' runs · ' + escapeHtmlSafe(packSummary.recentTrend) + '</div>' + errorSummary + '</div></div>';
    }

    const rewardUnlocks = safeArray(meta.rewardUnlocks);
    const rewardPreview = meta.rewardPreview && typeof meta.rewardPreview === 'object' ? meta.rewardPreview : null;
    let rewardHtml = '';
    if (rewardUnlocks.length) {
      rewardHtml += '<div class="detail-section" style="max-width:420px;margin:16px auto 0;text-align:left"><h4>Rewards unlocked</h4>';
      rewardUnlocks.forEach(function(reward){
        rewardHtml += '<div class="mastery-card"><div class="mastery-top"><div><div class="mastery-title">' + escapeHtmlSafe(reward.name) + '</div><div class="overview-stage">' + escapeHtmlSafe(reward.kind === 'pack' ? 'Content pack' : 'Cosmetic') + (reward.threshold ? ' · ' + escapeHtmlSafe(reward.threshold) : '') + '</div></div><span class="status-pill status-secure">Unlocked</span></div><div class="detail-copy">' + escapeHtmlSafe(reward.description || 'Reward earned through the race.') + '</div></div>';
      });
      rewardHtml += '</div>';
    }
    if (rewardPreview && rewardPreview.name) {
      rewardHtml += '<div class="detail-section" style="max-width:420px;margin:16px auto 0;text-align:left"><h4>Next reward</h4><div class="mastery-card"><div class="mastery-top"><div><div class="mastery-title">' + escapeHtmlSafe(rewardPreview.name) + '</div><div class="overview-stage">' + escapeHtmlSafe(rewardPreview.kind === 'pack' ? 'Content pack' : 'Cosmetic') + (rewardPreview.threshold ? ' · ' + escapeHtmlSafe(rewardPreview.threshold) : '') + '</div></div><span class="status-pill status-watch">Coming up</span></div><div class="detail-copy">' + escapeHtmlSafe(rewardPreview.description || 'Keep racing to unlock this next.') + '</div></div></div>';
    }

    let missedHtml = '';
    if (missed && missed.length) {
      missedHtml = '<div style="margin-top:16px;text-align:left;max-width:420px;margin-left:auto;margin-right:auto;"><div style="font-family:Fredoka One,Comic Sans MS,cursive;font-size:1rem;color:#e17055;margin-bottom:8px;">Spelling choices to revisit</div>' + missed.map(function(item){
        return '<div style="background:#fff0ed;border:2px solid #fad0c4;border-radius:10px;padding:10px 14px;margin-bottom:6px;"><strong style="text-transform:capitalize;color:#2d3436;">' + escapeHtmlSafe(item.w || item.word) + '</strong><span style="color:#636e72;font-size:0.85rem;margin-left:8px;">— ' + escapeHtmlSafe(item.h || item.hint || item.sentence || '') + '</span></div>';
      }).join('') + '</div>';
    }
    document.getElementById('missedWords').innerHTML = rewardHtml + packProgressHtml + missedHtml;

    if (typeof addCoins === 'function') addCoins(correct + (correct === total ? 10 : 0));
    const certBtn = document.getElementById('certBtn');
    if (stars >= 3 && certBtn) {
      certBtn.style.display = 'inline-flex';
      certBtn.onclick = function(){ if (typeof printCert === 'function') printCert(title, sub); };
    } else if (certBtn) certBtn.style.display = 'none';
    document.getElementById('resultsPlayAgain').onclick = playAgainFn;

    if (stars >= 3) {
      if (typeof sfxLevelUp === 'function') sfxLevelUp();
      if (typeof launchConfetti === 'function') launchConfetti(2500);
    } else if (stars >= 2) {
      if (typeof sfxStreak === 'function') sfxStreak();
      if (typeof launchConfetti === 'function') launchConfetti(1500);
    } else if (stars >= 1) {
      if (typeof sfxStreak === 'function') sfxStreak();
    } else if (typeof sfxWrong === 'function') sfxWrong();

    window.__classmatesAttemptMeta = null;
    if (typeof renderAssignmentBanner === 'function') renderAssignmentBanner();
  };

  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerModule === 'function') {
    window.ClassmatesPlatform.registerModule('flagship', 'southlodge-racers-admin', {
      owner: 'flagship',
      exports: [
        'ClassmatesTeacherAuthoring',
        'ClassmatesTeacherSummary',
        'ClassmatesTeacherReports',
        'showTeacherTab',
        'renderTeacher',
        'renderClassSummary',
        'renderProgressTable',
        'showPupilDetail',
        'renderAssignmentBanner',
        'launchAssignment',
        'showResults'
      ]
    });
    window.ClassmatesPlatform.registerModule('flagship', 'teacher-dashboard', {
      owner: 'flagship',
      exports: ['teacherDashboard', 'showTeacherTab', 'renderTeacher', 'renderClassSummary', 'renderProgressTable', 'showPupilDetail']
    });
  }
  if (window.ClassmatesPlatform && typeof window.ClassmatesPlatform.registerService === 'function') {
    window.ClassmatesPlatform.registerService('teacherDashboard', {
      clearAssignment: window.clearAssignment,
      launchAssignment: window.launchAssignment,
      renderAssignmentBanner: window.renderAssignmentBanner,
      renderClassSummary: window.renderClassSummary,
      renderProgressTable: window.renderProgressTable,
      renderTeacher: window.renderTeacher,
      saveAssignment: window.saveAssignment,
      showPupilDetail: window.showPupilDetail,
      showResults: window.showResults,
      showTeacherTab: window.showTeacherTab,
      syncSouthlodgeAssignmentForm: window.syncSouthlodgeAssignmentForm
    });
  }
})();
