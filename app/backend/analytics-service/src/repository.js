const { connectWithRetry } = require('../../shared/database');
const {
  ApiLog,
  Prompt,
  ChatAnalytics,
  FlashcardAnalytics,
  TopicStat,
} = require('./models');

function normalizeCounts(value) {
  return value && typeof value === 'object' ? value : {};
}

async function ensureConnected() {
  await connectWithRetry({ appName: 'analytics-service' });
}

async function recordApiLog(entry) {
  await ensureConnected();
  const doc = await ApiLog.create({
    user_id: entry.userId || null,
    endpoint: entry.endpoint,
    method: entry.method,
    timestamp: entry.timestamp ? new Date(entry.timestamp) : new Date(),
    response_time: Number(entry.responseTime) || 0,
    status_code: Number(entry.statusCode) || 200,
    token_estimate: Number(entry.tokenEstimate) || 0,
    service: entry.service || 'gateway',
    intent: entry.intent || 'unknown',
    topic: entry.topic || 'unknown',
  });
  return doc.toObject();
}

async function listApiLogs(limit = 50) {
  await ensureConnected();
  return ApiLog.find({}).sort({ timestamp: -1 }).limit(Number(limit) || 50).lean();
}

async function upsertPrompt(service, promptText) {
  await ensureConnected();
  const existing = await Prompt.findOne({ service }).lean();
  const nextVersion = existing ? (existing.version || 1) + 1 : 1;
  const doc = await Prompt.findOneAndUpdate(
    { service },
    {
      service,
      prompt: promptText,
      version: nextVersion,
      updated_at: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
  return doc;
}

async function listPrompts() {
  await ensureConnected();
  return Prompt.find({}).sort({ service: 1 }).lean();
}

async function recordChatAnalytics({ userId, intent = 'unknown' }) {
  await ensureConnected();
  const existing = await ChatAnalytics.findOne({ user_id: userId }).lean();
  const intentCounts = normalizeCounts(existing?.intent_counts);
  intentCounts[intent] = (intentCounts[intent] || 0) + 1;
  const doc = await ChatAnalytics.findOneAndUpdate(
    { user_id: userId },
    {
      user_id: userId,
      request_count: (existing?.request_count || 0) + 1,
      intent_counts: intentCounts,
      last_intent: intent,
      updated_at: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
  return doc;
}

async function recordFlashcardAnalytics({ userId, topic = 'unknown', generatedCount = 0 }) {
  await ensureConnected();
  const existing = await FlashcardAnalytics.findOne({ user_id: userId }).lean();
  const topicCounts = normalizeCounts(existing?.topic_counts);
  topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  const doc = await FlashcardAnalytics.findOneAndUpdate(
    { user_id: userId },
    {
      user_id: userId,
      generated_count: (existing?.generated_count || 0) + Number(generatedCount || 0),
      topic_counts: topicCounts,
      last_topic: topic,
      updated_at: new Date(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
  return doc;
}

async function recordTopicStats(topics = []) {
  await ensureConnected();
  const normalizedTopics = topics.filter(Boolean).map((topic) => String(topic).trim().toLowerCase());
  const results = [];

  for (const topic of normalizedTopics) {
    const existing = await TopicStat.findOne({ topic }).lean();
    const doc = await TopicStat.findOneAndUpdate(
      { topic },
      {
        topic,
        count: (existing?.count || 0) + 1,
        last_seen: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();
    results.push(doc);
  }

  return results;
}

async function getAnalyticsSummary() {
  await ensureConnected();
  const [apiLogs, prompts, chatAnalytics, flashcardAnalytics, topicStats] = await Promise.all([
    ApiLog.find({}).sort({ timestamp: -1 }).limit(10).lean(),
    Prompt.find({}).sort({ service: 1 }).lean(),
    ChatAnalytics.find({}).sort({ updated_at: -1 }).lean(),
    FlashcardAnalytics.find({}).sort({ updated_at: -1 }).lean(),
    TopicStat.find({}).sort({ count: -1 }).limit(10).lean(),
  ]);

  return {
    totalRequests: await ApiLog.countDocuments({}),
    totalPrompts: prompts.length,
    totalUsersTracked: chatAnalytics.length,
    totalFlashcardUsersTracked: flashcardAnalytics.length,
    recentLogs: apiLogs,
    prompts,
    chatAnalytics,
    flashcardAnalytics,
    topicStats,
  };
}

module.exports = {
  recordApiLog,
  listApiLogs,
  upsertPrompt,
  listPrompts,
  recordChatAnalytics,
  recordFlashcardAnalytics,
  recordTopicStats,
  getAnalyticsSummary,
};
