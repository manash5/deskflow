from typing import TypedDict

from langgraph.graph import END, START, StateGraph

from agents import (
    account_agent,
    billing_agent,
    booking_agent,
    default_agent,
    reviewer_agent,
    router_agent,
    sales_agent,
    support_agent,
)
from guardrails import (
    check_injection,
    check_input_moderation,
    check_input_pii,
    check_output_moderation,
    check_output_pii,
    check_permissions,
    check_policy,
    check_topic,
    run_rail,
)


class AgentState(TypedDict):
    question: str
    company: dict
    categories: list[str]
    confidence: float
    draft: str
    answer: str
    blocked: bool
    block_reason: str
    trace: list[str]


def _append_trace(trace: list[str], rail: str, result) -> list[str]:
    detail = result.reason or result.action
    if result.findings:
        detail = f"{detail} [{', '.join(result.findings)}]"
    return trace + [f"{rail}: {result.action} ({detail})"]


def input_guardrails(state: AgentState) -> dict:
    """
    Pre-model rails, in order:
    PII redact → moderation → prompt injection → topic → permissions.
    Fail closed. Never put raw secrets in trace.
    """
    question = state.get("question") or ""
    trace = list(state.get("trace") or [])

    pii = run_rail("input_pii", check_input_pii, question)
    trace = _append_trace(trace, "input_pii", pii)
    if not pii.passed:
        return {
            "blocked": True,
            "block_reason": pii.reason,
            "answer": pii.text,
            "trace": trace,
        }
    question = pii.text

    for name, fn, args in (
        ("input_moderation", check_input_moderation, (question,)),
        ("injection", check_injection, (question,)),
        ("topic", check_topic, (question,)),
        (
            "permissions",
            check_permissions,
            (state.get("company"), state.get("categories")),
        ),
    ):
        result = run_rail(name, fn, *args)
        trace = _append_trace(trace, name, result)
        if not result.passed:
            return {
                "question": question,
                "blocked": True,
                "block_reason": result.reason,
                "answer": result.text,
                "trace": trace,
            }

    return {
        "question": question,
        "blocked": False,
        "block_reason": "",
        "trace": trace,
    }


def output_guardrails(state: AgentState) -> dict:
    """
    Post-model rails, in order:
    PII leak redact → output moderation → policy / business rules.
    Fail closed. Reviewer output is not trusted on its own.
    """
    answer = state.get("answer") or state.get("draft") or ""
    trace = list(state.get("trace") or [])

    pii = run_rail("output_pii", check_output_pii, answer)
    trace = _append_trace(trace, "output_pii", pii)
    if not pii.passed:
        return {
            "blocked": True,
            "block_reason": pii.reason,
            "answer": pii.text,
            "trace": trace,
        }
    answer = pii.text

    for name, fn in (
        ("output_moderation", check_output_moderation),
        ("policy", check_policy),
    ):
        result = run_rail(name, fn, answer)
        trace = _append_trace(trace, name, result)
        if not result.passed:
            return {
                "blocked": True,
                "block_reason": result.reason,
                "answer": result.text,
                "trace": trace,
            }

    return {
        "answer": answer,
        "blocked": False,
        "block_reason": "",
        "trace": trace,
    }
