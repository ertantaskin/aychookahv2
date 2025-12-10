import { MetadataRoute } from 'next';
import { getSiteSEO } from '@/lib/actions/seo';

const manifest = async (): Promise<MetadataRoute.Manifest> => {
  try {
  const siteSEO = await getSiteSEO();
  
  // Favicon URL'i varsa onu kullan, yoksa varsayılan icon'ları kullan
    const icons: MetadataRoute.Manifest['icons'] = siteSEO?.favicon
    ? [
        {
          src: siteSEO.favicon,
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: siteSEO.favicon,
          sizes: '512x512',
          type: 'image/png',
        },
      ]
    : [];

  return {
      name: siteSEO?.siteName || 'Aychookah - Lüks Nargile Takımları',
      short_name: siteSEO?.siteName?.split(' - ')[0] || 'Aychookah',
      description: siteSEO?.siteDescription || 'Lüks el işçiliği nargile takımları ve orijinal Rus nargile ekipmanları',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#D4AF37',
    icons,
  };
  } catch (error) {
    // Build sırasında veritabanı hatası olursa fallback değerler kullan
    console.error('Manifest generation error:', error);
    return {
      name: 'Aychookah - Lüks Nargile Takımları',
      short_name: 'Aychookah',
      description: 'Lüks el işçiliği nargile takımları ve orijinal Rus nargile ekipmanları',
      start_url: '/',
      display: 'standalone',
      background_color: '#0A0A0A',
      theme_color: '#D4AF37',
      icons: [],
    };
  }
};

export default manifest;

