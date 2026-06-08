from backend.app import retrieval


def _product(index: int, *, tags: str, recommended_for: str, contraindications: str):
    return {
        "product_code": f"product-{index}",
        "product_name": f"Kombucha {index}",
        "description": f"Đồ uống lên men {tags}",
        "ingredients": "Trà lên men, SCOBY, nước",
        "nutrition": "Ít đường, caffeine thấp",
        "sizes": "330ml/chai",
        "stock_status": "Còn hàng",
        "recommended_for": recommended_for,
        "contraindications": contraindications,
        "product_tags": tags,
        "product_link": f"/products/product-{index}",
        "references": "https://example.com",
        "display_order": index,
        "image_name": f"{index}.png",
    }


def test_hybrid_search_selects_five_candidates_then_reranks_two(monkeypatch):
    products = [
        _product(
            index,
            tags=f"trái cây vị {index}",
            recommended_for="Người thích trái cây và đồ uống ít ngọt",
            contraindications="Người dị ứng thành phần",
        )
        for index in range(1, 8)
    ]
    captured = {}
    original_rerank = retrieval._rerank_candidates

    def capture_candidates(candidates, expanded_query, top_k):
        captured["candidate_count"] = len(candidates)
        captured["top_k"] = top_k
        return original_rerank(candidates, expanded_query, top_k)

    monkeypatch.setattr(retrieval, "list_products", lambda: products)
    monkeypatch.setattr(retrieval, "_rerank_candidates", capture_candidates)

    results = retrieval.ProductRetriever().search(
        "thích vị trái cây ít đường",
        medical_history="không có bệnh nền và không dị ứng",
        candidate_k=5,
        top_k=2,
    )

    assert captured == {"candidate_count": 5, "top_k": 2}
    assert len(results) == 2
    assert all("vector_score" in product for product in results)
    assert all("bm25_score" in product for product in results)
    assert all("hybrid_score" in product for product in results)
    assert all("rerank_score" in product for product in results)


def test_reranker_prefers_safe_product_when_medical_history_matches(monkeypatch):
    products = [
        _product(
            1,
            tags="gừng cay ấm ít đường",
            recommended_for="Người thích vị cay ấm",
            contraindications="Người viêm loét dạ dày hoặc trào ngược nặng",
        ),
        _product(
            2,
            tags="trái cây ít đường",
            recommended_for="Người thích đồ uống trái cây",
            contraindications="Người dị ứng thành phần",
        ),
        _product(
            3,
            tags="chanh chua thanh",
            recommended_for="Người thích vị chua",
            contraindications="Người dị ứng citrus",
        ),
    ]
    monkeypatch.setattr(retrieval, "list_products", lambda: products)

    results = retrieval.ProductRetriever().search(
        "thích gừng cay ấm ít đường",
        medical_history="tôi bị trào ngược",
        candidate_k=3,
        top_k=2,
    )

    assert len(results) == 2
    assert all(product["product_code"] != "product-1" for product in results)
    assert all(not product["contraindication_matches"] for product in results)
    assert retrieval._contraindication_matches(
        "tôi bị trào ngược",
        products[0]["contraindications"],
    ) == ["dạ dày hoặc trào ngược"]
