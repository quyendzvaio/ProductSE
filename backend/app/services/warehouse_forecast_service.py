from __future__ import annotations

import json
import math
import pickle
from datetime import UTC, datetime

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

from ..config import MODELS_DIR
from .warehouse_service import load_sales_rows

HISTORY_WINDOW_MONTHS = 3
MODEL_ARTIFACT_PATH = MODELS_DIR / "warehouse_random_forest.pkl"
MODEL_METADATA_PATH = MODELS_DIR / "warehouse_random_forest_metrics.json"

PRIORITY_FEATURES = (
    "target_month_number",
    "target_month_sin",
    "target_month_cos",
    "revenue_lag_1",
    "revenue_lag_2",
    "revenue_lag_3",
    "revenue_avg_3m",
    "revenue_trend_3m",
    "customer_scale_lag_1",
    "customer_scale_lag_2",
    "customer_scale_lag_3",
    "customer_scale_avg_3m",
    "customer_scale_trend_3m",
    "promotion_rate_lag_1",
    "promotion_rate_lag_2",
    "promotion_rate_lag_3",
    "promotion_avg_3m",
    "promotion_trend_3m",
)

_cached_artifact: dict | None = None


def _promotion_to_rate(value: str) -> int:
    cleaned = str(value or "").replace("%", "").strip()
    return int(cleaned) if cleaned else 0


def _month_to_timestamp(value: str) -> pd.Timestamp:
    return pd.to_datetime(value, format="%m/%Y")


def _timestamp_to_month(value: pd.Timestamp) -> str:
    return value.strftime("%m/%Y")


def _utc_now_iso() -> str:
    return datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _build_sales_frame() -> pd.DataFrame:
    rows = load_sales_rows()
    frame = pd.DataFrame(rows)
    if frame.empty:
        return frame

    frame["month_date"] = frame["month"].apply(_month_to_timestamp)
    frame["month_number"] = frame["month_date"].dt.month
    frame["year"] = frame["month_date"].dt.year
    frame["promotion_rate"] = frame["promotion"].apply(_promotion_to_rate)
    return frame.sort_values(["branch_name", "product_name", "month_date"]).reset_index(drop=True)


def _make_feature_record(history: pd.DataFrame, forecast_month: pd.Timestamp) -> dict:
    ordered_history = history.sort_values("month_date").reset_index(drop=True)
    latest = ordered_history.iloc[-1]
    oldest = ordered_history.iloc[0]

    record = {
        "product_name": latest["product_name"],
        "branch_name": latest["branch_name"],
        "target_month_number": int(forecast_month.month),
        "target_year": int(forecast_month.year),
        "target_month_sin": math.sin((2 * math.pi * forecast_month.month) / 12),
        "target_month_cos": math.cos((2 * math.pi * forecast_month.month) / 12),
        "latest_selling_price": int(latest["selling_price"]),
        "stock_avg_3m": float(ordered_history["stock"].mean()),
        "stock_trend_3m": int(latest["stock"] - oldest["stock"]),
        "planned_import_avg_3m": float(ordered_history["planned_import"].mean()),
        "planned_import_trend_3m": int(latest["planned_import"] - oldest["planned_import"]),
    }

    for lag, row in enumerate(reversed(list(ordered_history.itertuples(index=False))), start=1):
        record[f"revenue_lag_{lag}"] = int(row.revenue)
        record[f"customer_scale_lag_{lag}"] = int(row.customer_scale)
        record[f"stock_lag_{lag}"] = int(row.stock)
        record[f"planned_import_lag_{lag}"] = int(row.planned_import)
        record[f"promotion_rate_lag_{lag}"] = int(row.promotion_rate)

    record["revenue_avg_3m"] = float(ordered_history["revenue"].mean())
    record["revenue_trend_3m"] = int(latest["revenue"] - oldest["revenue"])
    record["customer_scale_avg_3m"] = float(ordered_history["customer_scale"].mean())
    record["customer_scale_trend_3m"] = int(latest["customer_scale"] - oldest["customer_scale"])
    record["promotion_avg_3m"] = float(ordered_history["promotion_rate"].mean())
    record["promotion_trend_3m"] = int(latest["promotion_rate"] - oldest["promotion_rate"])

    # RandomForest has no direct feature weighting, so duplicate business-priority
    # signals to bias random feature sampling slightly toward these columns.
    for feature_name in PRIORITY_FEATURES:
        record[f"priority_{feature_name}"] = record[feature_name]

    return record


