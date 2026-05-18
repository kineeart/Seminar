const request = require('supertest');
const app = require('../app');
require('../storage/mongo-store');
const mongoose = require('mongoose');
const { connectWithRetry, disconnectMongo } = require('../../../shared/database');

const hasMongo = Boolean(process.env.MONGODB_URI && process.env.DATABASE_NAME);
const describeIf = hasMongo ? describe : describe.skip;

describeIf('Quiz Service', () => {
  beforeAll(async () => {
    await connectWithRetry({ appName: 'quiz-service-test' });
  }, 30000);

  afterAll(async () => {
    await disconnectMongo();
  }, 30000);

  beforeEach(async () => {
    const Quiz = mongoose.models.Quiz;
    const QuizResult = mongoose.models.QuizResult;
    const Progress = mongoose.models.Progress;
    if (Quiz) {
      await Quiz.deleteMany({});
    }
    if (QuizResult) {
      await QuizResult.deleteMany({});
    }
    if (Progress) {
      await Progress.deleteMany({});
    }
  }, 30000);

  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(res.body).toHaveProperty('service', 'quiz-service');
  });

  test('POST /quizzes/generate creates quiz', async () => {
    const payload = {
      title: 'Mini Quiz',
      userId: 'user-1',
      questions: [
        {
          question: 'What is 2 + 2? ',
          options: ['3', '4', '5', '6'],
          correct_answer: '4',
          explanation: 'Basic math',
          skill_tag: 'logic',
        },
      ],
    };

    const res = await request(app).post('/quizzes/generate').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.quiz).toHaveProperty('id');
    expect(res.body.quiz.questions[0]).not.toHaveProperty('correct_answer');
  }, 30000);

  test('GET /quizzes/:id returns quiz', async () => {
    const createRes = await request(app).post('/quizzes/generate').send({
      title: 'Quick Quiz',
      questions: [
        {
          question: 'Choose A',
          options: ['A', 'B'],
          correct_answer: 'A',
        },
      ],
    });

    const quizId = createRes.body.quiz.id;
    const res = await request(app).get(`/quizzes/${quizId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.quiz).toHaveProperty('id', quizId);
  }, 30000);

  test('POST /quizzes/:id/submit scores answers', async () => {
    const createRes = await request(app).post('/quizzes/generate').send({
      title: 'Score Quiz',
      userId: 'user-2',
      questions: [
        {
          question: 'Pick X',
          options: ['X', 'Y'],
          correct_answer: 'X',
          skill_tag: 'vocab',
        },
      ],
    });

    const quizId = createRes.body.quiz.id;
    const questionId = createRes.body.quiz.questions[0].question_id;

    const submitRes = await request(app).post(`/quizzes/${quizId}/submit`).send({
      userId: 'user-2',
      answers: [{ questionId, selectedAnswer: 'X' }],
    });

    expect(submitRes.statusCode).toBe(200);
    expect(submitRes.body.result).toHaveProperty('score', 100);
    expect(submitRes.body.result).toHaveProperty('correct_count', 1);
  }, 30000);

  test('GET /attempts requires userId', async () => {
    const res = await request(app).get('/attempts');
    expect(res.statusCode).toBe(400);
  }, 30000);

  test('GET /attempts returns attempts', async () => {
    const createRes = await request(app).post('/quizzes/generate').send({
      title: 'Attempt Quiz',
      userId: 'user-3',
      questions: [
        {
          question: 'Pick A',
          options: ['A', 'B'],
          correct_answer: 'A',
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
  }, 30000);

  test('GET /progress returns progress', async () => {
    const createRes = await request(app).post('/quizzes/generate').send({
      title: 'Progress Quiz',
      userId: 'user-4',
      questions: [
        {
          question: 'Pick B',
          options: ['A', 'B'],
          correct_answer: 'B',
          skill_tag: 'grammar',
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
  }, 30000);

  test('POST /progress/flashcard-review updates flashcard metrics', async () => {
    const res = await request(app)
      .post('/progress/flashcard-review')
      .send({ userId: 'user-flash', reviewedAt: new Date().toISOString() });

    expect(res.statusCode).toBe(200);
    expect(res.body.progress).toHaveProperty('flashcards_completed', 1);
    expect(res.body.progress).toHaveProperty('learned_words_count', 1);
    expect(res.body.progress).toHaveProperty('streak_days', 1);
  }, 30000);
});
