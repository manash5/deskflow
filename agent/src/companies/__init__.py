from companies.scalina import COMPANY as SCALINA

DEFAULT_COMPANY_ID = SCALINA["id"]

REGISTRY = {
    SCALINA["id"]: SCALINA,
}


def get_company(company_id: str) -> dict:
    try:
        return REGISTRY[company_id]
    except KeyError as exc:
        known = ", ".join(sorted(REGISTRY))
        raise KeyError(
            f"Unknown company_id {company_id!r}. Known: {known or '(none)'}"
        ) from exc


__all__ = [
    "DEFAULT_COMPANY_ID",
    "REGISTRY",
    "SCALINA",
    "get_company",
]
