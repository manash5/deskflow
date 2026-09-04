from typing import TypedDict, Literal
from langgraph.graph import StateGraph, START, END 

from agents import (
    router_agent, 
    sales_agent, 
    support_agent, 
    billing_agent, 
    booking_agent, 
    default_agent, 
    reviewer_agent, 
    account_agent, 
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

