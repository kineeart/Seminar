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

// Admin endpoints
const Conversation = require('./models/conversation.model');

app.get('/admin/stats', async (req, res) => {
  try {
    const total = await Conversation.countDocuments({});
    res.json({ total });
  } catch { res.json({ total: 0 }); }
});
app.get('/admin/conversations', async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const total = await Conversation.countDocuments({});
    const conversations = await Conversation.find({})
      .sort({ updated_at: -1 })
      .limit(limit)
      .lean()
      .then((docs) => docs.map((d) => ({
        id: d._id,
        userId: d.user_id,
        messageCount: d.messages ? d.messages.length : 0,
        lastMessage: d.last_message || '',
        updatedAt: d.updated_at,
      })));
    res.json({ conversations, total });
  } catch { res.json({ conversations: [], total: 0 }); }
});
app.delete('/admin/conversations/:id', async (req, res) => {
  try {
    const result = await Conversation.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Mount at both root and /chat for gateway compatibility
app.use('/', chatRouter);
app.use('/chat', chatRouter);

// Error handler
app.use(errorMiddleware);

module.exports = app;
