const dotenv = require('dotenv');
const path = require('path');

const envPath = path.resolve(__dirname, '../../../.env');

dotenv.config({
  path: envPath,
  override: true,
});

console.log(`[CONFIG] Loaded env from: ${envPath}`);

if (process.env.MONGODB_URI) {
  console.log('[CONFIG] MONGODB_URI detected');
}

const app = require('./app');
const { connectWithRetry, registerGracefulShutdown } = require('../../shared/database');

const PORT = process.env.FLASHCARD_SERVICE_PORT || process.env.PORT || 3003;

async function startServer() {
  try {
    await connectWithRetry({ appName: 'flashcard-service' });

    registerGracefulShutdown();

    app.listen(PORT, () => {
      console.log(`flashcard-service listening on port ${PORT}`);
    });

  } catch (err) {
    console.error('Failed to start flashcard-service:', err.message);
    process.exit(1);
  }
}

startServer();