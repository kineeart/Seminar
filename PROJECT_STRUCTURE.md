# PROJECT STRUCTURE — AI Tutor English Learning System (MVP)

Phiên bản: 0.1 (MVP)

Tài liệu này mô tả cấu trúc thư mục dự án, từng component và reasoning đằng sau các lựa chọn kiến trúc.

---

## Mục tiêu thiết kế

- **Microservices isolation**: mỗi backend service độc lập, có folder riêng, DB riêng, Dockerfile riêng.
- **Mono-repo simplicity**: tất cả code cùng repo nhưng chia modules; dễ manage CI/CD và versioning.
- **Developer Experience**: cấu trúc trực quan, dễ navigate, quy tắc đặt tên nhất quán.
- **Scalability**: dễ thêm service mới mà không phá vỡ existing structure.
- **Vibe Coding**: workflow clear, documentation embedded, easy handoff.

---

## Root-level structure

```
📁 2026-2027_SeminarChuyenDe_VibeCoding/
├── 📄 PRD.md                    # Product requirements
├── 📄 MVP_SCOPE.md              # MVP scope
├── 📄 USERSTORIES.md            # User stories
├── 📄 WORKFLOWS.md              # Workflows
├── 📄 DB_SCHEMA.md              # Database schema (design)
├── 📄 ARCHITECTURE.md           # Architecture overview
├── 📄 COPILOT_WORKFLOW_RULES.md # Copilot workflow for devs
├── 📄 DEVELOPMENT_LOG.md        # Daily development log
├── 📄 PROJECT_STRUCTURE.md      # This file
├── 📄 IMPLEMENTATION_ROADMAP.md # Implementation roadmap
├── 📁 app/                      # Main application folder
│   ├── 📁 frontend/             # React/Vite SPA
│   ├── 📁 backend/              # Backend services (all)
│   └── 📁 shared/               # Shared code (types, utils)
├── 📁 docs/                     # Documentation
│   ├── 📁 evidence/             # Screenshots, diagrams
│   ├── 📁 prompts/              # AI prompts archive
│   ├── 📁 events/               # Event schemas (async)
│   └── 📄 API.md                # API spec (OpenAPI)
├── 📁 TemplateUI/               # UI template (reference)
├── 📄 docker-compose.yml        # Local dev compose
└── 📄 .gitignore                # Git ignore rules
```

---

## `/app/frontend` — React/Vite SPA

**Reasoning**: Tập trung toàn bộ frontend vào folder để quản lý node_modules, build artifacts riêng.

```
app/frontend/
├── 📄 package.json              # Dependencies, scripts
├── 📄 vite.config.js            # Vite config (HMR, optimization)
├── 📄 index.html                # Entry point
├── 📄 .env.example              # Env template (API_BASE_URL, etc)
├── 📁 src/
│   ├── 📄 main.jsx              # React app entry
│   ├── 📄 App.jsx               # Root component
│   ├── 📁 components/           # Reusable UI components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Button.jsx
│   │   └── ...
│   ├── 📁 pages/                # Page-level components (route-based)
│   │   ├── HomePage.jsx         # Dashboard / home
│   │   ├── ChatPage.jsx         # Chat interface
│   │   ├── FlashcardPage.jsx    # Flashcard review
│   │   ├── QuizPage.jsx         # Quiz interface
│   │   ├── ProfilePage.jsx      # User profile
│   │   ├── LoginPage.jsx        # Auth
│   │   └── OnboardingPage.jsx   # Onboarding flow
│   ├── 📁 services/             # API client & business logic
│   │   ├── apiClient.js         # Axios instance, base config
│   │   ├── authService.js       # Auth endpoints (login, signup)
│   │   ├── chatService.js       # Chat API calls, WS setup
│   │   ├── flashcardService.js  # Flashcard endpoints
│   │   ├── quizService.js       # Quiz endpoints
│   ├── 📁 hooks/                # React custom hooks
│   │   ├── useAuth.js           # Auth state
│   │   ├── useChat.js           # Chat state + WS
│   │   └── useFetch.js          # Generic fetch hook
│   ├── 📁 context/              # React Context (state mgmt)
│   │   ├── AuthContext.js       # User auth state
│   │   └── AppContext.js        # Global app state
│   ├── 📁 styles/               # Global CSS
│   │   └── index.css
│   ├── 📁 assets/               # Images, icons, fonts
│   │   └── logo.png
│   └── 📁 utils/                # Helper functions
│       ├── formatters.js        # Date, text formatting
│       ├── validators.js        # Form validation
│       └── constants.js         # App constants
├── 📁 public/                   # Static assets (served directly)
└── 📄 Dockerfile                # Docker image for prod
```

**Key points**:
- `/src/services`: API layer, separated from components → easy to test, mock, refactor.
- `/src/pages`: One component per major feature → scalable when adding new routes.
- `/src/context`: Lightweight state management (no Redux for MVP) → simple setup, easy debugging.
- Environment file: `.env.example` committed, `.env` gitignored.

