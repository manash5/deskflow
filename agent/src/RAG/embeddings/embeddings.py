import logging

import numpy as np
from langchain_core.documents import Document
from sentence_transformers import SentenceTransformer

from RAG.config import EMBEDDING_MODEL

logger = logging.getLogger(__name__)

_model: SentenceTransformer | None = None


def get_embedding_model() -> SentenceTransformer:
    """Load the sentence-transformers model once per process."""
    global _model
    if _model is None:
        _model = SentenceTransformer(EMBEDDING_MODEL)
        logger.info("Loaded embedding model %s", EMBEDDING_MODEL)
    return _model


def embed_chunks(
    chunks: list[Document],
    model: SentenceTransformer | None = None,
    *,
    show_progress_bar: bool = False,
) -> np.ndarray:
    """Embed chunk page_content. Pass a model (or reuse the process singleton)."""
    encoder = model or get_embedding_model()
    texts = [chunk.page_content for chunk in chunks]
    if not texts:
        dim = encoder.get_sentence_embedding_dimension()
        return np.zeros((0, dim), dtype=np.float32)

    embeddings = encoder.encode(
        texts,
        show_progress_bar=show_progress_bar,
        normalize_embeddings=True,
    )
    logger.info("Embedded %s chunks, shape=%s", len(chunks), embeddings.shape)
    return np.asarray(embeddings, dtype=np.float32)
