const { createId } = require('./id');

function shuffle(list) {
  const array = [...list];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getDifficulty(levelTag, targetExam, requestedDifficulty) {
  if (requestedDifficulty && ['easy', 'medium', 'hard'].includes(requestedDifficulty)) {
    return requestedDifficulty;
  }

  const level = (levelTag || '').toLowerCase();
  if (level.includes('beginner') || level.includes('basic')) return 'easy';
  if (level.includes('advanced') || level.includes('upper')) return 'hard';
  return 'medium';
}

function createMCQFromVocabulary(item, vocabulary, difficulty) {
  const distractors = shuffle(
    vocabulary
      .filter((entry) => entry.term !== item.term && entry.meaning)
      .map((entry) => entry.meaning)
  ).slice(0, 3);

  const allOptions = shuffle([...distractors, item.meaning]);

  return {
    question_id: createId('question'),
    type: 'MCQ',
    question: `Which of the following best describes "${item.term}"?`,
    options: allOptions.length >= 2 ? allOptions : [item.meaning, ''],
    correct_answer: item.meaning,
    explanation: item.example ? `Example: ${item.example}` : `A ${item.term} refers to its meaning.`,
    skill_tag: 'vocabulary',
    difficulty,
    source: 'lesson-vocabulary',
  };
}

function createVocabularyMeaningQuestion(item, vocabulary, difficulty) {
  const distractors = shuffle(
    vocabulary
      .filter((entry) => entry.term !== item.term && entry.meaning)
      .map((entry) => entry.meaning)
  ).slice(0, 3);

  const allOptions = shuffle([...distractors, item.meaning]);

  return {
    question_id: createId('question'),
    type: 'vocabulary_meaning',
    question: `What is the meaning of "${item.term}"?`,
    options: allOptions.length >= 2 ? allOptions : [item.meaning, ''],
    correct_answer: item.meaning,
    explanation: item.example ? `Example: ${item.example}` : '',
    skill_tag: 'vocabulary',
    difficulty,
    source: 'lesson-vocabulary',
  };
}

function createFillInBlank(item, difficulty) {
  if (!item.example) {
    return null;
  }

  const term = item.term;
  const sentence = item.example;
  const blankSentence = sentence.replace(new RegExp(term, 'gi'), '______');

  if (blankSentence === sentence) {
    return null;
  }

  return {
    question_id: createId('question'),
    type: 'fill_in_the_blank',
    question: `Complete the sentence: "${blankSentence}"`,
    options: [term],
    correct_answer: term,
    explanation: `The word "${term}" fits in this context: ${sentence}`,
    skill_tag: 'vocabulary',
    difficulty,
    source: 'lesson-vocabulary',
  };
}

function createGrammarCorrection(grammarPoint, examples, difficulty) {
  const { rule, example } = grammarPoint;

  if (!example || !rule) {
    return null;
  }

  const incorrectSentence = example
    .replace(/(is|are|was|were)/i, 'be')
    .replace(/(do|does|did)/i, 'do/be')
    .replace(/(have|has|had)/i, 'have/be');

  if (incorrectSentence === example) {
    return {
      question_id: createId('question'),
      type: 'grammar_correction',
      question: `Which option correctly applies the rule: "${rule}"? Sentence: "${example}"`,
      options: [example, example + ' (incorrectly modified)', 'Option C', 'Option D'],
      correct_answer: example,
      explanation: `Rule: ${rule}`,
      skill_tag: 'grammar',
      difficulty,
      source: 'lesson-grammar',
    };
  }

  return {
    question_id: createId('question'),
    type: 'grammar_correction',
    question: `Which option correctly applies the rule: "${rule}"? Sentence: "${incorrectSentence}"`,
    options: [example, incorrectSentence, 'Option C', 'Option D'],
    correct_answer: example,
    explanation: `Correct form follows: ${rule}`,
    skill_tag: 'grammar',
    difficulty,
    source: 'lesson-grammar',
  };
}

function buildQuizFromLesson(lesson, { count = 10, difficulty = 'easy' } = {}) {
  const vocabulary = Array.isArray(lesson.vocabulary) ? lesson.vocabulary : [];
  const grammarPoints = Array.isArray(lesson.grammar_points) ? lesson.grammar_points : [];
  const questions = [];
  const actualDifficulty = getDifficulty(lesson.level_tag, lesson.target_exam, difficulty);

  const vocabQuestions = vocabulary.map((item) =>
    createVocabularyMeaningQuestion(item, vocabulary, actualDifficulty)
  );

  if (vocabQuestions.length >= count) {
    const selected = shuffle(vocabQuestions).slice(0, count);
    return {
      lesson: { ...lesson, level_tag: lesson.level_tag || actualDifficulty },
      questions: selected,
    };
  }

  questions.push(...vocabQuestions);
  const remaining = count - questions.length;

  const blankQuestions = vocabulary
    .map((item) => createFillInBlank(item, actualDifficulty))
    .filter(Boolean);

  if (blankQuestions.length > 0) {
    questions.push(...shuffle(blankQuestions).slice(0, remaining));
  }

  if (grammarPoints.length > 0 && questions.length < count) {
    const grammarQuestions = grammarPoints
      .map((gp) => createGrammarCorrection(gp, lesson.examples || [], actualDifficulty))
      .filter(Boolean);

    if (grammarQuestions.length > 0) {
      questions.push(...shuffle(grammarQuestions).slice(0, count - questions.length));
    }
  }

  while (questions.length < count) {
    const fallbackQuestion = createFallbackMCQ(questions.length + 1, actualDifficulty);
    questions.push(fallbackQuestion);
  }

  return {
    lesson: { ...lesson, level_tag: lesson.level_tag || actualDifficulty },
    questions: questions.slice(0, count),
  };
}

function createMCQ(item, vocabulary, difficulty) {
  const distractors = shuffle(
    vocabulary
      .filter((entry) => entry.term !== item.term && entry.meaning)
      .map((entry) => entry.meaning)
  ).slice(0, 3);

  const allOptions = shuffle([...distractors, item.meaning]);

  return {
    question_id: createId('question'),
    type: 'MCQ',
    question: `Which option best matches "${item.term}"?`,
    options: allOptions.length >= 2 ? allOptions : [item.meaning, ''],
    correct_answer: item.meaning,
    explanation: item.example ? `Example: ${item.example}` : '',
    skill_tag: 'vocabulary',
    difficulty,
    source: 'lesson-vocabulary',
  };
}

function createFallbackMCQ(index, difficulty) {
  const vocabOptions = [
    { term: 'deadline', meaning: 'the latest time for completion' },
    { term: 'schedule', meaning: 'a plan of times for tasks' },
    { term: 'proposal', meaning: 'a formal plan or suggestion' },
    { term: 'approval', meaning: 'official agreement or consent' },
    { term: 'deadline', meaning: 'a completion time limit' },
  ];

  const item = vocabOptions[index % vocabOptions.length];
  const distractors = shuffle(vocabOptions.filter((v) => v.term !== item.term))
    .map((v) => v.meaning)
    .slice(0, 3);

  const allOptions = shuffle([...distractors, item.meaning]);

  return {
    question_id: createId('question'),
    type: 'MCQ',
    question: `What is the meaning of "${item.term}"?`,
    options: allOptions.length >= 2 ? allOptions : [item.meaning, ''],
    correct_answer: item.meaning,
    explanation: `A ${item.term} is ${item.meaning}.`,
    skill_tag: 'vocabulary',
    difficulty,
    source: 'fallback-vocabulary',
  };
}

function buildFallbackQuiz(count = 10) {
  const lesson = {
    title: 'Quick Practice',
    topic: 'general',
    level_tag: 'beginner',
  };

  const fallbackVocab = [
    { term: 'deadline', meaning: 'the latest time for completion' },
    { term: 'schedule', meaning: 'a plan of times for tasks' },
    { term: 'proposal', meaning: 'a formal plan or suggestion' },
    { term: 'meeting', meaning: 'a gathering for discussion' },
    { term: 'budget', meaning: 'a financial plan' },
    { term: 'report', meaning: 'a formal account or statement' },
    { term: 'deadline', meaning: 'a time limit for completion' },
  ];

  const questions = shuffle(fallbackVocab).slice(0, count).map((item, index) =>
    createFallbackMCQ(index, 'easy')
  );

  return {
    lesson,
    questions,
  };
}

module.exports = {
  buildQuizFromLesson,
  buildFallbackQuiz,
};