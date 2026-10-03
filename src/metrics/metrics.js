const client = require('prom-client');

const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry, prefix: 'url_shortener_' });

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry]
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [registry]
});

const httpErrorsTotal = new client.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP responses with a 4xx or 5xx status',
  labelNames: ['method', 'route', 'status_code'],
  registers: [registry]
});

const urlsCreatedTotal = new client.Counter({
  name: 'url_shortener_created_total',
  help: 'Total number of shortened URLs created',
  registers: [registry]
});

const redirectsTotal = new client.Counter({
  name: 'url_shortener_redirects_total',
  help: 'Total number of successful URL redirects',
  registers: [registry]
});

function normalizeRoute(request) {
  if (request.route && request.route.path) {
    return typeof request.route.path === 'string'
      ? request.route.path
      : request.route.path.toString();
  }
  if (request.path === '/metrics' || request.path === '/health') return request.path;
  if (request.path.startsWith('/api/')) return request.path;
  return '/:shortCode';
}

function metricsMiddleware(request, response, next) {
  const start = process.hrtime.bigint();
  response.on('finish', () => {
    const route = normalizeRoute(request);
    const labels = {
      method: request.method,
      route,
      status_code: String(response.statusCode)
    };
    const duration = Number(process.hrtime.bigint() - start) / 1e9;
    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, duration);
    if (response.statusCode >= 400) httpErrorsTotal.inc(labels);
  });
  next();
}

async function metricsHandler(request, response, next) {
  try {
    response.set('Content-Type', registry.contentType);
    response.end(await registry.metrics());
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registry,
  metricsMiddleware,
  metricsHandler,
  urlsCreatedTotal,
  redirectsTotal
};
