"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getAllProducts, getCategories, deleteProduct } from "@/lib/actions/admin/products";
import { Search, Filter, X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  isActive: boolean;
  category: {
    id: string;
    name: string;
  };
  images: Array<{ url: string; alt?: string }>;
}

interface Category {
  id: string;
  name: string;
}

export default function ProductsTable() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  
  // Filtreler
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [categoryId, setCategoryId] = useState(searchParams.get("category") || "");
  const [isActive, setIsActive] = useState<string>(searchParams.get("status") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "desc"
  );
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [limit] = useState(20);

  // Kategorileri yükle
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, []);

  // Ürünleri yükle
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAllProducts(
        page,
        limit,
        search || undefined,
        categoryId || undefined,
        isActive === "all" ? undefined : isActive === "active",
        sortBy,
        sortOrder
      );
      // Map products to match interface (convert null to undefined for alt)
      const mappedProducts: Product[] = result.products.map((product) => ({
        ...product,
        images: product.images.map((img) => ({
          url: img.url,
          alt: img.alt ?? undefined,
        })),
      }));
      setProducts(mappedProducts);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      
      // URL'i güncelle
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (categoryId) params.set("category", categoryId);
      if (isActive !== "all") params.set("status", isActive);
      if (sortBy !== "createdAt") params.set("sortBy", sortBy);
      if (sortOrder !== "desc") params.set("sortOrder", sortOrder);
      if (page > 1) params.set("page", page.toString());
      
      router.replace(`/admin/urunler?${params.toString()}`, { scroll: false });
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, categoryId, isActive, sortBy, sortOrder, router]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleFilterChange = (filter: string, value: string) => {
    if (filter === "category") setCategoryId(value);
    if (filter === "status") setIsActive(value);
    if (filter === "sortBy") setSortBy(value);
    if (filter === "sortOrder") setSortOrder(value as "asc" | "desc");
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryId("");
    setIsActive("all");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const hasActiveFilters = search || categoryId || isActive !== "all" || sortBy !== "createdAt";

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const result = await deleteProduct(id);
      // Ürünleri yeniden yükle
      await loadProducts();
      // Başarı mesajı göster
      if (result.softDelete) {
        alert(result.message || "Ürün siparişlerde kullanıldığı için pasif hale getirildi.");
      } else {
        alert(result.message || "Ürün başarıyla silindi.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert(error instanceof Error ? error.message : "Ürün silinirken bir hata oluştu");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-sans font-semibold text-gray-900">Ürünler</h1>
            <p className="text-xs sm:text-sm font-sans text-gray-500 mt-1">
              Toplam {total} ürün
            </p>
          </div>
          <Link
            href="/admin/urunler/yeni"
            className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-sans font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors w-full sm:w-auto text-center"
          >
            + Yeni Ürün
          </Link>
        </div>

        {/* Filtreler ve Arama */}
        <div className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Arama */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ürün adı, slug veya açıklama ara..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 text-xs sm:text-sm font-sans text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>

            {/* Kategori Filtresi */}
            <div>
              <select
                value={categoryId}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm font-sans text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="">Tüm Kategoriler</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Durum Filtresi */}
            <div>
              <select
                value={isActive}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm font-sans text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
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
                className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm font-sans text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              >
                <option value="createdAt-desc">Yeni → Eski</option>
                <option value="createdAt-asc">Eski → Yeni</option>
                <option value="name-asc">İsim (A-Z)</option>
                <option value="name-desc">İsim (Z-A)</option>
                <option value="price-asc">Fiyat (Düşük → Yüksek)</option>
                <option value="price-desc">Fiyat (Yüksek → Düşük)</option>
                <option value="stock-asc">Stok (Az → Çok)</option>
                <option value="stock-desc">Stok (Çok → Az)</option>
              </select>
            </div>
          </div>

          {/* Aktif Filtreler */}
          {hasActiveFilters && (
            <div className="mt-3 sm:mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-sans font-medium text-gray-500">Aktif Filtreler:</span>
              {search && (
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-sans font-medium bg-gray-100 text-gray-700 rounded">
                  Arama: <span className="truncate max-w-[100px] sm:max-w-none">{search}</span>
                  <button
                    onClick={() => handleSearch("")}
                    className="hover:text-gray-900 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {categoryId && (
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-sans font-medium bg-gray-100 text-gray-700 rounded">
                  Kategori: <span className="truncate max-w-[80px] sm:max-w-none">{categories.find(c => c.id === categoryId)?.name}</span>
                  <button
                    onClick={() => handleFilterChange("category", "")}
                    className="hover:text-gray-900 flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {isActive !== "all" && (
                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-sans font-medium bg-gray-100 text-gray-700 rounded">
                  Durum: {isActive === "active" ? "Aktif" : "Pasif"}
                  <button
                    onClick={() => handleFilterChange("status", "all")}
                    className="hover:text-gray-900 flex-shrink-0"
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
          {loading ? (
            <div className="p-6 sm:p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-gray-900"></div>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm font-sans text-gray-500">Yükleniyor...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-6 sm:p-12 text-center">
              <p className="text-xs sm:text-sm font-sans text-gray-500">Ürün bulunamadı</p>
            </div>
          ) : (
            <>
              {/* Desktop Tablo Görünümü */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 xl:px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        Görsel
                      </th>
                      <th className="text-left py-3 px-4 xl:px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        Ürün Adı
                      </th>
                      <th className="text-left py-3 px-4 xl:px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="text-left py-3 px-4 xl:px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        Fiyat
                      </th>
                      <th className="text-left py-3 px-4 xl:px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        Stok
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
                    {products.map((product) => (
                      <tr 
                        key={product.id} 
                        className="hover:bg-gray-50"
                        onMouseEnter={() => setHoveredRow(product.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <td className="py-4 px-4 xl:px-6">
                          {product.images[0] ? (
                            <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                              <Image
                                src={product.images[0].url}
                                alt={product.images[0].alt || product.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400 text-xs font-sans">-</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 xl:px-6">
                          <div className="text-sm font-sans font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs font-sans text-gray-500">{product.slug}</div>
                          {hoveredRow === product.id && (
                            <button
                              onClick={() => handleDelete(product.id, product.name)}
                              disabled={deletingId === product.id}
                              className="mt-1 text-xs font-sans text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-opacity"
                              title="Ürünü Sil"
                            >
                              <Trash2 className="w-3 h-3" />
                              {deletingId === product.id ? "Siliniyor..." : "Sil"}
                            </button>
                          )}
                        </td>
                        <td className="py-4 px-4 xl:px-6">
                          <span className="text-sm font-sans text-gray-900">{product.category.name}</span>
                        </td>
                        <td className="py-4 px-4 xl:px-6">
                          <span className="text-sm font-sans font-medium text-gray-900">
                            {product.price.toLocaleString("tr-TR")} ₺
                          </span>
                        </td>
                        <td className="py-4 px-4 xl:px-6">
                          <span className="text-sm font-sans text-gray-900">{product.stock}</span>
                        </td>
                        <td className="py-4 px-4 xl:px-6">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-sans font-medium rounded-full ${
                              product.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.isActive ? "Aktif" : "Pasif"}
                          </span>
                        </td>
                        <td className="py-4 px-4 xl:px-6">
                          <Link
                            href={`/admin/urunler/${product.id}`}
                            className="text-sm font-sans font-medium text-gray-700 hover:text-gray-900"
                          >
                            Düzenle
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobil Kart Görünümü */}
              <div className="lg:hidden divide-y divide-gray-200">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {/* Görsel */}
                      <div className="flex-shrink-0">
                        {product.images[0] ? (
                          <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                              src={product.images[0].url}
                              alt={product.images[0].alt || product.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 64px, 80px"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs font-sans">-</span>
                          </div>
                        )}
                      </div>
                      
                      {/* İçerik */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-sans font-semibold text-gray-900 mb-1 truncate">
                              {product.name}
                            </h3>
                            <p className="text-xs font-sans text-gray-500 mb-2 truncate">{product.slug}</p>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs font-sans text-gray-600">{product.category.name}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span
                                className={`inline-flex px-2 py-0.5 text-xs font-sans font-medium rounded-full ${
                                  product.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {product.isActive ? "Aktif" : "Pasif"}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-sans">
                              <span className="font-semibold text-gray-900">
                                {product.price.toLocaleString("tr-TR")} ₺
                              </span>
                              <span className="text-gray-500">Stok: {product.stock}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* İşlem Butonları */}
                        <div className="flex items-center gap-2 mt-3">
                          <Link
                            href={`/admin/urunler/${product.id}`}
                            className="px-3 py-1.5 text-xs sm:text-sm font-sans font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors flex-1 text-center"
                          >
                            Düzenle
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={deletingId === product.id}
                            className="px-3 py-1.5 text-xs sm:text-sm font-sans font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                            title="Ürünü Sil"
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            {deletingId === product.id ? "Siliniyor..." : "Sil"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sayfalama */}
              {totalPages > 1 && (
                <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                  <div className="text-xs sm:text-sm font-sans text-gray-700 text-center sm:text-left">
                    Sayfa {page} / {totalPages} (Toplam {total} ürün)
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1.5 text-xs sm:text-sm font-sans font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 flex-1 sm:flex-initial"
                    >
                      <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                      Önceki
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-3 py-1.5 text-xs sm:text-sm font-sans font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 flex-1 sm:flex-initial"
                    >
                      Sonraki
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
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

