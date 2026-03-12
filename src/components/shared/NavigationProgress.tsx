'use client'

import NextTopLoader from 'nextjs-toploader'

/**
 * Global top-of-viewport progress bar.
 * 2px amber bar that triggers automatically on all Next.js route changes.
 * Provides macro-level feedback — the "safety net" for slow navigations.
 */
export function NavigationProgress() {
  return (
    <NextTopLoader
      color='#1f3055'
      height={5}
      showSpinner={true}
      shadow={false}
      crawl
      crawlSpeed={200}
      speed={150}
    />
  )
}
