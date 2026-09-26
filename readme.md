# Deskflow

Deskflow is a three-process app for company support desks. An operator creates a customer and an agent in the studio, uploads docs, and visitors chat at a public URL. The Express API stores studio data in Neon Postgres. The Python graph routes each question to a specialist, retrieves company docs from Chroma, and applies input/output rails.

```
browser  →  Next.js :3000  →  Express :4000  →  Neon
                              FastAPI :8000  →  Chroma + LLMs
```

| App | Path | Role |
|---|---|---|
| Studio + public chat | `frontend/` | Next.js 16, port 3000 |
| Admin API | `backend/` | Express 5, port 4000 |
| Support graph | `agent/` | FastAPI, port 8000 |

More detail lives in each folder’s README.

## Prerequisites

- Node.js 20+ (frontend and backend)
- Python 3.13 and [uv](https://docs.astral.sh/uv/) (agent)
- A Neon Postgres project (pooled connection string)
- LLM API keys used by the graph (Mistral, Groq, OpenRouter, Google)

## Setup

Copy each example env file and fill in secrets. Do not commit `.env` or `.env.local`.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
cp agent/.env.example agent/.env
```

`backend/.env` needs `NEON_DB_URL` (or `DATABASE_URL`). `agent/.env` needs the provider keys the models you enable actually use.

```bash
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
cd agent && uv sync
```

## Run locally

Use three terminals. Start the API and graph before you rely on studio chat or ingest.

```bash
# terminal 1
cd backend
npm run dev
```

```bash
# terminal 2
cd agent
uv sync
cd src
uv run python app.py
```

```bash
# terminal 3
cd frontend
npm run dev
```

- Site and studio: http://localhost:3000
- API health: http://127.0.0.1:4000/api/health
- Graph: http://127.0.0.1:8000 (FastAPI docs at `/docs`)

On first API boot, tables are created if missing and a seed admin plus Scalina customer/agent are inserted when the database is empty.

## Default local access

| What | Where |
|---|---|
| Studio login | http://localhost:3000/login |
| Email / password | `admin@deskflow.local` / `deskflow-admin` (from `ADMIN_EMAIL` / `ADMIN_PASSWORD`) |
| Public Scalina desk | http://localhost:3000/c/scalina |

Change those env values before you share a deployment.

## What talks to what

- Studio and `/c/:companyId` call `NEXT_PUBLIC_API_URL` (default `http://127.0.0.1:4000/api`).
- The API persists admins, customers, agents, and chat turns in Neon. Table SQL lives on each model; `backend/src/db/schema.ts` only runs those creates in foreign-key order.
- Chat and document ingest are proxied to `AGENT_BASE_URL` (`http://127.0.0.1:8000`). If the graph is down, studio still saves rows; ingest and live answers will fail.
- JSON from the API is always `{ status, success, message, data?, meta? }`. The frontend axios client unwraps `data`.

## Layout

```
frontend/   Next.js app (landing, /login, /agents, /customers, /overview, /c/[companyId])
backend/   Express layered API (controllers → services → repositories)
agent/      LangGraph specialists, rails, and RAG (Chroma under agent/src/RAG/data)
```
