import sys
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[2]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.services.warehouse_forecast_service import train_forecast_model


if __name__ == "__main__":
    print(train_forecast_model(force_retrain=True))
