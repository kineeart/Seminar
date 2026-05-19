# Design Document

## Overview

This design connects all frontend pages to the backend microservices through the existing API Gateway. The architecture introduces a centralized API client, an authentication context provider, protected route wrappers, and replaces all mock data hooks/imports with real API-backed hooks.

The Vite dev server already proxies `/api` requests to `localhost:5000` (the Gateway), so no additional proxy configuration is needed during development.

## Architecture

### Component Hierarchy

```
main.jsx
└── BrowserRouter
    └── AuthProvider (NEW)
        └── App
            └── Routes
                ├── /login → AuthPage
                ├── /landing → LandingPage
                └── ProtectedRoute (NEW)
                    ├── /onboarding → OnboardingPage
                    ├── /dashboard → DashboardPage
                    ├── /chat → ChatPage
                    ├── /roleplay → RoleplayPage
                    ├── /flashcards → FlashcardLibraryPage
                    ├── /flashcards/study → FlashcardStudyPage
                    ├── /quiz → QuizPage
                    ├── /quiz/result → QuizResultPage
                    ├── /profile → ProfilePage
                    └── /admin → AdminPage
```

### New Files to Create

```
src/
├── lib/
│   └── apiClient.js          # Centralized fetch wrapper
├── contexts/
│   └── AuthContext.jsx        # Auth state provider + hook
├── components/
│   └── ProtectedRoute.jsx     # Route guard component
└── hooks/
    ├── useAuth.js             # Re-export of useAuthContext for convenience
    ├── useChat.js             # Replaces useChatDemo.js
    ├── useQuiz.js             # Replaces useQuizDemo.js
    ├── useDashboard.js        # New hook for dashboard data
    ├── useProfile.js          # New hook for profile data
    └── useFlashcardLibrary.js # New hook for flashcard library data
```

### Files to Modify

```
src/main.jsx                   # Wrap App with AuthProvider
src/App.jsx                    # Add ProtectedRoute wrappers
src/pages/AuthPage.jsx         # Use Auth context for login/signup
src/pages/OnboardingPage.jsx   # POST preferences on finish
src/pages/DashboardPage.jsx    # Use useDashboard hook
src/pages/ChatPage.jsx         # Use useChat hook
src/pages/QuizPage.jsx         # Use useQuiz hook
src/pages/FlashcardLibraryPage.jsx  # Use useFlashcardLibrary hook
src/pages/ProfilePage.jsx      # Use useProfile hook
src/hooks/useOnboardingDemo.js # Rename/refactor to persist data
```

---

## Detailed Design

### 1. API Client (`src/lib/apiClient.js`)

A lightweight fetch wrapper (no external dependencies like axios needed).

```javascript
const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function request(method, path, body = null) {
  const token = localStorage.getItem('auth_token')
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const options = { method, headers }
  if (body) options.body = JSON.stringify(body)

  const response = await fetch(`${BASE_URL}${path}`, options)

  if (response.status === 401) {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    window.location.href = '/login'
    return { error: true, status: 401, message: 'Session expired' }
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    return { error: true, status: response.status, message: data?.message || 'Request failed' }
  }

  return { error: false, data }
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
}
```

**Design decisions:**
- Uses native `fetch` — no new dependencies needed
- BASE_URL defaults to empty string since Vite proxy handles `/api` routing in dev
- 401 handling is centralized — clears token and redirects
- Returns `{ error, data }` or `{ error, status, message }` for consistent consumption

### 2. Auth Context (`src/contexts/AuthContext.jsx`)

```javascript
// Provides: user, token, isAuthenticated, login(), signup(), logout(), loading
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../lib/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    const result = await api.post('/api/auth/login', { email, password })
    if (result.error) return result
    localStorage.setItem('auth_token', result.data.token)
    localStorage.setItem('auth_user', JSON.stringify(result.data.user))
    setToken(result.data.token)
    setUser(result.data.user)
    return result
  }, [])

  const signup = useCallback(async (name, email, password) => {
    const result = await api.post('/api/auth/signup', { name, email, password })
    if (result.error) return result
    localStorage.setItem('auth_user', JSON.stringify(result.data.user))
    setUser(result.data.user)
    return result
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setToken(null)
    setUser(null)
  }, [])

  const value = { user, token, isAuthenticated: !!token, loading, login, signup, logout }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

**Design decisions:**
- Signup does NOT return a token (backend signup response only returns user data, no token) — user must login after signup
- Loading state prevents flash of login page on refresh
- useAuth hook throws if used outside provider for clear error messages

### 3. Protected Route (`src/components/ProtectedRoute.jsx`)

```javascript
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null // or a spinner
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}
```

### 4. App.jsx Changes

Wrap protected routes with `<ProtectedRoute>`:

```jsx
<Routes>
  <Route path="/" element={<Navigate replace to="/landing" />} />
  <Route path="/landing" element={<LandingPage />} />
  <Route path="/login" element={<AuthPage />} />
  <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
  {/* ... all other protected routes */}
