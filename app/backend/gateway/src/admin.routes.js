const express = require('express');

const router = express.Router();

// Admin endpoints - aggregate data from all services
// These run directly in gateway since it has access to all service URLs

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const AI_CHAT_SERVICE_URL = process.env.AI_CHAT_SERVICE_URL || 'http://localhost:5002';
const FLASHCARD_SERVICE_URL = process.env.FLASHCARD_SERVICE_URL || 'http://localhost:3003';
const QUIZ_SERVICE_URL = process.env.QUIZ_SERVICE_URL || 'http://localhost:5004';

async function fetchJson(url, timeout = 5000) {
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(timeout) });
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

// GET /api/admin/stats - Overview stats
router.get('/stats', async (req, res) => {
  const [authData, flashcardData, chatData, quizData] = await Promise.all([
    fetchJson(`${AUTH_SERVICE_URL}/admin/stats`),
    fetchJson(`${FLASHCARD_SERVICE_URL}/admin/stats`),
    fetchJson(`${AI_CHAT_SERVICE_URL}/admin/stats`),
    fetchJson(`${QUIZ_SERVICE_URL}/admin/stats`),
  ]);

  res.json({
    users: authData || { total: 0 },
    flashcards: flashcardData || { total: 0 },
    conversations: chatData || { total: 0 },
    quizzes: quizData || { total: 0 },
  });
});

// GET /api/admin/users - List all users
router.get('/users', async (req, res) => {
  const data = await fetchJson(`${AUTH_SERVICE_URL}/admin/users`);
  res.json(data || { users: [] });
});

// GET /api/admin/flashcards - List flashcards with filters
router.get('/flashcards', async (req, res) => {
  const { source, limit, offset } = req.query;
  const params = new URLSearchParams();
  if (source) params.set('source', source);
  if (limit) params.set('limit', limit);
  if (offset) params.set('offset', offset);
  const data = await fetchJson(`${FLASHCARD_SERVICE_URL}/admin/flashcards?${params}`);
  res.json(data || { flashcards: [], total: 0 });
});

// DELETE /api/admin/flashcards/:id
router.delete('/flashcards/:id', async (req, res) => {
  try {
    const resp = await fetch(`${FLASHCARD_SERVICE_URL}/admin/flashcards/${req.params.id}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(5000),
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch {
    res.status(500).json({ error: 'Failed to delete flashcard' });
  }
});

// GET /api/admin/conversations - List conversations
router.get('/conversations', async (req, res) => {
  const { limit } = req.query;
  const params = new URLSearchParams();
  if (limit) params.set('limit', limit);
  const data = await fetchJson(`${AI_CHAT_SERVICE_URL}/admin/conversations?${params}`);
  res.json(data || { conversations: [], total: 0 });
});

// DELETE /api/admin/conversations/:id
router.delete('/conversations/:id', async (req, res) => {
  try {
    const resp = await fetch(`${AI_CHAT_SERVICE_URL}/admin/conversations/${req.params.id}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(5000),
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch {
    res.status(500).json({ error: 'Failed to delete conversation' });
  }
});

// POST /api/admin/users - Create user
router.post('/users', async (req, res) => {
  try {
    const resp = await fetch(`${AUTH_SERVICE_URL}/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(5000),
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PATCH /api/admin/users/:id - Update user
router.patch('/users/:id', async (req, res) => {
  try {
    const resp = await fetch(`${AUTH_SERVICE_URL}/admin/users/${req.params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(5000),
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const resp = await fetch(`${AUTH_SERVICE_URL}/admin/users/${req.params.id}`, {
      method: 'DELETE',
      signal: AbortSignal.timeout(5000),
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// POST /api/admin/flashcards - Create flashcard
router.post('/flashcards', async (req, res) => {
  try {
    const resp = await fetch(`${FLASHCARD_SERVICE_URL}/admin/flashcards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(5000),
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch {
    res.status(500).json({ error: 'Failed to create flashcard' });
  }
});

// PATCH /api/admin/flashcards/:id - Update flashcard
router.patch('/flashcards/:id', async (req, res) => {
  try {
    const resp = await fetch(`${FLASHCARD_SERVICE_URL}/admin/flashcards/${req.params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(5000),
    });
    const data = await resp.json();
    res.status(resp.status).json(data);
  } catch {
    res.status(500).json({ error: 'Failed to update flashcard' });
  }
});

// GET /api/admin/llm-config - LLM configuration (read-only)
router.get('/llm-config', (req, res) => {
  res.json({
    primary: {
      provider: 'OpenAI-compatible',
      baseUrl: process.env.LLM_BASE_URL || 'not set',
      model: process.env.LLM_MODEL || 'not set',
      hasKey: Boolean(process.env.LLM_API_KEY),
    },
    flashcard: {
      model: process.env.FLASHCARD_LLM_MODEL || process.env.LLM_MODEL || 'not set',
    },
    fallback: {
      provider: 'Google Gemini',
      model: process.env.GEMINI_MODEL || 'not set',
      hasKey: Boolean(process.env.GEMINI_API_KEY),
    },
  });
});

module.exports = router;
