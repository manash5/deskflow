from pathlib import Path

RAG_DIR = Path(__file__).resolve().parent
COMPANIES_DIR = RAG_DIR / "data" / "companies"

KNOWN_CATEGORIES = (
    "sales",
    "support",
    "account",
    "billing",
    "booking",
    "default",
    "general",
)

# Filename stem (or prefix) → retrieve category. Matches specialist routes.
CATEGORY_FROM_STEM = {
    "product_catalog": "sales",
    "sales": "sales",
    "support": "support",
    "support_guide": "support",
    "account": "account",
    "account_guide": "account",
    "billing": "billing",
    "billing_guide": "billing",
    "booking": "booking",
    "booking_guide": "booking",
    "company": "default",
    "company_guide": "default",
    "about": "default",
    "general": "general",
}

SUPPORTED_SUFFIXES = {".md", ".txt", ".pdf"}

# Short guides stay one chunk. Longer markdown is split on headings.
CHUNK_SIZE = 800
