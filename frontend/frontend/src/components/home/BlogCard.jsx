import React from 'react';

const BlogCard = ({ date, month, title, category, author, comments, imageUrl }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 group hover:shadow-md transition-shadow duration-300">
      
      {/* Phần Ảnh và Ô Ngày tháng */}
      <div className="relative h-48 md:h-56 overflow-hidden">
        <img 
          src={imageUrl || "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop"} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Ô Ngày tháng nằm đè lên ảnh (Góc dưới trái) */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg text-center w-12 py-1.5 shadow-md flex flex-col justify-center items-center">
          <span className="text-lg font-bold text-gray-900 leading-none">{date || '18'}</span>
          <span className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">{month || 'Nov'}</span>
        </div>
      </div>

      {/* Phần Nội dung chữ */}
      <div className="p-6">
        {/* Metadata (Danh mục, Tác giả, Bình luận) */}
        <div className="flex flex-wrap gap-4 text-[11px] text-gray-400 mb-3 font-medium">
           <span className="flex items-center gap-1 hover:text-green-600 cursor-pointer">
             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
             {category || 'Food'}
           </span>
           <span className="flex items-center gap-1 hover:text-green-600 cursor-pointer">
             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
             {author || 'By Admin'}
           </span>
           <span className="flex items-center gap-1 hover:text-green-600 cursor-pointer">
             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
             {comments || '65 Comments'}
           </span>
        </div>

        {/* Tiêu đề bài viết */}
        <h3 className="text-[15px] font-bold text-gray-800 mb-4 line-clamp-2 hover:text-green-600 transition-colors cursor-pointer leading-relaxed">
          {title || 'Curabitur porttitor orci eget neque accumsan venenatis. Nunc fermentum.'}
        </h3>

        {/* Nút Read More */}
        <button className="text-green-600 text-sm font-bold flex items-center gap-2 group-hover:gap-3 transition-all">
          Read More 
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </button>
      </div>

    </div>
  );
};

export default BlogCard;