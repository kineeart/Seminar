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
  // Keep original mongo id under `id` and remove `_id` from payload.
  // eslint-disable-next-line no-underscore-dangle
  const mongoId = user._id;
  return {
    ...user,
    id: mongoId,
    _id: undefined,
  };
}

async function createUser({
  id,
  email,
  passwordHash,
  displayName,
  role = 'user',
}) {
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

async function findById(userId) {
  await ensureConnected();
  const doc = await User.findOne({ _id: userId }).lean();
  return normalizeUser(doc);
}

async function clearUsers() {
  await ensureConnected();
  await User.deleteMany({});
}

async function updateUser(userId, updates) {
  await ensureConnected();
  const updateFields = {};
  if (updates.role) updateFields.role = updates.role;
  if (updates.password) updateFields.password_hash = updates.password;
  const doc = await User.findByIdAndUpdate(userId, updateFields, { new: true }).lean();
  return normalizeUser(doc);
}

async function deleteUser(userId) {
  await ensureConnected();
  const doc = await User.findByIdAndDelete(userId);
  return Boolean(doc);
}

async function listAll() {
  await ensureConnected();
  const docs = await User.find({}).lean();
  return docs.map(normalizeUser);
}

async function countAll() {
  await ensureConnected();
  return User.countDocuments({});
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  clearUsers,
  listAll,
  countAll,
  updateUser,
  deleteUser,
};
