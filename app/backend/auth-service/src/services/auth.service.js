const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/user.repository');
const { createId } = require('../utils/id');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function validateCredentials({ email, password }) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = String(password || '').trim();

  if (!normalizedEmail) {
    return { error: 'validation', message: 'Email is required' };
  }

  if (!normalizedPassword) {
    return { error: 'validation', message: 'Password is required' };
  }

  return {
    email: normalizedEmail,
    password: normalizedPassword,
  };
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const error = new Error('JWT_SECRET is required');
    error.code = 'CONFIG_MISSING';
    throw error;
  }
  return secret;
}

async function signup(payload) {
  const validation = validateCredentials(payload);

  if (validation.error) {
    return validation;
  }

  const existingUser = await userRepository.findByEmail(validation.email);

  if (existingUser) {
    return {
      error: 'duplicate',
      message: 'Email already exists',
    };
  }

  const user = await userRepository.createUser({
    id: createId('user'),
    email: validation.email,
    passwordHash: validation.password,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.created_at ? new Date(user.created_at).toISOString() : null,
    },
  };
}

async function login(payload) {
  const validation = validateCredentials(payload);

  if (validation.error) {
    return validation;
  }

  const existingUser = await userRepository.findByEmail(validation.email);

  if (!existingUser || existingUser.password_hash !== validation.password) {
    return {
      error: 'invalid_credentials',
      message: 'Invalid email or password',
    };
  }

  let token;
  try {
    token = jwt.sign(
      {
        sub: existingUser.id,
        email: existingUser.email,
        role: existingUser.role || 'user',
      },
      getJwtSecret(),
      { expiresIn: '1h' },
    );
  } catch (err) {
    return {
      error: 'config',
      message: err.message,
    };
  }

  return {
    token,
    user: {
      id: existingUser.id,
      email: existingUser.email,
    },
  };
}

function resetStore() {
  return userRepository.clearUsers();
}

module.exports = {
  signup,
  login,
  resetStore,
};
