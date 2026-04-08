import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LandingPageContent } from '@/components/landing/LandingPageContent'
import { LandingPageFallback } from '@/components/landing/LandingPageFallback'
import { siteConfig } from '@/lib/constants'

/* ── SEO Metadata ── */

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `${siteConfig.name} — Know Your LEA Readiness Before Exam Day`,
  description:
    'The only LEA prep platform built by a licensed architect. A real-time Readiness Score, expert-verified wiki, and interactive 3D building code models.  Built specifically for the Philippine Architecture Licensure Exam.',
  openGraph: {
    title: `${siteConfig.name} — The LEA Readiness Intelligence Platform`,
    description:
      'Know exactly where you stand before exam day. SlateCamp gives every LEA candidate a live Readiness Score, a taxonomy heatmap of every gap, and a structured path to close them.',
    type: 'website',
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — Stop Studying Blind. Know Your Score.`,
    description:
      'Know exactly where you stand before exam day. SlateCamp gives every LEA candidate a live Readiness Score, a taxonomy heatmap of every gap, and a structured path to close them.',
  },
  keywords: [
    'LEA exam prep',
    'architecture review platform Philippines',
    'architecture licensure exam Philippines',
    'LEA reviewer Philippines',
    'LEA readiness score',
    'PD 1096 reviewer',
    'architecture quiz app Philippines',
    'LEA practice test',
    'how to pass LEA Philippines',
    'LEA building code reviewer',
    'architecture wiki Philippines',
    'spaced repetition architecture exam',
    'SlateCamp',
    'Philippine Architecture Licensure Exam',
    'LEA mock exam',
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
