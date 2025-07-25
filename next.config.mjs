/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
  async rewrites() {
    return [
      {
        source: '/(.*)',
        destination: '/',
      },
    ]
  },
}

export default nextConfig
