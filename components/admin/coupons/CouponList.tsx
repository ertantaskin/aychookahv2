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
    <div className="p-6 space-y-6">
      {/* Başlık ve Yeni Buton */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-sans font-bold text-gray-900">Kuponlar</h1>
          <p className="mt-1 text-sm font-sans text-gray-500">
            İndirim kuponlarını yönetin ve takip edin
          </p>
        </div>
        <Link
          href="/admin/kampanyalar/kuponlar/yeni"
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-sans text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Yeni Kupon
        </Link>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Arama */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Kupon kodu veya açıklama ara..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-sans text-sm text-gray-900"
            />
          </div>

          {/* Durum Filtresi */}
          <select
            value={isActive}
            onChange={(e) => {
              setIsActive(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-sans text-sm text-gray-900 bg-white"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>

          {/* Sıralama */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-sans text-sm text-gray-900 bg-white"
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
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-sans text-sm"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-sm font-sans text-gray-500">Yükleniyor...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm font-sans text-gray-500">Kupon bulunamadı</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                      Kupon Kodu
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                      İndirim Türü
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                      İndirim Değeri
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                      Kullanım
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                      Tarih Aralığı
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
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
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-sans font-semibold text-gray-900">
                              {coupon.code}
                            </span>
                            {coupon.description && (
                              <span className="text-xs font-sans text-gray-500 mt-1">
                                {coupon.description}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                          <span className="text-sm font-sans text-gray-900">
                            {discountTypeLabels[coupon.discountType]}
                          </span>
                            {coupon.discountType === "BUY_X_GET_Y" && coupon.buyMode && (
                              <span className="text-xs font-sans text-gray-500 mt-1">
                                {coupon.buyMode === "CATEGORY" && "İki Kategori"}
                                {coupon.buyMode === "PRODUCT" && "İki Ürün"}
                                {coupon.buyMode === "CONDITIONAL_FREE" && "Koşullu Bedava"}
                                {coupon.buyMode === "CATEGORY" && coupon.buyQuantity && coupon.getQuantity && ` (${coupon.buyQuantity} alana ${coupon.getQuantity} bedava)`}
                                {coupon.buyMode === "PRODUCT" && coupon.buyQuantity && coupon.getQuantity && ` (${coupon.buyQuantity} alana ${coupon.getQuantity} bedava)`}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-sans font-semibold text-gray-900">
                            {formatDiscountValue(coupon.discountType, coupon.discountValue)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
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
                        <td className="py-4 px-6">
                          <div className="flex flex-col text-xs font-sans text-gray-600">
                            {coupon.startDate && (
                              <span>
                                Başlangıç: {new Date(coupon.startDate).toLocaleDateString("tr-TR")}
                              </span>
                            )}
                            {coupon.endDate && (
                              <span>
                                Bitiş: {new Date(coupon.endDate).toLocaleDateString("tr-TR")}
                              </span>
                            )}
                            {!coupon.startDate && !coupon.endDate && <span>-</span>}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-sans font-medium rounded-full ${
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
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/admin/kampanyalar/kuponlar/${coupon.id}`}
                              className="p-2 text-gray-600 hover:text-black hover:bg-gray-100 rounded transition-colors"
                              title="Düzenle"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(coupon.id)}
                              disabled={deletingId === coupon.id}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
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

            {/* Sayfalama */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm font-sans text-gray-700">
                  Toplam {total} kupon, Sayfa {page} / {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-sans text-gray-700">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="p-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
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
