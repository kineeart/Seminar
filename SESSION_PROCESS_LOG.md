# SESSION_PROCESS_LOG.md

## 1) Mục đích tài liệu
Tài liệu này ghi lại **quá trình suy luận và triển khai tài liệu** trong session theo hướng có thể audit:
- bắt đầu từ ý tưởng ban đầu
- cách hỏi để làm rõ requirement
- cách chốt scope
- cách sinh từng file `.md`
- cách kiểm tra đúng yêu cầu
- log minh chứng kỹ thuật

Mục tiêu: người đọc mới vẫn hiểu được nhóm đang làm gì, vì sao làm như vậy, và học lại quy trình.

## 2) Bài toán ban đầu và hướng tiếp cận
### 2.0 Core ban đầu (mốc requirement gốc từ trao đổi nhóm)
Core có 3 chức năng chính:
1. Hỏi đáp 1-1 với chatbot.
2. AI tạo flashcard ôn tập.
3. AI tạo bài kiểm tra trắc nghiệm.

Điểm đặc biệt của chatbot:
- hỏi gì trả lời đó
- ngắn gọn
- đưa công thức/cấu trúc/câu ví dụ ngay
- không phân tích sâu nếu user không yêu cầu
- tránh nói quá nhiều, tránh giảng dài dòng

Chatbot có 2 mode:
1. Chat tình huống thực tế:
- order đồ ăn
- check-in khách sạn
- giao tiếp thường ngày
2. Chat hỏi kiến thức:
- từ đồng nghĩa
- cách dùng từ
- so sánh hơn / so sánh bằng
- đặt câu
- dùng trong IELTS/TOEIC phổ biến không

Hai chức năng còn lại (flashcard + quiz):
- được AI tự động sinh từ nội dung user hỏi/chat.

### 2.1 Bài toán ban đầu
Project là app học tiếng Anh bằng AI, triết lý concise-first, MVP-first, không over-engineering.

### 2.2 Câu hỏi cốt lõi cần giải
1. User nào là trung tâm?
2. Use case ưu tiên số 1 là gì?
3. MVP bắt buộc gồm những module nào?
4. AI behavior cụ thể đến mức nào?
5. Scope nào cắt được khi thiếu thời gian?

### 2.3 Hướng suy luận
Không nhảy vào viết tài liệu ngay. Đi theo chuỗi:
1. Clarify requirement qua nhiều vòng hỏi đáp.
2. Chốt product facts và hard rules.
3. Mới chuyển sang tài liệu hóa theo pipeline.

## 3) Quá trình trao đổi và các quyết định đã chốt
## 3.1 Vòng làm rõ Product
Đã chốt:
- target user: 16–25, mất gốc/basic, học nhanh.
- use case #1: hỏi kiến thức nhanh.
- use case #2: roleplay tình huống.
- chatbot phải ngắn gọn, practical, mặc định ưu tiên dưới 80 từ.

## 3.2 Vòng làm rõ UX/Business logic
Đã chốt:
- vào Home Dashboard sau login, chat là CTA chính.
- onboarding gồm level, mục tiêu, target score, chủ đề.
- explain more mở rộng inline (không tạo message mới).
- flashcard có auto suggest + manual generate.
- quiz có daily recommended + manual generate.

## 3.3 Vòng làm rõ Data/Tech/NFR
Đã chốt:
- stack MVP: MERN, web responsive trước.
- guest mode có giới hạn và giữ tạm dữ liệu ~7 ngày.
- auth: Google + email/password.
- latency target chat: ideal 1–2s, max <3s.
- analytics: PostHog là ưu tiên MVP.

## 3.4 Vòng làm rõ Scope control
Đã chốt:
- P0 không được cắt: chatbot, flashcard, quiz, onboarding personalization, progress cơ bản.
- cắt trước nếu trễ: leaderboard, gamification sâu, advanced analytics, advanced branching, reminders.

