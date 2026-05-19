# Development Log

[2026-05-19]
Feature implemented: Shared API layer
API endpoints used: GET /health, GET /api/auth/health, GET /api/chat/health, GET /api/content/health, GET /api/flashcards/health, GET /api/quizzes/health
Bugs encountered: direct auth calls were bypassing the gateway requirement
Fix applied: centralized requests in api.js and routed protected traffic through the gateway
Result: dashboard now uses one gateway base URL for normal API calls

[2026-05-19]
Feature implemented: Admin login
API endpoints used: POST /api/auth/signup, POST /api/auth/login
Bugs encountered: login initially failed until the demo admin account existed
Fix applied: added a login/signup UI and stored JWT in localStorage after login
Result: auth flow redirects to admin.html after successful login

[2026-05-19]
Feature implemented: System dashboard monitor
API endpoints used: GET /health, GET /api/auth/health, GET /api/chat/health, GET /api/content/health, GET /api/flashcards/health, GET /api/quizzes/health
Bugs encountered: optional services could fail and previously would have broken the UI
Fix applied: treated flashcards and quizzes as optional and rendered DOWN safely when unavailable
Result: dashboard shows live status badges and last checked timestamp

[2026-05-19]
Feature implemented: Chat admin panel
API endpoints used: POST /api/chat
Bugs encountered: the old UI had only static sample content
Fix applied: wired the form to the gateway chat endpoint and added local conversation memory
Result: chat returns real AI responses in the dashboard thread

[2026-05-19]
Feature implemented: Gateway-based admin auth
API endpoints used: POST /api/auth/signup, POST /api/auth/login
Bugs encountered: the login screen copy still described direct auth access after the gateway routing change
Fix applied: switched auth.js to gateway requests only and updated the login copy to match the final flow
Result: login remains gateway-driven and the UI documentation now matches the runtime behavior
