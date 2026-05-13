require('dotenv').config();
const app = require('./app');

const BASE_PORT = Number(process.env.PORT || 5002);

function startServer(port, retriesLeft = 10) {
  const server = app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`ai-chat-service listening on port ${port}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && retriesLeft > 0) {
      // eslint-disable-next-line no-console
      console.warn(`Port ${port} is busy. Retrying on ${port + 1}...`);
      startServer(port + 1, retriesLeft - 1);
      return;
    }

    // eslint-disable-next-line no-console
    console.error('Failed to start ai-chat-service:', error.message);
    process.exit(1);
  });

  return server;
}

startServer(BASE_PORT);
