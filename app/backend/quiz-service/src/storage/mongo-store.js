const mongoose = require('mongoose');
const { connectWithRetry } = require('../../../shared/database');

const questionSchema = new mongoose.Schema(
  {
    question_id: { type: String, required: true },
    type: { type: String, default: 'multiple_choice' },
    question: { type: String, required: true, trim: true },
    options: { type: [String], default: [] },
    correct_answer: { type: String, required: true },
    explanation: { type: String, default: '' },
    skill_tag: { type: String, default: 'general' },
    difficulty: { type: String, default: 'easy' },
  },
  { _id: false },
);

const quizSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    user_id: { type: String, default: null, index: true },
    title: { type: String, required: true, trim: true },
    source: { type: String, default: 'manual' },
    generated_from: {
      lesson_id: String,
      topic: String,
      weak_topics: [String],
      chat_session_ids: [String],
      flashcard_ids: [String],
    },
    target_exam: String,
    level_tag: String,
    difficulty: String,
    questions: {
      type: [questionSchema],
      required: true,
      validate: [(value) => value.length > 0, 'Quiz must have questions'],
    },
    deleted_at: { type: Date, default: null },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
);

quizSchema.index({ user_id: 1, created_at: -1 });
quizSchema.index({ 'generated_from.lesson_id': 1 });

const quizResultSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    user_id: { type: String, required: true, index: true },
    quiz_id: { type: String, required: true, index: true },
    answers: [
      {
        question_id: String,
        selected_answer: String,
        is_correct: Boolean,
      },
    ],
    score: { type: Number, default: 0 },
    correct_count: { type: Number, default: 0 },
    total_questions: { type: Number, default: 0 },
    weak_topics: [String],
    completed_at: { type: Date },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
);

quizResultSchema.index({ user_id: 1, created_at: -1 });
quizResultSchema.index({ quiz_id: 1, created_at: -1 });

const progressSchema = new mongoose.Schema(
  {
    user_id: { type: String, unique: true, required: true },
    learned_words_count: { type: Number, default: 0 },
    flashcards_completed: { type: Number, default: 0 },
    quiz_accuracy: { type: Number, default: 0 },
    quizzes_completed: { type: Number, default: 0 },
    weak_topics: { type: [String], default: [] },
    streak_days: { type: Number, default: 0 },
    total_chat_sessions: { type: Number, default: 0 },
    daily_activity: [
      {
        date_key: String,
        chat_sessions: Number,
        messages_sent: Number,
        flashcards_reviewed: Number,
        quizzes_completed: Number,
        learned_words: Number,
      },
    ],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
);

const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema, 'quizzes');
const QuizResult = mongoose.models.QuizResult
  || mongoose.model('QuizResult', quizResultSchema, 'quiz_results');
const Progress = mongoose.models.Progress || mongoose.model('Progress', progressSchema, 'progress');

async function connect() {
  await connectWithRetry({ appName: 'quiz-service' });
}

function toIso(value) {
  return value ? new Date(value).toISOString() : null;
}

function normalizeDoc(doc) {
  if (!doc) {
    return null;
  }
  const value = doc.toObject ? doc.toObject() : doc;
  return {
    ...value,
    id: value._id,
    _id: undefined,
    created_at: toIso(value.created_at),
    updated_at: toIso(value.updated_at),
    completed_at: toIso(value.completed_at),
  };
}

async function createQuiz(quiz) {
  await connect();
  const doc = await Quiz.create({ ...quiz, _id: quiz.id });
  return normalizeDoc(doc);
}

async function getQuiz(quizId) {
  await connect();
  const doc = await Quiz.findById(quizId).lean();
  return normalizeDoc(doc);
}

async function createAttempt(attempt) {
  await connect();
  const doc = await QuizResult.create({ ...attempt, _id: attempt.id });
  return normalizeDoc(doc);
}

async function listAttempts({ userId, quizId, limit = 50 } = {}) {
  await connect();
  const query = {};
  if (userId) {
    query.user_id = userId;
  }
  if (quizId) {
    query.quiz_id = quizId;
  }
  const docs = await QuizResult.find(query)
    .sort({ created_at: -1 })
    .limit(Math.max(1, Number(limit) || 50))
    .lean();
  return docs.map((doc) => normalizeDoc(doc));
}

async function getProgress(userId) {
  await connect();
  const doc = await Progress.findOne({ user_id: userId }).lean();
  return doc || null;
}

async function saveProgress(progress) {
  await connect();
  const doc = await Progress.findOneAndUpdate(
    { user_id: progress.user_id },
    { ...progress },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return doc ? doc.toObject() : progress;
}

module.exports = {
  createQuiz,
  getQuiz,
  createAttempt,
  listAttempts,
  getProgress,
  saveProgress,
};
