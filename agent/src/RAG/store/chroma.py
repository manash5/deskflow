import logging
import re
from pathlib import Path

import numpy as np
from chromadb import Collection, PersistentClient
from langchain_core.documents import Document

from RAG.config import CHROMA_COLLECTION_PREFIX, CHROMA_DIR

logger = logging.getLogger(__name__)

_SAFE_ID = re.compile(r"[^a-zA-Z0-9_-]+")


def _cleaned_company_id(company_id: str) -> str:
    cleaned = (company_id or "").strip()
    if not cleaned:
        raise ValueError("company_id is required")
    return cleaned


def _collection_name(company_id: str) -> str:
    cleaned = _SAFE_ID.sub("-", _cleaned_company_id(company_id)).strip("-").lower()
    if not cleaned:
        raise ValueError("company_id is required to open a Chroma collection")
    name = f"{CHROMA_COLLECTION_PREFIX}-{cleaned}"
    if len(name) < 3:
        name = f"{name}-x"
    return name[:63]


def _scalar_metadata(metadata: dict) -> dict:
    allowed = {}
    for key, value in metadata.items():
        if value is None:
            continue
        if isinstance(value, (str, int, float, bool)):
            allowed[str(key)] = value
        else:
            allowed[str(key)] = str(value)
    return allowed


class ChromaStore:
    """One persist dir; one Chroma collection per company_id."""

    _instance: "ChromaStore | None" = None

    def __init__(self, persist_dir: Path | str = CHROMA_DIR) -> None:
        self.persist_dir = Path(persist_dir)
        self.persist_dir.mkdir(parents=True, exist_ok=True)
        self._client = PersistentClient(path=str(self.persist_dir))
        self._collections: dict[str, Collection] = {}
        logger.info("Opened Chroma client at %s", self.persist_dir)

    @classmethod
    def instance(cls) -> "ChromaStore":
        """Shared process-wide store (default persist dir)."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def get_client(self) -> PersistentClient:
        return self._client

    def get_collection(self, company_id: str) -> Collection:
        name = _collection_name(company_id)
        if name not in self._collections:
            self._collections[name] = self._client.get_or_create_collection(
                name=name,
                metadata={
                    "hnsw:space": "cosine",
                    "company_id": _cleaned_company_id(company_id),
                },
            )
            logger.info("Using Chroma collection %s", name)
        return self._collections[name]

    def upsert_chunks(
        self,
        chunks: list[Document],
        embeddings: np.ndarray,
        company_id: str,
    ) -> None:
        if len(chunks) != len(embeddings):
            raise ValueError(
                f"chunks ({len(chunks)}) and embeddings ({len(embeddings)}) length mismatch"
            )
        if not chunks:
            return

        cid = _cleaned_company_id(company_id)
        ids: list[str] = []
        documents: list[str] = []
        metadatas: list[dict] = []
        for index, chunk in enumerate(chunks):
            meta = dict(chunk.metadata)
            meta["company_id"] = cid
            chunk_id = str(meta.get("chunk_id") or f"{cid}:chunk:{index}")
            meta["chunk_id"] = chunk_id
            ids.append(chunk_id)
            documents.append(chunk.page_content)
            metadatas.append(_scalar_metadata(meta))

        self.get_collection(cid).upsert(
            ids=ids,
            embeddings=np.asarray(embeddings, dtype=np.float32).tolist(),
            documents=documents,
            metadatas=metadatas,
        )
        logger.info("Upserted %s chunks into %s", len(chunks), _collection_name(cid))

    def query_company(
        self,
        query_embedding: np.ndarray,
        company_id: str,
        k: int = 5,
    ) -> list[dict]:
        cid = _cleaned_company_id(company_id)
        vector = np.asarray(query_embedding, dtype=np.float32).reshape(-1)
        result = self.get_collection(cid).query(
            query_embeddings=[vector.tolist()],
            n_results=max(1, k),
            include=["documents", "metadatas", "distances"],
        )
        documents = (result.get("documents") or [[]])[0]
        metadatas = (result.get("metadatas") or [[]])[0]
        distances = (result.get("distances") or [[]])[0]
        ids = (result.get("ids") or [[]])[0]
        hits = []
        for index, text in enumerate(documents):
            hits.append(
                {
                    "id": ids[index] if index < len(ids) else "",
                    "text": text or "",
                    "metadata": metadatas[index] if index < len(metadatas) else {},
                    "distance": distances[index] if index < len(distances) else None,
                }
            )
        return hits
