'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { Eye, Pause, Play } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const CampSceneCanvas = dynamic(
  () => import('./CampSceneCanvas').then((mod) => mod.CampSceneCanvas),
  {
    ssr: false,
    loading: () => <CampSceneFallback label='Preparing camp map...' />,
  },
)

const HOTSPOTS = [
  {
    id: 'campfire',
    label: 'Learn together',
    body: 'Discussion, notes, and reflection keep momentum visible.',
  },
  {
    id: 'trail',
    label: 'Follow structured paths',
    body: 'Move through LEA topics with a guided sequence instead of a scattered checklist.',
  },
  {
    id: 'lake',
    label: 'Reflect and review',
    body: 'Use progress signals to decide what needs another pass.',
  },
  {
    id: 'summit',
    label: 'Track mastery',
    body: 'Readiness and subject coverage show the next climb clearly.',
  },
  {
    id: 'shore',
    label: 'Launch your next goal',
    body: 'Turn review progress into confident exam-day action.',
  },
] as const

export type CampHotspotId = (typeof HOTSPOTS)[number]['id']

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)

    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  return reducedMotion
}

function useWebGLSupported() {
  const [supported, setSupported] = useState<boolean | null>(null)

  useEffect(() => {
    const canvas = document.createElement('canvas')

    try {
      setSupported(
        Boolean(
          canvas.getContext('webgl2') ||
            canvas.getContext('webgl') ||
            canvas.getContext('experimental-webgl'),
        ),
      )
    } catch {
      setSupported(false)
    }
  }, [])

  return supported
}

