"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface SalesTrendChartProps {
  data: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  period: "day" | "week" | "month";
}

export default function SalesTrendChart({ data, period }: SalesTrendChartProps) {
  const formatDate = (dateStr: string): string => {
    try {
      if (period === "month") {
        const [year, month] = dateStr.split("-");
        return format(new Date(parseInt(year), parseInt(month) - 1, 1), "MMM yyyy");
      } else {
        const date = new Date(dateStr);
        return format(date, period === "week" ? "d MMM" : "d MMM");
      }
    } catch {
      return dateStr;
    }
  };

  const chartData = data.map((item) => ({
    ...item,
    formattedDate: formatDate(item.date),
    revenueFormatted: item.revenue.toLocaleString("tr-TR"),
  }));

  return (
    <div className="bg-white border border-gray-300 rounded-sm p-3 sm:p-4 lg:p-6">
      <h3 className="text-base sm:text-lg font-sans font-semibold text-gray-900 mb-3 sm:mb-4">Satış Trendi</h3>
      <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="formattedDate"
            stroke="#6b7280"
            style={{ fontSize: "12px", fontFamily: "system-ui" }}
          />
          <YAxis
            yAxisId="left"
            stroke="#3b82f6"
            style={{ fontSize: "12px", fontFamily: "system-ui" }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#8b5cf6"
            style={{ fontSize: "12px", fontFamily: "system-ui" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontFamily: "system-ui",
            }}
            formatter={(value: number, name: string) => {
              if (name === "Gelir") {
                return [`${value.toLocaleString("tr-TR")} ₺`, name];
              }
              return [value, name];
            }}
          />
          <Legend
            wrapperStyle={{ fontFamily: "system-ui", fontSize: "12px" }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                revenue: "Gelir (₺)",
                orders: "Sipariş Sayısı",
              };
              return labels[value] || value;
            }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            name="revenue"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            stroke="#8b5cf6"
            strokeWidth={2}
            name="orders"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

