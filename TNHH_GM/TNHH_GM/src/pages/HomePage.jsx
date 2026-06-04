import React from 'react';
import CategoryCard from '../components/home/CategoryCard';
import ProductCardSquare from '../components/home/ProductCard';
import PromoBanner from '../components/home/PromoBanner';
import HotDealsSection from '../components/home/HotDealsSection';
import DiscountBanner from '../components/home/DiscountBanner';
import LatestNewsSection from '../components/home/LatestNewsSection';
import HeroSection from '../components/home/HeroSection';
import anh1 from '../assets/1.png';
import anh2 from '../assets/2.png';
import anh3 from '../assets/3.png';
import anh4 from '../assets/4.png';
import anh5 from '../assets/5.png';
import anh6 from '../assets/6.png';
import anh7 from '../assets/7.png';
import anh8 from '../assets/8.png';
import anh9 from '../assets/9.png';
import anh10 from '../assets/10.png';
import ProductCard from '../components/home/ProductCard';

const HomePage = () => {
  const popularProducts = [
    {
      id: 1,
      name: "Trái cây hỗn hợp tươi",
      price: 120.00,
      image: anh1,
      rating: 5,
      isOnSale: true,
      originalPrice: 24.99
    },
    {
      id: 2,
      name: "Sản phẩm mẫu 2",
      price: 80.00,
      image: anh2,
      rating: 4,
      isOnSale: false,
      originalPrice: 24.99
    },
    {
      id: 3,
      name: "Sản phẩm mẫu 3",
      price: 80.00,
      image: anh3,
      rating: 4,
      isOnSale: true,
      originalPrice: 24.99
    },
    {
      id: 4,
      name: "Sản phẩm mẫu 4",
      price: 80.00,
      image: anh4,
      rating: 4,
      isOnSale: true,
      originalPrice: 24.99
    },
    {
      id: 5,
      name: "Sản phẩm mẫu 5",
      price: 80.00,
      image: anh5,
      rating: 4,
      isOnSale: false,
      originalPrice: 24.99,
    },
    {
      id: 6,
      name: "Sản phẩm mẫu 6",
      price: 80.00,
      image: anh6,
      rating: 4,
      isOnSale: true,
      originalPrice: 24.99
    },
    {
      id: 7,
      name: "Sản phẩm mẫu 7",
      price: 80.00,
      image: anh7,
      rating: 4,
      isOnSale: true,
      originalPrice: 24.99
    },
    {
      id: 8,
      name: "Sản phẩm mẫu 8",
      price: 80.00,
      image: anh8,
      rating: 4,
      isOnSale: true,
      originalPrice: 24.99
    },
    {
      id: 9,
      name: "Sản phẩm mẫu 9",
      price: 80.00,
      image: anh9,
      rating: 4,
      isOnSale: true,
      originalPrice: 24.99
    },
    {
      id: 10,
      name: "Sản phẩm mẫu 10",
      price: 80.00,
      image: anh10,
      rating: 4,
      isOnSale: true,
      originalPrice: 24.99
    },
  ];
  return (
    <div className="space-y-16 py-10 px-4 md:px-8 max-w-7xl mx-auto">
      <HeroSection />

      <section className="my-16">
        <h2 className="text-2xl font-bold text-center mb-8">Popular Product</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {popularProducts.map((item) => (
            <ProductCard
              key={item.id}
              product={item}
            />
          ))}
        </div>
      </section>
      <HotDealsSection />
      <DiscountBanner />
      <section className="my-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <button className="text-green-600 font-bold hover:underline">View All →</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <ProductCardSquare key={`featured-${i}`} />
          ))}
        </div>
      </section>

      <LatestNewsSection />
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PromoBanner
          subtitle="Sale of the Month"
          title="Fresh & Healthy Organic Food"
          buttonText="Shop Now"
          bgColor="bg-blue-100"
        />
        <PromoBanner
          subtitle="80% Fat Free"
          title="Low-Fat Meat Fresh & Clean"
          buttonText="Shop Now"
          bgColor="bg-gray-900"
          dark={true}
        />
        <PromoBanner
          subtitle="100% Fresh"
          title="Drink Fruit Juice Everyday"
          buttonText="Shop Now"
          bgColor="bg-yellow-100"
        />
      </section>
    </div>
  );
};

export default HomePage;
