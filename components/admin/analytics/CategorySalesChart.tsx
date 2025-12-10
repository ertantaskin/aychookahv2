"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CategorySalesItem {
  categoryId: string;
  categoryName: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
  averageOrderValue: number;
}

interface CategorySalesChartProps {
  data: CategorySalesItem[];
}

export default function CategorySalesChart({ data }: CategorySalesChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-sm p-6">
        <p className="text-sm font-sans text-gray-500 text-center">Bu tarih aralığında kategori satış verisi bulunamadı.</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const chartData = data.map((item) => ({
    name: item.categoryName.length > 15 ? `${item.categoryName.substring(0, 15)}...` : item.categoryName,
    fullName: item.categoryName,
    Gelir: item.totalRevenue,
    Adet: item.totalQuantity,
    "Sipariş Sayısı": item.orderCount,
  }));

  return (
    <div className="bg-white border border-gray-300 rounded-sm p-6">
      <h3 className="text-lg font-sans font-semibold text-gray-900 mb-4">Kategori Bazlı Satışlar</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12, fontFamily: "system-ui" }}
          />
          <YAxis
            tick={{ fontSize: 12, fontFamily: "system-ui" }}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "4px",
              fontFamily: "system-ui",
            }}
            formatter={(value: number, name: string) => {
              if (name === "Gelir") {
                return [formatCurrency(value), "Gelir"];
              }
              return [value.toLocaleString("tr-TR"), name];
            }}
            labelFormatter={(label) => {
              const item = chartData.find((d) => d.name === label);
              return item?.fullName || label;
            }}
          />
          <Legend />
          <Bar dataKey="Gelir" fill="#3b82f6" name="Gelir (₺)" />
          <Bar dataKey="Adet" fill="#10b981" name="Satılan Adet" />
        </BarChart>
      </ResponsiveContainer>

      {/* Detaylı Tablo */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm font-sans">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Kategori</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase">Toplam Gelir</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase">Satılan Adet</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase">Sipariş Sayısı</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase">Ortalama Sipariş</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item) => (
              <tr key={item.categoryId} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-900">{item.categoryName}</td>
                <td className="px-4 py-2 text-right font-medium text-gray-900">
                  {formatCurrency(item.totalRevenue)}
                </td>
                <td className="px-4 py-2 text-right text-gray-600">
                  {item.totalQuantity.toLocaleString("tr-TR")}
                </td>
                <td className="px-4 py-2 text-right text-gray-600">
                  {item.orderCount.toLocaleString("tr-TR")}
                </td>
                <td className="px-4 py-2 text-right text-gray-600">
                  {formatCurrency(item.averageOrderValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