## 4) Cách sinh từng nhóm tài liệu
## 4.1 Nhóm Product docs
Thứ tự:
1. `PRD.md`
2. `USERSTORIES.md`
3. `MVP_SCOPE.md`

Lý do:
- PRD định nghĩa bài toán.
- User stories chuyển requirement thành backlog có thể build/test.
- MVP scope khóa ranh giới để chống scope creep.

## 4.2 Nhóm AI/Backend/System docs
Thứ tự:
1. `SYSTEM_PROMPTS.md`
2. `DB_SCHEMA.md`
3. `WORKFLOWS.md`

Lý do:
- prompts chốt hành vi AI.
- schema chốt dữ liệu.
- workflows chốt tương tác module + trigger + fallback.

## 4.3 Nhóm Frontend docs
Thứ tự:
1. `FRONTEND_COMPONENTS.md`
2. `FRONTEND_MIGRATION_PLAN.md`

Lý do:
- phân rã UI mẫu trước.
- rồi mới lập kế hoạch migrate HTML -> React/Next.js theo component architecture.

## 4.4 Nhóm Execution/Governance/QA docs
Thứ tự:
1. `PLAN.md`
2. `Rules.md`
3. `TEST_SCENARIOS.md`
4. `TEST_LOG.md`
5. `PROMPT_LIBRARY.md`

Lý do:
- plan để triển khai theo phase/sprint.
- rules để code nhất quán.
- test scenarios để kiểm thử có hệ thống.
- test log để theo dõi chất lượng.
- prompt library để tái tạo toàn pipeline.

## 5) Kỹ thuật đã dùng trong quá trình
1. **Progressive clarification**: hỏi theo vòng từ product -> UX -> tech -> scope.
2. **Traceability-first**: mọi file sau phải trace được về PRD/MVP_SCOPE/USERSTORIES.
3. **Scope guardrails**: dùng cụm “Need clarification / Assumption needed”.
4. **Template-driven documentation**: mỗi file có cấu trúc chuẩn để AI khác tái chạy được.
5. **Pipeline dependency mapping**: định rõ file nào phụ thuộc file nào.

## 6) Cách đảm bảo đúng yêu cầu
Checklist áp dụng khi sinh tài liệu:
1. Không thêm feature ngoài scope đã xác nhận.
2. Tất cả nội dung theo tiếng Việt (giữ technical terms tiếng Anh).
3. Mỗi tài liệu phải có mục tiêu, input, quy trình, validation, dependency.
4. Có mục “out-of-scope” để chặn mở rộng ngầm.
5. Có tiêu chí testable/measurable thay vì mô tả mơ hồ.

## 7) Quản lý nội dung từng bước
Mỗi bước đều nên ghi:
1. Input sử dụng.
2. Quyết định chính.
3. Rủi ro.
4. Output tạo ra.
5. Tiêu chí done.

Mẫu ghi nhanh:
- Step:
- Input:
- Decision:
- Risk:
- Output:
- Done when:

## 8) Log minh chứng kỹ thuật (session evidence)
Các dấu vết đã có trong session:
1. Tạo và cập nhật các file tài liệu chính tại root project.
2. Tạo các file methodology dạng `methodology_document_*.md`.
3. Tạo tài liệu tóm lược `soluoc.md`.
4. Có thao tác kiểm tra tồn tại file và đọc nội dung bằng shell command.

Lưu ý:
- Có hiện tượng lỗi hiển thị tiếng Việt trong terminal (mojibake/codepage), nhưng không đồng nghĩa file gốc sai logic nội dung.
- Cần thống nhất UTF-8 và editor hiển thị UTF-8 để đọc chuẩn.

## 9) Kết quả đạt được
1. Có pipeline tài liệu đầy đủ từ product đến test/prompt.
2. Có scope guardrails rõ để giảm feature creep.
3. Có cơ sở để nhiều AI agents cùng làm mà không lệch hướng.
4. Có tài liệu tóm lược để người mới onboard nhanh.

