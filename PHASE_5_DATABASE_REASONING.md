# Phase 5 — MongoDB Persistence Layer Reasoning

Date: 2026-05-18

This document explains the architectural reasoning behind moving the AI Tutor English Learning System from in-memory MVP storage to a persistent MongoDB Atlas layer.

---

## 1. MongoDB architecture reasoning

- MongoDB Atlas was selected as the managed persistence layer to reduce DevOps overhead while still supporting horizontal scaling and operational stability.
- Each service keeps its own database (DB-per-service), matching the microservices isolation strategy and preventing cross-service coupling at the storage layer.
- A shared connection module was introduced (`shared/database/`) to centralize configuration, retry logic, and graceful shutdown behavior so every service follows the same reliability rules.
- Mongoose is used for schema definition, validation, and query ergonomics while keeping the flexibility of document storage.

---

## 2. NoSQL reasoning

- Conversational tutoring data is inherently variable (message arrays, evolving prompt context). MongoDB handles nested arrays and flexible documents without schema migrations for every iteration.
- Flashcards and quiz results evolve quickly as the educational model is refined; NoSQL permits incremental field expansion without heavy migration overhead.
- Document models (conversations, quizzes, results) align with the way the UI reads data: “one conversation”, “one quiz attempt”, “one flashcard”.

---

## 3. Scalability reasoning

- Indexes were added on user ids, timestamps, and lesson or quiz identifiers to support fast history queries and dashboard rendering.
- Atlas provides vertical and horizontal scaling paths (replica sets and sharding) without service code changes.
- Read-heavy dashboard queries are optimized via indexed “recent” queries and small projection payloads.
- Connection pooling and retry backoff are centralized to reduce transient failure impact under load.

---

## 4. Educational data modeling

Collections are shaped around learning workflows:

- `users`: identity and authentication source.
- `conversations`: message history to preserve tutoring continuity and allow recent-conversation dashboards.
- `flashcards`: vocabulary growth artifacts tied to user and conversation context.
- `quizzes`: quiz definitions and question payloads.
- `quiz_results`: attempt history and scoring outcomes for accuracy tracking.

These models reflect the educational loop: Chat → Flashcards → Quiz → Progress.

---

## 5. Persistence workflow

- On service startup, a connection manager performs retries and attaches graceful shutdown hooks.
- Write paths:
  - AI chat appends messages into `conversations`.
  - Flashcard generation stores new cards into `flashcards`.
  - Quiz submission stores attempts in `quiz_results` and updates `progress` for dashboard metrics.
- Read paths:
  - Dashboard queries recent conversations, flashcard history, quiz attempts, and progress summary.
  - Each query is scoped by `userId` and uses indexed fields to keep response time stable.

---

## 6. Debugging & runtime issues

Common runtime issues and mitigation notes:

- **Atlas connection failures**: check IP allow list, network access, and SRV DNS resolution.
- **Authentication errors**: verify MongoDB user roles and the exact `MONGODB_URI` string.
- **Timeouts**: tune `serverSelectionTimeoutMS` and `socketTimeoutMS` in the shared config.
- **Unexpected disconnects**: rely on built-in retry handling and observe logs for backoff events.
- **Schema validation errors**: Mongoose validation messages help trace missing fields or incorrect payloads.

---

## 8. Cross-service progress integration

Phase 5 introduces unified progress tracking across flashcard, quiz, and chat activities:

- **Flashcard review → progress**: When a user marks a flashcard as reviewed, `flashcard-service` calls `quiz-service`'s `/progress/flashcard-review` endpoint to update `flashcards_completed`, `learned_words_count`, and daily activity.
- **Chat activity → progress**: After each AI chat interaction, `ai-chat-service` records chat session metrics via `quiz-service`'s `/progress/chat-activity` endpoint, updating `total_chat_sessions`, `messages_sent`, and streak calculation.
- **Quiz attempts → progress**: Built-in progress tracking in `quiz-service` updates `quizzes_completed`, `quiz_accuracy`, and `weak_topics` on every submission.

