const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');
const adminRoutes = require('./admin.routes');

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.GATEWAY_PORT || process.env.PORT || 5000;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const AI_CHAT_SERVICE_URL = process.env.AI_CHAT_SERVICE_URL || 'http://localhost:5002';
const FLASHCARD_SERVICE_URL = process.env.FLASHCARD_SERVICE_URL || 'http://localhost:3003';
const QUIZ_SERVICE_URL = process.env.QUIZ_SERVICE_URL || 'http://localhost:5004';
const ANALYTICS_SERVICE_URL = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:5005';

function decodeJwtPayload(token) {
  if (!token || !token.includes('.')) {
    return null;
  }

  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = Buffer.from(normalized, 'base64').toString('utf8');
    return JSON.parse(json);
  } catch (_error) {
    return null;
  }
}

function classifyIntent(body = {}) {
  const message = String(body.message || body.prompt || '').toLowerCase();

  if (message.includes('translate') || message.includes('dịch')) {
    return 'translation';
  }

  if (message.includes('explain') || message.includes('giải thích')) {
    return 'explanation';
  }

  if (message.includes('quiz') || message.includes('test')) {
    return 'assessment';
  }

  if (message.includes('flashcard') || message.includes('card')) {
    return 'flashcard';
  }

  return message ? 'learning' : 'unknown';
}

function classifyTopic(body = {}) {
  const text = JSON.stringify(body).toLowerCase();
  const topics = [];

  if (text.includes('grammar')) topics.push('grammar');
  if (text.includes('vocabulary')) topics.push('vocabulary');
  if (text.includes('speaking')) topics.push('speaking');
  if (text.includes('listening')) topics.push('listening');
  if (text.includes('reading')) topics.push('reading');
  if (text.includes('writing')) topics.push('writing');
  if (text.includes('toeic')) topics.push('toeic');
  if (text.includes('ielts')) topics.push('ielts');

  return topics.length ? topics : ['general'];
}

function estimateTokens(body = {}) {
  const text = String(body.message || body.prompt || JSON.stringify(body) || '');
  return Math.max(1, Math.ceil(text.length / 4));
}

function resolveServiceFromEndpoint(endpoint) {
  if (endpoint.startsWith('/api/auth')) return 'auth-service';
  if (endpoint.startsWith('/api/chat')) return 'ai-chat-service';
  if (endpoint.startsWith('/api/flashcards')) return 'flashcard-service';
  if (endpoint.startsWith('/api/quizzes')) return 'quiz-service';
  return 'gateway';
}

function shouldLogRequest(req) {
  if (!req.originalUrl.startsWith('/api/')) {
    return false;
  }

  if (req.originalUrl.startsWith('/api/analytics')) {
    return false;
  }

  return !['OPTIONS', 'HEAD'].includes(req.method);
}

function trackRequest(req, res) {
  if (!shouldLogRequest(req)) {
    return;
  }

  const startedAt = Date.now();
  res.on('finish', () => {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    const payload = decodeJwtPayload(token);
    const body = req.body || {};
    const endpoint = req.originalUrl.split('?')[0];

    const analyticsEvent = {
      userId: payload?.sub || payload?.email || null,
      endpoint,
      method: req.method,
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startedAt,
      statusCode: res.statusCode,
      tokenEstimate: estimateTokens(body),
      service: resolveServiceFromEndpoint(endpoint),
      intent: classifyIntent(body),
      topic: classifyTopic(body).join(', '),
    };

    fetch(`${ANALYTICS_SERVICE_URL}/logs/ingest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analyticsEvent),
    }).catch((error) => {
      console.error('Gateway analytics log error:', error.message);
    });
  });
}

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  trackRequest(req, res);
  next();
});

// Admin routes (handled directly by gateway)
app.use('/api/admin', adminRoutes);

app.get('/health', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    service: 'gateway',
    timestamp: new Date().toISOString(),
  });
});

app.use(
  '/api/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': '',
    },
    on: {
      proxyReq: fixRequestBody,
    },
    onError(error, _req, res) {
      console.error('Gateway proxy error:', error.message);
      res.status(502).json({
        status: 'error',
        message: 'Auth service unavailable',
      });
    },
  }),
);

app.use(
  '/api/chat',
  createProxyMiddleware({
    target: AI_CHAT_SERVICE_URL,
    changeOrigin: true,
    timeout: 120000,
    proxyTimeout: 120000,
    pathRewrite: {
      '^/api/chat': '',
    },
    on: {
      proxyReq: fixRequestBody,
    },
    onError(error, _req, res) {
      console.error('Gateway proxy error:', error.message);
      res.status(502).json({
        status: 'error',
        message: 'AI chat service unavailable',
      });
    },
  }),
);

app.use(
  '/api/flashcards',
  createProxyMiddleware({
    target: FLASHCARD_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/flashcards': '',
    },
    on: {
      proxyReq: fixRequestBody,
    },
    onError(error, _req, res) {
      console.error('Gateway proxy error:', error.message);
      res.status(502).json({
        status: 'error',
        message: 'Flashcard service unavailable',
      });
    },
  }),
);

app.use(
  '/api/quizzes',
  createProxyMiddleware({
    target: QUIZ_SERVICE_URL,
    changeOrigin: true,
    timeout: 180000,
    proxyTimeout: 180000,
    pathRewrite: {
      '^/api/quizzes': '',
    },
    on: {
      proxyReq: fixRequestBody,
    },
    onError(error, _req, res) {
      console.error('Gateway proxy error:', error.message);
      res.status(502).json({
        status: 'error',
        message: 'Quiz service unavailable',
      });
    },
  }),
);

app.use(
  '/api/analytics',
  createProxyMiddleware({
    target: ANALYTICS_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/analytics': '',
    },
    on: {
      proxyReq: fixRequestBody,
    },
    onError(error, _req, res) {
      console.error('Gateway proxy error:', error.message);
      res.status(502).json({
        status: 'error',
        message: 'Analytics service unavailable',
      });
    },
  }),
);

app.use(
  '/api/progress',
  createProxyMiddleware({
    target: QUIZ_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/progress': '',
    },
    on: {
      proxyReq: fixRequestBody,
    },
    onError(error, _req, res) {
      console.error('Gateway proxy error:', error.message);
      res.status(502).json({
        status: 'error',
        message: 'Progress service unavailable',
      });
    },
  }),
);

app.use(
  '/api/attempts',
  createProxyMiddleware({
    target: QUIZ_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => path.replace(/^\//, '/attempts/'),
    on: {
      proxyReq: fixRequestBody,
    },
    onError(error, _req, res) {
      console.error('Gateway proxy error:', error.message);
      res.status(502).json({
        status: 'error',
        message: 'Attempts service unavailable',
      });
    },
  }),
);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`gateway running on port ${PORT}`);
    console.log(`proxying /api/auth -> ${AUTH_SERVICE_URL}`);
    console.log(`proxying /api/chat -> ${AI_CHAT_SERVICE_URL}`);
    console.log(`proxying /api/flashcards -> ${FLASHCARD_SERVICE_URL}`);
    console.log(`proxying /api/quizzes -> ${QUIZ_SERVICE_URL}`);
    console.log(`proxying /api/analytics -> ${ANALYTICS_SERVICE_URL}`);
  });
}

module.exports = app;
