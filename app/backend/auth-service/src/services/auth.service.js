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
  const jwtSecret = process.env.JWT_SECRET || 'dev_fallback_secret';

  // Temporary audit logs for login path debugging.
  // eslint-disable-next-line no-console
  console.log('[LOGIN DEBUG] JWT_SECRET =', process.env.JWT_SECRET);
  // eslint-disable-next-line no-console
  console.log('[LOGIN DEBUG] ENV KEYS =', Object.keys(process.env).filter((key) => key.includes('JWT')));
  // eslint-disable-next-line no-console
  console.log('JWT SIGN TEST', jwt.sign({ test: 1 }, jwtSecret));

  return jwtSecret;
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
    role: validation.email === 'admin@gmail.com' ? 'admin' : 'user',
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
  // Temporary trace for login path debugging.
  // eslint-disable-next-line no-console
  console.log('[LOGIN] service invoked');
  const validation = validateCredentials(payload);

  if (validation.error) {
    return validation;
  }

  const existingUser = await userRepository.findByEmail(validation.email);
  // eslint-disable-next-line no-console
  console.log('[LOGIN] user lookup completed', {
    found: Boolean(existingUser),
    hasStoredHash: Boolean(existingUser && existingUser.password_hash),
  });

  if (!existingUser || existingUser.password_hash !== validation.password) {
    return {
      error: 'invalid_credentials',
      message: 'Invalid email or password',
    };
  }

  let token;
  try {
    const role = existingUser.role || (existingUser.email === 'admin@gmail.com' ? 'admin' : 'user');
    // eslint-disable-next-line no-console
    console.log('[LOGIN] about to sign token');
    token = jwt.sign(
      {
        sub: existingUser.id,
        email: existingUser.email,
        role,
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
