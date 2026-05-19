const store = require('../storage');
const { validateGenerateRequest, validateSubmitRequest } = require('../utils/quiz-validator');
const { createError } = require('../utils/errors');
const { createId } = require('../utils/id');
const { buildQuizFromLesson, buildFallbackQuiz } = require('../utils/quiz-generator');
const progressService = require('./progress.service');

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

  let questions = value.questions;
  let lesson = null;

  if (!questions) {
    lesson = {
      title: value.title || 'Quick Practice',
      topic: value.topic || 'general',
      target_exam: value.targetExam || null,
      level_tag: value.levelTag || null,
      vocabulary: value.vocabulary || [],
    };

    const generated = buildQuizFromLesson(lesson, {
      count: value.count,
      difficulty: value.difficulty,
    });
    questions = generated.questions;
    lesson = generated.lesson;
  }

  if (!questions || !questions.length) {
    const fallback = buildFallbackQuiz(value.count || 5);
    questions = fallback.questions;
    lesson = fallback.lesson;
  }

  const now = new Date();
  const quiz = {
    id: createId('quiz'),
    user_id: value.userId || null,
    title: value.title || `${lesson.title || 'Practice'} Quiz`,
    source: value.source || 'manual',
    generated_from: {
      lesson_id: value.lessonId || null,
      topic: (lesson && lesson.topic) || value.topic || null,
      weak_topics: value.weakTopics || [],
      chat_session_ids: value.chatSessionIds || [],
      flashcard_ids: value.flashcardIds || [],
    },
    target_exam: value.targetExam || (lesson && lesson.target_exam) || null,
    level_tag: value.levelTag || (lesson && lesson.level_tag) || null,
    difficulty: value.difficulty || 'easy',
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
