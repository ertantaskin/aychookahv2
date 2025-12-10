"use client";

import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

interface DashboardStatsProps {
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalUsers: number;
    totalRevenue: number;
    todayRevenue: number;
    todayOrders: number;
    thisMonthRevenue: number;
    thisMonthOrders: number;
    pendingOrders: number;
    processingOrders: number;
    lowStockProducts: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: Date;
  }>;
}

export default function DashboardStats({ stats, recentOrders }: DashboardStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Ana Metrikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Toplam Gelir */}
        <div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs font-sans font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
              Tüm Zamanlar
            </span>
          </div>
          <div>
            <p className="text-sm font-sans text-gray-600 mb-1">Toplam Gelir</p>
            <p className="text-2xl font-sans font-bold text-gray-900">
              {formatCurrency(stats.totalRevenue)}
            </p>
          </div>
        </div>

        {/* Toplam Sipariş */}
        <div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-purple-600" />
            </div>
            <Link
              href="/admin/siparisler"
              className="text-xs font-sans font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Tümünü Gör <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            <p className="text-sm font-sans text-gray-600 mb-1">Toplam Sipariş</p>
            <p className="text-2xl font-sans font-bold text-gray-900">{stats.totalOrders}</p>
            <div className="mt-2 flex items-center gap-4 text-xs font-sans">
              <span className="text-gray-500">
                Bekleyen: <span className="font-medium text-yellow-600">{stats.pendingOrders}</span>
              </span>
              <span className="text-gray-500">
                Hazırlanan: <span className="font-medium text-blue-600">{stats.processingOrders}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Toplam Ürün */}
        <div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <Link
              href="/admin/urunler"
              className="text-xs font-sans font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Yönet <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            <p className="text-sm font-sans text-gray-600 mb-1">Toplam Ürün</p>
            <p className="text-2xl font-sans font-bold text-gray-900">{stats.totalProducts}</p>
            {stats.lowStockProducts > 0 && (
              <div className="mt-2 flex items-center gap-1 text-xs font-sans text-orange-600">
                <AlertCircle className="w-3 h-3" />
                <span className="font-medium">{stats.lowStockProducts} düşük stok</span>
              </div>
            )}
          </div>
        </div>

        {/* Toplam Kullanıcı */}
        <div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <Link
              href="/admin/kullanicilar"
              className="text-xs font-sans font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Yönet <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div>
            <p className="text-sm font-sans text-gray-600 mb-1">Toplam Kullanıcı</p>
            <p className="text-2xl font-sans font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
        </div>
      </div>

      {/* Bugün ve Bu Ay Özeti */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bugünkü Performans */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-sans font-semibold text-gray-900">Bugün</h3>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-gray-600">Gelir</span>
              <span className="text-xl font-sans font-bold text-gray-900">
                {formatCurrency(stats.todayRevenue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-gray-600">Sipariş Sayısı</span>
              <span className="text-xl font-sans font-bold text-gray-900">{stats.todayOrders}</span>
            </div>
            {stats.todayOrders > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                <span className="text-sm font-sans text-gray-600">Ortalama Sipariş</span>
                <span className="text-lg font-sans font-semibold text-blue-700">
                  {formatCurrency(stats.todayRevenue / stats.todayOrders)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bu Ay Performans */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-sans font-semibold text-gray-900">Bu Ay</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-gray-600">Gelir</span>
              <span className="text-xl font-sans font-bold text-gray-900">
                {formatCurrency(stats.thisMonthRevenue)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-gray-600">Sipariş Sayısı</span>
              <span className="text-xl font-sans font-bold text-gray-900">
                {stats.thisMonthOrders}
              </span>
            </div>
            {stats.thisMonthOrders > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-green-200">
                <span className="text-sm font-sans text-gray-600">Ortalama Sipariş</span>
                <span className="text-lg font-sans font-semibold text-green-700">
                  {formatCurrency(stats.thisMonthRevenue / stats.thisMonthOrders)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Son Siparişler */}
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-sans font-semibold text-gray-900">Son Siparişler</h2>
          <Link
            href="/admin/siparisler"
            className="text-sm font-sans text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            Tümünü Gör <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                  Sipariş No
                </th>
                <th className="px-6 py-3 text-left text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                  Müşteri
                </th>
                <th className="px-6 py-3 text-right text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                  Tutar
                </th>
                <th className="px-6 py-3 text-center text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-center text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                  Ödeme
                </th>
                <th className="px-6 py-3 text-right text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                  Tarih
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm font-sans text-gray-500">
                    Henüz sipariş bulunmuyor
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => (window.location.href = `/admin/siparisler/${order.id}`)}
                  >
                    <td className="px-6 py-4 text-sm font-sans">
                      <Link
                        href={`/admin/siparisler/${order.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm font-sans text-gray-900">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm font-sans font-medium text-gray-900 text-right">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-sans font-medium rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-sans font-medium rounded-full ${getPaymentStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-sans text-gray-600 text-right">
                      {format(new Date(order.createdAt), "d MMM yyyy HH:mm", { locale: tr })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

