# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Brainly ("Your Second Brain") is a personal knowledge-management app: users save links/notes tagged by type (twitter, youtube, article, link, document, thought) and can optionally publish a read-only public share page via a random hash URL, choosing per-item which content is public rather than all-or-nothing.

Two independent apps in one repo, no shared package/monorepo tooling (no Turborepo/Nx/workspaces):

- `backend/` — Express 5 + TypeScript + Mongoose (MongoDB) REST API
- `frontend/` — React 19 + TypeScript + Vite + Tailwind v4 SPA

Ignore the `package.json`, `package-lock.json`, `node_modules/`, and `tsconfig.tsbuildinfo` at the **repo root** — they are a stale leftover copy of `backend/package.json` with no corresponding `src/`, and are not wired into anything. Always run commands from inside `backend/` or `frontend/`.

## Commands

### Backend (`backend/`)
```bash
npm run build   # tsc -b -> backend/dist
npm run start   # node dist/index.js (must build first)
npm run dev      # build then start (NOT a watch mode — re-run after each change)
```
No lint or test scripts exist for the backend.

### Frontend (`frontend/`)
```bash
npm run dev       # vite dev server, http://localhost:5173
npm run build     # tsc -b && vite build
npm run lint       # oxlint
npm run preview   # preview a production build
```
No test scripts/framework exist for the frontend either (no Jest/Vitest configured).

### Running both together
Two separate processes, no root-level orchestrator script. Start backend first, then frontend:
```bash
cd backend && npm run build && npm run start &
cd frontend && npm run dev &
```
See `.claude/skills/run-brainly/SKILL.md` for the full launch/verify sequence, including the local-MongoDB fallback used when the Atlas cluster in `backend/.env` is unreachable (e.g. sandboxed/offline environments).

## Environment

- `backend/.env` (gitignored): `PORT`, `NODE_ENV`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`. See `backend/.env.example` for shape. All vars have hardcoded fallbacks in `backend/src/config/env.ts`, so the server boots even with an empty `.env`.
- `frontend/.env` (gitignored): `VITE_BACKEND_URL` (defaults to `http://localhost:5000/api/v1` in `frontend/src/services/api.ts` if unset).
- In development only (`NODE_ENV=development`), `backend/src/config/db.ts` automatically falls back from an `mongodb+srv://` Atlas URI to `mongodb://127.0.0.1:27017/brainly` if the Atlas connection fails. In any other `NODE_ENV`, a failed `MONGO_URI` connection is fatal (`process.exit(1)`).

## Architecture

### Backend request flow
`src/index.ts` calls `connectDB()` then `createApp()` (`src/app.ts`), which wires: CORS (origin locked to `http://localhost:5173`/`127.0.0.1:5173`, not `CORS_ORIGIN` from env) → `express.json()` → all routes mounted under `/api/v1` (`src/routes/index.ts`) → a single catch-all `errorHandler` middleware last.

Layering is Router → Controller → Service → Mongoose Model:
- `src/routes/*.routes.ts` — Zod request validation (`middlewares/validate.ts`, validates `{ body, query, params }`) and `authMiddleware` (JWT bearer, populates `req.user = { id, email }` — see the global `Express.Request` augmentation in `src/types/index.d.ts`).
- `src/controllers/*.controller.ts` — thin: pull req data, call the matching service, wrap the result with `ApiResponse.success/error` (`src/utils/apiResponse.ts`), `next(error)` on throw.
- `src/ services/*` and `src/ services/ content.service.ts` — **note the literal leading spaces in these two directory/file names** (`src/ services/`, not `src/services/`); imports use `../ services/...`. Business logic and all Mongoose calls live here.
- `src/models/` — `User`, `Content`, `Tag`, `BrainLink`. `Content.tags` is an array of `Tag` ObjectIds auto-created/upserted by title in `ContentService.createContent`. `password` on `User` is `select: false` (must `.select('+password')` to read it, as `AuthService.signin` does).

Errors are thrown as plain `Error` from services/controllers and turned into a JSON 500 by `errorHandler` (`src/utils/ logger.ts` — also has a leading space in its filename — logs the stack) by default — there's no `AppError`/status-carrying error class. Zod validation failures are caught by `validate` and returned directly as a 400, bypassing `errorHandler`. `AuthController.signup` is the one place that special-cases this: it catches the "already exists" error itself and responds `409` instead of letting it fall through to the 500 handler.

### Brain sharing model
`BrainLink` is a one-per-user (`userId` unique) `{ hash, isPublic }` record — it only controls whether the public page is reachable at all. `POST /api/v1/brain/share` (auth) creates/deletes it and does **not** touch any `Content.isPublic` flags. Per-item visibility is separate: `POST /api/v1/brain/publish { contentId, isPublic }` (auth) flips one item's `Content.isPublic` and lazily creates the `BrainLink` if needed. `GET /api/v1/brain/:hash` (no auth) returns the owning user's profile plus only the `Content` where `isPublic: true`, sorted pinned-first-then-newest; `GET /api/v1/brain/:hash/item/:contentId` (no auth) returns one public item. There's no ownership check tying a viewer to a link beyond the hash being unguessable.

