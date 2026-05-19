const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    _id: { type: String },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    display_name: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      default: 'user',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    versionKey: false,
  },
);

userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.models.User || mongoose.model('User', userSchema, 'users');

module.exports = User;
