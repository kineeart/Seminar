const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema(
  {
    _id: { type: String },
    user_id: String,
    title: String,
    source: String,
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
    questions: [
      {
        question_id: String,
        type: String,
        question: String,
        options: [String],
        correct_answer: String,
        explanation: String,
        skill_tag: String,
        difficulty: String,
      },
    ],
    created_at: String,
    deleted_at: String,
  },
  { versionKey: false }
);

const attemptSchema = new mongoose.Schema(
  {
    _id: { type: String },
    user_id: String,
    quiz_id: String,
    answers: [
      {
        question_id: String,
        selected_answer: String,
        is_correct: Boolean,
      },
    ],
    score: Number,
    correct_count: Number,
    total_questions: Number,
    weak_topics: [String],
    completed_at: String,
    created_at: String,
  },
  { versionKey: false }
);

const progressSchema = new mongoose.Schema(
  {
    user_id: { type: String, unique: true },
    learned_words_count: Number,
    flashcards_completed: Number,
    quiz_accuracy: Number,
    quizzes_completed: Number,
    weak_topics: [String],
    streak_days: Number,
    total_chat_sessions: Number,
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
    updated_at: String,
  },
  { versionKey: false }
);

const Quiz = mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
const Attempt = mongoose.models.Attempt || mongoose.model('Attempt', attemptSchema);
const Progress = mongoose.models.Progress || mongoose.model('Progress', progressSchema);

async function connect() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return;
  }

  await mongoose.connect(uri);
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
  const doc = await Attempt.create({ ...attempt, _id: attempt.id });
  return normalizeDoc(doc);
}

async function listAttempts({ userId, quizId } = {}) {
  await connect();
  const query = {};
  if (userId) {
    query.user_id = userId;
  }
  if (quizId) {
    query.quiz_id = quizId;
  }
  const docs = await Attempt.find(query).sort({ created_at: -1 }).lean();
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
    { new: true, upsert: true }
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
