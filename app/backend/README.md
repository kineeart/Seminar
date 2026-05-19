# AI Tutor Backend — Persistent Learning Platform

Backend MVP được refactor theo hướng nhẹ, chạy thật, không dùng Docker ở phase này.

## Cấu trúc

- `gateway/` — API gateway Express, proxy `/api/*` tới các services
- `auth-service/` — Auth service, lưu user trong MongoDB
- `ai-chat-service/` — Conversational tutor + conversation persistence
- `flashcard-service/` — Flashcard generation + history persistence
- `quiz-service/` — Quiz generation, scoring, attempts, progress tracking
- `jest.config.js` — cấu hình test dùng chung
- `.eslintrc.js` — cấu hình ESLint dùng chung
- `.env.example` — biến môi trường mẫu

## Cách chạy local

### 1. Cài dependency

Từ thư mục `app/backend`:

```bash
npm install
```

### 2. Chạy toàn bộ backend

```bash
npm run dev
```

Lệnh này sẽ chạy đồng thời:
- `gateway` tại `http://localhost:5000`
- `auth-service` tại `http://localhost:5001`
- `ai-chat-service` tại `http://localhost:5002`
- `flashcard-service` tại `http://localhost:3003`
- `quiz-service` tại `http://localhost:5004`

### 3. Chạy từng service riêng

```bash
npm run dev:gateway
npm run dev:auth
npm run dev:chat
npm run dev:flashcards
npm run dev:quiz
```

### 4. Chạy test

```bash
npm test
```

### 5. Chạy lint

```bash
npm run lint
```

## API nhanh

### Auth service

- `GET /health`
- `POST /signup`
- `POST /login`

### Gateway

- `GET /health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/chat`
- `GET /api/chat/conversations?userId=...`
- `GET /api/flashcards/history?userId=...`
- `POST /api/quizzes/generate`
- `POST /api/quizzes/:id/submit`

## CI hoạt động thế nào

- `Frontend CI` chạy khi có thay đổi trong `app/frontend/`
- `Backend CI` chạy khi có thay đổi trong `app/backend/`
- Khi push hoặc pull request vào `main` hoặc `develop`, GitHub Actions sẽ:
  - cài Node.js
  - chạy install
  - lint
  - build/test

## Xem lỗi GitHub Actions

1. Mở repository trên GitHub
2. Vào tab **Actions**
3. Chọn workflow bị lỗi
4. Mở job và xem step bị đỏ
5. Chạy lại command tương ứng local để sửa lỗi

## Ghi chú Phase 5

- MongoDB Atlas là bắt buộc cho toàn bộ persistence
- Mỗi service có `.env.example` với `MONGODB_URI` và `DATABASE_NAME`
- Không còn in-memory fallback
