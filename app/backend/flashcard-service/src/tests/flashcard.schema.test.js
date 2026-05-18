const Flashcard = require('../models/flashcard.model');

describe('Flashcard schema validation', () => {
  test('requires word, meaning, and example', () => {
    const card = new Flashcard({ _id: 'card-1', user_id: 'user-1' });
    const error = card.validateSync();

    expect(error).toBeTruthy();
    expect(error.errors.word).toBeDefined();
    expect(error.errors.meaning).toBeDefined();
    expect(error.errors.example).toBeDefined();
  });
});
