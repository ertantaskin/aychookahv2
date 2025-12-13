"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getCoupons, deleteCoupon } from "@/lib/actions/coupons";
import { Search, X, ChevronLeft, ChevronRight, Plus, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import type { DiscountType } from "@prisma/client";

interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  buyMode: string | null;
  buyTargetId: string | null;
  getTargetId: string | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  isActive: boolean;
  totalUsageLimit: number | null;
  customerUsageLimit: number;
  usedCount: number;
  startDate: Date | null;
  endDate: Date | null;
  minimumAmount: number | null;
  description: string | null;
  createdAt: Date;
  _count: {
    usages: number;
  };
}

const discountTypeLabels: Record<DiscountType, string> = {
  PERCENTAGE: "Yüzdelik",
  FIXED_AMOUNT: "Sabit Tutar",
  FREE_SHIPPING: "Ücretsiz Kargo",
  BUY_X_GET_Y: "X Alana Y Bedava",
};

export default function CouponList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtreler
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [isActive, setIsActive] = useState<string>(searchParams.get("status") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "desc"
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [limit] = useState(20);

  // Kuponları yükle
  const loadCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getCoupons(
        page,
        limit,
        search || undefined,
        isActive === "all" ? null : isActive === "active",
        sortBy,
        sortOrder
      );
      setCoupons(result.coupons);
      setTotal(result.total);
      setTotalPages(result.totalPages);

      // URL'i güncelle
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (isActive !== "all") params.set("status", isActive);
      if (sortBy !== "createdAt") params.set("sortBy", sortBy);
      if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
      if (page > 1) params.set("page", page.toString());

      router.replace(`/admin/kampanyalar/kuponlar?${params.toString()}`, { scroll: false });
    } catch (error) {
      console.error("Error loading coupons:", error);
      toast.error("Kuponlar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, isActive, sortBy, sortOrder, router]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kuponu silmek istediğinize emin misiniz?")) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteCoupon(id);
      toast.success("Kupon başarıyla silindi");
      loadCoupons();
    } catch (error: any) {
      toast.error(error.message || "Kupon silinirken bir hata oluştu");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDiscountValue = (type: DiscountType, value: number) => {
    switch (type) {
      case "PERCENTAGE":
        return `%${value}`;
      case "FIXED_AMOUNT":
        return `${value.toFixed(2)} TL`;
      case "FREE_SHIPPING":
        return "Ücretsiz Kargo";
      case "BUY_X_GET_Y":
        return "Özel";
      default:
        return value.toString();
    }
  };

  const isExpired = (endDate: Date | null) => {
    if (!endDate) return false;
    return new Date() > new Date(endDate);
  };

  const isNotStarted = (startDate: Date | null) => {
    if (!startDate) return false;
    return new Date() < new Date(startDate);
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Başlık ve Yeni Buton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-sans font-bold text-gray-900">Kuponlar</h1>
          <p className="mt-1 text-xs sm:text-sm font-sans text-gray-500">
            İndirim kuponlarını yönetin ve takip edin
          </p>
        </div>
        <Link
          href="/admin/kampanyalar/kuponlar/yeni"
          className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-sans text-xs sm:text-sm font-medium w-full sm:w-auto flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Yeni Kupon</span>
        </Link>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Arama */}
          <div className="sm:col-span-2 lg:col-span-1 relative">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Kupon kodu veya açıklama ara..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-sans text-gray-900"
            />
          </div>

          {/* Durum Filtresi */}
          <div>
            <select
              value={isActive}
              onChange={(e) => {
                setIsActive(e.target.value);
                setPage(1);
              }}
              className="w-full px-2.5 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-sans text-gray-900 bg-white"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>

          {/* Sıralama */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="flex-1 px-2.5 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-sans text-gray-900 bg-white"
            >
              <option value="createdAt">Oluşturulma Tarihi</option>
              <option value="code">Kupon Kodu</option>
              <option value="discountValue">İndirim Değeri</option>
            </select>
            <button
              onClick={() => {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                setPage(1);
              }}
              className="px-2.5 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-sans flex-shrink-0"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>

      {/* Tablo / Kart Görünümü */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 sm:p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-xs sm:text-sm font-sans text-gray-500">Yükleniyor...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-6 sm:p-12 text-center">
            <p className="text-xs sm:text-sm font-sans text-gray-500">Kupon bulunamadı</p>
          </div>
        ) : (
          <>
            {/* Desktop Tablo Görünümü */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 xl:px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                      Kupon Kodu
                    </th>
                    <th className="text-left py-3 px-4 xl:px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                      İndirim Türü
                    </th>
                    <th className="text-left py-3 px-4 xl:px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                      İndirim Değeri
                    </th>
                    <th className="text-left py-3 px-4 xl:px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                      Kullanım
                    </th>
                    <th className="text-left py-3 px-4 xl:px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                      Tarih Aralığı
                    </th>
                    <th className="text-left py-3 px-4 xl:px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="text-left py-3 px-4 xl:px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {coupons.map((coupon) => {
                    const expired = isExpired(coupon.endDate);
                    const notStarted = isNotStarted(coupon.startDate);
                    const usageLimitReached =
                      coupon.totalUsageLimit !== null &&
                      coupon._count.usages >= coupon.totalUsageLimit;

                    return (
                      <tr key={coupon.id} className="hover:bg-gray-50">
                        <td className="py-4 px-4 xl:px-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-sans font-semibold text-gray-900 truncate">
                              {coupon.code}
                            </span>
                            {coupon.description && (
                              <span className="text-xs font-sans text-gray-500 mt-1 line-clamp-1">
                                {coupon.description}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 xl:px-6">
                          <div className="flex flex-col">
                          <span className="text-sm font-sans text-gray-900">
                            {discountTypeLabels[coupon.discountType]}
                          </span>
                            {coupon.discountType === "BUY_X_GET_Y" && coupon.buyMode && (
                              <span className="text-xs font-sans text-gray-500 mt-1 line-clamp-1">
                                {coupon.buyMode === "CATEGORY" && "İki Kategori"}
                                {coupon.buyMode === "PRODUCT" && "İki Ürün"}
                                {coupon.buyMode === "CONDITIONAL_FREE" && "Koşullu Bedava"}
                                {coupon.buyMode === "CATEGORY" && coupon.buyQuantity && coupon.getQuantity && ` (${coupon.buyQuantity} alana ${coupon.getQuantity} bedava)`}
                                {coupon.buyMode === "PRODUCT" && coupon.buyQuantity && coupon.getQuantity && ` (${coupon.buyQuantity} alana ${coupon.getQuantity} bedava)`}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 xl:px-6">
                          <span className="text-sm font-sans font-semibold text-gray-900">
                            {formatDiscountValue(coupon.discountType, coupon.discountValue)}
                          </span>
                        </td>
                        <td className="py-4 px-4 xl:px-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-sans text-gray-900">
                              {coupon._count.usages}
                              {coupon.totalUsageLimit !== null && ` / ${coupon.totalUsageLimit}`}
                            </span>
                            {usageLimitReached && (
                              <span className="text-xs font-sans text-red-600 mt-1">Limit doldu</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 xl:px-6">
                          <div className="flex flex-col text-xs font-sans text-gray-600">
                            {coupon.startDate && (
                              <span className="truncate">
                                Başlangıç: {new Date(coupon.startDate).toLocaleDateString("tr-TR")}
                              </span>
                            )}
                            {coupon.endDate && (
                              <span className="truncate">
                                Bitiş: {new Date(coupon.endDate).toLocaleDateString("tr-TR")}
                              </span>
                            )}
                            {!coupon.startDate && !coupon.endDate && <span>-</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4 xl:px-6">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-sans font-medium rounded-full whitespace-nowrap ${
                                coupon.isActive && !expired && !notStarted
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {coupon.isActive && !expired && !notStarted
                                ? "Aktif"
                                : expired
                                ? "Süresi Dolmuş"
                                : notStarted
                                ? "Başlamadı"
                                : "Pasif"}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 xl:px-6">
                          <div className="flex items-center gap-1 xl:gap-2">
                            <Link
                              href={`/admin/kampanyalar/kuponlar/${coupon.id}`}
                              className="p-1.5 xl:p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded transition-colors"
                              title="Düzenle"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(coupon.id)}
                              disabled={deletingId === coupon.id}
                              className="p-1.5 xl:p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                              title="Sil"
                            >
                              {deletingId === coupon.id ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobil Kart Görünümü */}
            <div className="lg:hidden divide-y divide-gray-200">
              {coupons.map((coupon) => {
                const expired = isExpired(coupon.endDate);
                const notStarted = isNotStarted(coupon.startDate);
                const usageLimitReached =
                  coupon.totalUsageLimit !== null &&
                  coupon._count.usages >= coupon.totalUsageLimit;

                return (
                  <div key={coupon.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-sans font-semibold text-gray-900 mb-1 truncate">
                          {coupon.code}
                        </div>
                        {coupon.description && (
                          <div className="text-xs font-sans text-gray-500 line-clamp-1 mb-2">
                            {coupon.description}
                          </div>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-sans text-gray-700">
                            {discountTypeLabels[coupon.discountType]}
                          </span>
                          <span className="text-xs sm:text-sm font-sans font-semibold text-gray-900">
                            {formatDiscountValue(coupon.discountType, coupon.discountValue)}
                          </span>
                        </div>
                        {coupon.discountType === "BUY_X_GET_Y" && coupon.buyMode && (
                          <div className="text-xs font-sans text-gray-500 mt-1 line-clamp-1">
                            {coupon.buyMode === "CATEGORY" && "İki Kategori"}
                            {coupon.buyMode === "PRODUCT" && "İki Ürün"}
                            {coupon.buyMode === "CONDITIONAL_FREE" && "Koşullu Bedava"}
                            {coupon.buyMode === "CATEGORY" && coupon.buyQuantity && coupon.getQuantity && ` (${coupon.buyQuantity} alana ${coupon.getQuantity} bedava)`}
                            {coupon.buyMode === "PRODUCT" && coupon.buyQuantity && coupon.getQuantity && ` (${coupon.buyQuantity} alana ${coupon.getQuantity} bedava)`}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex flex-col items-end gap-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-sans font-medium rounded-full whitespace-nowrap ${
                            coupon.isActive && !expired && !notStarted
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {coupon.isActive && !expired && !notStarted
                            ? "Aktif"
                            : expired
                            ? "Süresi Dolmuş"
                            : notStarted
                            ? "Başlamadı"
                            : "Pasif"}
                        </span>
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/admin/kampanyalar/kuponlar/${coupon.id}`}
                            className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded transition-colors"
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            disabled={deletingId === coupon.id}
                            className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Sil"
                          >
                            {deletingId === coupon.id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-sans text-gray-600">
                      <div>
                        <span className="font-medium">Kullanım: </span>
                        <span className={usageLimitReached ? "text-red-600" : ""}>
                          {coupon._count.usages}
                          {coupon.totalUsageLimit !== null && ` / ${coupon.totalUsageLimit}`}
                        </span>
                        {usageLimitReached && (
                          <span className="text-red-600 ml-1">(Limit doldu)</span>
                        )}
                      </div>
                      <div className="text-right">
                        {coupon.startDate && (
                          <div className="truncate">
                            Başlangıç: {new Date(coupon.startDate).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                          </div>
                        )}
                        {coupon.endDate && (
                          <div className="truncate">
                            Bitiş: {new Date(coupon.endDate).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                          </div>
                        )}
                        {!coupon.startDate && !coupon.endDate && <span>-</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sayfalama */}
            {totalPages > 1 && (
              <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
                <div className="text-xs sm:text-sm font-sans text-gray-700 text-center sm:text-left">
                  <span className="hidden sm:inline">Toplam {total} kupon, </span>Sayfa {page} / {totalPages}
                  <span className="sm:hidden block text-xs text-gray-500 mt-0.5">Toplam {total} kupon</span>
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-end">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1 sm:flex-initial justify-center flex items-center"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline ml-1">Önceki</span>
                  </button>
                  <span className="text-xs sm:text-sm font-sans text-gray-700 px-2">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1 sm:flex-initial justify-center flex items-center"
                  >
                    <span className="hidden sm:inline mr-1">Sonraki</span>
                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
