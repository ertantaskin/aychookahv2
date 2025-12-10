import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import ProductsGridClient from "@/components/products/ProductsGridClient";
import { getCategoryBySlug } from "@/lib/actions/admin/categories";
import { getProducts } from "@/lib/actions/products";
import { BreadcrumbStructuredData } from "@/components/seo/StructuredData";
import { getSiteSEO } from "@/lib/actions/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Kategori Bulunamadı",
    };
  }

  const siteSEO = await getSiteSEO();
  const baseUrl = siteSEO.siteUrl;

  return {
    title: category.seoTitle || category.name,
    description: category.seoDescription || category.description || `${category.name} kategorisindeki ürünler`,
    keywords: category.metaKeywords?.split(",").map(k => k.trim()) || [category.name],
    openGraph: {
      title: category.seoTitle || category.name,
      description: category.seoDescription || category.description || `${category.name} kategorisindeki ürünler`,
      images: category.ogImage ? [category.ogImage] : category.image ? [category.image] : undefined,
      url: `${baseUrl}/kategori/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const { products } = await getProducts(
    { categoryIds: [category.id], isActive: true },
    undefined,
    1,
    100
  );

  const siteSEO = await getSiteSEO();
  const baseUrl = siteSEO.siteUrl;

  // Breadcrumb structured data
  const breadcrumbData = {
    itemListElement: [
      {
        position: 1,
        name: "Ana Sayfa",
        item: baseUrl,
      },
      {
        position: 2,
        name: "Kategoriler",
        item: `${baseUrl}/kategori`,
      },
      {
        position: 3,
        name: category.name,
        item: `${baseUrl}/kategori/${category.slug}`,
      },
    ],
  };

  return (
    <>
      <BreadcrumbStructuredData data={breadcrumbData} />
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/urunler"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 font-sans mb-4 transition-colors"
          >
            <span>←</span>
            <span>Ürünler</span>
          </Link>
          <div className="flex items-center gap-4">
            {category.image && (
              <img
                src={category.image}
                alt={category.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-3xl font-sans font-bold text-gray-900">{category.name}</h1>
              {category.description && (
                <p className="mt-2 text-gray-600 font-sans">{category.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Suspense
        fallback={
          <div className="py-12 text-center">
            <div className="inline-block w-8 h-8 border-2 border-luxury-goldLight border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm font-sans text-gray-600">Yükleniyor...</p>
          </div>
        }
      >
        <ProductsGridClient
          initialProducts={products}
          categories={[]}
          total={products.length}
          totalPages={1}
        />
      </Suspense>
    </>
  );
}

