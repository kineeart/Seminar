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

Optional:
- Set `MONGODB_URI` to enable MongoDB storage.

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

- Uses in-memory storage by default with seed lessons.
- Switches to MongoDB if `MONGODB_URI` is set.
