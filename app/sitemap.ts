import { MetadataRoute } from 'next';
import { getSiteSEO } from '@/lib/actions/seo';
import { prisma } from '@/lib/prisma';

// Sitemap'i her zaman güncel tut - Google'ın index alması için önemli
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    let siteSEO;
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aychookah.com';
    
    try {
      siteSEO = await getSiteSEO();
      baseUrl = siteSEO.siteUrl || baseUrl;
    } catch (seoError) {
      console.error('Error fetching site SEO in sitemap:', seoError);
      // Fallback URL kullan
    }

    // Base URL'den trailing slash'i temizle - SEO için önemli
    baseUrl = baseUrl.replace(/\/$/, '');

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/urunler`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/hakkimizda`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/iletisim`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
    ];

    // Get all active products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Product pages
    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/urun/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Get all categories (only active ones if needed - şimdilik tüm kategoriler)
    const categories = await prisma.category.findMany({
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Category pages
    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/kategori/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    // Sitemap'te maksimum 50,000 URL olabilir (Google limiti)
    // Şimdilik tüm URL'leri döndür, eğer çok fazla olursa sitemap index kullanılabilir
    const allPages = [...staticPages, ...productPages, ...categoryPages];
    
    // URL sayısını kontrol et (log için)
    if (allPages.length > 50000) {
      console.warn(`Sitemap contains ${allPages.length} URLs, which exceeds Google's 50,000 limit. Consider using sitemap index.`);
    }
    
    return allPages;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Fallback sitemap
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aychookah.com';
    baseUrl = baseUrl.replace(/\/$/, ''); // Trailing slash'i temizle
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/urunler`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];
  }
}

