# COPILOT WORKFLOW RULES — AI Tutor (Vibe Engineering)

Mục tiêu: Quy định nhất quán cho tất cả thay đổi code, tạo code và sửa lỗi trong dự án microservices. Ngắn gọn, tuân thủ ghi chép trong `DEVELOPMENT_LOG.md`.

## Nguyên tắc chung
- Mọi thay đổi code phải được ghi lại trong `DEVELOPMENT_LOG.md` (ngày, phase, mục tiêu, prompt, summary, files changed).
- Mọi output từ Copilot/AI phải ở dạng Markdown chuyên nghiệp.
- Khi generate hoặc sửa code, luôn kèm: ngắn gọn giải thích kiến trúc, danh sách file tạo/sửa, dependency mới.

## Task template (bắt buộc)
Mỗi task tạo trong issue/PR phải có nội dung:

- **Goal**: Mục tiêu ngắn gọn.
- **Prompt**: Prompt dùng cho AI (nếu có).
- **Files changed**: Liệt kê file path (relative) được tạo/sửa.
- **Generated code summary**: Tóm tắt logic mới, module boundary, public API.
- **Issues found**: Các vấn đề phát hiện trong review/test.
- **Fix applied**: Mô tả fix (commit/PR ref).
- **Final result**: Status (done / pending), checklist items.

## Quy tắc khi generate code bằng AI
- Trước khi generate: include short architecture note (1–3 câu) mô tả service boundary và data ownership.
- Sau khi generate: list tất cả file được tạo (path), liệt kê dependency mới (package names + version range) và script chạy.
- Không commit secrets/keys. Nếu AI output chứa secrets, XÓA trước khi commit và ghi vào `DEVELOPMENT_LOG.md` (issue + fix).

## Quy tắc khi sửa lỗi
- Ghi nguyên nhân (root cause) và cách phát hiện (steps to reproduce).
- Ghi rõ cách fix (code snippet hoặc PR) và tác động hệ thống (what changed, possible regressions).
- Nếu sửa cross-service (gây breaking change), update contract docs và notify owners.

## Unit tests
- Khi tạo unit test: ghi test cases và expected behavior vào task.
- Test file phải theo naming convention: `*.spec.ts` / `*_test.py` tương ứng stack.
- Test coverage: cho MVP, ưu tiên critical paths (auth, scoring, scheduling). Ghi test command và kết quả chạy vào `DEVELOPMENT_LOG.md`.

## Microservices & CI/CD specifics
- Database-per-service principle: mỗi service tự chịu trách nhiệm schema và migration.
- Contracts: public APIs phải có OpenAPI/Protobuf spec; thay đổi spec cần versioning và migration plan.
- Async events: publish/subscribe dùng message broker (RabbitMQ/Kafka); event schemas lưu trong `docs/events/`.
- CI pipeline must run per-service tests, lint, build image, and push to registry. PR merge gated by green pipeline.

## Docker & Deployment notes
- Mỗi service cần `Dockerfile` và `docker-compose` dev entry. Docker images phải build reproducibly.
- Local dev: provide `docker-compose.override.yml` for developer secrets (gitignored).
- Production: use k8s manifests/Helm; deployments must include readiness/liveness probes and resource requests/limits.

## Logging, Observability, and Tracing
- Instrument services with OpenTelemetry (traces) and export to centralized backend. Logs structured (JSON), shipped to central logging.
- Add metrics endpoints (`/metrics`) for Prometheus.

## Pull Request checklist (mandatory)
- [ ] Development log updated (`DEVELOPMENT_LOG.md`) with task entry.
- [ ] Files changed listed in task template.
- [ ] Tests added/updated and passing locally.
- [ ] Lint and build pass in CI.
- [ ] No secrets committed.

## Short workflow example (minimal)
1. Create branch `feature/<short>` and issue with Task template.
2. Run AI to scaffold (if needed). Copy prompt & AI output to `DEVELOPMENT_LOG.md` entry.
3. Implement changes, update `Files changed` and `Generated code summary` in task.
4. Add tests, run locally, record results in `DEVELOPMENT_LOG.md`.
5. Push PR, CI runs (lint/test/build). Merge after green and checklist complete.

---

Phiên bản quy tắc: 0.1 — cập nhật: 2026-05-16
