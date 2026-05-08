---

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
