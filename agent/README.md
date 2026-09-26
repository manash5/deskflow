# Deskflow agent

FastAPI process that ingest company files into Chroma and answers through a LangGraph: input rails → router → retrieve → specialist → reviewer → output rails.

Specialists: `sales`, `support`, `account`, `billing`, `booking`, plus `default`. Company overlays (persona, enabled agents, contact email) live in `src/companies/`.

## Setup

Python 3.13 and [uv](https://docs.astral.sh/uv/).

```bash
cp .env.example .env
uv sync
```

Fill the keys for the providers you actually call. Model names in `.env.example` match the defaults in `src/agents.py`.

| Key | Used for |
|---|---|
| `MISTRAL_API_KEY` | Primary chat model |
| `GROQ_API_KEY` | Review / second model |
| `OPEN_ROUTER_KEY` | `THINKING_MODEL_2` |
| `GOOGLE_API_KEY` or `GEMINI_API_KEY` | Fast Gemini model |
| `OLLAMA_MODEL` / `OLLAMA_BASE_URL` | Local fallback when a hosted call fails |
| `CORS_ORIGINS` | Browser origins (comma-separated) |

Hosted providers run first. If a call errors (quota, 502, missing key), the same prompt is sent to Ollama. Install Ollama, pull the model (`ollama pull llama3.2`), and keep `ollama serve` running.

## Run

`uvicorn` loads `app:app`, so start from `src/`:

```bash
cd agent
uv sync
cd src
uv run python app.py
```

That binds http://127.0.0.1:8000 with reload. OpenAPI: http://127.0.0.1:8000/docs

`load_dotenv` reads `agent/.env` (parent of `src/`), not the current working directory.

## HTTP (used by the Express API)

| Method | Path |
|---|---|
| GET | `/health` |
| GET | `/v1/companies` |
| GET/PUT | `/v1/companies/{company_id}` |
| GET | `/v1/companies/{company_id}/knowledge` |
| POST | `/v1/ingest` (multipart: `company_id` + `files`; `md` / `txt` / `pdf`, 15 MB each) |
| POST | `/v1/chat` `{ "message", "company_id" }` |

A chat turn returns `answer`, `blocked`, `block_reason`, `route`, `categories`, `confidence`, and `trace`.

## Data on disk

- Tenant docs: `src/RAG/data/companies/<companyId>/`
- Chroma persist: `src/RAG/data/chroma/` (gitignored; rebuilt by ingest)
- Embeddings: `all-MiniLM-L6-v2` locally (same model at ingest and query)

The Express seed uses company id `scalina`. Ingest from the studio agent page, or drop files under that company folder and run ingest through the API.
