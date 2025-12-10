"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface PaymentMethodItem {
  method: string;
  count: number;
  totalRevenue: number;
  percentage: number;
  revenuePercentage: number;
}

interface PaymentMethodChartProps {
  data: PaymentMethodItem[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function PaymentMethodChart({ data }: PaymentMethodChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-sm p-6">
        <p className="text-sm font-sans text-gray-500 text-center">Bu tarih aralığında ödeme yöntemi verisi bulunamadı.</p>
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
    name: item.method,
    value: item.count,
    revenue: item.totalRevenue,
    percentage: item.percentage,
    revenuePercentage: item.revenuePercentage,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-300 rounded-sm p-3 shadow-lg">
          <p className="text-sm font-sans font-semibold text-gray-900 mb-2">{data.name}</p>
          <p className="text-xs font-sans text-gray-600">
            Sipariş Sayısı: <span className="font-medium">{data.value}</span> ({data.percentage.toFixed(1)}%)
          </p>
          <p className="text-xs font-sans text-gray-600">
            Toplam Gelir: <span className="font-medium">{formatCurrency(data.revenue)}</span> ({data.revenuePercentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-gray-300 rounded-sm p-6">
      <h3 className="text-lg font-sans font-semibold text-gray-900 mb-4">Ödeme Yöntemleri Dağılımı</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-sans font-medium text-gray-700 mb-2 text-center">Sipariş Sayısına Göre</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <h4 className="text-sm font-sans font-medium text-gray-700 mb-2 text-center">Gelire Göre</h4>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, revenuePercentage }) => `${name}: ${revenuePercentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="revenue"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detaylı Tablo */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm font-sans">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Ödeme Yöntemi</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase">Sipariş Sayısı</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase">Yüzde</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase">Toplam Gelir</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-gray-700 uppercase">Gelir Yüzdesi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={item.method} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-gray-900">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    {item.method}
                  </div>
                </td>
                <td className="px-4 py-2 text-right font-medium text-gray-900">
                  {item.count.toLocaleString("tr-TR")}
                </td>
                <td className="px-4 py-2 text-right text-gray-600">
                  {item.percentage.toFixed(1)}%
                </td>
                <td className="px-4 py-2 text-right font-medium text-gray-900">
                  {formatCurrency(item.totalRevenue)}
                </td>
                <td className="px-4 py-2 text-right text-gray-600">
                  {item.revenuePercentage.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

