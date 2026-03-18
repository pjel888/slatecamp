import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LandingPageContent } from '@/components/landing/LandingPageContent'
import { LandingPageFallback } from '@/components/landing/LandingPageFallback'
import { siteConfig } from '@/lib/constants'

/* ── SEO Metadata ── */

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `${siteConfig.name} — Know Your ALE Readiness Before Exam Day`,
  description:
    'The only ALE prep platform with a Readiness Score, 3D building code viewer, 2,400+ verified questions, and a complete PD 1096 wiki — built for the Philippine Architecture Licensure Exam.',
  openGraph: {
    title: `${siteConfig.name} — The ALE Readiness Intelligence Platform`,
    description:
      "The only ALE prep platform with a real-time Readiness Score. Know exactly where you stand, what to fix, and when you're genuinely ready — before exam day.",
    type: 'website',
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — Stop Studying Blind. Know Your Score.`,
    description:
      "The only ALE prep platform with a real-time Readiness Score. Know exactly where you stand, what to fix, and when you're genuinely ready — before exam day.",
  },
  keywords: [
    'architecture board exam prep',
    'ALE exam prep',
    'ARE exam prep',
    'architecture exam reviewer Philippines',
    'ALE readiness score',
    'architecture quiz app Philippines',
    'ALE 3D building code viewer',
    'PD 1096 reviewer',
    'architecture wiki Philippines',
    'spaced repetition architecture exam',
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
