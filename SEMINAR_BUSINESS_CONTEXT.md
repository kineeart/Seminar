# 🎓 Vibe Coding: AI English Tutor — Seminar Submission

## Executive Summary

**Project**: AI-Powered English Learning Platform  
**Theme**: "Vibe Coding/Low-Code/No-Code in the Future of Software Engineering"  
**Duration**: 12-week MVP cycle  
**Architecture**: Microservices + AI-Agnostic Design  
**Key Innovation**: Rapid prototyping using AI-augmented development (Vibe Coding)

---

## 1. Business Context

### 1.1 Market Problem
- **Target Audience**: Gen Z (16-25 years old) with short attention span
- **Pain Point**: Existing English learning apps are too time-consuming, not practical enough
- **Opportunity**: Mobile-first, AI-powered, bite-sized learning (<30 seconds per interaction)

### 1.2 Product Vision: "Ask Anything, Learn Something"
- **Core Promise**: Get useful English learning content in under 30 seconds
- **Unique Angle**: 
  - Conversational-first (Chat as primary learning channel)
  - Personalized by level + exam target (TOEIC, IELTS, VSTEP)
  - Practical, real-world vocabulary and phrases
  - Low psychological barrier to asking questions

### 1.3 MVP Scope (First 12 Weeks)
**Must-Have Features**:
1. **AI Chat** (2 modes: Knowledge + Roleplay)
2. **Auto-Generated Flashcards** from chat context
3. **Quiz Generation & Scoring** with AI explanation
4. **Progress Dashboard** tracking learning streaks
5. **Authentication** (Google OAuth + Email/Password)
6. **Onboarding** (Level → Goal → Target → Topics)
7. **Guest Mode** with 7-day trial
8. **Admin Panel** for user/content management

**Out of Scope**:
- Native mobile app (web-responsive only)
- PWA/Offline mode
- Voice/Pronunciation scoring
- Social learning or multiplayer

---

## 2. Vibe Coding Philosophy in This Project

### 2.1 What is "Vibe Coding"?
Vibe Coding = **Rapid, AI-augmented development** where:
- AI Copilot writes 60-70% of boilerplate + pattern code
- Developers focus on business logic + architecture decisions
- Clear handoff documentation allows seamless AI→Human→AI workflow
- Emphasis: Clear PRD, clean Git history, embedded documentation

### 2.2 How This Project Implements Vibe Coding
1. **Clear Structure**: Microservices isolation makes hand-offs easy
2. **Embedded Documentation**: Every service has README + inline comments
3. **Workflow Rules**: `COPILOT_WORKFLOW_RULES.md` + `.prompt.md` files guide AI assistance
4. **Testable Architecture**: Each service has Jest tests; easy to verify AI-generated code
5. **Modular Scale**: New features added as new services, not monolithic changes

### 2.3 Development Velocity
- **Phase 0** (Setup): 2 weeks — Infrastructure, Docker, CI/CD
- **Phase 1** (Auth): 2 weeks — Service isolation proven
- **Phase 2** (AI Chat): 3 weeks — Core learning loop
- **Phase 3** (Flashcard): 2 weeks — Spaced repetition integration
- **Phase 4** (Quiz): 2 weeks — Assessment + scoring
- **Phase 5** (Database): 1 week — MongoDB Atlas persistence

**Total: ~12 weeks with 80%+ AI-generated code in boilerplate & utilities**

---

## 3. Technology Stack — "Low-Code by Design"

### Frontend
- **Framework**: React 18 + Vite (HMR, fast builds)
- **Why**: Component-based, high reusability, huge ecosystem
- **Low-Code Strategy**: Use UI component libraries (shadcn/ui, or headless)

### Backend
- **Architecture**: Microservices (API Gateway pattern)
- **Services**:
  - `auth-service` — User authentication, JWT
  - `ai-chat-service` — Conversation management
  - `ai-worker` — LLM integration (Gemini API)
  - `flashcard-service` — Spaced repetition (SM-2 algorithm)
  - `quiz-service` — Question generation + grading
  - `gateway` — Request routing, JWT validation, rate limiting

### Databases
- **MongoDB** (primary) — Flexible schema for chat transcripts, flexible user data
- **PostgreSQL** (if needed) — Relational data (users, tokens, structured content)
- **Redis** — Session cache, rate limiting
- **RabbitMQ** — Async job queue for AI processing

### AI Integration
- **Provider**: Google Gemini API (`gemini-2.5-flash`)
- **Fallback**: Local rule-based responses if quota exhausted
- **Approach**: Agent-like (stateless) for now; future: stateful memory

### DevOps
- **Containerization**: Docker + Docker Compose (local dev)
- **CI/CD**: GitHub Actions (lint, build, deploy stubs)
- **Deployment**: Cloud-ready (GCP/AWS target)

