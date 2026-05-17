# Frontend Migration Plan (TemplateUI -> React/Next.js)

## 1. Migration Overview

- Mục tiêu:
1. Chuyển toàn bộ TemplateUI (HTML/CSS/JS) sang kiến trúc React/Next.js.
2. Giữ UI/UX 1:1 theo template hiện có.
3. Không redesign, không đổi flow, không thêm feature ngoài MVP scope.

- Kết quả mong muốn:
1. Codebase component-based, dễ maintain.
2. Reusable UI system theo `FRONTEND_COMPONENTS.md`.
3. Tích hợp API và AI flow theo `WORKFLOWS.md` + `SYSTEM_PROMPTS.md`.

## 2. Current State Analysis (TemplateUI)

- Hiện trạng:
1. UI static tách theo nhiều file HTML.
2. CSS lặp lại nhiều (style tag gần như copy nguyên giữa các trang).
3. Interaction viết inline JS (`onclick`, DOM query trực tiếp).

- Pattern UI chính:
1. Card-based (`card-base`, `glass`).
2. Bottom nav cố định.
3. Chat bubble + input bar.
4. Flashcard swipe/flip.
5. Quiz options + feedback panel + result ring.

- Điểm lặp lớn:
1. Button styles.
2. Card styles.
3. Progress bar styles.
4. Header/footer blocks.
5. Bottom nav.

- Animation/interaction phức tạp:
1. Flashcard drag/swipe + flip.
2. Chat typing indicator.
3. Onboarding step transition.

## 3. Target Architecture (React/Next.js)

- Mục tiêu kiến trúc:
1. Component-driven.
2. Feature-based folder structure.
3. Reusable UI system nhất quán.

- Cấu trúc đề xuất:
1. `app/` hoặc `pages/` cho routing.
2. `components/ui` cho primitives.
3. `components/<feature>` cho feature blocks.
4. `hooks/` cho state + side effects.
5. `services/` cho API layer.
6. `styles/` cho design tokens + page styles.

- Nguyên tắc:
1. Không nhét logic business vào component UI thuần.
2. Tách rõ presentation component và feature container.

## 4. Migration Strategy

### Phase 1: Setup nền React/Next.js + layout system
- Setup project chuẩn Next.js.
- Port global style foundation (tokens, reset).
- Tạo `MainLayout`, `AuthLayout`, `BottomNav`.

### Phase 2: Convert UI components
- Tạo bộ `Button`, `Card`, `ProgressBar`, `Badge`, `Input`.
- Port toàn bộ section static theo page.

### Phase 3: Attach state logic
- Chuyển DOM script sang `useState`, `useMemo`, `useEffect`.
- Tách interaction thành hooks theo feature.

### Phase 4: Integrate backend APIs
- Kết nối auth/chat/flashcard/quiz/progress APIs.
- Bổ sung loading/error/empty states.

### Phase 5: Integrate AI features
- Chat request/response, explain_more, generate flashcard, generate quiz.
- Chuẩn hóa response trước khi render.

## 5. Component Migration Mapping

### Mapping chính (HTML -> React component)
1. `card-base` -> `CardBase`
2. `glass` -> `GlassCard`
3. `btn` -> `Button`
4. `progress-bar/progress-fill` -> `ProgressBar`
5. `chip/quick` -> `Badge` / `QuickTag`
6. `bottom-nav/nav-item` -> `BottomNav`
7. `bubble ai/user` -> `MessageBubble`
8. `input-bar + send-btn` -> `ChatInputBar`
9. flashcard front/back -> `FlashcardCard`
10. quiz option list -> `AnswerOptionList`

### Priority + complexity + dependency
- P0 / Low:
1. Button, Card, Input, Badge, ProgressBar.
- P0 / Medium:
1. BottomNav, SectionHeader, MetricCards.
- P0 / High:
1. FlashcardSwipeController (drag/swipe/flip).
2. ChatWindow + TypingIndicator + quick actions.
3. Quiz flow components (stateful sequence).

## 6. Page-by-Page Migration Plan

