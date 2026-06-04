import React from 'react';

const columns = [
  { key: 'product_name', label: 'Tên sản phẩm' },
  { key: 'month', label: 'Tháng' },
  { key: 'branch_name', label: 'Tên chi nhánh' },
  { key: 'revenue', label: 'Doanh thu' },
  { key: 'customer_scale', label: 'Quy mô khách hàng' },
  { key: 'stock', label: 'Tồn kho' },
  { key: 'planned_import', label: 'Dự kiến nhập' },
  { key: 'selling_price', label: 'Giá bán' },
  { key: 'promotion', label: 'Khuyến mãi' },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);

const WarehouseTable = ({ rows }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-600 uppercase text-[11px] tracking-wide">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-4 font-semibold whitespace-nowrap">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={`${row.month}-${row.branch_name}-${row.product_name}`} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-5 py-4 min-w-[220px] font-semibold text-gray-900">
                  {row.product_name}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-gray-600">{row.month}</td>
                <td className="px-5 py-4 min-w-[140px] text-gray-600">{row.branch_name}</td>
                <td className="px-5 py-4 whitespace-nowrap font-semibold text-gray-900">
                  {formatCurrency(row.revenue)}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-gray-600">
                  {row.customer_scale}
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {row.stock}
                  </span>
                </td>
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    {row.planned_import}
                  </span>
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-gray-600">
                  {formatCurrency(row.selling_price)}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-gray-600">{row.promotion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WarehouseTable;
