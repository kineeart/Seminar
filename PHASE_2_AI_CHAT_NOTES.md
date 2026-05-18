# Phase 2 — AI Chat Integration Notes

Date: 2026-05-17

Summary:

- Implemented `ai-chat-service` Express microservice integrating Gemini API via `@google/generative-ai` when `GEMINI_API_KEY` is present.
- Final verified model: `gemini-2.5-flash` (real Gemini response confirmed via `/chat`).
- Root cause of previous 429s: free-tier quota/billing limitation on `gemini-2.0-flash` and `gemini-2.0-flash-lite`, not a malformed request.
- Added structured logging, exponential backoff, and cooldown handling so the service distinguishes real upstream failures from normal fallback behavior.
- Files: `src/services/gemini.service.js`, `src/controllers/chat.controller.js`, routes, middleware, tests, configs.

Next steps:

- Monitor quota usage in Google AI Studio / Gemini API console.
- Keep `GEMINI_MODEL` configurable for future model comparisons.
- Add production metrics for retry count, fallback rate, and upstream latency.
