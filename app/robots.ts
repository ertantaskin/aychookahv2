import { MetadataRoute } from 'next';
import { getSiteSEO } from '@/lib/actions/seo';

export default async function robots(): Promise<MetadataRoute.Robots> {
  try {
    const siteSEO = await getSiteSEO();
    const baseUrl = siteSEO.siteUrl;

    // Parse robots.txt content if exists
    let disallowPaths = ['/api/', '/admin/', '/giris', '/kayit', '/hesabim/', '/sepet', '/odeme/'];
    
    if (siteSEO.robotsTxt) {
      // Simple parsing - you can enhance this
      const lines = siteSEO.robotsTxt.split('\n');
      const disallowLines = lines
        .filter(line => line.trim().startsWith('Disallow:'))
        .map(line => line.replace('Disallow:', '').trim());
      
      if (disallowLines.length > 0) {
        disallowPaths = disallowLines;
      }
    }

    return {
      rules: [
        {
          userAgent: '*',
          allow: '/',
          disallow: disallowPaths,
        },
        {
          userAgent: 'Googlebot',
          allow: '/',
          disallow: ['/api/', '/admin/'],
        },
        {
          userAgent: 'Bingbot',
          allow: '/',
          disallow: ['/api/', '/admin/'],
        },
        {
          userAgent: 'Slurp',
          allow: '/',
          disallow: ['/api/', '/admin/'],
        },
      ],
      sitemap: [
        `${baseUrl}/sitemap.xml`,
        `${baseUrl}/sitemap-image.xml`,
      ],
    };
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    // Fallback robots.txt
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://aychookah.com';
    return {
      rules: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/api/', '/admin/', '/giris', '/kayit'],
        },
        {
          userAgent: 'Googlebot',
          allow: '/',
          disallow: ['/api/', '/admin/'],
        },
        {
          userAgent: 'Bingbot',
          allow: '/',
          disallow: ['/api/', '/admin/'],
        },
      ],
      sitemap: [
        `${baseUrl}/sitemap.xml`,
        `${baseUrl}/sitemap-image.xml`,
      ],
    };
  }
}