---

## 4. System Architecture Overview

### 4.1 High-Level Flow
```
User (Browser)
    ↓
Frontend (React/Vite)
    ↓ HTTP/WebSocket
API Gateway (Port 3000)
    ├→ Auth Service (JWT validation)
    ├→ AI Chat Service (Conversation CRUD + streaming)
    ├→ Flashcard Service (CRUD + scheduling)
    ├→ Quiz Service (Generation + grading)
    └→ [More services as needed]
    ↓ Async
Message Broker (RabbitMQ)
    ↓
AI Worker (Gemini API integration)
    ↓
Databases (MongoDB, PostgreSQL, Redis)
```

### 4.2 Key Services Interaction

#### Chat Flow (Core Learning Loop)
1. User sends message → Frontend
2. Frontend POST to Gateway `/chat/create`
3. Gateway validates JWT, routes to `ai-chat-service`
4. AI Chat Service:
   - Creates session (if new)
   - Persists message in MongoDB
   - Publishes job to RabbitMQ
5. AI Worker consumes job:
   - Calls Gemini API
   - Streams response back
6. AI Chat Service updates transcript
7. Frontend receives response via HTTP/WS
8. User sees AI tutor response (Knowledge or Roleplay mode)

#### Flashcard Generation (Spaced Repetition)
1. User manual/auto-tags message as flashcard
2. AI Chat Service creates flashcard document in MongoDB
3. Flashcard Service schedules review using SM-2 algorithm
4. Dashboard shows "Today's Flashcards"
5. User swipes (Again/Hard/Good/Easy)
6. Algorithm recalculates next review date
7. Progress tracked in user `progress` collection

#### Quiz Flow (Assessment)
1. User clicks "Take Quiz"
2. Quiz Service queries user level, recent topics
3. AI Worker generates questions via Gemini (prompt: level + topics)
4. Quiz Service stores quiz document
5. Frontend shows Q&A interface
6. User submits answers
7. Quiz Service grades & generates explanations
8. Results stored in `quiz_results` collection
9. Progress updated (quizzes_completed ++, streak calculation)

#### Progress Tracking (Dashboard)
- Canonical `progress` collection indexed by user_id
- Fields: `quizzes_completed`, `flashcards_completed`, `total_chat_sessions`, `learned_words_count`, `streak_days`, `last_active_date`
- Updated via cross-service signals (quiz attempt → quiz-service publishes event → quiz-service updates progress)
- Frontend Dashboard queries progress endpoint for visual display

---

## 5. Agentic AI Strategy

### 5.1 Current State (MVP)
**Not fully agentic yet** — more like "AI as a Function":
- Each user query → Stateless Gemini API call
- Prompt includes: user level, exam target, current topic
- Response optimized for <80 words, practical examples

### 5.2 Components of AI Behavior
1. **Prompt Engineering** (in `SYSTEM_PROMPTS.md`):
   - Knowledge mode: Explain concept → Formula → Example
   - Roleplay mode: Simulate realistic dialogue, adapt difficulty

2. **Context Awareness**:
   - Pull user's current level + target from auth context
   - Reference recent chat history for continuity
   - Query relevant flashcards/quiz topics

