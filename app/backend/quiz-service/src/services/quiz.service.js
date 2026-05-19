const store = require('../storage');
const { validateGenerateRequest, validateSubmitRequest } = require('../utils/quiz-validator');
const { createError } = require('../utils/errors');
const { createId } = require('../utils/id');
const { buildQuizFromLesson, buildFallbackQuiz } = require('../utils/quiz-generator');
const { fetchFlashcardHistory } = require('../utils/flashcard-client');
const { generateAiQuiz, isAiConfigured } = require('../utils/ai-quiz');
const { hashQuestion, dedupeQuestions } = require('../utils/quiz-dedupe');
const progressService = require('./progress.service');

const AI_PROMPT_EXCERPT_LIMIT = 1400;
const AI_RESPONSE_EXCERPT_LIMIT = 8000;
const DEFAULT_FLASHCARD_LIMIT = 60;
const DEFAULT_RECENT_QUESTION_LIMIT = 40;
const DEFAULT_EXAMPLE_LIMIT = 40;

function normalizeString(value) {
  return String(value || '').trim();
}

function normalizeDifficulty(value, fallback = 'easy') {
  const diff = normalizeString(value).toLowerCase();
  if (['easy', 'medium', 'hard'].includes(diff)) {
    return diff;
  }
  return fallback;
}

function normalizeVocabularyEntry(entry) {
  if (!entry) {
    return null;
  }
  const term = normalizeString(entry.term || entry.word);
  const meaning = normalizeString(entry.meaning);
  const example = normalizeString(entry.example);

  if (!term || !meaning) {
    return null;
  }

  return {
    term,
    meaning,
    example,
  };
}

function mergeVocabulary(primary, secondary) {
  const result = new Map();
  [...(primary || []), ...(secondary || [])].forEach((entry) => {
    const normalized = normalizeVocabularyEntry(entry);
    if (!normalized) {
      return;
    }
    const key = normalized.term.toLowerCase();
    if (!result.has(key)) {
      result.set(key, normalized);
    }
  });
  return Array.from(result.values());
}

