# Tasks

## Task 1: Create API Client Module

- [ ] 1.1 Create `src/lib/apiClient.js` with fetch wrapper supporting GET, POST, PATCH, DELETE methods
- [ ] 1.2 Implement automatic Bearer token attachment from localStorage
- [ ] 1.3 Implement 401 response handling (clear token, redirect to /login)
- [ ] 1.4 Implement structured error return format `{ error, status, message }`
- [ ] 1.5 Add VITE_API_BASE_URL environment variable support (default to empty string for Vite proxy)

## Task 2: Create Authentication Context

- [ ] 2.1 Create `src/contexts/AuthContext.jsx` with AuthProvider and useAuth hook
- [ ] 2.2 Implement session restoration from localStorage on app mount
- [ ] 2.3 Implement login function that calls POST /api/auth/login and stores token + user
- [ ] 2.4 Implement signup function that calls POST /api/auth/signup and stores user data
- [ ] 2.5 Implement logout function that clears localStorage and resets state
- [ ] 2.6 Expose loading state to prevent flash of unauthenticated content

## Task 3: Create Protected Route Component

- [ ] 3.1 Create `src/components/ProtectedRoute.jsx` that checks isAuthenticated from AuthContext
- [ ] 3.2 Redirect unauthenticated users to /login using Navigate component
- [ ] 3.3 Show nothing (or spinner) while auth loading state is true

## Task 4: Wire Up Providers and Route Guards

- [ ] 4.1 Modify `src/main.jsx` to wrap App with AuthProvider
- [ ] 4.2 Modify `src/App.jsx` to wrap protected routes with ProtectedRoute component
- [ ] 4.3 Keep /landing and /login as public routes (no ProtectedRoute wrapper)

## Task 5: Integrate AuthPage with Backend

- [ ] 5.1 Import and use useAuth hook in AuthPage
- [ ] 5.2 Replace submit handler to call login() for login mode
- [ ] 5.3 Replace submit handler to call signup() for signup mode
- [ ] 5.4 Display API error messages (401 → "Invalid email or password", 409 → "Email already registered", 400 → validation message)
- [ ] 5.5 Navigate to /dashboard on successful login, /onboarding on successful signup
- [ ] 5.6 Add loading/disabled state to submit button during API call

## Task 6: Integrate Onboarding with Backend

- [ ] 6.1 Refactor `useOnboardingDemo.js` to accept auth context and API client
- [ ] 6.2 Modify finish() to POST preferences to /api/auth/profile with { level, exam, goals, topics }
- [ ] 6.3 Navigate to /dashboard on successful profile save
- [ ] 6.4 Display error message if profile save fails, allow retry
- [ ] 6.5 Keep skip() behavior unchanged (navigate without API call)

## Task 7: Create Dashboard Hook and Integrate

- [ ] 7.1 Create `src/hooks/useDashboard.js` that fetches /api/flashcards/stats and /api/flashcards/history
- [ ] 7.2 Return { stats, recentDecks, loading, error, retry } from the hook
- [ ] 7.3 Modify DashboardPage to use useDashboard hook instead of mock imports
- [ ] 7.4 Display authenticated user name from useAuth instead of hardcoded "Hao"
- [ ] 7.5 Add loading indicator while data is being fetched
- [ ] 7.6 Add error state with retry button when API calls fail

## Task 8: Create Chat Hook and Integrate

- [ ] 8.1 Create `src/hooks/useChat.js` with real API calls to /api/chat
- [ ] 8.2 Implement send() that POSTs message to /api/chat and appends AI response
- [ ] 8.3 Implement conversation list loading from GET /api/chat/conversations
- [ ] 8.4 Implement conversation loading from GET /api/chat/conversations/:id
- [ ] 8.5 Modify ChatPage to use useChat hook instead of useChatDemo
- [ ] 8.6 Add error handling with retry for failed messages
- [ ] 8.7 Maintain typing indicator while waiting for API response

## Task 9: Create Quiz Hook and Integrate

- [ ] 9.1 Create `src/hooks/useQuiz.js` that generates quiz via POST /api/quizzes/generate on mount
- [ ] 9.2 Implement submit() that POSTs answers to /api/quizzes/:id/submit
- [ ] 9.3 Modify QuizPage to use useQuiz hook instead of mock questions import
- [ ] 9.4 Navigate to /quiz/result with real score and weak topics from API response
- [ ] 9.5 Add loading state while quiz is being generated
- [ ] 9.6 Add error state with retry if quiz generation fails

## Task 10: Create Flashcard Library Hook and Integrate

- [ ] 10.1 Create `src/hooks/useFlashcardLibrary.js` that fetches /api/flashcards/history
- [ ] 10.2 Return { decks, loading, error, retry } from the hook
- [ ] 10.3 Modify FlashcardLibraryPage to use useFlashcardLibrary hook instead of mock imports
- [ ] 10.4 Add loading indicator while data is being fetched
- [ ] 10.5 Add error state with retry button when API call fails

## Task 11: Create Profile Hook and Integrate

- [ ] 11.1 Create `src/hooks/useProfile.js` that fetches /api/flashcards/stats and uses AuthContext for user data
- [ ] 11.2 Return { user, stats, loading, error, retry } from the hook
- [ ] 11.3 Modify ProfilePage to use useProfile hook instead of mock imports
- [ ] 11.4 Display real user name and preferences from auth context
- [ ] 11.5 Add loading indicator while stats are being fetched
- [ ] 11.6 Add error state with retry button when API call fails

## Task 12: Clean Up Mock Data Dependencies

- [ ] 12.1 Remove mock data imports from DashboardPage, ChatPage, QuizPage, FlashcardLibraryPage, ProfilePage
- [ ] 12.2 Verify that useChatDemo.js and useQuizDemo.js are no longer imported by any page
- [ ] 12.3 Optionally delete unused mock data files (src/data/mockDashboard.js, mockChat.js, mockQuiz.js, mockProfile.js, mockFlashcards.js) or keep for reference
- [ ] 12.4 Verify the app builds without errors after all changes (run `vite build`)
