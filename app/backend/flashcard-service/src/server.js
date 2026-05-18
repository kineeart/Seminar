require('dotenv').config();
const app = require('./app');
const { connectWithRetry, registerGracefulShutdown } = require('../../shared/database');

const PORT = process.env.PORT || 3003;

async function startServer() {
  try {
    await connectWithRetry({ appName: 'flashcard-service' });
    registerGracefulShutdown();
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`flashcard-service listening on port ${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start flashcard-service:', err.message);
    process.exit(1);
  }
}

startServer();
