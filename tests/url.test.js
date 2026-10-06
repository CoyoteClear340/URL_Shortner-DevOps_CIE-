jest.mock('../src/config/database', () => {
  const records = [];
  return {
    query: jest.fn(async (text, params = []) => {
      if (text.includes('INSERT INTO urls')) {
        const record = {
          id: records.length + 1,
          original_url: params[0],
          short_code: params[1],
          created_at: new Date().toISOString(),
          click_count: 0
        };
        records.push(record);
        return { rows: [record] };
      }
      if (text.includes('SELECT id, original_url')) return { rows: records };
      if (text.includes('UPDATE urls')) {
        const record = records.find((item) => item.short_code === params[0]);
        if (!record) return { rows: [] };
        record.click_count += 1;
        return { rows: [record] };
      }
      return { rows: [] };
    })
  };
});

const request = require('supertest');
const app = require('../src/app');

describe('URL API', () => {
  test('returns API information at the root URL', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body.health).toBe('/health');
  });

  test('creates a short URL with a dynamic code', async () => {
    const response = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://github.com/' });
    expect(response.status).toBe(201);
    expect(response.body.originalUrl).toBe('https://github.com/');
    expect(response.body.shortCode).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(response.body.shortUrl).toContain(response.body.shortCode);
  });

  test.each([{}, { url: '' }, { url: 'not-a-url' }])(
    'rejects invalid input %j',
    async (payload) => {
      const response = await request(app).post('/api/shorten').send(payload);
      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    }
  );

  test('redirects and increments click count', async () => {
    const created = await request(app)
      .post('/api/shorten')
      .send({ url: 'https://example.com/docs' });
    const redirected = await request(app).get(`/${created.body.shortCode}`);
    expect(redirected.status).toBe(302);
    expect(redirected.headers.location).toBe('https://example.com/docs');

    const urls = await request(app).get('/api/urls');
    const saved = urls.body.find((item) => item.shortCode === created.body.shortCode);
    expect(saved.clickCount).toBe(1);
  });

  test('returns 404 for an unknown short code', async () => {
    const response = await request(app).get('/does-not-exist');
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Short URL not found');
  });

  test('exposes Prometheus metrics', async () => {
    const response = await request(app).get('/metrics');
    expect(response.status).toBe(200);
    expect(response.text).toContain('http_requests_total');
    expect(response.text).toContain('http_request_duration_seconds');
  });
});
