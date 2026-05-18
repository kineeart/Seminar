const express = require('express');
const controller = require('../controllers/attempt.controller');

const router = express.Router();

router.get('/', controller.listAttempts);

module.exports = router;
