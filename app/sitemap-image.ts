import { MetadataRoute } from 'next';
import { getSiteSEO } from '@/lib/actions/seo';
import { prisma } from '@/lib/prisma';

export default async function sitemapImage(): Promise<MetadataRoute.Sitemap> {
  try {
    const siteSEO = await getSiteSEO();
    const baseUrl = siteSEO.siteUrl;

    // Get all active products with images
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        images: true,
      },
    });

    const imageSitemap: MetadataRoute.Sitemap = [];

    products.forEach((product) => {
      if (product.images && product.images.length > 0) {
        product.images.forEach((image) => {
          imageSitemap.push({
            url: `${baseUrl}/urun/${product.slug}`,
            lastModified: product.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        });
      }
    });

    return imageSitemap;
  } catch (error) {
    console.error('Error generating image sitemap:', error);
    return [];
  }
}