---

## `/app/backend` — Microservices

**Reasoning**: Each service is independent; can deploy, scale, version separately.

```
app/backend/
├── 📁 gateway/                  # API Gateway (Kong, custom, or Traefik)
│   ├── 📄 Dockerfile
│   ├── 📄 docker-compose.override.yml  # Dev secrets
│   ├── 📁 src/
│   │   ├── 📄 main.ts           # Express/Fastify app
│   │   ├── 📄 routes.ts         # Gateway routes + proxy config
│   │   └── 📁 middleware/
│   │       ├── 📄 auth.ts       # JWT verify, token validation
│   │       ├── 📄 rateLimit.ts  # Rate limiting
│   │       └── 📄 cors.ts       # CORS config
│   ├── 📄 package.json
│   └── 📄 README.md             # Service-specific setup
│
├── 📁 auth-service/             # User authentication & profile
│   ├── 📄 Dockerfile
│   ├── 📁 src/
│   │   ├── 📄 main.ts
│   │   ├── 📄 auth.controller.ts
│   │   ├── 📄 auth.service.ts
│   │   ├── 📄 user.model.ts     # DB schema
│   │   ├── 📁 dto/              # Data transfer objects
│   │   │   ├── 📄 signup.dto.ts
│   │   │   └── 📄 login.dto.ts
│   │   ├── 📁 middleware/
│   │   │   └── 📄 jwt.ts
│   │   └── 📁 utils/
│   │       ├── 📄 password.ts   # bcrypt/argon2 hashing
│   │       └── 📄 jwt-helper.ts # Token generation
│   ├── 📁 db/                   # Database migrations, seeds
│   │   ├── 📄 migrations/
│   │   └── 📄 seeds/
│   ├── 📄 package.json
│   ├── 📄 .env.example
│   └── 📄 README.md
│
├── 📁 ai-chat-service/          # Chat orchestration
│   ├── 📄 Dockerfile
│   ├── 📁 src/
│   │   ├── 📄 main.ts
│   │   ├── 📄 chat.controller.ts
│   │   ├── 📄 chat.service.ts
│   │   ├── 📄 session.model.ts
│   │   ├── 📁 dto/
│   │   ├── 📁 utils/
│   │   │   ├── 📄 websocket.ts
│   │   │   └── 📄 queue.ts      # RabbitMQ / job publish
│   │   └── 📁 middleware/
│   ├── 📁 db/
│   ├── 📄 package.json
│   ├── 📄 .env.example
│   └── 📄 README.md
│
├── 📁 ai-worker/                # AI LLM worker (scaleable)
│   ├── 📄 Dockerfile            # Python-based if using external LLM APIs
│   ├── 📁 src/
│   │   ├── 📄 main.py           # FastAPI or async consumer
│   │   ├── 📄 llm_handler.py    # LLM provider calls (OpenAI, etc.)
│   │   ├── 📄 processor.py      # Post-processing, transcript
│   │   └── 📄 queue_consumer.py # RabbitMQ consumer
│   ├── 📄 requirements.txt
│   ├── 📄 .env.example
│   └── 📄 README.md
│
├── 📁 flashcard-service/        # Flashcard CRUD + SM-2 scheduling
│   ├── 📄 Dockerfile
│   ├── 📁 src/
│   │   ├── 📄 main.ts
│   │   ├── 📄 flashcard.controller.ts
│   │   ├── 📄 flashcard.service.ts
│   │   ├── 📄 scheduling.service.ts # SM-2 algorithm
│   │   ├── 📄 card.model.ts
│   │   ├── 📄 progress.model.ts
│   │   ├── 📁 dto/
│   │   └── 📁 utils/
│   ├── 📁 db/
│   ├── 📄 package.json
│   ├── 📄 .env.example
│   └── 📄 README.md
│
├── 📁 quiz-service/             # Quiz generation & scoring
│   ├── 📄 Dockerfile
│   ├── 📁 src/
│   │   ├── 📄 main.ts
│   │   ├── 📄 quiz.controller.ts
│   │   ├── 📄 quiz.service.ts
│   │   ├── 📄 scoring.service.ts
│   │   ├── 📄 quiz.model.ts
│   │   ├── 📄 attempt.model.ts
│   │   ├── 📁 dto/
│   │   └── 📁 utils/
│   ├── 📁 db/
│   ├── 📄 package.json
│   ├── 📄 .env.example
│   └── 📄 README.md
│
└── 📄 shared-compose.env        # Shared env vars for docker-compose
```

**Key points per service**:
- `Dockerfile`: reproducible build, health checks.
- `src/` structure: controllers → services → models → DTOs → utilities (standard layering).
- `db/`: migrations, seeds (Prisma / TypeORM / raw SQL).
- `package.json`: pinned versions, npm scripts for dev/build/test.
- `.env.example`: document all env vars needed.
- `README.md`: service-specific setup, how to run locally.

