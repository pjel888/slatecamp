'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'

/**
 * NavigationProgress — thin top-of-page progress bar during route transitions.
 * Similar to YouTube/GitHub. Camp Cobalt #1B3FC4, 2px, ease-out.
 */
export const NavigationProgress = () => {
  const pathname = usePathname()
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevPathRef = useRef(pathname)

  const startProgress = useCallback(() => {
    setVisible(true)
    setProgress(0)

    let current = 0
    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      current += current < 30 ? 10 : current < 60 ? 3 : current < 80 ? 1 : 0.5
      if (current >= 90) {
        current = 90
        if (timerRef.current) clearInterval(timerRef.current)
      }
      setProgress(current)
    }, 50)
  }, [])

  const completeProgress = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setProgress(100)
    setTimeout(() => {
      setVisible(false)
      setProgress(0)
    }, 200)
  }, [])

  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      completeProgress()
      prevPathRef.current = pathname
    }
  }, [pathname, completeProgress])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')
      if (!anchor) return

      const href = anchor.getAttribute('href')
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:')) return
      if (anchor.getAttribute('target') === '_blank') return
      if (href === pathname) return

      startProgress()
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [pathname, startProgress])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  if (!visible && progress === 0) return null

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[2px] pointer-events-none"
      role="progressbar"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-[#1B3FC4] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  )
}