3. **Fallback Strategy**:
   - If Gemini quota exhausted → rule-based template responses
   - If error → graceful degradation (don't break UX)

### 5.3 Future Agentic Extensions
- **Multi-turn planning**: AI decides whether to chat/quiz/flashcard next
- **Adaptive sequencing**: AI recommends optimal learning sequence
- **Memory**: Persistent user learning profile in vector DB
- **Tool use**: AI calls flashcard-service, quiz-service directly to orchestrate learning

---

## 6. Microservices Isolation & Low-Code Benefits

### 6.1 Why Microservices for MVP?
| Aspect | Benefit |
|--------|---------|
| **Scaling** | Scale AI worker independently from chat |
| **Fault isolation** | Auth outage ≠ Quiz outage |
| **Team parallelism** | 1 dev per service = less merge conflicts |
| **AI hand-off** | AI generates service → human reviews → next service |
| **Language flexibility** | Future: mix Python (ML), Node.js (API), Go (worker) |

### 6.2 Each Service = Low-Code Candidate
Every service follows this pattern:
```
service-name/
├── src/
│   ├── controllers/ (Express routes)
│   ├── services/    (Business logic)
│   ├── models/      (Database schemas)
│   └── utils/       (Helpers, validators)
├── tests/
├── package.json
├── Dockerfile
└── README.md
```

AI can generate 70% of this for each new service, developer fills in business logic.

---

## 7. Data Model (Simplified)

### 7.1 Core Collections
```
users
├─ _id, email, password_hash, google_id, auth_provider
├─ display_name, avatar_url, current_level, target_exam
├─ learning_goals[], favorite_topics[]
└─ onboarding_completed, created_at, updated_at

chat_sessions
├─ _id, user_id, guest_session_id
├─ title, current_mode (knowledge|roleplay), message_count
└─ last_message_at, created_at

chat_messages
├─ _id, session_id, role (user|assistant)
├─ content, tokens_used
└─ created_at

flashcards
├─ _id, user_id, front, back, source_message_id
├─ current_interval (SM-2), next_review_date, ease_factor
└─ created_at, last_reviewed_at

quizzes
├─ _id, user_id, title, questions[], difficulty_level
├─ topic, generated_by (ai|manual)
└─ created_at

quiz_results
├─ _id, user_id, quiz_id, answers[], score, time_spent
└─ attempted_at

progress
├─ _id, user_id
├─ quizzes_completed, flashcards_completed, total_chat_sessions
├─ learned_words_count, streak_days, last_active_date
└─ updated_at
```

---

## 8. Development Process (Vibe Coding Workflow)

### Phase Overview
| Phase | Week | Focus | AI Role | Human Role |
|-------|------|-------|---------|------------|
| 0 | 1-2 | Infrastructure, Docker, DB | Generate Docker configs | Design arch, decide services |
| 1 | 3-4 | Auth Service, JWT, frontend login | Generate boilerplate, tests | Business logic, security review |
| 2 | 5-7 | AI Chat, Gemini integration | Generate service scaffold, API stubs | Prompt tuning, streaming logic |
| 3 | 8-9 | Flashcard + SM-2 algorithm | Generate CRUD endpoints | Core algorithm, scheduling |
| 4 | 10-11 | Quiz generation + scoring | Generate question templates | Grading logic, explanations |
| 5 | 12 | Database verification, polish | Generate migration scripts | Verify data integrity |

### Development Rhythm
1. **Monday**: Define week's scope, create GitHub issues
2. **Tues-Wed**: AI generates service + tests (review in PR)
3. **Thurs**: Integration testing, fix failures
4. **Friday**: Deploy to staging, gather feedback

---

## 9. Why This Project Demonstrates Vibe Coding

### 9.1 Clear Handoff Points
- **PRD.md** → "What to build"
- **ARCHITECTURE.md** → "How services interact"
- **PHASE_X_NOTES.md** → "Status + next steps"
- **.prompt.md files** → "AI instructions for service generation"

### 9.2 AI-Friendly Patterns
- **Microservices**: Each service is independently AI-generatable
- **Testable**: Jest test framework; AI generates test cases
- **Documented**: Embedded README in each service
- **Reproducible**: Docker Compose; any dev can rebuild in 5 min

### 9.3 Measurable Velocity
- **~70% of code is AI-generated** (especially boilerplate, CRUD, test stubs)
- **~30% is human-authored** (business logic, security, prompts, architecture decisions)
- **Ship MVP in 12 weeks** with 2-3 devs (would take 20+ weeks in traditional approach)

---

## 10. Future Extensions (Beyond MVP)

### 10.1 Agentic AI Enhancements
- **Multi-step reasoning**: AI plans learning sequence over multiple turns
- **Tool orchestration**: AI decides which service (chat/quiz/flashcard) to invoke
- **Memory persistence**: Vector DB for semantic search of past conversations
- **Adaptive difficulty**: AI adjusts content based on performance

### 10.2 Scale & Reliability
- **Kubernetes**: Horizontal scaling for workers
- **Monitoring**: Prometheus + Grafana for service health
- **Caching**: Redis for frequently accessed content
- **CDN**: Images, static assets

### 10.3 New Services
- `recommendation-service` — Suggest next topic to learn
- `analytics-service` — Retention, funnel analysis
- `payment-service` — Premium features (future monetization)
- `mobile-app` — React Native for iOS/Android

---

## 11. Conclusion

This project demonstrates **Vibe Coding in action**:
✅ Clear business problem (practical English learning)  
✅ Rapid MVP cycle (12 weeks)  
✅ AI-augmented development (70% AI-generated)  
✅ Microservices for parallel AI work  
✅ Embedded documentation for handoffs  
✅ Testable, reproducible architecture  

**Key Insight**: Low-Code isn't "no code" — it's **smart code** with clear structure, so AI can generate predictably, and humans can review confidently.

---

## References

- `PRD.md` — Full product requirements
- `ARCHITECTURE.md` — Detailed service specifications
- `DB_SCHEMA.md` — MongoDB collections design
- `IMPLEMENTATION_ROADMAP.md` — Week-by-week breakdown
- `SYSTEM_PROMPTS.md` — AI behavior tuning
