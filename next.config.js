/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  // Output configuration for better compatibility
  output: 'standalone',
  
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Transpile packages that need it
  transpilePackages: ['@tanstack/react-query'],
  
  // Optimized webpack configuration for Vercel
  webpack: (config, { isServer }) => {
    // Add path alias resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    }
    
    // Improve module resolution for production builds
    config.resolve.modules = [
      path.resolve(__dirname),
      path.resolve(__dirname, 'node_modules'),
      'node_modules'
    ]
    
    // Ensure proper file extensions are resolved
    config.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', '.json']
    
    return config
  }
}

module.exports = nextConfig