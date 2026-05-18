# Phase 4 - Quiz + Content Ghi Chú

Ngày: 2026-05-18

Tóm tắt:

- Thêm `content-service` để quản lý bài học với dữ liệu seed và MongoDB tùy chọn.
- Thêm `quiz-service` để tạo quiz, chấm điểm, lưu lần thử và theo dõi tiến độ.
- Tạo quiz sử dụng từ vựng từ bài học hoặc dữ liệu fallback cục bộ khi content-service không khả dụng.
- `GET /quizzes/:id` ẩn `correct_answer` để ngăn chặn rò rỉ trước khi submit.
- Gateway proxy `/api/content` và `/api/quizzes` tới các service mới.

Các file:

- app/backend/content-service/
- app/backend/quiz-service/
- app/backend/gateway/src/server.js
- app/backend/package.json
- app/backend/jest.config.js

Biến môi trường:

- content-service: `CONTENT_SERVICE_PORT`, `MONGODB_URI`
- quiz-service: `QUIZ_SERVICE_PORT`, `CONTENT_SERVICE_URL`, `MONGODB_URI`

Các endpoint chính:

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

Bước tiếp theo:

- Kết nối giao diện quiz frontend + trang kết quả với các API này.
- Thêm auth guard và user context (thay thế fallback `guest`).
- Cải thiện template quiz và thêm nhiều loại câu hỏi.
- Lưu trữ với MongoDB trong production và thêm indexes.