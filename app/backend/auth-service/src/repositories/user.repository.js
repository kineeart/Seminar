const { connectWithRetry } = require('../../../shared/database');
const User = require('../models/user.model');

async function ensureConnected() {
  await connectWithRetry({ appName: 'auth-service' });
}

function normalizeUser(doc) {
  if (!doc) {
    return null;
  }

  const user = doc.toObject ? doc.toObject() : doc;
  return {
    ...user,
    id: user._id,
    _id: undefined,
  };
}

async function createUser({ id, email, passwordHash, displayName, role = 'user' }) {
  await ensureConnected();
  const doc = await User.create({
    _id: id,
    email,
    password_hash: passwordHash,
    display_name: displayName || '',
    role,
  });
  return normalizeUser(doc);
}

async function findByEmail(email) {
  await ensureConnected();
  const doc = await User.findOne({ email }).lean();
  return normalizeUser(doc);
}

async function clearUsers() {
  await ensureConnected();
  await User.deleteMany({});
}

module.exports = {
  createUser,
  findByEmail,
  clearUsers,
};