## 10) Kế hoạch tiếp theo
1. Chuẩn hóa encoding UTF-8 cho toàn bộ `.md` và kiểm tra lại hiển thị.
2. Review chéo `methodology_document_*.md` theo checklist bắt buộc.
3. Khởi chạy build theo `PLAN.md` + `Rules.md`.
4. Thiết lập vòng lặp test bằng `TEST_SCENARIOS.md` và cập nhật `TEST_LOG.md`.

## 11) Bài học rút ra (kinh nghiệm)
1. Hỏi kỹ requirement trước khi viết tài liệu giúp giảm rework lớn.
2. Scope lock sớm là yếu tố quan trọng nhất cho MVP.
3. Nếu không có traceability, tài liệu nhiều nhưng khó triển khai.
4. AI docs muốn dùng được phải có format ổn định và validation rõ.
5. Cần có session log để tránh mất bối cảnh khi chuyển người/agent.

## 12) Phương pháp suy luận chuẩn cho từng file .md (chi tiết)
Mục tiêu phần này: cung cấp một khung suy luận có thể lặp lại để sinh từng file `.md` mà không bị viết cảm tính.

## 12.1 Nguyên tắc chung trước khi suy luận
1. Luôn bắt đầu từ requirement gốc đã xác nhận.
2. Không tự thêm feature lớn.
3. Tách rõ dữ liệu thật vs giả định.
4. Nếu thiếu dữ liệu quan trọng: ghi `Need clarification` hoặc `Assumption needed`.
5. Mỗi kết luận phải trace được về input.

Mẫu suy luận chuẩn cho mọi file:
1. Câu hỏi lõi của file này là gì?
2. Input tối thiểu là gì?
3. Điều kiện ràng buộc (scope/rules/NFR) là gì?
4. Quy tắc quyết định (decision logic) là gì?
5. Output phải có các phần nào?
6. Kiểm tra chất lượng bằng tiêu chí nào?

---

## 12.2 PRD.md — Phương pháp suy luận
### Câu hỏi lõi
- Sản phẩm giải bài toán gì, cho ai, bằng cách nào, trong phạm vi nào?

### Input tối thiểu
- Ý tưởng ban đầu.
- Core features.
- Product philosophy.
- User mục tiêu.
- MVP constraints.

### Logic suy luận
1. Xác định user chính và pain point chính.
2. Xác định use case ưu tiên số 1.
3. Chốt outcome mong muốn trong 2 tuần đầu user dùng app.
4. Chốt core features phải có để đạt outcome.
5. Chốt triết lý hành vi AI (concise-first, practical).
6. Chốt success metrics để đo thật.
7. Chốt out-of-scope để chống scope creep.

### Output cần đạt
- Product overview, target users, core features, UX flow, AI behavior, metrics, NFR, scope cut.

### Validation
1. Có user + use case ưu tiên rõ chưa?
2. Có mô tả behavior AI đủ cụ thể để implement chưa?
3. Có phân biệt rõ must-have và non-goals chưa?
4. Có tiêu chí đo thành công chưa?

### Lỗi thường gặp
- PRD quá “đẹp” nhưng không build được.
- Thiếu ranh giới scope.
- Thiếu metrics đo được.

---

## 12.3 USERSTORIES.md — Phương pháp suy luận
### Câu hỏi lõi
- Từ PRD, cần build những hành vi nào dưới dạng story có thể test?

### Input tối thiểu
- `PRD.md`.

### Logic suy luận
1. Tách PRD thành epic theo module.
2. Trong mỗi epic, tách feature theo user outcome.
3. Viết user story theo format Agile.
4. Mỗi story phải có acceptance criteria measurable.
5. Gắn priority P0/P1/P2 theo ảnh hưởng tới MVP.
6. Liệt kê edge cases ngay từ đầu.

