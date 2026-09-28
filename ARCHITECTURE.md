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
- `AuthService.forgotPassword` / `resetPassword` — issues a short-lived reset token, emails a reset link via Nodemailer (or logs it to the console when no SMTP is configured, e.g. local dev), and on completion signs a fresh JWT (auto-login).
- `authMiddleware` (`src/middlewares/auth.middleware.ts`) — reads `Authorization: Bearer <token>`, verifies with `ENV.JWT_SECRET`, runtime-checks the decoded payload shape (`isUserPayload`), and sets `req.user = { id, email }`. The `Express.Request.user` field is declared globally in `src/types/index.d.ts`.
- No refresh tokens; logout is client-side `localStorage` clearing only, either manual or auto-triggered by the frontend's 401 interceptor (see the API client layer section below).

### Data model

```
User ──< Content >── Tag
  │            
  └──1:1── BrainLink
```

- **User** (`src/models/user.ts`): `username` (unique), `email` (unique), `password` (hashed, `select: false`), `avatarUrl`.
- **Content** (`src/models/Content.ts`): `title`, `type` (enum: `twitter | youtube | article | link | document | thought`), `link`, `notes`, `tags: Tag[]` (ObjectId refs), `userId` (indexed), `isPinned`, `isPublic` (indexed — drives the public-brain query), `metadata: { thumbnail, author, description }`. Compound index on `{ userId, type, createdAt }` for dashboard queries.
- **Tag** (`src/models/Tag.ts`): `title` (unique, lowercased). Upserted by title in `ContentService.createContent` — tags are auto-created on the fly, never managed via a dedicated endpoint.
- **BrainLink** (`src/models/BrainLink.ts`): `hash` (unique, random 10-hex-char via `crypto.randomBytes(5)`), `userId` (unique — one share link per user), `isPublic`. Created/deleted by `BrainService.toggleShare`.

### Sharing flow

Sharing is two independent layers: whether the public page exists at all, and which individual items appear on it.

1. Authenticated user calls `POST /api/v1/brain/share { isPublic: true }`. `BrainService.toggleShare` creates a `BrainLink` with a fresh random hash (or returns the existing one), or deletes it if `isPublic: false`. This only makes the page reachable — it does **not** change any `Content.isPublic` flags.
2. Each item is published/unpublished independently via `POST /api/v1/brain/publish { contentId, isPublic }` (`BrainService.setContentVisibility`), which flips that one `Content` document's `isPublic` flag and lazily creates the `BrainLink` if it doesn't exist yet.
3. Anyone with the hash can `GET /api/v1/brain/:hash` (no auth) — `BrainService.getPublicBrain` looks up the `BrainLink`, then returns the owning user's `username`/`avatarUrl` plus only the `Content` items with `isPublic: true` (tags populated), pinned-first. A single item can also be fetched directly via `GET /api/v1/brain/:hash/item/:contentId`.
4. Knowledge of the hash is the only access control on the public endpoints — there's no rate limiting or expiry.

### Error handling and responses

- Every controller wraps its logic in try/catch and calls `next(error)` on failure; `errorHandler` (`src/middlewares/errorHandler.ts`) logs the stack via `src/utils/ logger.ts` (note the leading space in the filename) and responds `{ success: false, message }` with status 500. Services throw plain `Error` objects with user-facing messages (e.g. `"Invalid credentials"`) — there's no custom `AppError`/status-code-carrying error class, so every thrown error surfaces as HTTP 500 by default. `AuthController.signup` is the one exception: it catches the specific "already exists" `Error` from `AuthService.signup` and responds `409` directly instead of forwarding to `errorHandler`, since a duplicate account is a client error, not a server failure. Any other new "this is really a 4xx" case needs the same per-controller special-casing until/unless a real `AppError` class is introduced.
- Zod validation failures are caught inside the `validate` middleware itself and returned as a 400 with a `path`/`message` array — they never reach `errorHandler`.
- All success/explicit-error responses go through `ApiResponse.success`/`ApiResponse.error` (`src/utils/apiResponse.ts`) for a consistent `{ success, message, data }` envelope.

## Frontend (`frontend/`)

### Routing (`src/App.tsx`)

```
/                                     → PublicOnlyRoute  (HomePage — marketing landing page)
/signin, /signup, /forgot-password   → PublicOnlyRoute  (redirects to /dashboard if already authed)
/reset-password/:token               → public, no guard (must work even with a stale session logged in)
/dashboard                            → ProtectedRoute   (redirects to /signin if not authed)
/share/:hash                          → public, no guard (PublicBrainPage — the whole collection)
/share/:hash/:contentId               → public, no guard (PublicContentPage — a single item)
*                                       → redirect to /dashboard
```

Both route guards read `AuthContext` and show a full-page `Spinner` while `loading` is true (i.e. while the initial `localStorage` check runs). Every page component is route-split via `React.lazy`/`Suspense` (see `App.tsx`), so a signed-out visitor never downloads the dashboard bundle until they sign in.

### State management

No Redux/Zustand/React Query — three React Contexts:

