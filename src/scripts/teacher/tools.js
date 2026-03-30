(function(){
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function clampLevel(level) {
    const next = Number(level);
    if (next === 1 || next === 2 || next === 3) return next;
    return 2;
  }

  function formatReportDate() {
    return new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  function getBackupPanelModel(input) {
    const source = input && typeof input === 'object' ? input : {};
    if (!source.storageAvailable) {
      return {
        summaryHtml: 'Local browser storage is unavailable in this environment.',
        statusMessage: 'This browser is blocking local storage for the app.',
        statusColor: '#e74c3c'
      };
    }

    const schoolName = escapeHtml(source.schoolName || 'Classmates');
    const pupilCount = Number(source.pupilCount) || 0;
    const profileCount = Number(source.profileCount) || 0;
    const attemptCount = Number(source.attemptCount) || 0;
    const appRecordCount = Number(source.appRecordCount) || 0;

    return {
      summaryHtml: '<strong>' + schoolName + '</strong><br>' + pupilCount + ' pupils, ' + profileCount + ' saved pupil profiles, ' + attemptCount + ' logged attempts, ' + appRecordCount + ' app records on this device.',
      statusMessage: '',
      statusColor: ''
    };
  }

  function downloadBackup(input) {
    const source = input && typeof input === 'object' ? input : {};
    if (!source.storageAvailable) {
      return {
        ok: false,
        message: 'Backup failed because browser storage is unavailable.',
        color: '#e74c3c'
      };
    }

    const fileName = source.downloadBackup();
    return {
      ok: true,
      fileName: fileName,
      message: 'Backup downloaded: ' + fileName,
      color: '#11998e'
    };
  }

  async function importBackupFile(file, input) {
    const source = input && typeof input === 'object' ? input : {};
    try {
      const payload = await source.importBackupFile(file);
      const when = payload && payload.exportedAt
        ? new Date(payload.exportedAt).toLocaleString('en-GB')
        : 'backup file';

      return {
        ok: true,
        payload: payload,
        message: 'Backup imported from ' + when + '.',
        color: '#11998e'
      };
    } catch (error) {
      return {
        ok: false,
        message: error && error.message ? error.message : 'Backup import failed.',
        color: '#e74c3c'
      };
    }
  }

  function buildWorksheetHtml(level, input) {
    const source = input && typeof input === 'object' ? input : {};
    const resolvedLevel = clampLevel(level);
    const questions = [];
    const answers = [];
    const getSchoolName = typeof source.getSchoolName === 'function' ? source.getSchoolName : function(){ return 'Classmates'; };
    const genMathQuestion = typeof source.genMathQuestion === 'function' ? source.genMathQuestion : function(){ return { text: '0 + 0 = ?', answer: 0 }; };
    const shuffle = typeof source.shuffle === 'function' ? source.shuffle : function(list){ return list; };
    const spellingData = source.spellingData && typeof source.spellingData === 'object' ? source.spellingData : {};
    const spellingWords = Array.isArray(spellingData[resolvedLevel]) ? spellingData[resolvedLevel].slice() : [];

    for (let index = 0; index < 20; index++) {
      const question = genMathQuestion(resolvedLevel);
      questions.push((index + 1) + '. ' + escapeHtml(question.text));
      answers.push((index + 1) + '. ' + escapeHtml(question.answer));
    }

    shuffle(spellingWords);

    const spellingSection = spellingWords.slice(0, 10).map(function(word, index){
      return (index + 1) + '. ' + escapeHtml(word.h) + ' (____________________)';
    }).join('<br>');

    return '<!DOCTYPE html><html><head><title>Worksheet</title><style>@page{margin:15mm}body{font-family:Arial,sans-serif;font-size:14px;line-height:2}h1{font-size:1.3rem;color:#11998e;margin-bottom:4px}h2{font-size:1rem;margin-top:20px;color:#333;border-bottom:1px solid #ddd;padding-bottom:4px}.meta{color:#888;font-size:0.85rem}.answers{page-break-before:always;color:#888;font-size:0.85rem}ol{padding-left:20px}</style></head><body><h1>' + escapeHtml(getSchoolName()) + ' — Classmates Worksheet</h1><p class="meta">' + escapeHtml(formatReportDate()) + ' | Level ' + resolvedLevel + '</p><p><strong>Name:</strong> _______________________________</p><h2>Maths</h2><p>' + questions.join('<br>') + '</p><h2>Spelling</h2><p>Write the word that matches each clue:</p><p>' + spellingSection + '</p><div class="answers"><h2>Answer Key (Maths)</h2><p>' + answers.join(' &nbsp; ') + '</p></div></body></html>';
  }

  function createWhiteboardQuestions(input) {
    const source = input && typeof input === 'object' ? input : {};
    const randomInt = typeof source.randomInt === 'function' ? source.randomInt : function(){ return 2; };
    const genMathQuestion = typeof source.genMathQuestion === 'function' ? source.genMathQuestion : function(){ return { text: '0 + 0 = ?', answer: 0 }; };
    const questions = [];

    for (let index = 0; index < 20; index++) {
      questions.push(genMathQuestion(randomInt(1, 3)));
    }

    return questions;
  }

  function createWhiteboardSession(input) {
    return {
      questions: createWhiteboardQuestions(input),
      idx: 0,
      answerShown: false
    };
  }

  function getWhiteboardCard(session) {
    const activeSession = session && Array.isArray(session.questions) && session.questions.length > 0
      ? session
      : createWhiteboardSession({});
    const question = activeSession.questions[activeSession.idx] || { text: '', answer: '' };

    return {
      questionText: question.text,
      answerText: String(question.answer),
      counterText: 'Question ' + (activeSession.idx + 1) + ' of ' + activeSession.questions.length
    };
  }

  function revealWhiteboardAnswer(session) {
    if (!session || session.answerShown) {
      return { changed: false };
    }

    session.answerShown = true;
    return { changed: true };
  }

  function nextWhiteboardQuestion(session, input) {
    if (!session || !Array.isArray(session.questions) || session.questions.length === 0) {
      return createWhiteboardSession(input);
    }

    session.idx++;
    if (session.idx >= session.questions.length) {
      return createWhiteboardSession(input);
    }

    session.answerShown = false;
    return session;
  }

  window.ClassmatesTeacherTools = {
    getBackupPanelModel: getBackupPanelModel,
    downloadBackup: downloadBackup,
    importBackupFile: importBackupFile,
    buildWorksheetHtml: buildWorksheetHtml,
    createWhiteboardSession: createWhiteboardSession,
    getWhiteboardCard: getWhiteboardCard,
    revealWhiteboardAnswer: revealWhiteboardAnswer,
    nextWhiteboardQuestion: nextWhiteboardQuestion
  };
})();
