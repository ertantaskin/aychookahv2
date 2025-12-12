import { MetadataRoute } from 'next';
import { getSiteSEO } from '@/lib/actions/seo';

const manifest = async (): Promise<MetadataRoute.Manifest> => {
  try {
  const siteSEO = await getSiteSEO();
  
  // Favicon URL'i varsa onu kullan
    // Icon boyutlarını ve type'ı belirtmek yerine, tarayıcının otomatik algılamasına izin veriyoruz
    // Bu, "Resource size is not correct" hatasını önler
    const icons: MetadataRoute.Manifest['icons'] = siteSEO?.favicon
    ? [
        {
          src: siteSEO.favicon,
          // sizes ve type belirtilmezse tarayıcı otomatik algılar ve boyut hatası vermez
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