- **`AuthContext`** (`src/context/AuthContext.tsx`) — `token`/`user` state, hydrated from and persisted to `localStorage` (`token`, `user` keys). Exposes `login(token, user)` / `logout()`. `isAuthenticated` is simply `!!token` — no token expiry/validity check on the client; an actually-expired token is instead caught centrally by the API client's 401 interceptor (below), not by anything in this context.
- **`ContentContext`** (`src/context/ContentContext.tsx`) — fetches the user's content list on mount (and whenever `isAuthenticated` changes), exposes `contents`, plus client-side `selectedType`/`searchQuery` filtering via a memoized `filteredContents`. `addContent`/`deleteContent` optimistically update local state after the API call resolves (no optimistic-before-response updates).
- **`ThemeContext`** (`src/context/ThemeContext.tsx`) — `theme: 'light' | 'dark'` + `toggleTheme()`. Initializes from `localStorage` (`brainly:theme`), falling back to `prefers-color-scheme` on first visit; toggles a `dark` class on `document.documentElement`, which Tailwind's `@custom-variant dark (&:where(.dark, .dark *))` (in `src/index.css`) hooks every `dark:` utility off of. A synchronous inline script in `index.html` applies the class before React mounts, to avoid a flash of the wrong theme.

### API client layer (`src/services/`)

- `api.ts` is the single axios instance used everywhere (`auth.api.ts`, `content.api.ts`, `brain.api.ts` all import from it). A request interceptor attaches `Authorization: Bearer <token>` from `localStorage`; a response interceptor catches `401`s, clears `localStorage`, stashes an explanatory message under `SESSION_EXPIRED_MESSAGE_KEY` in `sessionStorage`, and redirects to `/signin` — `Signin.tsx` reads and clears that key on mount to surface the message once. (An earlier near-duplicate axios instance, `axios.ts`, existed briefly with this same logic but unwired; it has since been deleted — `api.ts` is the only client.)
- `auth.api.ts`, `content.api.ts`, `brain.api.ts` are thin per-resource wrappers returning typed `ApiResponse<T>` payloads.

### Components

- `components/layout/` — `Navbar` (search, "Add Content", and an avatar dropdown menu with Public Brain / Dark Mode / Sign Out), `Sidebar` (category + tag filters). `AppLayout.tsx` is a dead leftover — `Dashboard.tsx` composes `Navbar`/`Sidebar` directly rather than using it.
- `components/content/` — `ContentCard` (the live card, with pin/edit/delete actions and a footer share popover) and `ContentPreview` (type-specific preview rendering: tweet, YouTube embed, document, link). `ContentGrid.tsx`, `ContentActions.tsx`, and the whole `embeds/` directory (`TwitterEmbed`, `YoutubeEmbed`, `ArticleEmbed`, `NoteEmbed`) are dead — nothing imports them; `ContentCard`/`ContentPreview` superseded them.
- `components/modals/` — `ContentFormModal` (create/edit content — the live one; the Link field is hidden and forced to `undefined` on submit when the selected type is `document`, since documents are notes-only), `ShareBrainModal` (master public-page toggle plus a per-item "select what to share" list). `CreateContentModal.tsx` is a dead leftover, superseded by `ContentFormModal`.
- `pages/Home.tsx` — the public marketing landing page mounted at `/`. Self-contained (no data fetching): scroll-aware header with anchor-scroll nav links, a hero, a feature grid, a "how it works" section, and a footer with real social links. Uses the same `ThemeContext` toggle as the authenticated app.
- `components/common/` — `Button`, `Input`, `Badge`, `Dropdown`, `Modal`, `ConfirmDialog`, `TagInput` primitives, plus shared `Spinner`/`Skeleton`/`CardGridSkeleton` loading components used instead of duplicated inline loading markup.
- `pages/NotFound.tsx` exists but is dead — the catch-all route (`*`) redirects straight to `/dashboard` rather than rendering it.

### Hooks (`src/hooks/`)

- `useAuth.ts` — re-exports `useAuth` from `AuthContext` (no added logic).
- `useDebounce.ts` — generic debounce hook, used for search input.
- `useContent.ts`, `useBrainShare.ts` — **empty files**. Content/brain-share logic lives directly in `ContentContext` and in the modal components instead.

### Styling

Tailwind CSS v4 via the `@tailwindcss/vite` plugin — no `tailwind.config.js`; theme/config is CSS-first (check `src/index.css` for `@theme` tokens and the `@custom-variant dark` declaration). Fonts loaded from Google Fonts (`Inter`) via `<link>` tags in `index.html`.

## Known inconsistencies (not yet cleaned up)

- Dead root-level `package.json`/`node_modules`/`tsconfig.tsbuildinfo` with no corresponding `src/` — a stale copy of `backend/package.json`, not used by anything.
- `src/ services/` and `src/utils/ logger.ts` on the backend have a literal leading space in the path.
- `frontend/src/components/content/ContentGrid.tsx`, `ContentActions.tsx`, `content/embeds/*`, `components/modals/CreateContentModal.tsx`, `components/layout/AppLayout.tsx`, and `pages/NotFound.tsx` are dead code — nothing imports them, but they haven't been deleted.
- `frontend/src/hooks/useContent.ts` and `useBrainShare.ts` are empty.
- `CORS_ORIGIN` is read from env but not applied — CORS origins are hardcoded in `backend/src/app.ts`.
- The repo's git history contains one commit with ~200MB of accidentally-committed local MongoDB data files (`backend/mongodata/`); left in place rather than rewritten, per a deliberate choice to avoid disrupting shared history.
- No automated tests anywhere in the repo.