export function HeroCampScene() {
  const reducedMotion = usePrefersReducedMotion()
  const webglSupported = useWebGLSupported()
  const [paused, setPaused] = useState(false)
  const [activeHotspot, setActiveHotspot] = useState<CampHotspotId>('campfire')
  const showCanvas = webglSupported === true && reducedMotion === false
  const animate = showCanvas && !paused
  const active = useMemo(
    () => HOTSPOTS.find((hotspot) => hotspot.id === activeHotspot) ?? HOTSPOTS[0],
    [activeHotspot],
  )

  return (
    <div
      className='relative min-h-[420px] overflow-hidden rounded-lg border border-white/15 text-white shadow-[0_24px_80px_rgba(16,24,40,0.22)] md:min-h-[640px]'
      style={{ backgroundColor: '#172235' }}
    >
      <div
        className='absolute inset-0'
        style={{
          background:
            'radial-gradient(circle at 20% 15%, rgba(232,133,58,0.20), transparent 32%), linear-gradient(180deg, #25364d 0%, #182235 48%, #101724 100%)',
        }}
      />

      {showCanvas ? (
        <CampSceneCanvas
          animate={animate}
          activeHotspot={activeHotspot}
          onHotspotChange={setActiveHotspot}
        />
      ) : (
        <CampSceneFallback
          label={
            reducedMotion
              ? 'Reduced-motion camp map'
              : webglSupported === false
                ? 'Graphics fallback camp map'
                : 'Preparing camp map'
          }
        />
      )}

      <div className='pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 p-4'>
        <div className='rounded-md border border-white/15 bg-white/10 px-3 py-2 backdrop-blur-md'>
          <p className='text-[11px] font-bold uppercase text-white/60'>Interactive map</p>
          <p className='mt-1 max-w-[210px] text-[13px] leading-snug text-white'>
            Basecamp, trails, lake review, summit goals, and launch shore.
          </p>
        </div>
        {showCanvas && (
          <button
            type='button'
            onClick={() => setPaused((value) => !value)}
            className='pointer-events-auto inline-flex items-center gap-2 rounded-sm border border-white/20 bg-white/10 px-3 py-2 text-[12px] font-bold text-white backdrop-blur-md transition-colors duration-150 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80'
            aria-pressed={paused}
          >
            {paused ? <Play size={14} weight='bold' /> : <Pause size={14} weight='bold' />}
            {paused ? 'Resume' : 'Pause'}
          </button>
        )}
      </div>

      <div className='absolute inset-x-4 bottom-4 z-10 grid gap-3 md:grid-cols-[1fr_auto] md:items-end'>
        <div
          className='rounded-md border border-white/15 p-4 backdrop-blur-xl'
          style={{ backgroundColor: 'rgba(16, 23, 36, 0.8)' }}
        >
          <div className='flex items-center gap-2 text-[11px] font-bold uppercase text-white/55'>
            <Eye size={14} weight='bold' />
            Current camp stop
          </div>
          <h3 className='mt-2 text-[18px] font-bold text-white'>{active.label}</h3>
          <p className='mt-1 max-w-xl text-[13px] leading-relaxed text-white/70'>{active.body}</p>
        </div>

        <div
          className='grid grid-cols-2 gap-2 rounded-md border border-white/15 bg-white/10 p-2 backdrop-blur-xl sm:grid-cols-5 md:w-[440px]'
          aria-label='Camp map hotspots'
        >
          {HOTSPOTS.map((hotspot) => (
            <button
              key={hotspot.id}
              type='button'
              onClick={() => setActiveHotspot(hotspot.id)}
              className={cn(
                'rounded-sm px-2 py-2 text-left text-[11px] font-bold leading-tight text-white/70 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80',
                activeHotspot === hotspot.id
                  ? 'bg-white text-ink'
                  : 'hover:bg-white/10 hover:text-white',
              )}
            >
              {hotspot.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CampSceneFallback({ label }: { label: string }) {
  return (
    <div className='absolute inset-0 overflow-hidden' role='img' aria-label={label}>
      <div className='absolute inset-x-0 bottom-0 h-[58%]' style={{ backgroundColor: '#294f38' }} />
      <div className='absolute bottom-[34%] left-[8%] h-32 w-32 rotate-45 rounded-sm' style={{ backgroundColor: '#334256' }} />
      <div className='absolute bottom-[37%] left-[22%] h-44 w-44 rotate-45 rounded-sm' style={{ backgroundColor: '#3f5063' }} />
      <div className='absolute bottom-[36%] right-[12%] h-36 w-36 rotate-45 rounded-sm' style={{ backgroundColor: '#334256' }} />
      <div className='absolute bottom-[18%] left-[8%] h-12 w-[72%] -rotate-6 rounded-full opacity-80' style={{ backgroundColor: '#d4b27a' }} />
      <div className='absolute bottom-[13%] right-[12%] h-28 w-48 rounded-[50%] opacity-90' style={{ backgroundColor: '#4a94a5' }} />
      <div className='absolute bottom-[18%] right-[4%] h-16 w-40 rounded-[50%]' style={{ backgroundColor: '#d8c08a' }} />
      <div className='absolute bottom-[24%] left-[40%] h-20 w-20 rounded-full bg-camp-orange/80 blur-xl' />
      <div className='absolute bottom-[28%] left-[45%] h-12 w-8 rounded-t-full' style={{ backgroundColor: '#f2a44d' }} />
      <div className='absolute bottom-[25%] left-[17%] h-20 w-10' style={{ backgroundColor: '#29523b' }} />
      <div className='absolute bottom-[30%] left-[15%] h-16 w-16 rotate-45' style={{ backgroundColor: '#3f7c55' }} />
      <div className='absolute bottom-[24%] right-[28%] h-20 w-10' style={{ backgroundColor: '#29523b' }} />
      <div className='absolute bottom-[29%] right-[26%] h-16 w-16 rotate-45' style={{ backgroundColor: '#4b8a5f' }} />
      <div className='absolute bottom-[22%] left-[56%] h-20 w-28 rounded-sm' style={{ backgroundColor: '#885d3d' }} />
      <div className='absolute bottom-[34%] left-[54%] h-16 w-32 rotate-6 rounded-sm' style={{ backgroundColor: '#d9ad67' }} />
    </div>
  )
}
