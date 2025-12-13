"use client";

import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  itemCount: number;
}

interface RecentOrdersTableProps {
  data: RecentOrder[];
}

export default function RecentOrdersTable({ data }: RecentOrdersTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-sm p-4 sm:p-6">
        <p className="text-xs sm:text-sm font-sans text-gray-500 text-center">Bu tarih aralığında sipariş bulunamadı.</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
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
    <div className="bg-white border border-gray-300 rounded-sm overflow-hidden">
      {/* Desktop Tablo Görünümü */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                Sipariş No
              </th>
              <th className="px-4 py-3 text-left text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                Müşteri
              </th>
              <th className="px-4 py-3 text-right text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                Tutar
              </th>
              <th className="px-4 py-3 text-center text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-4 py-3 text-center text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                Ödeme
              </th>
              <th className="px-4 py-3 text-right text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                Ürün Adedi
              </th>
              <th className="px-4 py-3 text-right text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                Tarih
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm font-sans">
                  <Link
                    href={`/admin/siparisler/${order.id}`}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm font-sans text-gray-900">
                  {order.customerName}
                </td>
                <td className="px-4 py-3 text-sm font-sans font-medium text-gray-900 text-right">
                  {formatCurrency(order.total)}
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-sans font-medium rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-center">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-sans font-medium rounded-full ${getPaymentStatusColor(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-sans text-gray-600 text-right">
                  {order.itemCount}
                </td>
                <td className="px-4 py-3 text-sm font-sans text-gray-600 text-right">
                  {format(new Date(order.createdAt), "d MMM yyyy HH:mm", { locale: tr })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobil Kart Görünümü */}
      <div className="lg:hidden divide-y divide-gray-200">
        {data.map((order) => (
          <Link
            key={order.id}
            href={`/admin/siparisler/${order.id}`}
            className="block p-3 sm:p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-sans font-semibold text-blue-600 mb-1 truncate">
                  {order.orderNumber}
                </div>
                <div className="text-xs sm:text-sm font-sans text-gray-900 truncate">
                  {order.customerName}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-base sm:text-lg font-sans font-semibold text-gray-900 mb-1">
                  {formatCurrency(order.total)}
                </div>
                <div className="text-xs font-sans text-gray-500">
                  {format(new Date(order.createdAt), "d MMM yyyy", { locale: tr })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex px-2 py-1 text-xs font-sans font-medium rounded-full ${getStatusColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
              <span
                className={`inline-flex px-2 py-1 text-xs font-sans font-medium rounded-full ${getPaymentStatusColor(
                  order.paymentStatus
                )}`}
              >
                {order.paymentStatus}
              </span>
              <span className="text-xs font-sans text-gray-500">
                {order.itemCount} ürün
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

