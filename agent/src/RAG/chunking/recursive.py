from pathlib import Path

from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from RAG.config import CHUNK_OVERLAP, CHUNK_SIZE

# Coarser breaks first. Include no-newline forms so a heading on line 1 still splits.
_SEPARATORS = [
    "\n# ",
    "# ",
    "\n## ",
    "## ",
    "\n### ",
    "### ",
    "\n\n",
    "\n",
    ". ",
    " ",
    "",
]


def _source_stem(document: Document) -> str:
    return Path(str(document.metadata.get("source", "doc"))).stem


def _assign_chunk_ids(chunks: list[Document]) -> list[Document]:
    counts: dict[str, int] = {}
    for chunk in chunks:
        company = chunk.metadata.get("company_id") or "unknown"
        stem = _source_stem(chunk)
        key = f"{company}:{stem}"
        index = counts.get(key, 0)
        counts[key] = index + 1
        chunk.metadata["chunk_id"] = f"{key}:{index}"
    return chunks


def chunk_recursive(
    documents: list[Document],
    chunk_size: int = CHUNK_SIZE,
    chunk_overlap: int = CHUNK_OVERLAP,
) -> list[Document]:
    """Split documents to about chunk_size characters, preferring headings then paragraphs."""
    if chunk_size <= 0:
        raise ValueError("chunk_size must be positive")
    if chunk_overlap < 0:
        raise ValueError("chunk_overlap must be >= 0")
    if chunk_overlap >= chunk_size:
        raise ValueError("chunk_overlap must be smaller than chunk_size")

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=_SEPARATORS,
    )
    return _assign_chunk_ids(splitter.split_documents(documents))

    