import csv

from ..config import DATA_DIR

SALES_CSV_PATH = DATA_DIR / "kombucha_sales.csv"


def _to_int(value):
    cleaned = str(value or "").replace(",", "").replace(".", "").strip()
    return int(cleaned) if cleaned else 0


def load_sales_rows():
    rows = []

    with open(SALES_CSV_PATH, "r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        for index, row in enumerate(reader, start=1):
            rows.append(
                {
                    "id": index,
                    "product_name": (row.get("tên sản phẩm") or "").strip(),
                    "month": (row.get("tháng") or "").strip(),
                    "revenue": _to_int(row.get("doanh thu")),
                    "branch_name": (row.get("tên chi nhánh") or "").strip(),
                    "customer_scale": _to_int(row.get("quy mô khách hàng trong tháng")),
                    "stock": _to_int(row.get("tồn kho")),
                    "planned_import": _to_int(row.get("dự kiến nhập")),
                    "selling_price": _to_int(row.get("giá bán")),
                    "promotion": (row.get("khuyến mãi") or "").strip(),
                }
            )

    return rows
