const request = require('supertest');
const app = require('./server');

describe('Gateway MVP', () => {
  test('GET /health returns ok', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'gateway',
    });
  });
});
