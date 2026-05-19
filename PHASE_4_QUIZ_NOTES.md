# Phase 4 - Quiz + Content Notes

Date: 2026-05-18

Summary:

- Added `quiz-service` for quiz generation, scoring, attempts, and progress.
- `GET /quizzes/:id` hides `correct_answer` to prevent leakage before submit.
- Gateway proxies `/api/quizzes` to the new service.

Files:

- app/backend/quiz-service/
- app/backend/gateway/src/server.js
- app/backend/package.json
- app/backend/jest.config.js

Environment:

- quiz-service: `QUIZ_SERVICE_PORT`, `MONGODB_URI`

Key endpoints:

Quiz service:
- `GET /health`
- `POST /quizzes/generate`
- `GET /quizzes/:quizId`
- `POST /quizzes/:quizId/submit`
- `GET /attempts?userId=...`
- `GET /progress?userId=...`

Next steps:

- Wire frontend quiz UI + result page to these APIs.
- Add auth guard and user context (replace `guest` fallback).
- Improve quiz templates and add more question types.
- Persist with MongoDB in production and add indexes.
