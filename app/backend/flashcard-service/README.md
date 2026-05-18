# Flashcard Service

Run the flashcard extraction microservice locally.

Environment:
- `GEMINI_API_KEY` or `GOOGLE_API_KEY`: optional bearer token for Google Generative API.
- `GEMINI_MODEL`: model id (default: `gemini-1.0`)
- `PORT`: service port (default: 3003)
- `MONGODB_URI`: MongoDB Atlas connection string
- `DATABASE_NAME`: database name for flashcard persistence

Scripts:
- `npm install`
- `npm run dev` — start with nodemon
- `npm test` — run jest tests

Notes:
- If no API key is provided, AI calls may fail. Tests will skip heavy AI calls when no key is present.
- Flashcards are persisted to MongoDB Atlas (no in-memory fallback).

API:
- `GET /health`
- `POST /flashcards/generate`
- `GET /flashcards/history?userId=...`
- `GET /flashcards/stats?userId=...`
- `POST /flashcards/:flashcardId/review`
