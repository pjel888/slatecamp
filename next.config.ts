import type { NextConfig } from 'next'

// Forced restart to pick up new env variables
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb',
    },
  },
  serverExternalPackages: ['payrex-node'],
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ['http://localhost:3000', 'http://192.168.0.129:3000'],
}

export default nextConfig
