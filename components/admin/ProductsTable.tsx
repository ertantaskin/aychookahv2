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
      setProducts(result.products);
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
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-sans font-semibold text-gray-900">Ürünler</h1>
            <p className="text-sm font-sans text-gray-500 mt-1">
              Toplam {total} ürün
            </p>
          </div>
          <Link
            href="/admin/urunler/yeni"
            className="px-4 py-2 text-sm font-sans font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
          >
            + Yeni Ürün
          </Link>
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
                  placeholder="Ürün adı, slug veya açıklama ara..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
            </div>

            {/* Kategori Filtresi */}
            <div>
              <select
                value={categoryId}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                className="w-full px-3 py-2 text-sm font-sans text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
              {categoryId && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-sans font-medium bg-gray-100 text-gray-700 rounded">
                  Kategori: {categories.find(c => c.id === categoryId)?.name}
                  <button
                    onClick={() => handleFilterChange("category", "")}
                    className="hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {isActive !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-sans font-medium bg-gray-100 text-gray-700 rounded">
                  Durum: {isActive === "active" ? "Aktif" : "Pasif"}
                  <button
                    onClick={() => handleFilterChange("status", "all")}
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
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-sm font-sans text-gray-500">Yükleniyor...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm font-sans text-gray-500">Ürün bulunamadı</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        Görsel
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        Ürün Adı
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        Fiyat
                      </th>
                      <th className="text-left py-3 px-6 text-xs font-sans font-semibold text-gray-700 uppercase tracking-wider">
                        Stok
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
                    {products.map((product) => (
                      <tr 
                        key={product.id} 
                        className="hover:bg-gray-50"
                        onMouseEnter={() => setHoveredRow(product.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                      >
                        <td className="py-4 px-6">
                          {product.images[0] ? (
                            <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                              <Image
                                src={product.images[0].url}
                                alt={product.images[0].alt || product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-gray-400 text-xs font-sans">-</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6">
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
                        <td className="py-4 px-6">
                          <span className="text-sm font-sans text-gray-900">{product.category.name}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-sans font-medium text-gray-900">
                            {product.price.toLocaleString("tr-TR")} ₺
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-sans text-gray-900">{product.stock}</span>
                        </td>
                        <td className="py-4 px-6">
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
                        <td className="py-4 px-6">
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

              {/* Sayfalama */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm font-sans text-gray-700">
                    Sayfa {page} / {totalPages} (Toplam {total} ürün)
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

