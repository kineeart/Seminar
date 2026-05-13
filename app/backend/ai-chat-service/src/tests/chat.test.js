const request = require('supertest');
const app = require('../app');

jest.mock('../services/gemini.service');
const geminiService = require('../services/gemini.service');

describe('AI Chat Service', () => {
  beforeEach(() => jest.resetAllMocks());

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
});
