'use client'

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from 'react'
import Link from 'next/link'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from 'framer-motion'
import {
  BookOpen,
  CaretRight,
  ChartBar,
  Cube,
  Play,
  Target,
} from '@phosphor-icons/react/dist/ssr'
import { annotate, annotationGroup } from 'rough-notation'
import { AtlasAtmosphere } from '@/components/marketing/hero/AtlasFieldHero'
import { HeroHousePreview } from '@/components/marketing/hero/HeroHousePreview'
import {
  Starburst,
  NoiseOverlay,
} from '@/components/marketing/LandingPrimitives'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const FEATURE_PREVIEWS = [
  {
    id: 'knowledge-wiki',
    label: 'Knowledge Wiki',
    eyebrow: '01 / Knowledge',
    title: 'Knowledge Wiki',
    body: 'Find wiki notes, code explainers, and visual examples around the topic you are reviewing.',
    accent: 'bg-primary',
    icon: BookOpen,
    ring: 'hover:border-primary/28 hover:bg-primary/[0.08]',
    videoSrc: '',
  },
  {
    id: 'quizzes',
    label: 'Quizzes',
    eyebrow: '02 / Practice',
    title: 'Quizzes',
    body: 'Answer board-style questions and turn missed answers into clearer next topics.',
    accent: 'bg-camp-amber',
    icon: Target,
    ring: 'hover:border-camp-amber/35 hover:bg-camp-amber/[0.09]',
    videoSrc: '',
  },
  {
    id: 'three-d-lab',
    label: '3D Lab',
    eyebrow: '03 / Visual',
    title: '3D Lab',
    body: 'See spatial rules, assemblies, and code ideas as visual models instead of flat text only.',
    accent: 'bg-camp-green',
    icon: Cube,
    ring: 'hover:border-camp-green/35 hover:bg-camp-green/[0.08]',
    videoSrc: '',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    eyebrow: '04 / Direction',
    title: 'Analytics',
    body: 'Read weak-topic signals so the next study session has a specific target.',
    accent: 'bg-slate-700',
    icon: ChartBar,
    ring: 'hover:border-slate-700/24 hover:bg-slate-700/[0.06]',
    videoSrc: '',
  },
] as const

const LANDING_HERO_SHELL_CLASS =
  'mx-auto w-full max-w-[1240px] 2xl:max-w-[1440px] [@media(width>=1920px)]:max-w-[1760px] [@media(width>=2560px)]:max-w-[2200px] [@media(width>=3200px)]:max-w-[2600px]'

type FeaturePreview = (typeof FEATURE_PREVIEWS)[number]

const FEATURE_PREVIEW_GRID_VARIANTS: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.22,
      staggerChildren: 0.075,
    },
  },
}

