from backend.app.llm_response import MEDICAL_DISCLAIMER, _sanitize_medical_claims
from backend.app.websocket_handler import QUESTIONNAIRE, Session, process_user_message


def _recommended_products():
    base = {
        "description": "Kombucha lên men vị trái cây",
        "ingredients": "Trà lên men, SCOBY, nước",
        "nutrition": "Ít đường, caffeine thấp",
        "sizes": "330ml/chai",
        "stock_status": "Còn hàng",
        "recommended_for": "Người thích đồ uống trái cây ít ngọt",
        "contraindications": "Người dị ứng thành phần",
        "references": "https://example.com",
        "contraindication_matches": [],
        "vector_score": 0.8,
        "bm25_score": 0.7,
        "hybrid_score": 75.0,
        "rerank_score": 80.0,
    }
    return [
        {
            **base,
            "product_code": "kombucha-vi-nho",
            "product_name": "Kombucha vị nho",
            "product_tags": "kombucha, nho, trái cây",
            "product_link": "/products/kombucha-vi-nho",
            "display_order": 5,
            "image_name": "5.png",
        },
        {
            **base,
            "product_code": "kombucha-vi-luu-do",
            "product_name": "Kombucha vị lựu đỏ",
            "product_tags": "kombucha, lựu đỏ, trái cây",
            "product_link": "/products/kombucha-vi-luu-do",
            "display_order": 9,
            "image_name": "9.png",
        },
    ]


def test_chatbot_asks_all_questions_and_returns_two_products(monkeypatch):
    products = _recommended_products()
    captured = {}

    def fake_search(query_text, medical_history, candidate_k, top_k):
        captured.update(
            query_text=query_text,
            medical_history=medical_history,
            candidate_k=candidate_k,
            top_k=top_k,
        )
        return products

    monkeypatch.setattr(
        "backend.app.websocket_handler.retriever.search",
        fake_search,
    )
    session = Session()
    answers = [
        "Sức khỏe ổn",
        "Thích vị trái cây chua nhẹ",
        "Không có bệnh nền và không dị ứng",
        "Tinh thần khá thoải mái",
        "Muốn ít đường và chăm sóc da",
    ]

    for index, answer in enumerate(answers):
        response = process_user_message(session, answer)
        if index < len(QUESTIONNAIRE) - 1:
            assert response["type"] == "question"
            assert response["content"] == QUESTIONNAIRE[index + 1][1]

    assert response["type"] == "recommendation"
    assert response["products"] == products
    assert captured["candidate_k"] == 5
    assert captured["top_k"] == 2
    assert captured["medical_history"] == answers[2]
    assert "Kombucha vị nho" in response["content"]
    assert "điểm hybrid" not in response["content"]
    assert "điểm rerank" not in response["content"]
    assert MEDICAL_DISCLAIMER in response["content"]
    assert session.done is True


def test_chatbot_can_restart_after_recommendation(monkeypatch):
    monkeypatch.setattr(
        "backend.app.websocket_handler.retriever.search",
        lambda *args, **kwargs: _recommended_products(),
    )
    session = Session()
    for answer in ["ổn", "trái cây", "không", "thoải mái", "ít đường"]:
        process_user_message(session, answer)

    response = process_user_message(session, "tư vấn lại")

    assert response["type"] == "question"
    assert session.done is False
    assert session.question_index == 0
    assert session.profile == {}


def test_forbidden_medical_claims_are_removed_case_insensitively():
    content = (
        "Sản phẩm này chữa tiểu đường. SẢN PHẨM NÀY ĐIỀU TRỊ MẤT NGỦ. "
        "Bạn nên ngừng thuốc và dùng sản phẩm này."
    )

    sanitized = _sanitize_medical_claims(content).lower()

    assert "chữa tiểu đường" not in sanitized
    assert "điều trị mất ngủ" not in sanitized
    assert "bạn nên ngừng thuốc" not in sanitized
