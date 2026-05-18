const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const quizRoutes = require('./routes/quiz.routes');
const attemptRoutes = require('./routes/attempt.routes');
const progressRoutes = require('./routes/progress.routes');
const errorMiddleware = require('./middleware/error.middleware');

dotenv.config({ path: '../../.env' });

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'quiz-service',
    timestamp: new Date().toISOString(),
  });
});

app.use('/quizzes', quizRoutes);
app.use('/attempts', attemptRoutes);
app.use('/progress', progressRoutes);

app.use(errorMiddleware);

module.exports = app;
