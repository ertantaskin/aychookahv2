"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { updateFeaturedProducts, searchProductsForSelection } from "@/lib/actions/admin/featured-products";
import { toast } from "sonner";
import { Save, Check, X, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  isFeatured: boolean;
  category: {
    name: string;
  };
  images: Array<{ url: string; alt?: string | null }>;
}

interface FeaturedProductsManagerProps {
  initialFeaturedProducts: Product[];
  initialRecentProducts: Product[];
}

export default function FeaturedProductsManager({ 
  initialFeaturedProducts,
  initialRecentProducts 
}: FeaturedProductsManagerProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialFeaturedProducts.map(p => p.id)
  );
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(initialFeaturedProducts);
  const [displayProducts, setDisplayProducts] = useState<Product[]>(initialRecentProducts);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isShowingSearchResults, setIsShowingSearchResults] = useState(false);

  // Seçili ürünlerin sayısını kontrol et
  const selectedCount = selectedIds.length;
  const maxFeatured = 8;

  // Arama yap
  const performSearch = useCallback(async (searchQuery: string, pageNum: number = 1) => {
    if (!searchQuery.trim()) {
      // Arama yoksa son 20 ürünü göster
      setDisplayProducts(initialRecentProducts.filter(p => !selectedIds.includes(p.id)));
      setIsSearching(false);
      setIsShowingSearchResults(false);
      setPage(1);
      setTotalPages(1);
      setTotal(0);
      return;
    }

    setIsSearching(true);
    setIsShowingSearchResults(true);
    try {
      const result = await searchProductsForSelection(searchQuery, pageNum, 20);
      // Seçili olmayan ürünleri göster
      const unselected = result.products.filter(p => !selectedIds.includes(p.id));
      setDisplayProducts(unselected);
      setTotalPages(result.totalPages);
      setTotal(result.total);
      setPage(pageNum);
    } catch (error: any) {
      toast.error(error.message || "Arama yapılırken bir hata oluştu");
    } finally {
      setIsSearching(false);
    }
  }, [selectedIds, initialRecentProducts]);

  // Arama değiştiğinde
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (search.trim()) {
        performSearch(search, 1);
      } else {
        // Arama yoksa son 20 ürünü göster (seçili olmayanlar)
        setDisplayProducts(initialRecentProducts.filter(p => !selectedIds.includes(p.id)));
        setIsShowingSearchResults(false);
        setPage(1);
        setTotalPages(1);
        setTotal(0);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [search, performSearch, initialRecentProducts, selectedIds]);

  // Seçili ürünler değiştiğinde displayProducts'ı güncelle
  useEffect(() => {
    if (!isShowingSearchResults && !search.trim()) {
      setDisplayProducts(initialRecentProducts.filter(p => !selectedIds.includes(p.id)));
    }
  }, [selectedIds, initialRecentProducts, isShowingSearchResults, search]);

  // selectedProducts'ı unique tut
  useEffect(() => {
    setSelectedProducts(prevProducts => {
      const uniqueProducts = prevProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      );
      return uniqueProducts;
    });
  }, [selectedProducts.length]);

  const handleToggle = (productId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(productId)) {
        // Seçimi kaldır
        setSelectedProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        return prev.filter((id) => id !== productId);
      } else {
        if (prev.length >= maxFeatured) {
          toast.error(`Maksimum ${maxFeatured} ürün seçebilirsiniz`);
          return prev;
        }
        // Ürünü seçili listesine ekle (duplicate kontrolü ile)
        const productToAdd = displayProducts.find(p => p.id === productId) || 
                            selectedProducts.find(p => p.id === productId);
        if (productToAdd) {
          setSelectedProducts(prevProducts => {
            // Duplicate kontrolü yap
            if (prevProducts.some(p => p.id === productId)) {
              return prevProducts;
            }
            return [...prevProducts, productToAdd];
          });
        }
        return [...prev, productId];
      }
    });
  };

  const handleSave = async () => {
    if (selectedIds.length === 0) {
      toast.error("En az bir ürün seçmelisiniz");
      return;
    }

    setIsSaving(true);
    try {
      await updateFeaturedProducts(selectedIds);
      toast.success("Öne çıkan ürünler başarıyla güncellendi");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      performSearch(search, newPage);
    }
  };

  // Sıralama fonksiyonları
  const moveProductLeft = (index: number) => {
    if (index === 0) return;
    
    setSelectedProducts(prevProducts => {
      const newProducts = [...prevProducts];
      [newProducts[index - 1], newProducts[index]] = [newProducts[index], newProducts[index - 1]];
      return newProducts;
    });
    
    setSelectedIds(prevIds => {
      const newIds = [...prevIds];
      [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
      return newIds;
    });
  };

  const moveProductRight = (index: number) => {
    const uniqueProducts = selectedProducts.filter((product, i, self) => 
      i === self.findIndex(p => p.id === product.id)
    );
    if (index === uniqueProducts.length - 1) return;
    
    setSelectedProducts(prevProducts => {
      const newProducts = [...prevProducts];
      [newProducts[index], newProducts[index + 1]] = [newProducts[index + 1], newProducts[index]];
      return newProducts;
    });
    
    setSelectedIds(prevIds => {
      const newIds = [...prevIds];
      [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
      return newIds;
    });
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Seçim Bilgisi ve Kaydet Butonu */}
      <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div>
            <p className="text-xs font-sans text-gray-700">
              <span className="font-semibold">{selectedCount}</span> / {maxFeatured} ürün seçildi
            </p>
            {selectedCount >= maxFeatured && (
              <p className="text-[10px] font-sans text-red-600 mt-0.5">
                Maksimum ürün sayısına ulaştınız
              </p>
            )}
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving || selectedIds.length === 0}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-sans bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 w-full sm:w-auto"
          >
            <Save className="w-3 h-3" />
            {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>

      {/* Seçili Ürünler */}
      {selectedProducts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-2 sm:px-4 py-2 sm:py-3 border-b border-gray-200 bg-green-50">
            <h2 className="text-sm sm:text-base font-sans font-semibold text-gray-900">
              Seçili Ürünler ({selectedProducts.length})
            </h2>
            <p className="text-[10px] sm:text-xs font-sans text-gray-600 mt-0.5">
              Bu ürünler ana sayfada gösterilecek
            </p>
          </div>
          <div className="p-2 sm:p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
              {selectedProducts
                .filter((product, index, self) => 
                  // Duplicate'leri filtrele - aynı id'ye sahip ilk elemanı tut
                  index === self.findIndex(p => p.id === product.id)
                )
                .map((product, index) => (
                <div
                  key={product.id}
                  className="relative border-2 border-green-500 rounded-lg overflow-hidden bg-white hover:shadow-md transition-shadow"
                >
                  {/* Sıralama Butonları */}
                  <div className="absolute top-1 left-1 z-10 flex gap-0.5">
                    <button
                      onClick={() => moveProductLeft(index)}
                      disabled={index === 0}
                      className="p-1 bg-white/90 backdrop-blur-sm text-gray-700 rounded border border-gray-300 hover:bg-gray-100 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
                      title="Sola Taşı"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveProductRight(index)}
                      disabled={index === selectedProducts.filter((p, i, self) => i === self.findIndex(pr => pr.id === p.id)).length - 1}
                      className="p-1 bg-white/90 backdrop-blur-sm text-gray-700 rounded border border-gray-300 hover:bg-gray-100 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
                      title="Sağa Taşı"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleToggle(product.id)}
                    className="absolute top-1 right-1 z-10 p-1.5 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                    title="Seçimi Kaldır"
                  >
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <div className="relative aspect-square bg-gray-100">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.images[0].alt || product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-xs font-sans">Görsel Yok</span>
                      </div>
                    )}
                  </div>
                  <div className="p-1.5 sm:p-2">
                    <p className="text-[10px] sm:text-xs font-sans font-semibold text-gray-900 mb-0.5 line-clamp-2 leading-tight">
                      {product.name}
                    </p>
                    <p className="text-[9px] sm:text-[10px] font-sans text-gray-500 mb-0.5">{product.category.name}</p>
                    <p className="text-xs sm:text-sm font-sans font-bold text-gray-900">
                      {product.price.toLocaleString("tr-TR")} ₺
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Ürün Arama ve Liste */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-2 sm:px-4 py-2 sm:py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="text-sm sm:text-base font-sans font-semibold text-gray-900">
            Ürün Ara ve Seç
          </h2>
          <p className="text-[10px] sm:text-xs font-sans text-gray-600 mt-0.5">
            {isShowingSearchResults 
              ? "Arama sonuçlarından ürün seçebilir veya yeni arama yapabilirsiniz"
              : "Son eklenen ürünlerden seçim yapabilir veya arama yaparak daha fazla ürün bulabilirsiniz"
            }
          </p>
        </div>
        
        {/* Arama Kutusu */}
        <div className="px-2 sm:px-4 py-2 border-b border-gray-200 bg-white">
          <div className="relative">
            <input
              type="text"
              placeholder="Ürün veya kategori ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-7 pr-2.5 py-1.5 text-xs font-sans text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
            <svg
              className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="p-2 sm:p-3">
          {isSearching ? (
            <div className="text-center py-8">
              <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-2"></div>
              <p className="text-[10px] sm:text-xs font-sans text-gray-500">Aranıyor...</p>
            </div>
          ) : displayProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[10px] sm:text-xs font-sans text-gray-500">
                {isShowingSearchResults 
                  ? "Arama sonucu bulunamadı"
                  : "Gösterilecek ürün bulunamadı"
                }
              </p>
            </div>
          ) : (
            <>
              {isShowingSearchResults && (
                <div className="mb-2">
                  <p className="text-[10px] sm:text-xs font-sans text-gray-600">
                    <span className="font-semibold">{total}</span> ürün bulundu
                  </p>
                </div>
              )}
              {!isShowingSearchResults && (
                <div className="mb-2">
                  <p className="text-[10px] sm:text-xs font-sans text-gray-600">
                    Son eklenen <span className="font-semibold">{displayProducts.length}</span> ürün
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3 mb-2">
                {displayProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleToggle(product.id)}
                    disabled={selectedIds.length >= maxFeatured || selectedIds.includes(product.id)}
                    className="relative border-2 border-gray-200 rounded-lg overflow-hidden bg-white hover:border-gray-300 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
                  >
                    {selectedIds.includes(product.id) ? (
                      <div className="absolute top-2 right-2 z-10 p-1.5 bg-green-600 text-white rounded-full">
                        <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                    ) : (
                      <div className="absolute top-2 right-2 z-10 p-1.5 bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 transition-colors">
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                    )}
                    <div className="relative aspect-square bg-gray-100">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0].url}
                          alt={product.images[0].alt || product.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-xs font-sans">Görsel Yok</span>
                        </div>
                      )}
                    </div>
                    <div className="p-1.5 sm:p-2">
                      <p className="text-[10px] sm:text-xs font-sans font-semibold text-gray-900 mb-0.5 line-clamp-2 leading-tight">
                        {product.name}
                      </p>
                      <p className="text-[9px] sm:text-[10px] font-sans text-gray-500 mb-0.5">{product.category.name}</p>
                      <p className="text-xs sm:text-sm font-sans font-bold text-gray-900">
                        {product.price.toLocaleString("tr-TR")} ₺
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Sayfalama - Sadece arama sonuçlarında göster */}
              {isShowingSearchResults && totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] sm:text-xs font-sans text-gray-700 px-2">
                    Sayfa {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