### API surface
All mounted under `/api/v1` (see `src/routes/index.ts`):
- `POST /auth/signup`, `POST /auth/signin`, `POST /auth/forgot-password`, `POST /auth/reset-password`
- `GET /content`, `GET /content/tags`, `POST /content`, `PATCH /content/:contentId`, `DELETE /content` (bulk, `{ ids }`), `DELETE /content/:contentId` (all require `Authorization: Bearer <jwt>`)
- `POST /brain/share` (auth), `POST /brain/publish` (auth), `GET /brain/:hash` (public), `GET /brain/:hash/item/:contentId` (public)

Every response is `{ success, message, data? }` or `{ success: false, message, errors? }` — always go through `ApiResponse`, never `res.json()` directly, to keep this consistent.

### Frontend structure
- `src/App.tsx` — all routing (`react-router-dom`), with `ProtectedRoute`/`PublicOnlyRoute` wrappers gating on `AuthContext.isAuthenticated`. `/` (marketing `HomePage`), `/signin`, `/signup`, `/forgot-password` (all public-only, redirect to `/dashboard` if already authed), `/reset-password/:token` (unguarded), `/dashboard` (protected), `/share/:hash` and `/share/:hash/:contentId` (public), everything else redirects to `/dashboard`. Every page is `React.lazy`-loaded, wrapped in one `<Suspense>` with a full-page `Spinner` fallback.
- `src/context/AuthContext.tsx` — token/user persisted to `localStorage` (`token`, `user` keys), no refresh-token flow.
- `src/context/ContentContext.tsx` — fetches/holds the signed-in user's content list; owns client-side type-filter + search-query filtering (`filteredContents`).
- `src/context/ThemeContext.tsx` — light/dark theme, persisted to `localStorage` (`brainly:theme`), toggled from the Navbar's avatar dropdown; applies/removes a `dark` class on `<html>` that Tailwind's `@custom-variant dark` hooks `dark:` utilities off of. `index.html` has an inline pre-React script that applies the stored/preferred theme immediately, to avoid a flash of the wrong theme.
- `src/services/api.ts` (exports `API`/`api`, used by `auth.api.ts`/`content.api.ts`/`brain.api.ts`) is the only axios instance — attaches the bearer token per-request via a request interceptor, and on a `401` response clears `localStorage`, stashes a message under `SESSION_EXPIRED_MESSAGE_KEY` in `sessionStorage`, and redirects to `/signin` (which reads/clears that key on mount). There is no separate `axios.ts` anymore.
- `src/hooks/useContent.ts` and `src/hooks/useBrainShare.ts` are empty files (dead stubs); the real logic lives directly in `ContentContext`/components. `src/hooks/useAuth.ts` just re-exports `useAuth` from `AuthContext`.
- Dead files that still exist but nothing imports: `components/content/ContentGrid.tsx`, `ContentActions.tsx`, `components/content/embeds/*`, `components/modals/CreateContentModal.tsx`, `components/layout/AppLayout.tsx`, `pages/NotFound.tsx`. Don't assume these are wired in — check imports before editing one.
- `ContentFormModal` hides the Link field (and forces `link: undefined` on submit) when the selected type is `document` — documents are notes-only now, not link + notes.
- `pages/Home.tsx` is the public landing page at `/`; it's fully static/self-contained (no API calls), reuses `ThemeContext` for its own dark-mode toggle, and its footer social links point at real external profiles (X/GitHub/LinkedIn) — don't replace those with placeholder `#` links.
- `components/common/Spinner.tsx`, `Skeleton.tsx` (+ `CardGridSkeleton`) are the shared loading primitives; prefer them over ad hoc loading markup.
- Tailwind v4 via `@tailwindcss/vite` (no `tailwind.config.js` — v4 is CSS-first, check `src/index.css` for `@theme`/config and the `@custom-variant dark` declaration).

## Gotchas worth knowing before editing

- **Space-prefixed paths on the backend**: `src/ services/` and `src/utils/ logger.ts` have a literal leading space in the path segment. Tab-completion and naive globs (`src/services/*`) will miss them; use `src/*services*` or check `find`/`ls` output before assuming a path.
- **Root `package.json` is dead weight** — don't `npm install`/`npm run` anything from the repo root expecting it to affect the app.
- **CORS origin is hardcoded** in `src/app.ts` to the Vite dev ports; the `CORS_ORIGIN` env var is read into `ENV` but not actually used anywhere in `app.ts`.
