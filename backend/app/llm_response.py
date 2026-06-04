from .llm_client import get_chat_model, get_llm_client


def _product_value(product, key, default="Không có thông tin"):
    return product.get(key) or default


def _build_fallback_response(products):
    if not products:
        return (
            "Hiện tôi chưa tải được bộ gợi ý sản phẩm chi tiết, nhưng với thông tin bạn chia sẻ, "
            "bạn có thể ưu tiên kombucha vị thanh mát, chua ngọt nhẹ như chanh sả, hibiscus, "
            "trái cây nhiệt đới hoặc việt quất. Nếu bạn có bệnh dạ dày, tiểu đường, huyết áp "
            "hoặc dị ứng thành phần nào, hãy kiểm tra nhãn sản phẩm trước khi dùng."
        )

    lines = []
    for product in products[:3]:
        warning = _product_value(product, "Chống chỉ định với")
        lines.append(
            f"- {_product_value(product, 'Tên')}: {_product_value(product, 'Mô tả')} "
            f"(Hương vị: {_product_value(product, 'Hương vị')}, "
            f"độ phù hợp: {_product_value(product, 'Độ tương đồng', 0)}%). "
            f"Lưu ý chống chỉ định: {warning}."
        )
    return "Bạn có thể tham khảo các sản phẩm sau:\n" + "\n".join(lines)


def generate_recommendation_response(features, products):
    products_info = "\n".join(
        [
            f"- {_product_value(p, 'Tên')}: {_product_value(p, 'Mô tả')} "
            f"(Hương vị: {_product_value(p, 'Hương vị')}, "
            f"độ phù hợp: {_product_value(p, 'Độ tương đồng', 0)}%)\n"
            f"  Chống chỉ định: {_product_value(p, 'Chống chỉ định với')}"
            for p in products
        ]
    )

    prompt = f"""Bạn là trợ lý tư vấn kombucha. Dựa trên thông tin người dùng:
- Trạng thái tinh thần: {', '.join(features.get('mental_state', []))}
- Tình trạng sức khỏe: {', '.join(features.get('health_condition', []))}
- Tiền sử bệnh nền hoặc dị ứng: {', '.join(features.get('medical_history', []))}
- Khẩu vị: {', '.join(features.get('taste', []))}

Danh sách sản phẩm phù hợp:
{products_info or "Không có danh sách sản phẩm chi tiết."}

Hãy giới thiệu 2-3 sản phẩm hoặc nhóm vị kombucha phù hợp. Giải thích ngắn gọn lý do, nhắc nhẹ về chống chỉ định nếu có. Trả lời bằng tiếng Việt tự nhiên, thân thiện.
"""
    try:
        response = get_llm_client().chat.completions.create(
            model=get_chat_model(),
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        return response.choices[0].message.content or _build_fallback_response(products)
    except Exception as exc:
        print(f"Error in generate_recommendation_response: {exc}")
        return _build_fallback_response(products)
