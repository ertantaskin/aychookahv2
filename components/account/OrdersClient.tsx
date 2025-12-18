"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getOrdersPaginated } from "@/lib/actions/orders";
import { Order } from "@prisma/client";

interface OrdersClientProps {
  initialOrders: Order[];
  initialTotal: number;
  userId: string;
}

interface OrderWithItems extends Order {
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    productId: string | null;
    productName: string | null;
    productImageUrl: string | null;
    product: {
      id: string;
      name: string;
      images: Array<{
        url: string;
        isPrimary: boolean;
      }>;
    } | null;
  }>;
}

export default function OrdersClient({
  initialOrders,
  initialTotal,
  userId,
}: OrdersClientProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>(initialOrders as OrderWithItems[]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialTotal / 15));
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(initialTotal);

  const loadOrders = async (page: number) => {
    setLoading(true);
    try {
      const result = await getOrdersPaginated(userId, page, 15);
      setOrders(result.orders as OrderWithItems[]);
      setTotalPages(result.totalPages);
      setTotal(result.total);
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Beklemede";
      case "CONFIRMED":
        return "Onaylandı";
      case "PROCESSING":
        return "Hazırlanıyor";
      case "SHIPPED":
        return "Kargoda";
      case "DELIVERED":
        return "Teslim Edildi";
      case "CANCELLED":
        return "İptal Edildi";
      case "REFUNDED":
        return "İade Edildi";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-50 text-green-700 border-green-200";
      case "CANCELLED":
      case "REFUNDED":
        return "bg-red-50 text-red-700 border-red-200";
      case "PENDING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "PROCESSING":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "SHIPPED":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-50 text-green-700 border-green-200";
      case "PENDING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "FAILED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Tamamlandı";
      case "PENDING":
        return "Beklemede";
      case "FAILED":
        return "Başarısız";
      default:
        return status;
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProductImage = (orderItem: OrderWithItems["items"][0]) => {
    if (orderItem.productImageUrl) {
      return orderItem.productImageUrl;
    }
    if (orderItem.product?.images?.find(img => img.isPrimary)?.url) {
      return orderItem.product.images.find(img => img.isPrimary)!.url;
    }
    if (orderItem.product?.images?.[0]?.url) {
      return orderItem.product.images[0].url;
    }
    return "/images/placeholder.png";
  };

  const getProductName = (orderItem: OrderWithItems["items"][0]) => {
    return orderItem.productName || orderItem.product?.name || "Ürün";
  };

  const getItemCount = (order: OrderWithItems) => {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center shadow-sm">
        <div className="max-w-md mx-auto">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-base font-semibold text-gray-900 mb-1.5 font-sans">
            Henüz siparişiniz bulunmamaktadır
          </h3>
          <p className="text-sm text-gray-500 mb-4 font-sans">
            İlk siparişinizi vermek için alışverişe başlayın.
          </p>
          <Link
            href="/urunler"
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors font-sans"
          >
            Alışverişe Başla
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Sipariş Listesi */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          orders.map((order) => {
            const firstItem = order.items[0];
            const mainImage = firstItem ? getProductImage(firstItem) : "/images/placeholder.png";
            const mainProductName = firstItem ? getProductName(firstItem) : "Ürün";

            return (
              <div
                key={order.id}
                className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-sm overflow-hidden"
              >
                <Link href={`/hesabim/siparisler/${order.id}`}>
                  <div className="p-4">
                    <div className="flex gap-4">
                      {/* Sol: Büyük Ürün Görseli */}
                      <div className="flex-shrink-0">
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg border border-gray-200 overflow-hidden bg-gray-100">
                          <img
                            src={mainImage}
                            alt={mainProductName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/images/placeholder.png";
                            }}
                          />
                          {firstItem && firstItem.quantity > 1 && (
                            <div className="absolute top-1 right-1 bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                              {firstItem.quantity}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Sağ: Sipariş Bilgileri */}
                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <h3 className="text-base font-semibold text-gray-900 font-sans truncate">
                                #{order.orderNumber}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium border flex-shrink-0 ${getStatusColor(
                                  order.status
                                )} font-sans`}
                              >
                                {getStatusLabel(order.status)}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 font-sans mb-2">
                              <span className="flex items-center gap-1">
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                                {formatDate(order.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                {formatTime(order.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg
                                  className="w-3.5 h-3.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                                  />
                                </svg>
                                {getItemCount(order)} ürün
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <div className="text-xl font-bold text-gray-900 font-sans">
                              {order.total.toLocaleString("tr-TR")} ₺
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium border ${getPaymentStatusColor(
                                order.paymentStatus
                              )} font-sans`}
                            >
                              {getPaymentStatusLabel(order.paymentStatus)}
                            </span>
                          </div>
                        </div>

                        {/* Ürün Önizlemeleri - Kompakt */}
                        {order.items.length > 1 && (
                          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                            <div className="flex -space-x-1.5">
                              {order.items.slice(1, 5).map((item, idx) => (
                                <div
                                  key={idx}
                                  className="relative w-8 h-8 rounded border border-white overflow-hidden bg-gray-100"
                                >
                                  <img
                                    src={getProductImage(item)}
                                    alt={getProductName(item)}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        "/images/placeholder.png";
                                    }}
                                  />
                                  {item.quantity > 1 && (
                                    <div className="absolute -bottom-0.5 -right-0.5 bg-gray-900 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                                      {item.quantity}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            {order.items.length > 5 && (
                              <span className="text-xs text-gray-500 font-sans ml-1">
                                +{order.items.length - 5} ürün daha
                              </span>
                            )}
                            <div className="flex-1"></div>
                            <div className="flex items-center text-xs text-gray-500 font-sans">
                              <span>Detay</span>
                              <svg
                                className="w-3.5 h-3.5 ml-0.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                        {order.items.length === 1 && (
                          <div className="flex items-center justify-end pt-2 border-t border-gray-100">
                            <div className="flex items-center text-xs text-gray-500 font-sans">
                              <span>Detay</span>
                              <svg
                                className="w-3.5 h-3.5 ml-0.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })
        )}
      </div>

      {/* Sayfalama - Kompakt */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-lg border border-gray-200 px-4 py-3 shadow-sm">
          <div className="text-xs text-gray-600 font-sans">
            <span>
              {total} siparişten {currentPage === 1 ? 1 : (currentPage - 1) * 15 + 1}-
              {Math.min(currentPage * 15, total)} arası
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => loadOrders(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-sans"
            >
              Önceki
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => loadOrders(pageNum)}
                    disabled={loading}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors font-sans ${
                      currentPage === pageNum
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => loadOrders(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-sans"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

