'use client'

import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { SLATECAMP_PAPER, SLATECAMP_AMBER, SLATECAMP_INK, hexToRgba } from '@/lib/constants'

/* ── Testimonial Data ── */

interface Testimonial {
  id: number
  name: string
  profession: string
  text: string
  avatar: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Marco R.',
    profession: 'ALE Reviewee',
    text: 'The Readiness Score told me exactly where I stood.',
    avatar: 'MR',
  },
  {
    id: 2,
    name: 'Jessa M.',
    profession: 'Architecture Student',
    text: 'One platform replaced five PDFs. Finally, clarity.',
    avatar: 'JM',
  },
  {
    id: 3,
    name: 'Paolo D.',
    profession: 'ALE Passer, 2025',
    text: 'The heatmap showed my blind spots before the exam did.',
    avatar: 'PD',
  },
  {
    id: 4,
    name: 'Jerica Rivera',
    profession: 'Architect',
    text: 'Review Mode: no anxiety. Camp Mode: real learning.',
    avatar: 'AC',
  },
  {
    id: 5,
    name: 'Nico T.',
    profession: 'Architecture Graduate',
    text: 'Confidence from data, not hope.',
    avatar: 'NT',
  },
  {
    id: 6,
    name: 'Justin Rencer Wee Eng',
    profession: 'Architect',
    text: 'Every wrong answer linked to the exact Wiki article.',
    avatar: 'KS',
  },
  {
    id: 7,
    name: 'Denise L.',
    profession: 'Architecture Student',
    text: 'Weak topics keep resurfacing until you own them.',
    avatar: 'DL',
  },
  {
    id: 8,
    name: 'Lorenzo Cruz',
    profession: 'Architect',
    text: 'Passed first attempt. Storm Mode was harder than the real thing.',
    avatar: 'RG',
  },
  {
    id: 9,
    name: 'Lizette Pedroso.',
    profession: 'Architect',
    text: 'Everything verified, everything in one place.',
    avatar: 'LP',
  },
  {
    id: 10,
    name: 'Justin A.',
    profession: 'CE Board Aspirant',
    text: 'Worth every peso if the CE track is like the ALE module.',
    avatar: 'JA',
  },
  {
    id: 11,
    name: 'Trisha E.',
    profession: 'ALE Reviewee',
    text: 'My review center gave content. SlateCamp gave certainty.',
    avatar: 'TE',
  },
  {
    id: 12,
    name: 'Carlos B.',
    profession: 'Architecture Graduate',
    text: 'The 3D Lab made MEPFS click. Literally rotate and see.',
    avatar: 'CB',
  },
  {
    id: 13,
    name: 'Samantha Y.',
    profession: 'Architecture Student',
    text: 'I study on the bus, before bed. Always ready.',
    avatar: 'SY',
  },
  {
    id: 14,
    name: 'David O.',
    profession: 'ALE Passer, 2025',
    text: 'Pacing gauge warned me. Fixed it before exam day.',
    avatar: 'DO',
  },
  {
    id: 15,
    name: 'Liza P.',
    profession: 'Architecture Student',
    text: 'Like a strict but caring professor at 2 AM.',
    avatar: 'LP',
  },
  {
    id: 16,
    name: 'Mark J.',
    profession: 'ALE Reviewee',
    text: '78% Readiness. Honest number. Made me study harder.',
    avatar: 'MJ',
  },
  {
    id: 17,
    name: 'Aira F.',
    profession: 'Architecture Graduate',
    text: 'AI tutor cited every source. No hallucinations.',
    avatar: 'AF',
  },
  {
    id: 18,
    name: 'Brent H.',
    profession: 'ALE Reviewee',
    text: 'Ten times more organized than a review center.',
    avatar: 'BH',
  },
]

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
    [0, 55], // mid-left, behind CTA
    [85, 45], // right side
    [45, 50], // center-top gap
    [80, 65], // center-right low
    [25, 40], // left of center
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
    <div className="flex gap-px">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="h-1.5 w-1.5"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          style={{ color: hexToRgba(SLATECAMP_AMBER.DEFAULT, 0.7) }}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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
        className="h-20 w-64 cursor-grab select-none overflow-hidden rounded-xl border px-3 py-2.5 shadow-sm backdrop-blur-md"
        style={{
          touchAction: 'none',
          borderColor: 'rgba(255,255,255,0.3)',
          backgroundColor: 'rgba(255,255,255,0.5)',
        }}
      >
        <div className="flex h-full items-start gap-2">
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[8px] font-bold"
            style={{
              background: `linear-gradient(to bottom right, ${SLATECAMP_PAPER.warm}, ${hexToRgba(SLATECAMP_AMBER.DEFAULT, 0.2)})`,
              color: hexToRgba(SLATECAMP_AMBER.DEFAULT, 0.8),
            }}
          >
            {config.testimonial.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold leading-none" style={{ color: hexToRgba(SLATECAMP_INK.main, 0.8) }}>
                {config.testimonial.name}
              </span>
              <MicroStars />
            </div>
            <p className="text-[8px] leading-none" style={{ color: SLATECAMP_INK.subtle }}>
              {config.testimonial.profession}
            </p>
            <p className="mt-1 line-clamp-2 text-[9px] leading-snug" style={{ color: hexToRgba(SLATECAMP_INK.muted, 0.7) }}>
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
