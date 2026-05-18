const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    _id: { type: String },
    title: String,
    topic: String,
    summary: String,
    target_exam: String,
    level_tag: String,
    examples: [String],
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
    created_at: String,
    updated_at: String,
  },
  { versionKey: false }
);

const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);

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

function normalizeLesson(doc) {
  if (!doc) {
    return null;
  }
  const lesson = doc.toObject ? doc.toObject() : doc;
  return {
    ...lesson,
    id: lesson._id,
    _id: undefined,
  };
}

async function listLessons() {
  await connect();
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
