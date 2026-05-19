# Requirements Document

## Introduction

This feature connects all existing frontend UI pages to their corresponding backend APIs through the API Gateway (port 5000). Currently, most pages use hardcoded mock data or local state only. The goal is to establish a shared API client, authentication context, protected routes, and replace all mock data hooks/imports with real API calls so the application functions end-to-end.

## Glossary

- **API_Client**: A centralized HTTP utility module that handles base URL configuration, request/response interceptors, and automatic attachment of authentication headers for all outgoing API requests
- **Auth_Context**: A React context provider that manages user authentication state (token, user profile), exposes login/logout/signup actions, and persists session data across page reloads
- **Gateway**: The backend API Gateway service running on port 5000 that proxies requests to individual microservices
- **Auth_Service**: The backend authentication microservice (port 5001) handling signup and login, returning JWT tokens
- **Chat_Service**: The backend AI chat microservice (port 5002) handling conversation creation and message exchange
- **Flashcard_Service**: The backend flashcard microservice (port 3003) handling flashcard generation, history, stats, and review
- **Quiz_Service**: The backend quiz microservice (port 5004) handling quiz generation, retrieval, and submission
- **Protected_Route**: A route wrapper component that redirects unauthenticated users to the login page
- **Onboarding_Preferences**: The user selections made during onboarding (level, exam, goals, topics) that are persisted to the backend

## Requirements

### Requirement 1: API Client Foundation

**User Story:** As a developer, I want a centralized API client module, so that all frontend pages use consistent base URL configuration, error handling, and authentication headers when communicating with the Gateway.

#### Acceptance Criteria

1. THE API_Client SHALL send all HTTP requests to the Gateway base URL configured via environment variable (VITE_API_BASE_URL)
2. WHEN a valid authentication token exists in storage, THE API_Client SHALL attach the token as a Bearer Authorization header to every outgoing request
3. WHEN an API response returns HTTP status 401, THE API_Client SHALL clear the stored authentication token and redirect the user to the login page
4. WHEN an API request fails due to a network error, THE API_Client SHALL return a structured error object containing the error message
5. THE API_Client SHALL provide methods for GET, POST, PATCH, and DELETE HTTP verbs

### Requirement 2: Authentication Context and State Management

**User Story:** As a user, I want my login session to persist across page reloads, so that I do not need to log in again every time I refresh the browser.

#### Acceptance Criteria

1. THE Auth_Context SHALL store the JWT token and user profile object in localStorage upon successful login or signup
2. WHEN the application loads, THE Auth_Context SHALL check localStorage for an existing token and restore the authenticated state
3. THE Auth_Context SHALL expose the current user object, authentication status, login function, signup function, and logout function to all child components
4. WHEN the logout function is called, THE Auth_Context SHALL remove the token and user data from localStorage and reset the authentication state to unauthenticated
5. WHEN the stored token is cleared due to a 401 response, THE Auth_Context SHALL update the authentication state to unauthenticated

### Requirement 3: User Signup

**User Story:** As a new user, I want to create an account with my name, email, and password, so that I can access personalized learning features.

#### Acceptance Criteria

1. WHEN the user submits the signup form with valid name, email, and password, THE Auth_Context SHALL send a POST request to /api/auth/signup with the form data
2. WHEN the Auth_Service returns a successful signup response, THE Auth_Context SHALL store the user data and navigate the user to the onboarding page
3. IF the Auth_Service returns a 409 conflict error, THEN THE AuthPage SHALL display the message "Email already registered"
4. IF the Auth_Service returns a 400 validation error, THEN THE AuthPage SHALL display the validation error message from the response

### Requirement 4: User Login

**User Story:** As a returning user, I want to log in with my email and password, so that I can access my saved progress and data.

#### Acceptance Criteria

1. WHEN the user submits the login form with valid email and password, THE Auth_Context SHALL send a POST request to /api/auth/login with the credentials
2. WHEN the Auth_Service returns a successful login response with a token and user object, THE Auth_Context SHALL store the token and user data and navigate the user to the dashboard page
3. IF the Auth_Service returns a 401 unauthorized error, THEN THE AuthPage SHALL display the message "Invalid email or password"
4. IF the Auth_Service returns a 400 validation error, THEN THE AuthPage SHALL display the validation error message from the response

### Requirement 5: Protected Routes

**User Story:** As a product owner, I want unauthenticated users to be redirected to the login page when accessing protected pages, so that only logged-in users can access app features.

#### Acceptance Criteria

1. WHEN an unauthenticated user navigates to a protected route, THE Protected_Route SHALL redirect the user to the /login page
2. WHILE the user is authenticated, THE Protected_Route SHALL render the requested page component
3. THE Protected_Route SHALL wrap the following routes: /onboarding, /dashboard, /chat, /roleplay, /flashcards, /flashcards/study, /quiz, /quiz/result, /profile, /admin

### Requirement 6: Onboarding Preferences Persistence

