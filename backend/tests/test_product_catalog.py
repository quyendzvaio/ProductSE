import pytest
from httpx import ASGITransport, AsyncClient

from backend.app.main import app
from backend.app.services.product_catalog_service import get_product, list_products


pytestmark = pytest.mark.integration


def test_catalog_is_seeded_from_csv(seeded_product_catalog):
    products = list_products()

    assert seeded_product_catalog == 10
    assert len(products) == 10
    assert [product["display_order"] for product in products] == list(range(1, 11))
    assert [product["image_name"] for product in products] == [
        f"{index}.png" for index in range(1, 11)
    ]
    assert products[0]["product_code"] == "kombucha-vi-gung-tuoi"
    assert products[-1]["product_code"] == "kombucha-vi-dua"


def test_get_product_returns_database_detail():
    product = get_product("kombucha-vi-nho")

    assert product is not None
    assert product["product_name"] == "Kombucha vị nho"
    assert product["product_link"] == "/products/kombucha-vi-nho"
    assert "tiểu đường" in product["contraindications"].lower()


@pytest.mark.anyio
async def test_product_api_reads_from_postgresql():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        catalog_response = await client.get("/api/products")
        detail_response = await client.get("/api/products/kombucha-vi-nho")
        missing_response = await client.get("/api/products/khong-ton-tai")

    assert catalog_response.status_code == 200
    assert len(catalog_response.json()["items"]) == 10
    assert detail_response.status_code == 200
    assert detail_response.json()["product_name"] == "Kombucha vị nho"
    assert missing_response.status_code == 404
