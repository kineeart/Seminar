# Frontend Component Architecture

## 1. UI Overview

- Tổng thể UI theo style:
1. Card-based UI (`card-base`, `glass`).
2. Gradient background toàn app.
3. Bottom navigation cố định cho các màn sau login.
4. Chat bubble system cho Knowledge/Roleplay.
5. Swipe card interaction cho flashcard học.

- Color system (từ HTML mẫu):
1. Primary gradient: `#6a82fb -> #fc5c7d`.
2. Success: `#27ae60`.
3. Danger: `#e74c3c`.
4. Text chính: `#2d2d3a`, text phụ `#5a5a72`, muted `#888`.
5. Background: gradient pastel (`#f6d5f7`, `#fbe9d7`, `#c2e9fb`).

- Spacing pattern:
1. Container max-width ~460px.
2. Gap dọc 10-22px.
3. Border radius lớn (14/22/999px).

- Typography pattern:
1. Font: `Segoe UI, system-ui`.
2. H1 đậm, compact.
3. Body text rõ, thiên về readability.

- Interaction pattern:
1. Button hover/active nhẹ.
2. Progress bar animation.
3. Typing indicator trong chat.
4. Swipe + flip flashcard.

## 2. Design System Breakdown

### Core tokens (đề xuất từ mẫu)
- `colors`: primary, success, danger, text, muted, surface.
- `radius`: sm=14, md=22, pill=999.
- `shadow`: card/elevated/nav.
- `spacing`: 4, 6, 8, 10, 12, 14, 16, 20, 22, 24.

### Button variants
- `Button`:
1. `variant="primary"` (gradient)
2. `variant="ghost"`
3. `variant="success"`
4. `variant="danger"`
5. `size="sm|md|lg"`

### Card styles
- `CardBase`: nền trắng, radius lớn, shadow.
- `GlassCard`: nền kính blur.
- `MetricCard`: card chỉ số.
- `ActionCard`: card có CTA.

### Input styles
- `TextInput`:
1. default
2. error
3. disabled

### Modal styles
- UI mẫu chưa có modal thật.
- Assumption needed: dùng `BottomSheet/Modal` cho action confirm sau này nếu cần.

### Progress styles
- `ProgressBar` + `ProgressFill`.
- Hỗ trợ `value`, `max`, `label`.

### Badge/Tag styles
- `Chip`, `QuickTag`, `StatusBadge` (`open/resolved`, `weak topic`, `mode`).

## 3. Page Mapping

Mapping file HTML -> page/component:

1. `TemplateUI/landing.html` -> `LandingPage`
2. `TemplateUI/auth.html` -> `AuthPage`
3. `TemplateUI/onboarding.html` -> `OnboardingPage`
4. `TemplateUI/home.html` -> `DashboardPage`
5. `TemplateUI/chat.html` -> `ChatPage (Knowledge)`
6. `TemplateUI/roleplay.html` -> `RoleplayPage`
7. `TemplateUI/flashcards_benngoai.html` -> `FlashcardLibraryPage`
8. `TemplateUI/flashcards.html` -> `FlashcardStudyPage`
9. `TemplateUI/quiz.html` -> `QuizPage`
10. `TemplateUI/quiz-result.html` -> `QuizResultPage`
11. `TemplateUI/profile.html` -> `ProfilePage`
12. `TemplateUI/admin.html` -> `AdminPage`

Need clarification:
- HTML đang link tới `flashcards-study.html` nhưng file này không tồn tại (nhiều khả năng chính là `flashcards.html`).

## 4. Component Tree

### Cây tổng quát
1. `AppProviders`
2. `RouteLayout` (Auth/Main/Admin)
3. `Page`
4. `Section blocks`
5. `Reusable UI components`

### Cây màn chính (sau login)
1. `MainLayout`
2. `TopHeader`
3. `PageContent`
4. `BottomNav`

### Cây Chat
1. `ChatLayout`
2. `ChatModeTabs`
3. `ChatMessageList`
4. `MessageBubble`
5. `QuickActionsRow`
6. `ChatInputBar`

### Cây Flashcard Study
1. `FlashcardStudyLayout`
2. `StudyProgressHeader`
3. `FlashcardStack`
4. `FlashcardCard` (front/back)
5. `SwipeActionBar`

## 5. Reusable Components

### `Button`
- Props:
1. `variant`
2. `size`
3. `loading`
4. `disabled`
5. `onClick`
- Use case: CTA toàn app.

### `Card`
- Props:
1. `type="base|glass|metric|action"`
2. `padding`
3. `interactive`
- Use case: dashboard, profile, admin, quiz feedback.

### `ProgressBar`
- Props:
1. `value`
2. `max`
3. `colorVariant`
- Use case: onboarding, roleplay progress, quiz progress, mastery progress.

### `Badge`
- Props:
1. `variant="default|primary|success|danger|warning"`
2. `label`
- Use case: status, tags, quick filters.

### `TextInput`
- Props:
1. `value`
2. `onChange`
3. `placeholder`
4. `error`
5. `type`
- Use case: auth, search/filter.

### `BottomNav`
- Props:
1. `items`
2. `activeKey`
3. `onNavigate`

### `SectionHeader`
- Props:
1. `title`
2. `subtitle`
3. `action`

## 6. Layout Components

1. `MainLayout`
- Dùng cho: dashboard/chat/flashcard/quiz/profile.
- Có `BottomNav`.

2. `AuthLayout`
- Dùng cho: landing/auth/onboarding.
- Không có `BottomNav`.

3. `ChatLayout`
- Tối ưu vùng message + input cố định dưới.

4. `DashboardLayout`
- Nhiều block card, có horizontal scroll section.

5. `AdminLayout`
- Card metrics + report list.

