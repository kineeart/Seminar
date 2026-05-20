const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'analysis-service' });
});

// Learning analysis endpoint
const analysisController = require('./controllers/analysis.controller');
app.get('/learning-analysis', analysisController.getLearningAnalysis);

// Error handler
app.use((err, req, res, next) => {
  console.error('[ANALYSIS_ERROR]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
