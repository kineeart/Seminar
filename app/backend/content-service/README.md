# Content Service (Lessons)

Lightweight service for managing lessons used by the quiz service.

## Requirements

- Node.js 18+

## Setup

From `app/backend/content-service`:

```bash
npm install
```

Copy env file:

```bash
cp .env.example .env
```

Required:
- Set `MONGODB_URI` and `DATABASE_NAME` for MongoDB storage.

## Run

```bash
npm run dev
```

Service runs on `http://localhost:5003` by default.

## API

- `GET /health`
- `GET /lessons`
- `GET /lessons/:lessonId`
- `POST /lessons`
- `PATCH /lessons/:lessonId`
- `DELETE /lessons/:lessonId`

## Notes

- Uses MongoDB Atlas for persistence and seeds lessons on first run.
