(function(){
  function getAssignmentFormState() {
    const assignment = ClassmatesAssignments.getAssignment();
    return {
      activity: assignment && assignment.activity ? assignment.activity : 'maths',
      level: assignment && assignment.level ? assignment.level : '2',
      message: assignment && assignment.message ? assignment.message : ''
    };
  }

  function saveAssignment(input) {
    const assignment = ClassmatesAssignments.saveAssignment(input);
    if (!assignment) {
      return { ok: false, error: 'Choose an activity first.' };
    }

    return {
      ok: true,
      assignment: assignment,
      message: 'Assignment set!'
    };
  }

  function clearAssignment() {
    ClassmatesAssignments.clearAssignment();
    return {
      ok: true,
      state: getAssignmentFormState(),
      message: 'Assignment cleared.'
    };
  }

  function getAssignmentBanner() {
    const assignment = ClassmatesAssignments.getAssignment();
    if (!assignment || !assignment.activity) {
      return {
        visible: false,
        activity: '',
        text: ''
      };
    }

    return {
      visible: true,
      activity: assignment.activity,
      text: assignment.message || ('Your teacher has set: ' + assignment.activity + ' — Tap to start!')
    };
  }

  function listCustomQuizQuestions() {
    return ClassmatesCustomQuiz.listQuestions().map(function(question, index){
      return {
        index: index,
        question: question.question
      };
    });
  }

  function addCustomQuizQuestion(input) {
    return ClassmatesCustomQuiz.addQuestion(input);
  }

  function removeCustomQuizQuestion(index) {
    return {
      ok: true,
      questions: ClassmatesCustomQuiz.removeQuestion(index)
    };
  }

  function hasCustomQuiz() {
    return ClassmatesCustomQuiz.listQuestions().length > 0;
  }

  function getPlayableCustomQuiz() {
    return ClassmatesCustomQuiz.listQuestions();
  }

  window.ClassmatesTeacherAuthoring = {
    getAssignmentFormState: getAssignmentFormState,
    saveAssignment: saveAssignment,
    clearAssignment: clearAssignment,
    getAssignmentBanner: getAssignmentBanner,
    listCustomQuizQuestions: listCustomQuizQuestions,
    addCustomQuizQuestion: addCustomQuizQuestion,
    removeCustomQuizQuestion: removeCustomQuizQuestion,
    hasCustomQuiz: hasCustomQuiz,
    getPlayableCustomQuiz: getPlayableCustomQuiz
  };
})();
