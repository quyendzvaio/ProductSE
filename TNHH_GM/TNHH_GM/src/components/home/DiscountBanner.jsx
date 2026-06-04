import React from 'react';

const DiscountBanner = () => {
  return (
    // Container chính: Bo góc tròn, cắt phần thừa (overflow-hidden)
    // Mobile thì xếp dọc (flex-col), Desktop thì xếp ngang (md:flex-row)
    <div className="my-16 rounded-2xl overflow-hidden flex flex-col md:flex-row bg-[#1A1A1A] relative shadow-lg">
      
      {/* NỬA TRÁI: Ảnh minh họa */}
      <div className="w-full md:w-1/2 h-64 md:h-[400px] relative">
         {/* Bạn hãy thay link ảnh này bằng một bức ảnh rau củ thật đẹp đẽ nhé */}
         <img
           src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop" 
           alt="Summer Sale Vegetables"
           className="w-full h-full object-cover"
         />
         {/* Lớp phủ gradient (Overlay) để phần viền ảnh chìm vào nền đen bên phải, tạo cảm giác mượt mà */}
         <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#1A1A1A] via-transparent to-transparent md:from-transparent md:via-transparent md:to-[#1A1A1A] opacity-90 md:opacity-100"></div>
      </div>

      {/* NỬA PHẢI: Nội dung chữ */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center items-start text-white relative z-10">
         <p className="text-xs md:text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3 md:mb-4">
            Summer Sale
         </p>
         
         <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
           <span className="text-orange-500">37%</span> OFF
         </h2>
         
         <p className="text-gray-400 text-sm md:text-base mb-6 md:mb-8 max-w-md leading-relaxed">
           Free on all your order, Free Shipping and 30 days money-back guarantee
         </p>
         
         <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 transition-all hover:pr-4 group">
           Shop Now
           <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
           </svg>
         </button>
      </div>

    </div>
  );
};

export default DiscountBanner;