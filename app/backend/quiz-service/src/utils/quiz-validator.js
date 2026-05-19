function normalizeString(value) {
  return String(value || '').trim();
}

function normalizeBoolean(value) {
  if (value === true || value === false) {
    return value;
  }
  if (value === 1 || value === '1') {
    return true;
  }
  if (value === 0 || value === '0') {
    return false;
  }
  return String(value || '').trim().toLowerCase() === 'true';
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => normalizeString(item)).filter(Boolean);
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
    const difficulty = normalizeString(payload.difficulty).toLowerCase();
    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
      errors.push('difficulty must be easy, medium, or hard');
    } else {
      value.difficulty = difficulty;
    }
  }

  if (payload.source !== undefined) {
    value.source = normalizeString(payload.source);
  }

  if (payload.useAi !== undefined || payload.use_ai !== undefined) {
    value.useAi = normalizeBoolean(payload.useAi !== undefined ? payload.useAi : payload.use_ai);
  }

  if (payload.weakTopics !== undefined || payload.weak_topics !== undefined) {
    value.weakTopics = normalizeStringArray(payload.weakTopics || payload.weak_topics);
  }

  if (payload.chatSessionIds !== undefined || payload.chat_session_ids !== undefined) {
    value.chatSessionIds = normalizeStringArray(payload.chatSessionIds || payload.chat_session_ids);
  }

  if (payload.flashcardIds !== undefined || payload.flashcard_ids !== undefined) {
    value.flashcardIds = normalizeStringArray(payload.flashcardIds || payload.flashcard_ids);
  }

  if (payload.vocabulary !== undefined) {
    value.vocabulary = Array.isArray(payload.vocabulary) ? payload.vocabulary : [];
  }

  if (payload.grammarPoints !== undefined || payload.grammar_points !== undefined) {
    value.grammarPoints = Array.isArray(payload.grammarPoints || payload.grammar_points)
      ? (payload.grammarPoints || payload.grammar_points)
      : [];
  }

  if (payload.examples !== undefined) {
    value.examples = normalizeStringArray(payload.examples);
  }

  if (payload.questions !== undefined) {
    if (!Array.isArray(payload.questions)) {
      errors.push('questions must be an array');
    } else {
      value.questions = payload.questions.map((question) => ({
        question_id: question.question_id || question.questionId || null,
        type: normalizeString(question.type || 'MCQ'),
        question: normalizeString(question.question),
        options: Array.isArray(question.options) ? question.options.map((opt) => String(opt)) : [],
        correct_answer: normalizeString(question.correct_answer || question.correctAnswer),
        explanation: normalizeString(question.explanation || ''),
        source: normalizeString(question.source || 'manual'),
        skill_tag: normalizeString(question.skill_tag || question.skillTag || 'general'),
        difficulty: normalizeString(question.difficulty || 'easy'),
      }));

      const invalid = value.questions.some((question) => {
        if (!question.question || !question.correct_answer) {
          return true;
        }

        if (['MCQ', 'vocabulary_meaning', 'grammar_correction'].includes(question.type)) {
          return question.options.length < 2;
        }

        return false;
      });

      if (invalid) {
        errors.push('Each question must include valid question data for its type');
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
