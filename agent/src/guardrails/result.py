from dataclasses import dataclass, field
from typing import Callable, Literal

Action = Literal["allow", "redact", "block"]


@dataclass
class GuardrailResult:
    passed: bool
    action: Action
    reason: str = ""
    text: str = ""
    findings: list[str] = field(default_factory=list)


def fail_closed(rail_name: str) -> GuardrailResult:
    return GuardrailResult(
        passed=False,
        action="block",
        reason=f"{rail_name}_error",
        text=(
            "I can't complete that request right now. "
            "Please try again or ask for a human teammate."
        ),
        findings=["fail_closed"],
    )


def run_rail(name: str, fn: Callable[..., GuardrailResult], *args, **kwargs) -> GuardrailResult:
    try:
        return fn(*args, **kwargs)
    except Exception:
        return fail_closed(name)
