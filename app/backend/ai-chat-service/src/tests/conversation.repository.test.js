const conversationRepository = require('../repositories/conversation.repository');

const hasMongo = Boolean(process.env.MONGODB_URI && process.env.DATABASE_NAME);
const describeIf = hasMongo ? describe : describe.skip;

describeIf('Conversation repository', () => {
  beforeEach(async () => {
    await conversationRepository.resetConversations();
  });

  test('appends and retrieves messages', async () => {
    await conversationRepository.appendMessages('repo-conv', [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there' },
    ], { userId: 'repo-user' });

    const history = await conversationRepository.getRecentMessages('repo-conv', 10);
    expect(history.length).toBe(2);
    expect(history[0].content).toBe('Hello');
  });
});
