import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getRelatedProducts } from "@/lib/actions/products";
import { getSiteSEO } from "@/lib/actions/seo";
import ProductDetailClient from "@/components/products/ProductDetailClient";
import RelatedProducts from "@/components/products/RelatedProducts";
import { ProductStructuredData, BreadcrumbStructuredData } from "@/components/seo/StructuredData";
import { getTaxSettings } from "@/lib/utils/tax-calculator";

// Cache'i devre dışı bırak - her istekte yeniden oluştur
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    let product;
    try {
      product = await getProduct(slug);
    } catch (productError) {
      console.error("Error fetching product in metadata:", productError);
      return {
        title: "Ürün Bulunamadı",
      };
    }

    if (!product) {
      return {
        title: "Ürün Bulunamadı",
      };
    }

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
    
    const title = (product as any).seoTitle || product.name;
    const description = (product as any).seoDescription || product.description;
    const keywords = (product as any).metaKeywords?.split(",").map((k: string) => k.trim()).filter(Boolean);
    const ogImage = (product as any).ogImage || (product.images && product.images.length > 0 ? product.images[0].url : undefined);
    
    return {
      title,
      description,
      keywords,
      metadataBase: new URL(baseUrl),
      alternates: {
        canonical: `${baseUrl}/urun/${product.slug}`,
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
        title,
        description,
        images: ogImage ? [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ] : [],
        url: `${baseUrl}/urun/${product.slug}`,
        siteName: siteSEO?.siteName || "Aychookah",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ogImage ? [ogImage] : [],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Ürün Bulunamadı",
    };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  try {
    let product;
    try {
      product = await getProduct(slug);
    } catch (productError) {
      console.error("Error fetching product:", productError);
      // Hata durumunda notFound yerine basit bir hata sayfası göster
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ürün Bulunamadı</h1>
            <p className="text-gray-600">Aradığınız ürün bulunamadı veya kaldırılmış olabilir.</p>
          </div>
        </div>
      );
    }

    if (!product) {
      // Ürün yoksa notFound yerine basit bir hata sayfası göster
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ürün Bulunamadı</h1>
            <p className="text-gray-600">Aradığınız ürün bulunamadı veya kaldırılmış olabilir.</p>
          </div>
        </div>
      );
    }

    // Category kontrolü
    if (!product.category) {
      console.error("Product category is missing:", product.id);
      // Category yoksa fallback kullan
      product.category = {
        id: "unknown",
        name: "Kategori",
        slug: "kategori",
      } as any;
    }

    let relatedProducts: Awaited<ReturnType<typeof getRelatedProducts>> = [];
    try {
      relatedProducts = await getRelatedProducts(product.id, product.categoryId);
    } catch (relatedError) {
      console.error("Error fetching related products:", relatedError);
      // Boş dizi kullan - sayfa yine de render edilecek
      relatedProducts = [];
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
    
    let taxSettings;
    try {
      taxSettings = await getTaxSettings();
    } catch (taxError) {
      console.error("Error fetching tax settings:", taxError);
      // Fallback tax settings
      taxSettings = {
        defaultTaxRate: 0.20,
        taxIncluded: true,
        rules: [],
      };
    }

    // Calculate average rating
    const reviews = product.reviews || [];
    const images = product.images || [];
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    // Product structured data
    const productData = {
      name: product.name,
      description: product.description,
      image: images.length > 0 ? images.map(img => img.url) : [],
      brand: (product as any).brand || siteSEO.siteName,
      sku: product.sku || product.id,
      offers: {
        price: product.price,
        priceCurrency: "TRY",
        availability: product.stock > 0 ? "InStock" : "OutOfStock",
        url: `${baseUrl}/urun/${product.slug}`,
      },
      ...(avgRating > 0 && {
        aggregateRating: {
          ratingValue: avgRating,
          reviewCount: reviews.length,
        },
      }),
    };

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
        ...(product.category ? [{
          position: 3,
          name: product.category.name,
          item: `${baseUrl}/urunler?kategori=${product.category.slug}`,
        }] : []),
        {
          position: product.category ? 4 : 3,
          name: product.name,
          item: `${baseUrl}/urun/${product.slug}`,
        },
      ],
    };

    return (
      <div className="min-h-screen bg-white">
        <ProductStructuredData data={productData} />
        <BreadcrumbStructuredData data={breadcrumbData} />
        <ProductDetailClient product={product} taxSettings={taxSettings} />
        {relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}
      </div>
    );
  } catch (error) {
    console.error("ProductDetailPage error:", error);
    // Hata durumunda notFound yerine basit bir hata sayfası göster
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bir Hata Oluştu</h1>
          <p className="text-gray-600">Sayfa yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
        </div>
      </div>
    );
  }
}
