# Phase 4 - Quiz + Content Reasoning

This document explains the reasoning behind Phase 4 (Quiz + Content). The focus is to complete the learning loop by providing quiz generation, scoring, and progress tracking, while keeping the MVP runnable without database setup.

## Educational goal

- Convert learning from chat/flashcards into measurable outcomes.
- Provide short quizzes that reinforce vocabulary and grammar.
- Show quick feedback so learners can adjust immediately.

## Quiz service rationale

- Quiz generation is template-based for MVP stability.
- Questions are derived from lesson vocabulary to keep content grounded.
- `GET /quizzes/:id` hides `correct_answer` to prevent cheating before submit.

## Scoring and feedback design

- Each question is scored as correct/incorrect (1 point each).
- Overall score is computed as a percentage.
- Weak topics are derived from incorrect questions to guide review.
- Submit response returns per-question correctness and explanations.

## Progress tracking rationale

- Track quiz accuracy and quiz count at user level.
- Keep a simple daily activity record to power the dashboard later.
- Progress is updated immediately after each submit.

## MVP storage strategy

- In-memory storage is the default to keep local runs simple.
- MongoDB can be enabled via `MONGODB_URI` with the same API shape.
- This keeps the MVP fast to demo while preserving a clear upgrade path.

## Risks and mitigations

- Risk: quiz quality too generic.
  - Mitigation: add curated lessons and better templates in the next phase.
- Risk: progress metrics too thin for retention.
  - Mitigation: expand progress fields once frontend dashboard is ready.

## Conclusion

Phase 4 delivers a minimal but complete quiz loop with curated content, scoring, and progress. The design trades advanced AI generation for stability and offline-friendly MVP behavior, while keeping a direct path to persistence and richer quiz logic later.
