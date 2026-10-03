function notFoundHandler(request, response) {
  response.status(404).json({ error: 'Route not found' });
}

function errorHandler(error, request, response, next) {
  if (response.headersSent) return next(error);
  console.error(error);
  response.status(500).json({ error: 'Internal server error' });
}

module.exports = { notFoundHandler, errorHandler };
