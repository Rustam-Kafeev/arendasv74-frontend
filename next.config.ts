const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'http', hostname: '127.0.0.1', port: '8000', pathname: '/storage/**' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
   // Разрешаем доступ с этого IP в режиме разработки
  allowedDevOrigins: ['192.168.0.105'],
};

export default nextConfig;