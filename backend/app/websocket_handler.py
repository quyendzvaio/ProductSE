import json

from fastapi import WebSocketDisconnect

from .llm_response import generate_recommendation_response
from .retrieval import ProductRetriever

QUESTIONNAIRE = (
    (
        "health_condition",
        "Trước tiên, sức khỏe dạo này của bạn thế nào? Nếu đang có điều gì khiến bạn "
        "khó chịu hoặc cần mình lưu ý, bạn cứ chia sẻ nhé.",
    ),
    (
        "preferences",
        "Cảm ơn bạn đã chia sẻ. Về khẩu vị, bạn thường thích vị chua thanh, ngọt nhẹ, "
        "cay ấm hay hương trái cây? Bạn cũng có thể nói thêm nếu muốn ít đường hoặc "
        "hạn chế caffeine nhé.",
    ),
    (
        "medical_history",
        "Mình xin phép hỏi thêm một chút để tư vấn cẩn thận hơn: bạn có bệnh nền, dị "
        "ứng, đang dùng thuốc, đang mang thai hoặc cho con bú không?",
    ),
    (
        "mental_state",
        "Còn tinh thần của bạn dạo này thế nào? Bạn đang khá thoải mái hay thường mệt, "
        "căng thẳng hoặc khó ngủ?",
    ),
    (
        "product_goals",
        "Cuối cùng, bạn mong muốn điều gì nhất ở sản phẩm? Chẳng hạn như ít đường, hạn "
        "chế caffeine, phù hợp với chế độ kiểm soát cân nặng, tập luyện, giấc ngủ hoặc "
        "chăm sóc da.",
    ),
)

WELCOME_MESSAGE = (
    "Chào bạn, mình là tư vấn viên của Green Meal. Để chọn kombucha hợp khẩu vị và nhu "
    "cầu của bạn hơn, mình xin hỏi vài câu ngắn nhé.\n\n"
    f"{QUESTIONNAIRE[0][1]}"
)


class Session:
    def __init__(self):
        self.history = []
        self.profile = {}
        self.question_index = 0
        self.done = False

    def reset(self):
        self.history = []
        self.profile = {}
        self.question_index = 0
        self.done = False


sessions = {}
retriever = ProductRetriever()


def create_session():
    session = Session()
    session.history.append({"role": "assistant", "content": WELCOME_MESSAGE})
    return session, WELCOME_MESSAGE


def _build_search_query(profile: dict) -> str:
    return " ".join(
        [
            profile.get("health_condition", ""),
            profile.get("preferences", ""),
            profile.get("mental_state", ""),
            profile.get("product_goals", ""),
        ]
    ).strip()


def process_user_message(session, user_msg):
    user_msg = str(user_msg or "").strip()
    if not user_msg:
        return None

    if session.done:
        if user_msg.lower() in {"tư vấn lại", "tu van lai", "bắt đầu lại", "bat dau lai"}:
            session.reset()
            session.history.append({"role": "assistant", "content": WELCOME_MESSAGE})
            return {"type": "question", "content": WELCOME_MESSAGE, "products": []}
        message = (
            "Mình đã gửi xong phần gợi ý rồi nhé. Khi muốn chọn lại theo nhu cầu khác, "
            "bạn chỉ cần nhắn “tư vấn lại” là được."
        )
        session.history.append({"role": "assistant", "content": message})
        return {"type": "message", "content": message, "products": []}

    session.history.append({"role": "user", "content": user_msg})
    field_name, _ = QUESTIONNAIRE[session.question_index]
    session.profile[field_name] = user_msg
    session.question_index += 1

    if session.question_index < len(QUESTIONNAIRE):
        question = QUESTIONNAIRE[session.question_index][1]
        session.history.append({"role": "assistant", "content": question})
        return {"type": "question", "content": question, "products": []}

    products = retriever.search(
        _build_search_query(session.profile),
        medical_history=session.profile.get("medical_history", ""),
        candidate_k=5,
        top_k=2,
    )
    response = generate_recommendation_response(session.profile, products)
    session.history.append({"role": "assistant", "content": response})
    session.done = True
    return {
        "type": "recommendation",
        "content": response,
        "products": products,
    }


async def _send_event(websocket, event_type, content, products=None):
    payload = {"type": event_type, "content": content}
    if products is not None:
        payload["products"] = products
    await websocket.send_json(payload)


async def handle_websocket(websocket):
    session, welcome = create_session()
    sessions[websocket] = session
    try:
        await _send_event(websocket, "message", welcome)

        while True:
            raw_message = await websocket.receive_text()
            try:
                data = json.loads(raw_message)
            except json.JSONDecodeError:
                data = {"type": "text", "content": raw_message}

            if not isinstance(data, dict) or data.get("type") != "text":
                continue

            response_payload = process_user_message(session, data.get("content", ""))
            if response_payload is None:
                continue
            await _send_event(
                websocket,
                response_payload["type"],
                response_payload["content"],
                products=response_payload.get("products"),
            )
    except WebSocketDisconnect:
        pass
    except Exception as exc:
        print(f"Error in WebSocket: {exc}")
        try:
            await _send_event(
                websocket,
                "error",
                "Mình đang gặp chút trục trặc khi xử lý tin nhắn. Bạn thử gửi lại sau "
                "ít phút giúp mình nhé.",
            )
        except Exception:
            pass
    finally:
        sessions.pop(websocket, None)
