import os 
from dotenv import load_dotenv 
from langchain.chat_models import init_chat_model
from pathlib import Path 
from langchain_core.messages import HumanMessageChunk, SystemMessage, HumanMessage
from jinja2 import Template
import json 

load_dotenv()

MODEL = os.getenv("MISTRAL_MODEL", "mistral-medium-latest")
REVIEW_MODEL = os.getenv("THINKING_MODEL", "qwen/qwen3.8-27b")
FAST_MODEL = os.getenv("FAST_MODEL", "openai/gpt-oss-120b")

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

# qwen thinking model 
def get_thinking_llm(): 
    return init_chat_model(
        model = REVIEW_MODEL, 
        model_provider = "groq",
        temperature =0,
        api_key = os.getenv("GROQ_API_KEY")
    )

# groq model 
def get_fast_model(): 
    return init_chat_model(
        model = FAST_MODEL, 
        model_provider = "groq",
        temperature = 0.2,
        api_key = os.getenv("GROQ_API_KEY")
    )

# managing raw outputs 
def _parse_router_output(raw: str) -> dict:
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
            if c in ENABLED_AGENTS
        ]
        confidence = float(data.get("confidence", 0))
    except (json.JSONDecodeError, TypeError, ValueError):
        return {"categories": ["default"], "confidence": 0.0}

    if not categories or confidence < CONFIDENCE_THRESHOLD:
        categories = ["default"]

    return {"categories": categories, "confidence": confidence}


# --------Agents ---------------

# Router agent 
def router_agent(question: str, company: dict) -> dict: 
    llm = get_fast_model()
    template = Template((PROMPTS_DIR / "router_agent.md").read_text(encoding="utf-8"))
    system = template.render(
        company_name=company["name"],
        enabled_agents=json.dumps(ENABLED_AGENTS),
        confidence_threshold=CONFIDENCE_THRESHOLD,
    )
    messages = [
        SystemMessage(content=system),
        HumanMessage(content=question),
    ]
    raw = llm.invoke(messages).content
    return _parse_router_output(raw)

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
    llm = get_thinking_llm()
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


# booking agent 
def booking_agent(question: str) -> str: 
    llm = get_fast_model()
    template = (PROMPTS_DIR/"booking_agent.md").read_text(encoding = 'utf-8')
    prompt = template.format(question = question)
    return llm.invoke(prompt).content 

# technical agent 
def technical_agent(question: str)-> str: 
    llm= get_llm()
    template = (PROMPTS_DIR/"technical_agent.md").read_text(encoding = 'utf-8')
    prompt = template.format(question = question)
    return llm.invoke(prompt).content


# Billing agent 
def billing_agent(question: str) -> str: 
    llm = get_llm()
    template = (PROMPTS_DIR/"billing_agent.md").read_text(encoding = 'utf-8')
    prompt = template.format(question = question)
    return llm.invoke(prompt).content 



# Review agent 
def reviewer_agent(question: str, draft: str) -> str: 
    llm = get_thinking_llm() 
    template = (PROMPTS_DIR/"review_agent.md").read_text(encoding = 'utf-8')
    prompt = template.format(question = question, draft = draft)
    return llm.invoke(prompt).content


