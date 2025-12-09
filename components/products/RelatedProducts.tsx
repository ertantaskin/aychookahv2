"use client";

import Link from "next/link";
import Image from "next/image";
import ProductCard from "./ProductCard";

interface RelatedProductsProps {
  products: Array<{
    id: string;
    name: string;
    slug: string;
    price: number;
    images: Array<{ url: string; alt: string | null }>;
    shortDescription?: string | null;
    isNew?: boolean;
    isBestseller?: boolean;
  }>;
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-gray-200">
      <h2 className="font-sans text-2xl font-bold text-luxury-black mb-8">İlgili Ürünler</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              category: "",
              equipmentType: "",
              price: product.price,
              image: product.images[0]?.url || "/images/placeholder.jpg",
              description: product.shortDescription || "",
              features: [],
              material: "",
              isNew: product.isNew,
              isBestseller: product.isBestseller,
            }}
            index={0}
            viewMode="grid"
          />
        ))}
      </div>
    </section>
  );
}

