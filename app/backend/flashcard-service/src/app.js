const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const flashcardRouter = require('./routes/flashcard.routes');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'flashcard-service' });
});

// Admin endpoints
const Flashcard = require('./models/flashcard.model');
const { connectWithRetry } = require('../../shared/database');

app.get('/admin/stats', async (req, res) => {
  try {
    await connectWithRetry({ appName: 'flashcard-service' });
    const total = await Flashcard.countDocuments({});
    const byChatInline = await Flashcard.countDocuments({ source: 'chat-inline' });
    const byAi = await Flashcard.countDocuments({ source: 'ai' });
    const bySeed = await Flashcard.countDocuments({ source: 'seed' });
    res.json({ total, byChatInline, byAi, bySeed });
  } catch { res.json({ total: 0 }); }
});

app.get('/admin/flashcards', async (req, res) => {
  try {
    await connectWithRetry({ appName: 'flashcard-service' });
    const { source, limit = 50, offset = 0 } = req.query;
    const query = {};
    if (source) query.source = source;
    const total = await Flashcard.countDocuments(query);
    const flashcards = await Flashcard.find(query)
      .sort({ created_at: -1 })
      .skip(Number(offset) || 0)
      .limit(Number(limit) || 50)
      .lean();
    res.json({ flashcards, total });
  } catch { res.json({ flashcards: [], total: 0 }); }
});

app.delete('/admin/flashcards/:id', async (req, res) => {
  try {
    await connectWithRetry({ appName: 'flashcard-service' });
    const result = await Flashcard.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/admin/flashcards', async (req, res) => {
  try {
    await connectWithRetry({ appName: 'flashcard-service' });
    const { word, ipa, meaning, example, user_id, source } = req.body;
    if (!word || !meaning) return res.status(400).json({ error: 'word and meaning required' });
    const crypto = require('crypto');
    const doc = await Flashcard.create({
      _id: `flashcard_${crypto.randomUUID()}`,
      word, ipa: ipa || '', meaning, example: example || '',
      user_id: user_id || 'admin', source: source || 'admin',
    });
    res.json({ success: true, flashcard: doc.toObject() });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.patch('/admin/flashcards/:id', async (req, res) => {
  try {
    await connectWithRetry({ appName: 'flashcard-service' });
    const { word, ipa, meaning, example } = req.body;
    const updates = {};
    if (word !== undefined) updates.word = word;
    if (ipa !== undefined) updates.ipa = ipa;
    if (meaning !== undefined) updates.meaning = meaning;
    if (example !== undefined) updates.example = example;
    const doc = await Flashcard.findByIdAndUpdate(req.params.id, updates, { new: true }).lean();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, flashcard: doc });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Mount at both root and /flashcards for gateway compatibility
app.use('/', flashcardRouter);
app.use('/flashcards', flashcardRouter);

// Error handler
app.use(errorMiddleware);

module.exports = app;
