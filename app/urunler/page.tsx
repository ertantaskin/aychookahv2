import type { Metadata } from "next";
import { Suspense } from "react";
import ProductsGridClient from "@/components/products/ProductsGridClient";
import ProductsHero from "@/components/products/ProductsHero";
import ProductsError from "@/components/products/ProductsError";
import { getProducts, getCategories } from "@/lib/actions/products";
import { getPageMetadata } from "@/lib/seo";
import { BreadcrumbStructuredData, CollectionPageStructuredData } from "@/components/seo/StructuredData";
import { getSiteSEO } from "@/lib/actions/seo";

// Cache'i devre dışı bırak - her istekte yeniden oluştur
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const pageMetadata = await getPageMetadata("/urunler");
  if (pageMetadata) {
    return pageMetadata;
  }

  // Fallback metadata
  const siteSEO = await getSiteSEO();
  const baseUrl = siteSEO.siteUrl;
  
  return {
    title: "Ürünler",
    description: "Aychookah lüks nargile takımları, orijinal Rus nargile ekipmanları ve premium aksesuarlar. El işçiliği ve kaliteli tasarımlar.",
    keywords: ["nargile satış", "rus nargile takımı", "lüks nargile", "nargile aksesuarları", "premium nargile"],
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `${baseUrl}/urunler`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "website",
      title: "Ürünler",
      description: "Aychookah lüks nargile takımları, orijinal Rus nargile ekipmanları ve premium aksesuarlar. El işçiliği ve kaliteli tasarımlar.",
      url: `${baseUrl}/urunler`,
      siteName: siteSEO.siteName,
    },
    twitter: {
      card: "summary_large_image",
      title: "Ürünler",
      description: "Aychookah lüks nargile takımları, orijinal Rus nargile ekipmanları ve premium aksesuarlar. El işçiliği ve kaliteli tasarımlar.",
    },
  };
}

export default async function ProductsPage() {
  try {
    const { products } = await getProducts({ isActive: true }, undefined, 1, 100);
    const categories = await getCategories();
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
          name: "Ürünler",
          item: `${baseUrl}/urunler`,
        },
      ],
    };

  // CollectionPage structured data
  const collectionData = {
    name: "Ürünler",
    description: "Aychookah lüks nargile takımları, orijinal Rus nargile ekipmanları ve premium aksesuarlar. El işçiliği ve kaliteli tasarımlar.",
    url: `${baseUrl}/urunler`,
    numberOfItems: products.length,
  };

  return (
    <>
      <BreadcrumbStructuredData data={breadcrumbData} />
      <CollectionPageStructuredData data={collectionData} />
      <ProductsHero />
        <Suspense fallback={
          <div className="py-12 text-center">
            <div className="inline-block w-8 h-8 border-2 border-luxury-goldLight border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm font-sans text-gray-600">Yükleniyor...</p>
          </div>
        }>
        <ProductsGridClient
          initialProducts={products}
          categories={categories}
          total={products.length}
          totalPages={1}
        />
        </Suspense>
    </>
  );
  } catch (error) {
    console.error("Products page error:", error);
    // Hata durumunda hata sayfası göster
    return <ProductsError />;
  }
}

