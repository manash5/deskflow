import re

from guardrails.messages import (
    BLOCKED_MODERATION,
    BLOCKED_OUTPUT_MODERATION,
    BLOCKED_SELF_HARM,
)
from guardrails.result import GuardrailResult

_SELF_HARM = re.compile(
    r"\b("
    r"kill myself|killing myself|end my life|take my (?:own )?life|"
    r"want to die|wanna die|suicide|self[ -]?harm|cut myself|"
    r"don't want to (?:be )?alive|dont want to (?:be )?alive"
    r")\b",
    re.IGNORECASE,
)

_SEXUAL = re.compile(
    r"\b("
    r"child porn|child sexual|csam|sexual acts? with|"
    r"send nudes?|explicit sexual|pornograph"
    r")\b",
    re.IGNORECASE,
)

_HATE = re.compile(
    r"\b("
    r"hate (?:all )?(?:jews|muslims|christians|blacks|whites|gays|immigrants)|"
    r"racial slur|gas (?:the|all)|genocide against"
    r")\b",
    re.IGNORECASE,
)

_HARASSMENT = re.compile(
    r"\b("
    r"i(?:'?| wi)ll (?:kill|hurt|stab|shoot) you|"
    r"hope you die|kys\b|kill yourself|"
    r"you (?:are|r) (?:a )?piece of shit|fuck you(?:,)? (?:bitch|asshole)"
    r")\b",
    re.IGNORECASE,
)

_VIOLENCE = re.compile(
    r"\b("
    r"how to (?:make a bomb|build a bomb|shoot up)|"
    r"bomb (?:threat|instructions)|mass shooting"
    r")\b",
    re.IGNORECASE,
)

_CHECKS = (
    ("self_harm", _SELF_HARM),
    ("sexual", _SEXUAL),
    ("hate", _HATE),
    ("harassment", _HARASSMENT),
    ("violence", _VIOLENCE),
)


def _scan(text: str) -> list[str]:
    return [label for label, pattern in _CHECKS if pattern.search(text)]


def check_input_moderation(text: str) -> GuardrailResult:
    findings = _scan(text)
    if not findings:
        return GuardrailResult(passed=True, action="allow", text=text)

    self_harm = "self_harm" in findings
    return GuardrailResult(
        passed=False,
        action="block",
        reason="self_harm" if self_harm else "input_moderation",
        text=BLOCKED_SELF_HARM if self_harm else BLOCKED_MODERATION,
        findings=findings,
    )


def check_output_moderation(text: str) -> GuardrailResult:
    findings = _scan(text)
    if not findings:
        return GuardrailResult(passed=True, action="allow", text=text)

    return GuardrailResult(
        passed=False,
        action="block",
        reason="output_moderation",
        text=BLOCKED_SELF_HARM if "self_harm" in findings else BLOCKED_OUTPUT_MODERATION,
        findings=findings,
    )
