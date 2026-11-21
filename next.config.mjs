/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Vercel ve lokal ortamda Next Image domain/optimizasyon hatalarını önler.
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
    ],
  },
};

export default nextConfig;
