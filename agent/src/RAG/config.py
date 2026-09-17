from pathlib import Path

RAG_DIR = Path(__file__).resolve().parent
COMPANIES_DIR = RAG_DIR / "data" / "companies"

SUPPORTED_SUFFIXES = {".md", ".txt", ".pdf"}

# Short guides stay one chunk. Longer markdown is split on headings.
CHUNK_SIZE = 800
