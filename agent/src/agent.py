import os 
from dotenv import load_dotenv 
from langchain.chat_models import init_chat_model
from pathlib import Path 

load_dotenv()

MODEL = os.getenv("MISTRAL_MODEL", "mistral-medium-latest")

PROMPTS_DIR = Path(__file__).parent / "prompts"

def get_llm(): 
    return init_chat_model(
        model=MODEL,
        model_provider="mistralai",
        temperature = 0.2, 
        api_key = os.getenv("MISTRAL_API_KEY")
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


