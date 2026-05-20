# 🚀 Development Workflow & Phases

## Seminar Theme: Vibe Coding in Software Engineering

This document explains how the **AI English Tutor** project exemplifies **Vibe Coding** principles in a 12-week MVP development cycle.

---

## 1. What is "Vibe Coding"?

**Vibe Coding** = Development with positive energy and efficient AI collaboration

### Core Principles
| Principle | Meaning | In This Project |
|-----------|---------|-----------------|
| **Clear Vision** | Shared understanding of goals | PRD + User Stories + Wireframes |
| **Modular Design** | Independent, testable units | Microservices (one service = one domain) |
| **AI Partnership** | AI writes 60-70% code predictably | Boilerplate generation, test stubs |
| **Human Focus** | Humans handle business logic + decisions | Prompts, algorithms, security |
| **Rapid Iteration** | Fast feedback loops | 2-week phases, daily standup metrics |
| **Embedded Docs** | Context preserved in repo | README, inline comments, PHASE_X_NOTES |
| **Reproducible Setup** | Onboard in <30 min | Docker Compose, setup guides |

---

## 2. Phase Overview (12 Weeks)

```
┌────────────────────────────────────────────────────────────────────┐
│ WEEK 1-2: Phase 0 (Setup & Infrastructure)                        │
│ Goal: Foundation ready for all teams                              │
├────────────────────────────────────────────────────────────────────┤
│ Deliverables:                                                      │
│ • Docker Compose (Postgres, Redis, RabbitMQ, MinIO)               │
│ • Base service scaffolds (Express + health checks)                │
│ • CI/CD stubs (GitHub Actions templates)                          │
│ • Shared code packages (types, utils, constants)                  │
│ • Setup documentation + local dev guide                           │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ WEEK 3-4: Phase 1 (Authentication)                                │
│ Goal: Secure user access + JWT foundation                         │
├────────────────────────────────────────────────────────────────────┤
│ Deliverables:                                                      │
│ • auth-service (signup, login, token refresh, profile)            │
│ • API Gateway with JWT validation + rate limiting                 │
│ • Frontend login/signup UI + session management                   │
│ • PostgreSQL schema (users, refresh_tokens)                       │
│ • E2E auth flow test + Postman collection                         │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ WEEK 5-7: Phase 2 (AI Chat - CORE)                                │
│ Goal: Primary learning loop (chat + streaming)                    │
├────────────────────────────────────────────────────────────────────┤
│ Deliverables:                                                      │
│ • ai-chat-service (REST + WebSocket endpoints)                    │
│ • ai-worker (Gemini API integration, fallback logic)              │
│ • Chat session persistence (MongoDB conversations)                │
│ • Frontend chat UI (streaming, mode switching)                    │
│ • Prompt templates (Knowledge + Roleplay modes)                   │
│ • Performance: <3s response latency benchmark                     │
│ • Gemini quota monitoring + graceful degradation                  │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ WEEK 8-9: Phase 3 (Flashcard System)                              │
│ Goal: Spaced repetition (SM-2 algorithm)                          │
├────────────────────────────────────────────────────────────────────┤
│ Deliverables:                                                      │
│ • flashcard-service (CRUD + SM-2 scheduling)                      │
│ • Frontend flashcard review UI (swipe gestures)                   │
│ • MongoDB schema (flashcards, flashcard_reviews)                  │
│ • Auto-generate flashcards from chat (optional)                   │
│ • Daily flashcard queue + streak tracking                         │
│ • SM-2 algorithm validation tests                                 │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ WEEK 10-11: Phase 4 (Quiz System)                                 │
│ Goal: Assessment + learning reinforcement                         │
├────────────────────────────────────────────────────────────────────┤
│ Deliverables:                                                      │
│ • quiz-service (generation + scoring + explanations)              │
│ • Gemini-based question generation (prompt-based)                 │
│ • Frontend quiz UI (multiple choice + free text)                  │
│ • Scoring engine + answer validation                              │
│ • MongoDB schema (quizzes, quiz_results)                          │
│ • Analytics: user weaknesses, recommended topics                  │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ WEEK 12: Phase 5 (Database + Polish)                              │
│ Goal: Persistence + production readiness                          │
├────────────────────────────────────────────────────────────────────┤
│ Deliverables:                                                      │
│ • MongoDB Atlas setup + migration scripts                         │
│ • Cross-service progress integration                              │
│ • Dashboard metrics aggregation                                   │
│ • Performance tuning (indexing, query optimization)               │
│ • Bug fixes + E2E smoke tests                                     │
│ • Deployment guide (GCP/AWS target)                               │
└────────────────────────────────────────────────────────────────────┘
```

