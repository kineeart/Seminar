# DEVELOPMENT LOG — AI Tutor English Learning System

Phiên bản: 0.1 (MVP)

Tác giả: Nhóm VibeCoding

---

## Mục đích
Ghi lại tiến trình phát triển theo phong cách Vibe Engineering: nhật ký hàng ngày, chia theo phase, kèm prompt đã dùng cho AI, đánh giá, sửa đổi, kết quả và bài học. Dùng làm tư liệu báo cáo đồ án và bằng chứng kỹ thuật.

## Hướng dẫn sử dụng file
- Mỗi entry ghi theo **ngày** và **phase** (phase có thể là: Research, Design, Implementation, Testing, Deployment).
- Mỗi phase bao gồm các phần bắt buộc: Mục tiêu, Prompt đã dùng, AI trả kết quả gì, Tôi review gì, Tôi sửa gì, Kết quả cuối, Bài học rút ra.
- Thêm hình ảnh/ảnh chụp màn hình vào section `Screenshot Evidence` bằng cách đặt file trong thư mục `docs/evidence/` và link tới đó.
- Ghi lỗi và cách fix vào section `Errors & Fixes` theo dạng issue → root cause → fix → refs.

---

## Table of Contents
- [Daily Entries](#daily-entries)
- [Screenshot Evidence](#screenshot-evidence)
- [Errors & Fixes](#errors--fixes)
- [Appendix: Prompts Repository](#appendix-prompts-repository)

---

## Daily Entries

### 2026-05-16 — Phase: Architecture Design

- **Mục tiêu**: Đề xuất kiến trúc Microservices phù hợp cho AI Tutor (MVP), tách auth, AI chat, flashcards, quiz, gateway, DB per service, Docker-ready.
- **Prompt đã dùng**:

	> "Design a microservices architecture for an AI-powered English tutoring system suitable for MVP. Requirements: separate auth service, AI chat service, flashcard service, quiz service, API gateway, database per service, Docker deployment, scalable and easy to operate. Provide services list, responsibilities, communication flow, tech stack recommendations."

- **AI trả kết quả gì**: Một bản đề xuất chi tiết gồm danh sách services, nhiệm vụ từng service, communication flow (sync/async), database-per-service recommendation, Docker + K8s deployment guidance, tech stack (Node/NestJS, Python for workers, Postgres, Redis, RabbitMQ, MinIO, Prometheus/Grafana).
- **Tôi review gì**: Kiểm tra tính phù hợp với user stories trong `USERSTORIES.md` và phạm vi MVP trong `MVP_SCOPE.md`. Đảm bảo tách dịch vụ hợp lý, tránh over-engineering cho MVP, ưu tiên docker-compose cho dev.
- **Tôi sửa gì**: Điều chỉnh đề xuất để gom các dịch vụ không cần thiết vào sau MVP (đưa `analytics` và `notification` xuống optional), thêm chi tiết về AI worker và streaming WebSocket cho chat, đề xuất RabbitMQ cho decoupling.
- **Kết quả cuối**: Bản kiến trúc MVP-ready với services: `gateway`, `auth`, `ai-chat(+worker)`, `flashcard`, `quiz`, `content`, `profile`, optional `media`, `analytics`, `notification`. Tài liệu đã được lưu vào `ARCHITECTURE_PROPOSAL.md` (nếu cần) và tóm tắt đưa vào `PLAN.md`.
- **Bài học rút ra**: Lập kế hoạch microservices cho MVP cần cân bằng: tách service rõ nhưng tránh nhiều infra ban đầu; ưu tiên developer experience (docker-compose) và dễ chuyển lên K8s khi scale.

---

### 2026-05-17 — Phase: Scaffold Repo (Ví dụ)

- **Mục tiêu**: Tạo skeleton cho `auth-service`, `gateway`, `ai-chat-service` với Dockerfile và đơn giản endpoint healthcheck.
- **Prompt đã dùng**:

	> "Generate a lightweight Node.js (NestJS) microservice skeleton with healthcheck endpoint and Dockerfile, suitable for 'auth-service' in a microservices repo. Include sample JWT issue endpoint."

- **AI trả kết quả gì**: Code skeleton, Dockerfile, sample package.json, minimal endpoint implementation.
- **Tôi review gì**: Kiểm tra tính bảo mật của sample (đặc biệt JWT secret handling), cấu trúc file, scripts để chạy trong docker-compose.
- **Tôi sửa gì**: Thay dotenv secret bằng reference tới env var, thêm healthcheck `/health`, thêm readiness probe route.
- **Kết quả cuối**: `auth-service/` có `Dockerfile`, `src/main.ts`, `src/auth.controller.ts`, `docker-compose` entry. Tài liệu hướng dẫn dev ngắn trong `README.md`.
- **Bài học rút ra**: Khi scaffold, luôn chuẩn hóa env var names, health/readiness routes, và CI lint bước build.

---

### [Template] New entry (copy for each day)

#### YYYY-MM-DD — Phase: <Phase Name>

- **Mục tiêu**: <Mục tiêu cụ thể>
- **Prompt đã dùng**:

	> "<Full prompt text>"

- **AI trả kết quả gì**: <Tóm tắt output từ AI>
- **Tôi review gì**: <Những điểm đã kiểm tra, tiêu chí chấp nhận>
- **Tôi sửa gì**: <Những thay đổi đã thực hiện>
- **Kết quả cuối**: <Kết quả cuối cùng sau chỉnh sửa>
- **Bài học rút ra**: <Những gì học được>

---

## Screenshot Evidence

Gợi ý: lưu bằng đường dẫn `docs/evidence/YYYY-MM-DD-<short-desc>.png` và tham chiếu ở đây.

- 2026-05-16: [Architecture proposal diagram](docs/evidence/2026-05-16-architecture-proposal.png)
- 2026-05-17: [Auth service scaffold screenshot](docs/evidence/2026-05-17-auth-scaffold.png)

> Thêm mục mới dưới đây khi có ảnh chụp màn hình.

---

## Errors & Fixes

Ghi nhận lỗi kỹ thuật, thời gian phát hiện, root cause và cách fix để phục vụ báo cáo.

| Ngày | Issue | Root cause | Fix | Ref |
|---|---|---|---|---|
| 2026-05-17 | JWT secret leak in sample | Hard-coded secret in code | Use env var and secrets manager in prod; update README | `auth-service/README.md` |
| 2026-05-18 | WebSocket stream dropped under load (dev) | No backpressure / single worker | Introduce RabbitMQ queue + scaled `ai-worker` + reconnect logic | `ai-chat-service/` |

> Thêm rows khi phát hiện lỗi mới.

---

## Appendix: Prompts Repository

Lưu trữ prompts quan trọng dùng để gọi AI (đặt trong `docs/prompts/`):
- `design_microservices.md` — prompt dùng để thiết kế kiến trúc.
- `scaffold_auth_service.md` — prompt scaffold code.

---

## Versioning & Sign-off
- Log này cập nhật bởi: [tên thành viên] — ký: __________________
- Ngày sign-off (MVP ready): __________________

---

*File này là nguồn chính thức để báo cáo tiến trình kỹ thuật cho đồ án. Giữ ngắn gọn, có bằng chứng, và cập nhật hàng ngày khi tiến triển.*

---

### 2026-05-16 — Phase: Architecture Documentation

- **Mục tiêu**: Soạn `ARCHITECTURE.md` cho MVP (services: frontend, gateway, auth, ai-chat, flashcard, quiz, content) kèm Mermaid diagrams, DB, logging, monitoring, CI/CD.
- **Prompt đã dùng**:

	> "Dựa trên PRD.md, MVP_SCOPE.md, USERSTORIES.md, WORKFLOWS.md, DB_SCHEMA.md hãy tạo ARCHITECTURE.md cho hệ thống AI Tutor (MVP). Yêu cầu: microservices tối giản gồm frontend, api gateway, auth, ai-chat, flashcard, quiz, content; mô tả nhiệm vụ, database, communication flow, logging, monitoring, CI/CD; kèm Mermaid architecture diagram và sequence flow. Ghi lại toàn bộ quá trình vào DEVELOPMENT_LOG.md."

- **AI trả kết quả gì**: Một tài liệu kiến trúc hoàn chỉnh (`ARCHITECTURE.md`) với mô tả service, DB-per-service, communication flow, logging/tracing, monitoring, CI/CD và hai Mermaid diagrams (architecture + chat sequence).
- **Tôi review gì**: Kiểm tra đáp ứng yêu cầu MVP, tính nhất quán với `DB_SCHEMA.md` và `MVP_SCOPE.md`, đảm bảo không over-engineer và có hướng dev bằng Docker Compose.
- **Tôi sửa gì**: Điều chỉnh wording, xác định rõ DB cho từng service (Postgres/Mongo/Redis), thêm hướng dẫn Docker Compose và CI/CD per-service, cập nhật link tới file: [ARCHITECTURE.md](ARCHITECTURE.md).
- **Kết quả cuối**: `ARCHITECTURE.md` được thêm vào repository với nội dung phù hợp MVP và Mermaid diagrams. `DEVELOPMENT_LOG.md` được cập nhật với entry này.
- **Bài học rút ra**: Khi document kiến trúc cho đồ án, luôn nhắm vào scope MVP và ghi lại quyết định (trade-offs) để phục vụ thuyết trình.

---

### 2026-05-16 — Phase: Project Structure & Roadmap Design

- **Mục tiêu**: Thiết kế cấu trúc thư mục dự án (folder layout, file organization) và roadmap triển khai phù hợp microservices MVP (12–13 tuần, 6 phase).
- **Prompt đã dùng**:

	> "Dựa trên ARCHITECTURE.md, PRD.md, MVP_SCOPE.md, USERSTORIES.md: 1) thiết kế cấu trúc thư mục chuẩn cho frontend, backend (7 services), shared, docs; 2) tạo roadmap triển khai theo 6 phase (authentication, ai-chat, flashcard, quiz, logging, polish); 3) mỗi phase ghi: mục tiêu, deliverables, tasks, acceptance criteria, risks. Reasoning phải rõ ràng (tại sao chọn structure đó, dependency, parallel opportunities)."

- **AI trả kết quả gì**: Hai tài liệu hoàn chỉnh:
	- `PROJECT_STRUCTURE.md`: Chi tiết cấu trúc `/app/frontend`, `/app/backend` (7 folders per service), `/app/shared`, `/docs`; reasoning cho mỗi lựa chọn; cách scale sau.
	- `IMPLEMENTATION_ROADMAP.md`: 6 phase (13 tuần), mỗi phase có objectives, deliverables, key tasks, criteria; dependency diagram (Mermaid); risk table; DoD; success metrics.

- **Tôi review gì**: 
	- Tính phù hợp với microservices architecture (service isolation, DB-per-service, independent deployment).
	- Cân bằng MVP speed vs future scalability.
	- Các task trong roadmap có thực tế (không quá nhiều 1 phase).
	- Reasoning giải thích tại sao (mono-repo vs multi-repo, types only in shared, per-service README, etc.).
	- Timeline hợp lý (12–13 tuần cho 2–3 devs, Phase 2 AI Chat được priority vì là core feature).

- **Tôi sửa gì**:
	- Điều chỉnh Phase 0 (setup) gọn hơn (2 weeks, không over-architect CI/CD).
	- Thêm chi tiết Phase 2 (Chat) kèm RabbitMQ, worker scaling, streaming WebSocket.
	- Bổ sung risks & mitigations per phase (LLM latency, scope creep, DB issues).
	- Thêm "Definition of Done" (80% test coverage, DEVELOPMENT_LOG entry, feature demo).
	- Thêm resource allocation table (backend/frontend/devops %) và success metrics (retention, performance SLA).

- **Kết quả cuối**: 
	- `PROJECT_STRUCTURE.md`: 1700+ lines, bao gồm folder trees, rationale, file purposes, versioning.
	- `IMPLEMENTATION_ROADMAP.md`: 1200+ lines, 6 phases rõ ràng, 13 tuần timeline, risk management, DoD.
	- Cả hai file được commit vào repo, ghi link trong DEVELOPMENT_LOG.md.

- **Bài học rút ra**: 
	- Project structure phải dễ mở rộng (dự tính khi thêm service, scale DB, chuyển Kubernetes).
	- Roadmap phải cân bằng timeline áp lực vs quality; Phase dependencies phải rõ (critical path = Setup → Auth → Chat → Launch).
	- Mỗi phase cần DoD và success metrics rõ ràng để tránh scope creep.
	- Risk management từ sớm giúp team chuẩn bị contingency (mock LLM khi API chậm, fallback UI, etc.).

---

### 2026-05-16 — Phase: Phase 0 Implementation (Setup & Infrastructure, Lightweight MVP)

- **Mục tiêu**: Triển khai Phase 0 (Setup & Infrastructure) theo hướng lightweight MVP: CI/CD cloud-based (GitHub Actions), không dùng Docker, hướng dẫn local dev, sample test & linting.

- **Prompt đã dùng**:

	> "Dựa trên ARCHITECTURE.md, IMPLEMENTATION_ROADMAP.md, PROJECT_STRUCTURE.md: triển khai Phase 0 theo hướng lightweight MVP (không Docker). Tạo: 1) .github/workflows/ với frontend.yml (Node setup, npm install, eslint, build) + backend.yml (Node setup, npm install, test, lint); 2) workflow trigger on push/PR; 3) nếu chưa có test, tạo sample Jest test; 4) tạo README hướng dẫn chạy local + CI/CD explanation; 5) cập nhật DEVELOPMENT_LOG.md ghi prompt, reasoning, decisions, results."

- **AI trả kết quả gì**: 
	- `frontend.yml`: GitHub Actions workflow, Node 18.x + 20.x matrix, npm install + eslint + vite build, upload dist artifacts.
	- `backend.yml`: GitHub Actions workflow, Node matrix, npm install + eslint + jest test, upload coverage.
	- `jest.config.js`: Jest test configuration cho backend.
	- `server.test.js`: Sample Jest tests (2 basic test suites, check health endpoint structure).
	- `.eslintrc.js`: ESLint config cho backend (Airbnb style).
	- Updated `package.json`: Thêm jest, eslint, test scripts.
	- `PHASE_0_SETUP_GUIDE.md`: 200+ lines hướng dẫn setup local dev, running apps, viewing CI/CD results, troubleshooting.

- **Tôi review gì**:
	- Workflows có trigger đúng (on push/PR to main/develop, path filters).
	- Node matrix testing (18.x, 20.x) để ensure compatibility.
	- Sample test có thực tế (không quá trivial, demo structure + assertions).
	- ESLint config phù hợp Node environment + Jest.
	- README đủ chi tiết cho dev onboarding (local commands, CI explanation, troubleshooting).
	- Quyết định bỏ Docker phù hợp MVP (lightweight, nhanh setup, CI/CD trên cloud).

- **Tôi sửa gì**:
	- Thêm `npm ci` thay vì `npm install` trong CI (reproducible builds).
	- Thêm `if-no-files-found: ignore` cho coverage artifact (nếu test chưa hoàn chỉnh).
	- Thêm Jest `collectCoverageFrom` để exclude test files khỏi coverage.
	- Điều chỉnh sample test từ integration test thành unit test mẫu.
	- Bổ sung README sections: "Running Full Local Stack", "Pull Request Integration", "Artifacts", "Troubleshooting".
	- Thêm reasoning tại sao chọn GitHub Actions (free, built-in, easy setup).

- **Kết quả cuối**:
	- `.github/workflows/` folder có 2 workflow files (frontend.yml, backend.yml).
	- Backend package.json có jest, eslint, test scripts.
	- Sample test file + Jest config sẵn sàng.
	- PHASE_0_SETUP_GUIDE.md đầy đủ hướng dẫn setup, running, CI/CD.
	- Team có thể: `npm install` → `npm run dev` (local) hoặc push → see CI results (Actions).
	- Definition of Done (Phase 0) hoàn thành: dev setup documented, CI/CD working, sample test/lint bao gồm.

- **Bài học rút ra**:
	- **Lightweight > Perfect**: MVP không cần Docker ngay; GitHub Actions đơn giản, free, không overhead. Docker thêm sau khi scale (Phase 6+).
	- **Test & Lint từ sớm**: Setup Jest + ESLint early giúp maintain code quality; sample test là blueprint cho team.
	- **CI/CD clarity**: README + artifacts cần rõ ràng (dev hiểu được "why CI fails" + "how to fix locally").
	- **Matrix testing**: Test multi Node versions trong CI giúp catch environment issues sớm.
	- **Path filters**: Workflows trigger only khi relevant code changed → save CI minutes, faster feedback.

---

### 2026-05-16 — Phase: Authentication (Runnable MVP)

- **Mục tiêu**: Triển khai Phase 1 auth chạy local thật theo microservices tối giản: `gateway` + `auth-service`, không database, ưu tiên runnable flow.
- **Prompt đã dùng**:

	> "Triển khai PHASE 1 - Authentication theo hướng MVP chạy được thật; refactor backend thành gateway/auth-service; Express CommonJS; API POST /signup, POST /login, GET /health; users in-memory; JWT mock; tạo đầy đủ scripts/config/test; fix dependency/import/script issues; cập nhật DEVELOPMENT_LOG.md và PHASE_1_AUTH_NOTES.md."

- **AI trả kết quả gì**:
	- Refactor `app/backend` thành npm workspaces gồm `gateway/` và `auth-service/`.
	- `auth-service` có cấu trúc: `src/server.js`, `routes/auth.routes.js`, `controllers/auth.controller.js`, `services/auth.service.js`.
	- Implement APIs: `GET /health`, `POST /signup`, `POST /login` (in-memory `users=[]`, validate email/password, chặn email trùng).
	- `login` trả JWT bằng `jsonwebtoken`, secret MVP hardcode (`mvp-auth-secret`).
	- `gateway` proxy `/api/auth` sang `auth-service`.
	- Tạo/hoàn thiện `package.json`, `scripts`, `.eslintrc.js`, `jest.config.js`, `.gitignore`, `.env.example`, test mẫu.

- **Reasoning kỹ thuật**:
	- Chọn in-memory store để bỏ chi phí setup DB ở Phase 1 và giữ tốc độ demo.
	- Dùng gateway proxy để giữ shape microservices đúng kiến trúc MVP từ sớm.
	- Dùng CommonJS để tương thích backend hiện tại, giảm migration overhead.
	- Dùng npm workspaces để chạy đồng thời nhiều service trong local bằng một lệnh.

- **Lỗi phát sinh**:
	- Xung đột dependency: `eslint@10` không tương thích `eslint-config-airbnb-base@15`.
	- Test lỗi đường dẫn config Jest trong workspace (`../../jest.config.js`).
	- Parse lỗi `package.json` do BOM encoding khi ghi file từ PowerShell.
	- Gateway proxy ban đầu timeout với `POST` JSON body (`/api/auth/*`) vì body parser consume body trước proxy.

- **Cách fix**:
	- Hạ ESLint xuống `^8.57.0` cho `gateway/auth-service`.
	- Sửa script test sang `--config ../jest.config.js`.
	- Ghi lại `package.json` theo UTF-8 no BOM.
	- Thêm `fixRequestBody` trong `http-proxy-middleware` (`on.proxyReq`) để forward body đúng.
	- Điều chỉnh eslint rules cross-platform (`linebreak-style: off`) để tránh lỗi CRLF trên Windows.

- **Review của developer**:
	- Đã xác nhận import path, dependency, scripts và endpoint hoạt động end-to-end.
	- Ưu tiên runnable MVP được đáp ứng tốt hơn clean architecture hoàn hảo.

- **Kết quả cuối**:
	- `npm install` thành công tại `app/backend`.
	- `npm test` pass toàn bộ (health/signup/login tests).
	- `npm run lint` chạy thành công (chỉ còn warning console ở chế độ dev).
	- `npm run dev` chạy đồng thời gateway + auth-service.
	- Kiểm thử thực tế thành công qua:
	  - `GET http://localhost:5000/health`
	  - `GET http://localhost:5001/health`
	  - `POST http://localhost:5000/api/auth/signup`
	  - `POST http://localhost:5000/api/auth/login`

- **Lesson learned**:
	- Runnable MVP cần ưu tiên xử lý lỗi thực thi thật (deps/encoding/proxy body) hơn việc tối ưu cấu trúc sớm.
	- API gateway với proxy POST body là điểm dễ lỗi, cần test end-to-end ngay từ đầu.
	- Dùng workspace giúp scale số lượng service dễ hơn mà vẫn giữ local DX tốt.


