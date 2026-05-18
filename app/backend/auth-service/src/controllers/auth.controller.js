const authService = require('../services/auth.service');

function health(_req, res) {
  return res.status(200).json({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
  });
}

async function signup(req, res) {
  const result = await authService.signup(req.body || {});

  if (result.error === 'validation') {
    return res.status(400).json({
      status: 'error',
      message: result.message,
    });
  }

  if (result.error === 'duplicate') {
    return res.status(409).json({
      status: 'error',
      message: result.message,
    });
  }

  return res.status(201).json({
    status: 'success',
    message: 'Signup successful',
    user: result.user,
  });
}

async function login(req, res) {
  const result = await authService.login(req.body || {});

  if (result.error === 'validation') {
    return res.status(400).json({
      status: 'error',
      message: result.message,
    });
  }

  if (result.error === 'invalid_credentials') {
    return res.status(401).json({
      status: 'error',
      message: result.message,
    });
  }

  if (result.error === 'config') {
    return res.status(500).json({
      status: 'error',
      message: result.message,
    });
  }

  return res.status(200).json({
    status: 'success',
    message: 'Login successful',
    token: result.token,
    user: result.user,
  });
}

module.exports = {
  health,
  signup,
  login,
};
