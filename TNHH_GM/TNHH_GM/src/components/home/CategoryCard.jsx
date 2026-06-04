import React from 'react';

const CategoryCard = ({ category }) => {
  // Dữ liệu mẫu
  const item = category || { name: 'Rau củ', icon: '🥦', color: 'bg-green-50' };

  return (
    <div className="group cursor-pointer flex flex-col items-center transition-transform hover:-translate-y-1">
      {/* Vòng tròn chứa icon/ảnh */}
      <div className={`w-20 h-20 md:w-24 md:h-24 ${item.color} rounded-full flex items-center justify-center border border-transparent group-hover:border-green-500 group-hover:shadow-md transition-all`}>
        <span className="text-3xl md:text-4xl">{item.icon}</span>
      </div>
      
      {/* Tên danh mục */}
      <span className="mt-3 text-sm font-medium text-gray-700 group-hover:text-green-600">
        {item.name}
      </span>
    </div>
  );
};

export default CategoryCard;