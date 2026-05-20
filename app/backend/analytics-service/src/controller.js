const jwt = require('jsonwebtoken');
const repo = require('./repository');
const { generateLearningAnalysis } = require('./services/learning-analysis.service');

function health(_req, res) {
  return res.status(200).json({
    status: 'ok',
    service: 'analytics-service',
    timestamp: new Date().toISOString(),
  });
}

function decodeBearerToken(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (_error) {
    return null;
  }
}

function requireAdmin(req, res, next) {
  const payload = decodeBearerToken(req);
  if (!payload) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  if ((payload.role || 'user') !== 'admin') {
    return res.status(403).json({ status: 'error', message: 'Admin role required' });
  }

  req.user = payload;
  return next();
}

async function ingestLog(req, res, next) {
  try {
    const body = req.body || {};
    const saved = await repo.recordApiLog(body);

    if (body.endpoint === '/api/chat') {
      await repo.recordChatAnalytics({
        userId: body.userId || 'anonymous',
        intent: body.intent || 'unknown',
      });
    }

    if (body.endpoint === '/api/flashcards/generate') {
      await repo.recordFlashcardAnalytics({
        userId: body.userId || 'anonymous',
        topic: body.topic || 'unknown',
        generatedCount: body.generatedCount || 0,
      });
    }

    if (Array.isArray(body.topics) && body.topics.length) {
      await repo.recordTopicStats(body.topics);
    }

    return res.status(201).json({ success: true, log: saved });
  } catch (error) {
    return next(error);
  }
}

async function getLogs(req, res, next) {
  try {
    const logs = await repo.listApiLogs(req.query.limit || 50);
    return res.json({ success: true, logs });
  } catch (error) {
    return next(error);
  }
}

async function getSummary(_req, res, next) {
  try {
    const summary = await repo.getAnalyticsSummary();
    return res.json({ success: true, summary });
  } catch (error) {
    return next(error);
  }
}

async function getPrompts(_req, res, next) {
  try {
    const prompts = await repo.listPrompts();
    return res.json({ success: true, prompts });
  } catch (error) {
    return next(error);
  }
}

async function updatePrompt(req, res, next) {
  try {
    const { service } = req.params;
    const prompt = String(req.body?.prompt || '').trim();
    if (!prompt) {
      return res.status(400).json({ status: 'error', message: 'Prompt is required' });
    }

    const updated = await repo.upsertPrompt(service, prompt);
    return res.json({ success: true, prompt: updated });
  } catch (error) {
    return next(error);
  }
}

async function getChatAnalytics(_req, res, next) {
  try {
    const summary = await repo.getAnalyticsSummary();
    return res.json({ success: true, chatAnalytics: summary.chatAnalytics });
  } catch (error) {
    return next(error);
  }
}

async function getFlashcardAnalytics(_req, res, next) {
  try {
    const summary = await repo.getAnalyticsSummary();
    return res.json({ success: true, flashcardAnalytics: summary.flashcardAnalytics });
  } catch (error) {
    return next(error);
  }
}

async function getTopicStats(_req, res, next) {
  try {
    const summary = await repo.getAnalyticsSummary();
    return res.json({ success: true, topics: summary.topicStats });
  } catch (error) {
    return next(error);
  }
}

function forbidden(_req, res) {
  return res.status(401).json({ status: 'error', message: 'Unauthorized' });
}

async function getLearningAnalysis(req, res, next) {
  try {
    const userId = req.query.userId || req.body?.userId || 'guest';
    const useAI = String(req.query.useAI || 'true').toLowerCase() !== 'false';
    const analysis = await generateLearningAnalysis({ userId, useAI });
    return res.json({ success: true, analysis });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  health,
  requireAdmin,
  ingestLog,
  getLogs,
  getSummary,
  getPrompts,
  updatePrompt,
  getChatAnalytics,
  getFlashcardAnalytics,
  getTopicStats,
  forbidden,
  getLearningAnalysis,
};
