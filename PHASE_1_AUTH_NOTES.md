# PHASE 1 AUTH NOTES — Runnable MVP

## Scope

- Refactor backend thành 2 services:
  - `app/backend/gateway`
  - `app/backend/auth-service`
- Mục tiêu: chạy local thành công, không Docker, không DB.

## Architecture Decision (MVP-first)

- **Gateway + Auth tách riêng** để đúng microservices shape ngay từ MVP.
- **In-memory users (`users=[]`)** để bỏ chi phí setup DB, tăng tốc độ ship.
- **JWT mock với secret hardcode** để validate luồng auth end-to-end.
- **CommonJS (`require/module.exports`)** để đồng bộ với codebase backend hiện có.

## Auth Service Implementation

### Stack
- Express.js
- jsonwebtoken
- CommonJS

### Structure

- `src/server.js`
- `src/routes/auth.routes.js`
- `src/controllers/auth.controller.js`
- `src/services/auth.service.js`

### APIs
- `GET /health`
- `POST /signup`
- `POST /login`

### Validation
- Email required
- Password required
- Reject duplicate email on signup

## Gateway Implementation

### Stack
- Express.js
- http-proxy-middleware

### Route Proxy
- `/api/auth/*` -> `auth-service`

### Health
- `GET /health`

## Test Coverage (MVP sample)

- Health check (`GET /health`)
- Signup success (`POST /signup`)
- Signup duplicate email (`POST /signup` returns 409)
- Login success (`POST /login` returns token)

## Config Files Added

- `app/backend/package.json` (workspaces + scripts)
- `app/backend/.eslintrc.js`
- `app/backend/jest.config.js`
- `app/backend/.gitignore`
- `app/backend/.env.example`
- `app/backend/README.md`

## Dependencies

### auth-service
- express
- cors
- dotenv
- jsonwebtoken
- jest
- supertest
- nodemon
- eslint + airbnb-base

### gateway
- express
- cors
- dotenv
- http-proxy-middleware
- jest
- supertest
- nodemon
- eslint + airbnb-base

### root backend
- concurrently

## Issues and Fixes

1. ESLint dependency conflict (`eslint@10` vs `airbnb-base@15`)
- Fix: downgrade ESLint to `^8.57.0`.

2. Jest config path failed in workspaces
- Fix: use `--config ../jest.config.js` in each workspace.

3. JSON parse failure from BOM-encoded package.json
- Fix: rewrite package files using UTF-8 without BOM.

4. Gateway POST proxy timeout
- Root cause: request body consumed before proxy forwarding.
- Fix: add `fixRequestBody` in proxy `on.proxyReq`.

## Final Status

- `npm install` ✅
- `npm test` ✅
- `npm run lint` ✅ (warnings only for `console`)
- `npm run dev` ✅
- End-to-end auth via gateway ✅

## Next Phase Suggestions

- Add refresh token + logout
- Replace in-memory store with DB
- Move JWT secret to environment secret manager
- Add integration tests for gateway-auth contracts
