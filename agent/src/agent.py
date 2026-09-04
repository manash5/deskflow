import os 
from dotenv import load_dotenv 
from langchain.chat_models import init_chat_model
from pathlib import Path 

load_dotenv()

MODEL = os.getenv("MISTRAL_MODEL", "mistral-medium-latest")
REVIEW_MODEL = os.getenv("THINKING_MODEL", "qwen/qwen3.8-27b")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

PROMPTS_DIR = Path(__file__).parent / "prompts"

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
        model_provider = "groq"
        temperature =0
        api_key = os.getenv("GROQ_API_KEY")
    )

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

# sales agent 
def sales_agent(question: str) -> str: 
    llm = get_llm()
    template = (PROMPTS_DIR/"sales_agent.md").read_text(encoding = 'utf-8')
    prompt = template.format(question = question)
    return llm.invoke(prompt).content

# Review agent 
def reviewer_agent(question: str, draft: str) -> str: 
    llm = get_thinking_llm() 
    template = (PROMPTS_DIR/"review_agent.md").read_text(encoding = 'utf-8')
    prompt = template.format(question = question, draft = draft)
    return llm.invoke(prompt).content


# Router agent 
def router_agent(question: str)-> str: 
    llm = get_thinking_llm()
    template = (PROMPTS_DIR/"router_agent.md").read_text(encoding = 'utf-8')
    prompt = template.format(question = question)
    return llm.invoke(prompt).content