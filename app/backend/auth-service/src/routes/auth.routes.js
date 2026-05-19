const express = require('express');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/auth.controller');

const router = express.Router();

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'No token provided' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_fallback_secret');
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ status: 'error', message: 'Invalid or expired token' });
  }
}

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router;