def _build_training_frame(sales_frame: pd.DataFrame) -> pd.DataFrame:
    if sales_frame.empty:
        return pd.DataFrame()

    records = []

    for (_, _), group in sales_frame.groupby(["branch_name", "product_name"], sort=False):
        ordered_group = group.sort_values("month_date").reset_index(drop=True)
        if len(ordered_group) <= HISTORY_WINDOW_MONTHS:
            continue

        for index in range(HISTORY_WINDOW_MONTHS, len(ordered_group)):
            history = ordered_group.iloc[index - HISTORY_WINDOW_MONTHS : index]
            target_row = ordered_group.iloc[index]
            record = _make_feature_record(history, target_row["month_date"])
            record["target_month"] = target_row["month"]
            record["target_planned_import"] = int(target_row["planned_import"])
            records.append(record)

    return pd.DataFrame(records)


def _build_prediction_frame(sales_frame: pd.DataFrame) -> pd.DataFrame:
    if sales_frame.empty:
        return pd.DataFrame()

    records = []

    for (_, _), group in sales_frame.groupby(["branch_name", "product_name"], sort=False):
        ordered_group = group.sort_values("month_date").reset_index(drop=True)
        if len(ordered_group) < HISTORY_WINDOW_MONTHS:
            continue

        history = ordered_group.tail(HISTORY_WINDOW_MONTHS).reset_index(drop=True)
        latest = history.iloc[-1]
        forecast_month = latest["month_date"] + pd.DateOffset(months=1)
        record = _make_feature_record(history, forecast_month)
        record["forecast_month"] = _timestamp_to_month(forecast_month)
        record["latest_month"] = latest["month"]
        record["latest_revenue"] = int(latest["revenue"])
        record["latest_customer_scale"] = int(latest["customer_scale"])
        record["latest_promotion"] = latest["promotion"]
        record["current_stock"] = int(latest["stock"])
        record["history_months"] = history["month"].tolist()
        records.append(record)

    return pd.DataFrame(records)


def _feature_names(training_frame: pd.DataFrame) -> list[str]:
    return [
        column_name
        for column_name in training_frame.columns
        if column_name not in {"target_planned_import", "target_month"}
    ]


def _build_pipeline(feature_names: list[str]) -> Pipeline:
    categorical_features = ["product_name", "branch_name"]
    numeric_features = [name for name in feature_names if name not in categorical_features]

    preprocessor = ColumnTransformer(
        transformers=[
            (
                "categorical",
                Pipeline(
                    steps=[
                        ("imputer", SimpleImputer(strategy="most_frequent")),
                        ("encoder", OneHotEncoder(handle_unknown="ignore", sparse_output=False)),
                    ]
                ),
                categorical_features,
            ),
            (
                "numeric",
                Pipeline(steps=[("imputer", SimpleImputer(strategy="median"))]),
                numeric_features,
            ),
        ]
    )

    model = RandomForestRegressor(
        n_estimators=400,
        max_depth=14,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=1,
    )

    return Pipeline(steps=[("preprocessor", preprocessor), ("model", model)])


def _build_metadata(training_frame: pd.DataFrame, test_frame: pd.DataFrame, metrics: dict) -> dict:
    return {
        "model_name": "RandomForestRegressor",
        "trained_at": _utc_now_iso(),
        "history_window_months": HISTORY_WINDOW_MONTHS,
        "training_samples": int(len(training_frame)),
        "validation_samples": int(len(test_frame)),
        "target_months": sorted(training_frame["target_month"].unique().tolist()),
        "priority_strategy": (
            "Duplicate month, revenue, customer_scale and promotion features "
            "to bias RandomForest sampling slightly toward these inputs."
        ),
        "metrics": metrics,
    }


