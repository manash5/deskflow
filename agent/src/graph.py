from typing import TypedDict

from langgraph.graph import END, START, StateGraph

from agents import (
    ENABLED_AGENTS,
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
    route: str
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


AGENT_ROUTES = {
    "sales": "sales-agent",
    "support": "support-agent",
    "account": "account-agent",
    "billing": "billing-agent",
    "booking": "booking-agent",
    "default": "default-agent",
    "blocked": END,
}


def router_node(state: AgentState) -> dict:
    """Classify the question and store which specialist should run next."""
    if state.get("blocked"):
        return {"route": "blocked"}

    company = state.get("company") or {}
    decision = router_agent(state["question"], company)

    enabled = set(company.get("enabled_agents") or ENABLED_AGENTS)
    categories = [
        category
        for category in decision.get("categories") or []
        if category in enabled and category in AGENT_ROUTES
    ]
    if not categories:
        categories = ["default"]

    # Conditional edges need one next node. First category is the primary route;
    # extra categories stay on state for a later fan-out if you add one.
    route = categories[0]
    trace = list(state.get("trace") or [])
    trace = trace + [f"router: {route} ({decision.get('confidence', 0):.2f})"]

    return {
        "categories": categories,
        "confidence": decision.get("confidence", 0.0),
        "route": route,
        "trace": trace,
    }


def route_after_input(state: AgentState) -> str:
    """Skip the agents when input rails already blocked the request."""
    if state.get("blocked"):
        return "blocked"
    return "router"


def route_to_agent(state: AgentState) -> str:
    """Path function for add_conditional_edges after router_node."""
    if state.get("blocked"):
        return "blocked"
    route = state.get("route") or "default"
    if route not in AGENT_ROUTES:
        return "default"
    return route


def account_node(state: AgentState) -> dict:
    result = account_agent(state["question"], state["company"])
    return {
        "draft": result["draft"],
        "trace": list(state.get("trace") or []) + ["account: drafted"],
    }


def billing_node(state: AgentState) -> dict: 
    result = billing_agent(state['question'], state['company'])
    return {
        "draft": result["draft"], 
        "trace": list(state.get("trace") or []) + ["billing: drafted"], 
    }


def booking_node(state: AgentState) -> dict: 
    result = booking_agent(state['question'], state['company'])
    return {
        "draft": result["draft"], 
        "trace": list(state.get("trace") or []) + ["booking: drafted"]
    }


def sales_node(state: AgentState) -> dict:
    result = sales_agent(state["question"], state["company"])
    return {
        "draft": result["draft"],
        "trace": list(state.get("trace") or []) + ["sales: drafted"],
    }


def support_node(state: AgentState) -> dict:
    result = support_agent(state["question"], state["company"])
    return {
        "draft": result["draft"],
        "trace": list(state.get("trace") or []) + ["support: drafted"],
    }


def default_node(state: AgentState) -> dict:
    result = default_agent(state["question"], state["company"])
    return {
        "draft": result["draft"],
        "trace": list(state.get("trace") or []) + ["default: drafted"],
    }

def reviewer_node(state: AgentState) -> dict:
    result = reviewer_agent(state["question"], state["draft"], state["company"])
    return {
        "answer": result["answer"],
        "trace": list(state.get("trace") or []) + ["reviewer: reviewed"],
    }



# =================== Agent Workflow ===========================

builder = StateGraph(AgentState)

builder.add_node("input_guardrails", input_guardrails)
builder.add_node("router-agent", router_node)
builder.add_node("sales-agent", sales_node)
builder.add_node("account-agent", account_node)
builder.add_node("billing-agent", billing_node)
builder.add_node("booking-agent", booking_node)
builder.add_node("default-agent", default_node)
builder.add_node("support-agent", support_node)
builder.add_node("review-agent", reviewer_node)
builder.add_node("output_guardrails", output_guardrails)

builder.add_edge(START, "input_guardrails")
builder.add_conditional_edges(
    "input_guardrails",
    route_after_input,
    {
        "router": "router-agent",
        "blocked": END,
    },
)
builder.add_conditional_edges("router-agent", route_to_agent, AGENT_ROUTES)

builder.add_edge("account-agent", "review-agent")
builder.add_edge("billing-agent", "review-agent")
builder.add_edge("booking-agent", "review-agent")
builder.add_edge("default-agent", "review-agent")
builder.add_edge("sales-agent", "review-agent")
builder.add_edge("support-agent", "review-agent")
builder.add_edge("review-agent", "output_guardrails")
builder.add_edge("output_guardrails", END)

graph = builder.compile()

