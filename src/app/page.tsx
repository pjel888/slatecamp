import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LandingPageContent } from '@/components/landing/LandingPageContent'
import { LandingPageFallback } from '@/components/landing/LandingPageFallback'
import { siteConfig } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `${siteConfig.name} | Architecture Study Companion for Licensure Examination for Architects and Practice`,
  description: siteConfig.description,
  openGraph: {
    title: `${siteConfig.name} | Your Architecture Study Companion`,
    description:
      'Study with source-backed resources, quizzes, 3D labs, and free tools built around Philippine codes, Licensure Examination for Architects readiness, and architecture practice.',
    type: 'website',
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | Your Architecture Study Companion`,
    description:
      'Resources, quizzes, 3D labs, and free tools for architecture school, Licensure Examination for Architects readiness, and practice.',
  },
  keywords: [
    'Licensure Examination for Architects exam prep',
    'Licensure Examination for Architects reviewer Philippines',
    'Licensure Examination for Architects',
    'architecture learning platform Philippines',
    'Philippine architecture codes',
    'NBCP reviewer',
    'PD 1096 reviewer',
    'BP 344 reviewer',
    'RA 9266 reviewer',
    'architecture quiz app Philippines',
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
