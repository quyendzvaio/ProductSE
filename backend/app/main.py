import logging
from contextlib import asynccontextmanager
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Query, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
import uvicorn

from .config import STATIC_DIR
from .schemas import (
    ChatRequest,
    ChatResponse,
    ProductCatalogItem,
    ProductCatalogResponse,
    WarehouseModelTrainResponse,
    WarehousePredictionResponse,
    WarehouseSalesResponse,
)
from .services.product_catalog_service import (
    get_product,
    initialize_product_catalog,
    list_products,
)
from .services.warehouse_forecast_service import (
    ensure_forecast_model,
    predict_next_month_imports,
    train_forecast_model,
)
from .services.warehouse_service import load_sales_rows
from .websocket_handler import create_session, handle_websocket, process_user_message

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    try:
        imported_count = initialize_product_catalog()
        logger.info("Imported %s products into PostgreSQL.", imported_count)
    except Exception as exc:
        logger.warning("Khong the khoi tao danh muc san pham PostgreSQL: %s", exc)

    try:
        ensure_forecast_model()
    except Exception as exc:
        logger.warning("Khong the khoi tao mo hinh du doan nhap hang: %s", exc)

    yield


app = FastAPI(lifespan=lifespan)
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

http_sessions = {}


@app.get("/")
async def get():
    with open(STATIC_DIR / "index.html", "r", encoding="utf-8") as f:
        html = f.read()
    return HTMLResponse(content=html)


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    session_id = (request.session_id or "").strip()
    user_message = (request.message or "").strip()

    if not session_id:
        session, welcome = create_session()
        session_id = str(uuid4())
        http_sessions[session_id] = session
        if not user_message:
            return ChatResponse(
                session_id=session_id,
                type="message",
                content=welcome,
                products=[],
            )
    else:
        session = http_sessions.get(session_id)
        if session is None:
            raise HTTPException(status_code=404, detail="Session khong ton tai.")

    response_payload = process_user_message(session, user_message)
    if response_payload is None:
        raise HTTPException(status_code=400, detail="Tin nhan khong hop le.")

    return ChatResponse(
        session_id=session_id,
        type=response_payload["type"],
        content=response_payload["content"],
        products=response_payload.get("products", []),
    )


@app.get("/api/products", response_model=ProductCatalogResponse)
def get_products():
    try:
        return ProductCatalogResponse(items=list_products())
    except Exception as exc:
        logger.exception("Khong the doc danh muc san pham tu PostgreSQL.")
        raise HTTPException(
            status_code=503,
            detail="Khong the ket noi co so du lieu san pham.",
        ) from exc


@app.get("/api/products/{product_code}", response_model=ProductCatalogItem)
def get_product_detail(product_code: str):
    try:
        product = get_product(product_code)
    except Exception as exc:
        logger.exception("Khong the doc san pham %s tu PostgreSQL.", product_code)
        raise HTTPException(
            status_code=503,
            detail="Khong the ket noi co so du lieu san pham.",
        ) from exc

    if product is None:
        raise HTTPException(status_code=404, detail="San pham khong ton tai.")
    return ProductCatalogItem(**product)


@app.get("/api/warehouse/sales", response_model=WarehouseSalesResponse)
async def get_warehouse_sales():
    return WarehouseSalesResponse(items=load_sales_rows())


@app.get("/api/warehouse/predictions", response_model=WarehousePredictionResponse)
async def get_warehouse_predictions(limit: int = Query(default=10, ge=1, le=100)):
    try:
        payload = predict_next_month_imports(limit=limit)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return WarehousePredictionResponse(**payload)


@app.post("/api/warehouse/model/train", response_model=WarehouseModelTrainResponse)
async def train_warehouse_prediction_model():
    try:
        model_info = train_forecast_model(force_retrain=True)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return WarehouseModelTrainResponse(status="trained", model=model_info)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await handle_websocket(websocket)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
