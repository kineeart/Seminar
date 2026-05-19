# Phase 4 - Quiz + Content Ghi Chú

Ngày: 2026-05-18

Tóm tắt:

- Thêm `quiz-service` để tạo quiz, chấm điểm, lưu lần thử và theo dõi tiến độ.
- `GET /quizzes/:id` ẩn `correct_answer` để ngăn chặn rò rỉ trước khi submit.
- Gateway proxy `/api/quizzes` tới service mới.

Các file:

- app/backend/quiz-service/
- app/backend/gateway/src/server.js
- app/backend/package.json
- app/backend/jest.config.js

Biến môi trường:

- quiz-service: `QUIZ_SERVICE_PORT`, `MONGODB_URI`

Các endpoint chính:

Quiz service:
- `GET /health`
- `POST /quizzes/generate`
- `GET /quizzes/:quizId`
- `POST /quizzes/:quizId/submit`
- `GET /attempts?userId=...`
- `GET /progress?userId=...`

Bước tiếp theo:

- Kết nối giao diện quiz frontend + trang kết quả với các API này.
- Thêm auth guard và user context (thay thế fallback `guest`).
- Cải thiện template quiz và thêm nhiều loại câu hỏi.
- Lưu trữ với MongoDB trong production và thêm indexes.