def train_forecast_model(force_retrain: bool = False) -> dict:
    global _cached_artifact

    if _cached_artifact is not None and not force_retrain:
        return _cached_artifact["metadata"]

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    sales_frame = _build_sales_frame()
    training_frame = _build_training_frame(sales_frame)

    if training_frame.empty:
        raise ValueError("Khong co du lieu huan luyen cho cua so 3 thang.")

    target_months = sorted(training_frame["target_month"].unique().tolist())
    if len(target_months) > 1:
        holdout_month = target_months[-1]
        train_frame = training_frame[training_frame["target_month"] != holdout_month].reset_index(drop=True)
        test_frame = training_frame[training_frame["target_month"] == holdout_month].reset_index(drop=True)
    else:
        train_frame = training_frame.copy()
        test_frame = training_frame.copy()

    if train_frame.empty:
        raise ValueError("Khong du lich su de tao tap train cho mo hinh.")

    feature_names = _feature_names(training_frame)
    model_pipeline = _build_pipeline(feature_names)
    model_pipeline.fit(train_frame[feature_names], train_frame["target_planned_import"])

    predictions = model_pipeline.predict(test_frame[feature_names])
    metrics = {
        "mae": round(float(mean_absolute_error(test_frame["target_planned_import"], predictions)), 3),
        "rmse": round(float(mean_squared_error(test_frame["target_planned_import"], predictions) ** 0.5), 3),
        "r2": round(float(r2_score(test_frame["target_planned_import"], predictions)), 3),
    }

    metadata = _build_metadata(training_frame, test_frame, metrics)
    artifact = {
        "model": model_pipeline,
        "feature_names": feature_names,
        "metadata": metadata,
    }

    with open(MODEL_ARTIFACT_PATH, "wb") as file:
        pickle.dump(artifact, file)

    with open(MODEL_METADATA_PATH, "w", encoding="utf-8") as file:
        json.dump(metadata, file, ensure_ascii=False, indent=2)

    _cached_artifact = artifact
    return metadata


def ensure_forecast_model() -> dict:
    global _cached_artifact

    if _cached_artifact is not None:
        return _cached_artifact

    if MODEL_ARTIFACT_PATH.exists():
        with open(MODEL_ARTIFACT_PATH, "rb") as file:
            _cached_artifact = pickle.load(file)
        return _cached_artifact

    train_forecast_model(force_retrain=True)
    return _cached_artifact


def predict_next_month_imports(limit: int | None = None) -> dict:
    artifact = ensure_forecast_model()
    prediction_frame = _build_prediction_frame(_build_sales_frame())

    if prediction_frame.empty:
        raise ValueError("Khong du 3 thang du lieu lich su de tao du doan.")

    predictions = artifact["model"].predict(prediction_frame[artifact["feature_names"]])
    prediction_frame["predicted_planned_import"] = predictions.round().astype(int)
    prediction_frame["predicted_planned_import"] = prediction_frame["predicted_planned_import"].clip(lower=0)
    prediction_frame["recommended_gap"] = (
        prediction_frame["predicted_planned_import"] - prediction_frame["current_stock"]
    ).clip(lower=0)

    ordered = prediction_frame.sort_values(
        ["recommended_gap", "predicted_planned_import", "branch_name", "product_name"],
        ascending=[False, False, True, True],
    ).reset_index(drop=True)

    if limit is not None:
        ordered = ordered.head(limit).reset_index(drop=True)

    items = [
        {
            "product_name": row["product_name"],
            "branch_name": row["branch_name"],
            "forecast_month": row["forecast_month"],
            "predicted_planned_import": int(row["predicted_planned_import"]),
            "recommended_gap": int(row["recommended_gap"]),
            "current_stock": int(row["current_stock"]),
            "latest_month": row["latest_month"],
            "latest_revenue": int(row["latest_revenue"]),
            "latest_customer_scale": int(row["latest_customer_scale"]),
            "latest_promotion": row["latest_promotion"],
            "history_months": row["history_months"],
        }
        for _, row in ordered.iterrows()
    ]

    return {
        "items": items,
        "model": artifact["metadata"],
    }
