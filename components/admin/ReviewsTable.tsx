"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  getAllReviews, 
  approveReview, 
  rejectReview, 
  unapproveReview,
  bulkApproveReviews,
  bulkUnapproveReviews,
  bulkDeleteReviews
} from "@/lib/actions/admin/reviews";
import { toast } from "sonner";
import { Check, X, Eye, Trash2, Clock, MessageSquare, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  product: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function ReviewsTable() {
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReviews, setSelectedReviews] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Tüm yorumları yükle
  const loadAllReviews = async () => {
    setLoading(true);
    try {
      const data = await getAllReviews();
      setAllReviews(data);
    } catch (error: any) {
      toast.error(error.message || "Yorumlar yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllReviews();
  }, []);

  // Filtreleme ve arama
  const filteredReviews = useMemo(() => {
    let filtered = allReviews;

    // Filtre
    if (filter === "pending") {
      filtered = filtered.filter(r => !r.isApproved);
    } else if (filter === "approved") {
      filtered = filtered.filter(r => r.isApproved);
    }

    // Arama
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.user.name?.toLowerCase().includes(query) ||
        r.user.email.toLowerCase().includes(query) ||
        r.product.name.toLowerCase().includes(query) ||
        r.comment?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allReviews, filter, searchQuery]);

  // Sayfalama
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReviews.slice(start, start + itemsPerPage);
  }, [filteredReviews, currentPage]);

  // Sayfa değiştiğinde seçimleri temizle
  useEffect(() => {
    setSelectedReviews(new Set());
    setBulkAction("");
  }, [currentPage, filter, searchQuery]);

  // Tekil işlemler
  const handleApprove = async (reviewId: string) => {
    try {
      await approveReview(reviewId);
      toast.success("Yorum onaylandı");
      loadAllReviews();
    } catch (error: any) {
      toast.error(error.message || "Yorum onaylanırken bir hata oluştu");
    }
  };

  const handleReject = async (reviewId: string) => {
    if (!confirm("Bu yorumu silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      await rejectReview(reviewId);
      toast.success("Yorum silindi");
      loadAllReviews();
    } catch (error: any) {
      toast.error(error.message || "Yorum silinirken bir hata oluştu");
    }
  };

  const handleUnapprove = async (reviewId: string) => {
    try {
      await unapproveReview(reviewId);
      toast.success("Yorum onaydan çıkarıldı");
      loadAllReviews();
    } catch (error: any) {
      toast.error(error.message || "Yorum onaydan çıkarılırken bir hata oluştu");
    }
  };

  // Toplu işlemler
  const handleSelectAll = () => {
    if (selectedReviews.size === paginatedReviews.length) {
      setSelectedReviews(new Set());
    } else {
      setSelectedReviews(new Set(paginatedReviews.map(r => r.id)));
    }
  };

  const handleSelectReview = (reviewId: string) => {
    const newSelected = new Set(selectedReviews);
    if (newSelected.has(reviewId)) {
      newSelected.delete(reviewId);
    } else {
      newSelected.add(reviewId);
    }
    setSelectedReviews(newSelected);
  };

  const handleBulkAction = async () => {
    if (selectedReviews.size === 0) {
      toast.error("Lütfen en az bir yorum seçin");
      return;
    }

    if (!bulkAction) {
      toast.error("Lütfen bir işlem seçin");
      return;
    }

    const reviewIds = Array.from(selectedReviews);

    try {
      if (bulkAction === "approve") {
        await bulkApproveReviews(reviewIds);
        toast.success(`${reviewIds.length} yorum onaylandı`);
      } else if (bulkAction === "unapprove") {
        await bulkUnapproveReviews(reviewIds);
        toast.success(`${reviewIds.length} yorum onaydan çıkarıldı`);
      } else if (bulkAction === "delete") {
        if (!confirm(`${reviewIds.length} yorumu silmek istediğinize emin misiniz?`)) {
          return;
        }
        await bulkDeleteReviews(reviewIds);
        toast.success(`${reviewIds.length} yorum silindi`);
      }
      
      setSelectedReviews(new Set());
      setBulkAction("");
      loadAllReviews();
    } catch (error: any) {
      toast.error(error.message || "İşlem sırasında bir hata oluştu");
    }
  };

  // Sayıları hesapla
  const pendingCount = allReviews.filter((r) => !r.isApproved).length;
  const approvedCount = allReviews.filter((r) => r.isApproved).length;
  const totalCount = allReviews.length;

  return (
    <div className="p-3 sm:p-4 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Başlık */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-sans font-semibold text-gray-900">Yorumlar</h1>
          <div className="text-xs sm:text-sm font-sans text-gray-600">
            Toplam: <span className="font-semibold">{totalCount}</span> yorum
          </div>
        </div>

        {/* Üst Bar - Filtreler ve Arama */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 mb-3 sm:mb-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Filtreler */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <button
                onClick={() => {
                  setFilter("all");
                  setCurrentPage(1);
                }}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-sans text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === "all"
                    ? "bg-luxury-goldLight text-luxury-black"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Tümü ({totalCount})
              </button>
              <button
                onClick={() => {
                  setFilter("pending");
                  setCurrentPage(1);
                }}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-sans text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === "pending"
                    ? "bg-luxury-goldLight text-luxury-black"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Onay Bekleyen</span>
                  <span className="sm:hidden">Bekleyen</span>
                  <span>({pendingCount})</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setFilter("approved");
                  setCurrentPage(1);
                }}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-sans text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === "approved"
                    ? "bg-luxury-goldLight text-luxury-black"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Onaylanmış</span>
                  <span className="sm:hidden">Onaylı</span>
                  <span>({approvedCount})</span>
                </div>
              </button>
            </div>

            {/* Arama */}
            <div className="flex-1 w-full sm:max-w-md">
              <div className="relative">
                <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Kullanıcı, ürün veya yorum ara..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="font-sans w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Toplu İşlemler Bar */}
        {selectedReviews.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <div className="font-sans text-xs sm:text-sm font-medium text-gray-900">
                <span className="font-semibold">{selectedReviews.size}</span> yorum seçildi
              </div>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="font-sans px-3 sm:px-4 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-luxury-goldLight w-full sm:w-auto"
              >
                <option value="">Toplu İşlem Seçin</option>
                <option value="approve">Onayla</option>
                <option value="unapprove">Onaydan Çıkar</option>
                <option value="delete">Sil</option>
              </select>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBulkAction}
                  disabled={!bulkAction}
                  className="font-sans px-3 sm:px-4 py-2 text-xs sm:text-sm bg-luxury-black text-white rounded-lg hover:bg-luxury-darkGray transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-initial"
                >
                  Uygula
                </button>
                <button
                  onClick={() => {
                    setSelectedReviews(new Set());
                    setBulkAction("");
                  }}
                  className="font-sans px-3 sm:px-4 py-2 text-xs sm:text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex-1 sm:flex-initial"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Yorumlar Tablosu */}
        {loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-luxury-goldLight mx-auto"></div>
            <p className="font-sans text-xs sm:text-sm text-gray-600 mt-4">Yorumlar yükleniyor...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-12 text-center">
            <MessageSquare className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
            <p className="font-sans text-xs sm:text-sm text-gray-600">
              {searchQuery ? "Arama sonucu bulunamadı" : "Henüz yorum bulunmuyor"}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Tablo Görünümü */}
            <div className="hidden lg:block bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left w-12">
                        <input
                          type="checkbox"
                          checked={selectedReviews.size === paginatedReviews.length && paginatedReviews.length > 0}
                          onChange={handleSelectAll}
                          className="w-4 h-4 text-luxury-goldLight border-gray-300 rounded focus:ring-luxury-goldLight"
                        />
                      </th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-sans font-medium text-gray-500 uppercase tracking-wider">
                        Yazar
                      </th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-sans font-medium text-gray-500 uppercase tracking-wider">
                        Ürün
                      </th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-sans font-medium text-gray-500 uppercase tracking-wider">
                        Puan
                      </th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-sans font-medium text-gray-500 uppercase tracking-wider">
                        Yorum
                      </th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-sans font-medium text-gray-500 uppercase tracking-wider">
                        Tarih
                      </th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-sans font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th className="px-4 xl:px-6 py-3 text-right text-xs font-sans font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedReviews.map((review) => (
                      <tr 
                        key={review.id} 
                        className={`hover:bg-gray-50 ${selectedReviews.has(review.id) ? "bg-blue-50" : ""}`}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedReviews.has(review.id)}
                            onChange={() => handleSelectReview(review.id)}
                            className="w-4 h-4 text-luxury-goldLight border-gray-300 rounded focus:ring-luxury-goldLight"
                          />
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <div>
                            <p className="font-sans text-sm font-medium text-gray-900 truncate">
                              {review.user.name || "Anonim"}
                            </p>
                            <p className="font-sans text-xs text-gray-500 truncate">{review.user.email}</p>
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <Link
                            href={`/urun/${review.product.slug}`}
                            className="font-sans text-sm text-luxury-goldLight hover:text-luxury-gold hover:underline truncate block max-w-xs"
                            target="_blank"
                          >
                            {review.product.name}
                          </Link>
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                            <span className="font-sans text-sm text-gray-600 ml-1">
                              {review.rating}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <p className="font-sans text-sm text-gray-700 line-clamp-2 max-w-md">
                            {review.comment || "-"}
                          </p>
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                          <p className="font-sans text-sm text-gray-600">
                            {new Date(review.createdAt).toLocaleDateString("tr-TR", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap">
                          {review.isApproved ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-sans font-medium bg-green-100 text-green-800">
                              Onaylandı
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-sans font-medium bg-yellow-100 text-yellow-800">
                              Beklemede
                            </span>
                          )}
                        </td>
                        <td className="px-4 xl:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-1 xl:gap-2">
                            {!review.isApproved ? (
                              <>
                                <button
                                  onClick={() => handleApprove(review.id)}
                                  className="text-green-600 hover:text-green-900 p-1.5 xl:p-2 rounded-lg hover:bg-green-50 transition-colors"
                                  title="Onayla"
                                >
                                  <Check className="w-4 h-4 xl:w-5 xl:h-5" />
                                </button>
                                <button
                                  onClick={() => handleReject(review.id)}
                                  className="text-red-600 hover:text-red-900 p-1.5 xl:p-2 rounded-lg hover:bg-red-50 transition-colors"
                                  title="Sil"
                                >
                                  <Trash2 className="w-4 h-4 xl:w-5 xl:h-5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleUnapprove(review.id)}
                                  className="text-yellow-600 hover:text-yellow-900 p-1.5 xl:p-2 rounded-lg hover:bg-yellow-50 transition-colors"
                                  title="Onaydan Çıkar"
                                >
                                  <X className="w-4 h-4 xl:w-5 xl:h-5" />
                                </button>
                                <button
                                  onClick={() => handleReject(review.id)}
                                  className="text-red-600 hover:text-red-900 p-1.5 xl:p-2 rounded-lg hover:bg-red-50 transition-colors"
                                  title="Sil"
                                >
                                  <Trash2 className="w-4 h-4 xl:w-5 xl:h-5" />
                                </button>
                              </>
                            )}
                            <Link
                              href={`/urun/${review.product.slug}`}
                              target="_blank"
                              className="text-blue-600 hover:text-blue-900 p-1.5 xl:p-2 rounded-lg hover:bg-blue-50 transition-colors"
                              title="Ürün Sayfasını Görüntüle"
                            >
                              <Eye className="w-4 h-4 xl:w-5 xl:h-5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobil Kart Görünümü */}
            <div className="lg:hidden bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
              {paginatedReviews.map((review) => (
                <div
                  key={review.id}
                  className={`p-4 ${selectedReviews.has(review.id) ? "bg-blue-50" : ""}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={selectedReviews.has(review.id)}
                      onChange={() => handleSelectReview(review.id)}
                      className="w-4 h-4 text-luxury-goldLight border-gray-300 rounded focus:ring-luxury-goldLight mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-sm font-semibold text-gray-900 truncate">
                            {review.user.name || "Anonim"}
                          </p>
                          <p className="font-sans text-xs text-gray-500 truncate">{review.user.email}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {review.isApproved ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-sans font-medium bg-green-100 text-green-800">
                              Onaylandı
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-sans font-medium bg-yellow-100 text-yellow-800">
                              Beklemede
                            </span>
                          )}
                        </div>
                      </div>
                      <Link
                        href={`/urun/${review.product.slug}`}
                        className="font-sans text-sm text-luxury-goldLight hover:text-luxury-gold hover:underline truncate block mb-2"
                        target="_blank"
                      >
                        {review.product.name}
                      </Link>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="font-sans text-xs text-gray-600 ml-1">
                          {review.rating}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="font-sans text-xs sm:text-sm text-gray-700 line-clamp-3 mb-2">
                          {review.comment}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="font-sans text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <div className="flex items-center gap-1">
                          {!review.isApproved ? (
                            <>
                              <button
                                onClick={() => handleApprove(review.id)}
                                className="text-green-600 hover:text-green-900 p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                                title="Onayla"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(review.id)}
                                className="text-red-600 hover:text-red-900 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                title="Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleUnapprove(review.id)}
                                className="text-yellow-600 hover:text-yellow-900 p-1.5 rounded-lg hover:bg-yellow-50 transition-colors"
                                title="Onaydan Çıkar"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(review.id)}
                                className="text-red-600 hover:text-red-900 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                title="Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <Link
                            href={`/urun/${review.product.slug}`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-900 p-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                            title="Ürün Sayfasını Görüntüle"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sayfalama */}
            {totalPages > 1 && (
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0 bg-white rounded-lg border border-gray-200 px-3 sm:px-4 py-3">
                <div className="font-sans text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                  Sayfa {currentPage} / {totalPages} <span className="hidden sm:inline">({filteredReviews.length} yorum)</span>
                  <span className="sm:hidden block text-xs text-gray-500 mt-0.5">{filteredReviews.length} yorum</span>
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-end">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-initial justify-center"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 sm:p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-initial justify-center"
                  >
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
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
