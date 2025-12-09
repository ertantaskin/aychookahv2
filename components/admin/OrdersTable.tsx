"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getAllOrders } from "@/lib/actions/admin/orders";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
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

const paymentStatusLabels: Record<string, string> = {
  PENDING: "Beklemede",
  COMPLETED: "Tamamlandı",
  FAILED: "Başarısız",
  REFUNDED: "İade Edildi",
};

export default function OrdersTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Filtreler
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [paymentStatus, setPaymentStatus] = useState(searchParams.get("paymentStatus") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "desc"
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [limit] = useState(20);

  // Siparişleri yükle
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllOrders(
        page,
        limit,
        search || undefined,
        status === "all" ? undefined : status,
        paymentStatus === "all" ? undefined : paymentStatus,
        sortBy,
        sortOrder
      );
      setOrders(result.orders);
      setTotal(result.total);
      setTotalPages(result.totalPages);

      // URL'i güncelle
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status !== "all") params.set("status", status);
      if (paymentStatus !== "all") params.set("paymentStatus", paymentStatus);
      if (sortBy !== "createdAt") params.set("sortBy", sortBy);
      if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
      if (page > 1) params.set("page", page.toString());

      router.replace(`/admin/siparisler?${params.toString()}`, { scroll: false });
    } catch (error) {
      console.error("Error loading orders:", error);
      setError(
        error instanceof Error ? error.message : "Siparişler yüklenirken bir hata oluştu"
      );
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, paymentStatus, sortBy, sortOrder, router]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterChange = (filter: string, value: string) => {
    if (filter === "status") setStatus(value);
    if (filter === "paymentStatus") setPaymentStatus(value);
    if (filter === "sortBy") setSortBy(value);
    if (filter === "sortOrder") setSortOrder(value as "asc" | "desc");
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setPaymentStatus("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const hasActiveFilters = search || status !== "all" || paymentStatus !== "all" || sortBy !== "createdAt";

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-sans font-semibold text-gray-900">Siparişler</h1>
          <p className="text-sm font-sans text-gray-500 mt-1">
            Toplam {total} sipariş
          </p>
        </div>

        {/* Filtreler ve Arama */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Arama */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Sipariş no, müşteri adı veya email ara..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>

            {/* Durum Filtresi */}
            <div>
              <select
                value={status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="PENDING">Beklemede</option>
                <option value="CONFIRMED">Onaylandı</option>
                <option value="PROCESSING">Hazırlanıyor</option>
                <option value="SHIPPED">Kargoda</option>
                <option value="DELIVERED">Teslim Edildi</option>
                <option value="CANCELLED">İptal Edildi</option>
                <option value="REFUNDED">İade Edildi</option>
              </select>
            </div>

            {/* Ödeme Durumu Filtresi */}
            <div>
              <select
                value={paymentStatus}
                onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
                className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="all">Tüm Ödeme Durumları</option>
                <option value="PENDING">Beklemede</option>
                <option value="COMPLETED">Tamamlandı</option>
                <option value="FAILED">Başarısız</option>
                <option value="REFUNDED">İade Edildi</option>
              </select>
            </div>

            {/* Sıralama */}
            <div>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortBy(field);
                  setSortOrder(order as "asc" | "desc");
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="createdAt-desc">Yeni → Eski</option>
                <option value="createdAt-asc">Eski → Yeni</option>
                <option value="total-desc">Tutar (Yüksek → Düşük)</option>
                <option value="total-asc">Tutar (Düşük → Yüksek)</option>
                <option value="orderNumber-asc">Sipariş No (A-Z)</option>
                <option value="orderNumber-desc">Sipariş No (Z-A)</option>
              </select>
            </div>
          </div>

          {/* Aktif Filtreler */}
          {hasActiveFilters && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-sans font-medium text-gray-500">Aktif Filtreler:</span>
              {search && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-sans font-medium bg-gray-100 text-gray-700 rounded">
                  Arama: {search}
                  <button
                    onClick={() => handleSearch("")}
                    className="hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {status !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-sans font-medium bg-gray-100 text-gray-700 rounded">
                  Durum: {statusLabels[status] || status}
                  <button
                    onClick={() => handleFilterChange("status", "all")}
                    className="hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {paymentStatus !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-sans font-medium bg-gray-100 text-gray-700 rounded">
                  Ödeme: {paymentStatusLabels[paymentStatus] || paymentStatus}
                  <button
                    onClick={() => handleFilterChange("paymentStatus", "all")}
                    className="hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs font-sans font-medium text-gray-600 hover:text-gray-900 underline"
              >
                Tümünü Temizle
              </button>
            </div>
          )}
        </div>

        {/* Tablo */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {error ? (
            <div className="p-12 text-center">
              <p className="text-sm font-sans text-red-600 mb-4">{error}</p>
              <button
                onClick={() => loadOrders()}
                className="px-4 py-2 text-sm font-sans font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          ) : loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-sm font-sans text-gray-500">Yükleniyor...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm font-sans text-gray-500">Sipariş bulunamadı</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        Sipariş No
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        Müşteri
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        Tutar
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        Ödeme
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <span className="text-sm font-sans font-medium text-gray-900">{order.orderNumber}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-sans font-medium text-gray-900">
                            {order.user.name || "İsimsiz"}
                          </div>
                          <div className="text-xs font-sans text-gray-500">{order.user.email}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-sans font-medium text-gray-900">
                            {order.total.toLocaleString("tr-TR")} ₺
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-sans font-medium rounded-full ${
                              order.status === "DELIVERED"
                                ? "bg-green-100 text-green-800"
                                : order.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "CANCELLED" || order.status === "REFUNDED"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {statusLabels[order.status] || order.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-sans font-medium rounded-full ${
                              order.paymentStatus === "COMPLETED"
                                ? "bg-green-100 text-green-800"
                                : order.paymentStatus === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {paymentStatusLabels[order.paymentStatus] || order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-sans text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString("tr-TR", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <Link
                            href={`/admin/siparisler/${order.id}`}
                            className="text-sm font-sans font-medium text-gray-700 hover:text-gray-900"
                          >
                            Detay
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sayfalama */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm font-sans text-gray-700">
                    Sayfa {page} / {totalPages} (Toplam {total} sipariş)
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-sm font-sans font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Önceki
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 text-sm font-sans font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      Sonraki
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

