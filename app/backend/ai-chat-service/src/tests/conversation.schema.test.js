const Conversation = require('../models/conversation.model');

describe('Conversation schema validation', () => {
  test('requires message content and role', () => {
    const convo = new Conversation({
      _id: 'conv-1',
      messages: [{ content: '' }],
    });

    const error = convo.validateSync();
    expect(error).toBeTruthy();
    expect(error.errors['messages.0.role']).toBeDefined();
    expect(error.errors['messages.0.content']).toBeDefined();
  });
});