---

## 3. Vibe Coding Workflow (Per Phase)

### 3.1 Phase Template (2-week cycle)

**Monday (Planning)**
```
1. Team sync: Review phase requirements
2. Break down user stories into GitHub issues
3. AI agents assigned to story estimation
4. Create skeleton PRs with TODO comments
```

**Tuesday-Wednesday (AI Generation)**
```
1. Developer: Write PRD comment in each issue
2. AI Copilot: Generate service scaffolds
3. Review PR:
   - Code structure ✓
   - Test stubs ✓
   - Documentation ✓
4. Approve + merge to feature branch
```

**Thursday (Integration Testing)**
```
1. Start local docker-compose
2. E2E test service contracts
3. Fix integration issues
4. Update PHASE_X_NOTES.md with findings
```

**Friday (Review & Deployment)**
```
1. Team review: Demo features on staging
2. Gather feedback from product
3. Document lessons learned
4. Plan next phase improvements
```

### 3.2 AI Assistance Pattern

```
DEVELOPER
    ↓
    Creates GitHub Issue:
    "Implement /chat/create endpoint
     - Accept userId, message
     - Validate JWT
     - Publish to RabbitMQ
     - Return session_id + job_id"
    ↓
AI COPILOT
    ↓
    Generates:
    - Express controller + route
    - Service layer logic
    - Error handling middleware
    - Jest test stubs
    - README section
    ↓
DEVELOPER
    ↓
    Reviews code:
    - Business logic correct?
    - Security implications?
    - Performance considerations?
    ↓
    If OK → Merge
    If Changes → Comment feedback → AI regenerates
```

---

## 4. Key Vibe Coding Success Metrics

### Per Phase
| Metric | Target | Reason |
|--------|--------|--------|
| **Code Review Time** | <2 hours | AI-generated code should be predictable |
| **Test Coverage** | >80% | AI generates test stubs, humans fill logic |
| **Time to Ship** | 2 weeks | Rapid feedback loops validate assumptions |
| **Defect Rate** | <5 per 1000 LOC | AI boilerplate should have low bugs |
| **Developer Satisfaction** | 4/5 | Clear workflows reduce frustration |

### Overall MVP
| Metric | Target | Status |
|--------|--------|--------|
| **AI-Generated Code** | 65-70% | Boilerplate, CRUD, test stubs |
| **Human-Written Code** | 30-35% | Business logic, algorithms, security |
| **Time to MVP** | 12 weeks | vs. 20+ weeks traditional |
| **Code Reusability** | >60% | Services are copy-paste templates |

---

## 5. Microservices Isolation = Vibe Coding Power

### Why Each Service is AI-Generatable

```
✅ Predictable Pattern:
   Controller → Service → Repository → DB

✅ Testable in Isolation:
   Mock external services easily

✅ Clear Contract:
   OpenAPI schema defines interface

✅ Reproducible Scaffold:
   New service = generate from template

✅ Minimal Dependencies:
   Service talks via HTTP + message queue
```

### Service Template (Auto-Generated)
```
my-service/
├── src/
│   ├── controllers/
│   │   └── my.controller.js (AI generates: routes + middleware)
│   ├── services/
│   │   └── my.service.js (AI generates: business logic stubs)
│   ├── models/
│   │   └── My.schema.js (AI generates: Mongoose schema)
│   ├── middleware/
│   │   └── auth.middleware.js (AI copy: JWT validation)
│   └── utils/
│       └── helpers.js (AI copy: common utilities)
├── tests/
│   └── my.service.spec.js (AI generates: test stubs)
├── package.json (predefined)
├── Dockerfile (predefined template)
├── README.md (AI generates with service description)
└── index.js (Express app boilerplate)
```

**Result**: New service ready in 30 min vs. 2+ hours manual setup.

---

## 6. Embedded Documentation = Knowledge Transfer

### Every service has:

**README.md**
```markdown
## My Service

Purpose: Explain why this service exists

### Endpoints
- POST /create → Create resource
- GET /:id → Fetch resource
- PATCH /:id → Update resource

### Database
Collections: my_resource, my_events

### Message Queue
Publishes: resource.created, resource.updated
Consumes: auth.validated

### Dependencies
- auth-service (JWT validation)
- shared/database (MongoDB connection)
```

