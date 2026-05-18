module.exports = (err, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(err && err.stack ? err.stack : err);
  const code = err && err.code ? err.code : 'INTERNAL_ERROR';
  let status = 500;

  if (code === 'VALIDATION_ERROR') {
    status = 400;
  } else if (code === 'NOT_FOUND') {
    status = 404;
  } else if (code === 'MONGO_CONFIG_MISSING') {
    status = 500;
  } else if (code === 'DB_UNAVAILABLE') {
    status = 503;
  }

  res.status(status).json({ error: err && err.message ? err.message : 'internal_error' });
};
