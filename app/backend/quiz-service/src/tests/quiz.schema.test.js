require('../storage/mongo-store');
const mongoose = require('mongoose');

describe('Quiz schema validation', () => {
  test('requires title and questions', () => {
    const Quiz = mongoose.models.Quiz;
    const quiz = new Quiz({ _id: 'quiz-1', questions: [] });
    const error = quiz.validateSync();

    expect(error).toBeTruthy();
    expect(error.errors.title).toBeDefined();
  });
});