### Output cần đạt
- Epic -> Feature -> User Story -> Acceptance Criteria -> Edge Cases -> Technical Notes -> Priority.

### Validation
1. Story có trace ngược về PRD không?
2. Criteria có test được không?
3. Có story nào ngoài scope không?

### Lỗi thường gặp
- Story viết theo góc kỹ thuật, không theo user outcome.
- Criteria mơ hồ kiểu “hoạt động tốt”.

---

## 12.4 MVP_SCOPE.md — Phương pháp suy luận
### Câu hỏi lõi
- Để ship nhanh và validate đúng, cần làm tối thiểu những gì?

### Input tối thiểu
- `PRD.md`, `USERSTORIES.md`.

### Logic suy luận
1. Xác định critical path user flow.
2. Chọn các story bắt buộc để flow chạy end-to-end.
3. Đánh dấu phần có thể defer.
4. Xếp P0/P1/P2.
5. Viết out-of-scope rõ ràng.
6. Viết scope cut order khi trễ timeline.

### Output cần đạt
- In-scope, out-of-scope, must/should/nice, deferred, release checklist.

### Validation
1. Nếu chỉ làm P0 thì app có dùng được không?
2. Có tính năng nào “hay nhưng không cần” bị lọt vào P0 không?

### Lỗi thường gặp
- Nhét quá nhiều vào MVP.
- Không có thứ tự cắt scope.

---

## 12.5 SYSTEM_PROMPTS.md — Phương pháp suy luận
### Câu hỏi lõi
- Làm sao để AI trả lời đúng style sản phẩm và đúng target user?

### Input tối thiểu
- `PRD.md`, `MVP_SCOPE.md`, `USERSTORIES.md`.

### Logic suy luận
1. Trích xuất behavior rules của AI.
2. Chia prompt theo từng feature AI.
3. Định nghĩa format output mặc định.
4. Định nghĩa điều kiện “Explain More”.
5. Định nghĩa adaptation theo level/target exam.
6. Định nghĩa safety/fallback behavior.
7. Tối ưu token: bỏ lặp chỉ dẫn.

### Output cần đạt
- Global rules, feature prompts, variables runtime, fallback, format rules.

### Validation
1. Prompt có bắt AI concise-first không?
2. Có chặn over-explain mặc định không?
3. Example có ép bám target exam không?

### Lỗi thường gặp
- Prompt quá chung chung.
- Prompt mâu thuẫn giữa mode Knowledge và Roleplay.

---

## 12.6 DB_SCHEMA.md — Phương pháp suy luận
### Câu hỏi lõi
- Cần lưu dữ liệu gì để các flow MVP chạy ổn định và truy vấn nhanh?

### Input tối thiểu
- `PRD.md`, `MVP_SCOPE.md`, `USERSTORIES.md`.

### Logic suy luận
1. Liệt kê entities theo feature.
2. Chọn embed/reference theo truy vấn thực tế.
3. Định nghĩa field bắt buộc và optional.
4. Chốt index theo query nóng.
5. Chốt lifecycle: guest expiry, delete account, cleanup.

### Output cần đạt
- Collections, relationships, schema fields, indexes, lifecycle rules.

### Validation
1. Mỗi field có lý do tồn tại không?
2. Query dashboard/chat/review có index hỗ trợ chưa?
3. Có over-normalize kiểu SQL không?

### Lỗi thường gặp
- Thiếu index query nóng.
- Schema nặng cho các trường không dùng MVP.

---

## 12.7 WORKFLOWS.md — Phương pháp suy luận
### Câu hỏi lõi
- Trigger từ UI sẽ chạy qua backend/AI/DB như thế nào end-to-end?

### Input tối thiểu
- `PRD.md`, `MVP_SCOPE.md`, `DB_SCHEMA.md`, `SYSTEM_PROMPTS.md`.

