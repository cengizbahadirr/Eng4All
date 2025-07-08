/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**',
      },
      // YouTube thumbnail'leri için eklendi
      {
        protocol: 'https',
        hostname: 'i.ytimg.com', // Gemini'nin önerdiği doğru hostname
        port: '',
        pathname: '/vi/**',
      },
      // Gerekirse diğer domainler buraya eklenebilir
    ],
  },
  serverExternalPackages: ["mongoose"],
  webpack(config) {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    return config;
  },
};

export default nextConfig;
