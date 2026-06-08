import React from 'react';
import anh2 from '../../assets/2.png';


// Component ProductCard cập nhật để vuông vức hơn giống mẫu
const ProductCardSquare = ({ product, onSelect }) => {
  // Dữ liệu giả định để test nếu không có props
  const defaultProduct = {
          id: 10,
          name: "Sản phẩm Placeholder 10",
          price: 100.00,
          image: anh2, 
          rating: 4,
          isOnSale: true,
          originalPrice: 24.99
  };

  const p = product || defaultProduct;
  const handleSelect = () => {
    if (onSelect && p.product_code) {
      onSelect(p);
    }
  };

  return (
    // THAY ĐỔI 1: Tỷ lệ Card tổng thể
    // w-full, nhưng đảm bảo nó luôn là hình vuông bằng aspect-square.
    // Thêm overflow-hidden và giảm p (padding) để nội dung sát mép hơn giống mẫu.
    <article
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={handleSelect}
      onKeyDown={(event) => {
        if (onSelect && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          handleSelect();
        }
      }}
      className={`bg-white border border-gray-100 rounded p-1.5 group flex flex-col items-center hover:border-green-500 hover:shadow-lg transition-all duration-300 w-full aspect-square relative overflow-hidden ${
        onSelect ? "cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500" : ""
      }`}
    >
      
      {/* Label SALE - Giữ nguyên nhưng chỉnh vị trí cho gọn */}
      {p.isOnSale && (
        <span className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm z-10">
          -20%
        </span>
      )}

      {/* THAY ĐỔI 2: Phần ảnh sản phẩm vuông tuyệt đối */}
      {/* aspect-square đảm bảo container ảnh luôn vuông. 
          Căn giữa ảnh tuyệt đối bên trong. */}
      <div className="w-full aspect-square flex items-center justify-center p-2 mb-1.5 relative">
        <img 
          src={p.image} 
          alt={p.name} 
          className="max-h-[85%] max-w-[85%] object-contain group-hover:scale-105 transition-transform duration-300" 
        />
        
        {/* THAY ĐỔI 3: Actions ẩn hiện (Yêu thích, Xem nhanh) - Giống mẫu */}
        {/* Di chuyển phần actions này lên đè trên ảnh, chỉ hiện khi hover. 
            Giúp phần dưới Card gọn gàng hơn, tập trung cho tên và giá. */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 md:opacity-0 md:group-hover:opacity-100 transition duration-300 z-10">
          <button
            type="button"
            onClick={(event) => event.stopPropagation()}
            className="p-1.5 border border-gray-100 rounded-full bg-white hover:bg-green-50 text-gray-400 hover:text-green-600 shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleSelect();
            }}
            className="p-1.5 border border-gray-100 rounded-full bg-white hover:bg-green-50 text-gray-400 hover:text-green-600 shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </div>

      {/* THAY ĐỔI 4: Phần thông tin sản phẩm (Thu nhỏ lại để Card vuông hơn) */}
      <div className="w-full text-center mt-auto px-1 pb-1">
        {/* Tên sản phẩm - Font nhỏ hơn, căn giữa */}
        <h3 className="text-gray-800 text-[11px] font-normal hover:text-green-600 line-clamp-2 mb-1 h-[28px] flex items-center justify-center">
          {p.name}
        </h3>
        
        {/* Phần giá - Font nhỏ hơn, căn giữa */}
        <div className="flex items-center justify-center gap-1.5 mb-1.5">
          <span className="text-green-600 font-bold text-xs">
            ${p.price.toFixed(2)}
          </span>
          {p.originalPrice && (
            <span className="text-gray-400 text-[10px] line-through">
              ${p.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Nút chính Add to Cart - Chỉ hiện khi hover, không dùng chữ (như mẫu thường làm khi Card vuông nhỏ) */}
        {/* Hoặc, nếu muốn giống mẫu hơn ở phần "Popular Products", tôi sẽ dùng icon Giỏ hàng nhỏ. */}
        <div className="w-full mt-auto md:opacity-0 md:group-hover:opacity-100 transition duration-300">
          <button
            type="button"
            onClick={(event) => event.stopPropagation()}
            className="w-full bg-green-600 hover:bg-green-700 text-white text-[11px] font-semibold py-1.5 rounded flex items-center justify-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Add
          </button>
        </div>
      </div>

    </article>
  );
};

export default ProductCardSquare;
