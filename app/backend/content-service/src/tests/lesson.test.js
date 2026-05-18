const request = require('supertest');
const app = require('../app');

const hasMongo = Boolean(process.env.MONGODB_URI && process.env.DATABASE_NAME);
const describeIf = hasMongo ? describe : describe.skip;

describeIf('Content Service', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'content-service');
  });

  test('GET /lessons returns seed lessons', async () => {
    const res = await request(app).get('/lessons');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.lessons)).toBe(true);
    expect(res.body.lessons.length).toBeGreaterThan(0);
  });

  test('POST /lessons creates lesson', async () => {
    const payload = {
      title: 'Grammar Basics',
      topic: 'grammar',
      summary: 'Simple grammar rules for beginners',
      vocabulary: [{ term: 'subject', meaning: 'who or what the sentence is about' }],
    };

    const res = await request(app).post('/lessons').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.lesson).toHaveProperty('id');
    expect(res.body.lesson).toHaveProperty('title', 'Grammar Basics');
  });

  test('PATCH /lessons updates lesson', async () => {
    const createRes = await request(app).post('/lessons').send({
      title: 'Email Basics',
      topic: 'workplace',
    });

    const lessonId = createRes.body.lesson.id;
    const patchRes = await request(app).patch(`/lessons/${lessonId}`).send({
      summary: 'Writing simple emails',
    });

    expect(patchRes.statusCode).toBe(200);
    expect(patchRes.body.lesson).toHaveProperty('summary', 'Writing simple emails');
  });

  test('DELETE /lessons removes lesson', async () => {
    const createRes = await request(app).post('/lessons').send({
      title: 'Delete Me',
      topic: 'misc',
    });

    const lessonId = createRes.body.lesson.id;
    const deleteRes = await request(app).delete(`/lessons/${lessonId}`);
    expect(deleteRes.statusCode).toBe(200);
    expect(deleteRes.body).toHaveProperty('success', true);

    const getRes = await request(app).get(`/lessons/${lessonId}`);
    expect(getRes.statusCode).toBe(404);
  });
});
