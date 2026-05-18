const { seedLessons } = require('../utils/seed-lessons');
const { createId } = require('../utils/id');

const lessons = new Map();

function addSeedLessons() {
  seedLessons.forEach((lesson) => {
    const id = lesson.id || createId('lesson');
    const now = new Date().toISOString();
    lessons.set(id, {
      ...lesson,
      id,
      created_at: lesson.created_at || now,
      updated_at: lesson.updated_at || now,
    });
  });
}

addSeedLessons();

async function listLessons() {
  return Array.from(lessons.values());
}

async function getLesson(lessonId) {
  return lessons.get(lessonId) || null;
}

async function createLesson(lesson) {
  lessons.set(lesson.id, lesson);
  return lesson;
}

async function updateLesson(lessonId, lesson) {
  lessons.set(lessonId, lesson);
  return lesson;
}

async function deleteLesson(lessonId) {
  if (!lessons.has(lessonId)) {
    return false;
  }
  lessons.delete(lessonId);
  return true;
}

module.exports = {
  listLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
};
