import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getRelatedProducts } from "@/lib/actions/products";
import { getSiteSEO } from "@/lib/actions/seo";
import ProductDetailClient from "@/components/products/ProductDetailClient";
import RelatedProducts from "@/components/products/RelatedProducts";
import { ProductStructuredData, BreadcrumbStructuredData, AggregateRatingStructuredData } from "@/components/seo/StructuredData";
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
    const product = await getProduct(slug);
    const siteSEO = await getSiteSEO();
    const baseUrl = siteSEO.siteUrl;
    
    const title = (product as any).seoTitle || product.name;
    const description = (product as any).seoDescription || product.description;
    const keywords = (product as any).metaKeywords?.split(",").map((k: string) => k.trim()).filter(Boolean);
    const ogImage = (product as any).ogImage || (product.images && product.images.length > 0 ? product.images[0].url : undefined);
    
    return {
      title,
      description,
      keywords,
      alternates: {
        canonical: `${baseUrl}/urun/${product.slug}`,
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
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: ogImage ? [ogImage] : [],
      },
    };
  } catch {
    return {
      title: "Ürün Bulunamadı",
    };
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  try {
    const product = await getProduct(slug);
    const relatedProducts = await getRelatedProducts(product.id, product.categoryId);
    const siteSEO = await getSiteSEO();
    const baseUrl = siteSEO.siteUrl;
    const taxSettings = await getTaxSettings();

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
        availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
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
        {
          position: 3,
          name: product.category.name,
          item: `${baseUrl}/urunler?kategori=${product.category.slug}`,
        },
        {
          position: 4,
          name: product.name,
          item: `${baseUrl}/urun/${product.slug}`,
        },
      ],
    };

    return (
      <div className="min-h-screen bg-white">
        <ProductStructuredData data={productData} />
        <BreadcrumbStructuredData data={breadcrumbData} />
        {avgRating > 0 && (
          <AggregateRatingStructuredData
            itemReviewed={product.name}
            ratingValue={avgRating}
            reviewCount={reviews.length}
          />
        )}
        <ProductDetailClient product={product} taxSettings={taxSettings} />
        {relatedProducts.length > 0 && (
          <RelatedProducts products={relatedProducts} />
        )}
      </div>
    );
  } catch (error) {
    notFound();
  }
}
