const request = require('supertest');
const app = require('../src/app');

describe('health endpoint', () => {
  test('GET /health returns ok without database access', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
