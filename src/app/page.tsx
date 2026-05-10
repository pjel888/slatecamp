import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LandingPageContent } from '@/components/landing/LandingPageContent'
import { LandingPageFallback } from '@/components/landing/LandingPageFallback'
import { siteConfig } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `${siteConfig.name} | Architecture Resource Base`,
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.name} | Architecture Resource Base`,
    description:
      'Find where architecture topics fit, understand them visually, check what stayed, and know what to revisit beside school, books, mentors, and review materials.',
    type: 'website',
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | Architecture Resource Base`,
    description:
      'Find where architecture topics fit, understand them visually, check what stayed, and know what to revisit beside school, books, mentors, and review materials.',
  },
  keywords: [
    'architecture knowledge atlas',
    'architecture learning resources Philippines',
    'architecture board exam resources',
    'architecture field guide',
    'Philippine architecture codes',
    'NBCP educational resources',
    'PD 1096 educational resources',
    'BP 344 educational resources',
    'RA 9266 educational resources',
    'architecture quizzes Philippines',
    'architecture calculators Philippines',
    'architecture school resources',
    'architecture 3D learning',
    'SlateCamp',
  ],
  alternates: {
    canonical: '/',
  },
}

export default function LandingPage() {
  return (
    <Suspense fallback={<LandingPageFallback />}>
      <LandingPageContent />
    </Suspense>
  )
}
