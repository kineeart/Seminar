const request = require('supertest');
const app = require('../app');
const geminiService = require('../services/gemini.service');
const conversationRepository = require('../repositories/conversation.repository');

jest.mock('../services/gemini.service');

const hasMongo = Boolean(process.env.MONGODB_URI && process.env.DATABASE_NAME);
const describeIf = hasMongo ? describe : describe.skip;

describeIf('AI Chat Service', () => {
  beforeEach(async () => {
    jest.resetAllMocks();
    await conversationRepository.resetConversations();
  });

  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'ai-chat-service');
  });

  test('POST /chat with empty message returns 400', async () => {
    const res = await request(app).post('/chat').send({ message: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('success', false);
  });

  test('POST /chat with invalid level returns 400', async () => {
    const res = await request(app).post('/chat').send({
      message: 'Explain present perfect tense',
      level: 'Expert',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('success', false);
  });

  test('POST /chat returns reply from gemini service', async () => {
    geminiService.generateResponse.mockResolvedValue('Short explanatory reply with example');

    const res = await request(app).post('/chat').send({ message: 'Explain present perfect tense' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('reply');
    expect(res.body.reply).toContain('Short explanatory');
  });

  test('Gemini service mock: generateResponse throws mapped error', async () => {
    geminiService.generateResponse.mockRejectedValue(new Error('Upstream failure'));

    const res = await request(app).post('/chat').send({ message: 'Hello' });
    expect(res.statusCode).toBe(502);
    expect(res.body).toHaveProperty('success', false);
  });

  test('GET /chat/conversations returns recent conversations', async () => {
    await conversationRepository.appendMessages('conv-1', [
      { role: 'user', content: 'Explain present perfect tense' },
      { role: 'assistant', content: 'Reply' },
    ], { userId: 'student-1' });

    const res = await request(app)
      .get('/chat/conversations')
      .query({ userId: 'student-1' });

    expect(res.statusCode).toBe(200);
    expect(res.body.conversations.length).toBeGreaterThan(0);
  });

  test('GET /chat/conversations/:id returns conversation', async () => {
    await conversationRepository.appendMessages('conv-2', [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Reply' },
    ], { userId: 'student-2' });

    const res = await request(app)
      .get('/chat/conversations/conv-2')
      .query({ userId: 'student-2' });

    expect(res.statusCode).toBe(200);
    expect(res.body.conversation).toHaveProperty('id', 'conv-2');
  });
});
