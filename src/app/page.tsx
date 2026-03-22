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
    'The only ALE prep platform built by a licensed architect. A real-time Readiness Score, expert-verified wiki, and interactive 3D building code models.  Built specifically for the Philippine Architecture Licensure Exam.',
  openGraph: {
    title: `${siteConfig.name} — The ALE Readiness Intelligence Platform`,
    description:
      'Know exactly where you stand before exam day. SlateCamp gives every ALE candidate a live Readiness Score, a taxonomy heatmap of every gap, and a structured path to close them.',
    type: 'website',
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — Stop Studying Blind. Know Your Score.`,
    description:
      'Know exactly where you stand before exam day. SlateCamp gives every ALE candidate a live Readiness Score, a taxonomy heatmap of every gap, and a structured path to close them.',
  },
  keywords: [
    'ALE exam prep',
    'architecture board exam reviewer Philippines',
    'architecture licensure exam Philippines',
    'ALE reviewer Philippines',
    'ALE readiness score',
    'PD 1096 reviewer',
    'architecture quiz app Philippines',
    'architecture board exam practice test',
    'how to pass ALE Philippines',
    'ALE building code reviewer',
    'architecture wiki Philippines',
    'spaced repetition architecture exam',
    'SlateCamp',
    'Philippine architecture board exam',
    'ALE mock exam',
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
