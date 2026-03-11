export interface AdSlot {
  id: string
  label: string       // Always "Sponsored" — shown in UI
  headline: string
  body: string
  ctaText: string
  ctaUrl: string
  imageUrl?: string
}

/**
 * Hardcoded initial ad content.
 * Replace with a CMS or ad server integration when ready.
 */
export const AD_SLOTS: AdSlot[] = [
  {
    id: 'kaplan-arch',
    label: 'Sponsored',
    headline: 'Kaplan Architecture Exam Prep',
    body: 'Comprehensive ARE and ALE study materials and practice exams.',
    ctaText: 'Learn More',
    ctaUrl: 'https://www.kaptest.com',
  },
]

/**
 * Picks a deterministic ad from the pool to avoid hydration mismatches.
 * Uses a string seed (e.g. page slug) to select consistently server-side.
 */
export function pickAd(seed: string): AdSlot {
  const idx = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AD_SLOTS.length
  return AD_SLOTS[idx]
}
