require('dotenv').config();
const express = require('express');
const healthRoutes = require('./routes/health.routes');
const urlRoutes = require('./routes/url.routes');
const metricsRoutes = require('./routes/metrics.routes');
const { metricsMiddleware } = require('./metrics/metrics');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
app.use(metricsMiddleware);
app.use(healthRoutes);
app.use(metricsRoutes);
app.use(urlRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
