"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getFeaturedProducts } from "@/lib/actions/products";
import { stripHtml } from "@/lib/utils/strip-html";
import ProductCard from "@/components/products/ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  shortDescription?: string | null;
  isNew: boolean;
  isBestseller: boolean;
  material?: string | null;
  height?: string | null;
  equipmentType?: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  images: Array<{ url: string; alt?: string | null }>;
  features: Array<{ name: string }>;
  _count?: {
    reviews: number;
  };
}

const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await getFeaturedProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error loading featured products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

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
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl sm:rounded-2xl overflow-hidden border border-gray-200 animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-3 sm:p-4 md:p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 mb-12">
            <p className="text-gray-500 font-sans">Henüz öne çıkan ürün seçilmemiş</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
            {products.map((product, index) => (
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
                  description: product.shortDescription 
                    ? stripHtml(product.shortDescription)
                    : stripHtml(product.description),
                  isNew: product.isNew,
                  isBestseller: product.isBestseller,
                  features: product.features.map(f => f.name),
                  material: product.material || "",
                  height: product.height || undefined,
                }}
                index={index}
                viewMode="grid"
              />
            ))}
          </div>
        )}

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


