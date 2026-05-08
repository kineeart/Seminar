const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createProxyMiddleware, fixRequestBody } = require('http-proxy-middleware');

dotenv.config();

const app = express();
const PORT = process.env.GATEWAY_PORT || process.env.PORT || 5000;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';

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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`gateway running on port ${PORT}`);
    console.log(`proxying /api/auth -> ${AUTH_SERVICE_URL}`);
  });
}

module.exports = app;