## 7. Feature Components

### Flashcard feature
1. `FlashcardLibraryHeader`
2. `FlashcardFilterChips`
3. `FlashcardDeckCard`
4. `FlashcardStudyProgress`
5. `FlashcardCard`
6. `FlashcardSwipeController`
7. `FlashcardResultSummary`

### Chat feature
1. `ChatModeTabs`
2. `ChatWindow`
3. `MessageBubble`
4. `TypingIndicator`
5. `QuickActionChips` (Explain More / Create Flashcards / Create Quiz)
6. `ChatInputBar`

### Roleplay feature
1. `RoleplayScenarioHeader`
2. `RoleplayProgress`
3. `RoleplayQuickReplies`
4. `RoleplayInputBar`

### Quiz feature
1. `QuizHeader` (progress + timer)
2. `QuizQuestionCard`
3. `AnswerOption`
4. `QuizFeedbackPanel`
5. `QuizResultRing`
6. `WeakTopicsPanel`

### Onboarding feature
1. `OnboardingStepperHeader`
2. `OnboardingProgress`
3. `OnboardingOptionList`
4. `OnboardingOptionCard`
5. `OnboardingFooterActions`

## 8. State Management Design

- Nguyên tắc:
1. Local state cho UI interactions.
2. Server state tách riêng (React Query/SWR).
3. Context nhẹ cho auth + app session.

- Đề xuất state theo feature:
1. Chat:
  - local: input text, typing state, mode tab.
  - server: sessions/messages.
2. Flashcard:
  - local: current index, drag state, flip state.
  - server: decks/cards/review updates.
3. Quiz:
  - local: selected option, timer, feedback visibility.
  - server: quiz data, attempt submit result.
4. Onboarding:
  - local: step index + selected options.
  - server: submit onboarding payload.

- Không cần Redux ở MVP trừ khi state cross-feature phình lớn.

## 9. Interaction Design (events)

### Chat
1. `onSendMessage`
2. `onSwitchMode`
3. `onClickExplainMore`
4. `onQuickCreateFlashcards`
5. `onQuickCreateQuiz`

### Roleplay
1. `onSelectQuickReply`
2. `onSendRoleplayReply`
3. `onRoleplayStepAdvance`

### Flashcard Study
1. `onFlipCard`
2. `onSwipeLeft` (don't know)
3. `onSwipeRight` (know)
4. `onRestartStudy`

### Quiz
1. `onSelectAnswer`
2. `onSubmitQuestion`
3. `onNextQuestion`
4. `onFinishQuiz`
5. `onRetryQuiz`

### Onboarding
1. `onSelectOption`
2. `onNextStep`
3. `onPrevStep`
4. `onSkipOnboarding`
5. `onFinishOnboarding`

## 10. Routing Structure (Next.js)

- Theo yêu cầu:
1. `/`
2. `/login`
3. `/onboarding`
4. `/dashboard`
5. `/chat`
6. `/roleplay`
7. `/flashcards`
8. `/quiz`
9. `/profile`

- Route mở rộng từ HTML hiện có (vẫn trong scope mẫu UI):
1. `/flashcards/study`
2. `/quiz/result`
3. `/admin`

Assumption needed:
- `/chat` là Knowledge mode mặc định, `/roleplay` là route riêng hoặc cùng page với mode switch.

## 11. Data Flow Design

Luồng chuẩn:
1. UI event
2. local state update (optimistic nếu phù hợp)
3. API call
4. backend xử lý + AI (nếu có)
5. response về frontend
6. server state update
7. re-render UI

Ví dụ:
- Chat: `send` -> `/chat/message` -> AI response -> lưu message -> render bubble.
- Flashcard swipe: `swipe` -> `/flashcards/:id/swipe` -> update review -> update progress UI.
- Quiz submit: `submit` -> `/quizzes/:id/submit` -> score/weak topics -> render result panel.

## 12. Suggested Folder Structure

```txt
app/frontend/src
  /app                    # Next.js app routes (hoặc pages nếu dùng pages router)
    /(auth)
    /(main)
    /admin
  /components
    /ui                   # Button, Card, Badge, ProgressBar, Input...
    /layout               # MainLayout, AuthLayout, ChatLayout...
    /chat
    /flashcard
    /quiz
    /onboarding
    /dashboard
    /profile
    /admin
  /hooks                  # useChat, useFlashcardStudy, useQuizAttempt...
  /services               # API clients theo feature
  /lib                    # config, constants, helpers
  /types                  # TS types/interfaces
  /styles                 # global styles, tokens
```

## 13. Migration Plan from HTML -> React

### Step 1: Extract layout + design tokens
1. Tách `app container`, `bottom nav`, `card/button/input/progress` thành UI primitives.
2. Chuẩn hóa màu, radius, shadow, spacing thành token.

### Step 2: Convert static UI thành feature components
1. Map từng HTML page -> React page.
2. Tách section lặp lại thành components nhỏ.

### Step 3: Attach state & interactions
1. Gắn local state cho tab/step/swipe/quiz selection.
2. Gắn event handlers thay cho inline `onclick`.

### Step 4: Connect API layer
1. Thay mock dữ liệu bằng service calls.
2. Thêm loading/error/empty states chuẩn.

### Step 5: Integrate AI-driven actions
1. Chat send/receive.
2. Explain more.
3. Flashcard/quiz generate actions.
4. Validate response contract trước khi render.

### Step 6: Polish responsive + consistency check
1. Kiểm tra mobile-first trên các page chính.
2. Đồng bộ spacing/typography/interaction giữa các page.

Need clarification:
- Prototype hiện dùng nhiều icon ký tự đặc biệt bị lỗi encoding; cần xác nhận bộ icon chính thức (emoji, SVG, hay icon library).
