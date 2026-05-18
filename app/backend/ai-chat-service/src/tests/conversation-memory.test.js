const {
  MAX_MEMORY_MESSAGES,
  appendConversationMessages,
  getConversationHistory,
  resetConversationMemory,
} = require('../utils/conversation-memory');

const hasMongo = Boolean(process.env.MONGODB_URI && process.env.DATABASE_NAME);
const describeIf = hasMongo ? describe : describe.skip;

describeIf('conversation memory', () => {
  beforeEach(async () => {
    await resetConversationMemory();
  });

  test('stores only the last 10 messages per conversation', async () => {
    for (let index = 1; index <= MAX_MEMORY_MESSAGES + 2; index += 1) {
      await appendConversationMessages('student-a', [
        { role: 'user', content: `user ${index}` },
      ]);
    }

    const history = await getConversationHistory('student-a');

    expect(history).toHaveLength(MAX_MEMORY_MESSAGES);
    expect(history[0].content).toBe('user 3');
    expect(history[history.length - 1].content).toBe('user 12');
  });

  test('keeps conversation histories separate by conversationId', async () => {
    await appendConversationMessages('student-a', [
      { role: 'user', content: 'hello a' },
    ]);

    await appendConversationMessages('student-b', [
      { role: 'user', content: 'hello b' },
    ]);

    const historyA = await getConversationHistory('student-a');
    const historyB = await getConversationHistory('student-b');

    expect(historyA).toHaveLength(1);
    expect(historyB).toHaveLength(1);
    expect(historyA[0].content).toBe('hello a');
    expect(historyB[0].content).toBe('hello b');
  });
});
