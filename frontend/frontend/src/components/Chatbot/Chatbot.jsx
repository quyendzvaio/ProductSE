import { useEffect, useRef, useState } from "react";

import avatar2 from "../../assets/chatavt2.png";
import { postChatMessage } from "../../lib/api";
import Botchat from "../Chattext/Botchat";
import Userchat from "../Chattext/Userchat";
import "./Chatbot.css";

const INITIAL_MESSAGE = {
  id: 1,
  sender: "bot",
  content:
    "Mình đang chuẩn bị một chút, bạn chờ mình nhé...",
};

function Chatbot() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let isCancelled = false;

    const initializeSession = async () => {
      try {
        const payload = await postChatMessage({
          message: "",
          sessionId: null,
        });
        if (isCancelled) {
          return;
        }
        setSessionId(payload.session_id);
        setMessages([
          {
            id: 1,
            sender: "bot",
            content: payload.content,
          },
        ]);
      } catch (error) {
        console.error("Không thể khởi tạo phiên chatbot:", error);
        if (!isCancelled) {
          setMessages([
            {
              id: 1,
              sender: "bot",
              content:
                "Mình chưa thể bắt đầu cuộc trò chuyện lúc này. Bạn đóng khung chat rồi "
                + "mở lại giúp mình nhé.",
            },
          ]);
        }
      }
    };

    initializeSession();
    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    const textToSend = inputValue.trim();
    if (!textToSend || isTyping || !sessionId) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "user", content: textToSend },
    ]);
    setInputValue("");
    setIsTyping(true);

    try {
      const payload = await postChatMessage({
        message: textToSend,
        sessionId,
      });

      setSessionId(payload.session_id);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          content:
            (payload.content || "").trim() ||
            "Mình chưa nhận được đủ thông tin để trả lời. Bạn thử nhắn lại giúp mình nhé.",
          products: payload.products || [],
        },
      ]);
    } catch (error) {
      console.error("Lỗi khi gọi chatbot backend:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          content: "Mình đang gặp chút trục trặc. Bạn thử gửi lại sau ít phút nhé.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot">
      <div className="header">
        <img src={avatar2} alt="Avatar" />
        <div className="info">
          <h2>Tư vấn Green Meal</h2>
          <p>Đang trực tuyến</p>
        </div>
      </div>

      <div className="content">
        {messages.map((message) =>
          message.sender === "user" ? (
            <Userchat key={message.id} content={message.content} />
          ) : (
            <Botchat
              key={message.id}
              content={message.content}
              products={message.products}
            />
          ),
        )}
        {isTyping ? <Botchat key="typing" content="Mình đang xem thông tin..." /> : null}
        <div ref={messagesEndRef} />
      </div>

      <div className="inputbox">
        <input
          type="text"
          placeholder="Nhập tin nhắn..."
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          onClick={handleSendMessage}
          disabled={isTyping || !sessionId}
        >
          Gửi
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
