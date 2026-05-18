const store = require('../storage');
const { validateLessonPayload } = require('../utils/lesson-validator');
const { createError } = require('../utils/errors');
const { createId } = require('../utils/id');

async function listLessons() {
  return store.listLessons();
}

async function getLesson(lessonId) {
  const lesson = await store.getLesson(lessonId);
  if (!lesson) {
    throw createError('NOT_FOUND', 'Lesson not found');
  }
  return lesson;
}

async function createLesson(payload) {
  const { value, errors } = validateLessonPayload(payload);
  if (errors.length) {
    throw createError('VALIDATION_ERROR', errors.join(', '));
  }

  const now = new Date();
  const lesson = {
    ...value,
    id: createId('lesson'),
    created_at: now,
    updated_at: now,
  };

  return store.createLesson(lesson);
}

async function updateLesson(lessonId, payload) {
  const { value, errors } = validateLessonPayload(payload, { partial: true });
  if (errors.length) {
    throw createError('VALIDATION_ERROR', errors.join(', '));
  }

  const existing = await store.getLesson(lessonId);
  if (!existing) {
    throw createError('NOT_FOUND', 'Lesson not found');
  }

  const updated = {
    ...existing,
    ...value,
    updated_at: new Date(),
  };

  return store.updateLesson(lessonId, updated);
}

async function deleteLesson(lessonId) {
  const removed = await store.deleteLesson(lessonId);
  if (!removed) {
    throw createError('NOT_FOUND', 'Lesson not found');
  }
}

module.exports = {
  listLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson,
};
