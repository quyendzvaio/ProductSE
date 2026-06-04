from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None


class ChatResponse(BaseModel):
    session_id: str
    type: str
    content: str
    products: list[dict] = Field(default_factory=list)


class WarehouseSaleItem(BaseModel):
    id: int
    product_name: str
    month: str
    revenue: int
    branch_name: str
    customer_scale: int
    stock: int
    planned_import: int
    selling_price: int
    promotion: str


class WarehouseSalesResponse(BaseModel):
    items: list[WarehouseSaleItem]


class WarehouseForecastModelMetrics(BaseModel):
    mae: float
    rmse: float
    r2: float


class WarehouseForecastModelInfo(BaseModel):
    model_name: str
    trained_at: str
    history_window_months: int
    training_samples: int
    validation_samples: int
    target_months: list[str] = Field(default_factory=list)
    priority_strategy: str
    metrics: WarehouseForecastModelMetrics


class WarehousePredictionItem(BaseModel):
    product_name: str
    branch_name: str
    forecast_month: str
    predicted_planned_import: int
    recommended_gap: int
    current_stock: int
    latest_month: str
    latest_revenue: int
    latest_customer_scale: int
    latest_promotion: str
    history_months: list[str] = Field(default_factory=list)


class WarehousePredictionResponse(BaseModel):
    items: list[WarehousePredictionItem] = Field(default_factory=list)
    model: WarehouseForecastModelInfo


class WarehouseModelTrainResponse(BaseModel):
    status: str
    model: WarehouseForecastModelInfo
