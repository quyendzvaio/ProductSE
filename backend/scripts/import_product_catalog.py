from backend.app.services.product_catalog_service import initialize_product_catalog


if __name__ == "__main__":
    imported_count = initialize_product_catalog()
    print(f"Imported {imported_count} products into PostgreSQL.")
