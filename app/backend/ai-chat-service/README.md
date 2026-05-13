# AI Chat Service — ai-chat-service

Lightweight microservice that integrates a Gemini-based conversational AI into the AI Tutor system.

Setup

1. Copy environment example:

```
cp .env.example .env
```

2. Fill `GEMINI_API_KEY` in `.env` if you have one.

3. Install dependencies:

```
npm install
```

Run (development):

```
npm run dev
```

API

- `GET /health` — basic health check
- `POST /chat` — body `{ "message": "..." }` returns `{ success: true, reply: "..." }`

Notes

- The service uses `@google/generative-ai` when `GEMINI_API_KEY` is provided. When the key is not set, the service returns an explanatory message so the server remains runnable for local development and testing.
- No database is used in Phase 2.

Troubleshooting Gemini API

- Ensure `GEMINI_API_KEY` is set in `.env` and valid.
- Network or rate-limit errors from Gemini will be surfaced as 502 errors.

Architecture

- Express.js app exposing two endpoints. `src/services/gemini.service.js` encapsulates the external API calls and implements validation and timeout protection.
