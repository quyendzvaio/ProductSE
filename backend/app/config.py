from pathlib import Path


APP_DIR = Path(__file__).resolve().parent
BACKEND_DIR = APP_DIR.parent

DATA_DIR = BACKEND_DIR / "data"
MODELS_DIR = BACKEND_DIR / "models"
STATIC_DIR = BACKEND_DIR / "static"
ASSETS_DIR = BACKEND_DIR / "assets"
PRODUCT_IMAGES_DIR = ASSETS_DIR / "product-images"
ENV_FILE = BACKEND_DIR / ".env"
