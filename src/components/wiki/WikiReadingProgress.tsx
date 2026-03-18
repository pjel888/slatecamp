'use client'

import * as React from 'react'

/**
 * Horizontal reading progress bar — fills as the user scrolls through the page.
 * Expects to observe the scroll of a specific container (via ref) or window.
 */
export function WikiReadingProgress({ scrollContainerId }: { scrollContainerId?: string }) {
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    const container = scrollContainerId
      ? document.getElementById(scrollContainerId)
      : null

    const handleScroll = () => {
      const el = container || document.documentElement
      const scrollTop = container ? el.scrollTop : window.scrollY
      const scrollHeight = el.scrollHeight - el.clientHeight

      if (scrollHeight <= 0) {
        setProgress(0)
        return
      }

      setProgress(Math.min(100, Math.round((scrollTop / scrollHeight) * 100)))
    }

    const target = container || window
    target.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => target.removeEventListener('scroll', handleScroll)
  }, [scrollContainerId])

  return (
    <div className="h-[2px] w-full bg-zinc-100" aria-hidden="true">
      <div
        className="h-full bg-[#1B3FC4] transition-[width] duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
