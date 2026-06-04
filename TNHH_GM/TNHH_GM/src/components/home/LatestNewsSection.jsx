import React from 'react';
import BlogCard from './BlogCard'; // Import component vừa tạo ở trên

const LatestNewsSection = () => {
  return (
    <section className="my-16">
      {/* Tiêu đề */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900">Latest News</h2>
      </div>

      {/* Grid chứa 3 bài viết */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BlogCard 
          date="18" month="Nov" 
          imageUrl="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop"
        />
        <BlogCard 
          date="23" month="Oct" 
          imageUrl="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop"
        />
        <BlogCard 
          date="05" month="Sep" 
          imageUrl="https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop"
        />
      </div>
    </section>
  );
};

export default LatestNewsSection;