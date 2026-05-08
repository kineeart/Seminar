const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes');
const authController = require('./controllers/auth.controller');

dotenv.config();

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/health', authController.health);
app.use('/', authRoutes);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`auth-service running on port ${PORT}`);
    console.log(`http://localhost:${PORT}/health`);
  });
}

module.exports = app;