**User Story:** As a new user, I want my onboarding selections (level, exam, goals, topics) to be saved to the backend, so that the app can personalize my learning experience.

#### Acceptance Criteria

1. WHEN the user completes the onboarding flow and clicks Finish, THE OnboardingPage SHALL send a POST request to /api/auth/profile with the selected level, exam, goals, and topics
2. WHEN the profile update request succeeds, THE OnboardingPage SHALL navigate the user to the dashboard page
3. IF the profile update request fails, THEN THE OnboardingPage SHALL display an error message and allow the user to retry
4. WHEN the user clicks Skip during onboarding, THE OnboardingPage SHALL navigate to the dashboard without sending a profile update request

### Requirement 7: Dashboard Real Data

**User Story:** As a user, I want the dashboard to display my actual learning statistics and recent activity, so that I can track my real progress.

#### Acceptance Criteria

1. WHEN the dashboard page loads, THE DashboardPage SHALL fetch user statistics from /api/flashcards/stats
2. WHEN the dashboard page loads, THE DashboardPage SHALL fetch recent flashcard decks from /api/flashcards/history
3. WHEN the API requests are in progress, THE DashboardPage SHALL display loading indicators in place of data
4. IF any dashboard API request fails, THEN THE DashboardPage SHALL display an error state with a retry option
5. THE DashboardPage SHALL display the authenticated user name from Auth_Context instead of the hardcoded name

### Requirement 8: AI Chat Integration

**User Story:** As a user, I want to have real conversations with the AI tutor, so that I can get personalized English learning assistance.

#### Acceptance Criteria

1. WHEN the user sends a message in the chat, THE ChatPage SHALL send a POST request to /api/chat with the message text and conversation context
2. WHEN the Chat_Service returns a response, THE ChatPage SHALL display the AI response in the message list
3. WHEN the chat page loads, THE ChatPage SHALL fetch the list of previous conversations from /api/chat/conversations
4. WHEN the user selects a previous conversation, THE ChatPage SHALL fetch the conversation messages from /api/chat/conversations/:id
5. WHILE the AI response is being generated, THE ChatPage SHALL display a typing indicator
6. IF the chat API request fails, THEN THE ChatPage SHALL display an error message and allow the user to resend

### Requirement 9: Quiz Integration

**User Story:** As a user, I want to take quizzes generated from my learning content, so that I can test my knowledge with real questions.

#### Acceptance Criteria

1. WHEN the quiz page loads, THE QuizPage SHALL send a POST request to /api/quizzes/generate to create a new quiz
2. WHEN the Quiz_Service returns generated questions, THE QuizPage SHALL display the questions using the same interactive UI
3. WHEN the user completes the quiz and clicks Finish, THE QuizPage SHALL send a POST request to /api/quizzes/:id/submit with the user answers
4. WHEN the quiz submission response is received, THE QuizPage SHALL navigate to the result page with the score and weak topics from the response
5. IF the quiz generation request fails, THEN THE QuizPage SHALL display an error message with a retry option

### Requirement 10: Flashcard Library Real Data

**User Story:** As a user, I want the flashcard library to show my actual flashcard decks and progress, so that I can manage my real learning materials.

#### Acceptance Criteria

1. WHEN the flashcard library page loads, THE FlashcardLibraryPage SHALL fetch deck data from /api/flashcards/history
2. WHEN the API request is in progress, THE FlashcardLibraryPage SHALL display a loading indicator
3. IF the flashcard history request fails, THEN THE FlashcardLibraryPage SHALL display an error state with a retry option
4. THE FlashcardLibraryPage SHALL replace all mock data imports with data fetched from the API

### Requirement 11: Profile Page Real Data

**User Story:** As a user, I want my profile page to display my actual learning statistics and preferences, so that I can see my real progress.

#### Acceptance Criteria

1. WHEN the profile page loads, THE ProfilePage SHALL fetch user profile data from Auth_Context and learning statistics from /api/flashcards/stats
2. WHEN the API request is in progress, THE ProfilePage SHALL display a loading indicator
3. IF the statistics request fails, THEN THE ProfilePage SHALL display an error state with a retry option
4. THE ProfilePage SHALL display the authenticated user name and preferences from Auth_Context instead of mock data

### Requirement 12: Loading and Error States

**User Story:** As a user, I want clear feedback when data is loading or when errors occur, so that I understand the current state of the application.

#### Acceptance Criteria

1. WHILE an API request is in progress, THE API_Client SHALL enable consuming components to display a loading state
2. WHEN an API request fails, THE API_Client SHALL return a structured error containing the HTTP status code and error message
3. THE DashboardPage, ChatPage, QuizPage, FlashcardLibraryPage, and ProfilePage SHALL each display a contextual error message when their respective API calls fail
4. THE DashboardPage, ChatPage, QuizPage, FlashcardLibraryPage, and ProfilePage SHALL each provide a retry mechanism to re-attempt failed API calls
