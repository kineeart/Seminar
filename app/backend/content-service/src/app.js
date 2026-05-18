const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const lessonRoutes = require('./routes/lesson.routes');
const errorMiddleware = require('./middleware/error.middleware');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'content-service',
    timestamp: new Date().toISOString(),
  });
});

app.use('/lessons', lessonRoutes);

app.use(errorMiddleware);

module.exports = app;
