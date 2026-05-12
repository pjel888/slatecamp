'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ScrollWipeContainerProps {
  children: ReactNode
  className?: string
}

/**
 * Scroll-driven color wipe.
 *
 * A bg-muted panel slides down from above as the user scrolls through the
 * container, passing behind transparent children and eventually covering the
 * full area — creating a "pour over" effect from the preceding section into
 * the feature section.
 */
export function ScrollWipeContainer({ children, className }: ScrollWipeContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  // Panel starts fully above the container and slides down to cover it.
  const y = useTransform(scrollYProgress, [0.1, 0.55], ['-100%', '0%'])

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className || ''}`}>
      {/* Sliding background panel */}
      <motion.div
        className='absolute inset-x-0 bg-muted z-0'
        style={{
          y,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Academic drafting grid */}
        <div
          className='pointer-events-none absolute inset-0 opacity-[0.35]'
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.05) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </motion.div>

      {/* Content layered above */}
      <div className='relative z-[1]'>{children}</div>
    </div>
  )
}
