import React from 'react';
import bannerBigImg from '../../assets/BannerBig.png';
const HeroSection = () => {
  return (
    <section className="mb-12">
      
      {/* 1. KHỐI BANNERS LỚN VÀ NHỎ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Banner Lớn (Bên trái - Chiếm 2/3 không gian trên Desktop) */}
        <div className="lg:col-span-2 bg-[#E6F4EA] rounded-2xl p-8 md:p-12 relative overflow-hidden flex flex-col justify-center min-h-[400px]">
          {/* Lớp overlay nội dung chữ */}
          <div className="relative z-50 max-w-sm">
            <h1 className="text-4xl md:text-5xl font-normal text-gray-900 mb-4 leading-tight z-50">
              Fresh & Healthy <br/> Organic Food
            </h1>
            <div className="flex items-center gap-4 mb-8">
              <div className="flex flex-col border-l-2 border-green-500 pl-3">
                <span className="text-gray-500 text-[11px] font-bold uppercase tracking-wider mb-1">Sale up to</span>
                <span className="bg-orange-500 text-white font-bold px-2 py-0.5 rounded text-sm w-fit">30% OFF</span>
              </div>
              <span className="text-gray-500 text-sm max-w-[120px] leading-tight font-medium">Free shipping on all your order.</span>
            </div>
            <button className="bg-white text-green-600 font-bold px-8 py-3.5 rounded-full flex items-center gap-3 hover:bg-green-600 hover:text-white transition-all shadow-md group w-fit">
              Shop now
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </div>
          {/* Ảnh minh họa (cô gái) */}
          <div className="absolute right-0 bottom-0 w-[65%] h-full hidden sm:block">
            {/* Lớp gradient này sẽ làm mờ mép trái của ảnh để chìm mượt mà vào nền */}
            
            <div className="absolute inset-0 bg-gradient-to-r from-[#E6F4EA] via-transparent to-transparent z-20"></div>
            <img 
              src={bannerBigImg} 
              alt="Fresh Food" 
              className="w-full h-full object-cover rounded-r-2xl relative z-0" 
            />
          </div>
        </div>

        {/* 2 Banner Nhỏ (Bên phải) */}
        <div className="flex flex-col gap-6">
          
          {/* Banner Nhỏ 1 (Trên - Nền xám nhạt) */}
          <div className="bg-gray-100 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden flex-1 min-h-[190px]">
             <div className="relative z-10 max-w-[55%]">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Summer Sale</p>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">75% OFF</h3>
                <p className="text-xs text-gray-500 mb-4">Only Fruit & Vegetable</p>
                <button className="text-green-600 text-sm font-bold flex items-center gap-1 hover:text-green-700 group">
                  Shop Now <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
             </div>
             {/* Ảnh minh họa quả dứa */}
             <img src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=400&auto=format&fit=crop" alt="Summer Fruit" className="absolute right-[-10%] top-0 w-[60%] h-full object-cover" />
          </div>

          {/* Banner Nhỏ 2 (Dưới - Nền đen / Texture lá cây) */}
          <div className="bg-[#1A1A1A] rounded-2xl p-6 flex flex-col justify-center items-center text-center relative overflow-hidden flex-1 min-h-[190px]">
             <div className="relative z-10 w-full flex flex-col items-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Best Deal</p>
                <h3 className="text-xl font-bold text-white mb-4 leading-tight">Special Products<br/>Deal of the Month</h3>
                <button className="text-green-500 text-sm font-bold flex items-center gap-1 hover:text-green-400 group">
                  Shop Now <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
             </div>
             {/* Background chìm lá cây xanh đậm */}
             <div className="absolute inset-0 bg-green-900 opacity-20 mix-blend-overlay"></div>
          </div>

        </div>

      </div>

      {/* 2. DẢI 4 ICON TÍNH NĂNG (Features) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <FeatureBox 
          icon="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
          title="Free Shipping" 
          desc="Free shipping on all your order" 
        />
        <FeatureBox 
          icon="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" 
          title="Customer Support 24/7" 
          desc="Instant access to Support" 
        />
        <FeatureBox 
          icon="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
          title="100% Secure Payment" 
          desc="We ensure your money is save" 
        />
        <FeatureBox 
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          title="Money-Back Guarantee" 
          desc="30 Days Money-Back Guarantee" 
        />
      </div>

    </section>
  );
};

// Component tái sử dụng cho 4 ô tính năng
const FeatureBox = ({ icon, title, desc }) => (
  <div className="flex items-center gap-4 group">
    <div className="text-green-600 group-hover:scale-110 transition-transform duration-300">
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={icon} /></svg>
    </div>
    <div>
      <h4 className="font-bold text-gray-900 text-sm mb-0.5">{title}</h4>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  </div>
);

export default HeroSection;