### Landing Page
- Step:
1. Port hero + CTA + 3 feature cards.
2. Dùng `AuthLayout`.
- Components:
1. `HeroSection`, `FeatureCard`, `Button`.
- Logic:
1. Chỉ routing CTA.

### Auth Page
- Step:
1. Port tab login/signup.
2. Port form states + error.
- Components:
1. `AuthTabs`, `AuthForm`.
- Logic:
1. Local validation + call auth API.

### Onboarding Page
- Step:
1. Port stepper + option cards.
2. Port progress bar + next/back.
- Components:
1. `OnboardingStepper`, `OnboardingOptionCard`.
- Logic:
1. Step state + selected options + submit API.

### Dashboard Page
- Step:
1. Port metrics, continue card, recent/recommended.
2. Gắn data API.
- Components:
1. `DashboardStats`, `ContinueCard`, `RecommendationList`.

### Chat Page (Knowledge)
- Step:
1. Port message list + input + quick actions.
2. Gắn send chat API + typing state.
- Components:
1. `ChatModeTabs`, `ChatWindow`, `ChatInputBar`, `QuickActionChips`.

### Roleplay Page
- Step:
1. Port scenario header + progress + quick replies.
2. Gắn roleplay mode API.
- Components:
1. `RoleplayHeader`, `RoleplayQuickReplies`, `ChatInputBar`.

### Flashcard Page (Library + Study)
- Step:
1. Port library list/decks.
2. Port study card swipe/flip.
- Components:
1. `FlashcardDeckCard`, `FlashcardCard`, `SwipeActionBar`.

### Quiz Page
- Step:
1. Port question card + options + timer.
2. Port feedback + next.
- Components:
1. `QuizHeader`, `QuizQuestionCard`, `AnswerOption`.

### Profile Page
- Step:
1. Port profile stats + weekly chart + skill bars.
- Components:
1. `ProfileHeader`, `WeeklyActivityChart`, `SkillProgressList`.

Need clarification:
- `Admin` page có trong template nhưng mức ưu tiên frontend migration cho MVP cần chốt (P1 hay đưa vào cuối).

## 7. Step-by-Step Implementation Order

1. Setup Next.js project + base config.
2. Port layout system (`AuthLayout`, `MainLayout`, `BottomNav`).
3. Build base UI components (`Button`, `Card`, `ProgressBar`, `Input`, `Badge`).
4. Migrate **Flashcard page trước** (theo yêu cầu thứ tự build).
5. Migrate Chat page (Knowledge + Roleplay mode UI).
6. Migrate Dashboard page.
7. Migrate Quiz + Quiz Result page.
8. Migrate Onboarding + Auth.
9. Migrate Profile.
10. Gắn API + AI integration + analytics events.

## 8. State Management Migration Plan

- Quy tắc:
1. Dùng `useState` cho local interaction.
2. Dùng `useReducer` cho flow nhiều trạng thái (quiz, onboarding step).
3. Dùng Context nhẹ cho auth/session.
4. Server state qua React Query/SWR.

- Mapping từ JS cũ:
1. DOM query -> controlled state.
2. Inline mutation style -> component state + className binding.
3. Global mutable vars -> hook state.

- Không dùng Redux ở giai đoạn MVP.

## 9. Routing Migration Plan

- Route chính:
1. `/landing`
2. `/login`
3. `/onboarding`
4. `/dashboard`
5. `/chat`
6. `/roleplay`
7. `/flashcards`
8. `/quiz`
9. `/profile`

- Route bổ sung từ template:
1. `/flashcards/study`
2. `/quiz/result`
3. `/admin` (P1)

Assumption needed:
- Route `/` sẽ redirect về `/landing` để đồng nhất entry point.

## 10. Styling Migration Plan (CSS -> Tailwind / CSS Modules)

- Mục tiêu:
1. Giữ giao diện 1:1.
2. Tránh viết lại style bằng cảm tính.

- Cách làm đề xuất:
1. Phase đầu dùng CSS Modules/global CSS để copy đúng style nhanh nhất.
2. Sau khi parity ổn định, mới refactor dần sang Tailwind utility nếu cần.

