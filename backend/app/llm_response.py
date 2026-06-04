from .llm_client import get_chat_model, get_llm_client


def _build_fallback_response(products):
    if not products:
        return "Hiá»‡n tÃ´i chÆ°a tÃ¬m Ä‘Æ°á»£c sáº£n pháº©m phÃ¹ há»£p rÃµ rÃ ng. Báº¡n hÃ£y mÃ´ táº£ chi tiáº¿t hÆ¡n vá» tÃ¬nh tráº¡ng sá»©c khá»e, tiá»n sá»­ bá»‡nh vÃ  kháº©u vá»‹ Ä‘á»ƒ tÃ´i gá»£i Ã½ chÃ­nh xÃ¡c hÆ¡n."

    lines = []
    for product in products[:3]:
        warning = product.get("Chá»‘ng chá»‰ Ä‘á»‹nh vá»›i") or "KhÃ´ng cÃ³ thÃ´ng tin"
        lines.append(
            f"- {product['TÃªn']}: {product['MÃ´ táº£']} "
            f"(HÆ°Æ¡ng vá»‹: {product['HÆ°Æ¡ng vá»‹']}, Äá»™ phÃ¹ há»£p: {product['Äá»™ tÆ°Æ¡ng Ä‘á»“ng']}%). "
            f"LÆ°u Ã½ chá»‘ng chá»‰ Ä‘á»‹nh: {warning}."
        )
    return "Báº¡n cÃ³ thá»ƒ tham kháº£o cÃ¡c sáº£n pháº©m sau:\n" + "\n".join(lines)


def generate_recommendation_response(features, products):
    """
    features: dict vá»›i cÃ¡c key: mental_state, health_condition, medical_history, taste
    products: list of dict (tá»« retriever.search)
    """
    products_info = "\n".join([
        f"- {p['TÃªn']}: {p['MÃ´ táº£']} (HÆ°Æ¡ng vá»‹: {p['HÆ°Æ¡ng vá»‹']}, Äá»™ phÃ¹ há»£p: {p['Äá»™ tÆ°Æ¡ng Ä‘á»“ng']}%)\n  Chá»‘ng chá»‰ Ä‘á»‹nh: {p['Chá»‘ng chá»‰ Ä‘á»‹nh vá»›i']}"
        for p in products
    ])

    prompt = f"""Báº¡n lÃ  trá»£ lÃ½ tÆ° váº¥n kombucha. Dá»±a trÃªn thÃ´ng tin ngÆ°á»i dÃ¹ng:
- Tráº¡ng thÃ¡i tinh tháº§n: {', '.join(features.get('mental_state', []))}
- TÃ¬nh tráº¡ng sá»©c khá»e: {', '.join(features.get('health_condition', []))}
- Tiá»n sá»­ bá»‡nh ná»n: {', '.join(features.get('medical_history', []))}
- Kháº©u vá»‹: {', '.join(features.get('taste', []))}

VÃ  danh sÃ¡ch sáº£n pháº©m phÃ¹ há»£p (Ä‘á»™ tÆ°Æ¡ng Ä‘á»“ng >= 60%):
{products_info}

HÃ£y giá»›i thiá»‡u 2-3 sáº£n pháº©m gá»£i Ã½. Giáº£i thÃ­ch lÃ½ do vÃ¬ sao sáº£n pháº©m Ä‘Ã³ phÃ¹ há»£p vá»›i tÃ¬nh tráº¡ng cá»§a ngÆ°á»i dÃ¹ng. Náº¿u cÃ³ chá»‘ng chá»‰ Ä‘á»‹nh, hÃ£y nháº¯c nhá»Ÿ nháº¹ nhÃ ng. Tráº£ lá»i báº±ng tiáº¿ng Viá»‡t, giá»ng vÄƒn thÃ¢n thiá»‡n, tá»± nhiÃªn.
"""
    try:
        response = get_llm_client().chat.completions.create(
            model=get_chat_model(),
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        return response.choices[0].message.content or _build_fallback_response(products)
    except Exception as e:
        print(f"Error in generate_recommendation_response: {e}")
        return _build_fallback_response(products)
