import React, { useState } from 'react';
// Import component chatbot bạn đã code ở đây
import Chatbot from '../Chatbot/Chatbot';
import avatar2 from '../../assets/chatavt3.png';

// src/components/common/ChatbotLauncher.jsx
//  // Nhớ đúng tên file của bạn

export const ChatbotLauncher = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 h-[min(550px,calc(100vh-8rem))] w-[calc(100vw-2rem)] max-w-[380px] shadow-2xl rounded-2xl overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300 relative">
          {/* Nút X để đóng, đặt tuyệt đối trên cùng bên phải */}
          <button 
            type="button"
            aria-label="Đóng chatbot"
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-[10001] text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {/* Gọi trực tiếp Chatbot của bạn */}
          <Chatbot />
        </div>
      )}

      <button
        type="button"
        aria-label={isOpen ? 'Đóng chatbot' : 'Mở chatbot'}
        onClick={() => setIsOpen(!isOpen)}
        // Tôi đã xóa class 'flex items-center justify-center' cũ
        // để ảnh có thể chiếm trọn không gian nút bấm.
        // Đồng thời đổi 'w-14 h-14' thành 'w-16 h-16' cho to hơn một chút nếu dùng ảnh.
        className={`w-16 h-16 rounded-full shadow-lg overflow-hidden transition-all duration-300 transform hover:scale-110 ${
          isOpen ? 'bg-red-500 rotate-90' : '' // Bỏ 'bg-green-600' khi đóng để hiện ảnh nền
        }`}
      >
        {isOpen ? (
          // 1. Icon dấu X khi đang mở (Dùng flex để căn giữa)
          <div className="flex items-center justify-center w-full h-full">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        ) : (
          // 2. THAY THẾ SVG BẰNG THẺ IMG KHI ĐANG ĐÓNG
          <img 
            src={avatar2}
            alt="Chat Icon" 
            // object-cover giúp ảnh lấp đầy nút bấm mà không bị méo.
            className="w-full h-full object-cover transition-opacity duration-300"
          />
        )}
      </button>
    </div>
  );
};
export default ChatbotLauncher;
