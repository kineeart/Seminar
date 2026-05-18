require('../storage/mongo-store');
const mongoose = require('mongoose');

// Pull the Lesson model from mongoose to validate schema.
const LessonModel = mongoose.models.Lesson;

describe('Lesson schema validation', () => {
  test('requires title and topic', () => {
    const lesson = new LessonModel({ _id: 'lesson-1' });
    const error = lesson.validateSync();

    expect(error).toBeTruthy();
    expect(error.errors.title).toBeDefined();
    expect(error.errors.topic).toBeDefined();
  });
});
