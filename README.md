# Brainly — Your Second Brain

A personal knowledge-management app. Save links, tweets, videos, documents, and notes in one place, organize them with tags, pin the important ones to the top, edit them later, and optionally publish your whole collection — or just specific items — as read-only public pages anyone can open via a shareable link.

## Features

- **Save & organize** — links, tweets, YouTube videos, documents, and freeform notes, each with tags, optional notes, and a type-specific preview card.
- **Edit in place** — update an item's title, type, link, notes, or tags after the fact; no create-only limitation.
- **Pin to top** — pin your most important items so they always sort first.
- **Selective public sharing** — turn on a public page for your account, then choose exactly which items appear on it (per-item toggle, not all-or-nothing). Each published item also gets its own standalone public URL.
- **Search & filter** — client-side search across title/notes/tags, plus filtering by content type.
- **Auth with password reset** — email/password signup and signin (JWT-based), plus a full forgot-password → emailed reset link → new-password flow. In local development, if no SMTP is configured, reset links are logged to the backend console instead of emailed, so the flow works out of the box with zero email setup.

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Axios |
| Backend  | Node.js, Express 5, TypeScript, Mongoose (MongoDB), Zod, JWT, bcrypt, Nodemailer |
| Database | MongoDB (Atlas or local) |

## Project structure

```
BRAINLY/
├── backend/     Express + Mongoose REST API (see backend/src)
├── frontend/    React + Vite SPA (see frontend/src)
└── CLAUDE.md    Guidance for AI coding assistants working in this repo
```

The `backend/` and `frontend/` apps are independent — each has its own `package.json`, `node_modules`, and `.env`. There is no monorepo tool (no workspaces/Turborepo/Nx) tying them together.

For a deeper architectural breakdown (request flow, data model, API surface), see [ARCHITECTURE.md](ARCHITECTURE.md).

## Prerequisites

- Node.js 18+ and npm
- A MongoDB instance — either a MongoDB Atlas connection string, or a local `mongod` (see below)

## Setup

1. **Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env   # then fill in MONGO_URI, JWT_SECRET, etc.
   npm run build
   npm run start
   ```
   Runs on `http://localhost:5000` by default (`PORT` in `.env`).

2. **Frontend** (in a separate terminal)
   ```bash
   cd frontend
   npm install
   cp .env.example .env   # VITE_BACKEND_URL, defaults to http://localhost:5000/api/v1
   npm run dev
   ```
   Runs on `http://localhost:5173` by default.

### Using a local MongoDB instead of Atlas

If you don't have an Atlas cluster (or it's unreachable, e.g. in an offline sandbox), point `MONGO_URI` at a local instance:

```bash
mongod --dbpath ./mongodata --port 27017 --bind_ip 127.0.0.1 --fork --logpath ./mongod.log
```

With `NODE_ENV=development`, the backend automatically falls back to `mongodb://127.0.0.1:27017/brainly` if the configured `mongodb+srv://` Atlas URI fails to connect — no config change needed for local dev.

## Environment variables

**`backend/.env`**

| Var | Default | Notes |
|---|---|---|
| `PORT` | `5000` | |
| `NODE_ENV` | `development` | Enables the local-Mongo fallback described above |
| `MONGO_URI` | `mongodb://localhost:27017/brainly` | Atlas or local connection string |
| `JWT_SECRET` | `fallback_secret` | Set a real secret outside local dev |
| `JWT_EXPIRES_IN` | `7d` | |
| `CORS_ORIGIN` | `*` | Read into config but not currently applied — CORS origins are hardcoded to the Vite dev ports in `backend/src/app.ts` |
| `FRONTEND_URL` | `http://localhost:5173` | Used to build the link inside password-reset emails |
| `SMTP_HOST` | *(empty)* | Leave blank in development — reset emails are logged to the console instead of sent |
| `SMTP_PORT` | `587` | Use `465` for implicit TLS (e.g. Gmail) |
| `SMTP_USER` | *(empty)* | SMTP account username |
| `SMTP_PASS` | *(empty)* | SMTP account password (for Gmail, an [App Password](https://myaccount.google.com/apppasswords), not your normal password) |
| `SMTP_FROM` | `Brainly <no-reply@brainly.app>` | "From" header on outgoing emails |

**`frontend/.env`**

| Var | Default |
|---|---|
| `VITE_BACKEND_URL` | `http://localhost:5000/api/v1` |

## API overview

All backend routes are mounted under `/api/v1`:

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | – | Register a user, returns a JWT |
| POST | `/auth/signin` | – | Log in, returns a JWT |
| POST | `/auth/forgot-password` | – | Request a password-reset email (always returns the same response, whether or not the email exists) |
| POST | `/auth/reset-password` | – | Complete a reset with `{ token, password }`; returns a fresh JWT (auto-login) |
| GET | `/content` | Bearer | List the signed-in user's saved content |
| POST | `/content` | Bearer | Create a content item |
| PATCH | `/content/:contentId` | Bearer | Update a content item — only the fields sent are changed (title, type, link, notes, tags, isPinned) |
| DELETE | `/content/:contentId` | Bearer | Delete a content item |
| POST | `/brain/share` | Bearer | Enable/disable your public collection page as a whole |
| POST | `/brain/publish` | Bearer | Publish/unpublish a single content item (`{ contentId, isPublic }`); auto-creates your public page link on first use |
| GET | `/brain/:hash` | – | Fetch a user's publicly shared content by hash (only items marked public) |
| GET | `/brain/:hash/item/:contentId` | – | Fetch a single publicly shared item by hash + id |

Responses are always shaped `{ success, message, data? }` (or `{ success: false, message, errors? }` on failure).

Content types are `twitter`, `youtube`, `article`, `link`, `document`, `thought` — though the "Add Content" UI currently only exposes four of them (YouTube, Twitter, Document, Link); `article` and `thought` exist in the schema but aren't reachable from the UI's type picker yet.

## Scripts reference

| Location | Command | Purpose |
|---|---|---|
| `backend/` | `npm run build` | Compile TypeScript (`tsc -b`) to `backend/dist` |
| `backend/` | `npm run start` | Run the compiled server (`node dist/index.js`) |
| `backend/` | `npm run dev` | `build` then `start` (not a watch mode) |
| `frontend/` | `npm run dev` | Start the Vite dev server |
| `frontend/` | `npm run build` | Type-check and build for production |
| `frontend/` | `npm run lint` | Run oxlint |
| `frontend/` | `npm run preview` | Preview a production build locally |

No automated test suite exists yet for either app.

## For AI coding assistants

See [CLAUDE.md](CLAUDE.md) for architecture notes, known quirks (e.g. space-prefixed backend paths, the dead root-level `package.json`), and the request-flow walkthrough intended to get an AI assistant productive quickly in this codebase.