This cross-service design keeps `quiz-service` as the canonical progress store while allowing each service to contribute activity data independently.

---

## 9. Progress tracking data model

The `progress` collection stores:

- `user_id`: unique user identifier
- `learned_words_count`: total vocabulary words learned
- `flashcards_completed`: number of flashcards reviewed
- `quizzes_completed`: number of quizzes finished
- `quiz_accuracy`: rolling average of quiz scores
- `total_chat_sessions`: total chat interactions
- `streak_days`: consecutive days with learning activity
- `weak_topics`: array of topics requiring more practice
- `daily_activity`: array of daily activity snapshots with:
  - `date_key`: YYYY-MM-DD format
  - `chat_sessions`: number of chat sessions that day
  - `messages_sent`: number of messages exchanged
  - `flashcards_reviewed`: number of flashcards reviewed
  - `quizzes_completed`: number of quizzes completed
  - `learned_words`: number of new words learned

Streak calculation checks daily activity for consecutive days with any activity (chat, flashcard, quiz, or vocabulary).

---

## 10. Known limitations & future improvements

- **Service coupling for progress**: Cross-service progress updates rely on HTTP calls; future phases can introduce event-driven updates via RabbitMQ for better decoupling.
- **Streak calculation**: Currently calculates streak on-read; optimizing with precomputed daily snapshots would improve dashboard latency.
- **No flashcard scheduling yet**: SM-2 spaced repetition is not yet implemented; flashcards are stored but not scheduled for review.
- **No user-level progress aggregation**: Progress is user-scoped but not aggregated across sessions; future analytics can add cohort-level insights.

---

## 11. Final verification and completion status

Phase 5 is considered complete only after running against a real MongoDB Atlas deployment rather than relying on in-memory behavior or mocked persistence.

Final verification completed on 2026-05-18:

- Confirmed direct Atlas connectivity using the configured `MONGODB_URI` and `DATABASE_NAME`.
- Fixed the remaining null-guard defect in `quiz-service/src/services/quiz.service.js` where `lesson` could be `null` when questions were supplied directly, causing access to `lesson.target_exam` and `lesson.level_tag` to fail.
- Re-ran backend test suites with Atlas-backed persistence enabled:
  - `quiz-service`: 20/20 suites passed, 48/48 tests passed.
  - `ai-chat-service`: 6/6 suites passed, 14/14 tests passed.
  - `flashcard-service`: 4/4 suites passed, 9/9 tests passed.
- Executed an end-to-end persistence smoke test that:
  - created a quiz,
  - submitted a quiz attempt,
  - appended a conversation,
  - created a flashcard,
  - recorded flashcard review progress,
  - recorded chat activity progress,
  - then read the resulting documents back directly from Atlas collections.

The smoke test confirmed:

- `quizzes` persisted successfully,
- `quiz_results` persisted successfully,
- `conversations` persisted successfully,
- `flashcards` persisted successfully,
- `progress` persisted successfully.

The resulting `progress` snapshot reflected the full learning loop with values such as:

- `quizzes_completed: 1`
- `flashcards_completed: 1`
- `total_chat_sessions: 1`
- `learned_words_count: 1`
- `streak_days: 1`

This final verification matters because Phase 5's acceptance criteria are not only about schema design and repository code, but also about proving that data survives outside process memory and can be loaded again for dashboard and history views.

---

## 12. Remaining technical note

The current implementation still leaves one non-blocking testing issue:

- Some Jest runs report open handles after all tests have passed (`Jest did not exit one second after the test run has completed`).

This does not invalidate Phase 5 completion because persistence, CRUD behavior, and end-to-end Atlas verification all succeeded. However, it should be cleaned up later to improve test process shutdown behavior.

---

## 7. Conclusion

MongoDB Atlas enables a persistent, scalable learning platform while preserving the flexibility needed for evolving educational data. The shared database module ensures consistent reliability across services and provides a unified operational posture for Phase 5 and beyond.
