import os
import re
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from RAG.config import COMPANIES_DIR, SUPPORTED_SUFFIXES
from RAG.ingestion import LoadError
from RAG.pipeline import Pipeline
from RAG.vectorstore.chroma import ChromaStore
from companies import DEFAULT_COMPANY_ID, REGISTRY, get_company
from graph import run_support_system

_AGENT_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_AGENT_ROOT / ".env")
load_dotenv()

_SAFE_COMPANY_ID = re.compile(r"^[a-zA-Z0-9_-]+$")
_MAX_UPLOAD_BYTES = 15 * 1024 * 1024

app = FastAPI(
    title="Deskflow agent",
    description="Ingest company docs into Chroma and run the support graph.",
    version="0.1.0",
)

_cors_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Customer question")
    company_id: str = Field(default=DEFAULT_COMPANY_ID)


class ChatResponse(BaseModel):
    company_id: str
    answer: str
    blocked: bool
    block_reason: str
    route: str
    categories: list[str]
    confidence: float
    trace: list[str]


class CompanyCard(BaseModel):
    id: str
    name: str
    enabled_agents: list[str]


class IngestResponse(BaseModel):
    company_id: str
    documents: int
    chunks: int
    saved_files: list[str]


class KnowledgeStatus(BaseModel):
    company_id: str
    chunk_count: int


def _require_company_id(company_id: str) -> str:
    cleaned = (company_id or "").strip()
    if not _SAFE_COMPANY_ID.fullmatch(cleaned):
        raise HTTPException(
            status_code=400,
            detail="company_id must be letters, numbers, underscore, or hyphen.",
        )
    try:
        get_company(cleaned)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return cleaned


def _public_company(company: dict) -> CompanyCard:
    return CompanyCard(
        id=company["id"],
        name=company["name"],
        enabled_agents=list(company.get("enabled_agents") or []),
    )


def _safe_upload_name(filename: str | None) -> str:
    name = Path(filename or "").name
    if not name or name in {".", ".."}:
        raise HTTPException(status_code=400, detail="Uploaded file is missing a name.")
    suffix = Path(name).suffix.lower()
    if suffix not in SUPPORTED_SUFFIXES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type {suffix!r}. Use .md, .txt, or .pdf.",
        )
    return name


@app.get("/health")
def health() -> dict:
    """Frontend and deploy checks: is the agent process up?"""
    return {"ok": True}


@app.get("/v1/companies", response_model=list[CompanyCard])
def list_companies() -> list[CompanyCard]:
    """Lets the UI pick a tenant without downloading prompts or guides."""
    return [_public_company(company) for company in REGISTRY.values()]


@app.get("/v1/companies/{company_id}", response_model=CompanyCard)
def get_company_card(company_id: str) -> CompanyCard:
    """One tenant card for a chat header or settings screen."""
    return _public_company(get_company(_require_company_id(company_id)))


@app.get("/v1/companies/{company_id}/knowledge", response_model=KnowledgeStatus)
def knowledge_status(company_id: str) -> KnowledgeStatus:
    """Tells the UI whether Chroma already has chunks for this company."""
    cid = _require_company_id(company_id)
    count = ChromaStore.instance().get_collection(cid).count()
    return KnowledgeStatus(company_id=cid, chunk_count=count)


@app.post("/v1/ingest", response_model=IngestResponse)
async def ingest_documents(
    company_id: str = Form(default=DEFAULT_COMPANY_ID),
    files: list[UploadFile] = File(default=[]),
) -> IngestResponse:
    """Save optional uploads under the company folder, then embed into Chroma."""
    cid = _require_company_id(company_id)
    dest = COMPANIES_DIR / cid
    dest.mkdir(parents=True, exist_ok=True)

    saved: list[str] = []
    for upload in files:
        filename = _safe_upload_name(upload.filename)
        raw = await upload.read()
        if not raw:
            raise HTTPException(status_code=400, detail=f"{filename} is empty.")
        if len(raw) > _MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=400,
                detail=f"{filename} is larger than {_MAX_UPLOAD_BYTES} bytes.",
            )
        (dest / filename).write_bytes(raw)
        saved.append(filename)

    try:
        result = Pipeline.instance().ingest(cid)
    except FileNotFoundError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except (LoadError, ValueError) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return IngestResponse(
        company_id=result["company_id"],
        documents=result["documents"],
        chunks=result["chunks"],
        saved_files=saved,
    )


@app.post("/v1/chat", response_model=ChatResponse)
def chat(body: ChatRequest) -> ChatResponse:
    """Run input rails → router → retrieve → specialist → review → output rails."""
    cid = _require_company_id(body.company_id)
    question = body.message.strip()
    if not question:
        raise HTTPException(status_code=400, detail="message must not be empty.")

    result = run_support_system(question, company_id=cid)
    return ChatResponse(
        company_id=cid,
        answer=result.get("answer") or "",
        blocked=bool(result.get("blocked")),
        block_reason=result.get("block_reason") or "",
        route=result.get("route") or "",
        categories=list(result.get("categories") or []),
        confidence=float(result.get("confidence") or 0.0),
        trace=list(result.get("trace") or []),
    )
