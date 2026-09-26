# Deskflow API

Express 5 gateway for the studio. Layered as controllers → services → repositories. Persistence is Neon Postgres via `@neondatabase/serverless`. The graph is a separate process at `AGENT_BASE_URL`.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Listens on `PORT` (default 4000). Required: `NEON_DB_URL` or `DATABASE_URL` (pooled Neon URL, `sslmode=require`).

On boot (`src/server.ts`):

1. `ensureSchema()` — each model’s `CREATE TABLE IF NOT EXISTS`, in FK order (`admins`, `customers`, `agents`, `chat_turns`)
2. Ping Neon
3. `seedIfEmpty()` — seed admin and Scalina if there are no customers

`CREATE TABLE IF NOT EXISTS` does not add columns to tables that already exist.

## Env

See `.env.example`. Defaults match local studio:

- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — first admin if none exists
- `JWT_SECRET` / `JWT_EXPIRES_IN`
- `AGENT_BASE_URL` — FastAPI origin, no trailing slash
- `CORS_ORIGIN` — comma-separated browser origins

## Routes

All JSON success/error bodies go through `src/utils/api-response.ts`:

```json
{ "status": 200, "success": true, "message": "…", "data": {} }
```

Errors omit `data` and set `success` to false.

| Method | Path | Auth |
|---|---|---|
| GET | `/api/health` | no |
| POST | `/api/auth/login` | no |
| GET | `/api/auth/me` | JWT |
| GET | `/api/catalog/specialists` | no |
| GET/POST | `/api/public/chat/:companyId` | no |
| GET | `/api/dashboard` | JWT |
| CRUD | `/api/customers` | JWT |
| CRUD + ingest + chat | `/api/agents` | JWT |

Protected routes use `Authorization: Bearer <token>`.

## Layout

```
src/config/     env, specialist catalog
src/db/         neon client, row mappers, schema orchestrator
src/models/     TypeScript types + table SQL
src/repositories/
src/services/
src/controllers/
src/routes/
src/middleware/ JWT, errors
src/utils/      ApiResponseHelper, HttpError, asyncHandler
```

Repositories are the only place that runs SQL. Models are not an ORM.

## Scripts

```bash
npm run dev    # tsx watch
npm run start  # tsx src/server.ts
```
