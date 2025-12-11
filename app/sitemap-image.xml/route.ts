import { NextResponse } from 'next/server';
import { getSiteSEO } from '@/lib/actions/seo';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
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

    // Generate XML sitemap for images
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${products
  .filter((product) => product.images && product.images.length > 0)
  .map((product) => {
    const imagesXml = product.images
      .map((img) => {
        return `    <image:image>
      <image:loc>${img.url}</image:loc>
      <image:title>${escapeXml(img.alt || product.name)}</image:title>
      <image:caption>${escapeXml(img.alt || product.name)}</image:caption>
    </image:image>`;
      })
      .join('\n');

    return `  <url>
    <loc>${baseUrl}/urun/${product.slug}</loc>
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
