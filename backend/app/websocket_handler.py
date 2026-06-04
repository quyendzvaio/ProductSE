import json

from fastapi import WebSocketDisconnect

from .llm_extractor import extract_features
from .llm_response import generate_recommendation_response
from .retrieval import ProductRetriever

retriever = None
retriever_error = None


class Session:
    def __init__(self):
        self.history = []
        self.features = None
        self.done = False


sessions = {}


def get_retriever():
    global retriever, retriever_error

    if retriever is not None or retriever_error is not None:
        return retriever

    try:
        retriever = ProductRetriever()
    except Exception as exc:
        retriever_error = str(exc)
        print(f"Retriever unavailable: {retriever_error}")

    return retriever


def create_session():
    session = Session()
    welcome = (
        "Chao ban! Toi la tro ly tu van kombucha. "
        "Hay cho toi biet trang thai tinh than, tinh trang suc khoe, "
        "tien su benh va khau vi cua ban de toi goi y san pham phu hop."
    )
    session.history.append({"role": "assistant", "content": welcome})
    return session, welcome


def process_user_message(session, user_msg):
    user_msg = str(user_msg or "").strip()
    if not user_msg:
        return None

    session.history.append({"role": "user", "content": user_msg})
    result = extract_features(session.history)

    if "features" in result:
        features = result["features"]
        session.features = features

        query_text = " ".join(
            [
                " ".join(features.get("mental_state", [])),
                " ".join(features.get("health_condition", [])),
                " ".join(features.get("medical_history", [])),
                " ".join(features.get("taste", [])),
            ]
        ).strip()

        products = []
        active_retriever = get_retriever()

        if active_retriever is not None:
            products = active_retriever.search(query_text, threshold=0.6, top_k=5)
            if not products:
                products = active_retriever.search(query_text, threshold=0.0, top_k=3)
                intro = (
                    "Rat tiec, khong co san pham nao dat do phu hop 60%. "
                    "Duoi day la mot so goi y co do tuong dong thap hon de ban tham khao:\n\n"
                )
            else:
                intro = "Duoi day la cac san pham phu hop voi ban:\n\n"
        else:
            intro = (
                "He thong tu van san pham dang tam thoi chua tai duoc bo truy hoi noi bo. "
                "Toi se tra loi o muc co ban dua tren thong tin hien co.\n\n"
            )

        rec_text = generate_recommendation_response(features, products)
        full_response = intro + rec_text
        session.history.append({"role": "assistant", "content": full_response})
        session.done = True
        return {
            "type": "recommendation",
            "content": full_response,
            "products": products,
        }

    question = result.get(
        "question",
        "Ban co the chia se them ve trang thai tinh than, suc khoe, tien su benh va khau vi cua ban khong?",
    )
    session.history.append({"role": "assistant", "content": question})
    return {"type": "question", "content": question}


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

            if not isinstance(data, dict):
                continue

            if data.get("type") == "text":
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
        import traceback

        traceback.print_exc()
        try:
            await _send_event(
                websocket,
                "error",
                "Server dang gap loi khi xu ly yeu cau. Ban thu gui lai tin nhan sau it phut.",
            )
        except Exception:
            pass
    finally:
        sessions.pop(websocket, None)
