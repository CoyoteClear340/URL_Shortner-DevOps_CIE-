const express = require('express');
const { metricsHandler } = require('../metrics/metrics');

const router = express.Router();
router.get('/metrics', metricsHandler);

module.exports = router;
