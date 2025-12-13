"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import DateRangeFilter from "./DateRangeFilter";
import MetricCards from "./MetricCards";
import SalesTrendChart from "./analytics/SalesTrendChart";
import OrderStatusChart from "./analytics/OrderStatusChart";
import PaymentStatusChart from "./analytics/PaymentStatusChart";
import RevenueComparisonChart from "./analytics/RevenueComparisonChart";
import OrderStatsChart from "./analytics/OrderStatsChart";
import ProductSalesTable from "./analytics/ProductSalesTable";
import RecentOrdersTable from "./analytics/RecentOrdersTable";
import CategorySalesChart from "./analytics/CategorySalesChart";
import CustomerStats from "./analytics/CustomerStats";
import PaymentMethodChart from "./analytics/PaymentMethodChart";
import {
  getAnalyticsData,
  getSalesTrend,
  getOrderStats,
  getOrderStatusDistribution,
  getPaymentStatusDistribution,
  getProductSales,
  getRecentOrders,
  getCategorySales,
  getCustomerStats,
  getPaymentMethodDistribution,
} from "@/lib/actions/admin/analytics";

interface AnalyticsData {
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
}

export default function AnalyticsClient() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [salesTrend, setSalesTrend] = useState<any[]>([]);
  const [orderStats, setOrderStats] = useState<any[]>([]);
  const [orderStatusDistribution, setOrderStatusDistribution] = useState<any[]>([]);
  const [paymentStatusDistribution, setPaymentStatusDistribution] = useState<any[]>([]);
  const [productSales, setProductSales] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [categorySales, setCategorySales] = useState<any[]>([]);
  const [customerStats, setCustomerStats] = useState<any>(null);
  const [paymentMethodDistribution, setPaymentMethodDistribution] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const lastRangeRef = useRef<string>("");

  useEffect(() => {
    const range = searchParams.get("range") || "thisMonth";
    const startParam = searchParams.get("startDate");
    const endParam = searchParams.get("endDate");

    // Aynı range ise tekrar yükleme
    const currentRangeKey = range === "custom" 
      ? `${range}-${startParam}-${endParam}` 
      : range;
    
    if (lastRangeRef.current === currentRangeKey) {
      return;
    }

    const now = new Date();
    let start: Date;
    let end: Date = new Date(now);

    switch (range) {
      case "allTime":
        // Tüm zamanlar için çok eski bir tarih (2000-01-01)
        start = new Date(2000, 0, 1);
        end.setHours(23, 59, 59, 999);
        break;
      case "today":
        start = new Date(now);
        end = new Date(now);
        break;
      case "yesterday":
        start = new Date(now);
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(now);
        end.setDate(now.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case "thisWeek":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        start = weekStart;
        end.setHours(23, 59, 59, 999);
        break;
      case "thisMonth":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case "thisYear":
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      case "last7Days":
        start = new Date(now);
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "last30Days":
        start = new Date(now);
        start.setDate(now.getDate() - 29);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "last90Days":
        start = new Date(now);
        start.setDate(now.getDate() - 89);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case "custom":
        if (startParam && endParam) {
          start = new Date(startParam);
          end = new Date(endParam);
        } else {
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        }
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    setStartDate(start);
    setEndDate(end);
    lastRangeRef.current = currentRangeKey;

    // Veriyi yükle
    const loadData = async () => {
      setLoading(true);
      try {
        // Periyodu belirle
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        let newPeriod: "day" | "week" | "month" = "day";
        if (daysDiff > 365) {
          // 1 yıldan fazla ise aylık göster
          newPeriod = "month";
        } else if (daysDiff > 90) {
          // 90 günden fazla ise haftalık göster
          newPeriod = "week";
        } else {
          // 90 günden az ise günlük göster
          newPeriod = "day";
        }
        setPeriod(newPeriod);

        const [
          analytics,
          trend,
          stats,
          orderDist,
          paymentDist,
          productSalesData,
          recentOrdersData,
          categorySalesData,
          customerStatsData,
          paymentMethodData,
        ] = await Promise.all([
          getAnalyticsData(start, end),
          getSalesTrend(start, end, newPeriod),
          getOrderStats(start, end),
          getOrderStatusDistribution(start, end),
          getPaymentStatusDistribution(start, end),
          getProductSales(start, end),
          getRecentOrders(start, end, 10),
          getCategorySales(start, end),
          getCustomerStats(start, end),
          getPaymentMethodDistribution(start, end),
        ]);

        setAnalyticsData(analytics);
        setSalesTrend(trend);
        setOrderStats(stats);
        setOrderStatusDistribution(orderDist);
        setPaymentStatusDistribution(paymentDist);
        setProductSales(productSalesData);
        setRecentOrders(recentOrdersData);
        setCategorySales(categorySalesData);
        setCustomerStats(customerStatsData);
        setPaymentMethodDistribution(paymentMethodData);
      } catch (error) {
        console.error("Error loading analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchParams]);


  if (loading) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center py-8 sm:py-12 gap-3 sm:gap-4">
        <div className="inline-block w-6 h-6 sm:w-8 sm:h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs sm:text-sm font-sans text-gray-600">Yükleniyor...</p>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8 sm:py-12">
        <p className="text-xs sm:text-sm text-gray-500 font-sans">Veri yüklenirken bir hata oluştu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <DateRangeFilter />

      <div>
        <h2 className="text-base sm:text-lg lg:text-xl font-sans font-semibold text-gray-900 mb-3 sm:mb-4">Genel Görünüm</h2>
        <MetricCards data={analyticsData} />
      </div>

      <div>
        <h2 className="text-base sm:text-lg lg:text-xl font-sans font-semibold text-gray-900 mb-3 sm:mb-4">Son Siparişler</h2>
        <RecentOrdersTable data={recentOrders} />
      </div>

      <div>
        <h2 className="text-base sm:text-lg lg:text-xl font-sans font-semibold text-gray-900 mb-3 sm:mb-4">Ürün Bazlı Satışlar</h2>
        <ProductSalesTable data={productSales} />
      </div>

      <div>
        <h2 className="text-base sm:text-lg lg:text-xl font-sans font-semibold text-gray-900 mb-3 sm:mb-4">Kategori Bazlı Satışlar</h2>
        <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
          <CategorySalesChart data={categorySales} />
        </div>
      </div>

      <div>
        <h2 className="text-base sm:text-lg lg:text-xl font-sans font-semibold text-gray-900 mb-3 sm:mb-4">Müşteri İstatistikleri</h2>
        {customerStats && <CustomerStats data={customerStats} />}
      </div>

      <div>
        <h2 className="text-base sm:text-lg lg:text-xl font-sans font-semibold text-gray-900 mb-3 sm:mb-4">Satış Performansı</h2>
        <div className="space-y-4 sm:space-y-6">
          <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            <SalesTrendChart data={salesTrend} period={period} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
              <RevenueComparisonChart data={salesTrend} period={period} />
            </div>
            <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
              <OrderStatsChart data={orderStats} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-base sm:text-lg lg:text-xl font-sans font-semibold text-gray-900 mb-3 sm:mb-4">Sipariş Analizi</h2>
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
              <OrderStatusChart data={orderStatusDistribution} />
            </div>
            <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
              <PaymentStatusChart data={paymentStatusDistribution} />
            </div>
          </div>
          <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            <PaymentMethodChart data={paymentMethodDistribution} />
          </div>
        </div>
      </div>
    </div>
  );
}

