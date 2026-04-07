'use client'

import { useEffect, useState } from 'react'
import { Check } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface SRProgressRingProps {
  count: number
  target?: number
  size?: number
  className?: string
}

export const SRProgressRing = ({
  count,
  target = 3,
  size = 48,
  className,
}: SRProgressRingProps) => {
  const [showCheck, setShowCheck] = useState(false)
  const isMet = count >= target

  useEffect(() => {
    if (isMet) {
      const timeout = setTimeout(() => setShowCheck(true), 200)
      return () => clearTimeout(timeout)
    }
    setShowCheck(false)
  }, [isMet])

  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(count / target, 1)
  const dashOffset = circumference * (1 - progress)
  const center = size / 2

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={count}
      aria-valuemin={0}
      aria-valuemax={target}
      aria-label={`${count} of ${target} consecutive correct`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg]"
      >
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={isMet ? 'var(--success)' : 'var(--primary)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-300 ease-out"
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {showCheck ? (
          <Check
            weight="bold"
            className="text-success transition-opacity duration-150 ease-out"
            size={size * 0.4}
          />
        ) : (
          <span
            className="font-medium tabular-nums"
            style={{
              fontSize: size * 0.28,
              color: isMet ? 'var(--success)' : 'var(--foreground)',
            }}
          >
            {count}/{target}
          </span>
        )}
      </div>
    </div>
  )
}
