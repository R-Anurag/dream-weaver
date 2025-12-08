
/** @type {import('next').NextConfig} */
const nextConfig = {
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
            hostname: 'placehold.co',
        }
    ],
  },
  experimental: {
      serverActions: {
        bodySizeLimit: '4.5mb',
        // Extend the timeout for server actions that might take longer, like video generation.
        serverActionsTimeout: 120,
      }
  }
};

export default nextConfig;
