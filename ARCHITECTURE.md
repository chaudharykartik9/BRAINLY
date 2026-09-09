# Architecture

Detailed reference for how Brainly's backend and frontend are put together. See [README.md](README.md) for setup and [CLAUDE.md](CLAUDE.md) for the condensed version aimed at AI coding assistants.

## High-level

```
┌─────────────────────┐        HTTP (JSON)        ┌──────────────────────┐        ┌────────────┐
│  frontend/ (Vite)   │ ───────────────────────── │  backend/ (Express)  │ ────── │  MongoDB   │
│  React 19 SPA        │   /api/v1/* + Bearer JWT   │  REST API             │        │  (Atlas or │
│  :5173                │                            │  :5000                 │        │   local)   │
└─────────────────────┘                            └──────────────────────┘        └────────────┘
```

The two apps only communicate over HTTP via `VITE_BACKEND_URL`. There is no shared code, shared types package, or RPC layer — request/response shapes are duplicated by hand in `frontend/src/types/*.types.ts` to mirror the backend's Mongoose models/Zod schemas.

## Backend (`backend/`)

### Boot sequence

`src/index.ts`:
1. `connectDB()` (`src/config/db.ts`) — connects Mongoose. In development, tries the configured `MONGO_URI` first, then falls back to `mongodb://127.0.0.1:27017/brainly` if that fails. Outside development, a failed connection calls `process.exit(1)`.
2. `createApp()` (`src/app.ts`) builds the Express app.
3. `app.listen(ENV.PORT, ...)`.

### Middleware chain (`src/app.ts`)

```
cors({ origin: [vite dev origins], credentials: true })
  → express.json()
  → /api/v1 → rootRouter
  → errorHandler   (last; catches anything passed to next(err))
```

### Routing → Controller → Service → Model

```
src/routes/*.routes.ts        Zod validation (validate.ts) + authMiddleware
        │
        ▼
src/controllers/*.controller.ts   thin: destructure req, call service, ApiResponse.success/error
        │
        ▼
src/ services/*                    business logic, all Mongoose queries
   (note: literal leading space in the directory name — "src/ services/")
        │
        ▼
src/models/*.ts                    Mongoose schemas
```

| Route file | Mounted at | Auth | Controller | Service |
|---|---|---|---|---|
| `auth.routes.ts` | `/api/v1/auth` | none | `AuthController` | `AuthService` |
| `content.routes.ts` | `/api/v1/content` | `authMiddleware` on all routes | `ContentController` | `ContentService` |
| `brain.routes.ts` | `/api/v1/brain` | `authMiddleware` on `/share` only; `/:hash` is public | inline handlers (no controller class) | `BrainService` |

### Auth

- `AuthService.signup` — checks for an existing user by email or username, hashes the password with `bcryptjs`, creates the `User`, signs a JWT `{ id, email }`.
- `AuthService.signin` — looks up by email with `.select('+password')` (password is `select: false` by default on the schema), compares with `bcrypt.compare`, signs the same JWT shape.
- `authMiddleware` (`src/middlewares/auth.middleware.ts`) — reads `Authorization: Bearer <token>`, verifies with `ENV.JWT_SECRET`, runtime-checks the decoded payload shape (`isUserPayload`), and sets `req.user = { id, email }`. The `Express.Request.user` field is declared globally in `src/types/index.d.ts`.
- No refresh tokens, no logout endpoint (logout is client-side `localStorage` clearing only), no password-reset flow.

### Data model

```
User ──< Content >── Tag
  │            
  └──1:1── BrainLink
```

- **User** (`src/models/user.ts`): `username` (unique), `email` (unique), `password` (hashed, `select: false`), `avatarUrl`.
- **Content** (`src/models/Content.ts`): `title`, `type` (enum: `tweet | youtube | article | audio | document | thought`), `link`, `notes`, `tags: Tag[]` (ObjectId refs), `userId` (indexed), `isPinned`, `metadata: { thumbnail, author, description }`. Compound index on `{ userId, type, createdAt }` for dashboard queries.
- **Tag** (`src/models/Tag.ts`): `title` (unique, lowercased). Upserted by title in `ContentService.createContent` — tags are auto-created on the fly, never managed via a dedicated endpoint.
- **BrainLink** (`src/models/BrainLink.ts`): `hash` (unique, random 10-hex-char via `crypto.randomBytes(5)`), `userId` (unique — one share link per user), `isPublic`. Created/deleted by `BrainService.toggleShare`.

### Sharing flow

1. Authenticated user calls `POST /api/v1/brain/share { isPublic: true }`.
2. `BrainService.toggleShare` creates a `BrainLink` with a fresh random hash (or returns the existing one if already public), or deletes it if `isPublic: false`.
3. Anyone with the hash can `GET /api/v1/brain/:hash` (no auth) — `BrainService.getPublicBrain` looks up the `BrainLink`, then returns the owning user's `username`/`avatarUrl` plus all their `Content` (tags populated), pinned-first.
4. Knowledge of the hash is the only access control on the public endpoint — there's no rate limiting or expiry.

