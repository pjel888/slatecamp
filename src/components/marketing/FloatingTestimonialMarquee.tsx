'use client'

import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'

/* ── Feature Highlight Data ── */

interface FeatureHighlight {
  id: number
  headline: string
  detail: string
  tag: string
}

const FEATURES: FeatureHighlight[] = [
  {
    id: 1,
    headline: 'Readiness Score',
    detail: 'Real-time. Honest. Powered by IRT — never inflated.',
    tag: 'Analytics',
  },
  {
    id: 2,
    headline: 'Syllabus-mapped',
    detail: 'Every question tied to the exact ALE taxonomy node.',
    tag: 'Content',
  },
  {
    id: 3,
    headline: 'AI Tutor',
    detail: 'Cites its sources. Temperature 0.0. No hallucinations.',
    tag: 'Bounded Intelligence',
  },
  {
    id: 4,
    headline: 'Review Mode',
    detail: 'No timer. No pressure. Pure active recall.',
    tag: 'Study',
  },
  {
    id: 5,
    headline: '3D Lab',
    detail: 'Rotate, cut away, and explore structures spatially.',
    tag: 'Visual',
  },
  {
    id: 6,
    headline: 'Camp Mode',
    detail: 'Timed. Tracked. Every answer analyzed.',
    tag: 'Sessions',
  },
  {
    id: 7,
    headline: 'Taxonomy Heatmap',
    detail: 'See every gap across all ALE subjects at a glance.',
    tag: 'Analytics',
  },
  {
    id: 8,
    headline: 'Spaced Repetition',
    detail: 'SM-2 algorithm resurfaces what you need most.',
    tag: 'Engine',
  },
  {
    id: 9,
    headline: 'Wiki Reference',
    detail: 'Every wrong answer links to the exact source article.',
    tag: 'Content',
  },
]

// Map old shape to new for particle reuse
interface Testimonial {
  id: number
  name: string
  profession: string
  text: string
  avatar: string
}

const TESTIMONIALS: Testimonial[] = FEATURES.map((f) => ({
  id: f.id,
  name: f.headline,
  profession: f.tag,
  text: f.detail,
  avatar: f.tag.slice(0, 2).toUpperCase(),
}))

/* ── Deterministic pseudo-random from seed ── */
function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

/* ── Particle spawn config ── */
interface ParticleConfig {
  testimonial: Testimonial
  startX: number // % from left
  startY: number // % from top
  driftX: number[] // keyframe x offsets in px
  driftY: number[] // keyframe y offsets in px
  duration: number // seconds for full drift cycle
  scale: number
  opacity: number
  layer: 'deep' | 'mid'
  delay: number // animation delay
}

/**
 * Generate deterministic spawn positions scattered across the hero canvas.
 * Only 8 particles total — sparse and breathable. 6 deep background, 2 midground.
 */
function generateParticles(): ParticleConfig[] {
  // Hand-tuned positions to avoid clustering and stay clear of key UI zones
  // Each position is [x%, y%] across the hero section
  const spawnPoints: [number, number][] = [
    [45, 12], // top-left, behind headline
    [72, 8], // top-right area
    [0, 45], // mid-left, behind CTA
    [85, 45], // right side
    [20, 60], // center-top gap
    [80, 65], // center-right low
    [25, 10], // left of center
    [90, 25], // far right
    [60, 80], // mid-center
    // [20, 80], // lower-left, slightly right
    // [38, 75], // lower center-left
  ]

  const particles: ParticleConfig[] = spawnPoints.map((pos, i) => {
    const t = TESTIMONIALS[i % TESTIMONIALS.length]
    const r = (n: number) => seededRandom(i * 100 + n)

    // Generate organic drift waypoints (small, wandering movements)
    const driftRange = 40 + r(1) * 60 // 40-100px drift range
    const driftX = [
      0,
      driftRange * (r(2) - 0.5),
      -driftRange * (r(3) - 0.3),
      driftRange * (r(4) - 0.6),
      0,
    ]
    const driftY = [
      0,
      -driftRange * (r(5) - 0.4),
      driftRange * (r(6) - 0.5),
      -driftRange * (r(7) - 0.3),
      0,
    ]

    const isMidground = i >= 6 // last 2 are midground
    const duration = 45 + r(8) * 40 // 45-85 seconds

    return {
      testimonial: t,
      startX: pos[0],
      startY: pos[1],
      driftX,
      driftY,
      duration,
      scale: isMidground ? 0.95 : 0.85 + r(9) * 0.1,
      opacity: isMidground ? 0.55 : 0.3 + r(10) * 0.15,
      layer: isMidground ? 'mid' : 'deep',
      delay: r(11) * -30, // stagger start times
    }
  })

  return particles
}

