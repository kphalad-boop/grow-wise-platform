/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/', destination: '/user.html' },
        { source: '/welcome', destination: '/user.html' },
        { source: '/admin', destination: '/admin.html' },
        { source: '/admin/:path*', destination: '/admin.html' },
      ],
    };
  },
};

export default nextConfig;
