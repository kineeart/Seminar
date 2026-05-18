const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ['user', 'assistant', 'system'],
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const conversationSchema = new mongoose.Schema(
  {
    _id: { type: String },
    user_id: { type: String, index: true },
    level: { type: String },
    last_message: { type: String, default: '' },
    last_role: { type: String, default: '' },
    messages: {
      type: [messageSchema],
      default: [],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
);

conversationSchema.index({ user_id: 1, updated_at: -1 });

const Conversation = mongoose.models.Conversation
  || mongoose.model('Conversation', conversationSchema, 'conversations');

module.exports = Conversation;
