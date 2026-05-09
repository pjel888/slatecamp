'use client'

import { motion } from 'framer-motion'

interface ScrollRevealProps {
  children: React.ReactNode
  delay?: number
  y?: number
  duration?: number
  className?: string
  scale?: boolean
}

export function ScrollReveal({
  children,
  delay = 0,
  y = 16,
  duration = 0.4,
  className,
  scale = false,
}: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 1, y, scale: scale ? 0.98 : 1 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
