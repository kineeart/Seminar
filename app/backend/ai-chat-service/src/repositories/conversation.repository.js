const Conversation = require('../models/conversation.model');
const { connectWithRetry } = require('../../../shared/database');
const { normalizeConversationId } = require('../utils/chat-validator');

const MAX_STORED_MESSAGES = 200;

function createError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

async function ensureConnected() {
  await connectWithRetry({ appName: 'ai-chat-service' });
}

function sanitizeMessages(messages) {
  return (messages || [])
    .filter((message) => message && typeof message.content === 'string' && message.content.trim())
    .map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: message.content.trim(),
      timestamp: message.timestamp ? new Date(message.timestamp) : new Date(),
    }));
}

function normalizeConversation(doc) {
  if (!doc) {
    return null;
  }
  const value = doc.toObject ? doc.toObject() : doc;
  return {
    ...value,
    id: value._id,
    _id: undefined,
    messages: (value.messages || []).map((message) => ({
      role: message.role,
      content: message.content,
      timestamp: message.timestamp ? new Date(message.timestamp).toISOString() : null,
    })),
    created_at: value.created_at ? new Date(value.created_at).toISOString() : null,
    updated_at: value.updated_at ? new Date(value.updated_at).toISOString() : null,
  };
}

async function appendMessages(conversationId, messages, options = {}) {
  await ensureConnected();
  const id = normalizeConversationId(conversationId);
  const sanitized = sanitizeMessages(messages);

  if (!sanitized.length) {
    return getRecentMessages(id, 10);
  }

  const lastMessage = sanitized[sanitized.length - 1];
  const update = {
    $set: {
      last_message: lastMessage.content,
      last_role: lastMessage.role,
    },
    $push: {
      messages: {
        $each: sanitized,
        $slice: -MAX_STORED_MESSAGES,
      },
    },
  };

  if (options.userId) {
    update.$set.user_id = String(options.userId);
  }

  if (options.level) {
    update.$set.level = options.level;
  }

  await Conversation.findByIdAndUpdate(
    id,
    update,
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );

  return getRecentMessages(id, 10);
}

async function getRecentMessages(conversationId, limit = 10) {
  await ensureConnected();
  const id = normalizeConversationId(conversationId);
  const doc = await Conversation.findById(
    id,
    { messages: { $slice: -Math.max(1, limit) } },
  ).lean();

  if (!doc) {
    return [];
  }

  return (doc.messages || []).map((message) => ({
    role: message.role,
    content: message.content,
    timestamp: message.timestamp ? new Date(message.timestamp).toISOString() : null,
  }));
}

async function listConversations({ userId, limit = 10 } = {}) {
  await ensureConnected();
  if (!userId) {
    throw createError('VALIDATION_ERROR', 'userId is required');
  }

  const docs = await Conversation.find({ user_id: String(userId) })
    .sort({ updated_at: -1 })
    .limit(Math.max(1, Number(limit) || 10))
    .lean();

  return docs.map((doc) => ({
    id: doc._id,
    user_id: doc.user_id,
    level: doc.level || null,
    last_message: doc.last_message || '',
    last_role: doc.last_role || '',
    message_count: Array.isArray(doc.messages) ? doc.messages.length : 0,
    created_at: doc.created_at ? new Date(doc.created_at).toISOString() : null,
    updated_at: doc.updated_at ? new Date(doc.updated_at).toISOString() : null,
  }));
}

async function getConversation(conversationId, options = {}) {
  await ensureConnected();
  const id = normalizeConversationId(conversationId);
  const query = { _id: id };
  if (options.userId) {
    query.user_id = String(options.userId);
  }

  const projection = options.limit
    ? { messages: { $slice: -Math.max(1, Number(options.limit) || 10) } }
    : {};

  const doc = await Conversation.findOne(query, projection).lean();
  return normalizeConversation(doc);
}

async function resetConversations(conversationId) {
  await ensureConnected();
  if (conversationId) {
    await Conversation.deleteOne({ _id: normalizeConversationId(conversationId) });
    return;
  }

  await Conversation.deleteMany({});
}

async function countConversations() {
  await ensureConnected();
  return Conversation.countDocuments({});
}

module.exports = {
  appendMessages,
  getRecentMessages,
  listConversations,
  getConversation,
  resetConversations,
  countConversations,
};
