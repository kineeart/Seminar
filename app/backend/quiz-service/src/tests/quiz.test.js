const request = require('supertest');
const app = require('../app');

jest.mock('../storage', () => require('../storage/memory-store'));

describe('Quiz Service', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'quiz-service');
  });

  test('POST /quizzes/generate creates quiz without exposing correct answers', async () => {
    const payload = {
      title: 'Mini Quiz',
      userId: 'user-1',
      questions: [
        {
          question: 'What is 2 + 2?',
          options: ['3', '4', '5', '6'],
          correct_answer: '4',
          explanation: 'Basic math',
          skill_tag: 'logic',
          source: 'manual',
        },
      ],
    };

    const res = await request(app).post('/quizzes/generate').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.quiz).toHaveProperty('id');
    expect(res.body.quiz.questions[0]).not.toHaveProperty('correct_answer');
  });

  test('POST /quizzes/generate builds fallback quiz schema', async () => {
    const res = await request(app).post('/quizzes/generate').send({ count: 4, topic: 'general' });

    expect(res.statusCode).toBe(201);
    expect(res.body.quiz.questions).toHaveLength(4);
    expect(res.body.quiz.questions[0]).toMatchObject({
      type: expect.any(String),
      question: expect.any(String),
      explanation: expect.any(String),
      skill_tag: expect.any(String),
      difficulty: expect.any(String),
      source: expect.any(String),
    });
    expect(res.body.quiz.questions[0]).not.toHaveProperty('correct_answer');
  });

  test('GET /quizzes/:id returns sanitized quiz', async () => {
    const createRes = await request(app).post('/quizzes/generate').send({
      title: 'Quick Quiz',
      questions: [
        {
          question: 'Choose A',
          options: ['A', 'B'],
          correct_answer: 'A',
          source: 'manual',
        },
      ],
    });

    const quizId = createRes.body.quiz.id;
    const res = await request(app).get(`/quizzes/${quizId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.quiz).toHaveProperty('id', quizId);
    expect(res.body.quiz.questions[0]).not.toHaveProperty('correct_answer');
  });

  test('POST /quizzes/:id/submit scores answers and returns weak topics', async () => {
    const createRes = await request(app).post('/quizzes/generate').send({
      title: 'Score Quiz',
      userId: 'user-2',
      questions: [
        {
          question: 'Pick X',
          options: ['X', 'Y'],
          correct_answer: 'X',
          skill_tag: 'vocab',
          source: 'manual',
        },
        {
          question: 'Pick B',
          options: ['A', 'B'],
          correct_answer: 'B',
          skill_tag: 'grammar',
          source: 'manual',
        },
      ],
    });

    const quizId = createRes.body.quiz.id;
    const firstQuestionId = createRes.body.quiz.questions[0].question_id;
    const secondQuestionId = createRes.body.quiz.questions[1].question_id;

    const submitRes = await request(app).post(`/quizzes/${quizId}/submit`).send({
      userId: 'user-2',
      answers: [
        { questionId: firstQuestionId, selectedAnswer: 'X' },
        { questionId: secondQuestionId, selectedAnswer: 'A' },
      ],
    });

    expect(submitRes.statusCode).toBe(200);
    expect(submitRes.body.result).toHaveProperty('score', 50);
    expect(submitRes.body.result).toHaveProperty('correct_count', 1);
    expect(submitRes.body.result).toHaveProperty('total_questions', 2);
    expect(submitRes.body.result.weak_topics).toContain('grammar');
    expect(submitRes.body.result.results).toHaveLength(2);
  });

  test('GET /attempts requires userId', async () => {
    const res = await request(app).get('/attempts');
    expect(res.statusCode).toBe(400);
  });

  test('GET /attempts returns attempts', async () => {
    const createRes = await request(app).post('/quizzes/generate').send({
      title: 'Attempt Quiz',
      userId: 'user-3',
      questions: [
        {
          question: 'Pick A',
          options: ['A', 'B'],
          correct_answer: 'A',
          source: 'manual',
        },
      ],
    });

    const quizId = createRes.body.quiz.id;
    const questionId = createRes.body.quiz.questions[0].question_id;

    await request(app).post(`/quizzes/${quizId}/submit`).send({
      userId: 'user-3',
      answers: [{ questionId, selectedAnswer: 'A' }],
    });

    const res = await request(app).get('/attempts').query({ userId: 'user-3' });
    expect(res.statusCode).toBe(200);
    expect(res.body.attempts.length).toBeGreaterThan(0);
  });

  test('GET /progress returns updated progress after submit', async () => {
    const createRes = await request(app).post('/quizzes/generate').send({
      title: 'Progress Quiz',
      userId: 'user-4',
      questions: [
        {
          question: 'Pick B',
          options: ['A', 'B'],
          correct_answer: 'B',
          skill_tag: 'grammar',
          source: 'manual',
        },
      ],
    });

    const quizId = createRes.body.quiz.id;
    const questionId = createRes.body.quiz.questions[0].question_id;

    await request(app).post(`/quizzes/${quizId}/submit`).send({
      userId: 'user-4',
      answers: [{ questionId, selectedAnswer: 'B' }],
    });

    const progressRes = await request(app).get('/progress').query({ userId: 'user-4' });
    expect(progressRes.statusCode).toBe(200);
    expect(progressRes.body.progress).toHaveProperty('quizzes_completed', 1);
    expect(progressRes.body.progress).toHaveProperty('quiz_accuracy', 100);
  });
});
