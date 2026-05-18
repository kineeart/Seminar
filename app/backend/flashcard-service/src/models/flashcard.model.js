const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema(
  {
    _id: { type: String },
    user_id: { type: String, index: true },
    conversation_id: { type: String, index: true },
    word: {
      type: String,
      required: true,
      trim: true,
    },
    ipa: {
      type: String,
      trim: true,
      default: '',
    },
    meaning: {
      type: String,
      required: true,
      trim: true,
    },
    example: {
      type: String,
      required: true,
      trim: true,
    },
    source: {
      type: String,
      default: 'ai',
    },
    reviewed_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
);

flashcardSchema.index({ user_id: 1, created_at: -1 });
flashcardSchema.index({ conversation_id: 1, created_at: -1 });
flashcardSchema.index({ user_id: 1, word: 1 });

const Flashcard = mongoose.models.Flashcard
  || mongoose.model('Flashcard', flashcardSchema, 'flashcards');

module.exports = Flashcard;
