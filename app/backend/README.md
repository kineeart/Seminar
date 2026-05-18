# AI Tutor Backend — Authentication + Content + Quiz MVP

Backend MVP được refactor theo hướng nhẹ, chạy thật, không dùng Docker ở phase này.

## Cấu trúc

- `gateway/` — API gateway Express, proxy `/api/auth` tới auth-service
- `auth-service/` — Express auth service, lưu user in-memory cho MVP
- `content-service/` — Lessons/content CRUD, in-memory with optional MongoDB
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
- `content-service` tại `http://localhost:5003`
- `quiz-service` tại `http://localhost:5004`

### 3. Chạy từng service riêng

```bash
npm run dev:gateway
npm run dev:auth
npm run dev:content
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
- `GET /api/content/lessons`
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

## Ghi chú MVP

- Chưa dùng database
- User lưu in-memory trong `auth-service`
- JWT dùng secret hardcode để ưu tiên runnable MVP
- Khi scale tiếp, thay in-memory bằng database và tách auth contract rõ hơn
- `content-service` và `quiz-service` có thể bật MongoDB bằng `MONGODB_URI`
