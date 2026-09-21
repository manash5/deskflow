from __future__ import annotations

import json
from pathlib import Path

from companies.scalina import COMPANY as SCALINA

DEFAULT_COMPANY_ID = SCALINA["id"]
_DYNAMIC_PATH = Path(__file__).resolve().parent / "dynamic.json"

REGISTRY: dict[str, dict] = {
    SCALINA["id"]: dict(SCALINA),
}


def _load_dynamic() -> dict[str, dict]:
    if not _DYNAMIC_PATH.exists():
        return {}
    try:
        raw = json.loads(_DYNAMIC_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}
    if not isinstance(raw, dict):
        return {}
    overlay: dict[str, dict] = {}
    for key, value in raw.items():
        if isinstance(key, str) and isinstance(value, dict) and value.get("id"):
            overlay[key] = value
    return overlay


def _apply_overlay() -> None:
    for company_id, company in _load_dynamic().items():
        REGISTRY[company_id] = company


def persist_registry_overlay() -> None:
    builtins = {SCALINA["id"]}
    overlay = {
        company_id: company
        for company_id, company in REGISTRY.items()
        if company_id not in builtins or company != SCALINA
    }
    _DYNAMIC_PATH.write_text(
        json.dumps(overlay, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def upsert_company(payload: dict) -> dict:
    company_id = str(payload["id"]).strip()
    company = {
        **REGISTRY.get(company_id, {}),
        **payload,
        "id": company_id,
    }
    REGISTRY[company_id] = company
    persist_registry_overlay()
    return company


def get_company(company_id: str) -> dict:
    try:
        return REGISTRY[company_id]
    except KeyError as exc:
        known = ", ".join(sorted(REGISTRY))
        raise KeyError(
            f"Unknown company_id {company_id!r}. Known: {known or '(none)'}"
        ) from exc


_apply_overlay()

__all__ = [
    "DEFAULT_COMPANY_ID",
    "REGISTRY",
    "SCALINA",
    "get_company",
    "upsert_company",
]
