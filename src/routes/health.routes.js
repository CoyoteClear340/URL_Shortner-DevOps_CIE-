const express = require('express');

const router = express.Router();
router.get('/', (request, response) => {
  response.json({
    name: 'URL Shortener API',
    health: '/health',
    shorten: 'POST /api/shorten',
    urls: 'GET /api/urls',
    metrics: '/metrics'
  });
});
router.get('/health', (request, response) => response.json({ status: 'ok' }));

module.exports = router;
