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
    "Xin chào! Tôi là chatbot hỗ trợ khách hàng của Green Meal. Bạn cần GM tư vấn điều gì hôm nay?",
};

function Chatbot() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    const textToSend = inputValue.trim();
    if (!textToSend || isTyping) {
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
            "Hệ thống chưa trả về nội dung phản hồi.",
        },
      ]);
    } catch (error) {
      console.error("Lỗi khi gọi chatbot backend:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "bot",
          content: "Hệ thống đang bận. Bạn thử gửi lại sau ít phút.",
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
          <h2>GM Chatbot</h2>
          <p>Online</p>
        </div>
      </div>

      <div className="content">
        {messages.map((message) =>
          message.sender === "user" ? (
            <Userchat key={message.id} content={message.content} />
          ) : (
            <Botchat key={message.id} content={message.content} />
          ),
        )}
        {isTyping ? <Botchat key="typing" content="Đang trả lời..." /> : null}
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
        <button type="button" onClick={handleSendMessage} disabled={isTyping}>
          Gửi
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
