---
name: run-brainly
description: Launch and smoke-test the Brainly app (Express/Mongoose backend + Vite/React frontend) in this repo. Use whenever asked to run, start, preview, or verify Brainly end to end.
---

# Running Brainly

Two independent processes: an Express API (`backend/`, port 5000) and a Vite React SPA (`frontend/`, port 5173). Neither has a watch/nodemon dev mode on the backend — `npm run dev` there is just `build && start` once.

## 1. Database

`backend/.env`'s `MONGO_URI` normally points at a MongoDB Atlas cluster. **If there's no outbound internet (sandboxed/offline environment), Atlas will fail to resolve/connect.** You don't need to edit `.env`: with `NODE_ENV=development` (the default), `backend/src/config/db.ts` automatically retries `mongodb://127.0.0.1:27017/brainly` after an Atlas failure — you just need a local `mongod` listening there first.

Check if MongoDB is already reachable before starting one:
```bash
mongosh --quiet --eval "db.version()" mongodb://127.0.0.1:27017 2>&1 || echo "not running"
```

If not running and `mongod` is installed locally:
```bash
mkdir -p /tmp/brainly-mongo
mongod --dbpath /tmp/brainly-mongo --port 27017 --bind_ip 127.0.0.1 \
  --logpath /tmp/brainly-mongo/mongod.log --fork
```
(`--fork` daemonizes it; check `/tmp/brainly-mongo/mongod.log` for `"Waiting for connections"` to confirm it's up.)

If `mongod` isn't installed and there's real internet access, the configured Atlas URI should just work — skip this section.

## 2. Backend

```bash
cd backend
npm install        # first run only
npm run build       # tsc -b -> dist/
npm run start > /tmp/brainly-backend.log 2>&1 &
disown
```

Confirm it's up (Atlas-first connection attempt + fallback can take several seconds — poll, don't fixed-sleep):
```bash
timeout 20 bash -c 'until grep -q "Server running" /tmp/brainly-backend.log 2>/dev/null; do sleep 1; done'
cat /tmp/brainly-backend.log
```
Expected tail: `MongoDB connected (...)` then `Server running in development mode on port 5000`. If you instead see two `MongoDB connection failed` lines followed by a stack trace and the process exits, neither Atlas nor local Mongo was reachable — go back to step 1.

Smoke-test with a real request (there's no root `/api/v1/` route, so hit a real endpoint):
```bash
curl -sS -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"smoketest","email":"smoketest@example.com","password":"password123"}' \
  -w "\nHTTP %{http_code}\n"
```
Expect `HTTP 201` and a JSON body with `data.token`. A 400 with a Zod `errors` array means the payload shape changed — check `backend/src/routes/auth.routes.ts`. Re-running with the same email/username correctly returns a 500 ("User with this email or username already exists") since there's no idempotency handling — use a fresh email if you re-run this.

## 3. Frontend

```bash
cd frontend
npm install        # first run only
npm run dev > /tmp/brainly-frontend.log 2>&1 &
disown
```

Poll for readiness instead of sleeping:
```bash
timeout 20 bash -c 'until curl -sf http://localhost:5173/ >/dev/null; do sleep 1; done'
```

`VITE_BACKEND_URL` (frontend/.env) must point at the running backend (default `http://localhost:5000/api/v1`) — CORS on the backend is hardcoded to accept `http://localhost:5173` and `http://127.0.0.1:5173` only (see `backend/src/app.ts`), so don't run the frontend on a different port without also editing that CORS list.

## 4. Visually verify (headless browser)

No `chromium-cli`/Playwright is installed in this repo by default. `google-chrome` is available system-wide for a one-shot screenshot:
```bash
google-chrome --headless=new --disable-gpu --no-sandbox \
  --screenshot=/tmp/brainly-screenshot.png --window-size=1280,900 \
  --virtual-time-budget=5000 http://localhost:5173/
```
Then `Read` `/tmp/brainly-screenshot.png`. Unauthenticated, you should land on the "Welcome back" sign-in page (`/dashboard` redirects to `/signin` when `isAuthenticated` is false). To see the authenticated dashboard, sign up via curl (step 2) to get a token, then drive the browser through the actual signup/signin form — `localStorage` is per-browser-profile, so a token obtained via curl doesn't transfer to the browser session automatically.

## Stopping

```bash
lsof -ti:5000 -sTCP:LISTEN | xargs -r kill   # backend
lsof -ti:5173 -sTCP:LISTEN | xargs -r kill   # frontend
```
Kill by port, not `pkill -f node`/`pkill -f vite` — those patterns can match unrelated processes (including the agent's own session).

If you started a local `mongod` for this session and want to tear it down too: find its PID via `cat /tmp/brainly-mongo/mongod.log | grep forked` or `lsof -ti:27017 -sTCP:LISTEN`, then `kill` it. Leave it running if other work in the session still needs the database.
