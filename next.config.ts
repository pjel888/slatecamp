import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: *.supabase.co lh3.googleusercontent.com; font-src 'self' data:; connect-src 'self' *.supabase.co wss://*.supabase.co *.anthropic.com; worker-src 'self' blob:; frame-ancestors 'self'; object-src 'none'; base-uri 'self';",
  },
]

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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/calculators',
        destination: '/tools',
        permanent: false,
      },
      {
        source: '/calculators/:path*',
        destination: '/tools/:path*',
        permanent: false,
      },
      {
        source: '/dashboard/wiki/ale-:slug',
        destination: '/dashboard/wiki/lea-:slug',
        permanent: true,
      },
      {
        source: '/ale-starter',
        destination: '/lea-starter',
        permanent: true,
      },
      {
        source: '/dashboard/drills',
        destination: '/dashboard/quiz',
        permanent: false,
      },
      {
        source: '/dashboard/drills/sessions',
        destination: '/dashboard/quiz/sessions',
        permanent: false,
      },
      {
        source: '/quiz',
        destination: '/dashboard/quiz',
        permanent: false,
      },
      {
        source: '/quiz/sessions',
        destination: '/dashboard/quiz/sessions',
        permanent: false,
      },
      {
        source: '/quiz/session/:sessionId/results',
        destination: '/dashboard/quiz/session/:sessionId/results',
        permanent: false,
      },
      {
        source: '/quiz/session/:sessionId/review',
        destination: '/dashboard/quiz/session/:sessionId/review',
        permanent: false,
      },
      {
        source: '/quiz/session/:sessionId',
        destination: '/dashboard/quiz/session/:sessionId',
        permanent: false,
      },
      {
        source: '/quiz/:mode/session/:sessionId/results',
        destination: '/dashboard/quiz/session/:sessionId/results',
        permanent: false,
      },
      {
        source: '/quiz/:mode/session/:sessionId/review',
        destination: '/dashboard/quiz/session/:sessionId/review',
        permanent: false,
      },
      {
        source: '/quiz/:mode/session/:sessionId',
        destination: '/dashboard/quiz/session/:sessionId',
        permanent: false,
      },
      {
        source: '/quiz/:mode/setup',
        destination: '/dashboard/quiz/:mode/setup',
        permanent: false,
      },
    ]
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
  allowedDevOrigins: ['localhost', '127.0.0.1', '192.168.0.129'],
}

export default nextConfig
