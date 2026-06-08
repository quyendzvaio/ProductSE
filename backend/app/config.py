import os
from pathlib import Path

from dotenv import load_dotenv


APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent
PROJECT_DIR = BACKEND_DIR.parent

DATA_DIR = BACKEND_DIR / "data"
MODELS_DIR = BACKEND_DIR / "models"
STATIC_DIR = BACKEND_DIR / "static"
ENV_FILE = BACKEND_DIR / ".env"
PRODUCT_CATALOG_PATH = PROJECT_DIR / "data" / "kombucha_product_catalog.csv"

load_dotenv(ENV_FILE)


def _normalize_database_url(value: str) -> str:
    normalized = str(value or "").strip()
    if normalized.startswith("DATABASE_URL="):
        normalized = normalized.split("=", 1)[1].strip()
    return normalized.strip("\"'")


DATABASE_URL = _normalize_database_url(os.getenv("DATABASE_URL", ""))
IS_VERCEL = bool(os.getenv("VERCEL") or os.getenv("VERCEL_ENV"))
