import { useEffect, useMemo, useRef, useState } from 'react';
import ProductCardSquare from '../components/home/ProductCard';
import ProductDetailModal from '../components/home/ProductDetailModal';
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
import { fetchProductDetail, fetchProducts } from '../lib/api';

const productImages = {
  '1.png': anh1,
  '2.png': anh2,
  '3.png': anh3,
  '4.png': anh4,
  '5.png': anh5,
  '6.png': anh6,
  '7.png': anh7,
  '8.png': anh8,
  '9.png': anh9,
  '10.png': anh10,
};

const productPrices = [120000, 98000, 105000, 96000, 110000, 99000, 108000, 102000, 115000, 100000];

const HomePage = () => {
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogError, setCatalogError] = useState('');
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(anh1);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const openedDeepLink = useRef(false);

  useEffect(() => {
    let isCancelled = false;

    const loadProducts = async () => {
      try {
        const payload = await fetchProducts();
        if (!isCancelled) {
          setCatalogProducts(payload.items || []);
        }
      } catch (error) {
        if (!isCancelled) {
          setCatalogError(error.message || 'Không thể tải danh mục sản phẩm.');
        }
      } finally {
        if (!isCancelled) {
          setIsCatalogLoading(false);
        }
      }
    };

    loadProducts();
    return () => {
      isCancelled = true;
    };
  }, []);

  const popularProducts = useMemo(
    () =>
      catalogProducts.map((product, index) => ({
        ...product,
        id: product.product_code,
        name: product.product_name,
        image: productImages[product.image_name],
        price: productPrices[index] || 100000,
        rating: 5,
        isOnSale: index !== 1 && index !== 4,
        originalPrice: Math.round((productPrices[index] || 100000) * 1.2),
      })),
    [catalogProducts],
  );

  const handleSelectProduct = async (product) => {
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    setDetailError('');
    setSelectedProduct(null);
    setSelectedImage(product.image);

    try {
      const detail = await fetchProductDetail(product.product_code);
      setSelectedProduct(detail);
    } catch (error) {
      setDetailError(error.message || 'Không thể tải thông tin sản phẩm.');
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    if (isCatalogLoading || openedDeepLink.current) {
      return;
    }

    const productCode = new URLSearchParams(window.location.search).get('product');
    if (!productCode) {
      return;
    }

    openedDeepLink.current = true;
    const linkedProduct = popularProducts.find(
      (product) => product.product_code === productCode,
    );

    if (linkedProduct) {
      handleSelectProduct(linkedProduct);
      return;
    }

    setIsDetailOpen(true);
    setDetailError('Không tìm thấy sản phẩm từ đường dẫn này.');
  }, [isCatalogLoading, popularProducts]);

  return (
    <>
      <div className="space-y-16 py-10 px-4 md:px-8 max-w-7xl mx-auto">
        <HeroSection />

        <section className="my-16">
          <h2 className="text-2xl font-bold text-center mb-8">Popular Product</h2>

          {isCatalogLoading ? (
            <div className="py-16 text-center text-gray-500">
              Đang tải sản phẩm từ PostgreSQL...
            </div>
          ) : catalogError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-10 text-center text-red-700">
              {catalogError}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {popularProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onSelect={handleSelectProduct}
                />
              ))}
            </div>
          )}
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

      <ProductDetailModal
        isOpen={isDetailOpen}
        product={selectedProduct}
        image={selectedImage}
        isLoading={isDetailLoading}
        error={detailError}
        onClose={() => setIsDetailOpen(false)}
      />
    </>
  );
};

export default HomePage;
