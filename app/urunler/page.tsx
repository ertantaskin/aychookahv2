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
  try {
    const pageMetadata = await getPageMetadata("/urunler");
    if (pageMetadata) {
      return pageMetadata;
    }
  } catch (error) {
    console.error("Error fetching page metadata:", error);
    // Fallback metadata'ya devam et
  }

  // Fallback metadata
  let siteSEO;
  let baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aychookah.com";
  
  try {
    siteSEO = await getSiteSEO();
    baseUrl = siteSEO.siteUrl || baseUrl;
  } catch (seoError) {
    console.error("Error fetching site SEO in metadata:", seoError);
    // Fallback değerler kullan
    siteSEO = {
      siteName: "Aychookah",
      siteUrl: baseUrl,
    } as any;
  }
  
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
      siteName: siteSEO?.siteName || "Aychookah",
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
    let products: Awaited<ReturnType<typeof getProducts>>['products'] = [];
    let categories: Awaited<ReturnType<typeof getCategories>> = [];
    
    try {
      const productsResult = await getProducts({ isActive: true }, undefined, 1, 100);
      products = productsResult.products || [];
    } catch (productsError) {
      console.error("Error fetching products:", productsError);
      // Boş dizi kullan - sayfa yine de render edilecek
      products = [];
    }
    
    try {
      categories = await getCategories();
    } catch (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
      // Boş dizi kullan - sayfa yine de render edilecek
      categories = [];
    }
    
    let siteSEO;
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aychookah.com";
    
    try {
      siteSEO = await getSiteSEO();
      baseUrl = siteSEO.siteUrl || baseUrl;
    } catch (seoError) {
      console.error("Error fetching site SEO:", seoError);
      // Fallback değerler kullan
      siteSEO = {
        siteName: "Aychookah",
        siteUrl: baseUrl,
      } as any;
    }

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

