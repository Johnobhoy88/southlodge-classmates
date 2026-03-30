(function(){
  const CFE_OUTCOMES = {
    'LIT 0-21a': {
      code: 'LIT 0-21a',
      title: 'Spelling Early',
      description: 'I explore sounds, letters and words, discovering how they work together, and I can use what I learn to help me as I read and write.'
    },
    'ENG 0-12a': {
      code: 'ENG 0-12a',
      title: 'Phonics Early',
      description: 'I explore sounds, letters and words, discovering how they work together, and I can use what I learn to help me as I read and write.'
    },
    'LIT 1-21a': {
      code: 'LIT 1-21a',
      title: 'Spelling First',
      description: 'I can spell the most commonly used words, using my knowledge of letter patterns and spelling rules, and use resources to help me or check my spelling.'
    },
    'ENG 1-12a': {
      code: 'ENG 1-12a',
      title: 'Phonics First',
      description: 'I can use my knowledge of sight vocabulary, phonics, context clues, punctuation and grammar to read with understanding and expression.'
    },
    'LIT 2-21a': {
      code: 'LIT 2-21a',
      title: 'Spelling Second',
      description: 'I can spell most commonly used words and use my knowledge of letter patterns and spelling rules to help me spell less familiar words.'
    },
    'ENG 2-12a': {
      code: 'ENG 2-12a',
      title: 'Phonics Second',
      description: 'I can select and use a range of strategies and resources before I read, and as I read, to make meaning clear and give expression to my reading.'
    },
    'LIT 2-14a': {
      code: 'LIT 2-14a',
      title: 'Contextual Clues',
      description: 'Using what I know about the features of different types of texts, I can find, select, sort and use information for a specific purpose.'
    },
    'LIT 2-24a': {
      code: 'LIT 2-24a',
      title: 'Vocabulary Second',
      description: 'I can use my knowledge of word structure, for example roots, prefixes and suffixes, to help me understand and spell new words.'
    },
    'MNU 0-01a': {
      code: 'MNU 0-01a',
      title: 'Number early',
      description: 'I am developing a sense of size and amount by observing, exploring, using and communicating with others about things in the world around me.'
    },
    'MNU 1-01a': {
      code: 'MNU 1-01a',
      title: 'Number first',
      description: 'I have investigated how whole numbers are constructed, can understand the importance of zero within the system and can use my knowledge to explain the link between a digit, its place and its value.'
    },
    'MNU 2-01a': {
      code: 'MNU 2-01a',
      title: 'Number second',
      description: 'I have extended the range of whole numbers I can work with and having explored the evidence, can confidently use my knowledge of place value and its importance to explain how the number system works.'
    }
  };

  function getOutcome(code) {
    return CFE_OUTCOMES[code] || { code: code, title: code, description: 'Unknown outcome' };
  }

  function getOutcomesForPack(pack) {
    if (!pack.cfeOutcomeLabels || !Array.isArray(pack.cfeOutcomeLabels)) return [];
    return pack.cfeOutcomeLabels.map(getOutcome);
  }

  window.ClassmatesCurriculum = {
    getOutcome: getOutcome,
    getOutcomesForPack: getOutcomesForPack
  };
})();
