const { createId } = require('./id');

function shuffle(list) {
  const array = [...list];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function buildQuizFromLesson(lesson, { count = 5, difficulty = 'easy' } = {}) {
  const vocabulary = Array.isArray(lesson.vocabulary) ? lesson.vocabulary : [];
  const questions = [];

  const items = shuffle(vocabulary).slice(0, count);
  items.forEach((item) => {
    const options = vocabulary
      .filter((entry) => entry.term !== item.term && entry.meaning)
      .map((entry) => entry.meaning);

    const distractors = shuffle(options).slice(0, 3);
    const allOptions = shuffle([...distractors, item.meaning]);

    questions.push({
      question_id: createId('question'),
      type: 'MCQ',
      question: `What is the meaning of "${item.term}"?`,
      options: allOptions.length ? allOptions : [item.meaning, ''],
      correct_answer: item.meaning,
      explanation: item.example ? `Example: ${item.example}` : '',
      skill_tag: 'vocabulary',
      difficulty,
    });
  });

  return {
    lesson,
    questions,
  };
}

function buildFallbackQuiz(count = 5) {
  const lesson = {
    title: 'Quick Practice',
    topic: 'general',
  };

  const questions = Array.from({ length: count }).map((_, index) => ({
    question_id: createId('question'),
    type: 'MCQ',
    question: `Choose the best option for question ${index + 1}.`,
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correct_answer: 'Option A',
    explanation: 'This is a placeholder explanation for MVP.',
    skill_tag: 'general',
    difficulty: 'easy',
  }));

  return {
    lesson,
    questions,
  };
}

module.exports = {
  buildQuizFromLesson,
  buildFallbackQuiz,
};
