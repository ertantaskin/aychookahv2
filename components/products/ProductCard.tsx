"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string | number;
  name: string;
  category: string;
  equipmentType: string;
  price: number;
  image: string;
  description: string;
  isNew?: boolean;
  isBestseller?: boolean;
  features: string[];
  material: string;
  height?: string;
  slug?: string;
}

interface ProductCardProps {
  product: Product;
  index: number;
  viewMode?: "grid" | "list" | "compact";
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode = "grid" }) => {
  const [isHovered, setIsHovered] = useState(false);

  // List view için farklı layout
  if (viewMode === "list") {
    return (
      <div
        className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-xl overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex">
          {/* Image Section */}
          <div className="relative w-32 sm:w-40 aspect-square bg-gray-50 overflow-hidden flex-shrink-0">
            {/* Badges */}
            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
              {product.isNew && (
                <span className="px-2 py-0.5 bg-luxury-goldLight text-luxury-black text-[10px] font-bold uppercase rounded-md shadow-sm">
                  Yeni
                </span>
              )}
              {product.isBestseller && (
                <span className="px-2 py-0.5 bg-luxury-black text-white text-[10px] font-bold uppercase rounded-md shadow-sm">
                  Çok Satan
                </span>
              )}
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold text-luxury-goldLight uppercase tracking-wide">
                  {product.category}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-[10px] text-gray-500">{product.equipmentType}</span>
              </div>

              <h3 className="font-sans text-base font-bold text-luxury-black mb-2 group-hover:text-luxury-goldLight transition-colors">
                {product.name}
              </h3>

              {product.description && (
                <p className="font-sans text-sm text-gray-600 mb-3 line-clamp-2">
                  {product.description}
                </p>
              )}

              <div className="flex flex-wrap gap-1 mb-3">
                {product.features.slice(0, 3).map((feature, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded-md font-medium"
                  >
                    {feature}
                  </span>
                ))}
                {product.features.length > 3 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-md">
                    +{product.features.length - 3}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <p className="font-sans text-xs text-gray-500 mb-0.5">Fiyat</p>
                <p className="font-sans text-lg font-bold text-luxury-black">
                  {product.price.toLocaleString('tr-TR')}
                  <span className="font-sans text-sm font-normal text-gray-600"> ₺</span>
                </p>
              </div>
              
              <button className="font-sans px-4 py-2 bg-luxury-black text-white font-semibold rounded-lg hover:bg-luxury-darkGray transition-colors text-sm">
                Sepete Ekle
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Compact view için farklı layout
  if (viewMode === "compact") {
    return (
      <div
        className="group bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-lg overflow-hidden cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Section */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {/* Badges */}
          <div className="absolute top-1 left-1 z-10">
            {product.isNew && (
              <span className="px-1.5 py-0.5 bg-luxury-goldLight text-luxury-black text-[9px] font-bold uppercase rounded shadow-sm">
                Yeni
              </span>
            )}
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-2">
          <h3 className="font-sans text-xs font-bold text-luxury-black mb-1 line-clamp-2 leading-tight group-hover:text-luxury-goldLight transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <span className="font-sans text-xs font-bold text-luxury-black">
              {product.price.toLocaleString('tr-TR')} ₺
            </span>
            <button className="p-1.5 bg-luxury-black text-white rounded hover:bg-luxury-darkGray transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default grid view
  const productSlug = product.slug || `product-${product.id}`;
  
  return (
    <Link
      href={`/urun/${productSlug}`}
      className="group bg-white rounded-xl sm:rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-xl overflow-hidden h-full flex flex-col block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden touch-manipulation">
        {/* Badges */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10 flex flex-col gap-1.5 sm:gap-2">
          {product.isNew && (
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-luxury-goldLight text-luxury-black text-[10px] sm:text-xs font-bold uppercase rounded-md sm:rounded-lg shadow-sm">
              Yeni
            </span>
          )}
          {product.isBestseller && (
            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-luxury-black text-white text-[10px] sm:text-xs font-bold uppercase rounded-md sm:rounded-lg shadow-sm">
              Çok Satan
            </span>
          )}
        </div>

        {/* Favorite Button - Hidden on mobile */}
        <button className={`hidden sm:block absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:bg-luxury-goldLight transition-all ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Product Image */}
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
        <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
          <div className="text-center">
            <svg className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        )}

        {/* Quick View on Hover - Hidden on mobile */}
        <div className={`hidden sm:block absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button className="font-sans w-full py-2 sm:py-2.5 bg-white text-luxury-black font-semibold rounded-lg hover:bg-luxury-goldLight transition-colors text-xs sm:text-sm">
            Hızlı Görünüm
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col">
        {/* Category */}
        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <span className="font-sans text-[10px] sm:text-xs font-semibold text-luxury-goldLight uppercase tracking-wide">
            {product.category}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="font-sans text-[10px] sm:text-xs text-gray-500 truncate">{product.equipmentType}</span>
        </div>

        {/* Product Name */}
        <h3 className="font-sans product-title text-sm sm:text-base font-bold text-luxury-black mb-1.5 sm:mb-2 line-clamp-2 leading-snug group-hover:text-luxury-goldLight transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="font-sans text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2 leading-relaxed flex-grow">
            {product.description}
          </p>
        )}

        {/* Features */}
        <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-3 sm:mb-4">
          {product.features.slice(0, 2).map((feature, idx) => (
            <span 
              key={idx}
              className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-700 text-[10px] sm:text-xs rounded-md font-medium"
            >
              {feature}
            </span>
          ))}
          {product.features.length > 2 && (
            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-100 text-gray-500 text-[10px] sm:text-xs rounded-md">
              +{product.features.length - 2}
            </span>
          )}
        </div>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-gray-100 mt-auto">
          <div>
                <p className="font-sans text-[10px] sm:text-xs text-gray-500 mb-0.5">Fiyat</p>
                <p className="font-sans text-base sm:text-lg md:text-xl font-bold text-luxury-black">
                  {product.price.toLocaleString('tr-TR')}
                  <span className="font-sans text-xs sm:text-sm font-normal text-gray-600"> ₺</span>
                </p>
          </div>
          
          <button className="font-sans p-2 sm:p-2.5 md:p-3 bg-luxury-black text-white rounded-lg sm:rounded-xl hover:bg-luxury-darkGray transition-all active:scale-95 sm:hover:scale-105 shadow-md touch-manipulation">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
