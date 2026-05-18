# Phase 4 - Quiz + Content Notes

Date: 2026-05-18

Summary:

- Added `content-service` for lessons CRUD with seed data and optional MongoDB.
- Added `quiz-service` for quiz generation, scoring, attempts, and progress.
- Quiz generation uses lesson vocabulary or a local fallback when content-service is unavailable.
- `GET /quizzes/:id` hides `correct_answer` to prevent leakage before submit.
- Gateway proxies `/api/content` and `/api/quizzes` to the new services.

Files:

- app/backend/content-service/
- app/backend/quiz-service/
- app/backend/gateway/src/server.js
- app/backend/package.json
- app/backend/jest.config.js

Environment:

- content-service: `CONTENT_SERVICE_PORT`, `MONGODB_URI`
- quiz-service: `QUIZ_SERVICE_PORT`, `CONTENT_SERVICE_URL`, `MONGODB_URI`

Key endpoints:

Content service:
- `GET /health`
- `GET /lessons`
- `GET /lessons/:lessonId`
- `POST /lessons`
- `PATCH /lessons/:lessonId`
- `DELETE /lessons/:lessonId`

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
