# Phase 4 Prompts - Quiz

Below are the prompts used to generate Phase 4 deliverables (quiz-service) in an MVP-friendly way.

---

## Prompt 1 - Phase 4 Backend Implementation (Core)

"""
Duoi day la cac tai lieu trong du an: IMPLEMENTATION_ROADMAP.md, DB_SCHEMA.md, PRD.md, PLAN.md.

Hay trien khai Phase 4 (Quiz) theo huong MVP runnable:

1) Tao quiz-service (Express, CommonJS) voi endpoints:
- GET /health
- POST /quizzes/generate
- GET /quizzes/:quizId
- POST /quizzes/:quizId/submit
- GET /attempts?userId=...
- GET /progress?userId=...

2) MVP chay duoc khong can DB, nhung neu co MONGODB_URI thi dung Mongoose:
- storage/index.js chon memory-store hoac mongo-store.

3) Quiz scoring:
- moi cau dung 1 diem
- tinh % score
- tra ve weak topics tu cau sai

4) Khi GET quiz, khong tra ve correct_answer.
5) Co seed data de quiz generation khong bi rong.
6) Co tests (Jest + supertest) cho quiz-service.
7) Cap nhat gateway proxy /api/quizzes.
8) Cap nhat backend workspaces + scripts + jest config.

Giu code don gian, MVP-first. Neu khong co lessonId thi quiz-service phai fallback vao local data.
"""

---

## Prompt 2 - Phase 4 Reasoning Doc

"""
Viet tai lieu reasoning cho Phase 4 (Quiz) giong cac phase truoc.
Noi ro ly do quiz generation template-based cho MVP,
scoring va weak topics, progress tracking, va ly do dung in-memory fallback + optional MongoDB.
Trinh bay ngan gon, ro y.
"""

---

## Prompt 3 - Phase 4 Notes Doc

"""
Viet notes tom tat Phase 4 (Quiz) giong style Phase 2 notes.
Noi ro: endpoints, env vars, file chinh, va next steps.
"""

---

## Prompt 4 - README Cho Quiz Service

"""
Tao README ngan gon cho quiz-service:
- Cach install, chay dev, env vars
- Danh sach endpoints
- Ghi chu: in-memory default, MongoDB optional
"""
