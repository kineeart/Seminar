const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const chatRouter = require('./routes/chat.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'ai-chat-service' });
});

app.use('/chat', chatRouter);

// Error handler
app.use(errorMiddleware);

module.exports = app;
