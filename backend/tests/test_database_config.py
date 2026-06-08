import pytest

from backend.app.config import _normalize_database_url
from backend.app.services import product_catalog_service


def test_database_url_normalization_accepts_common_vercel_paste_formats():
    expected = "postgresql://user:password@example.com/database?sslmode=require"

    assert _normalize_database_url(expected) == expected
    assert _normalize_database_url(f"DATABASE_URL={expected}") == expected
    assert _normalize_database_url(f'"{expected}"') == expected


def test_database_error_message_is_safe_and_actionable(monkeypatch):
    monkeypatch.setattr(
        product_catalog_service,
        "DATABASE_URL",
        "postgresql://user:secret@localhost:5432/productse",
    )

    message = product_catalog_service.database_error_message(
        RuntimeError("DATABASE_URL points to localhost.")
    )

    assert "localhost" in message
    assert "secret" not in message


def test_local_database_url_is_only_rejected_on_vercel(monkeypatch):
    database_url = "postgresql://productse:productse@localhost:5432/productse"
    monkeypatch.setattr(product_catalog_service, "DATABASE_URL", database_url)
    monkeypatch.setattr(product_catalog_service, "IS_VERCEL", False)

    expected_connection = object()
    connect = lambda *args, **kwargs: expected_connection
    monkeypatch.setattr(product_catalog_service.psycopg, "connect", connect)

    assert product_catalog_service._connect() is expected_connection

    monkeypatch.setattr(product_catalog_service, "IS_VERCEL", True)
    with pytest.raises(RuntimeError, match="localhost"):
        product_catalog_service._connect()
