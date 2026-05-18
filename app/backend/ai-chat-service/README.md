# AI Chat Service — ai-chat-service

Lightweight microservice that integrates a Gemini-based conversational AI into the AI Tutor system.

Setup

1. Copy environment example:

```
cp .env.example .env
```

2. Fill `GEMINI_API_KEY` in `.env` if you have one.

3. Set MongoDB env vars:

```
MONGODB_URI=...
DATABASE_NAME=ai_tutor_chat
```

3. Optional: set `GEMINI_MODEL=gemini-2.5-flash` for the verified model used in local runtime tests.

4. Install dependencies:

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
- Optional request fields for tutoring workflow:
	- `level`: `Beginner`, `Intermediate`, or `Advanced`
	- `conversationId`: string used to keep the last 10 messages in memory
	- `userId`: used to group recent conversations
- `GET /chat/conversations?userId=...` — recent conversations
- `GET /chat/conversations/:conversationId?userId=...` — conversation history

Notes

- The service uses `@google/generative-ai` when `GEMINI_API_KEY` is provided. When the key is not set, the service returns an explanatory message so the server remains runnable for local development and testing.
- Conversation memory is stored in MongoDB and keeps the last 10 messages per conversation for prompt context.
- The prompt builder injects learner level and recent context into every Gemini request.
- MongoDB Atlas is required for persistence in Phase 5.

Troubleshooting Gemini API

- Ensure `GEMINI_API_KEY` is set in `.env` and valid.
- Network or rate-limit errors from Gemini will be surfaced as 502 errors.

Architecture

- Express.js app exposing two endpoints. `src/services/gemini.service.js` encapsulates the external API calls and implements validation and timeout protection.
