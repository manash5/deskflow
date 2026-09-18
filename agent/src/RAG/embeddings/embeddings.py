import logging

import numpy as np
from langchain_core.documents import Document
from sentence_transformers import SentenceTransformer

from RAG.config import EMBEDDING_MODEL

logger = logging.getLogger(__name__)


class EmbeddingModel:
    """Loads MiniLM once on this instance and embeds chunk text."""

    _instance: "EmbeddingModel | None" = None

    def __init__(self, model_name: str = EMBEDDING_MODEL) -> None:
        self.model_name = model_name
        self._model = SentenceTransformer(model_name)
        logger.info("Loaded embedding model %s", model_name)

    @classmethod
    def instance(cls) -> "EmbeddingModel":
        """Shared process-wide embedder so weights are not reloaded."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def embed_chunks(
        self,
        chunks: list[Document],
        *,
        show_progress_bar: bool = False,
    ) -> np.ndarray:
        texts = [chunk.page_content for chunk in chunks]
        if not texts:
            dim = (
                self._model.get_sentence_embedding_dimension()
                if hasattr(self._model, "get_sentence_embedding_dimension")
                else self._model.get_embedding_dimension()
            )
            return np.zeros((0, dim), dtype=np.float32)

        embeddings = self._model.encode(
            texts,
            show_progress_bar=show_progress_bar,
            normalize_embeddings=True,
        )
        logger.info("Embedded %s chunks, shape=%s", len(chunks), embeddings.shape)
        return np.asarray(embeddings, dtype=np.float32)

    def embed_query(self, text: str) -> np.ndarray:
        vector = self._model.encode(
            [text],
            show_progress_bar=False,
            normalize_embeddings=True,
        )
        return np.asarray(vector, dtype=np.float32).reshape(-1)
