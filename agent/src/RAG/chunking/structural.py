import re
from pathlib import Path

from langchain_core.documents import Document
from langchain_text_splitters import MarkdownHeaderTextSplitter

from RAG.config import CHUNK_SIZE

_HEADING = re.compile(r"(?m)^#{1,6}\s+\S")

_HEADER_SPLITTER = MarkdownHeaderTextSplitter(
    headers_to_split_on=[
        ("#", "h1"),
        ("##", "h2"),
        ("###", "h3"),
    ],
    strip_headers=False,
)


def _source_stem(document: Document) -> str:
    return Path(str(document.metadata.get("source", "doc"))).stem


def _assign_chunk_id(document: Document, index: int) -> Document:
    company = document.metadata.get("company_id") or "unknown"
    document.metadata["chunk_id"] = f"{company}:{_source_stem(document)}:{index}"
    return document


def _clone(parent: Document, text: str, index: int) -> Document:
    return _assign_chunk_id(
        Document(page_content=text.strip(), metadata=dict(parent.metadata)),
        index,
    )


def _has_heading(text: str) -> bool:
    return bool(_HEADING.search(text))


def _split_on_headings(text: str) -> list[str]:
    sections = [
        part.page_content.strip()
        for part in _HEADER_SPLITTER.split_text(text)
        if part.page_content.strip()
    ]
    return sections or [text.strip()]


def _chunk_one(document: Document) -> list[Document]:
    text = (document.page_content or "").strip()
    if not text:
        return []
    if len(text) <= CHUNK_SIZE or not _has_heading(text):
        return [_clone(document, text, 0)]

    sections = _split_on_headings(text) 
    if len(sections) <= 1:
        return [_clone(document, text, 0)]
    return [_clone(document, section, index) for index, section in enumerate(sections)]


def chunk_structural(documents: list[Document]) -> list[Document]:
    """
    Keep short company guides as one chunk. Split longer markdown on headings
    so a heading stays with its section. Metadata from the loader is copied;
    chunk_id is added as {company_id}:{source_stem}:{index}.
    """
    chunks: list[Document] = []
    for document in documents:
        chunks.extend(_chunk_one(document))
    return chunks
