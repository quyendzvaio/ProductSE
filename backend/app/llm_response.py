import re


MEDICAL_DISCLAIMER = (
    "Mình chỉ hỗ trợ gợi ý sản phẩm dựa trên thông tin bạn cung cấp, không thay thế "
    "tư vấn của bác sĩ. Nếu bạn có bệnh nền, đang dùng thuốc, đang mang thai hoặc có "
    "triệu chứng nghiêm trọng, bạn nên hỏi chuyên gia y tế trước khi sử dụng."
)

FORBIDDEN_CLAIMS = (
    "sản phẩm này chữa tiểu đường",
    "sản phẩm này điều trị mất ngủ",
    "bạn nên ngừng thuốc",
    "ngừng thuốc và dùng sản phẩm",
)


def _clean_answer(value: str) -> str:
    return " ".join(str(value or "").strip().split())


def _sanitize_medical_claims(content: str) -> str:
    sanitized = content
    for forbidden_claim in FORBIDDEN_CLAIMS:
        sanitized = re.sub(
            re.escape(forbidden_claim),
            "[Nội dung không phù hợp đã được loại bỏ]",
            sanitized,
            flags=re.IGNORECASE,
        )
    return sanitized


def build_profile_summary(profile: dict) -> str:
    return (
        "Cảm ơn bạn đã chia sẻ khá kỹ. Để mình nhắc lại xem đã hiểu đúng ý bạn chưa nhé:\n"
        f"- Về sức khỏe: {_clean_answer(profile.get('health_condition'))}\n"
        f"- Khẩu vị bạn thích: {_clean_answer(profile.get('preferences'))}\n"
        f"- Thông tin cần lưu ý: {_clean_answer(profile.get('medical_history'))}\n"
        f"- Tinh thần gần đây: {_clean_answer(profile.get('mental_state'))}\n"
        f"- Điều bạn mong muốn ở sản phẩm: {_clean_answer(profile.get('product_goals'))}"
    )


def _product_reason(product: dict) -> str:
    recommended_for = _clean_answer(product.get("recommended_for"))
    tags = [
        tag.strip()
        for tag in str(product.get("product_tags") or "").split(",")
        if tag.strip()
    ]
    if tag_text := ", ".join(tags[:3]):
        return f"sản phẩm có các nét vị và đặc điểm khá gần với nhu cầu của bạn: {tag_text}"
    if recommended_for:
        return recommended_for
    return "đặc điểm của sản phẩm khá gần với những gì bạn đang tìm"


def generate_recommendation_response(profile: dict, products: list[dict]) -> str:
    sections = [build_profile_summary(profile)]

    if not products:
        sections.append(
            "Mình chưa tìm được lựa chọn nào thực sự sát với những gì bạn đang cần. Để "
            "chắc chắn hơn, bạn nên trao đổi thêm với nhân viên và xem kỹ thành phần, "
            "lượng đường cùng caffeine trên nhãn nhé."
        )
    else:
        recommendation_lines = [
            "Mình đã đối chiếu các thông tin trên với danh mục sản phẩm. Hai vị mình "
            "nghiêng về nhất cho bạn là:"
        ]
        for index, product in enumerate(products[:2], start=1):
            warning_matches = product.get("contraindication_matches") or []
            warning = ""
            if warning_matches:
                warning = (
                    " Tuy vậy, thông tin bạn chia sẻ có liên quan đến phần cần thận trọng "
                    f"({', '.join(warning_matches)}). Bạn khoan sử dụng và hỏi bác sĩ hoặc "
                    "chuyên gia y tế trước nhé."
                )
            recommendation_lines.append(
                f"{index}. {product['product_name']}: {_product_reason(product).rstrip('.')}."
                f"{warning}"
            )
        recommendation_lines.append(
            "Mình đã để đường dẫn của từng sản phẩm ngay bên dưới để bạn xem thông tin "
            "chi tiết nhé."
        )
        sections.append("\n".join(recommendation_lines))

    sections.append(
        "Mình nhắc nhẹ một chút: kombucha là đồ uống, không phải thuốc và không dùng để "
        "chữa bệnh, điều trị triệu chứng hay thay thế thuốc bạn đang sử dụng."
    )
    sections.append(MEDICAL_DISCLAIMER)
    return _sanitize_medical_claims("\n\n".join(sections))
