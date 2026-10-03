const express = require('express');
const {
  shortenUrl,
  getUrls,
  redirectUrl
} = require('../controllers/url.controller');

const router = express.Router();
router.post('/api/shorten', shortenUrl);
router.get('/api/urls', getUrls);
router.get('/:shortCode([A-Za-z0-9_-]{1,32})', redirectUrl);

module.exports = router;