const FEATURE_PREVIEW_CARD_VARIANTS: Variants = {
  hidden: {
    opacity: 0,
    y: 44,
    scale: 0.97,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.58,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

const FeatureIllustration = ({ feature }: { feature: FeaturePreview }) => {
  if (feature.id === 'knowledge-wiki') {
    return (
      <div className='relative h-16 overflow-hidden rounded-lg border border-primary/14 bg-[linear-gradient(135deg,rgba(27,63,196,0.12),rgba(255,255,255,0.55))] p-3'>
        <div className='h-2 w-20 rounded-full bg-primary/18' />
        <div className='mt-2 grid gap-1.5'>
          <span className='h-1.5 w-full rounded-full bg-slate-900/12' />
          <span className='h-1.5 w-10/12 rounded-full bg-slate-900/10' />
          <span className='h-1.5 w-7/12 rounded-full bg-camp-amber/30' />
        </div>
        <span className='absolute right-3 top-3 h-7 w-7 rounded-full border border-primary/16 bg-white/60' />
      </div>
    )
  }

  if (feature.id === 'quizzes') {
    return (
      <div className='relative h-16 overflow-hidden rounded-lg border border-camp-amber/18 bg-[radial-gradient(circle_at_70%_30%,rgba(232,133,58,0.22),transparent_32%),linear-gradient(135deg,rgba(232,133,58,0.14),rgba(255,255,255,0.55))] p-3'>
        <div className='grid grid-cols-3 gap-2'>
          <span className='h-8 rounded-md bg-white/62 shadow-inner shadow-white/80' />
          <span className='h-8 rounded-md bg-camp-amber/35 shadow-inner shadow-white/60' />
          <span className='h-8 rounded-md bg-white/62 shadow-inner shadow-white/80' />
        </div>
        <span className='absolute bottom-3 left-3 h-1.5 w-24 rounded-full bg-slate-900/12' />
      </div>
    )
  }

  if (feature.id === 'three-d-lab') {
    return (
      <div className='relative h-16 overflow-hidden rounded-lg border border-camp-green/18 bg-[linear-gradient(135deg,rgba(43,166,123,0.14),rgba(255,255,255,0.55))]'>
        <div className='absolute left-5 top-4 h-8 w-8 rotate-45 border border-camp-green/42 bg-camp-green/18 shadow-[14px_10px_0_rgba(43,166,123,0.12)]' />
        <div className='absolute right-4 top-3 grid gap-1.5'>
          <span className='h-1.5 w-12 rounded-full bg-slate-900/13' />
          <span className='h-1.5 w-16 rounded-full bg-slate-900/10' />
          <span className='h-1.5 w-9 rounded-full bg-camp-green/28' />
        </div>
        <span className='absolute bottom-3 left-4 right-4 h-px bg-camp-green/24' />
      </div>
    )
  }

  return (
    <div className='relative h-16 overflow-hidden rounded-lg border border-slate-900/10 bg-[linear-gradient(135deg,rgba(51,65,85,0.12),rgba(255,255,255,0.55))] p-3'>
      <div className='absolute bottom-3 left-3 right-3 flex items-end gap-2'>
        <span className='h-4 flex-1 rounded-t-md bg-slate-700/20' />
        <span className='h-8 flex-1 rounded-t-md bg-primary/22' />
        <span className='h-6 flex-1 rounded-t-md bg-camp-amber/28' />
        <span className='h-10 flex-1 rounded-t-md bg-camp-green/25' />
      </div>
      <span className='absolute left-3 top-3 h-1.5 w-20 rounded-full bg-slate-900/14' />
    </div>
  )
}

type HeroSectionStyle = CSSProperties & {
  '--hero-wave-opacity': string
  '--hero-wave-x': string
  '--hero-wave-y': string
  '--hero-wave-shift-x': string
  '--hero-wave-shift-y': string
}

const HALFTONE_IDLE_MS = 720

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const HeroBackground = ({
  sectionRef,
  shouldReduceMotion,
}: {
  sectionRef: React.RefObject<HTMLElement | null>
  shouldReduceMotion: boolean | null
}) => {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12])

  return (
    <motion.div
      aria-hidden='true'
      className='pointer-events-none absolute inset-[-6%] z-0 bg-cover bg-bottom bg-no-repeat opacity-90 brightness-[1.10] contrast-[0.92] grayscale-[12%] saturate-[0.86]'
      style={{
        backgroundImage: 'url(/images/dashboard/Dashboard-BG-Image.png)',
        ...(shouldReduceMotion ? {} : { scale }),
      }}
    />
  )
}

