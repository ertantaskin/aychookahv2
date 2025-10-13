"use client";

import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";

interface Product {
  id: number;
  name: string;
  category: string;
  equipmentType: string;
  price: number;
  image: string;
  description: string;
  isNew?: boolean;
  features: string[];
  material: string;
  height?: string;
  isBestseller?: boolean;
}

const allProducts: Product[] = [
  {
    id: 1,
    name: "X Hoob Go Pro Gold",
    category: "Nargile Takımları",
    equipmentType: "Komple Set",
    price: 7999,
    image: "/images/products/product-1.jpg",
    description: "Premium kalite, altın kaplama detaylar, profesyonel performans",
    isNew: true,
    isBestseller: true,
    features: ["Altın Kaplama", "Premium Kalite", "Profesyonel"],
    material: "Paslanmaz Çelik",
    height: "75cm"
  },
  {
    id: 2,
    name: "Go Pro Mini",
    category: "Nargile Takımları",
    equipmentType: "Komple Set",
    price: 4999,
    image: "/images/products/product-2.jpg",
    description: "Kompakt tasarım, yüksek kalite, taşınabilir",
    features: ["Kompakt", "Taşınabilir", "Yüksek Kalite"],
    material: "Paslanmaz Çelik",
    height: "45cm"
  },
  {
    id: 3,
    name: "Shi Carver Revolver RDR Limited Edition",
    category: "Nargile Takımları",
    equipmentType: "Komple Set",
    price: 12999,
    image: "/images/products/product-3.jpg",
    description: "Sınırlı üretim, özel tasarım, koleksiyonluk",
    isNew: true,
    features: ["Sınırlı Üretim", "Özel Tasarım", "Koleksiyonluk"],
    material: "Premium Metal",
    height: "80cm"
  },
  {
    id: 4,
    name: "Hooligan Hookah HLGN Bullet V.2",
    category: "Nargile Takımları",
    equipmentType: "Komple Set",
    price: 8999,
    image: "/images/products/product-4.jpg",
    description: "Modern tasarım, yüksek performans, dayanıklı yapı",
    isBestseller: true,
    features: ["Modern Tasarım", "Yüksek Performans", "Dayanıklı"],
    material: "Premium Çelik",
    height: "70cm"
  },
  {
    id: 5,
    name: "Serp Classic v 1.0",
    category: "Nargile Lüleri",
    equipmentType: "Lüle",
    price: 2999,
    image: "/images/products/product-5.jpg",
    description: "Klasik tasarım, yüksek kalite seramik, mükemmel ısı dağılımı",
    features: ["Klasik Tasarım", "Seramik", "Mükemmel Isı Dağılımı"],
    material: "Seramik",
    height: "15cm"
  },
  {
    id: 6,
    name: "Oblako Turk Bowl",
    category: "Nargile Lüleri",
    equipmentType: "Lüle",
    price: 1999,
    image: "/images/products/product-6.jpg",
    description: "Geleneksel Türk tasarımı, seramik malzeme, dayanıklı",
    isNew: true,
    features: ["Türk Tasarımı", "Seramik", "Dayanıklı"],
    material: "Seramik",
    height: "12cm"
  },
  {
    id: 7,
    name: "Vessel Crystal Glass Mesh",
    category: "Nargile Camları",
    equipmentType: "Cam",
    price: 3999,
    image: "/images/products/product-7.jpg",
    description: "Kristal cam malzeme, şeffaf tasarım, premium kalite",
    features: ["Kristal Cam", "Şeffaf Tasarım", "Premium Kalite"],
    material: "Kristal Cam",
    height: "25cm"
  },
  {
    id: 8,
    name: "CAESAR CRYSTAL VERTİCAL",
    category: "Nargile Camları",
    equipmentType: "Cam",
    price: 5499,
    image: "/images/products/product-8.jpg",
    description: "Dikey tasarım, kristal cam, şık görünüm",
    isNew: true,
    features: ["Dikey Tasarım", "Kristal Cam", "Şık Görünüm"],
    material: "Kristal Cam",
    height: "30cm"
  }
];

