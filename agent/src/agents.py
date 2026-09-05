import os 
from dotenv import load_dotenv 
from langchain.chat_models import init_chat_model
from pathlib import Path 
from langchain_core.messages import SystemMessage, HumanMessage
from jinja2 import Template
import json 

load_dotenv()

MODEL = os.getenv("MISTRAL_MODEL", "mistral-medium-latest")
REVIEW_MODEL = os.getenv("THINKING_MODEL", "qwen/qwen3.8-27b")
THINKING_MODEL_2 = os.getenv(
    "THINKING_MODEL_2",
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
)
FAST_MODEL = os.getenv("FAST_MODEL", "gemini-2.5-flash")
SECOND_MODEL = os.getenv("SECOND_MODEL", "openai/gpt-oss-120b")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

PROMPTS_DIR = Path(__file__).parent / "prompts"

ENABLED_AGENTS = ["sales", "support", "account", "billing", "booking", "default"]
CONFIDENCE_THRESHOLD = 0.6
DEFAULT_PERSONA = (PROMPTS_DIR / "persona.md").read_text(encoding="utf-8")

# ---- LLM Model -------------
def get_llm(): 
    return init_chat_model(
        model=MODEL,
        model_provider="mistralai",
        temperature = 0.2, 
        api_key = os.getenv("MISTRAL_API_KEY")
    )

def get_second_llm(): 
    return init_chat_model(
        model = SECOND_MODEL, 
        model_provider = "groq", 
        temperature = 0.2, 
        api_key = os.getenv('GROQ_API_KEY')
    )

# qwen thinking model 
def get_thinking_llm(): 
    return init_chat_model(
        model = REVIEW_MODEL, 
        model_provider = "groq",
        temperature =0,
        api_key = os.getenv("GROQ_API_KEY")
    )


def get_thinking_model2():
    """OpenRouter free reasoning model — used for review and support."""
    return init_chat_model(
        model=THINKING_MODEL_2,
        model_provider="openai",
        temperature=0,
        api_key=os.getenv("OPEN_ROUTER_KEY"),
        base_url=OPENROUTER_BASE_URL,
    )

# groq model 
def get_fast_model(): 
    return init_chat_model(
        model = FAST_MODEL, 
        model_provider = "google_genai",
        temperature = 0.2,
        api_key = os.getenv("GEMINI_API_KEY")
    )

def _company_enabled_agents(company: dict) -> list[str]:
    enabled = company.get("enabled_agents") or ENABLED_AGENTS
    return [agent for agent in enabled if agent in ENABLED_AGENTS]


# managing raw outputs 
def _parse_router_output(raw: str, enabled_agents: list[str] | None = None) -> dict:
    allowed = set(enabled_agents or ENABLED_AGENTS)
    text = raw.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()

    try:
        data = json.loads(text)
        categories = [
            c for c in data.get("categories", [])
            if c in allowed
        ]
        confidence = float(data.get("confidence", 0))
    except (json.JSONDecodeError, TypeError, ValueError):
        return {"categories": ["default"], "confidence": 0.0}

    if not categories or confidence < CONFIDENCE_THRESHOLD:
        if "default" in allowed:
            categories = ["default"]
        elif allowed:
            categories = [next(iter(allowed))]
        else:
            categories = ["default"]

    return {"categories": categories, "confidence": confidence}


def customer_handoff(company: dict) -> str:
    name = (company.get("name") or "the team").strip()
    contact = (company.get("contact_email") or "").strip()
    if contact:
        return (
            f"I don't have enough confirmed information to finish this. "
            f"Please email {contact} and a teammate at {name} will help."
        )
    return (
        f"I don't have enough confirmed information to finish this. "
        f"Please contact {name} and a teammate will help."
    )


def apply_escalation(answer: str, company: dict) -> dict:
    """Rewrite an internal ESCALATE line into a customer-facing handoff."""
    text = (answer or "").strip()
    first = text.splitlines()[0].strip() if text else ""
    if first.upper().startswith("ESCALATE:"):
        reason = first.split(":", 1)[1].strip()
        return {
            "answer": customer_handoff(company),
            "escalated": True,
            "escalate_reason": reason,
        }
    return {"answer": answer, "escalated": False, "escalate_reason": ""}


# --------Agents ---------------

