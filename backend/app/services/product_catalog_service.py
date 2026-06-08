import csv
from pathlib import Path

import psycopg
from psycopg.rows import dict_row

from ..config import DATABASE_URL, IS_VERCEL, PRODUCT_CATALOG_PATH

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS product_catalog (
    product_code TEXT PRIMARY KEY,
    product_name TEXT NOT NULL,
    description TEXT NOT NULL,
    ingredients TEXT NOT NULL,
    nutrition TEXT NOT NULL,
    sizes TEXT NOT NULL,
    stock_status TEXT NOT NULL,
    recommended_for TEXT NOT NULL,
    contraindications TEXT NOT NULL,
    product_tags TEXT NOT NULL,
    product_link TEXT NOT NULL,
    "references" TEXT NOT NULL,
    display_order INTEGER NOT NULL UNIQUE,
    image_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
)
"""

UPSERT_PRODUCT_SQL = """
INSERT INTO product_catalog (
    product_code,
    product_name,
    description,
    ingredients,
    nutrition,
    sizes,
    stock_status,
    recommended_for,
    contraindications,
    product_tags,
    product_link,
    "references",
    display_order,
    image_name
) VALUES (
    %(product_code)s,
    %(product_name)s,
    %(description)s,
    %(ingredients)s,
    %(nutrition)s,
    %(sizes)s,
    %(stock_status)s,
    %(recommended_for)s,
    %(contraindications)s,
    %(product_tags)s,
    %(product_link)s,
    %(references)s,
    %(display_order)s,
    %(image_name)s
)
ON CONFLICT (product_code) DO UPDATE SET
    product_name = EXCLUDED.product_name,
    description = EXCLUDED.description,
    ingredients = EXCLUDED.ingredients,
    nutrition = EXCLUDED.nutrition,
    sizes = EXCLUDED.sizes,
    stock_status = EXCLUDED.stock_status,
    recommended_for = EXCLUDED.recommended_for,
    contraindications = EXCLUDED.contraindications,
    product_tags = EXCLUDED.product_tags,
    product_link = EXCLUDED.product_link,
    "references" = EXCLUDED."references",
    display_order = EXCLUDED.display_order,
    image_name = EXCLUDED.image_name,
    updated_at = NOW()
"""

PRODUCT_COLUMNS = """
product_code,
product_name,
description,
ingredients,
nutrition,
sizes,
stock_status,
recommended_for,
contraindications,
product_tags,
product_link,
"references",
display_order,
image_name
"""


def _connect():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not configured.")
    if IS_VERCEL and (
        "localhost" in DATABASE_URL or "127.0.0.1" in DATABASE_URL
    ):
        raise RuntimeError("DATABASE_URL points to localhost.")
    return psycopg.connect(
        DATABASE_URL,
        row_factory=dict_row,
        connect_timeout=10,
        prepare_threshold=None,
    )


def database_error_message(exc: Exception) -> str:
    message = str(exc).lower()
    if not DATABASE_URL or "not configured" in message:
        return "DATABASE_URL chưa được cấu hình cho môi trường Production trên Vercel."
    if "localhost" in message or "127.0.0.1" in message:
        return "DATABASE_URL đang trỏ về localhost, Vercel không thể truy cập database này."
    if "password authentication failed" in message:
        return "PostgreSQL từ chối đăng nhập. Hãy kiểm tra username và password trong DATABASE_URL."
    if (
        "could not translate host name" in message
        or "name or service not known" in message
        or "nodename nor servname provided" in message
    ):
        return "Không tìm thấy máy chủ PostgreSQL. Hãy kiểm tra hostname trong DATABASE_URL."
    if "connection refused" in message:
        return "Máy chủ PostgreSQL từ chối kết nối hoặc không cho phép truy cập từ Vercel."
    if "timeout" in message or "timed out" in message:
        return "Kết nối PostgreSQL bị quá thời gian. Hãy dùng connection string pooled của nhà cung cấp."
    if "ssl" in message:
        return "Kết nối PostgreSQL yêu cầu SSL. Hãy dùng URL có sslmode=require."
    if "invalid dsn" in message or "missing \"=\"" in message:
        return "DATABASE_URL sai định dạng. Ô Value chỉ được chứa URL, không thêm DATABASE_URL= ở đầu."
    if "relation \"product_catalog\" does not exist" in message:
        return "Đã kết nối PostgreSQL nhưng bảng sản phẩm chưa được khởi tạo. Hãy redeploy Production."
    return "Không thể kết nối PostgreSQL. Hãy kiểm tra DATABASE_URL và quyền truy cập database."


def _load_catalog_rows(csv_path: Path = PRODUCT_CATALOG_PATH) -> list[dict]:
    if not csv_path.exists():
        raise FileNotFoundError(f"Product catalog CSV not found: {csv_path}")

    rows = []
    with csv_path.open("r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        for display_order, row in enumerate(reader, start=1):
            rows.append(
                {
                    "product_code": row["ma_san_pham"].strip(),
                    "product_name": row["ten_san_pham"].strip(),
                    "description": row["mo_ta"].strip(),
                    "ingredients": row["thanh_phan"].strip(),
                    "nutrition": row["dinh_duong"].strip(),
                    "sizes": row["size"].strip(),
                    "stock_status": row["ton_kho"].strip(),
                    "recommended_for": row["doi_tuong_nen_dung"].strip(),
                    "contraindications": row["doi_tuong_chong_chi_dinh"].strip(),
                    "product_tags": row["tag_san_pham"].strip(),
                    "product_link": row["link_san_pham"].strip(),
                    "references": row["nguon_tham_khao"].strip(),
                    "display_order": display_order,
                    "image_name": f"{display_order}.png",
                }
            )
    return rows


def initialize_product_catalog(csv_path: Path = PRODUCT_CATALOG_PATH) -> int:
    rows = _load_catalog_rows(csv_path)
    with _connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(CREATE_TABLE_SQL)
            cursor.executemany(UPSERT_PRODUCT_SQL, rows)
        connection.commit()
    return len(rows)


def list_products() -> list[dict]:
    with _connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                f"SELECT {PRODUCT_COLUMNS} FROM product_catalog ORDER BY display_order"
            )
            return cursor.fetchall()


def get_product(product_code: str) -> dict | None:
    with _connect() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                f"SELECT {PRODUCT_COLUMNS} FROM product_catalog WHERE product_code = %s",
                (product_code,),
            )
            return cursor.fetchone()
