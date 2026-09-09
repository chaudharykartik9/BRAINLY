# Brainly — Your Second Brain

A personal knowledge-management app. Save links, notes, tweets, videos, articles, and thoughts in one place, organize them with tags, and optionally publish a read-only public page of your whole collection via a shareable link.

## Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router, Axios |
| Backend  | Node.js, Express 5, TypeScript, Mongoose (MongoDB), Zod, JWT, bcrypt |
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
| GET | `/content` | Bearer | List the signed-in user's saved content |
| POST | `/content` | Bearer | Create a content item |
| DELETE | `/content/:contentId` | Bearer | Delete a content item |
| POST | `/brain/share` | Bearer | Enable/disable a public share link for your brain |
| GET | `/brain/:hash` | – | Fetch a user's publicly shared content by hash |

Responses are always shaped `{ success, message, data? }` (or `{ success: false, message, errors? }` on failure).

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