- Quy tắc:
1. Không thay đổi màu/radius/shadow/spacing so với template.
2. Ưu tiên trích `design tokens` trước khi refactor.

Need clarification:
- Chốt 1 hướng chính cho MVP: CSS Modules thuần hay Tailwind ngay từ đầu.

## 11. API Integration Plan

- Tạo service layer:
1. `authService`
2. `chatService`
3. `flashcardService`
4. `quizService`
5. `progressService`
6. `guestService`

- Hook usage:
1. `useAuth`
2. `useChatSession`
3. `useFlashcardDeck`
4. `useQuizAttempt`
5. `useProgressOverview`

- Nguyên tắc:
1. Component không gọi `fetch` trực tiếp.
2. Chuẩn hóa response/error tại service layer.

## 12. AI Integration Hook Plan

- Hooks đề xuất:
1. `useChatAI()`
2. `useFlashcardAI()`
3. `useQuizAI()`

- Responsibilities:
1. Build request payload từ state hiện tại.
2. Gọi API backend (không gọi AI provider trực tiếp từ FE).
3. Normalize response trước khi render.
4. Expose `loading`, `error`, `retry`.

- Rules:
1. Prompt centralized ở backend (`SYSTEM_PROMPTS.md`).
2. FE chỉ gửi context cần thiết.
3. Không inject prompt trực tiếp ở frontend.

## 13. Risk & Breaking Points

1. Swipe logic phức tạp (drag threshold, velocity, revert animation).
2. Flip card state conflict khi vừa drag vừa tap.
3. AI latency làm UX chat giật/đợi lâu.
4. State sync issue giữa optimistic UI và server response.
5. Duplicate flashcard do generate lặp.
6. Quiz difficulty không ổn định giữa lần generate.
7. Encoding icon từ template có thể lỗi khi migrate.

## 14. Testing Strategy

- UI parity test:
1. So sánh React page với HTML template theo checklist (layout/color/spacing/interaction).

- Interaction test:
1. Swipe/flip flashcard.
2. Chat send/receive + typing + explain_more.
3. Quiz chọn đáp án + feedback + next.
4. Onboarding step flow.

- API integration test:
1. Auth flow.
2. Chat/flashcard/quiz/progress.
3. Guest merge flow.

- AI response test:
1. Chat concise-first.
2. Quiz/flashcard schema hợp lệ.

## 15. Deployment Strategy

- Frontend:
1. Deploy Vercel.

- Backend:
1. Node server tách riêng (Railway/Render/VPS).

- Environments:
1. `dev`
2. `staging` (optional)
3. `production`

- Env vars FE:
1. `NEXT_PUBLIC_API_BASE_URL`
2. `NEXT_PUBLIC_POSTHOG_KEY` (nếu có)

## 16. Scope Cut Strategy

- Nếu thiếu thời gian, cắt theo thứ tự:
1. Roleplay polish (UI polish/quick replies nâng cao).
2. Animations nâng cao (không ảnh hưởng core flow).
3. Dashboard analytics nâng cao.
4. Admin panel frontend.

- Không được cắt:
1. Chat
2. Flashcard
3. Quiz
4. Onboarding

## 17. Definition of Done

Feature migration hoàn thành khi:
1. UI giống TemplateUI >= 95% (visual parity checklist).
2. Responsive chạy ổn trên mobile viewport chính.
3. Không vỡ interaction cốt lõi (chat send, swipe/flip, quiz select).
4. API đã kết nối và trả dữ liệu đúng flow.
5. AI response path hoạt động (chat/flashcard/quiz).
6. Không có lỗi console nghiêm trọng.
7. Loading/error/empty states có đầy đủ cho flow chính.

Need clarification:
1. Chọn route `/` hiển thị trực tiếp `landing` hay redirect.
2. Ưu tiên migrate `AdminPage` trong MVP frontend ở mức nào (P0 hay P1).
3. Chốt chiến lược styling cho MVP: CSS Modules hay Tailwind-first.