### Error handling and responses

- Every controller wraps its logic in try/catch and calls `next(error)` on failure; `errorHandler` (`src/middlewares/errorHandler.ts`) logs the stack via `src/utils/ logger.ts` (note the leading space in the filename) and responds `{ success: false, message }` with status 500. Services throw plain `Error` objects with user-facing messages (e.g. `"Invalid credentials"`) — there's no custom `AppError`/status-code-carrying error class, so every thrown error surfaces as HTTP 500 unless it's a Zod validation error.
- Zod validation failures are caught inside the `validate` middleware itself and returned as a 400 with a `path`/`message` array — they never reach `errorHandler`.
- All success/explicit-error responses go through `ApiResponse.success`/`ApiResponse.error` (`src/utils/apiResponse.ts`) for a consistent `{ success, message, data }` envelope.

## Frontend (`frontend/`)

### Routing (`src/App.tsx`)

```
/signin, /signup        → PublicOnlyRoute  (redirects to /dashboard if already authed)
/dashboard               → ProtectedRoute   (redirects to /signin if not authed)
/share/:hash             → public, no guard (PublicBrainPage)
*                          → redirect to /dashboard
```

Both route guards read `AuthContext` and show a spinner while `loading` is true (i.e. while the initial `localStorage` check runs).

### State management

No Redux/Zustand/React Query — just two React Contexts:

- **`AuthContext`** (`src/context/AuthContext.tsx`) — `token`/`user` state, hydrated from and persisted to `localStorage` (`token`, `user` keys). Exposes `login(token, user)` / `logout()`. `isAuthenticated` is simply `!!token` — no token expiry/validity check on the client.
- **`ContentContext`** (`src/context/ContentContext.tsx`) — fetches the user's content list on mount (and whenever `isAuthenticated` changes), exposes `contents`, plus client-side `selectedType`/`searchQuery` filtering via a memoized `filteredContents`. `addContent`/`deleteContent` optimistically update local state after the API call resolves (no optimistic-before-response updates).

### API client layer (`src/services/`)

- `api.ts` exports the axios instance actually used everywhere (`auth.api.ts`, `content.api.ts`, `brain.api.ts` all import from it). It attaches `Authorization: Bearer <token>` from `localStorage` per request.
- `axios.ts` exports a second, near-identical axios instance (`apiClient`) that additionally auto-clears `localStorage` and redirects to `/signin` on a 401 response — but **nothing imports `axios.ts`**, so that 401-auto-logout behavior is currently inert. Treat `api.ts` as the source of truth; either wire `axios.ts` in for real or fold its interceptor into `api.ts` if you need that behavior.
- `auth.api.ts`, `content.api.ts`, `brain.api.ts` are thin per-resource wrappers returning typed `ApiResponse<T>` payloads. Each currently has one or two large commented-out earlier drafts left in the file above the live export.

### Components

- `components/layout/` — `AppLayout`, `Navbar`, `Sidebar` (dashboard chrome).
- `components/content/` — `ContentCard`, `ContentGrid`, `ContentActions`, and `embeds/` (`TwitterEmbed`, `YoutubeEmbed`, `ArticleEmbed`, `NoteEmbed`) which render a `Content` item differently based on its `type`.
- `components/modals/` — `AddContentModal`/`CreateContentModal` (creating content — note both exist, check which is actually used before assuming one is dead), `ShareBrainModal` (toggling/copying the public share link).
- `components/common/` — generic `Button`, `Input`, `Badge`, `Dropdown`, `Modal` primitives.

### Hooks (`src/hooks/`)

- `useAuth.ts` — re-exports `useAuth` from `AuthContext` (no added logic).
- `useDebounce.ts` — generic debounce hook, used for search input.
- `useContent.ts`, `useBrainShare.ts` — **empty files**. Content/brain-share logic lives directly in `ContentContext` and in the modal components instead.

### Styling

Tailwind CSS v4 via the `@tailwindcss/vite` plugin — no `tailwind.config.js`; theme/config is CSS-first (check `src/index.css` for `@theme` tokens). Fonts loaded from Google Fonts (`Inter`) via `<link>` tags in `index.html`.

## Known inconsistencies (not yet cleaned up)

- Dead root-level `package.json`/`node_modules`/`tsconfig.tsbuildinfo` with no corresponding `src/` — a stale copy of `backend/package.json`, not used by anything.
- `src/ services/` and `src/utils/ logger.ts` on the backend have a literal leading space in the path.
- `frontend/src/services/axios.ts` is an unused duplicate of `api.ts`.
- `frontend/src/hooks/useContent.ts` and `useBrainShare.ts` are empty.
- `CORS_ORIGIN` is read from env but not applied — CORS origins are hardcoded in `backend/src/app.ts`.
- No automated tests anywhere in the repo.
