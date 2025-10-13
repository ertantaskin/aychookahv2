import { MetadataRoute } from 'next';

const robots = (): MetadataRoute.Robots => {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/private/'],
    },
    sitemap: 'https://aychookah.com/sitemap.xml',
  };
};

export default robots;

