import re

from guardrails.messages import BLOCKED_TOPIC
from guardrails.result import GuardrailResult

_CHECKS = (
    (
        "medical",
        re.compile(
            r"\b("
            r"diagnos(?:e|is|ing) me|what medication should i|"
            r"prescri(?:be|ption) for|is this (?:a )?(?:disease|infection|cancer)|"
            r"medical advice|how much (?:xanax|adderall|oxycodone)"
            r")\b",
            re.IGNORECASE,
        ),
    ),
    (
        "legal",
        re.compile(
            r"\b("
            r"legal advice|file a lawsuit|should i sue|"
            r"is this (?:illegal|against the law)|draft (?:a )?contract|"
            r"represent me in court"
            r")\b",
            re.IGNORECASE,
        ),
    ),
    (
        "crime",
        re.compile(
            r"\b("
            r"how to (?:hack|steal|launder|make a bomb|pick a lock)|"
            r"commit (?:fraud|a crime)|evade (?:taxes|the police)"
            r")\b",
            re.IGNORECASE,
        ),
    ),
    (
        "weapons",
        re.compile(
            r"\b("
            r"how to (?:buy|build|make) (?:a )?(?:gun|firearm|explosive)|"
            r"undetectable (?:gun|weapon)"
            r")\b",
            re.IGNORECASE,
        ),
    ),
)


def check_topic(text: str) -> GuardrailResult:
    findings = [label for label, pattern in _CHECKS if pattern.search(text)]
    if not findings:
        return GuardrailResult(passed=True, action="allow", text=text)

    return GuardrailResult(
        passed=False,
        action="block",
        reason="denied_topic",
        text=BLOCKED_TOPIC,
        findings=findings,
    )
