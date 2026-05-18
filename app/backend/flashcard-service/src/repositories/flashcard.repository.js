const Flashcard = require('../models/flashcard.model');
const { connectWithRetry } = require('../../../shared/database');

async function ensureConnected() {
  await connectWithRetry({ appName: 'flashcard-service' });
}

function normalizeFlashcard(doc) {
  if (!doc) {
    return null;
  }
  const value = doc.toObject ? doc.toObject() : doc;
  return {
    ...value,
    id: value._id,
    _id: undefined,
    created_at: value.created_at ? new Date(value.created_at).toISOString() : null,
    updated_at: value.updated_at ? new Date(value.updated_at).toISOString() : null,
    reviewed_at: value.reviewed_at ? new Date(value.reviewed_at).toISOString() : null,
  };
}

async function createFlashcards(flashcards) {
  await ensureConnected();
  const docs = await Flashcard.insertMany(flashcards, { ordered: false });
  return docs.map((doc) => normalizeFlashcard(doc));
}

async function listFlashcards({ userId, conversationId, limit = 50, offset = 0 } = {}) {
  await ensureConnected();
  const query = {};
  if (userId) {
    query.user_id = String(userId);
  }
  if (conversationId) {
    query.conversation_id = String(conversationId);
  }

  const docs = await Flashcard.find(query)
    .sort({ created_at: -1 })
    .skip(Math.max(0, Number(offset) || 0))
    .limit(Math.max(1, Number(limit) || 50))
    .lean();

  return docs.map((doc) => normalizeFlashcard(doc));
}

async function markReviewed(flashcardId, reviewedAt = new Date()) {
  await ensureConnected();
  const doc = await Flashcard.findByIdAndUpdate(
    flashcardId,
    { reviewed_at: reviewedAt },
    { new: true },
  );
  return normalizeFlashcard(doc);
}

async function getStats(userId) {
  await ensureConnected();
  const query = { user_id: String(userId) };
  const [total, reviewed, lastReviewed, lastCreated] = await Promise.all([
    Flashcard.countDocuments(query),
    Flashcard.countDocuments({ ...query, reviewed_at: { $ne: null } }),
    Flashcard.findOne({ ...query, reviewed_at: { $ne: null } })
      .sort({ reviewed_at: -1 })
      .lean(),
    Flashcard.findOne(query).sort({ created_at: -1 }).lean(),
  ]);

  return {
    total,
    reviewed,
    last_reviewed_at: lastReviewed && lastReviewed.reviewed_at
      ? new Date(lastReviewed.reviewed_at).toISOString()
      : null,
    last_created_at: lastCreated && lastCreated.created_at
      ? new Date(lastCreated.created_at).toISOString()
      : null,
  };
}

async function clearFlashcards() {
  await ensureConnected();
  await Flashcard.deleteMany({});
}

module.exports = {
  createFlashcards,
  listFlashcards,
  markReviewed,
  getStats,
  clearFlashcards,
};
