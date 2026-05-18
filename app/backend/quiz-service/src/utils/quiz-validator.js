function normalizeString(value) {
  return String(value || '').trim();
}

function validateGenerateRequest(payload) {
  const errors = [];
  const value = {};

  if (payload.count !== undefined) {
    const count = Number(payload.count);
    if (!Number.isInteger(count) || count <= 0 || count > 50) {
      errors.push('count must be between 1 and 50');
    } else {
      value.count = count;
    }
  }

  if (payload.title !== undefined) {
    value.title = normalizeString(payload.title);
  }

  if (payload.topic !== undefined) {
    value.topic = normalizeString(payload.topic);
  }

  if (payload.lessonId !== undefined || payload.lesson_id !== undefined) {
    value.lessonId = normalizeString(payload.lessonId || payload.lesson_id);
  }

  if (payload.userId !== undefined || payload.user_id !== undefined) {
    value.userId = normalizeString(payload.userId || payload.user_id);
  }

  if (payload.targetExam !== undefined || payload.target_exam !== undefined) {
    value.targetExam = normalizeString(payload.targetExam || payload.target_exam);
  }

  if (payload.levelTag !== undefined || payload.level_tag !== undefined) {
    value.levelTag = normalizeString(payload.levelTag || payload.level_tag);
  }

  if (payload.difficulty !== undefined) {
    value.difficulty = normalizeString(payload.difficulty);
  }

  if (payload.source !== undefined) {
    value.source = normalizeString(payload.source);
  }

  if (payload.weakTopics !== undefined) {
    value.weakTopics = Array.isArray(payload.weakTopics) ? payload.weakTopics : [];
  }

  if (payload.chatSessionIds !== undefined) {
    value.chatSessionIds = Array.isArray(payload.chatSessionIds) ? payload.chatSessionIds : [];
  }

  if (payload.flashcardIds !== undefined) {
    value.flashcardIds = Array.isArray(payload.flashcardIds) ? payload.flashcardIds : [];
  }

  if (payload.vocabulary !== undefined) {
    value.vocabulary = Array.isArray(payload.vocabulary) ? payload.vocabulary : [];
  }

  if (payload.questions !== undefined) {
    if (!Array.isArray(payload.questions)) {
      errors.push('questions must be an array');
    } else {
      value.questions = payload.questions.map((question) => ({
        question_id: question.question_id || question.questionId || null,
        type: question.type || 'MCQ',
        question: normalizeString(question.question),
        options: Array.isArray(question.options) ? question.options.map((opt) => String(opt)) : [],
        correct_answer: normalizeString(question.correct_answer || question.correctAnswer),
        explanation: normalizeString(question.explanation || ''),
        skill_tag: normalizeString(question.skill_tag || question.skillTag || 'general'),
        difficulty: normalizeString(question.difficulty || 'easy'),
      }));

      const invalid = value.questions.some(
        (question) => !question.question || !question.options.length || !question.correct_answer
      );

      if (invalid) {
        errors.push('Each question needs question, options, and correct_answer');
      }
    }
  }

  return { value, errors };
}

function validateSubmitRequest(payload) {
  const errors = [];
  const value = {};

  if (payload.userId !== undefined || payload.user_id !== undefined) {
    value.userId = normalizeString(payload.userId || payload.user_id);
  }

  if (!Array.isArray(payload.answers)) {
    errors.push('answers must be an array');
  } else {
    value.answers = payload.answers
      .map((answer) => ({
        questionId: normalizeString(answer.questionId || answer.question_id),
        selectedAnswer: normalizeString(answer.selectedAnswer || answer.selected_answer),
      }))
      .filter((answer) => answer.questionId);

    if (!value.answers.length) {
      errors.push('answers must include questionId');
    }
  }

  return { value, errors };
}

module.exports = {
  validateGenerateRequest,
  validateSubmitRequest,
};
