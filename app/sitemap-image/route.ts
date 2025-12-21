import { NextResponse } from 'next/server';
import { getSiteSEO } from '@/lib/actions/seo';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let siteSEO;
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aychookah.com';
    
    try {
      siteSEO = await getSiteSEO();
      baseUrl = siteSEO.siteUrl || baseUrl;
    } catch (seoError) {
      console.error('Error fetching site SEO in image sitemap:', seoError);
      // Fallback URL kullan
    }

    // Base URL'den trailing slash'i temizle - SEO için önemli
    baseUrl = baseUrl.replace(/\/$/, '');

    // Get all active products with images
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        images: true,
      },
    });

    // Generate XML sitemap for images
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${products
  .filter((product) => product.images && product.images.length > 0)
  .map((product) => {
    const imagesXml = product.images
      .map((img) => {
        // Görsel URL'ini absolute URL'e çevir (relative ise)
        let imageUrl = img.url;
        if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
          // Relative URL ise baseUrl ile birleştir
          imageUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`;
        }
        
        return `    <image:image>
      <image:loc>${escapeXml(imageUrl)}</image:loc>
      <image:title>${escapeXml(img.alt || product.name)}</image:title>
      <image:caption>${escapeXml(img.alt || product.name)}</image:caption>
    </image:image>`;
      })
      .join('\n');

    return `  <url>
    <loc>${escapeXml(`${baseUrl}/urun/${product.slug}`)}</loc>
    <lastmod>${product.updatedAt.toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
${imagesXml}
  </url>`;
  })
  .join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating image sitemap:', error);
    // Return empty sitemap on error
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
</urlset>`;
    
    return new NextResponse(emptyXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
