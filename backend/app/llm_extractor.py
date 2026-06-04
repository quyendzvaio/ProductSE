import json

from .llm_client import get_chat_model, get_llm_client


def _strip_code_fence(content):
    cleaned = content.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines:
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()
    return cleaned


def extract_features(conversation_history):
    prompt = f"""Báº¡n lÃ  trá»£ lÃ½ AI chuyÃªn tÆ° váº¥n sáº£n pháº©m kombucha. Nhiá»‡m vá»¥ cá»§a báº¡n lÃ  trÃ­ch xuáº¥t cÃ¡c thÃ´ng tin sau tá»« cuá»™c trÃ² chuyá»‡n giá»¯a ngÆ°á»i dÃ¹ng vÃ  trá»£ lÃ½:

1. Tráº¡ng thÃ¡i tinh tháº§n hiá»‡n táº¡i (vÃ­ dá»¥: cÄƒng tháº³ng, má»‡t má»i, thÆ° giÃ£n, vui váº», ...)
2. TÃ¬nh tráº¡ng sá»©c khá»e hiá»‡n táº¡i (vÃ­ dá»¥: Ä‘au bá»¥ng, khÃ³ tiÃªu, Ä‘au Ä‘áº§u, khá»e máº¡nh, ...)
3. Tiá»n sá»­ bá»‡nh ná»n (vÃ­ dá»¥: tiá»ƒu Ä‘Æ°á»ng, cao huyáº¿t Ã¡p, dá»‹ á»©ng, ...)
4. Kháº©u vá»‹ (vÃ­ dá»¥: chua, ngá»t, cay, mÃ¡t, ...)

HÃ£y phÃ¢n tÃ­ch toÃ n bá»™ lá»‹ch sá»­ há»™i thoáº¡i dÆ°á»›i Ä‘Ã¢y. Náº¿u Ä‘Ã£ cÃ³ Ä‘á»§ cáº£ 4 thÃ´ng tin, hÃ£y tráº£ vá» JSON vá»›i key "features". Náº¿u thiáº¿u báº¥t ká»³ thÃ´ng tin nÃ o, hÃ£y tráº£ vá» JSON vá»›i key "missing" (danh sÃ¡ch cÃ¡c trÆ°á»ng cÃ²n thiáº¿u) vÃ  "question" (cÃ¢u há»i Ä‘á»ƒ há»i ngÆ°á»i dÃ¹ng). CÃ¢u há»i nÃªn tá»± nhiÃªn, thÃ¢n thiá»‡n, chá»‰ há»i Ä‘Ãºng thÃ´ng tin cÃ²n thiáº¿u.

Lá»‹ch sá»­ há»™i thoáº¡i:
{json.dumps(conversation_history, ensure_ascii=False, indent=2)}

Tráº£ lá»i (chá»‰ JSON, khÃ´ng cÃ³ vÄƒn báº£n khÃ¡c):
"""
    try:
        response = get_llm_client().chat.completions.create(
            model=get_chat_model(),
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        content = _strip_code_fence(response.choices[0].message.content or "")
        result = json.loads(content)
        return result
    except Exception as e:
        print(f"Error in extract_features: {e}")
        return {"missing": ["all"], "question": "Xin lá»—i, tÃ´i chÆ°a hiá»ƒu rÃµ. Báº¡n cÃ³ thá»ƒ cho tÃ´i biáº¿t rÃµ hÆ¡n vá» tráº¡ng thÃ¡i tinh tháº§n, tÃ¬nh tráº¡ng sá»©c khá»e, tiá»n sá»­ bá»‡nh vÃ  kháº©u vá»‹ cá»§a báº¡n khÃ´ng?"}
