import React from 'react';

const PromoBanner = ({ title, subtitle, buttonText, bgColor, dark = false }) => {
  return (
    <div className={`${bgColor} rounded-xl p-6 md:p-8 flex flex-col justify-center min-h-[200px] relative overflow-hidden group`}>
      {/* Nội dung chữ */}
      <div className="relative z-10 max-w-[60%]">
        <p className={`uppercase text-[10px] font-bold tracking-widest mb-2 ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
          {subtitle}
        </p>
        <h3 className={`text-xl md:text-2xl font-bold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        <button className="flex items-center gap-2 text-sm font-bold text-green-600 bg-white px-4 py-2 rounded-full hover:bg-green-600 hover:text-white transition-colors shadow-sm">
          {buttonText}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </button>
      </div>

      {/* Ảnh minh họa (Ví dụ dùng icon hoặc ảnh thật) */}
      <div className="absolute right-[-10%] bottom-[-10%] w-1/2 h-full opacity-80 group-hover:scale-110 transition-transform duration-500">
         {/* Sau này bạn thay bằng thẻ <img> */}
         <div className="text-8xl flex items-end justify-end h-full">🍎</div>
      </div>
    </div>
  );
};

export default PromoBanner;
