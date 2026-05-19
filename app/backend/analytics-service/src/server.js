const app = require('./app');
const { connectWithRetry, registerGracefulShutdown } = require('../../shared/database');

const PORT = process.env.ANALYTICS_SERVICE_PORT || process.env.PORT || 5005;

async function startServer() {
  try {
    await connectWithRetry({ appName: 'analytics-service' });
    registerGracefulShutdown();
    app.listen(PORT, () => {
      console.log(`analytics-service running on port ${PORT}`);
      console.log(`http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start analytics-service:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
