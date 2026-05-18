const DEFAULT_RETRY_ATTEMPTS = Number.parseInt(process.env.MONGO_CONNECT_RETRIES || '5', 10);
const DEFAULT_RETRY_DELAY_MS = Number.parseInt(process.env.MONGO_CONNECT_RETRY_DELAY_MS || '500', 10);
const DEFAULT_MAX_POOL_SIZE = Number.parseInt(process.env.MONGO_MAX_POOL_SIZE || '10', 10);
const DEFAULT_MIN_POOL_SIZE = Number.parseInt(process.env.MONGO_MIN_POOL_SIZE || '0', 10);
const DEFAULT_SERVER_SELECTION_TIMEOUT_MS = Number.parseInt(
  process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS || '5000',
  10,
);
const DEFAULT_SOCKET_TIMEOUT_MS = Number.parseInt(process.env.MONGO_SOCKET_TIMEOUT_MS || '10000', 10);

function getMongoConfig(overrides = {}) {
  const uri = overrides.uri || process.env.MONGODB_URI;
  const dbName = overrides.dbName || process.env.DATABASE_NAME;

  if (!uri) {
    const error = new Error('MONGODB_URI is required');
    error.code = 'MONGO_CONFIG_MISSING';
    throw error;
  }

  if (!dbName) {
    const error = new Error('DATABASE_NAME is required');
    error.code = 'MONGO_CONFIG_MISSING';
    throw error;
  }

  return {
    uri,
    dbName,
    appName: overrides.appName || process.env.MONGO_APP_NAME || process.env.SERVICE_NAME || 'ai-tutor',
    retryAttempts: Number.isInteger(overrides.retryAttempts)
      ? overrides.retryAttempts
      : DEFAULT_RETRY_ATTEMPTS,
    retryDelayMs: Number.isInteger(overrides.retryDelayMs)
      ? overrides.retryDelayMs
      : DEFAULT_RETRY_DELAY_MS,
    maxPoolSize: Number.isInteger(overrides.maxPoolSize)
      ? overrides.maxPoolSize
      : DEFAULT_MAX_POOL_SIZE,
    minPoolSize: Number.isInteger(overrides.minPoolSize)
      ? overrides.minPoolSize
      : DEFAULT_MIN_POOL_SIZE,
    serverSelectionTimeoutMs: Number.isInteger(overrides.serverSelectionTimeoutMs)
      ? overrides.serverSelectionTimeoutMs
      : DEFAULT_SERVER_SELECTION_TIMEOUT_MS,
    socketTimeoutMs: Number.isInteger(overrides.socketTimeoutMs)
      ? overrides.socketTimeoutMs
      : DEFAULT_SOCKET_TIMEOUT_MS,
  };
}

module.exports = {
  getMongoConfig,
};
