"use client";

import { DollarSign, ShoppingBag, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface MetricCardsProps {
  data: {
    totalRevenue: number;
    netRevenue: number;
    refundedAmount: number;
    cancelledAmount: number;
    totalOrders: number;
    completedOrders: number;
    pendingOrders: number;
    processingOrders: number;
    refundedOrders: number;
    cancelledOrders: number;
    averageOrderValue: number;
  };
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("tr-TR").format(num);
};

export default function MetricCards({ data }: MetricCardsProps) {
  const metrics = [
    {
      title: "Toplam Gelir",
      value: formatCurrency(data.totalRevenue),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "Net Gelir",
      value: formatCurrency(data.netRevenue),
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      description: "İade düşülmüş",
    },
    {
      title: "Toplam Sipariş",
      value: formatNumber(data.totalOrders),
      icon: ShoppingBag,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      title: "Ortalama Sipariş Değeri",
      value: formatCurrency(data.averageOrderValue),
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
    },
    {
      title: "Bekleyen Siparişler",
      value: formatNumber(data.pendingOrders),
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      title: "Hazırlanan Siparişler",
      value: formatNumber(data.processingOrders),
      icon: RefreshCw,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      title: "Tamamlanan Siparişler",
      value: formatNumber(data.completedOrders),
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      title: "İade Tutarı",
      value: formatCurrency(data.refundedAmount),
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      subtitle: `${formatNumber(data.refundedOrders)} sipariş`,
    },
    {
      title: "İptal Tutarı",
      value: formatCurrency(data.cancelledAmount),
      icon: XCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      subtitle: `${formatNumber(data.cancelledOrders)} sipariş`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {metrics.map((metric, index) => {
        const IconComponent = metric.icon;
        return (
          <div
            key={index}
            className={`bg-white border ${metric.borderColor} rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-sans font-medium text-gray-600 mb-1 truncate">{metric.title}</p>
                <p className={`text-lg sm:text-xl lg:text-2xl font-sans font-semibold ${metric.color} mb-1 break-words`}>
                  {metric.value}
                </p>
                {metric.description && (
                  <p className="text-xs font-sans text-gray-500 truncate">{metric.description}</p>
                )}
                {metric.subtitle && (
                  <p className="text-xs font-sans text-gray-500 truncate">{metric.subtitle}</p>
                )}
              </div>
              <div className={`${metric.bgColor} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
                <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${metric.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

