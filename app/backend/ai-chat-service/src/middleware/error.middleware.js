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
  }
  res.status(status).json({ success: false, error: err.message || 'Internal error' });
}

module.exports = errorMiddleware;
