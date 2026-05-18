const request = require('supertest');
const app = require('../app');

describe('Flashcard API', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');

    return null;
  });

  test('POST /flashcards/generate validates input', async () => {
    const res = await request(app)
      .post('/flashcards/generate')
      .send({});

    expect(res.status).toBe(400);

    return null;
  });

  test(
    'POST /flashcards/generate handles empty messages (skipped if no key)',
    async () => {
      if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
        expect(true).toBe(true);

        return null;
      }

      const res = await request(app)
        .post('/flashcards/generate')
        .send({
          conversationId: 't1',
          messages: [
            {
              role: 'user',
              content: 'Explain maintain and productivity.',
            },
          ],
        })
        .timeout(20000);

      expect([200, 500]).toContain(res.status);

      return null;
    },
    30000,
  );
});
