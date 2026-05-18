# Phase 4 Prompts - Quiz + Content

Below are the prompts used to generate Phase 4 deliverables (content-service + quiz-service) in an MVP-friendly way.

---

## Prompt 1 - Phase 4 Backend Implementation (Core)

"""
Duoi day la cac tai lieu trong du an: IMPLEMENTATION_ROADMAP.md, DB_SCHEMA.md, PRD.md, PLAN.md.

Hay trien khai Phase 4 (Quiz + Content) theo huong MVP runnable:

1) Tao content-service (Express, CommonJS) voi CRUD lessons:
- GET /health
- GET /lessons
- GET /lessons/:lessonId
- POST /lessons
- PATCH /lessons/:lessonId
- DELETE /lessons/:lessonId

2) Tao quiz-service (Express, CommonJS) voi endpoints:
- GET /health
- POST /quizzes/generate
- GET /quizzes/:quizId
- POST /quizzes/:quizId/submit
- GET /attempts?userId=...
- GET /progress?userId=...

3) MVP chay duoc khong can DB, nhung neu co MONGODB_URI thi dung Mongoose:
- storage/index.js chon memory-store hoac mongo-store.

4) Quiz scoring:
- moi cau dung 1 diem
- tinh % score
- tra ve weak topics tu cau sai

5) Khi GET quiz, khong tra ve correct_answer.
6) Co seed lessons de quiz generation khong bi rong.
7) Co tests (Jest + supertest) cho content-service va quiz-service.
8) Cap nhat gateway proxy /api/content va /api/quizzes.
9) Cap nhat backend workspaces + scripts + jest config.

Giu code don gian, MVP-first. Neu khong co content-service hoac lessonId thi quiz-service phai fallback vao local data.
"""

---

## Prompt 2 - Phase 4 Reasoning Doc

"""
Viet tai lieu reasoning cho Phase 4 (Quiz + Content) giong cac phase truoc.
Noi ro ly do tach content-service, ly do quiz generation template-based cho MVP,
scoring va weak topics, progress tracking, va ly do dung in-memory fallback + optional MongoDB.
Trinh bay ngan gon, ro y.
"""

---

## Prompt 3 - Phase 4 Notes Doc

"""
Viet notes tom tat Phase 4 (Quiz + Content) giong style Phase 2 notes.
Noi ro: endpoints, env vars, file chinh, va next steps.
"""

---

## Prompt 4 - README Cho Quiz/Content Services

"""
Tao README ngan gon cho content-service va quiz-service:
- Cach install, chay dev, env vars
- Danh sach endpoints
- Ghi chu: in-memory default, MongoDB optional
"""
