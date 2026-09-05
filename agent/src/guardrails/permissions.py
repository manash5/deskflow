from guardrails.messages import BLOCKED_PERMISSIONS
from guardrails.result import GuardrailResult

DEFAULT_ENABLED_AGENTS = ("sales", "support", "account", "billing", "booking", "default")


def check_permissions(company: dict | None, categories: list[str] | None = None) -> GuardrailResult:
    """Deterministic tenant/agent allowlist. Not an LLM check."""
    if not company or not str(company.get("name") or "").strip():
        return GuardrailResult(
            passed=False,
            action="block",
            reason="missing_company",
            text=BLOCKED_PERMISSIONS,
            findings=["missing_company"],
        )

    if not str(company.get("id") or "").strip():
        return GuardrailResult(
            passed=False,
            action="block",
            reason="missing_company_id",
            text=BLOCKED_PERMISSIONS,
            findings=["missing_company_id"],
        )

    enabled = company.get("enabled_agents") or list(DEFAULT_ENABLED_AGENTS)
    enabled_set = {str(agent) for agent in enabled}

    requested = [c for c in (categories or []) if c]
    if requested:
        denied = [agent for agent in requested if agent not in enabled_set]
        if denied:
            return GuardrailResult(
                passed=False,
                action="block",
                reason="agent_not_enabled",
                text=BLOCKED_PERMISSIONS,
                findings=denied,
            )

    return GuardrailResult(passed=True, action="allow", findings=["company_ok"])
