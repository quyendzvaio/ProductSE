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


def _as_list(value):
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def _normalize_features(features):
    return {
        "mental_state": _as_list(features.get("mental_state")),
        "health_condition": _as_list(features.get("health_condition")),
        "medical_history": _as_list(features.get("medical_history")),
        "taste": _as_list(features.get("taste")),
    }


def _heuristic_extract(conversation_history):
    text = " ".join(
        item.get("content", "")
        for item in conversation_history
        if item.get("role") == "user"
    ).lower()

    features = {
        "mental_state": [],
        "health_condition": [],
        "medical_history": [],
        "taste": [],
    }

    keyword_groups = {
        "mental_state": {
            "căng thẳng": ["căng thẳng", "stress", "áp lực"],
            "khó ngủ": ["khó ngủ", "mất ngủ"],
            "mệt mỏi": ["mệt", "mệt mỏi"],
            "thư giãn": ["thư giãn", "thoải mái"],
        },
        "health_condition": {
            "khó tiêu": ["khó tiêu", "đầy bụng", "tiêu hóa"],
            "đau đầu": ["đau đầu"],
            "khỏe mạnh": ["khỏe", "khỏe mạnh", "bình thường"],
            "nóng trong": ["nóng trong", "nóng người"],
        },
        "medical_history": {
            "không có bệnh nền": ["không có bệnh", "không bệnh nền", "không có bệnh nền", "không dị ứng"],
            "tiểu đường": ["tiểu đường", "đái tháo đường"],
            "cao huyết áp": ["cao huyết áp", "huyết áp cao"],
            "dạ dày": ["dạ dày", "trào ngược", "viêm loét"],
            "dị ứng": ["dị ứng"],
        },
        "taste": {
            "chua": ["chua"],
            "ngọt": ["ngọt"],
            "mát": ["mát", "thanh mát"],
            "cay nhẹ": ["cay", "the"],
            "trái cây": ["trái cây", "hoa quả"],
        },
    }

    for field, groups in keyword_groups.items():
        for label, keywords in groups.items():
            if any(keyword in text for keyword in keywords):
                features[field].append(label)

    missing = [field for field, values in features.items() if not values]
    if missing:
        question_map = {
            "mental_state": "trạng thái tinh thần hiện tại",
            "health_condition": "tình trạng sức khỏe hiện tại",
            "medical_history": "tiền sử bệnh hoặc dị ứng",
            "taste": "khẩu vị yêu thích",
        }
        missing_text = ", ".join(question_map[field] for field in missing)
        return {
            "missing": missing,
            "question": f"Bạn cho tôi biết thêm về {missing_text} để tôi gợi ý kombucha phù hợp hơn nhé?",
        }

    return {"features": features}


def extract_features(conversation_history):
    prompt = f"""Bạn là trợ lý AI chuyên tư vấn sản phẩm kombucha. Nhiệm vụ của bạn là trích xuất các thông tin sau từ cuộc trò chuyện giữa người dùng và trợ lý:

1. Trạng thái tinh thần hiện tại, ví dụ: căng thẳng, mệt mỏi, thư giãn, vui vẻ.
2. Tình trạng sức khỏe hiện tại, ví dụ: đau bụng, khó tiêu, đau đầu, khỏe mạnh.
3. Tiền sử bệnh nền hoặc dị ứng, ví dụ: tiểu đường, cao huyết áp, dị ứng, không có bệnh nền.
4. Khẩu vị, ví dụ: chua, ngọt, cay, mát, trái cây.

Hãy phân tích toàn bộ lịch sử hội thoại dưới đây. Nếu đã có đủ cả 4 thông tin, hãy trả về JSON với key "features". Nếu thiếu thông tin, trả về JSON với key "missing" và "question".

Định dạng khi đủ thông tin:
{{
  "features": {{
    "mental_state": ["..."],
    "health_condition": ["..."],
    "medical_history": ["..."],
    "taste": ["..."]
  }}
}}

Lịch sử hội thoại:
{json.dumps(conversation_history, ensure_ascii=False, indent=2)}

Chỉ trả lời JSON hợp lệ, không có văn bản khác.
"""
    try:
        response = get_llm_client().chat.completions.create(
            model=get_chat_model(),
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        content = _strip_code_fence(response.choices[0].message.content or "")
        result = json.loads(content)
        if "features" in result:
            return {"features": _normalize_features(result["features"])}
        return result
    except Exception as exc:
        print(f"Error in extract_features: {exc}")
        return _heuristic_extract(conversation_history)
