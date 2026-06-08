import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchProductDetail, fetchProducts } from '../lib/api';
import HomePage from './HomePage';


vi.mock('../lib/api', () => ({
  fetchProducts: vi.fn(),
  fetchProductDetail: vi.fn(),
}));

vi.mock('../components/home/ProductCard', () => ({
  default: ({ product }) => <div>{product?.product_name || 'Sản phẩm'}</div>,
}));
vi.mock('../components/home/ProductDetailModal', () => ({
  default: ({ isOpen, product, isLoading, error }) =>
    isOpen ? (
      <div role="dialog">
        {isLoading ? 'Đang tải' : product?.product_name || error}
      </div>
    ) : null,
}));
vi.mock('../components/home/PromoBanner', () => ({ default: () => null }));
vi.mock('../components/home/HotDealsSection', () => ({ default: () => null }));
vi.mock('../components/home/DiscountBanner', () => ({ default: () => null }));
vi.mock('../components/home/LatestNewsSection', () => ({ default: () => null }));
vi.mock('../components/home/HeroSection', () => ({ default: () => null }));

const product = {
  product_code: 'kombucha-vi-nho',
  product_name: 'Kombucha vị nho',
  image_name: '5.png',
};

describe('HomePage product deep link', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, '', '/?product=kombucha-vi-nho');
    fetchProducts.mockResolvedValue({ items: [product] });
    fetchProductDetail.mockResolvedValue({
      ...product,
      description: 'Kombucha vị nho chua ngọt cân bằng',
    });
  });

  it('loads the linked product from PostgreSQL API and opens its detail', async () => {
    render(<HomePage />);

    await waitFor(() => {
      expect(fetchProductDetail).toHaveBeenCalledWith('kombucha-vi-nho');
    });
    expect(
      await screen.findByRole('dialog'),
    ).toHaveTextContent('Kombucha vị nho');
  });
});
