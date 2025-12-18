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
    const productSlug = product.slug || `product-${product.id}`;
    return (
      <Link
        href={`/urun/${productSlug}`}
        className="group bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md overflow-hidden block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex gap-4 p-4">
          {/* Image Section - Sol tarafta büyük */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
            {/* Badges */}
            <div className="absolute top-1.5 left-1.5 z-10 flex flex-col gap-1">
              {product.isNew && (
                <span className="px-1.5 py-0.5 bg-luxury-goldLight text-luxury-black text-[9px] font-bold uppercase rounded shadow-sm">
                  Yeni
                </span>
              )}
              {product.isBestseller && (
                <span className="px-1.5 py-0.5 bg-luxury-black text-white text-[9px] font-bold uppercase rounded shadow-sm">
                  Çok Satan
                </span>
              )}
            </div>

            {/* Product Image */}
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
              />
            ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-sans text-[10px] font-semibold text-luxury-goldLight uppercase tracking-wide">
                  {product.category}
                </span>
                {product.equipmentType && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="font-sans text-[10px] text-gray-500">{product.equipmentType}</span>
                  </>
                )}
              </div>

              <h3 className="font-sans text-base font-bold text-luxury-black mb-1.5 group-hover:text-luxury-goldLight transition-colors line-clamp-2">
                {product.name}
              </h3>

              {product.description && (
                <p className="font-sans text-xs text-gray-600 mb-2 line-clamp-2">
                  {product.description}
                </p>
              )}

              {product.features.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {product.features.slice(0, 3).map((feature, idx) => (
                    <span 
                      key={idx}
                      className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                  {product.features.length > 3 && (
                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded">
                      +{product.features.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div>
                <p className="font-sans text-lg font-bold text-luxury-black">
                  {product.price.toLocaleString('tr-TR')}
                  <span className="font-sans text-xs font-normal text-gray-600"> ₺</span>
                </p>
              </div>
              
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="font-sans px-4 py-2 bg-luxury-black text-white font-semibold rounded-lg hover:bg-luxury-darkGray transition-colors text-sm"
              >
                Sepete Ekle
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Compact view için farklı layout
  if (viewMode === "compact") {
    const productSlug = product.slug || `product-${product.id}`;
    return (
      <Link
        href={`/urun/${productSlug}`}
        className="group bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm overflow-hidden block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Section */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {/* Badges */}
          <div className="absolute top-1 left-1 z-10">
            {product.isNew && (
              <span className="px-1 py-0.5 bg-luxury-goldLight text-luxury-black text-[9px] font-bold uppercase rounded shadow-sm">
                Yeni
              </span>
            )}
            {product.isBestseller && (
              <span className="px-1 py-0.5 bg-luxury-black text-white text-[9px] font-bold uppercase rounded shadow-sm mt-1">
                Çok Satan
              </span>
            )}
          </div>

          {/* Product Image */}
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-2">
          <h3 className="font-sans text-xs font-bold text-luxury-black mb-1.5 line-clamp-2 leading-tight group-hover:text-luxury-goldLight transition-colors min-h-[2rem]">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between pt-1.5 border-t border-gray-100">
            <span className="font-sans text-sm font-bold text-luxury-black">
              {product.price.toLocaleString('tr-TR')} ₺
            </span>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="p-1.5 bg-luxury-black text-white rounded hover:bg-luxury-darkGray transition-colors active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // Default grid view
  const productSlug = product.slug || `product-${product.id}`;
  
  return (
    <Link
      href={`/urun/${productSlug}`}
      className="group bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md overflow-hidden h-full flex flex-col block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {/* Badges */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {product.isNew && (
            <span className="px-2 py-0.5 bg-luxury-goldLight text-luxury-black text-[10px] font-bold uppercase rounded shadow-sm">
              Yeni
            </span>
          )}
          {product.isBestseller && (
            <span className="px-2 py-0.5 bg-luxury-black text-white text-[10px] font-bold uppercase rounded shadow-sm">
              Çok Satan
            </span>
          )}
        </div>

        {/* Favorite Button - Hidden on mobile */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={`hidden sm:block absolute top-2 right-2 z-10 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-luxury-goldLight transition-all ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Product Image */}
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3 flex-1 flex flex-col">
        {/* Category */}
        <div className="flex items-center gap-1.5 mb-1">
          <span className="font-sans text-[10px] font-semibold text-luxury-goldLight uppercase tracking-wide">
            {product.category}
          </span>
          {product.equipmentType && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <span className="font-sans text-[10px] text-gray-500 truncate">{product.equipmentType}</span>
            </>
          )}
        </div>

        {/* Product Name */}
        <h3 className="font-sans text-sm font-bold text-luxury-black mb-1.5 line-clamp-2 leading-snug group-hover:text-luxury-goldLight transition-colors min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Features - Kompakt */}
        {product.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {product.features.slice(0, 2).map((feature, idx) => (
              <span 
                key={idx}
                className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[10px] rounded font-medium"
              >
                {feature}
              </span>
            ))}
            {product.features.length > 2 && (
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded">
                +{product.features.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 mt-auto">
          <div>
            <p className="font-sans text-lg font-bold text-luxury-black">
              {product.price.toLocaleString('tr-TR')}
              <span className="font-sans text-xs font-normal text-gray-600"> ₺</span>
            </p>
          </div>
          
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="font-sans p-2 bg-luxury-black text-white rounded-lg hover:bg-luxury-darkGray transition-all active:scale-95 shadow-sm touch-manipulation"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
