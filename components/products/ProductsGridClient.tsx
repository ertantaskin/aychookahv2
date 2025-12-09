"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import ProductCard from "./ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  equipmentType: string | null;
  price: number;
  images: Array<{ url: string; alt: string | null }>;
  description: string;
  shortDescription?: string | null;
  isNew: boolean;
  isBestseller: boolean;
  features: Array<{ name: string }>;
  material: string | null;
  height: string | null;
}

interface ProductsGridClientProps {
  initialProducts: Product[];
  categories: Array<{ id: string; name: string; slug: string }>;
  total: number;
  totalPages: number;
}

const ProductsGridClient: React.FC<ProductsGridClientProps> = ({
  initialProducts,
  categories,
  total,
  totalPages,
}) => {
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get("category");
  
  // Ürünlerin maksimum fiyatını hesapla
  const maxProductPrice = useMemo(() => {
    if (initialProducts.length === 0) return 100000;
    return Math.max(...initialProducts.map(p => p.price), 100000);
  }, [initialProducts]);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(maxProductPrice);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price-low" | "price-high" | "name">("default");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // maxProductPrice değiştiğinde maxPrice'ı güncelle
  useEffect(() => {
    setMaxPrice(maxProductPrice);
  }, [maxProductPrice]);

  // URL'den kategori parametresini al ve filtreye ekle
  useEffect(() => {
    if (categorySlug) {
      const category = categories.find(cat => cat.slug === categorySlug);
      if (category) {
        setSelectedCategories([category.id]);
      }
    } else {
      // URL'de kategori yoksa filtreyi temizle
      setSelectedCategories([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categorySlug]);

  const activeCategory = categorySlug 
    ? categories.find(cat => cat.slug === categorySlug)
    : null;

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(c => c !== categoryId) : [...prev, categoryId]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setMaxPrice(maxProductPrice);
    setSearchQuery("");
  };

  const activeFiltersCount =
    selectedCategories.length +
    (maxPrice < maxProductPrice ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = initialProducts.filter(product => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category.id)) return false;
      if (product.price > maxPrice) return false;
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low": return a.price - b.price;
        case "price-high": return b.price - a.price;
        case "name": return a.name.localeCompare(b.name, 'tr');
        default:
          if (a.isBestseller && !b.isBestseller) return -1;
          if (!a.isBestseller && b.isBestseller) return 1;
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return 0;
      }
    });

    return filtered;
  }, [initialProducts, selectedCategories, maxPrice, searchQuery, sortBy]);

  return (
    <section className="py-6 sm:py-12 bg-white">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        {activeCategory && (
          <nav className="mb-6 sm:mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm">
              <li>
                <Link
                  href="/urunler"
                  className="font-sans text-gray-500 hover:text-luxury-goldLight transition-colors"
                >
                  Ürünler
                </Link>
              </li>
              <li>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </li>
              <li>
                <span className="font-sans text-luxury-black font-medium" aria-current="page">
                  {activeCategory.name}
                </span>
              </li>
            </ol>
          </nav>
        )}

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-5">
              {/* Search */}
              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ara..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-luxury-goldLight/50 focus:border-luxury-goldLight text-sm transition-all"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Filter Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <h3 className="font-sans text-lg font-bold text-luxury-black">
                  Filtreler
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-luxury-goldLight text-luxury-black text-xs font-bold rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="font-sans text-sm text-luxury-goldLight hover:text-luxury-gold font-medium transition-colors"
                  >
                    Temizle
                  </button>
                )}
              </div>

              {/* Categories */}
              <div>
                <h4 className="font-sans text-sm font-semibold text-luxury-black mb-3">Kategori</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center gap-3 cursor-pointer group py-2 px-1 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category.id)}
                          onChange={() => toggleCategory(category.id)}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-luxury-goldLight focus:ring-2 focus:ring-luxury-goldLight/30 cursor-pointer transition-all appearance-none checked:bg-luxury-goldLight checked:border-luxury-goldLight"
                        />
                        {selectedCategories.includes(category.id) && (
                          <svg className="absolute inset-0 w-5 h-5 text-luxury-black pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="font-sans text-sm font-medium text-gray-700 group-hover:text-luxury-black transition-colors flex-1">
                        {category.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 my-6" />

              {/* Price Range */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-sans text-sm font-semibold text-luxury-black">Fiyat</h4>
                  <span className="font-sans text-sm font-medium text-luxury-goldLight">
                    ≤ {maxPrice.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={maxProductPrice}
                  step={maxProductPrice > 10000 ? 1000 : 500}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-luxury-goldLight"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span className="font-sans">0 ₺</span>
                  <span className="font-sans">{maxProductPrice.toLocaleString('tr-TR')} ₺</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <h2 className="font-sans text-xl sm:text-2xl font-bold text-luxury-black">
                  Tüm Ürünler
                </h2>
                <span className="font-sans px-2.5 py-0.5 sm:px-3 sm:py-1 bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium rounded-full">
                  {filteredAndSortedProducts.length}
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {/* View Mode Toggle */}
                <div className="hidden sm:flex items-center bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "grid"
                        ? "bg-white shadow-sm text-luxury-black"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    title="Grid Görünüm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "list"
                        ? "bg-white shadow-sm text-luxury-black"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    title="Liste Görünüm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode("compact")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "compact"
                        ? "bg-white shadow-sm text-luxury-black"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                    title="Kompakt Görünüm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </button>
                </div>

                {/* Mobile Filter Button */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="font-sans lg:hidden flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl hover:border-gray-400 bg-white hover:bg-gray-50 transition-all flex-1 sm:flex-initial"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">Filtreler</span>
                  {activeFiltersCount > 0 && (
                    <span className="font-sans px-1.5 sm:px-2 py-0.5 bg-luxury-goldLight text-luxury-black text-xs font-bold rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Sort */}
                <div className="flex-1 sm:flex-initial relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="font-sans w-full px-3 sm:px-4 py-2 pr-8 border-2 border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-luxury-goldLight/50 focus:border-luxury-goldLight bg-white transition-all cursor-pointer hover:border-gray-300 appearance-none"
                    style={{ color: '#1f2937' }}
                  >
                    <option value="default">Önerilen</option>
                    <option value="price-low">Ucuzdan Pahalıya</option>
                    <option value="price-high">Pahalıdan Ucuza</option>
                    <option value="name">A-Z</option>
                  </select>
                  <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredAndSortedProducts.length > 0 ? (
              <div className={`${
                viewMode === "grid"
                  ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-6"
                  : viewMode === "list"
                  ? "grid grid-cols-1 gap-4"
                  : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
              }`}>
                {filteredAndSortedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      name: product.name,
                      slug: product.slug,
                      category: product.category.name,
                      equipmentType: product.equipmentType || "",
                      price: product.price,
                      image: product.images[0]?.url || "/images/placeholder.jpg",
                      description: product.shortDescription || "",
                      isNew: product.isNew,
                      isBestseller: product.isBestseller,
                      features: product.features.map(f => f.name),
                      material: product.material || "",
                      height: product.height || undefined,
                    }}
                    index={index}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-sans text-xl font-bold text-gray-800 mb-2">Ürün Bulunamadı</h3>
                <p className="font-sans text-gray-600 mb-6">Seçtiğiniz filtrelere uygun ürün bulunmamaktadır.</p>
                <button
                  onClick={clearFilters}
                  className="font-sans px-6 py-3 bg-luxury-goldLight text-luxury-black font-semibold rounded-xl hover:bg-luxury-gold transition-all hover:scale-105"
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductsGridClient;

