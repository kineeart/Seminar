# Quiz Service

Quiz generation, scoring, attempts, and progress tracking.

## Requirements

- Node.js 18+

## Setup

From `app/backend/quiz-service`:

```bash
npm install
```

Copy env file:

```bash
cp .env.example .env
```

Required:
- Set `MONGODB_URI` and `DATABASE_NAME` for MongoDB persistence.

## Run

```bash
npm run dev
```

Service runs on `http://localhost:5004` by default.

## API

- `GET /health`
- `POST /quizzes/generate`
- `GET /quizzes/:quizId`
- `POST /quizzes/:quizId/submit`
- `GET /attempts?userId=...`
- `GET /progress?userId=...`

## Notes

- Uses MongoDB Atlas for persistence (no in-memory fallback).
