/**
 * Centralized error handling middleware.
 * Ensures API errors always return consistent JSON payloads without crashing the server.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, message);

  res.status(status).json({
    status: 'error',
    error: message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
}

module.exports = {
  errorHandler,
};
