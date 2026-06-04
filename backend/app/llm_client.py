import os

from dotenv import load_dotenv
from openai import OpenAI

from .config import ENV_FILE


load_dotenv(ENV_FILE)

DEFAULT_GROQ_BASE_URL = "https://api.groq.com/openai/v1"
DEFAULT_GROQ_CHAT_MODEL = "llama-3.1-8b-instant"


def get_chat_model():
    return os.getenv("GROQ_CHAT_MODEL", DEFAULT_GROQ_CHAT_MODEL)


def get_llm_client():
    api_key = (os.getenv("GROQ_API_KEY") or "").strip()
    if not api_key:
        raise RuntimeError("Missing GROQ_API_KEY in backend/.env")

    base_url = (os.getenv("GROQ_BASE_URL") or DEFAULT_GROQ_BASE_URL).strip()
    return OpenAI(api_key=api_key, base_url=base_url)