/* ── Stars (micro-sized) ── */
function MicroStars() {
  return (
    <div className='flex gap-px'>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className='h-1.5 w-1.5 text-primary'
          viewBox='0 0 20 20'
          fill='currentColor'
          aria-hidden='true'
        >
          <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
        </svg>
      ))}
    </div>
  )
}

/* ── Hover spring config ── */
const FOCUS_SPRING = { type: 'spring' as const, stiffness: 300, damping: 20 }

/* ── Floating Micro-Widget ── */
function FloatingParticle({ config }: { config: ParticleConfig }) {
  const zClass = config.layer === 'mid' ? 'z-[5]' : 'z-[1]'

  return (
    <motion.div
      className={`absolute ${zClass}`}
      style={{
        left: `${config.startX}%`,
        top: `${config.startY}%`,
        scale: config.scale,
      }}
      animate={{
        x: config.driftX,
        y: config.driftY,
      }}
      transition={{
        x: {
          duration: config.duration,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'reverse',
          delay: config.delay,
        },
        y: {
          duration: config.duration * 1.1,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'reverse',
          delay: config.delay,
        },
      }}
    >
      <motion.div
        drag
        dragElastic={0.4}
        dragTransition={{ bounceStiffness: 200, bounceDamping: 15 }}
        dragSnapToOrigin
        whileDrag={{ scale: 1.15, opacity: 1, zIndex: 100, cursor: 'grabbing' }}
        whileHover={{ scale: 1.15, opacity: 1, zIndex: 50 }}
        whileTap={{ scale: 1.15, opacity: 1, zIndex: 50 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: config.opacity }}
        transition={{
          scale: FOCUS_SPRING,
          opacity: { duration: 0.15 },
          default: { duration: 2, delay: Math.abs(config.delay) * 0.1 },
        }}
        className='h-20 w-64 cursor-grab select-none overflow-hidden rounded-md border border-white/40 bg-white/60 px-3 py-2.5 shadow-sm backdrop-blur-md'
        style={{
          touchAction: 'none',
        }}
      >
        <div className='flex h-full flex-col justify-between'>
          <span className='inline-block self-start rounded-full bg-[#EEF2FC] px-2 py-0.5 font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.12em] text-[#1535A8]'>
            {config.testimonial.profession}
          </span>
          <div>
            <p className='text-[11px] font-semibold leading-tight text-zinc-800'>
              {config.testimonial.name}
            </p>
            <p className='mt-0.5 line-clamp-2 text-[11px] leading-snug text-zinc-500'>
              {config.testimonial.text}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ── Main Export ── */

export function FloatingTestimonialMarquee() {
  const [mounted, setMounted] = useState(false)
  const particles = useMemo(() => generateParticles(), [])

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div
      className='pointer-events-none absolute inset-0 hidden overflow-hidden md:block'
      aria-label='Student testimonials'
      role='region'
    >
      {mounted &&
        particles.map((p) => (
          <div key={p.testimonial.id} className='pointer-events-auto'>
            <FloatingParticle config={p} />
          </div>
        ))}
    </div>
  )
}
