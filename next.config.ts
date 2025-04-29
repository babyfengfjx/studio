
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      // Add Firebase Storage hostname
      {
         protocol: 'https',
         hostname: 'firebasestorage.googleapis.com',
         port: '',
         pathname: '/**', // Allow images from any path in the bucket
      },
    ],
  },
};

export default nextConfig;