</Routes>
```

### 5. AuthPage Integration

Replace the current `submit` handler:
- Call `login(email, password)` or `signup(name, email, password)` from useAuth
- Display error messages from API response
- Navigate on success (login → /dashboard, signup → /onboarding)

### 6. Onboarding Integration

Modify `useOnboardingDemo.js` → refactor `finish()`:
- POST to `/api/auth/profile` with `{ level, exam, goals, topics }`
- On success: navigate to `/dashboard`
- On failure: show error, allow retry
- Skip still navigates directly without API call

### 7. Dashboard Hook (`src/hooks/useDashboard.js`)

```javascript
// Fetches from /api/flashcards/stats and /api/flashcards/history
// Returns: { stats, recentDecks, loading, error, retry }
```

### 8. Chat Hook (`src/hooks/useChat.js`)

```javascript
// Replaces useChatDemo
// - POST /api/chat for sending messages
// - GET /api/chat/conversations for listing
// - GET /api/chat/conversations/:id for loading a conversation
// Returns: { messages, conversations, input, setInput, isTyping, send, loadConversation, error }
```

### 9. Quiz Hook (`src/hooks/useQuiz.js`)

```javascript
// Replaces useQuizDemo
// - POST /api/quizzes/generate on mount
// - POST /api/quizzes/:id/submit on finish
// Returns: { questions, currentIndex, selected, setSelected, next, finish, loading, error, retry }
```

### 10. Flashcard Library Hook (`src/hooks/useFlashcardLibrary.js`)

```javascript
// - GET /api/flashcards/history
// Returns: { decks, loading, error, retry }
```

### 11. Profile Hook (`src/hooks/useProfile.js`)

```javascript
// - GET /api/flashcards/stats for learning stats
// - User data from AuthContext
// Returns: { user, stats, loading, error, retry }
```

---

## API Endpoint Mapping

| Frontend Action | Method | Gateway Path | Backend Service |
|---|---|---|---|
| Signup | POST | /api/auth/signup | Auth Service |
| Login | POST | /api/auth/login | Auth Service |
| Save onboarding | POST | /api/auth/profile | Auth Service |
| Get flashcard stats | GET | /api/flashcards/stats | Flashcard Service |
| Get flashcard history | GET | /api/flashcards/history | Flashcard Service |
| Generate flashcards | POST | /api/flashcards/generate | Flashcard Service |
| Mark reviewed | POST | /api/flashcards/:id/review | Flashcard Service |
| Send chat message | POST | /api/chat | Chat Service |
| List conversations | GET | /api/chat/conversations | Chat Service |
| Get conversation | GET | /api/chat/conversations/:id | Chat Service |
| Generate quiz | POST | /api/quizzes/generate | Quiz Service |
| Get quiz | GET | /api/quizzes/:id | Quiz Service |
| Submit quiz | POST | /api/quizzes/:id/submit | Quiz Service |

---

## Error Handling Strategy

Each page follows a consistent pattern:

```jsx
function SomePage() {
  const { data, loading, error, retry } = useSomeHook()

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={retry} />
  return <ActualContent data={data} />
}
```

Error states show:
- The error message from the API
- A "Try again" button that re-triggers the fetch

---

## State Management Approach

- **Auth state**: React Context (AuthContext) — global, persisted to localStorage
- **Page data**: Local state within custom hooks — fetched on mount, no global cache
- **Form state**: Local component state (useState) — same as current pattern

No external state management library (Redux, Zustand) is introduced. The app is simple enough that Context + local hooks suffice.

---

## Testing Considerations

- API Client: Unit testable with mocked fetch
- Auth Context: Testable with render + mock API responses
- Hooks: Testable with React Testing Library's renderHook
- Integration: Manual testing against running backend services
