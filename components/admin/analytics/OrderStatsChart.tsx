"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface OrderStatsChartProps {
  data: Array<{
    status: string;
    count: number;
    total: number;
  }>;
}

const statusLabels: Record<string, string> = {
  PENDING: "Beklemede",
  CONFIRMED: "Onaylandı",
  PROCESSING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
  REFUNDED: "İade Edildi",
};

export default function OrderStatsChart({ data }: OrderStatsChartProps) {
  const chartData = data.map((item) => ({
    name: statusLabels[item.status] || item.status,
    count: item.count,
    total: item.total,
  }));

  return (
    <div className="bg-white border border-gray-300 rounded-sm p-3 sm:p-4 lg:p-6">
      <h3 className="text-base sm:text-lg font-sans font-semibold text-gray-900 mb-3 sm:mb-4">Sipariş İstatistikleri</h3>
      <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            style={{ fontSize: "12px", fontFamily: "system-ui" }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            yAxisId="left"
            stroke="#3b82f6"
            style={{ fontSize: "12px", fontFamily: "system-ui" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#8b5cf6"
            style={{ fontSize: "12px", fontFamily: "system-ui" }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontFamily: "system-ui",
            }}
            formatter={(value: number, name: string) => {
              if (name === "Tutar") {
                return [`${value.toLocaleString("tr-TR")} ₺`, name];
              }
              return [value, name];
            }}
          />
          <Legend
            wrapperStyle={{ fontFamily: "system-ui", fontSize: "12px" }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                count: "Sipariş Sayısı",
                total: "Tutar (₺)",
              };
              return labels[value] || value;
            }}
          />
          <Bar yAxisId="left" dataKey="count" fill="#3b82f6" name="count" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="right" dataKey="total" fill="#8b5cf6" name="total" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

