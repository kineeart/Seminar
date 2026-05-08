# AI Tutor English Learning System — Phase 0 Setup Guide

## Overview

This guide covers **Phase 0: Setup & Infrastructure** for the MVP, focusing on lightweight, cloud-based CI/CD without Docker.

**Technology Stack (MVP)**:
- **Frontend**: React + Vite
- **Backend**: Express.js (Node.js)
- **Testing**: Jest
- **Linting**: ESLint
- **CI/CD**: GitHub Actions

---

## Local Development Setup

### Prerequisites

- **Node.js**: 18.x or 20.x (install from [nodejs.org](https://nodejs.org))
- **npm**: Included with Node.js
- **Git**: For version control

### Installation

**1. Clone repository**
```bash
git clone <your-repo-url>
cd 2026-2027_SeminarChuyenDe_VibeCoding
```

**2. Install frontend dependencies**
```bash
cd app/frontend
npm install
```

**3. Install backend dependencies**
```bash
cd ../backend
npm install
```

---

## Running Applications Locally

### Frontend Development Server

```bash
cd app/frontend
npm run dev
```

- Opens at `http://localhost:5173` (default Vite port)
- Hot Module Reload (HMR) enabled
- Changes auto-refresh in browser

### Frontend Build

```bash
cd app/frontend
npm run build
```

- Builds optimized production bundle into `dist/`
- Output is ready for deployment

### Frontend Linting

```bash
cd app/frontend
npm run lint
```

- Runs ESLint to check code quality
- Shows warnings and errors
- Fix many issues automatically (optional): `npm run lint -- --fix`

---

### Backend Development Server

```bash
cd app/backend
npm run dev
```

- Starts server on `http://localhost:5000` (default)
- Uses `nodemon` for auto-reload on file changes
- Logs: `Server running on port 5000`

**Test the backend**:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "flashcard-backend",
  "timestamp": "2026-05-16T10:00:00.000Z"
}
```

### Backend Testing

```bash
cd app/backend
npm test
```

- Runs all tests in `src/**/*.test.js`
- Generates coverage report in `coverage/`
- Use `npm run test:watch` for watch mode

### Backend Linting

```bash
cd app/backend
npm run lint
```

- Runs ESLint to check syntax and code style
- Follows Airbnb style guide
- Fix issues: `npm run lint -- --fix`

---

## Running Full Local Stack

**Option 1: Run in separate terminals**
- Terminal 1: `cd app/frontend && npm run dev`
- Terminal 2: `cd app/backend && npm run dev`
- Terminal 3 (optional): `cd app/backend && npm run test:watch`

**Option 2: Use npm workspaces (future)**
- When scaled, consider `npm workspaces` for root-level script management.

---

## GitHub Actions CI/CD

### How it Works

1. **Trigger**: Workflows run on `push` or `pull_request` to `main` or `develop` branches
2. **Path filters**: Only run if relevant code changed (e.g., frontend workflow runs only if `app/frontend/` changed)
3. **Matrix testing**: Tests against Node.js 18.x and 20.x in parallel

### Frontend Workflow (`.github/workflows/frontend.yml`)

**Runs**:
- ESLint code quality checks
- Vite production build

**Status**: ✅ Green = ready to merge

**Check details**:
1. Go to repo → **Actions** tab
2. Click latest **Frontend CI** run
3. Expand job steps to see lint/build output

**If it fails**:
- Check lint errors: `npm run lint` locally
- Check build errors: `npm run build` locally
- Fix, commit, push to update PR

### Backend Workflow (`.github/workflows/backend.yml`)

**Runs**:
- ESLint syntax & style checks
- Jest unit tests with coverage
- Tests against Node.js 18.x and 20.x

**Status**: ✅ Green = all tests pass

**Check details**:
1. Go to repo → **Actions** tab
2. Click latest **Backend CI** run
3. Expand **Run tests** step to see Jest output
4. Download **backend-coverage** artifact to review coverage report

**If it fails**:
- Check lint errors: `npm run lint` locally
- Check test failures: `npm run test` locally
- Fix, commit, push

### Pull Request Integration

When you open a PR:
- Workflows run automatically
- Status checks appear at bottom of PR
- ❌ Red = must fix before merge
- ✅ Green = ready to review & merge

**Example PR status**:
```
✅ Frontend CI / build — all checks passed
✅ Backend CI / test-and-lint — all checks passed
→ Ready to merge (with code review approval)
```

---

## Workflow Output & Artifacts

### Viewing Logs

**Frontend build**:
```
$ npm run build
  vite build
  ✓ built in 1.23s.
  dist/ is ready.
```

**Backend tests**:
```
$ npm test
  PASS  src/server.test.js
    Backend Health Check
      ✓ should export app (2ms)
      ✓ should validate health (1ms)
  Test Suites: 1 passed, 1 total
  Tests:       2 passed, 2 total
  Coverage:    60% lines, 50% branches, 80% functions
```

### Artifacts

- **Frontend**: Build artifacts (`dist/`) uploaded for 5 days
- **Backend**: Coverage reports uploaded for 5 days (if tests run)

Access via Actions → Run details → **Artifacts** section.

---

## Environment Variables

### Frontend

**File**: `app/frontend/.env` (gitignored, create from example if needed)

```env
VITE_API_BASE_URL=http://localhost:5000
```

Reference in code:
```javascript
const apiBase = import.meta.env.VITE_API_BASE_URL;
```

### Backend

**File**: `app/backend/.env` (gitignored, create from example if needed)

```env
PORT=5000
NODE_ENV=development
```

Reference in code:
```javascript
const port = process.env.PORT || 5000;
```

---

## Troubleshooting

### "Port already in use"

```bash
# Check what's using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process (example PID 1234)
kill -9 1234  # macOS/Linux
taskkill /PID 1234 /F  # Windows
```

### "npm install" fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### GitHub Actions not triggering

1. Ensure branch is `main` or `develop`
2. Check workflow YAML syntax (`.yml` must be valid)
3. Verify paths filter matches your changes
4. Review Actions tab for error messages

---

## Next Steps (Phase 1+)

- **Phase 1**: Add Auth Service (separate Node.js service, JWT)
- **Phase 2**: Add AI Chat Service + Worker
- **Phase 3+**: Add Flashcard, Quiz, Content services
- **Later**: Migrate to Docker + Kubernetes when scale increases

For roadmap details, see [IMPLEMENTATION_ROADMAP.md](../../IMPLEMENTATION_ROADMAP.md).

---

## Key Files

- `.github/workflows/frontend.yml` — Frontend CI
- `.github/workflows/backend.yml` — Backend CI
- `app/frontend/package.json` — Frontend dependencies & scripts
- `app/backend/package.json` — Backend dependencies & scripts
- `app/backend/jest.config.js` — Jest configuration
- `app/backend/.eslintrc.js` — ESLint configuration
- `app/backend/src/server.test.js` — Sample test file

---

## Resources

- [Node.js Docs](https://nodejs.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Jest Testing](https://jestjs.io/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

**Last Updated**: 2026-05-16  
**Version**: Phase 0 (MVP lightweight setup)  
**Status**: Ready for Phase 1 (Auth Service)
