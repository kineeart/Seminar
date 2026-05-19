const mongoose = require('mongoose');
const { getMongoConfig } = require('./config');

let connectionPromise = null;

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function connectMongo(overrides = {}) {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const config = getMongoConfig(overrides);

  mongoose.set('strictQuery', true);

  // eslint-disable-next-line no-console
  console.log('[DB] Connecting to MongoDB Atlas...');

  connectionPromise = mongoose
    .connect(config.uri, {
      dbName: config.dbName,
      maxPoolSize: config.maxPoolSize,
      minPoolSize: config.minPoolSize,
      serverSelectionTimeoutMS: config.serverSelectionTimeoutMs,
      socketTimeoutMS: config.socketTimeoutMs,
      appName: config.appName,
    })
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('[DB] Connected successfully');
      return mongoose.connection;
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error(`[DB] Connection failed: ${error.message}`);
      throw error;
    })
    .finally(() => {
      connectionPromise = null;
    });

  return connectionPromise;
}

async function connectWithRetry(overrides = {}) {
  const config = getMongoConfig(overrides);
  let lastError = null;

  for (let attempt = 0; attempt <= config.retryAttempts; attempt += 1) {
    try {
      return await connectMongo(config);
    } catch (err) {
      lastError = err;
      if (attempt >= config.retryAttempts) {
        throw err;
      }
      const backoffMs = Math.min(5000, config.retryDelayMs * (2 ** attempt));
      await wait(backoffMs);
    }
  }

  throw lastError;
}

async function disconnectMongo() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close(false);
  }
}

function registerGracefulShutdown(logger = console) {
  const log = logger && typeof logger.info === 'function' ? logger : console;
  const handleSignal = async (signal) => {
    try {
      log.info(`Shutting down on ${signal}, closing MongoDB connection.`);
      await disconnectMongo();
      process.exit(0);
    } catch (err) {
      log.error(`Failed to close MongoDB connection: ${err.message}`);
      process.exit(1);
    }
  };

  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => handleSignal(signal));
  });
}

module.exports = {
  connectMongo,
  connectWithRetry,
  disconnectMongo,
  registerGracefulShutdown,
};