const ProductsGrid: React.FC = () => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(15000);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price-low" | "price-high" | "name">("default");
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const categories = useMemo(() => 
    Array.from(new Set(allProducts.map(p => p.category))).sort(),
    []
  );
  
  const equipmentTypes = useMemo(() => 
    Array.from(new Set(allProducts.map(p => p.equipmentType))).sort(),
    []
  );

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleEquipment = (equipment: string) => {
    setSelectedEquipment(prev =>
      prev.includes(equipment) ? prev.filter(e => e !== equipment) : [...prev, equipment]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedEquipment([]);
    setMaxPrice(15000);
    setSearchQuery("");
  };

  const activeFiltersCount = 
    selectedCategories.length + 
    selectedEquipment.length + 
    (maxPrice < 15000 ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = allProducts.filter(product => {
      if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) return false;
      if (selectedEquipment.length > 0 && !selectedEquipment.includes(product.equipmentType)) return false;
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
  }, [selectedCategories, selectedEquipment, maxPrice, searchQuery, sortBy]);

  return (
    <section className="py-6 sm:py-12 bg-white">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
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
                    className="text-sm text-luxury-goldLight hover:text-luxury-gold font-medium transition-colors"
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
                    <label key={category} className="flex items-center gap-3 cursor-pointer group py-2 px-1 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-luxury-goldLight focus:ring-2 focus:ring-luxury-goldLight/30 cursor-pointer transition-all appearance-none checked:bg-luxury-goldLight checked:border-luxury-goldLight"
                        />
                        {selectedCategories.includes(category) && (
                          <svg className="absolute inset-0 w-5 h-5 text-luxury-black pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-luxury-black transition-colors flex-1">
                        {category}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {allProducts.filter(p => p.category === category).length}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 my-6" />

              {/* Equipment Type */}
              <div>
                <h4 className="font-sans text-sm font-semibold text-luxury-black mb-3">Ekipman</h4>
                <div className="space-y-2">
                  {equipmentTypes.map((equipment) => (
                    <label key={equipment} className="flex items-center gap-3 cursor-pointer group py-2 px-1 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={selectedEquipment.includes(equipment)}
                          onChange={() => toggleEquipment(equipment)}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-luxury-goldLight focus:ring-2 focus:ring-luxury-goldLight/30 cursor-pointer transition-all appearance-none checked:bg-luxury-goldLight checked:border-luxury-goldLight"
                        />
                        {selectedEquipment.includes(equipment) && (
                          <svg className="absolute inset-0 w-5 h-5 text-luxury-black pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-luxury-black transition-colors flex-1">
                        {equipment}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        {allProducts.filter(p => p.equipmentType === equipment).length}
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
                  <span className="text-sm font-medium text-luxury-goldLight">
                    ≤ {maxPrice.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-luxury-goldLight"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>0 ₺</span>
                      <span>15.000 ₺</span>
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
                  {selectedCategories.length > 0 ? selectedCategories[0] : 'Tüm Ürünler'}
                </h2>
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-gray-100 text-gray-700 text-xs sm:text-sm font-medium rounded-full">
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
                  className="lg:hidden flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border-2 border-gray-300 rounded-xl hover:border-gray-400 bg-white hover:bg-gray-50 transition-all flex-1 sm:flex-initial"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">Filtreler</span>
                  {activeFiltersCount > 0 && (
                    <span className="px-1.5 sm:px-2 py-0.5 bg-luxury-goldLight text-luxury-black text-xs font-bold rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Sort */}
                <div className="flex-1 sm:flex-initial relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="w-full px-3 sm:px-4 py-2 pr-8 border-2 border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-luxury-goldLight/50 focus:border-luxury-goldLight bg-white transition-all cursor-pointer hover:border-gray-300 appearance-none"
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
                    product={product}
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
                <p className="text-gray-600 mb-6">Seçtiğiniz filtrelere uygun ürün bulunmamaktadır.</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-luxury-goldLight text-luxury-black font-semibold rounded-xl hover:bg-luxury-gold transition-all hover:scale-105"
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fadeIn" onClick={() => setShowMobileFilters(false)}>
          <div 
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-2xl overflow-y-auto animate-slideInRight"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10">
              <h3 className="font-sans text-lg font-bold text-luxury-black">
                Filtreler
                {activeFiltersCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-luxury-goldLight text-luxury-black text-xs font-bold rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
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

              {/* Categories */}
              <div>
                <h4 className="font-sans text-sm font-semibold text-luxury-black mb-3">Kategori</h4>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center gap-3 cursor-pointer group py-1">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-luxury-goldLight focus:ring-2 focus:ring-luxury-goldLight/30 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-luxury-black transition-colors flex-1">
                        {category}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({allProducts.filter(p => p.category === category).length})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200" />

              {/* Equipment */}
              <div>
                <h4 className="font-sans text-sm font-semibold text-luxury-black mb-3">Ekipman</h4>
                <div className="space-y-2">
                  {equipmentTypes.map((equipment) => (
                    <label key={equipment} className="flex items-center gap-3 cursor-pointer group py-1">
                      <input
                        type="checkbox"
                        checked={selectedEquipment.includes(equipment)}
                        onChange={() => toggleEquipment(equipment)}
                        className="w-5 h-5 rounded border-2 border-gray-300 text-luxury-goldLight focus:ring-2 focus:ring-luxury-goldLight/30 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 group-hover:text-luxury-black transition-colors flex-1">
                        {equipment}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({allProducts.filter(p => p.equipmentType === equipment).length})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200" />

              {/* Price */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-sans text-sm font-semibold text-luxury-black">Fiyat</h4>
                  <span className="text-sm font-medium text-luxury-goldLight">
                    ≤ {maxPrice.toLocaleString('tr-TR')} ₺
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-luxury-goldLight"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>0 ₺</span>
                      <span>15.000 ₺</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
              >
                Temizle
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 px-6 py-3 bg-luxury-black text-white font-semibold rounded-xl hover:bg-luxury-darkGray transition-all"
              >
                Uygula
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductsGrid;
