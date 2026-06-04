import React, { useEffect, useState } from 'react';

import { fetchWarehousePredictions } from '../../lib/api';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(value);

const PredictionPanel = ({ isOpen }) => {
  const [predictionRows, setPredictionRows] = useState([]);
  const [modelInfo, setModelInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    let isCancelled = false;

    const loadPredictions = async () => {
      try {
        setIsLoading(true);
        setError('');
        const payload = await fetchWarehousePredictions(8);
        if (isCancelled) {
          return;
        }
        setPredictionRows(payload.items || []);
        setModelInfo(payload.model || null);
      } catch (loadError) {
        if (!isCancelled) {
          setError(loadError.message || 'Không thể gọi API dự đoán.');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadPredictions();

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const branchRecommendations = Object.values(
    predictionRows.reduce((accumulator, row) => {
      if (!accumulator[row.branch_name]) {
        accumulator[row.branch_name] = {
          branch_name: row.branch_name,
          total_import: 0,
        };
      }

      accumulator[row.branch_name].total_import += row.predicted_planned_import;
      return accumulator;
    }, {})
  )
    .sort((left, right) => right.total_import - left.total_import)
    .slice(0, 3);

  return (
    <div className="fixed bottom-28 right-6 z-[9998] w-[400px] max-w-[calc(100vw-2rem)] rounded-2xl border border-gray-100 bg-white shadow-2xl overflow-hidden">
      <div className="bg-gray-900 px-5 py-4 text-white">
        <p className="text-xs uppercase tracking-[0.2em] text-green-300">RandomForest</p>
        <h3 className="mt-1 text-lg font-bold">Gợi ý nhập hàng tháng tới</h3>
        {predictionRows[0] ? (
          <p className="mt-1 text-xs text-gray-300">Tháng dự đoán: {predictionRows[0].forecast_month}</p>
        ) : null}
      </div>

      <div className="max-h-[70vh] overflow-y-auto p-5 space-y-5">
        {isLoading ? (
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
            Đang tải dự đoán...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-600">
            {error}
          </div>
        ) : (
          <>
            <div>
              <h4 className="mb-3 text-sm font-bold text-gray-900">Sản phẩm cần ưu tiên</h4>
              <div className="space-y-3">
                {predictionRows.length > 0 ? (
                  predictionRows.map((row) => (
                    <div key={`${row.branch_name}-${row.product_name}`} className="rounded-xl border border-gray-100 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{row.product_name}</p>
                          <p className="mt-1 text-xs text-gray-500">{row.branch_name}</p>
                        </div>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                          +{formatNumber(row.recommended_gap)}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Tồn kho hiện tại {formatNumber(row.current_stock)} | Dự kiến nhập {formatNumber(row.predicted_planned_import)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Tháng gần nhất {row.latest_month} | Doanh thu {formatCurrency(row.latest_revenue)} | Khách hàng {formatNumber(row.latest_customer_scale)} | KM {row.latest_promotion}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">Chưa có dữ liệu dự đoán.</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-bold text-gray-900">Chi nhánh cần cấp hàng</h4>
              <div className="space-y-3">
                {branchRecommendations.map((item) => (
                  <div key={item.branch_name} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                    <span className="text-sm font-semibold text-gray-800">{item.branch_name}</span>
                    <span className="text-sm font-bold text-green-600">{formatNumber(item.total_import)}</span>
                  </div>
                ))}
              </div>
            </div>

            {modelInfo ? (
              <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-xs text-green-800">
                <p className="font-semibold">
                  {modelInfo.model_name} | cửa sổ {modelInfo.history_window_months} tháng
                </p>
                <p className="mt-1">
                  MAE {modelInfo.metrics.mae} | RMSE {modelInfo.metrics.rmse} | R2 {modelInfo.metrics.r2}
                </p>
                <p className="mt-1">
                  Train {modelInfo.training_samples} mẫu | Validate {modelInfo.validation_samples} mẫu
                </p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default PredictionPanel;