**PHASE_X_NOTES.md** (per phase)
```markdown
## Phase 2 AI Chat - Notes

Date: 2026-05-17

### What was completed:
- ai-chat-service Express microservice
- Gemini API integration
- WebSocket proxy in gateway

### Known issues:
- Gemini 429 quota limit on free tier
- Need monitoring for latency

### Next phase:
- Flashcard auto-generation
```

**Result**: Any developer (or AI) can understand state without meetings.

---

## 7. Vibe Coding Principles Applied

### 1. **Clear Problem Statement**
- **PRD.md**: "Learn English in <30 seconds"
- **Not**: "Build an LMS"

### 2. **Modular Architecture**
- Each service is independently deployable
- AI can work on services in parallel

### 3. **Testable Design**
- Mocked Gemini API → tests run fast
- MongoDB → integration tests predictable

### 4. **Automation First**
- Docker Compose → reproducible dev env
- GitHub Actions → automatic CI/CD
- Jest → automatic test discovery

### 5. **Human-Centric Code**
- Async/await (not callbacks)
- Descriptive variable names (not `x`, `y`)
- Comments on "why" (not "what")

### 6. **Rapid Feedback**
- Weekly demos
- Daily metrics (test pass rate, deployment count)
- Bi-weekly retros

### 7. **Knowledge Preservation**
- Git commits with detailed messages
- DEVELOPMENT_LOG.md (daily entries)
- PHASE_X_REASONING.md (why decisions made)

---

## 8. Tools & Tech for Vibe Coding Workflow

| Tool | Purpose | In This Project |
|------|---------|-----------------|
| **GitHub** | Version control + code review | PR-based workflow |
| **Docker** | Reproducible environments | docker-compose.yml |
| **Jest** | Fast unit testing | >80% coverage target |
| **GitHub Actions** | Automated CI/CD | Lint, build, deploy |
| **Postman** | API documentation + testing | Export to OpenAPI |
| **draw.io** | Architecture diagrams | System design docs |
| **MongoDB Atlas** | Managed database | Production data storage |
| **RabbitMQ** | Async job queue | Decouples services |

---

## 9. Risk Mitigation via Vibe Coding

### Risk: "Code quality drops with 70% AI generation"
**Mitigation**:
- AI generates test stubs → 100% code coverage forced
- Human reviews all business logic
- Metrics tracked per phase

### Risk: "Team loses context switching between services"
**Mitigation**:
- Microservices isolation → context = one service
- PHASE_X_NOTES.md → daily state capture
- Short 2-week phases → easy to catch up

### Risk: "Gemini API quota exhaustion"
**Mitigation**:
- Rule-based fallback templates
- Quota monitoring + alerts
- Model switching (swap gemini for different LLM)

### Risk: "Database bottleneck"
**Mitigation**:
- Redis caching for frequent queries
- MongoDB indexing strategy documented
- Load tests in Phase 5

---

## 10. Post-MVP Scaling

### If MVP succeeds:

**More services** (Vibe Coding scales):
- `recommendation-service` (AI suggests next topic)
- `analytics-service` (funnel, retention metrics)
- `payment-service` (premium features)

**Each new service**:
- Uses same scaffold template
- AI generates 60% in 30 min
- Integrates via message broker
- Minimal impact on existing services

**Result**: Add feature = new service = 1 week development vs. 2+ weeks if monolithic.

---

## 11. Seminar Takeaway

> **Vibe Coding is not "no code"** — it's **smart code with clear structure**  
> So AI can generate predictably, and **humans can review confidently**.

### Why This Project is Vibe Coding in Action:

✅ **Clear business problem** (practical English learning)  
✅ **Modular architecture** (microservices)  
✅ **AI partnership** (70% AI-generated, 30% human-written)  
✅ **Rapid delivery** (12 weeks MVP)  
✅ **Embedded documentation** (knowledge preserved)  
✅ **Reproducible setup** (Docker + compose)  
✅ **Testable by design** (Jest + integration tests)  
✅ **Team scalability** (services = parallel work)  

---

## References

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Technical details
- [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) — Phase breakdown
- [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) — Daily progress
- [PHASE_X_NOTES.md](./PHASE_2_AI_CHAT_NOTES.md) — Phase learnings (example)
