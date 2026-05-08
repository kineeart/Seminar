# Phase 1 Authentication Notes — MVP

## Scope

- Express.js auth-service
- In-memory users array
- JWT login with hardcoded secret
- Gateway proxy route `/api/auth -> auth-service`

## API

### Auth Service
- `GET /health`
- `POST /signup`
- `POST /login`

### Gateway
- `GET /health`
- `POST /api/auth/signup`
- `POST /api/auth/login`

## Reasoning

- **No database**: MVP ưu tiên chạy thật nhanh, không thêm tầng persistence sớm.
- **In-memory store**: giảm thời gian setup, phù hợp demo local.
- **JWT mock**: cho phép test luồng auth end-to-end mà không cần infra phức tạp.
- **Gateway proxy**: giữ kiến trúc microservices tối giản nhưng vẫn có điểm vào thống nhất.
- **CommonJS**: đồng bộ với backend hiện tại để giảm migration cost.

## Files created

- `gateway/package.json`
- `gateway/src/server.js`
- `gateway/src/gateway.test.js`
- `auth-service/package.json`
- `auth-service/src/server.js`
- `auth-service/src/routes/auth.routes.js`
- `auth-service/src/controllers/auth.controller.js`
- `auth-service/src/services/auth.service.js`
- `auth-service/src/auth.test.js`
- `README.md`
- `.env.example`
- `.gitignore`

## Expected local flow

1. `npm install`
2. `npm run dev`
3. Open gateway at `http://localhost:5000`
4. Hit `POST /api/auth/signup`
5. Hit `POST /api/auth/login`

## Next step after MVP

- Replace in-memory users with real DB
- Move JWT secret to environment-managed secret store
- Add refresh token flow
