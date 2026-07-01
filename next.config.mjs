/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Allow PDF/video uploads up to 1 GB through the /api proxy (matches nginx limit).
    proxyClientMaxBodySize: '1024mb',
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const target = process.env.API_PROXY_TARGET ?? 'http://localhost:4000'
    return [
      {
        source: '/api/:path*',
        destination: `${target}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
