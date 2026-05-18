const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes');
const authController = require('./controllers/auth.controller');
const { connectWithRetry, registerGracefulShutdown } = require('../../shared/database');

dotenv.config({ path: '../../.env' });

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/health', authController.health);
app.use('/', authRoutes);

async function startServer() {
  try {
    await connectWithRetry({ appName: 'auth-service' });
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
