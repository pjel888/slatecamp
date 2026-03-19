'use client'

import { useEffect, useState } from 'react'

interface AnimatedScoreProps {
  target: number
  color: string
}

export const AnimatedScore = ({ target, color }: AnimatedScoreProps) => {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const duration = 700
    const start = performance.now()

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(target * eased))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [target])

  return (
    <span
      className="font-[family-name:var(--font-syne)] font-extrabold text-[80px] leading-none tracking-tight tabular-nums"
      style={{ color }}
    >
      {display}%
    </span>
  )
}
