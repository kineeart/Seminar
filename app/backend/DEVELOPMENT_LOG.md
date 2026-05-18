---

### 2026-05-18 — Phase: Phase 5 MongoDB Persistence Layer

- **Muc tieu**: Chuyen in-memory sang MongoDB Atlas, them shared database module, cap nhat schema + index + validation, va bo sung dashboard/lich su.
- **Prompt da dung**:

> "Trien khai Phase 5 MongoDB Persistence Layer cho he thong AI Tutor, bo mock storage, su dung mongoose va MongoDB Atlas."

- **AI tra ket qua gi**:
	- Them `shared/database/` voi config, retry, graceful shutdown.
	- Cap nhat auth/chat/flashcard/content/quiz de dung MongoDB that.
	- Bo sung endpoints cho history va dashboard.
	- Cap nhat tests cho schema validation + repository + integration.

- **Toi review gi**:
	- Kiem tra MONGODB_URI + DATABASE_NAME bat buoc.
	- Kiem tra index va timestamp tren schema.
	- Kiem tra gateway proxy den chat + flashcard.

- **Ket qua cuoi**:
	- MongoDB Atlas da thay the in-memory storage trong backend.
	- Lich su hoc tap va dashboard duoc mo rong de phuc vu frontend.


### 2026-05-18 — Phase: Phase 4 Quiz + Content Backend (Runnable MVP)

- **Mục tiêu**: Trien khai `content-service` va `quiz-service` theo Phase 4, co scoring, attempts, progress; chay duoc khong can DB va co the bat MongoDB bang env.
- **Prompt da dung**:

> "Trien khai Phase 4 backend (content-service + quiz-service) theo MVP runnable. Co CRUD lessons, quiz generate, submit, score, attempts, progress. In-memory fallback, optional MongoDB qua MONGODB_URI. Cap nhat gateway proxy, scripts, jest config, va README." 

- **AI tra ket qua gi**:
	- Tao `content-service/` va `quiz-service/` (Express CommonJS).
	- Tao endpoints va tests can thiet.
	- Cap nhat gateway proxy va workspace scripts.

- **Toi review gi**:
	- Kiem tra schema payload, scoring logic, va progress update.
	- Kiem tra jest config co pick up tests moi.

- **Toi sua gi**:
	- Them seed lessons de quiz generate khong bi rong.
	- Them fallback khi khong co content-service hoac DB.

- **Ket qua cuoi**:
	- `content-service`: CRUD lessons + seed data + optional MongoDB.
	- `quiz-service`: generate, submit, attempts, progress + optional MongoDB.
	- Gateway proxy `/api/content` va `/api/quizzes`.

- **Lesson learned**:
	- Phan tach storage layer giup de test va de nang cap DB.

### 2026-05-16 — Phase: Phase 1 Authentication Implementation (Runnable MVP)

- **Mục tiêu**: Triển khai Phase 1 authentication theo hướng chạy được thật: `gateway/` + `auth-service/`, Express CommonJS, in-memory users, JWT mock, test mẫu, local dev chạy được không cần Docker.
- **Prompt đã dùng**:

> "Dựa trên ARCHITECTURE.md, PROJECT_STRUCTURE.md, IMPLEMENTATION_ROADMAP.md: triển khai PHASE 1 - Authentication theo hướng MVP chạy được thật. Refactor backend thành app/backend/gateway/ và app/backend/auth-service/. Auth-service dùng Express.js CommonJS, in-memory users, POST /signup, POST /login, GET /health, JWT mock, validation basic. Gateway proxy /api/auth -> auth-service. Tạo package.json, scripts, eslint config, jest config, .gitignore, .env.example, test health/signup/login, update DEVELOPMENT_LOG.md và PHASE_1_AUTH_NOTES.md. Ưu tiên runnable MVP hơn clean architecture perfect."

- **AI trả kết quả gì**: 
- `auth-service/` hoàn chỉnh với `server.js`, routes, controller, service, tests.
- `gateway/` hoàn chỉnh với Express proxy `/api/auth` và health endpoint.
- `package.json` root đổi sang npm workspaces để chạy `npm run dev` từ `app/backend`.
- `jest.config.js`, `.eslintrc.js`, `.gitignore`, `.env.example`, `README.md`, `PHASE_1_AUTH_NOTES.md`.

- **Tôi review gì**:
- Kiểm tra import path CommonJS đúng (`require`/`module.exports`).
- Kiểm tra dependency coverage: `express`, `cors`, `dotenv`, `jsonwebtoken`, `http-proxy-middleware`, `jest`, `supertest`, `concurrently`.
- Kiểm tra scripts có đủ `dev`, `test`, `lint`, `start` ở root + workspace.
- Kiểm tra MVP flow: signup -> login -> token, gateway proxy, health checks.

- **Tôi sửa gì**:
- Dọn root `src/` cũ để tránh nhầm lẫn với structure mới.
- Dùng in-memory `users = []` thay vì DB để ưu tiên runnable MVP.
- JWT secret hardcode cho MVP (`mvp-auth-secret`).
- Thêm `resetStore()` để test không bị leak state giữa các case.
- Thêm `README.md` hướng dẫn run local, CI, và xem lỗi GitHub Actions.
- Thêm notes riêng `PHASE_1_AUTH_NOTES.md` ghi rõ reasoning và next step sau MVP.

- **Kết quả cuối**:
- `npm install` ở `app/backend` sẽ cài workspace dependencies.
- `npm run dev` sẽ chạy gateway và auth-service song song.
- `npm test` sẽ chạy test của cả hai workspace.
- `npm run lint` sẽ lint cả hai workspace.
- Phase 1 đạt tiêu chí: runnable MVP, không chỉ scaffold.

- **Lỗi phát sinh**:
- Ban đầu root backend còn cấu hình cũ, chưa khớp workspace structure.
- Một số file config cần viết lại để đồng bộ CommonJS + workspace path.

- **Cách fix**:
- Overwrite root `package.json`, `jest.config.js`, `.eslintrc.js` sang workspace-based setup.
- Tạo test bằng `supertest` để xác thực HTTP thật thay vì placeholder.
- Tách controller/service/router rõ ràng để dễ đọc và dễ scale sau.

- **Lesson learned**:
- Với MVP chạy thật, ưu tiên flow end-to-end hơn clean architecture quá sớm.
- Npm workspaces là điểm cân bằng tốt giữa monorepo và runnable local.
- Test nhỏ nhưng chạm vào HTTP path thật giúp phát hiện lỗi import và route sớm.
