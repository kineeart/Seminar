async function retry(fn, opts = {}) {
  const retries = opts.retries || 2;
  const backoffMs = opts.backoffMs || 300;

  let lastErr;

  for (let i = 0; i <= retries; i += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await fn();
    } catch (err) {
      lastErr = err;

      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => {
        setTimeout(resolve, backoffMs * (i + 1));
      });
    }
  }

  throw lastErr;
}

module.exports = { retry };
