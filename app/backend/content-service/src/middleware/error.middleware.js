function errorMiddleware(err, _req, res, _next) {
  // eslint-disable-next-line no-console
  console.error('Error:', err && err.message ? err.message : err);
  const code = err && err.code ? err.code : 'INTERNAL_ERROR';
  let status = 500;

  if (code === 'VALIDATION_ERROR') {
    status = 400;
  } else if (code === 'NOT_FOUND') {
    status = 404;
  }

  res.status(status).json({
    success: false,
    error: err.message || 'Internal error',
    code,
  });
}

module.exports = errorMiddleware;
