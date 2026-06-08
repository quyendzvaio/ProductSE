import React, { useEffect, useState } from 'react';

import PredictionPanel from '../components/warehouse/PredictionPanel';
import WarehouseTable from '../components/warehouse/WarehouseTable';
import { fetchWarehouseSales } from '../lib/api';

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const parseMonthKey = (value) => {
  const [month, year] = String(value || '').split('/').map(Number);
  return (year || 0) * 100 + (month || 0);
};

const WarehousePage = () => {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPredictionOpen, setIsPredictionOpen] = useState(false);

  useEffect(() => {
    const loadWarehouseData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await fetchWarehouseSales();
        setRows(data.items || []);
      } catch (loadError) {
        console.error('Không thể tải dữ liệu kho:', loadError);
        setError('Không thể tải dữ liệu kho lúc này. Vui lòng kiểm tra backend rồi thử lại.');
      } finally {
        setIsLoading(false);
      }
    };

    loadWarehouseData();
  }, []);

  const latestMonth = rows.reduce((latest, row) => {
    return parseMonthKey(row.month) > parseMonthKey(latest) ? row.month : latest;
  }, '');

  const latestRows = latestMonth ? rows.filter((row) => row.month === latestMonth) : [];
  const totalRevenue = latestRows.reduce((sum, row) => sum + row.revenue, 0);
  const totalStock = latestRows.reduce((sum, row) => sum + row.stock, 0);
  const totalPlannedImport = latestRows.reduce((sum, row) => sum + row.planned_import, 0);
  const branchCount = new Set(latestRows.map((row) => row.branch_name)).size;
  const lowStockRows = latestRows.filter((row) => row.stock <= row.planned_import).length;

  return (
    <>
      <div className="bg-[#F8FAF8] border-y border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-green-600">KHO</p>
          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">Quản lý dữ liệu kho kombucha</h1>
              <p className="mt-3 max-w-3xl text-sm text-gray-500 md:text-base">
                Theo dõi lịch sử doanh thu, tồn kho, quy mô khách hàng và kế hoạch nhập hàng theo từng sản phẩm, từng chi nhánh.
              </p>
            </div>
            <div className="rounded-2xl border border-green-100 bg-green-50 px-5 py-4 text-sm text-green-700">
              Khu vực này hiện đã được nối thêm mô hình RandomForest dự đoán nhập hàng.
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Tổng doanh thu {latestMonth ? `(${latestMonth})` : ''}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Tổng tồn kho {latestMonth ? `(${latestMonth})` : ''}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{totalStock}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Dự kiến nhập {latestMonth ? `(${latestMonth})` : ''}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{totalPlannedImport}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Chi nhánh hoạt động</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{branchCount}</p>
            <p className="mt-2 text-xs font-semibold text-amber-600">
              {lowStockRows} dòng dữ liệu cần theo dõi nhập hàng
            </p>
          </div>
        </div>

        <section className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bảng dữ liệu kho</h2>
              <p className="mt-1 text-sm text-gray-500">
                Nguồn dữ liệu lấy từ file `kombucha_sales.csv`, bao gồm lịch sử nhiều tháng để tạo feature cửa sổ 3 tháng.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-2xl border border-gray-100 bg-white px-6 py-12 text-center text-gray-500 shadow-sm">
              Đang tải dữ liệu kho...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-12 text-center text-red-600 shadow-sm">
              {error}
            </div>
          ) : (
            <WarehouseTable rows={rows} />
          )}
        </section>
      </div>

      <PredictionPanel isOpen={isPredictionOpen} />

      <button
        type="button"
        onClick={() => setIsPredictionOpen((current) => !current)}
        className="fixed bottom-24 right-6 z-[9997] inline-flex items-center gap-3 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-xl transition-colors hover:bg-green-700"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7H7v6m0 0l4-4 4 4 6-6" />
        </svg>
        DỰ ĐOÁN
      </button>
    </>
  );
};

export default WarehousePage;
