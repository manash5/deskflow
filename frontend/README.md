# Deskflow frontend

Next.js 16 studio and public desk. Talks only to the Express API (`NEXT_PUBLIC_API_URL`).

## Pages

| Path | Who |
|---|---|
| `/` | Marketing landing |
| `/login` | Studio sign-in |
| `/agents`, `/agents/[id]` | Agent list, create, docs, test chat |
| `/customers`, `/customers/[id]` | Customer accounts |
| `/overview` | Activity counts and recent turns |
| `/c/[companyId]` | Public chat (no studio login) |

Studio routes sit under `app/(studio)` and require a JWT in `localStorage` (`deskflow.token`). Missing token redirects to `/login`.

## Setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

`.env.example` is tracked. `.gitignore` ignores `.env*` except `.env.example`.

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:4000/api
```

Open http://localhost:3000. Seed login: `admin@deskflow.local` / `deskflow-admin`. Public seed desk: `/c/scalina`.

## API client

`lib/api.ts` attaches `Authorization: Bearer …` when a token exists. Responses from the API look like `{ success, status, message, data }`. An interceptor replaces `response.data` with the inner `data` so pages keep using `const { data } = await api.get<T>(...)`. Errors use `message` from the envelope.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

The backend and agent must be running for login, lists, ingest, and chat. The landing page can render without them.
