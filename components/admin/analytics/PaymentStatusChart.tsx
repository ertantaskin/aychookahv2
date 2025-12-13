"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface PaymentStatusChartProps {
  data: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

const statusLabels: Record<string, string> = {
  PENDING: "Beklemede",
  COMPLETED: "Tamamlandı",
  FAILED: "Başarısız",
  REFUNDED: "İade Edildi",
};

const COLORS = ["#3b82f6", "#10b981", "#ef4444", "#f59e0b"];

export default function PaymentStatusChart({ data }: PaymentStatusChartProps) {
  const chartData = data.map((item) => ({
    name: statusLabels[item.status] || item.status,
    value: item.count,
    percentage: item.percentage.toFixed(1),
  }));

  return (
    <div className="bg-white border border-gray-300 rounded-sm p-3 sm:p-4 lg:p-6">
      <h3 className="text-base sm:text-lg font-sans font-semibold text-gray-900 mb-3 sm:mb-4">Ödeme Durumları</h3>
      <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontFamily: "system-ui",
            }}
            formatter={(value: number) => [value, "Sipariş"]}
          />
          <Legend
            wrapperStyle={{ fontFamily: "system-ui", fontSize: "12px" }}
            formatter={(value) => {
              const item = chartData.find((d) => d.name === value);
              return item ? `${value} (${item.percentage}%)` : value;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