function extractExamples(vocabulary, limit) {
  return (vocabulary || [])
    .map((item) => item.example)
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeAiQuizPayload(payload, fallbackDifficulty) {
  if (!payload) {
    return null;
  }

  const rawQuestions = Array.isArray(payload.questions)
    ? payload.questions
    : Array.isArray(payload.items)
      ? payload.items
      : [];

  if (!rawQuestions.length) {
    return null;
  }

  const questions = rawQuestions
    .map((question) => {
      const type = normalizeString(question.type || 'MCQ');
      const prompt = normalizeString(question.question || question.prompt);
      const correctAnswer = normalizeString(question.correct_answer || question.correctAnswer);
      const options = Array.isArray(question.options)
        ? question.options.map((opt) => String(opt))
        : [];

      const normalized = {
        question_id: question.question_id || question.questionId || null,
        type,
        question: prompt,
        options,
        correct_answer: correctAnswer,
        explanation: normalizeString(question.explanation || ''),
        source: normalizeString(question.source || 'ai') || 'ai',
        skill_tag: normalizeString(question.skill_tag || question.skillTag || 'general') || 'general',
        difficulty: normalizeDifficulty(question.difficulty, fallbackDifficulty),
      };

      if (['MCQ', 'vocabulary_meaning', 'grammar_correction'].includes(normalized.type)
        && normalized.options.length < 2) {
        normalized.options = [normalized.correct_answer, ''];
      }

      return normalized;
    })
    .filter((question) => question.question && question.correct_answer);

  if (!questions.length) {
    return null;
  }

  return {
    meta: {
      title: normalizeString(payload.title || payload.quiz_title) || null,
      target_exam: normalizeString(payload.target_exam || payload.targetExam) || null,
      level_tag: normalizeString(payload.level_tag || payload.levelTag) || null,
      difficulty: normalizeDifficulty(payload.difficulty, fallbackDifficulty),
    },
    questions,
  };
}

function truncate(value, limit) {
  const text = String(value || '');
  if (!limit || text.length <= limit) {
    return text;
  }
  return text.slice(0, limit);
}

async function logAiQuizAttempt({
  userId,
  quizId,
  status,
  result,
  context,
  error,
}) {
  const log = {
    id: createId('ai_quiz'),
    user_id: userId || null,
    quiz_id: quizId || null,
    provider: result && result.provider ? result.provider : 'unknown',
    model: result && result.model ? result.model : '',
    status: status || 'error',
    attempt: 1,
    prompt_path: result && result.promptPath ? result.promptPath : '',
    prompt_excerpt: result && result.prompt
      ? truncate(result.prompt, AI_PROMPT_EXCERPT_LIMIT)
      : '',
    request_payload: context || {},
    response_text: result && result.rawText
      ? truncate(result.rawText, AI_RESPONSE_EXCERPT_LIMIT)
      : '',
    response_json: result && result.quiz ? result.quiz : {},
    error_message: error ? String(error.message || error) : '',
  };

  try {
    await store.createAiQuizLog(log);
  } catch (err) {
    // Logging failure should not block quiz generation.
  }
}

function sanitizeQuiz(quiz) {
  if (!quiz) {
    return null;
  }

  return {
    ...quiz,
    questions: quiz.questions.map((question) => {
      const { correct_answer: _correct, ...rest } = question;
      return rest;
    }),
  };
}

async function generateQuiz(payload) {
  const { value, errors } = validateGenerateRequest(payload);
  if (errors.length) {
    throw createError('VALIDATION_ERROR', errors.join(', '));
  }

  const count = value.count || 10;
  const difficulty = normalizeDifficulty(value.difficulty);
  const quizId = createId('quiz');

  let questions = value.questions;
  let lesson = null;
  let aiMeta = null;
  let flashcards = [];

  const payloadVocabulary = Array.isArray(value.vocabulary) ? value.vocabulary : [];
  const payloadGrammarPoints = Array.isArray(value.grammarPoints) ? value.grammarPoints : [];
  const payloadExamples = Array.isArray(value.examples) ? value.examples : [];
  let mergedVocabulary = payloadVocabulary;

  if (!questions) {
    const useAi = value.useAi === true;

    if (useAi) {
      const flashcardLimit = Number(
        process.env.QUIZ_FLASHCARD_HISTORY_LIMIT || DEFAULT_FLASHCARD_LIMIT
      );
      flashcards = await fetchFlashcardHistory({
        userId: value.userId,
        limit: flashcardLimit,
      });

      const flashcardVocabulary = (flashcards || [])
        .map((card) => normalizeVocabularyEntry({
          term: card.word,
          meaning: card.meaning,
          example: card.example,
        }))
        .filter(Boolean);

      mergedVocabulary = mergeVocabulary(payloadVocabulary, flashcardVocabulary);

      const aiEnabled = isAiConfigured({ mode: 'flashcard-only' });

      if (aiEnabled && mergedVocabulary.length > 0) {
        const recentLimit = Number(
          process.env.QUIZ_RECENT_QUESTION_LIMIT || DEFAULT_RECENT_QUESTION_LIMIT
        );
        const recentQuestions = await store.listRecentQuestions({
          userId: value.userId,
          limit: recentLimit,
        });

        const examples = payloadExamples.length
          ? payloadExamples
          : extractExamples(mergedVocabulary, DEFAULT_EXAMPLE_LIMIT);

        const context = {
          count,
          difficulty,
          topic: value.topic || 'general',
          target_exam: value.targetExam || null,
          level_tag: value.levelTag || null,
          weak_topics: value.weakTopics || [],
          vocabulary: mergedVocabulary,
          grammar_points: payloadGrammarPoints,
          examples,
          recent_questions: (recentQuestions || []).map((question) => ({
            question: question.question,
            correct_answer: question.correct_answer,
            type: question.type,
          })),
          flashcard_ids: (flashcards || [])
            .map((card) => card.id || card._id)
            .filter(Boolean),
          variation_hint: createId('nonce'),
        };

        let aiResult = null;
        try {
          aiResult = await generateAiQuiz(context, { mode: 'flashcard-only' });
          const parsed = normalizeAiQuizPayload(aiResult.quiz, difficulty);

          if (parsed && parsed.questions.length > 0) {
            const recentHashes = new Set(
              (recentQuestions || []).map((question) => hashQuestion(question))
            );
            const deduped = dedupeQuestions(parsed.questions, recentHashes);
            questions = deduped.questions;
            aiMeta = parsed.meta;
          }

          await logAiQuizAttempt({
            userId: value.userId,
            quizId,
            status: questions && questions.length ? 'success' : 'error',
            result: aiResult,
            context,
          });
        } catch (err) {
          await logAiQuizAttempt({
            userId: value.userId,
            quizId,
            status: 'error',
            result: aiResult,
            context,
            error: err,
          });
        }
      }
    }

    if (!questions || !questions.length) {
      mergedVocabulary = mergeVocabulary(mergedVocabulary, []);
      const examples = payloadExamples.length
        ? payloadExamples
        : extractExamples(mergedVocabulary, DEFAULT_EXAMPLE_LIMIT);

      lesson = {
        title: value.title || 'Quick Practice',
        topic: value.topic || 'general',
        target_exam: value.targetExam || null,
        level_tag: value.levelTag || null,
        vocabulary: mergedVocabulary,
        grammar_points: payloadGrammarPoints,
        examples,
      };

      const generated = buildQuizFromLesson(lesson, {
        count,
        difficulty,
      });
      questions = generated.questions;
      lesson = generated.lesson;
    }
  }

  if (!questions || !questions.length) {
    const fallback = buildFallbackQuiz(count || 5);
    questions = fallback.questions;
    lesson = fallback.lesson;
  }

  if (questions && questions.length < count) {
    const needed = count - questions.length;
    const supplementLesson = {
      title: value.title || 'Quick Practice',
      topic: value.topic || 'general',
      target_exam: value.targetExam || null,
      level_tag: value.levelTag || null,
      vocabulary: mergedVocabulary,
      grammar_points: payloadGrammarPoints,
      examples: payloadExamples.length
        ? payloadExamples
        : extractExamples(mergedVocabulary, DEFAULT_EXAMPLE_LIMIT),
    };
    const supplement = buildQuizFromLesson(supplementLesson, {
      count: needed,
      difficulty,
    });
    const merged = dedupeQuestions([...(questions || []), ...supplement.questions]);
    questions = merged.questions.slice(0, count);
  }

  const now = new Date();
  const flashcardIds = (value.flashcardIds && value.flashcardIds.length)
    ? value.flashcardIds
    : (flashcards || []).map((card) => card.id || card._id).filter(Boolean);

  const quiz = {
    id: quizId,
    user_id: value.userId || null,
    title: value.title
      || (aiMeta && aiMeta.title)
      || `${(lesson && lesson.title) || 'Practice'} Quiz`,
    source: value.source || (value.useAi ? 'ai' : 'manual'),
    generated_from: {
      lesson_id: value.lessonId || null,
      topic: (lesson && lesson.topic) || value.topic || null,
      weak_topics: value.weakTopics || [],
      chat_session_ids: value.chatSessionIds || [],
      flashcard_ids: flashcardIds,
    },
    target_exam: value.targetExam
      || (aiMeta && aiMeta.target_exam)
      || (lesson && lesson.target_exam)
      || null,
    level_tag: value.levelTag
      || (aiMeta && aiMeta.level_tag)
      || (lesson && lesson.level_tag)
      || null,
    difficulty: value.difficulty
      || (aiMeta && aiMeta.difficulty)
      || 'easy',
    questions: questions.map((question) => ({
      ...question,
      question_id: question.question_id || createId('question'),
    })),
    created_at: now,
    deleted_at: null,
  };

  const saved = await store.createQuiz(quiz);
  return sanitizeQuiz(saved);
}

async function getQuiz(quizId) {
  const quiz = await store.getQuiz(quizId);
  if (!quiz) {
    throw createError('NOT_FOUND', 'Quiz not found');
  }
  return sanitizeQuiz(quiz);
}

function computeWeakTopics(quizQuestions, results) {
  const counts = new Map();

  results.forEach((result) => {
    if (result.is_correct) {
      return;
    }

    const question = quizQuestions.find((item) => item.question_id === result.question_id);
    const topic = question && question.skill_tag ? question.skill_tag : 'general';
    counts.set(topic, (counts.get(topic) || 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([topic]) => topic);
}

async function submitQuiz(quizId, payload) {
  const { value, errors } = validateSubmitRequest(payload);
  if (errors.length) {
    throw createError('VALIDATION_ERROR', errors.join(', '));
  }

  const quiz = await store.getQuiz(quizId);
  if (!quiz) {
    throw createError('NOT_FOUND', 'Quiz not found');
  }

  const answersById = new Map();
  value.answers.forEach((answer) => {
    answersById.set(answer.questionId, answer.selectedAnswer);
  });

  const results = quiz.questions.map((question) => {
    const selectedAnswer = answersById.get(question.question_id) || null;
    const isCorrect = selectedAnswer === question.correct_answer;

    return {
      question_id: question.question_id,
      selected_answer: selectedAnswer,
      correct_answer: question.correct_answer,
      is_correct: isCorrect,
      explanation: question.explanation || '',
    };
  });

  const correctCount = results.filter((result) => result.is_correct).length;
  const totalQuestions = quiz.questions.length;
  const score = totalQuestions ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const weakTopics = computeWeakTopics(quiz.questions, results);

  const now = new Date();
  const attempt = {
    id: createId('attempt'),
    user_id: value.userId || 'guest',
    quiz_id: quizId,
    answers: results.map((result) => ({
      question_id: result.question_id,
      selected_answer: result.selected_answer,
      is_correct: result.is_correct,
    })),
    score,
    correct_count: correctCount,
    total_questions: totalQuestions,
    weak_topics: weakTopics,
    completed_at: now,
    created_at: now,
  };

  await store.createAttempt(attempt);
  await progressService.recordAttempt(attempt);

  return {
    score,
    correct_count: correctCount,
    total_questions: totalQuestions,
    weak_topics: weakTopics,
    results,
  };
}

module.exports = {
  generateQuiz,
  getQuiz,
  submitQuiz,
};
