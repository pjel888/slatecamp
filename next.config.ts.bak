import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  serverExternalPackages: ['payrex-node'],
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: ['http://localhost:3000', 'http://192.168.0.129:3000'],
}

export default nextConfig
