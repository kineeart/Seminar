# Sơ Lược Phương Pháp Luận Sinh Bộ .md (Tóm Lược Session)

## 1) Mục tiêu của bộ tài liệu
Tạo một pipeline vibecoding có thể tái sử dụng, trong đó mỗi file `.md` là một blueprint để AI sinh file kế tiếp, giúp:
- khóa scope MVP
- tránh scope creep
- đồng bộ product -> architecture -> implementation -> test
- hỗ trợ nhiều AI agents làm việc nhất quán

## 2) Thứ tự sinh file chuẩn (PRD -> CODE)
1. `PRD.md`
2. `USERSTORIES.md`
3. `MVP_SCOPE.md`
4. `SYSTEM_PROMPTS.md`
5. `DB_SCHEMA.md`
6. `WORKFLOWS.md`
7. `FRONTEND_COMPONENTS.md`
8. `FRONTEND_MIGRATION_PLAN.md`
9. `PLAN.md`
10. `Rules.md`
11. `TEST_SCENARIOS.md`
12. `TEST_LOG.md`
13. `PROMPT_LIBRARY.md`

## 3) Ý nghĩa ngắn gọn từng file
- `PRD.md`: chốt bài toán, user, mục tiêu, triết lý sản phẩm, scope.
- `USERSTORIES.md`: chuyển PRD thành backlog Agile có acceptance criteria.
- `MVP_SCOPE.md`: khóa phạm vi P0/P1/P2, cắt non-critical.
- `SYSTEM_PROMPTS.md`: chuẩn hóa hành vi AI theo triết lý concise-first.
- `DB_SCHEMA.md`: thiết kế MongoDB/Mongoose schema cho MVP.
- `WORKFLOWS.md`: mô tả luồng trigger giữa frontend/backend/AI/DB/analytics.
- `FRONTEND_COMPONENTS.md`: phân rã HTML mẫu thành component architecture.
- `FRONTEND_MIGRATION_PLAN.md`: kế hoạch migrate TemplateUI -> React/Next.js.
- `PLAN.md`: roadmap triển khai theo phase/sprint/dependency.
- `Rules.md`: coding governance + architecture guardrails.
- `TEST_SCENARIOS.md`: kịch bản test theo user story/workflow.
- `TEST_LOG.md`: log chạy test, defect, retest, pass rate.
- `PROMPT_LIBRARY.md`: thư viện prompt vận hành toàn pipeline.

## 4) Kịch bản ban đầu (Initial Scenario)
Kịch bản khởi tạo chuẩn:
1. Thu thập context sản phẩm.
2. Làm rõ user mục tiêu + use case ưu tiên.
3. Chốt triết lý sản phẩm và AI behavior.
4. Chốt MVP must-have.
5. Mới bắt đầu sinh tài liệu theo đúng thứ tự.

Điều kiện bắt buộc:
- Không tự thêm feature lớn.
- Nếu thiếu thông tin: ghi `Need clarification` hoặc `Assumption needed`.

## 5) Kịch bản quá trình (Process Scenario)
Mỗi bước tạo file đều theo khung:
1. Input từ file trước.
2. Prompt sinh file.
3. Quy trình step-by-step.
4. Validation rules.
5. Quan hệ phụ thuộc file sau.

Nguyên tắc:
- file sau chỉ dùng dữ liệu file trước + scope đã chốt
- mọi thay đổi phải trace ngược về PRD/MVP_SCOPE/USERSTORIES

## 6) Kịch bản test theo từng user story
Nguồn chính: `USERSTORIES.md` + `WORKFLOWS.md`.

Mẫu test cho mỗi story:
1. Story ID
2. Mục tiêu test
3. Preconditions
4. Steps
5. Expected result
6. Edge/error cases
7. Priority (P0/P1/P2)

Mapping:
- Acceptance Criteria của story -> test cases
- Workflow step -> integration test points
- AI rules -> response validation (độ ngắn, đúng target exam, có ví dụ)

## 7) Kịch bản log test
`TEST_LOG.md` ghi:
- ngày giờ, build/version
- scenario ID
- kết quả pass/fail
- bug summary + severity
- trạng thái fix/retest
- release recommendation

Mục tiêu:
- theo dõi chất lượng thật theo vòng lặp build -> test -> fix -> retest

## 8) Kịch bản prompt (Prompt Scenario)
`PROMPT_LIBRARY.md` quản lý prompt theo nhóm:
- discovery/interview
- product docs generation
- architecture docs generation
- frontend migration
- backend implementation
- AI integration
- testing/debugging/review/handoff

Mỗi prompt phải có:
- mục đích
- input tối thiểu
- guardrails chống scope creep
- expected output

## 9) Chuẩn chất lượng toàn hệ thống
- Concise-first, practical, MVP-first.
- Không over-engineering.
- Không feature creep ngoài `PRD.md`, `USERSTORIES.md`, `MVP_SCOPE.md`.
- Mọi output phải implementation-friendly.

## 10) Trạng thái hiện tại theo session
Trong session này, hệ thống đã đi qua:
- xác định triết lý sản phẩm
- chốt scope MVP
- tạo bộ tài liệu sản phẩm/kỹ thuật
- mở rộng thêm bộ methodology documents để tái tạo pipeline

Khuyến nghị vận hành tiếp:
1. Dùng `PLAN.md` + `Rules.md` làm chuẩn build.
2. Sinh/chuẩn hóa `TEST_SCENARIOS.md` trước khi mở rộng code.
3. Dùng `PROMPT_LIBRARY.md` để điều phối nhiều AI agents nhất quán.

