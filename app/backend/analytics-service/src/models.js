const mongoose = require('mongoose');

const apiLogSchema = new mongoose.Schema(
  {
    user_id: { type: String, default: null, index: true },
    endpoint: { type: String, required: true, index: true },
    method: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
    response_time: { type: Number, default: 0 },
    status_code: { type: Number, default: 200 },
    token_estimate: { type: Number, default: 0 },
    service: { type: String, default: 'gateway' },
    intent: { type: String, default: 'unknown' },
    topic: { type: String, default: 'unknown' },
  },
  { versionKey: false },
);

const promptSchema = new mongoose.Schema(
  {
    service: { type: String, required: true, unique: true, index: true },
    prompt: { type: String, required: true },
    version: { type: Number, default: 1 },
    updated_at: { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
);

const chatAnalyticsSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, index: true },
    request_count: { type: Number, default: 0 },
    intent_counts: { type: mongoose.Schema.Types.Mixed, default: {} },
    last_intent: { type: String, default: 'unknown' },
    updated_at: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

const flashcardAnalyticsSchema = new mongoose.Schema(
  {
    user_id: { type: String, required: true, index: true },
    generated_count: { type: Number, default: 0 },
    topic_counts: { type: mongoose.Schema.Types.Mixed, default: {} },
    last_topic: { type: String, default: 'unknown' },
    updated_at: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

const topicStatsSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true, unique: true, index: true },
    count: { type: Number, default: 0 },
    last_seen: { type: Date, default: Date.now },
  },
  { versionKey: false },
);

const ApiLog = mongoose.models.ApiLog || mongoose.model('ApiLog', apiLogSchema, 'api_logs');
const Prompt = mongoose.models.Prompt || mongoose.model('Prompt', promptSchema, 'prompts');
const ChatAnalytics = mongoose.models.ChatAnalytics || mongoose.model('ChatAnalytics', chatAnalyticsSchema, 'chat_analytics');
const FlashcardAnalytics = mongoose.models.FlashcardAnalytics || mongoose.model('FlashcardAnalytics', flashcardAnalyticsSchema, 'flashcard_analytics');
const TopicStat = mongoose.models.TopicStat || mongoose.model('TopicStat', topicStatsSchema, 'topics_stats');

module.exports = {
  ApiLog,
  Prompt,
  ChatAnalytics,
  FlashcardAnalytics,
  TopicStat,
};
