"use client";

import Link from "next/link";
import { useState } from "react";

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

// Ana sayfada gösterilecek öne çıkan ürünler (ProductsGrid'den seçilmiş)
const products: Product[] = [
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
  },
];

const FeaturedProducts: React.FC = () => {
  const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);

  return (
    <section className="relative py-24 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-luxury-goldLight rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-luxury-gold rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-luxury-goldLight/30 rounded-full bg-luxury-goldLight/5">
            <span className="text-luxury-goldLight text-xs sm:text-sm font-medium tracking-widest uppercase">
              Seçkin Koleksiyon
            </span>
          </div>
          
          <h2 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-luxury-black via-luxury-darkGray to-luxury-black bg-clip-text text-transparent">
              Öne Çıkan Ürünler
            </span>
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            El işçiliği ve lüks tasarımın buluştuğu özel koleksiyonumuz
          </p>

          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-luxury-goldLight to-transparent" />
            <div className="w-2 h-2 rotate-45 bg-luxury-goldLight" />
            <div className="h-px w-20 bg-gradient-to-r from-transparent via-luxury-goldLight to-transparent" />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12">
          {products.map((product) => (
            <div 
              key={product.id}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              className="group relative bg-white rounded-lg sm:rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 hover:border-luxury-goldLight/30 h-full flex flex-col"
            >
              {/* Badges */}
              <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 flex flex-col gap-1 sm:gap-2">
                {product.isNew && (
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-luxury-goldLight text-luxury-black text-[10px] sm:text-xs font-bold uppercase rounded-full shadow-lg">
                    Yeni
                  </span>
                )}
                {product.isBestseller && (
                  <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-luxury-black text-white text-[10px] sm:text-xs font-bold uppercase rounded-full shadow-lg">
                    Çok Satan
                  </span>
                )}
              </div>

              {/* Product Image Placeholder */}
              <div className="relative aspect-square bg-gradient-to-br from-luxury-mediumGray via-luxury-darkGray to-luxury-black overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center transition-transform duration-500 group-hover:scale-110">
                    <svg className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto text-luxury-goldLight mb-2 sm:mb-4 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-luxury-lightGray text-[10px] sm:text-sm font-medium px-2">{product.name}</p>
                  </div>
                </div>
                
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Quick View Button - Desktop Only */}
                <div className={`hidden sm:flex absolute inset-0 items-center justify-center transition-all duration-300 ${
                  hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'
                }`}>
                  <button className="px-4 md:px-6 py-2 md:py-3 bg-white/90 backdrop-blur-sm text-luxury-black font-semibold rounded-full hover:bg-luxury-goldLight transition-all duration-300 transform hover:scale-105 shadow-xl text-sm md:text-base">
                    Hızlı Görünüm
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-3 sm:p-4 md:p-6 bg-white flex-1 flex flex-col">
                <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                  <span className="font-sans px-1.5 sm:px-2 py-0.5 sm:py-1 bg-luxury-goldLight/10 text-luxury-goldLight text-[10px] sm:text-xs uppercase tracking-wider rounded">
                    {product.category}
                  </span>
                  <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-gray-300" />
                  <span className="font-sans text-[10px] sm:text-xs text-gray-500 truncate">{product.equipmentType}</span>
                </div>
                
                <div className="font-sans product-title text-luxury-black text-sm sm:text-base md:text-lg lg:text-xl font-bold mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-luxury-goldLight transition-colors duration-300">
                  {product.name}
                </div>
                
                <p className="font-sans text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2 flex-grow">
                  {product.description}
                </p>
                
                {/* Features */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
                  {product.features.slice(0, 2).map((feature, idx) => (
                    <span 
                      key={idx}
                      className="font-sans px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-700 text-[9px] sm:text-xs rounded-md font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-gray-100 mt-auto">
                  <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5 sm:mb-1">Fiyat</p>
                    <span className="text-luxury-black font-bold text-lg sm:text-xl md:text-2xl">
                      {product.price.toLocaleString('tr-TR')}
                      <span className="text-xs sm:text-sm font-normal text-gray-600"> ₺</span>
                    </span>
                  </div>
                  <button className="group/btn flex items-center gap-1 sm:gap-2 text-luxury-goldLight hover:text-luxury-gold transition-colors text-xs sm:text-sm font-semibold uppercase tracking-wider">
                    <span className="hidden sm:inline">Detaylar</span>
                    <span className="sm:hidden">Detay</span>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-luxury-goldLight/20 to-luxury-gold/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link 
            href="/urunler"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-luxury-black text-white font-semibold rounded-full overflow-hidden transition-all duration-300 uppercase tracking-wider text-sm hover:scale-105 shadow-lg hover:shadow-2xl"
          >
            <span className="relative z-10">Tüm Ürünleri Görüntüle</span>
            <svg className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-r from-luxury-darkGray to-luxury-black opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;


