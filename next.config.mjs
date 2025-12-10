/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.aychookah.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // iyzico'yu server-side'da external olarak işaretle
      config.externals = config.externals || [];
      config.externals.push({
        'iyzipay': 'commonjs iyzipay',
      });
    }
    return config;
  },
  // Server components için external packages
  serverExternalPackages: ['iyzipay'],
};

export default nextConfig;

