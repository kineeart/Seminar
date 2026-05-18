const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.GATEWAY_PORT || process.env.PORT || 5000;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const AI_CHAT_SERVICE_URL = process.env.AI_CHAT_SERVICE_URL || 'http://localhost:5002';
const FLASHCARD_SERVICE_URL = process.env.FLASHCARD_SERVICE_URL || 'http://localhost:3003';
const CONTENT_SERVICE_URL = process.env.CONTENT_SERVICE_URL || 'http://localhost:5003';
const QUIZ_SERVICE_URL = process.env.QUIZ_SERVICE_URL || 'http://localhost:5004';

app.use(cors());
app.use(express.json());

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
  '/api/content',
  createProxyMiddleware({
    target: CONTENT_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/content': '',
    },
    on: {
      proxyReq: fixRequestBody,
    },
    onError(error, _req, res) {
      console.error('Gateway proxy error:', error.message);
      res.status(502).json({
        status: 'error',
        message: 'Content service unavailable',
      });
    },
  }),
);

app.use(
  '/api/quizzes',
  createProxyMiddleware({
    target: QUIZ_SERVICE_URL,
    changeOrigin: true,
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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`gateway running on port ${PORT}`);
    console.log(`proxying /api/auth -> ${AUTH_SERVICE_URL}`);
    console.log(`proxying /api/chat -> ${AI_CHAT_SERVICE_URL}`);
    console.log(`proxying /api/flashcards -> ${FLASHCARD_SERVICE_URL}`);
    console.log(`proxying /api/content -> ${CONTENT_SERVICE_URL}`);
    console.log(`proxying /api/quizzes -> ${QUIZ_SERVICE_URL}`);
  });
}

module.exports = app;