# Router agent 
def router_agent(question: str, company: dict) -> dict: 
    llm = get_fast_model()
    template = Template((PROMPTS_DIR / "router_agent.md").read_text(encoding="utf-8"))
    enabled_agents = _company_enabled_agents(company)
    system = template.render(
        company_name=company["name"],
        enabled_agents=json.dumps(enabled_agents),
        confidence_threshold=CONFIDENCE_THRESHOLD,
    )
    messages = [
        SystemMessage(content=system),
        HumanMessage(content=question),
    ]
    raw = llm.invoke(messages).content
    return _parse_router_output(raw, enabled_agents)

# sales agent 
def sales_agent(question: str, company: dict) -> dict:
    llm = get_fast_model()
    template = Template((PROMPTS_DIR / "sales_agent.md").read_text(encoding="utf-8"))
    system = template.render(
        company_name=company["name"],
        persona=company.get("persona") or DEFAULT_PERSONA,
        product_catalog=company.get("product_catalog") or "No product catalog provided.", # later when RAG is used we will remove these kind of things 
    )
    messages = [
        SystemMessage(content=system),
        HumanMessage(content=question),
    ]
    draft = llm.invoke(messages).content
    return {"draft": draft}


# support agent 
def support_agent(question: str, company: dict) -> dict:
    llm = get_thinking_model2()
    template = Template((PROMPTS_DIR / "support_agent.md").read_text(encoding="utf-8"))
    system = template.render(
        company_name=company["name"],
        persona=company.get("persona") or DEFAULT_PERSONA,
        support_guide=company.get("support_guide") or "No support guide provided.",
    )
    messages = [
        SystemMessage(content=system),
        HumanMessage(content=question),
    ]
    draft = llm.invoke(messages).content
    return {"draft": draft}


# Account agent 
def account_agent(question: str, company: dict) -> dict:
    llm = get_llm()
    template = Template((PROMPTS_DIR / "account_agent.md").read_text(encoding="utf-8"))
    system = template.render(
        company_name=company["name"],
        persona=company.get("persona") or DEFAULT_PERSONA,
        account_guide=company.get("account_guide") or "No account guide provided.",
    )
    messages = [
        SystemMessage(content=system),
        HumanMessage(content=question),
    ]
    draft = llm.invoke(messages).content
    return {"draft": draft}


# Billing agent 
def billing_agent(question: str, company: dict) -> dict:
    llm = get_second_llm()
    template = Template((PROMPTS_DIR / "billing_agent.md").read_text(encoding="utf-8"))
    system = template.render(
        company_name=company["name"],
        persona=company.get("persona") or DEFAULT_PERSONA,
        billing_guide=company.get("billing_guide") or "No billing guide provided.",
    )
    messages = [
        SystemMessage(content=system),
        HumanMessage(content=question),
    ]
    draft = llm.invoke(messages).content
    return {"draft": draft} 


# booking agent 
def booking_agent(question: str, company: dict) -> dict:
    llm = get_llm()
    template = Template((PROMPTS_DIR / "booking_agent.md").read_text(encoding="utf-8"))
    system = template.render(
        company_name=company["name"],
        persona=company.get("persona") or DEFAULT_PERSONA,
        booking_guide=company.get("booking_guide") or "No booking guide provided.",
    )
    messages = [
        SystemMessage(content=system),
        HumanMessage(content=question),
    ]
    draft = llm.invoke(messages).content
    return {"draft": draft} 

# Default agent 
def default_agent(question: str, company: dict) -> dict:
    llm = get_second_llm()
    template = Template((PROMPTS_DIR / "default_agent.md").read_text(encoding="utf-8"))
    system = template.render(
        company_name=company["name"],
        persona=company.get("persona") or DEFAULT_PERSONA,
        company_guide=company.get("company_guide") or "No company guide provided.",
    )
    messages = [
        SystemMessage(content=system),
        HumanMessage(content=question),
    ]
    draft = llm.invoke(messages).content
    return {"draft": draft}


# Review agent 
def reviewer_agent(
    question: str, draft: str, company: dict, context: str = ""
) -> dict:
    llm = get_thinking_model2()
    template = Template((PROMPTS_DIR / "review_agent.md").read_text(encoding="utf-8"))
    system = template.render(
        company_name=company["name"],
        persona=company.get("persona") or DEFAULT_PERSONA,
        retrieved_context=context or "No retrieved context.",
    )
    messages = [
        SystemMessage(content=system),
        HumanMessage(
            content=f"Customer question:\n{question}\n\nDraft answer:\n{draft}"
        ),
    ]
    answer = llm.invoke(messages).content
    return apply_escalation(answer, company)


