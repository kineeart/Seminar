const mongoose = require('mongoose');
const { connectWithRetry } = require('../../../shared/database');
const { seedLessons } = require('../utils/seed-lessons');
const { createId } = require('../utils/id');

const lessonSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    summary: { type: String, default: '' },
    target_exam: { type: String, default: '' },
    level_tag: { type: String, default: '' },
    examples: { type: [String], default: [] },
    vocabulary: [
      {
        term: String,
        meaning: String,
        example: String,
      },
    ],
    grammar_points: [
      {
        rule: String,
        example: String,
      },
    ],
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
);

lessonSchema.index({ topic: 1, created_at: -1 });

const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema, 'lessons');

async function connect() {
  await connectWithRetry({ appName: 'content-service' });
}

function toIso(value) {
  return value ? new Date(value).toISOString() : null;
}

function normalizeLesson(doc) {
  if (!doc) {
    return null;
  }
  const lesson = doc.toObject ? doc.toObject() : doc;
  return {
    ...lesson,
    id: lesson._id,
    _id: undefined,
    created_at: toIso(lesson.created_at),
    updated_at: toIso(lesson.updated_at),
  };
}

async function ensureSeedLessons() {
  const count = await Lesson.countDocuments({});
  if (count > 0) {
    return;
  }

  const now = new Date();
  const docs = seedLessons.map((lesson) => ({
    _id: lesson.id || createId('lesson'),
    title: lesson.title || 'Untitled Lesson',
    topic: lesson.topic || 'general',
    summary: lesson.summary || '',
    target_exam: lesson.target_exam || '',
    level_tag: lesson.level_tag || '',
    examples: lesson.examples || [],
    vocabulary: lesson.vocabulary || [],
    grammar_points: lesson.grammar_points || [],
    created_at: lesson.created_at ? new Date(lesson.created_at) : now,
    updated_at: lesson.updated_at ? new Date(lesson.updated_at) : now,
  }));

  await Lesson.insertMany(docs, { ordered: false });
}

async function listLessons() {
  await connect();
  await ensureSeedLessons();
  const docs = await Lesson.find({}).sort({ created_at: -1 }).lean();
  return docs.map((doc) => normalizeLesson(doc));
}

async function getLesson(lessonId) {
  await connect();
  const doc = await Lesson.findById(lessonId).lean();
  return normalizeLesson(doc);
}

async function createLesson(lesson) {
  await connect();
  const doc = await Lesson.create({ ...lesson, _id: lesson.id });
  return normalizeLesson(doc);
}

async function updateLesson(lessonId, lesson) {
  await connect();
  const doc = await Lesson.findByIdAndUpdate(
    lessonId,
    { ...lesson, _id: lesson.id || lessonId },
    { new: true, upsert: false }
  );
  return normalizeLesson(doc);
}

async function deleteLesson(lessonId) {
  await connect();
  const result = await Lesson.deleteOne({ _id: lessonId });
  return result.deletedCount > 0;
}

module.exports = {
  listLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
};
