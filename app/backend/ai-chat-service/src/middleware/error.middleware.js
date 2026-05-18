function errorMiddleware(err, req, res, next) { // eslint-disable-line no-unused-vars
  // eslint-disable-next-line no-console
  console.error('Error:', err && err.message ? err.message : err);
  const code = err && err.code ? err.code : 'INTERNAL_ERROR';
  let status = 502;
  if (code === 'EMPTY_MESSAGE') {
    status = 400;
  } else if (code === 'TOO_LONG') {
    status = 413;
  } else if (code === 'INVALID_LEVEL') {
    status = 400;
  } else if (code === 'VALIDATION_ERROR') {
    status = 400;
  } else if (code === 'NOT_FOUND') {
    status = 404;
  } else if (code === 'MONGO_CONFIG_MISSING') {
    status = 500;
  } else if (code === 'DB_UNAVAILABLE') {
    status = 503;
  }
  res.status(status).json({ success: false, error: err.message || 'Internal error' });
}

module.exports = errorMiddleware;
