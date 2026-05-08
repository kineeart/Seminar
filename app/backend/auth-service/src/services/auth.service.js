const jwt = require('jsonwebtoken');

const users = [];
const JWT_SECRET = process.env.JWT_SECRET || 'mvp-auth-secret';

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

function signup(payload) {
  const validation = validateCredentials(payload);

  if (validation.error) {
    return validation;
  }

  const existingUser = users.find((user) => user.email === validation.email);

  if (existingUser) {
    return {
      error: 'duplicate',
      message: 'Email already exists',
    };
  }

  const user = {
    id: `${Date.now()}-${users.length + 1}`,
    email: validation.email,
    password: validation.password,
    createdAt: new Date().toISOString(),
  };

  users.push(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    },
  };
}

function login(payload) {
  const validation = validateCredentials(payload);

  if (validation.error) {
    return validation;
  }

  const existingUser = users.find((user) => user.email === validation.email);

  if (!existingUser || existingUser.password !== validation.password) {
    return {
      error: 'invalid_credentials',
      message: 'Invalid email or password',
    };
  }

  const token = jwt.sign(
    {
      sub: existingUser.id,
      email: existingUser.email,
      role: 'user',
    },
    JWT_SECRET,
    { expiresIn: '1h' },
  );

  return {
    token,
    user: {
      id: existingUser.id,
      email: existingUser.email,
    },
  };
}

function resetStore() {
  users.length = 0;
}

module.exports = {
  signup,
  login,
  resetStore,
  _users: users,
};
