const axios = require('axios');
const logger = require('../utils/logger');
const retryHelper = require('../utils/retry-helper');

const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-1.0';

async function callGemini(prompt, opts = {}) {
  const model = (opts && opts.model) || DEFAULT_MODEL;
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  const endpoint = `https://generativeai.googleapis.com/v1beta2/models/${encodeURIComponent(model)}:generateText`;

  const payload = {
    prompt: {
      text: prompt,
    },
    temperature: 0.2,
    maxOutputTokens: 800,
  };

  const headers = apiKey
    ? { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };

  const doRequest = async () => {
    const resp = await axios.post(endpoint, payload, { headers });
    // Attempt to extract text from known response shapes
    const { data } = resp || {};
    if (data && data.candidates && Array.isArray(data.candidates) && data.candidates[0]) {
      const candOut = data.candidates[0].output;
      if (candOut) return candOut;
    }
    if (data && data.output && Array.isArray(data.output) && data.output[0]) {
      return data.output[0].content;
    }
    return JSON.stringify(data || {});
  };

  try {
    const result = await retryHelper.retry(doRequest, { retries: 2, backoffMs: 500 });
    return result;
  } catch (err) {
    logger.error('Gemini call failed', { error: err.message });
    throw err;
  }
}

module.exports = { callGemini };
