import csv
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[1]
CSV_PATH = ROOT_DIR / "data" / "kombucha_sales.csv"
BASE_MONTH = "01/2024"
HISTORY_MONTHS = ["10/2023", "11/2023", "12/2023", "01/2024", "02/2024", "03/2024"]

MONTH_FACTORS = {
    "10/2023": 0.86,
    "11/2023": 0.91,
    "12/2023": 0.97,
    "01/2024": 1.00,
    "02/2024": 1.07,
    "03/2024": 1.13,
}


def to_int(value: str) -> int:
    cleaned = str(value or "").replace(",", "").replace(".", "").strip()
    return int(cleaned) if cleaned else 0


def promotion_to_rate(value: str) -> int:
    cleaned = str(value or "").replace("%", "").strip()
    return int(cleaned) if cleaned else 0


def rate_to_promotion(value: int) -> str:
    return f"{value}%"


def load_base_rows() -> list[dict]:
    with open(CSV_PATH, "r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        return [row for row in reader if (row.get("tháng") or "").strip() == BASE_MONTH]


def build_history_rows(base_rows: list[dict]) -> list[dict]:
    branch_names = sorted({row["tên chi nhánh"] for row in base_rows})
    product_names = sorted({row["tên sản phẩm"] for row in base_rows})
    branch_index = {name: index for index, name in enumerate(branch_names)}
    product_index = {name: index for index, name in enumerate(product_names)}

    rows = []
    base_step = HISTORY_MONTHS.index(BASE_MONTH)

    for base_row in base_rows:
        product_name = base_row["tên sản phẩm"]
        branch_name = base_row["tên chi nhánh"]
        product_rank = product_index[product_name]
        branch_rank = branch_index[branch_name]

        base_customer = to_int(base_row["quy mô khách hàng trong tháng"])
        base_stock = to_int(base_row["tồn kho"])
        base_planned_import = to_int(base_row["dự kiến nhập"])
        selling_price = to_int(base_row["giá bán"])
        base_promotion = promotion_to_rate(base_row["khuyến mãi"])

        for month in HISTORY_MONTHS:
            if month == BASE_MONTH:
                customer_scale = base_customer
                stock = base_stock
                planned_import = base_planned_import
                promotion_rate = base_promotion
            else:
                month_factor = MONTH_FACTORS[month]
                step = HISTORY_MONTHS.index(month) - base_step
                promotion_cycle = [0, 5, 10, 15]
                promotion_rate = promotion_cycle[(branch_rank + product_rank + step) % len(promotion_cycle)]
                customer_scale = round(
                    base_customer * month_factor
                    + (product_rank - 4) * 1.8
                    + (3 - branch_rank) * 2.4
                    + promotion_rate * 1.4
                )
                stock = round(
                    base_stock * (1 + (step * 0.04))
                    + (product_rank - 4) * 1.2
                    - promotion_rate * 0.8
                    + branch_rank
                )
                planned_import = round(
                    base_planned_import * month_factor
                    + (customer_scale - base_customer) * 0.48
                    - (stock - base_stock) * 0.34
                    + promotion_rate * 2.2
                    + max(step, 0) * 5
                )

            rows.append(
                {
                    "tên sản phẩm": product_name,
                    "tháng": month,
                    "tên chi nhánh": branch_name,
                    "doanh thu": max(customer_scale, 1) * selling_price,
                    "quy mô khách hàng trong tháng": max(customer_scale, 1),
                    "tồn kho": max(stock, 1),
                    "dự kiến nhập": max(planned_import, 1),
                    "giá bán": selling_price,
                    "khuyến mãi": rate_to_promotion(max(promotion_rate, 0)),
                }
            )

    rows.sort(key=lambda row: (row["tháng"], row["tên sản phẩm"], row["tên chi nhánh"]))
    return rows


def save_rows(rows: list[dict]) -> None:
    fieldnames = [
        "tên sản phẩm",
        "tháng",
        "tên chi nhánh",
        "doanh thu",
        "quy mô khách hàng trong tháng",
        "tồn kho",
        "dự kiến nhập",
        "giá bán",
        "khuyến mãi",
    ]
    with open(CSV_PATH, "w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


if __name__ == "__main__":
    save_rows(build_history_rows(load_base_rows()))
