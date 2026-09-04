import re

from guardrails.result import GuardrailResult

# Full PAN is redacted. Emails/phones are masked so the agent can still use them.
_CARD_CANDIDATE = re.compile(r"(?<!\d)(?:\d[ -]?){12,18}\d(?!\d)")
_CVV = re.compile(
    r"\b(?:cvv2?|cvc2?|cid|security code)(?:\s*(?:is|:|=))?\s*\d{3,4}\b",
    re.IGNORECASE,
)
_SSN = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
_OTP = re.compile(
    r"\b(?:otp|one[ -]?time (?:code|pass(?:word)?)|2fa code|verification code)"
    r"(?:\s*(?:is|:|=))?\s*\d{4,8}\b",
    re.IGNORECASE,
)
_PASSWORD = re.compile(
    r"\b(?:password|passwd|pwd)\s*[:=]\s*\S+",
    re.IGNORECASE,
)
_API_KEY = re.compile(
    r"\b(?:sk|pk|api[_-]?key)[-_]?[A-Za-z0-9]{16,}\b",
    re.IGNORECASE,
)
_EMAIL = re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.IGNORECASE)
_PHONE = re.compile(
    r"\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b"
)


def _luhn_ok(number: str) -> bool:
    digits = [int(ch) for ch in number if ch.isdigit()]
    if not 13 <= len(digits) <= 19:
        return False
    checksum = 0
    for i, digit in enumerate(reversed(digits)):
        if i % 2 == 1:
            digit *= 2
            if digit > 9:
                digit -= 9
        checksum += digit
    return checksum % 10 == 0


def _redact_cards(text: str, findings: list[str]) -> str:
    def replace(match: re.Match[str]) -> str:
        raw = match.group(0)
        if not _luhn_ok(raw):
            return raw
        digits = [ch for ch in raw if ch.isdigit()]
        findings.append("pan")
        return f"[CARD ...{''.join(digits[-4:])}]"

    return _CARD_CANDIDATE.sub(replace, text)


def _mask_email(match: re.Match[str]) -> str:
    email = match.group(0)
    local, _, domain = email.partition("@")
    if not local or not domain:
        return "[EMAIL]"
    visible = local[0]
    return f"{visible}***@{domain}"


def _mask_phone(match: re.Match[str]) -> str:
    digits = [ch for ch in match.group(0) if ch.isdigit()]
    last4 = "".join(digits[-4:]) if len(digits) >= 4 else "****"
    return f"[PHONE ...{last4}]"


def _redact_pii(text: str) -> tuple[str, list[str]]:
    findings: list[str] = []
    redacted = text

    redacted = _redact_cards(redacted, findings)

    for pattern, label, replacement in (
        (_CVV, "cvv", "[CVV]"),
        (_SSN, "ssn", "[SSN]"),
        (_OTP, "otp", "[OTP]"),
        (_PASSWORD, "password", "password: [REDACTED]"),
        (_API_KEY, "api_key", "[API_KEY]"),
    ):
        if pattern.search(redacted):
            findings.append(label)
            redacted = pattern.sub(replacement, redacted)

    if _EMAIL.search(redacted):
        findings.append("email")
        redacted = _EMAIL.sub(_mask_email, redacted)

    if _PHONE.search(redacted):
        findings.append("phone")
        redacted = _PHONE.sub(_mask_phone, redacted)

    # Deduplicate while keeping order
    seen: set[str] = set()
    unique = []
    for item in findings:
        if item not in seen:
            seen.add(item)
            unique.append(item)

    return redacted, unique


def check_input_pii(text: str) -> GuardrailResult:
    """Redact secrets before the question hits a model or a log."""
    redacted, findings = _redact_pii(text)
    if not findings:
        return GuardrailResult(passed=True, action="allow", text=text)

    return GuardrailResult(
        passed=True,
        action="redact",
        reason="input_pii",
        text=redacted,
        findings=findings,
    )


def check_output_pii(text: str) -> GuardrailResult:
    """Stop the reply from leaking PAN, secrets, or unmasked identifiers."""
    redacted, findings = _redact_pii(text)
    if not findings:
        return GuardrailResult(passed=True, action="allow", text=text)

    return GuardrailResult(
        passed=True,
        action="redact",
        reason="output_pii",
        text=redacted,
        findings=findings,
    )
