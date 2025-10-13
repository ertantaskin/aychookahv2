import { MetadataRoute } from 'next';

const manifest = (): MetadataRoute.Manifest => {
  return {
    name: 'Aychookah - Lüks Nargile Takımları',
    short_name: 'Aychookah',
    description: 'Lüks el işçiliği nargile takımları ve orijinal Rus nargile ekipmanları',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#D4AF37',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
};

export default manifest;

