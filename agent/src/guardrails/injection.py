import re

from guardrails.messages import BLOCKED_INJECTION
from guardrails.result import GuardrailResult

_PATTERNS = tuple(
    re.compile(pattern, re.IGNORECASE)
    for pattern in (
        r"\bignore (?:all )?(?:your )?(?:previous |prior |above )?(?:instructions|rules|guidelines|prompts)\b",
        r"\bdisregard (?:all )?(?:your )?(?:previous |prior )?(?:instructions|rules|guidelines)\b",
        r"\boverride (?:your )?(?:rules|instructions|safety|guidelines|policy)\b",
        r"\bforget (?:all )?(?:previous|your) instructions\b",
        r"\byou are now\b.{0,40}\b(unrestricted|jailbroken|dan|developer mode)\b",
        r"\b(?:enter|enable) (?:developer|god|dan) mode\b",
        r"\bjailbreak\b",
        r"\bdo not follow (?:your )?(?:system|safety|previous) (?:prompt|instructions|rules)\b",
        r"\b(?:reveal|show|print|dump|repeat|tell me|give me) (?:your |the )?(?:system prompt|hidden prompt|instructions)\b",
        r"\bwhat (?:is|are) your (?:system prompt|hidden instructions)\b",
        r"\bnew instructions?\s*:",
        r"\bfrom now on you (?:will|must|are)\b",
        r"\bact as if (?:you have )?no (?:rules|restrictions|safety|guidelines)\b",
        r"\bpretend (?:you (?:are|have)|to be) (?:an? )?(?:unrestricted|evil|uncensored)\b",
        r"\bthis is a (?:test|drill)[,:]? (?:ignore|override|disable)\b",
        r"\bapprove (?:my |the )?(?:refund|chargeback|password reset) (?:anyway|regardless|now)\b.{0,30}\bignore\b",
        r"\bignore .{0,30}\b(?:approve|issue|process) (?:my |the )?refund\b",
    )
)


def check_injection(text: str) -> GuardrailResult:
    matched = [
        f"pattern_{index}"
        for index, pattern in enumerate(_PATTERNS)
        if pattern.search(text)
    ]
    if not matched:
        return GuardrailResult(passed=True, action="allow", text=text)

    return GuardrailResult(
        passed=False,
        action="block",
        reason="prompt_injection",
        text=BLOCKED_INJECTION,
        findings=matched,
    )