### Logic suy luận
1. Vẽ user journey tổng.
2. Chia theo workflow chức năng.
3. Gắn frontend action -> backend action -> AI action -> DB update.
4. Gắn analytics event.
5. Gắn error + fallback cho từng flow.

### Output cần đạt
- Bộ workflows chính có trigger, actions, updates, failures, fallback.

### Validation
1. Workflow có bám schema không?
2. Có missing step nào khiến data lệch không?
3. Failure case có xử lý UX chưa?

### Lỗi thường gặp
- Chỉ mô tả happy path.
- Quên analytics trigger.

---

## 12.8 FRONTEND_COMPONENTS.md — Phương pháp suy luận
### Câu hỏi lõi
- Từ HTML mẫu, tách component nào để reuse tốt và giữ UI 1:1?

### Input tối thiểu
- Template HTML/CSS/JS + `WORKFLOWS.md`.

### Logic suy luận
1. Phân tích page blocks và lặp lại UI.
2. Tách design system primitives.
3. Tách layout components.
4. Tách feature components.
5. Map props/state/events cho từng component.

### Output cần đạt
- Component tree, reusable components, page mapping, state/interaction design.

### Validation
1. Có giữ UI 1:1 không?
2. Có tách reusable thật hay còn copy/paste?
3. Có tránh giant component không?

### Lỗi thường gặp
- Tách component quá nhỏ gây rối.
- Gộp quá lớn gây khó maintain.

---

## 12.9 FRONTEND_MIGRATION_PLAN.md — Phương pháp suy luận
### Câu hỏi lõi
- Migrate từ static HTML sang React theo thứ tự nào để ít vỡ nhất?

### Input tối thiểu
- `FRONTEND_COMPONENTS.md`, `WORKFLOWS.md`, `MVP_SCOPE.md`.

### Logic suy luận
1. Chốt target architecture.
2. Chọn page migration order theo rủi ro và dependency.
3. Tách phase: UI parity -> state attach -> API attach.
4. Chốt testing parity HTML vs React.

### Output cần đạt
- Lộ trình migrate page-by-page + component mapping + risk plan.

### Validation
1. UI parity có mục tiêu định lượng chưa?
2. Có kế hoạch rollback/fix nhanh khi vỡ interaction không?

### Lỗi thường gặp
- Vừa migrate vừa redesign.
- Nối API quá sớm khi UI chưa ổn.

---

## 12.10 PLAN.md — Phương pháp suy luận
### Câu hỏi lõi
- Build theo thứ tự nào để ra MVP chạy được nhanh nhất?

### Input tối thiểu
- Tất cả docs trước đó.

### Logic suy luận
1. Xác định dependency graph.
2. Chốt development order theo đường găng.
3. Chia sprint có deliverable demo được.
4. Liệt kê risk areas và scope cut strategy.
5. Chốt definition of done.

### Output cần đạt
- Phase plan, sprint breakdown, backend/frontend/AI/DB/deploy/testing plans.

### Validation
1. Mỗi sprint có output kiểm chứng được không?
2. Kế hoạch có xử lý risk cao sớm không?

### Lỗi thường gặp
- Sprint chia theo team thay vì theo deliverable.
- Không có plan fallback.

---

## 12.11 Rules.md — Phương pháp suy luận
### Câu hỏi lõi
- Làm sao giữ code nhất quán khi nhiều người/agent cùng code?

### Input tối thiểu
- `PLAN.md`, `MVP_SCOPE.md`, `SYSTEM_PROMPTS.md`, `DB_SCHEMA.md`, `WORKFLOWS.md`.

### Logic suy luận
1. Trích ra các quyết định kỹ thuật bắt buộc.
2. Chuyển thành rule ngắn, áp dụng được.
3. Viết anti-patterns để chặn sai từ sớm.
4. Viết scope protection rules.

### Output cần đạt
- Bộ rules đầy đủ cho architecture, coding, AI integration, testing, security.

### Validation
1. Rule có đo/kiểm được không?
2. Có mâu thuẫn rule nào không?

