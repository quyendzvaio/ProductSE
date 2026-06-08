import os

import pytest

from backend.app.services.product_catalog_service import initialize_product_catalog


@pytest.fixture(scope="session", autouse=True)
def seeded_product_catalog():
    if not os.getenv("DATABASE_URL"):
        pytest.fail(
            "DATABASE_URL is required. Start PostgreSQL with `docker compose up -d postgres`."
        )
    return initialize_product_catalog()


@pytest.fixture
def anyio_backend():
    return "asyncio"
