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

const BASE_PORT = Number(process.env.AI_CHAT_SERVICE_PORT || process.env.PORT || 5002);

async function startServer(port, retriesLeft = 10) {
  await connectWithRetry({ appName: 'ai-chat-service' });

  registerGracefulShutdown();

  const server = app.listen(port, () => {
    console.log(`ai-chat-service listening on port ${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && retriesLeft > 0) {
      console.warn(`Port ${port} is busy. Retrying on ${port + 1}...`);
      startServer(port + 1, retriesLeft - 1);
      return;
    }

    console.error('Failed to start ai-chat-service:', error.message);
    process.exit(1);
  });

  return server;
}

startServer(BASE_PORT).catch((err) => {
  console.error('Failed to start ai-chat-service:', err.message);
  process.exit(1);
});