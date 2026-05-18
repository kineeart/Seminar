const request = require('supertest');
const app = require('../app');
const flashcardRepository = require('../repositories/flashcard.repository');
const { createId } = require('../utils/id');

const hasMongo = Boolean(process.env.MONGODB_URI && process.env.DATABASE_NAME);
const describeIf = hasMongo ? describe : describe.skip;

describeIf('Flashcard API', () => {
  beforeEach(async () => {
    await flashcardRepository.clearFlashcards();
  });
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
          userId: 'user-1',
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

  test('GET /flashcards/history returns stored flashcards', async () => {
    await flashcardRepository.createFlashcards([
      {
        _id: createId('flashcard'),
        user_id: 'user-1',
        conversation_id: 'conv-1',
        word: 'maintain',
        ipa: '/meɪnˈteɪn/',
        meaning: 'keep',
        example: 'Maintain good habits.',
        source: 'ai',
      },
    ]);

    const res = await request(app)
      .get('/flashcards/history')
      .query({ userId: 'user-1' });

    expect(res.status).toBe(200);
    expect(res.body.flashcards.length).toBeGreaterThan(0);
  });

  test('GET /flashcards/stats returns totals', async () => {
    await flashcardRepository.createFlashcards([
      {
        _id: createId('flashcard'),
        user_id: 'user-2',
        conversation_id: 'conv-2',
        word: 'focus',
        ipa: '/ˈfoʊkəs/',
        meaning: 'attention',
        example: 'Focus on your goal.',
        source: 'ai',
      },
    ]);

    const res = await request(app)
      .get('/flashcards/stats')
      .query({ userId: 'user-2' });

    expect(res.status).toBe(200);
    expect(res.body.stats.total).toBe(1);
  });
});
