const {
  MAX_MEMORY_MESSAGES,
  appendConversationMessages,
  getConversationHistory,
  resetConversationMemory,
} = require('../utils/conversation-memory');

describe('conversation memory', () => {
  beforeEach(() => {
    resetConversationMemory();
  });

  test('stores only the last 10 messages per conversation', () => {
    for (let index = 1; index <= MAX_MEMORY_MESSAGES + 2; index += 1) {
      appendConversationMessages('student-a', [
        { role: 'user', content: `user ${index}` },
      ]);
    }

    const history = getConversationHistory('student-a');

    expect(history).toHaveLength(MAX_MEMORY_MESSAGES);
    expect(history[0].content).toBe('user 3');
    expect(history[history.length - 1].content).toBe('user 12');
  });

  test('keeps conversation histories separate by conversationId', () => {
    appendConversationMessages('student-a', [
      { role: 'user', content: 'hello a' },
    ]);

    appendConversationMessages('student-b', [
      { role: 'user', content: 'hello b' },
    ]);

    expect(getConversationHistory('student-a')).toHaveLength(1);
    expect(getConversationHistory('student-b')).toHaveLength(1);
    expect(getConversationHistory('student-a')[0].content).toBe('hello a');
    expect(getConversationHistory('student-b')[0].content).toBe('hello b');
  });
});
