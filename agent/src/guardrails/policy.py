import re

from guardrails.messages import BLOCKED_POLICY
from guardrails.result import GuardrailResult

_CHECKS = (
    (
        "refund_promise",
        re.compile(
            r"\b("
            r"(?:you (?:will be|are|have been)|we(?:'ve| have)|i(?:'ve| have)) "
            r"refunded|"
            r"refund(?:ed)? (?:today|immediately|right now|instantly|within minutes)|"
            r"(?:issue|issued|processed|completed) (?:a |the |your )?refund"
            r")\b",
            re.IGNORECASE,
        ),
    ),
    (
        "unsupported_guarantee",
        re.compile(
            r"\b("
            r"100%\s*(?:guaranteed|fixed|sure)|"
            r"we (?:will|can) (?:definitely|certainly) (?:fix|resolve) this"
            r")\b",
            re.IGNORECASE,
        ),
    ),
    (
        "completed_reset",
        re.compile(
            r"\b("
            r"password (?:has been|is(?: now)?) reset|"
            r"(?:i(?:'ve| have)|we(?:'ve| have)) reset your password|"
            r"your (?:email|phone|profile) (?:has been|is now) (?:updated|changed)"
            r")\b",
            re.IGNORECASE,
        ),
    ),
    (
        "completed_booking",
        re.compile(
            r"\b("
            r"(?:booking|reservation|appointment) (?:is |has been )?(?:confirmed|complete|booked)|"
            r"(?:i(?:'ve| have)|we(?:'ve| have)) (?:booked|confirmed) your"
            r")\b",
            re.IGNORECASE,
        ),
    ),
    (
        "requests_secrets",
        re.compile(
            r"\b("
            r"(?:send|share|give|tell|enter|provide|type) (?:me )?(?:your )?"
            r"(?:password|otp|one[ -]?time code|cvv|cvc|pin|full (?:card|credit card)(?: number)?|ssn)|"
            r"(?:what is|what's) your (?:password|cvv|otp|pin)"
            r")\b",
            re.IGNORECASE,
        ),
    ),
)


def check_policy(text: str) -> GuardrailResult:
    findings = [label for label, pattern in _CHECKS if pattern.search(text)]
    if not findings:
        return GuardrailResult(passed=True, action="allow", text=text)

    return GuardrailResult(
        passed=False,
        action="block",
        reason="policy_violation",
        text=BLOCKED_POLICY,
        findings=findings,
    )
