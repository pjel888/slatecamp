'use client'

import { motion } from 'framer-motion'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 1, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
  },
}

export function StaggerParent({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  )
}