export const HeroSection = ({
  ctaHref,
  ctaLabel,
}: {
  ctaHref: string
  ctaLabel: string
}) => {
  const sectionRef = useRef<HTMLElement>(null)
  const phraseRef = useRef<HTMLSpanElement>(null)
  const winRef = useRef<HTMLSpanElement>(null)
  const lastPointerRef = useRef({ x: 0, y: 0 })
  const fadeTimerRef = useRef<number | null>(null)
  const [activeFeature, setActiveFeature] = useState<FeaturePreview | null>(
    null,
  )
  const shouldReduceMotion = useReducedMotion()

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType === 'touch') return

    const section = sectionRef.current
    if (!section) return

    const rect = section.getBoundingClientRect()
    const x = clamp(event.clientX - rect.left, 0, rect.width)
    const y = clamp(event.clientY - rect.top, 0, rect.height)
    const last = lastPointerRef.current
    const dx = clamp((x - last.x) * 0.08, -10, 10)
    const dy = clamp((y - last.y) * 0.08, -10, 10)

    section.style.setProperty('--hero-wave-x', `${x}px`)
    section.style.setProperty('--hero-wave-y', `${y}px`)
    section.style.setProperty('--hero-wave-shift-x', `${dx}px`)
    section.style.setProperty('--hero-wave-shift-y', `${dy}px`)
    section.style.setProperty('--hero-wave-opacity', '0.62')
    lastPointerRef.current = { x, y }

    if (fadeTimerRef.current !== null) window.clearTimeout(fadeTimerRef.current)
    fadeTimerRef.current = window.setTimeout(() => {
      section.style.setProperty('--hero-wave-opacity', '0')
    }, HALFTONE_IDLE_MS)
  }

  const handlePointerLeave = () => {
    const section = sectionRef.current
    if (!section) return
    if (fadeTimerRef.current !== null) window.clearTimeout(fadeTimerRef.current)
    section.style.setProperty('--hero-wave-opacity', '0')
  }

  useEffect(
    () => () => {
      if (fadeTimerRef.current !== null)
        window.clearTimeout(fadeTimerRef.current)
    },
    [],
  )

  useEffect(() => {
    let cancelled = false
    let resizeTimer: number | null = null
    let annotations: Array<ReturnType<typeof annotate>> = []

    const removeAnnotations = () => {
      annotations.forEach((annotation) => annotation.remove())
      annotations = []
    }

    const drawAnnotations = () => {
      if (cancelled || !phraseRef.current || !winRef.current) return

      removeAnnotations()

      const shouldAnimate = !window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      const underline = annotate(phraseRef.current, {
        type: 'underline',
        color: '#E8853A',
        strokeWidth: 3,
        padding: [1, 5],
        iterations: 2,
        animate: shouldAnimate,
        animationDuration: 720,
      })
      const circle = annotate(winRef.current, {
        type: 'circle',
        color: '#1B3FC4',
        strokeWidth: 3,
        padding: [9, 14],
        iterations: 2,
        animate: shouldAnimate,
        animationDuration: 920,
      })

      annotations = [underline, circle]
      annotationGroup(annotations).show()
    }

    const scheduleDraw = () => {
      if (resizeTimer !== null) window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(() => {
        window.requestAnimationFrame(drawAnnotations)
      }, 140)
    }

    const fontReady =
      'fonts' in document ? document.fonts.ready : Promise.resolve()
    fontReady.then(() => {
      if (!cancelled) window.requestAnimationFrame(drawAnnotations)
    })

    window.addEventListener('resize', scheduleDraw)

    return () => {
      cancelled = true
      if (resizeTimer !== null) window.clearTimeout(resizeTimer)
      window.removeEventListener('resize', scheduleDraw)
      removeAnnotations()
    }
  }, [])

  const heroStyle: HeroSectionStyle = {
    '--hero-wave-opacity': '0',
    '--hero-wave-x': '72%',
    '--hero-wave-y': '42%',
    '--hero-wave-shift-x': '0px',
    '--hero-wave-shift-y': '0px',
  }

  return (
    <section
      ref={sectionRef}
      aria-label='Supplementary architecture learning resource for Filipino students and LEA reviewees.'
      className='relative isolate min-h-[100svh] overflow-hidden bg-slate-50 px-6 pb-20 pt-32 text-slate-950 [--hero-feature-strip-height:19.875rem] sm:pt-36 xl:px-8 2xl:px-10 lg:min-h-[100svh] lg:pb-20 lg:pt-36 [@media(width>=1920px)]:px-12'
      style={heroStyle}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <HeroBackground
        sectionRef={sectionRef}
        shouldReduceMotion={shouldReduceMotion}
      />
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_74%_28%,rgba(148,163,184,0.14),transparent_34%),radial-gradient(circle_at_82%_74%,rgba(100,116,139,0.10),transparent_30%),linear-gradient(105deg,rgba(255,255,255,0.88)_0%,rgba(248,250,252,0.74)_36%,rgba(241,245,249,0.48)_64%,rgba(226,232,240,0.24)_100%),linear-gradient(180deg,rgba(255,255,255,0.74)_0%,rgba(248,250,252,0.46)_54%,rgba(71,85,105,0.20)_100%)]'
      />
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 z-0 hidden opacity-[var(--hero-wave-opacity)] mix-blend-multiply transition-opacity duration-500 ease-out motion-reduce:hidden md:block'
      >
        <div
          className='absolute inset-[-7%] bg-[radial-gradient(circle,rgba(15,23,42,0.38)_0_1.25px,transparent_1.9px)] [background-size:7px_7px] [mask-image:radial-gradient(circle_at_var(--hero-wave-x)_var(--hero-wave-y),black_0,rgba(0,0,0,0.9)_72px,rgba(0,0,0,0.44)_162px,transparent_282px)] [-webkit-mask-image:radial-gradient(circle_at_var(--hero-wave-x)_var(--hero-wave-y),black_0,rgba(0,0,0,0.9)_72px,rgba(0,0,0,0.44)_162px,transparent_282px)]'
          style={{
            transform:
              'translate3d(var(--hero-wave-shift-x), var(--hero-wave-shift-y), 0)',
          }}
        />
        <div
          className='absolute inset-0 bg-[repeating-radial-gradient(circle_at_var(--hero-wave-x)_var(--hero-wave-y),rgba(15,23,42,0.20)_0_1.2px,transparent_2px_20px)] opacity-80 [mask-image:radial-gradient(circle_at_var(--hero-wave-x)_var(--hero-wave-y),black_0,rgba(0,0,0,0.62)_138px,transparent_312px)] [-webkit-mask-image:radial-gradient(circle_at_var(--hero-wave-x)_var(--hero-wave-y),black_0,rgba(0,0,0,0.62)_138px,transparent_312px)]'
          style={{
            transform:
              'translate3d(calc(var(--hero-wave-shift-x) * -0.45), calc(var(--hero-wave-shift-y) * -0.45), 0)',
          }}
        />
      </div>
      <AtlasAtmosphere />
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.04)_48%,rgba(15,23,42,0.20)_100%)]'
      />
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 z-0 opacity-[0.16] [background-image:radial-gradient(circle_at_center,rgba(15,23,42,0.36)_1px,transparent_1px)] [background-size:12px_12px]'
      />
      <NoiseOverlay opacity={0.028} />

      <div className={`${LANDING_HERO_SHELL_CLASS} relative z-10 grid min-h-[calc(100svh-18rem)] -translate-y-4 items-start gap-10 pb-40 sm:-translate-y-5 md:translate-y-0 md:pb-48 lg:min-h-[calc(100svh-20rem)] lg:grid-cols-[minmax(0,700px)_minmax(340px,500px)] lg:-translate-y-1 lg:pb-60 2xl:grid-cols-[minmax(0,760px)_minmax(460px,620px)] 2xl:gap-14 [@media(width>=1920px)]:grid-cols-[minmax(0,820px)_minmax(520px,760px)] [@media(width>=1920px)]:gap-20 [@media(width>=2560px)]:grid-cols-[minmax(0,920px)_minmax(680px,940px)] [@media(width>=2560px)]:gap-24 [@media(width>=3200px)]:grid-cols-[minmax(0,1040px)_minmax(760px,1120px)] [@media(width>=3200px)]:gap-28`}>
        <div className='max-w-[760px] py-8 lg:py-12 [@media(width>=1920px)]:max-w-[820px]'>
          <div className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 flex items-center gap-2'>
            <Starburst className='h-3 w-3 text-primary' />
            <span className='font-[family-name:var(--font-dm-mono)] text-[12px] font-semibold uppercase tracking-[0.24em] text-primary'>
              Architecture Resource Camp
            </span>
          </div>

          <h1
            aria-label='Know you’ll win.'
            className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:delay-100 motion-safe:duration-300 mt-6 max-w-none whitespace-nowrap font-[family-name:var(--font-display)] text-[clamp(2.2rem,10.65vw,6rem)] font-extrabold leading-[0.94] tracking-[-0.038em] text-slate-950 sm:text-[clamp(3rem,7.2vw,6rem)]'
          >
            <span className='relative inline-block pb-3'>
              <span className='relative z-10 text-slate-950 drop-shadow-[0_18px_38px_rgba(15,23,42,0.14)]'>
                <span ref={phraseRef} className='relative inline-block'>
                  <span className='relative inline-block'>Know</span>{' '}
                  <span>you’ll</span>{' '}
                  <span ref={winRef} className='relative inline-block'>
                    win
                  </span>
                </span>
                .
              </span>
              <span
                aria-hidden='true'
                className='absolute -inset-x-4 -inset-y-2 -z-10 rounded-lg bg-[radial-gradient(circle_at_70%_46%,rgba(51,65,85,0.14),transparent_34%),linear-gradient(90deg,transparent,rgba(255,255,255,0.30),transparent)] blur-xl'
              />
            </span>
          </h1>

          <p className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:delay-200 motion-safe:duration-300 mt-7 max-w-[560px] text-[16px] font-semibold leading-[1.48] text-slate-700 sm:text-[17px] [@media(width>=1920px)]:max-w-[620px]'>
            SlateCamp shows you how PD 1096, RA 9514, and BP 344 actually work —
            in 3D, with quizzes that explain why, and a quick free check that
            points you to what to study next.
          </p>

          <div className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:delay-300 motion-safe:duration-300 mt-7 flex flex-wrap items-center gap-3'>
            <Link
              href={ctaHref}
              className='inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-sm bg-primary px-7 py-3 text-[14px] font-bold text-white shadow-lg shadow-primary-200/50 transition-all duration-150 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/45 focus-visible:ring-offset-2 focus-visible:ring-offset-white'
            >
              {ctaLabel} <SCIcon icon={CaretRight} size='md' />
            </Link>
          </div>

          <p className='motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:delay-500 motion-safe:duration-300 mt-4 max-w-[360px] text-[12px] font-semibold leading-relaxed text-slate-500'>
            Free
          </p>
        </div>
      </div>

      <div className='pointer-events-none absolute inset-x-6 bottom-[calc(0.5rem+var(--hero-feature-strip-height))] top-[8.75rem] z-30 hidden lg:block xl:inset-x-8 2xl:inset-x-10 [@media(width>=1920px)]:inset-x-12'>
        <div className={`${LANDING_HERO_SHELL_CLASS} h-full`}>
          <div className='pointer-events-auto ml-auto h-full w-full max-w-[500px] min-w-[340px] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:delay-500 motion-safe:duration-500 2xl:max-w-[620px] [@media(width>=1920px)]:max-w-[760px] [@media(width>=2560px)]:max-w-[940px] [@media(width>=3200px)]:max-w-[1120px]'>
            <HeroHousePreview />
          </div>
        </div>
      </div>

      <div
        aria-label='SlateCamp feature video launcher'
        className='absolute inset-x-6 bottom-2 z-20 hidden h-[var(--hero-feature-strip-height)] md:block xl:inset-x-8 2xl:inset-x-10 [@media(width>=1920px)]:inset-x-12'
      >
        <div className={LANDING_HERO_SHELL_CLASS}>
          <div className='overflow-hidden rounded-t-lg border border-b-0 border-white/46 bg-white/[0.22] shadow-[0_28px_90px_rgba(15,23,42,0.14)] ring-1 ring-slate-900/[0.035] backdrop-blur-2xl transition-opacity duration-200 [mask-image:linear-gradient(to_bottom,black_0%,black_48%,rgba(0,0,0,0.82)_63%,rgba(0,0,0,0.45)_80%,rgba(0,0,0,0.12)_93%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,black_48%,rgba(0,0,0,0.82)_63%,rgba(0,0,0,0.45)_80%,rgba(0,0,0,0.12)_93%,transparent_100%)]'>
            <div className='flex items-center justify-between border-b border-white/34 bg-white/[0.28] px-4 py-1.5'>
              <div className='flex items-center gap-1.5'>
                <span className='h-2 w-2 rounded-full bg-camp-amber/80' />
                <span className='h-2 w-2 rounded-full bg-primary/45' />
                <span className='h-2 w-2 rounded-full bg-camp-green/55' />
              </div>
              <div className='rounded-full border border-slate-900/8 bg-white/50 px-3 py-1 font-[family-name:var(--font-dm-mono)] text-[8px] font-bold uppercase tracking-[0.18em] text-slate-500'>
                feature previews
              </div>
              <div className='hidden w-[56px] justify-end gap-1.5 lg:flex'>
                <span className='h-1.5 w-4 rounded-full bg-slate-900/15' />
                <span className='h-1.5 w-2.5 rounded-full bg-slate-900/10' />
              </div>
            </div>
            <TooltipProvider delay={0}>
              <motion.div
                className='grid gap-2 p-3 pb-12 md:grid-cols-4 2xl:gap-3 2xl:p-4 2xl:pb-12 [@media(width>=1920px)]:gap-4'
                variants={FEATURE_PREVIEW_GRID_VARIANTS}
                initial={shouldReduceMotion ? false : 'hidden'}
                animate='visible'
              >
                {FEATURE_PREVIEWS.map((feature) => (
                  <motion.div
                    key={feature.id}
                    className='h-full'
                    data-testid={`hero-feature-card-motion-${feature.id}`}
                    data-motion='bottom-up-stagger'
                    variants={FEATURE_PREVIEW_CARD_VARIANTS}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type='button'
                          aria-label={`Play ${feature.label} feature video`}
                          onClick={() => setActiveFeature(feature)}
                          className={`group relative flex h-full min-h-[184px] w-full cursor-pointer flex-col justify-between rounded-lg border border-white/40 bg-white/30 p-4 text-left opacity-[0.72] shadow-inner shadow-white/45 transition duration-150 hover:-translate-y-0.5 hover:border-white/56 hover:bg-white/44 hover:opacity-100 hover:shadow-[0_18px_42px_rgba(15,23,42,0.12)] focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${feature.ring}`}
                        >
                          <div>
                            <div className='mb-3 flex items-center justify-between gap-3 font-[family-name:var(--font-dm-mono)] text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500'>
                              <span className='inline-flex items-center gap-2'>
                                <span
                                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${feature.accent} text-white shadow-sm shadow-slate-900/10`}
                                >
                                  <SCIcon
                                    icon={feature.icon}
                                    size='xs'
                                    weight='bold'
                                  />
                                </span>
                                <span>{feature.eyebrow}</span>
                              </span>
                              <span
                                className='relative inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-rose-200/70 bg-white/72 text-rose-400 shadow-[0_8px_18px_rgba(148,76,76,0.12)] transition group-hover:scale-105 group-hover:border-rose-300/80 group-hover:bg-white/88 group-hover:text-rose-500'
                                aria-hidden='true'
                              >
                                <SCIcon icon={Play} size='xs' weight='fill' />
                              </span>
                            </div>
                            <p className='text-[16px] font-extrabold leading-tight text-slate-950'>
                              {feature.title}
                            </p>
                            <p className='mt-2 line-clamp-2 text-[11px] font-medium leading-relaxed text-slate-600'>
                              {feature.body}
                            </p>
                          </div>
                          <div className='mt-4'>
                            <FeatureIllustration feature={feature} />
                          </div>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side='top'
                        sideOffset={16}
                        className='max-w-none w-[300px] overflow-hidden rounded-lg border border-slate-200/50 bg-white p-0 text-slate-950 shadow-[0_24px_60px_rgba(15,23,42,0.16)] data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-bottom-2 data-open:zoom-in-95 data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0 data-[state=delayed-open]:slide-in-from-bottom-2 data-[state=delayed-open]:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95'
                        arrowClassName='bg-white fill-white'
                      >
                        <div className='flex'>
                          <div className='relative w-[150px] flex-shrink-0 overflow-hidden aspect-[4/3]'>
                            <div
                              className={cn('absolute inset-0', feature.accent)}
                            />
                            <div className='absolute inset-0 bg-gradient-to-br from-white/25 to-black/10' />
                            <div className='relative flex h-full items-center justify-center'>
                              <SCIcon
                                icon={feature.icon}
                                size='2xl'
                                weight='fill'
                                className='text-white drop-shadow-md'
                              />
                            </div>
                          </div>
                          <div className='flex flex-1 flex-col justify-center p-4'>
                            <p className='text-[13px] font-extrabold leading-tight text-slate-950'>
                              {feature.title}
                            </p>
                            <p className='mt-1.5 text-[11px] font-medium leading-relaxed text-slate-600'>
                              {feature.body}
                            </p>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </motion.div>
                ))}
              </motion.div>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <Dialog
        open={activeFeature !== null}
        onOpenChange={(open) => {
          if (!open) setActiveFeature(null)
        }}
      >
        <DialogContent
          size='full'
          className='z-[81] max-h-[calc(100vh-48px)] overflow-hidden rounded-lg border-white/60 bg-white p-0 shadow-[0_30px_100px_rgba(15,23,42,0.28)] sm:max-w-3xl'
          overlayClassName='z-[80] bg-slate-950/45 backdrop-blur-sm'
        >
          {activeFeature ? (
            <>
              <DialogHeader
                closeAriaLabel='Close feature video'
                className='items-start gap-4 border-slate-900/10 px-5 py-4'
              >
                <p className='font-[family-name:var(--font-dm-mono)] text-[10px] font-bold uppercase tracking-[0.18em] text-primary/70'>
                  Feature walkthrough
                </p>
                <DialogTitle className='mt-1 overflow-visible whitespace-normal text-clip text-2xl font-extrabold tracking-[-0.02em] text-slate-950'>
                  {activeFeature.title}
                </DialogTitle>
                <DialogDescription className='mt-1 max-w-xl text-sm font-medium leading-relaxed text-slate-600'>
                  {activeFeature.body}
                </DialogDescription>
              </DialogHeader>
              <DialogBody className='bg-slate-950 p-4'>
                {activeFeature.videoSrc ? (
                  <video
                    className='aspect-video w-full rounded-lg bg-black'
                    controls
                    autoPlay
                    src={activeFeature.videoSrc}
                  />
                ) : (
                  <div className='flex aspect-video w-full flex-col items-center justify-center rounded-lg border border-white/12 bg-[radial-gradient(circle_at_50%_36%,rgba(255,255,255,0.14),transparent_30%),linear-gradient(135deg,rgba(27,63,196,0.24),rgba(15,23,42,0.96))] text-center text-white'>
                    <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/25 bg-white/10 text-2xl'>
                      ▶
                    </div>
                    <p className='text-lg font-extrabold'>
                      {activeFeature.title} video placeholder
                    </p>
                    <p className='mt-2 max-w-sm text-sm font-medium leading-relaxed text-white/64'>
                      Add the feature video source later; this modal is wired
                      for playback.
                    </p>
                  </div>
                )}
              </DialogBody>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      <div
        aria-label='SlateCamp reassurance bridge'
        className='pointer-events-none absolute bottom-[4.9rem] left-1/2 z-30 hidden -translate-x-1/2 items-center gap-3 text-nowrap rounded-full border border-white/45 bg-white/[0.18] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-700 shadow-[0_14px_48px_rgba(15,23,42,0.10)] ring-1 ring-slate-900/[0.035] backdrop-blur-2xl md:flex'
      >
        <span>Wiki notes</span>
        <span
          aria-hidden='true'
          className='h-1 w-1 rounded-full bg-camp-amber/80'
        />
        <span>Visual explainers</span>
        <span
          aria-hidden='true'
          className='h-1 w-1 rounded-full bg-camp-amber/80'
        />
        <span>Practice questions</span>
      </div>

      <a
        href='#after-hero'
        aria-label='Scroll to the next section'
        className='group absolute bottom-5 left-1/2 z-20 inline-flex h-[50px] w-8 -translate-x-1/2 flex-col items-center overflow-hidden rounded-full border border-white/55 bg-white/[0.28] text-slate-700 shadow-[0_12px_38px_rgba(15,23,42,0.14)] ring-1 ring-slate-900/[0.04] backdrop-blur-2xl transition hover:border-white/75 hover:bg-white/[0.42] hover:text-slate-950 hover:shadow-[0_16px_48px_rgba(15,23,42,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/35'
      >
        <span
          aria-hidden='true'
          className='absolute inset-[3px] rounded-full bg-linear-to-b from-white/72 via-white/22 to-slate-900/[0.04] [mask-image:linear-gradient(to_bottom,black_0%,rgba(0,0,0,0.82)_70%,rgba(0,0,0,0.42)_100%)] [-webkit-mask-image:linear-gradient(to_bottom,black_0%,rgba(0,0,0,0.82)_70%,rgba(0,0,0,0.42)_100%)]'
        />
        <span
          aria-hidden='true'
          className='relative mt-2.5 h-1 w-1 rounded-full bg-slate-700/55 transition group-hover:bg-slate-950/70'
        />
        <span
          aria-hidden='true'
          className='motion-safe:animate-bounce relative mb-2.5 mt-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/[0.22]'
        >
          <svg
            viewBox='0 0 24 24'
            className='h-3.5 w-3.5'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M7 10l5 5 5-5' />
          </svg>
        </span>
      </a>
    </section>
  )
}