---

## `/app/shared` — Shared code (types, utils, constants)

**Reasoning**: Common code (TypeScript interfaces, shared utils) to avoid duplication and maintain consistency.

```
app/shared/
├── 📁 types/                    # Shared TypeScript interfaces
│   ├── 📄 user.types.ts         # User, Profile
│   ├── 📄 chat.types.ts         # Chat session, message
│   ├── 📄 flashcard.types.ts    # Card, progress
│   ├── 📄 quiz.types.ts         # Quiz, attempt, score
│   ├── 📄 content.types.ts      # Lesson, topic
│   └── 📄 api.types.ts          # API responses, errors
├── 📁 utils/                    # Shared utilities
│   ├── 📄 logger.ts             # Centralized logging setup
│   ├── 📄 errorHandler.ts       # Error formatting
│   ├── 📄 validators.ts         # Common validation
│   └── 📄 constants.ts          # App-wide constants
├── 📁 enums/                    # Shared enums
│   ├── 📄 roles.enum.ts         # User roles
│   ├── 📄 chatMode.enum.ts      # Chat mode (Knowledge, Roleplay)
│   └── 📄 quizType.enum.ts      # Quiz types
├── 📄 package.json              # If shared code is npm package (optional)
└── 📄 README.md
```

**When to use**: types, enums, validators that span multiple services. Avoid sharing business logic (each service owns its domain).

---

## `/docs` — Documentation

**Reasoning**: Centralized docs, architecture decisions, examples, prompts used with AI.

```
docs/
├── 📄 API.md                    # OpenAPI spec (manual or auto-generated)
├── 📁 evidence/                 # Screenshots, diagrams, proof of work
│   ├── 📄 2026-05-16-architecture.png
│   ├── 📄 2026-05-17-auth-flow.png
│   └── ...
├── 📁 prompts/                  # Prompts used to generate code/design
│   ├── 📄 design_microservices.md
│   ├── 📄 scaffold_auth_service.md
│   └── ...
├── 📁 events/                   # Event schemas for async messaging
│   ├── 📄 chat.events.json
│   ├── 📄 quiz.events.json
│   └── ...
├── 📁 guides/                   # Setup, deployment guides
│   ├── 📄 local_dev_setup.md
│   ├── 📄 docker_setup.md
│   ├── 📄 ci_cd_setup.md
│   └── 📄 deployment.md
└── 📄 CONTRIBUTING.md           # How to contribute
```

---

## CI/CD & Infrastructure

**`.github/workflows/` (if using GitHub Actions):**

```
.github/workflows/
├── 📄 frontend.yml              # Frontend build, test, deploy
├── 📄 auth-service.yml          # Auth service build, test, push image
├── 📄 ai-chat-service.yml       # Chat service build, test, push image
├── 📄 flashcard-service.yml
├── 📄 quiz-service.yml
└── 📄 gateway.yml
```

Each pipeline:
- Lint code
- Run tests
- Build Docker image
- Push to registry
- Deploy to staging / production

---

## Environment & Secrets

**Docker Compose local dev:**
- `docker-compose.yml`: production-like setup (all services + DBs).
- Per-service `.env.example`: template.
- `.env` (gitignored): local overrides (secrets, API keys).

**Production:**
- Kubernetes ConfigMaps (non-secret config) + Secrets (API keys, passwords).
- Use HashiCorp Vault or cloud provider's secret manager.

---

## Rationale for this structure

| Design choice | Why |
|---|---|
| Mono-repo (one repo, multiple services) | Easier CI/CD, shared history, atomic commits. Mono-repo tooling (nx, yarn workspaces) not needed for MVP. |
| `/app/frontend` + `/app/backend` | Clear separation: frontend devs ≠ backend devs. Easier to isolate builds and dependencies. |
| Per-service folders | Each service can be deployed independently, versioned separately, tested in isolation. DB per service → avoid coupling. |
| `/app/shared` for types only | Avoid shared business logic (each service owns its domain). Share only types/enums to reduce code duplication. |
| `.env.example` in each service | Document what each service needs; easier onboarding. |
| Dockerfile per service | Ready for containerization, K8s deployment, image registry. |
| `/docs` centralized | Single source of truth for architecture, API, guides. Easier to maintain than scattered docs. |

---

## Scaling later

When scale increases:
- **Services grow**: break into smaller services (split flashcard → review + scheduling).
- **Monorepo grows**: consider nx, yarn workspaces, or split repos.
- **DBs grow**: replica, sharding, separate analytics DB.
- **Infrastructure**: Kubernetes, service mesh (Istio), advanced observability.

This structure supports all these without major refactor.

---

## File versioning

- Version: 0.1 (MVP-focused)
- Last updated: 2026-05-16
- Approved by: [Architecture team]

*This is the canonical project structure. Any major changes require team review and update to this document.*