### Lỗi thường gặp
- Rule quá triết lý, không actionable.

---

## 12.12 TEST_SCENARIOS.md — Phương pháp suy luận
### Câu hỏi lõi
- Cần test những gì để chứng minh MVP hoạt động đúng?

### Input tối thiểu
- `USERSTORIES.md`, `WORKFLOWS.md`, `Rules.md`, `MVP_SCOPE.md`.

### Logic suy luận
1. Lấy acceptance criteria làm nguồn test.
2. Tạo smoke tests cho P0.
3. Tạo scenario theo module và edge/error.
4. Tạo AI behavior validation riêng.
5. Gắn priority và expected result rõ.

### Output cần đạt
- Danh sách test scenarios có ID, steps, expected results, priority.

### Validation
1. P0 có coverage đủ chưa?
2. Có scenario cho timeout/empty/invalid chưa?

### Lỗi thường gặp
- Test case trùng nhau.
- Thiếu expected result cụ thể.

---

## 12.13 TEST_LOG.md — Phương pháp suy luận
### Câu hỏi lõi
- Đã test gì, fail gì, fix tới đâu, có đủ điều kiện release chưa?

### Input tối thiểu
- `TEST_SCENARIOS.md` + kết quả chạy test thực tế.

### Logic suy luận
1. Dùng scenario ID làm trục log.
2. Ghi pass/fail + defect severity.
3. Ghi trạng thái fix/retest.
4. Tính pass rate và blockers.
5. Kết luận release recommendation.

### Output cần đạt
- Log chạy test + defect summary + release recommendation.

### Validation
1. Mỗi log có trace tới scenario ID không?
2. Có phân biệt fail do bug hay do môi trường không?

### Lỗi thường gặp
- Log thiếu context build/version.
- Không theo dõi retest.

---

## 12.14 PROMPT_LIBRARY.md — Phương pháp suy luận
### Câu hỏi lõi
- Làm sao chuẩn hóa prompt để AI khác tái tạo pipeline ổn định?

### Input tối thiểu
- Toàn bộ docs + `Rules.md` + `MVP_SCOPE.md`.

### Logic suy luận
1. Liệt kê toàn bộ tác vụ lặp lại.
2. Nhóm prompt theo giai đoạn.
3. Chuẩn hóa format prompt: mục đích, input, guardrails, expected output.
4. Thêm prompt kiểm soát scope và prompt review chất lượng.

### Output cần đạt
- Prompt catalog có thể copy dùng lại ngay.

### Validation
1. Prompt có chống scope creep không?
2. Prompt có phụ thuộc quá nhiều ngữ cảnh ẩn không?

### Lỗi thường gặp
- Prompt quá dài, lặp instruction.
- Prompt thiếu expected output nên kết quả không nhất quán.

---

## 12.15 Cơ chế kiểm soát đúng yêu cầu xuyên suốt
Áp dụng ở mọi bước:
1. **Traceability check**: mỗi mục mới phải chỉ ra nguồn từ file trước.
2. **Scope check**: nếu không nằm trong PRD/MVP_SCOPE thì không đưa vào.
3. **Consistency check**: product rules, AI rules, DB/workflow phải khớp nhau.
4. **Testability check**: câu mô tả phải chuyển thành test được.
5. **Handoff check**: người/agent khác đọc vào có làm tiếp được ngay không.

## 12.16 Mẫu note kinh nghiệm sau mỗi vòng làm việc
Sau mỗi phiên, ghi nhanh:
1. Hôm nay đã chốt được gì?
2. Vấn đề nào còn mơ hồ?
3. Quyết định nào ảnh hưởng lớn nhất?
4. Sai sót nào đã gặp?
5. Bài học để vòng sau làm nhanh hơn?

Mẫu dùng lại:
- Context:
- Decision:
- Why:
- Trade-off:
- Risk:
- Mitigation:
- Next action:
