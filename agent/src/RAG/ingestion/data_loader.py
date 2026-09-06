import logging
from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_core.documents import Document

from RAG.config import (
    CATEGORY_FROM_STEM,
    KNOWN_CATEGORIES,
    COMPANIES_DIR,
    SUPPORTED_SUFFIXES,
)

logger = logging.getLogger(__name__)


class LoadError(Exception):
    """Raised when one or more source files cannot be loaded."""


def _company_root(data_dir: Path | None, company_id: str | None) -> Path:
    if company_id and data_dir:
        return Path(data_dir) / company_id
    if company_id:
        return COMPANIES_DIR / company_id
    if data_dir:
        return Path(data_dir)
    raise ValueError("Pass company_id and/or data_dir (expected .../data/companies/<company_id>).")


def _infer_company_id(company_root: Path, company_id: str | None) -> str:
    if company_id:
        return company_id
    name = company_root.resolve().name
    if name:
        return name
    raise LoadError(f"Cannot infer company_id from {company_root}")


def _category_from_path(path: Path) -> str:
    stem = path.stem.lower().replace("-", "_")
    if stem in CATEGORY_FROM_STEM:
        return CATEGORY_FROM_STEM[stem]
    for key, category in CATEGORY_FROM_STEM.items():
        if stem.startswith(f"{key}_") or stem.startswith(f"{key}-"):
            return category
    for part in path.parts:
        key = part.lower()
        if key in KNOWN_CATEGORIES:
            return key
    return "general"


def _tag(documents: list[Document], path: Path, company_id: str) -> list[Document]:
    category = _category_from_path(path)
    for doc in documents:
        doc.metadata["company_id"] = company_id
        doc.metadata["source"] = str(path.resolve())
        doc.metadata["category"] = category
        doc.metadata["file_type"] = path.suffix.lower().lstrip(".")
    return documents


def _loader_for(path: Path) -> TextLoader | PyPDFLoader:
    suffix = path.suffix.lower()
    if suffix in {".md", ".txt"}:
        return TextLoader(str(path), encoding="utf-8")
    if suffix == ".pdf":
        return PyPDFLoader(str(path))
    raise LoadError(f"Unsupported file type: {path}")


def _source_files(company_root: Path) -> list[Path]:
    files = sorted(
        path
        for path in company_root.rglob("*")
        if path.is_file() and path.suffix.lower() in SUPPORTED_SUFFIXES
    )
    return files


def load_documents(
    data_dir: str | Path | None = None,
    company_id: str | None = None,
) -> list[Document]:
    """
    Load company files as LangChain documents.

    Expected layout: data/companies/<company_id>/**/*.{md,txt,pdf}

    Each document is tagged with company_id, source, category, and file_type.
    Fails if the folder is missing, empty, or any file fails to load.
    """
    root = _company_root(Path(data_dir) if data_dir else None, company_id)
    root = root.resolve()
    if not root.is_dir():
        raise FileNotFoundError(
            f"Company data folder not found: {root}. "
            f"Put files under {COMPANIES_DIR / (company_id or '<company_id>')}"
        )

    resolved_id = _infer_company_id(root, company_id)
    files = _source_files(root)
    if not files:
        raise LoadError(
            f"No .md, .txt, or .pdf files under {root}. "
            "Image-only PDFs may load as empty pages and are dropped later."
        )

    documents: list[Document] = []
    errors: list[str] = []

    for path in files:
        try:
            loaded = _loader_for(path).load()
        except Exception as exc:
            errors.append(f"{path}: {exc}")
            continue

        nonempty = [doc for doc in loaded if (doc.page_content or "").strip()]
        if not nonempty:
            logger.warning("Skipped empty extract: %s", path)
            continue
        documents.extend(_tag(nonempty, path, resolved_id))
        logger.info(
            "Loaded %s docs from %s (company_id=%s, category=%s)",
            len(nonempty),
            path.name,
            resolved_id,
            _category_from_path(path),
        )

    if errors:
        raise LoadError("Failed to load source files:\n" + "\n".join(errors))
    if not documents:
        raise LoadError(f"Loaded 0 non-empty documents from {root}")

    logger.info("Loaded %s documents for company_id=%s", len(documents), resolved_id)
    return documents
