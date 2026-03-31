(function(){
  const CUSTOM_QUIZ_KEY = 'classmates_custom_quiz';

  function normalizeText(value) {
    return String(value || '').trim();
  }

  function uniqueOptions(options) {
    const seen = new Set();
    const result = [];
    options.forEach(function(option){
      const normalized = normalizeText(option);
      if (!normalized || seen.has(normalized)) return;
      seen.add(normalized);
      result.push(normalized);
    });
    return result;
  }

  function normalizeQuestion(input) {
    const source = input && typeof input === 'object' ? input : {};
    const question = normalizeText(source.question);
    const correct = normalizeText(source.correct);
    const options = uniqueOptions([correct].concat(Array.isArray(source.options) ? source.options : []));

    if (!question || !correct || options.length < 2) {
      return null;
    }

    if (!options.includes(correct)) {
      options.unshift(correct);
    }

    return {
      question: question,
      correct: correct,
      options: options
    };
  }

  function listQuestions() {
    const stored = storageGetJson(CUSTOM_QUIZ_KEY, []);
    if (!Array.isArray(stored)) return [];
    return stored.map(normalizeQuestion).filter(Boolean);
  }

  function saveQuestions(questions) {
    const next = Array.isArray(questions) ? questions.map(normalizeQuestion).filter(Boolean) : [];
    storageSetJson(CUSTOM_QUIZ_KEY, next);
    return next;
  }

  function addQuestion(input) {
    const question = normalizeQuestion(input);
    if (!question) {
      return { ok: false, error: 'Need at least question + 2 options' };
    }

    const questions = listQuestions();
    questions.push(question);

    return {
      ok: true,
      question: question,
      questions: saveQuestions(questions)
    };
  }

  function removeQuestion(index) {
    const questions = listQuestions();
    const nextIndex = Number(index);
    if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= questions.length) {
      return questions;
    }

    questions.splice(nextIndex, 1);
    return saveQuestions(questions);
  }

  window.ClassmatesCustomQuiz = {
    listQuestions: listQuestions,
    saveQuestions: saveQuestions,
    addQuestion: addQuestion,
    removeQuestion: removeQuestion
  };
})();
