const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

const envPath = path.resolve(__dirname, '../../../.env');

const envResult = dotenv.config({
  path: envPath,
  override: true,
});

if (envResult.error) {
  console.error(`[CONFIG] Failed to load env from: ${envPath}`);
  throw envResult.error;
}

console.log(`[CONFIG] Loaded env from: ${envPath}`);

if (process.env.MONGODB_URI) {
  console.log('[CONFIG] MONGODB_URI detected');
}

if (!process.env.JWT_SECRET) {
  console.warn('[CONFIG] JWT_SECRET is missing');
}

const authRoutes = require('./routes/auth.routes');
const authController = require('./controllers/auth.controller');
const { connectWithRetry, registerGracefulShutdown } = require('../../shared/database');

const app = express();

const PORT = process.env.AUTH_SERVICE_PORT || process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/health', authController.health);
app.use('/', authRoutes);

async function startServer() {
  try {
    console.log('[DB] Connecting to MongoDB Atlas...');

    await connectWithRetry({ appName: 'auth-service' });

    console.log('[DB] Connected successfully');

    registerGracefulShutdown();

    app.listen(PORT, () => {
      console.log(`auth-service running on port ${PORT}`);
      console.log(`http://localhost:${PORT}/health`);
    });

  } catch (err) {
    console.error('Failed to start auth-service:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;