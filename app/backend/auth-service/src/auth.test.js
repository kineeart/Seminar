const request = require('supertest');
const app = require('./server');
const authService = require('./services/auth.service');

const hasMongo = Boolean(process.env.MONGODB_URI && process.env.DATABASE_NAME);
const describeIf = hasMongo ? describe : describe.skip;

describeIf('Auth Service MVP', () => {
  beforeAll(() => {
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'test-secret';
    }
  });

  beforeEach(async () => {
    await authService.resetStore();
  });

  test('GET /health returns ok', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'auth-service',
    });
    expect(response.body.timestamp).toBeDefined();
  });

  test('POST /signup creates a new user', async () => {
    const response = await request(app)
      .post('/signup')
      .send({
        email: 'student@example.com',
        password: 'secret123',
      })
      .expect(201);

    expect(response.body.status).toBe('success');
    expect(response.body.user.email).toBe('student@example.com');
  });

  test('POST /signup blocks duplicate email', async () => {
    await request(app)
      .post('/signup')
      .send({
        email: 'student@example.com',
        password: 'secret123',
      })
      .expect(201);

    const response = await request(app)
      .post('/signup')
      .send({
        email: 'student@example.com',
        password: 'another-secret',
      })
      .expect(409);

    expect(response.body.message).toBe('Email already exists');
  });

  test('POST /login returns jwt token', async () => {
    await request(app)
      .post('/signup')
      .send({
        email: 'student@example.com',
        password: 'secret123',
      })
      .expect(201);

    const response = await request(app)
      .post('/login')
      .send({
        email: 'student@example.com',
        password: 'secret123',
      })
      .expect(200);

    expect(response.body.status).toBe('success');
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.user.email).toBe('student@example.com');
  });
});
