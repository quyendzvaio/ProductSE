import { useEffect } from 'react';

const DetailSection = ({ title, children, tone = 'default' }) => (
  <section
    className={`rounded-lg border p-4 ${
      tone === 'warning'
        ? 'border-amber-200 bg-amber-50'
        : 'border-gray-100 bg-gray-50'
    }`}
  >
    <h3 className="text-sm font-bold text-gray-900">{title}</h3>
    <div className="mt-2 text-sm leading-6 text-gray-600">{children}</div>
  </section>
);

const ProductDetailModal = ({
  isOpen,
  product,
  image,
  isLoading,
  error,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const referenceLinks = (product?.references || '')
    .split(';')
    .map((reference) => reference.trim())
    .filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-[10020] flex items-center justify-center bg-black/55 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
        className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-lg bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-green-600">
              Thông tin từ PostgreSQL
            </p>
            <h2 id="product-detail-title" className="mt-1 text-xl font-bold text-gray-900">
              {product?.product_name || 'Chi tiết sản phẩm'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[calc(90vh-76px)] overflow-y-auto">
          {isLoading ? (
            <div className="px-6 py-20 text-center text-gray-500">
              Đang lấy thông tin sản phẩm từ PostgreSQL...
            </div>
          ) : error ? (
            <div className="m-6 rounded-lg border border-red-200 bg-red-50 px-5 py-8 text-center text-red-700">
              {error}
            </div>
          ) : product ? (
            <div className="grid gap-6 p-6 md:grid-cols-[280px_1fr]">
              <div>
                <div className="aspect-square overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                  <img
                    src={image}
                    alt={product.product_name}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm">
                  <p className="font-semibold text-green-800">{product.stock_status}</p>
                  <p className="mt-1 text-green-700">{product.sizes}</p>
                </div>
                <p className="mt-3 break-all text-xs text-gray-400">
                  Mã: {product.product_code}
                </p>
              </div>

              <div className="space-y-4">
                <p className="text-base leading-7 text-gray-700">{product.description}</p>

                <div className="grid gap-4 lg:grid-cols-2">
                  <DetailSection title="Thành phần">{product.ingredients}</DetailSection>
                  <DetailSection title="Thông tin dinh dưỡng">{product.nutrition}</DetailSection>
                  <DetailSection title="Đối tượng nên dùng">
                    {product.recommended_for}
                  </DetailSection>
                  <DetailSection title="Chống chỉ định" tone="warning">
                    {product.contraindications}
                  </DetailSection>
                </div>

                <DetailSection title="Tag sản phẩm">
                  <div className="flex flex-wrap gap-2">
                    {product.product_tags.split(',').map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-green-700"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </DetailSection>

                {referenceLinks.length > 0 ? (
                  <DetailSection title="Nguồn tham khảo">
                    <ul className="space-y-2">
                      {referenceLinks.map((reference, index) => (
                        <li key={reference}>
                          <a
                            href={reference}
                            target="_blank"
                            rel="noreferrer"
                            className="break-all text-green-700 hover:underline"
                          >
                            Nguồn {index + 1}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </DetailSection>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
