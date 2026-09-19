import logging
from pathlib import Path

from RAG.chunking import chunk_recursive, chunk_structural
from RAG.config import RETRIEVE_K
from RAG.embeddings.embeddings import EmbeddingModel
from RAG.ingestion import load_documents
from RAG.vectorstore.chroma import ChromaStore

logger = logging.getLogger(__name__)


class Pipeline:
    """Ingest company files into Chroma; retrieve passages for a question."""

    _instance: "Pipeline | None" = None

    def __init__(self) -> None:
        self.embedder = EmbeddingModel.instance()
        self.store = ChromaStore.instance()

    @classmethod
    def instance(cls) -> "Pipeline":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def ingest(self, company_id: str, data_dir: str | Path | None = None) -> dict:
        docs = load_documents(company_id=company_id, data_dir=data_dir)
        chunks = chunk_recursive(chunk_structural(docs))
        if not chunks:
            raise ValueError(f"No chunks produced for company_id={company_id!r}")

        embeddings = self.embedder.embed_chunks(chunks, show_progress_bar=True)
        self.store.upsert_chunks(chunks, embeddings, company_id)
        result = {
            "company_id": company_id,
            "documents": len(docs),
            "chunks": len(chunks),
        }
        logger.info(
            "Ingested %s documents → %s chunks for %s",
            result["documents"],
            result["chunks"],
            company_id,
        )
        return result

    def retrieve(
        self,
        question: str,
        company_id: str,
        k: int | None = None,
    ) -> str:
        text = (question or "").strip()
        if not text:
            return ""

        vector = self.embedder.embed_query(text)
        hits = self.store.query_company(vector, company_id, k=k or RETRIEVE_K)
        passages = [hit["text"].strip() for hit in hits if (hit.get("text") or "").strip()]
        return "\n\n".join(passages)


if __name__ == "__main__":
    import sys

    logging.basicConfig(level=logging.INFO)
    target = sys.argv[1] if len(sys.argv) > 1 else "scalina"
    print(Pipeline.instance().ingest(target))

