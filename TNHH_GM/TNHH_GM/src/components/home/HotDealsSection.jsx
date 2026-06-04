import React from 'react';
import ProductCardSquare from './ProductCard';
import { useCountdown } from '../../hooks/useCountdown';
import anh3 from '../../assets/GMlogo2.png';
const HotDealsSection = () => {
  const [days, hours, minutes, seconds] = useCountdown('2026-12-31T00:00:00');

  return (
    <section className="my-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Hot Deals</h2>
        <button className="text-green-600 font-bold hover:underline">View All →</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        
        {/* Ô DEAL LỚN (Đã được ép chặt lại) */}
        {/* Giảm padding (p-4 thay vì p-6), dùng justify-between để tự động dàn đều nếu dư khoảng trống */}
        <div className="lg:col-span-2 border-2 border-green-500 rounded-xl p-4 md:px-6 flex flex-col justify-between bg-white shadow-sm h-full">
            
            {/* Header của thẻ */}
            <div className="w-full flex justify-between items-start mb-2">
               <span className="bg-red-500 text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Sale 50%</span>
               <div className="text-right leading-tight">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Best Deal</p>
                  <p className="text-xs font-bold text-orange-500 underline">Special Offer</p>
               </div>
            </div>
            
            {/* Ảnh (Thu nhỏ lại w-40 h-40 thay vì 48) và bọc trong flex-grow để căn giữa dọc */}
            <div className="flex-grow flex items-center justify-center min-h-[140px]">
              <img src={anh3} alt="Product" className="w-100 h-100 md:w-86 md:h-86 object-contain drop-shadow-md" />
            </div>
            
            {/* Phần thông tin (Giảm margin-bottom giữa các phần tử) */}
            <div className="text-center w-full mt-2">
              <h3 className="text-lg font-bold text-gray-800 mb-0.5">Kombucha Dâu Tây</h3>
              <div className="flex gap-2 text-xl font-bold text-green-600 mb-3 justify-center items-center">
                  $12.00 <span className="text-gray-300 line-through text-sm font-normal">$24.00</span>
              </div>

              {/* Bộ đếm ngược (Thu nhỏ ô thời gian lại một chút) */}
              <div className="flex gap-1.5 md:gap-2 text-center mb-4 justify-center items-center">
                  <TimeBox label="Days" value={days} />
                  <span className="text-lg font-bold text-gray-400 mb-3">:</span>
                  <TimeBox label="Hours" value={hours} />
                  <span className="text-lg font-bold text-gray-400 mb-3">:</span>
                  <TimeBox label="Mins" value={minutes} />
                  <span className="text-lg font-bold text-gray-400 mb-3">:</span>
                  <TimeBox label="Secs" value={seconds} />
              </div>

              {/* Nút bấm (Làm mỏng lại py-2.5 thay vì py-3) */}
              <button className="w-full bg-green-600 text-white py-2.5 rounded-full text-sm font-bold hover:bg-green-700 transition-all flex justify-center items-center gap-2">
                  Add to Cart
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </button>
            </div>
        </div>

        {/* CÁC Ô NHỎ BÊN PHẢI (Giữ nguyên) */}
        <div className="grid grid-cols-2 grid-rows-2 gap-4 lg:col-span-2">
            {[...Array(4)].map((_, i) => (
                <ProductCardSquare key={i} />
            ))}
        </div>

      </div>
    </section>
  );
};

// Ô thời gian cũng được ép nhỏ lại (w-10 h-10 thay vì 12)
const TimeBox = ({ label, value }) => (
  <div className="flex flex-col items-center">
    <div className="bg-gray-100 w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded text-base font-bold text-gray-800">
        {value < 10 ? `0${value}` : value}
    </div>
    <div className="text-[9px] uppercase text-gray-400 font-bold mt-1">{label}</div>
  </div>
);

export default HotDealsSection;
