const dotenv = require('dotenv');
const app = require('./app');
const { connectWithRetry, registerGracefulShutdown } = require('../../shared/database');

dotenv.config({ path: '../../.env' });

const PORT = process.env.CONTENT_SERVICE_PORT || process.env.PORT || 5003;

if (require.main === module) {
  (async () => {
    try {
      await connectWithRetry({ appName: 'content-service' });
      registerGracefulShutdown();
      app.listen(PORT, () => {
        // eslint-disable-next-line no-console
        console.log(`content-service running on port ${PORT}`);
        // eslint-disable-next-line no-console
        console.log(`http://localhost:${PORT}/health`);
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to start content-service:', err.message);
      process.exit(1);
    }
  })();
}

module.exports = app;
