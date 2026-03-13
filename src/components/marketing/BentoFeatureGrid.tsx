import { Instrument_Serif } from 'next/font/google'
import {
  Starburst,
  Pill,
  CircleArrow,
} from '@/components/marketing/LandingPrimitives'

const serif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  style: ['normal', 'italic'],
  display: 'swap',
})

/* ── Quiz answer mockup ── */

const QuizMockup = () => (
  <div className="space-y-2" aria-hidden="true">
    <div className="rounded-lg border border-zinc-200 bg-white/60 px-4 py-2.5">
      <div className="flex items-center gap-3">
        <div className="h-3.5 w-3.5 shrink-0 rounded-full border border-zinc-300" />
        <div className="h-2 w-3/4 rounded-full bg-zinc-200" />
      </div>
    </div>
    <div className="rounded-lg border border-green-300 bg-green-50 px-4 py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
          <svg className="h-2 w-2" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="h-2 w-2/3 rounded-full bg-green-200" />
      </div>
    </div>
    <div className="rounded-lg border border-zinc-200 bg-white/60 px-4 py-2.5">
      <div className="flex items-center gap-3">
        <div className="h-3.5 w-3.5 shrink-0 rounded-full border border-zinc-300" />
        <div className="h-2 w-5/6 rounded-full bg-zinc-200" />
      </div>
    </div>
    <div className="rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white">
          <svg className="h-2 w-2" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="h-2 w-1/2 rounded-full bg-zinc-300" />
      </div>
    </div>
  </div>
)

/* ── Subject mastery bars ── */

const SUBJECTS = [
  { name: 'Structural Design', pct: 85, tone: 'good' as const },
  { name: 'Building Technology', pct: 62, tone: 'neutral' as const },
  { name: 'Architectural Theory', pct: 41, tone: 'neutral' as const },
  { name: 'History of Arch.', pct: 73, tone: 'neutral' as const },
  { name: 'Utilities (MEPFS)', pct: 88, tone: 'good' as const },
] as const

const MasteryBars = () => (
  <div className="space-y-3" aria-hidden="true">
    {SUBJECTS.map((s) => (
      <div key={s.name}>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] text-white/40">{s.name}</span>
          <span className="font-mono text-[11px] text-white/70">
            {s.pct}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full rounded-full ${
              s.tone === 'good' ? 'bg-green-400' : 'bg-blue-400'
            }`}
            style={{ width: `${s.pct}%` }}
          />
        </div>
      </div>
    ))}
  </div>
)

/* ── Inline readiness ring (used in Analytics & Engine cards) ── */

const RING_R = 36
const RING_C = 2 * Math.PI * RING_R
const RING_OFFSET = RING_C - (78 / 100) * RING_C

const ReadinessRingSvg = ({
  size = 'h-24 w-24',
}: {
  size?: string
}) => (
  <svg
    viewBox='0 0 100 100'
    className={size}
    aria-hidden='true'
  >
    <circle
      cx='50'
      cy='50'
      r={RING_R}
      fill='none'
      stroke='rgba(255,255,255,0.06)'
      strokeWidth='5'
    />
    <circle
      cx='50'
      cy='50'
      r={RING_R}
      fill='none'
      stroke='#E4E4E7'
      strokeWidth='5'
      strokeDasharray={RING_C}
      strokeDashoffset={RING_OFFSET}
      strokeLinecap='round'
      transform='rotate(-90 50 50)'
    />
    <text
      x='50'
      y='47'
      textAnchor='middle'
      fill='white'
      fontSize='22'
      fontWeight='700'
      fontFamily='system-ui, sans-serif'
    >
      78
    </text>
    <text
      x='50'
      y='62'
      textAnchor='middle'
      fill='rgba(255,255,255,0.3)'
      fontSize='7'
      letterSpacing='0.15em'
      fontFamily='system-ui, sans-serif'
    >
      READINESS
    </text>
  </svg>
)

/* ── Heatmap cell colors ── */

const HEATMAP_COLORS = [
  'bg-green-500',
  'bg-green-500',
  'bg-blue-600',
  'bg-blue-600',
  'bg-green-500',
  'bg-zinc-500',
  'bg-blue-600',
  'bg-green-500',
  'bg-green-500',
  'bg-blue-600',
  'bg-blue-600',
  'bg-green-500',
  'bg-zinc-500',
  'bg-blue-600',
  'bg-blue-600',
  'bg-green-500',
  'bg-green-500',
  'bg-blue-600',
  'bg-green-500',
  'bg-blue-600',
  'bg-zinc-500',
  'bg-blue-600',
  'bg-blue-600',
  'bg-green-500',
] as const

/* ── Main Export ── */

export const BentoFeatureGrid = () => (
  <section
    id='features'
    aria-labelledby='features-heading'
    className='relative px-6 py-8'
  >
    <div className='relative z-10 mx-auto max-w-[1200px]'>
      <h2 id='features-heading' className='sr-only'>
        Features
      </h2>

      {/* Top row: 3 cols, side cards span 2 rows */}
        <div className='grid grid-cols-1 gap-3 md:grid-cols-3 md:grid-rows-2'>
        {/* REVIEW MODE */}
        <div className="landing-reveal landing-delay-1 flex flex-col justify-between rounded-2xl bg-zinc-900 p-7 text-white transition-all duration-150 hover:-translate-y-0.5 md:col-start-1 md:row-span-2 md:row-start-1 md:min-h-[480px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
                [ Review Mode ]
              </span>
              <span className="text-amber-500">
                <Starburst className="h-4 w-4" />
              </span>
            </div>
            <h3 className="mt-12 text-[26px] font-semibold leading-tight tracking-tight text-white">
              Doomscroll Your Way
              <br />
              to Mastery
            </h3>
            <p
              className={`${serif.className} mt-2 text-[16px] italic leading-snug text-white/60`}
            >
              Zero-pressure active recall. No timer. No analytics. Just you and
              the material.
            </p>
          </div>
          <div className='mt-6'>
            <QuizMockup />
            <div className='mt-6 flex items-end justify-between'>
              <div className='flex gap-2'>
                <Pill variant='dark'>Active Recall</Pill>
                <Pill variant='dark'>Stress-Free</Pill>
              </div>
              <CircleArrow variant='dark' />
            </div>
          </div>
        </div>

        {/* STAT: 84% fail rate */}
        <div
          className="landing-reveal landing-delay-2 flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm transition-all duration-150 hover:-translate-y-0.5 md:col-start-2 md:row-start-1"
        >
          <span className="text-amber-600">
            <Starburst className="h-4 w-4" />
          </span>
          <div className="mt-8">
            <span className="text-[72px] font-extrabold leading-none tracking-tighter text-zinc-900">
              84%
            </span>
            <p className="mt-3 max-w-[220px] text-[13px] leading-relaxed text-zinc-600">
              of architecture examinees don&apos;t pass — but data-driven study
              can increase pass rates by 30%.
            </p>
          </div>
        </div>

        {/* ANALYTICS */}
        <div className="landing-reveal landing-delay-3 flex flex-col justify-between rounded-2xl bg-zinc-900 p-7 text-white transition-all duration-150 hover:-translate-y-0.5 md:col-start-3 md:row-span-2 md:row-start-1 md:min-h-[480px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
                [ Analytics ]
              </span>
              <CircleArrow variant="dark" />
            </div>
            <h3 className="mt-12 text-[26px] font-semibold leading-tight tracking-tight text-white">
              Your Readiness,
              <br />
              Quantified
            </h3>
            <p
              className={`${serif.className} mt-2 text-[16px] italic leading-snug text-white/60`}
            >
              Taxonomy heatmap shows exactly where you stand. Every node. Every
              weakness. No hiding.
            </p>
          </div>
          <div className='mt-6'>
            <div className='flex items-center gap-5'>
              <ReadinessRingSvg />
              <div className='flex-1'>
                <div className='grid grid-cols-6 gap-1.5' aria-hidden='true'>
                  {HEATMAP_COLORS.map((colorClass, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-[3px] opacity-70 ${colorClass}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className='mt-4 flex gap-2'>
              <Pill variant='dark'>IRT-Calibrated</Pill>
              <Pill variant='dark'>EMA-Weighted</Pill>
            </div>
          </div>
        </div>

        {/* QUOTE */}
        <div
          className="landing-reveal landing-delay-4 flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm transition-all duration-150 hover:-translate-y-0.5 md:col-start-2 md:row-start-2"
        >
          <p
            className={`${serif.className} text-[19px] italic leading-snug text-zinc-900`}
          >
            &ldquo;Trust the camp, put in the reps, and we will eliminate the{' '}
            <span className='relative inline-block'>
              doubt.
              <svg
                className='pointer-events-none absolute'
                style={{
                  left: '-6px',
                  top: '-3px',
                  width: 'calc(100% + 12px)',
                  height: 'calc(100% + 6px)',
                }}
                viewBox='0 0 100 40'
                preserveAspectRatio='none'
                fill='none'
                aria-hidden='true'
              >
                <ellipse
                  cx='50'
                  cy='20'
                  rx='47'
                  ry='17'
                  stroke='#18181B'
                  strokeWidth='2'
                />
              </svg>
            </span>
            &rdquo;
          </p>
          <div className='mt-6 flex justify-end'>
            <CircleArrow variant='light' />
          </div>
        </div>
      </div>

      {/* Bottom row: 3 equal columns */}
      <div className='mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3'>
        {/* 3D LAB */}
        <div className="landing-reveal landing-delay-5 flex flex-col justify-between rounded-2xl bg-zinc-900 p-7 text-white transition-all duration-150 hover:-translate-y-0.5 hover:brightness-110">
          <div className="flex items-center justify-between">
            <h3 className="text-[22px] font-semibold leading-tight tracking-tight">
              3D Lab
            </h3>
            <span className="text-white/60">
              <Starburst className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-14">
            <p
              className={`${serif.className} text-[17px] italic leading-snug text-white/80`}
            >
              Visual learning,
              <br />
              built different.
            </p>
            <p className="mt-3 text-[12px] leading-relaxed text-white/60">
              WebGL-powered models. Parametric sandbox. Drag Floor Area Ratio —
              model responds in real time.
            </p>
            <div className='mt-4 flex items-center justify-between'>
              <Pill variant='dark'>3D Models</Pill>
              <CircleArrow variant='dark' />
            </div>
          </div>
        </div>

        {/* SESSIONS MODE */}
        <div className="landing-reveal landing-delay-5 flex flex-col justify-between rounded-2xl bg-zinc-900 p-7 text-white transition-all duration-150 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
              [ Sessions ]
            </span>
            <CircleArrow variant="dark" />
          </div>
          <div className="mt-10">
            <h3 className="text-[22px] font-semibold leading-tight tracking-tight text-white">
              Every Answer
              <br />
              Tracked
            </h3>
            <p className="mt-3 text-[13px] leading-relaxed text-white/60">
              Timed quizzes with full analytics. Track performance across
              domains. Watch your readiness score climb.
            </p>
            <div className='mt-4 flex gap-2'>
              <Pill variant='dark'>Camp Mode</Pill>
              <Pill variant='dark'>Storm Mode</Pill>
            </div>
          </div>
        </div>

        {/* AI-ADAPTIVE */}
        <div className="landing-reveal landing-delay-6 flex flex-col justify-between rounded-2xl bg-zinc-900 p-7 text-white transition-all duration-150 hover:-translate-y-0.5">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-white/40">
            [ Bounded Intelligence ]
          </span>
          <div className="mt-10">
            <h3 className="text-[22px] font-semibold leading-tight tracking-tight text-white">
              AI That Cites
              <br />
              Its Sources
            </h3>
            <p className="mt-3 text-[13px] leading-relaxed text-white/60">
              Tethered to our verified database. Temperature 0.0. Every response
              links to its exact source. If it&apos;s not in the database, it
              says so.
            </p>
            <div className='mt-4 flex gap-2'>
              <Pill variant='dark'>Zero-Hallucination</Pill>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width analytics showcase */}
      <div className="landing-reveal mt-3 rounded-2xl bg-zinc-900 p-8 text-white">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-amber-500">
              The Engine
            </span>
            <h3 className="mt-4 text-[28px] font-semibold leading-tight tracking-tight text-white">
              AI-Adaptive Learning
            </h3>
            <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/60">
              Item Response Theory adjusts question difficulty to your exact
              ability level. Spaced repetition schedules reviews at the
              mathematically optimal interval. Every question is the right
              question.
            </p>
            <div className='mt-6 flex gap-2'>
              <Pill variant='dark'>IRT Engine</Pill>
              <Pill variant='dark'>SM-2 Algorithm</Pill>
              <Pill variant='dark'>Lucky Guess Detector</Pill>
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-white/50">
                Subject Mastery
              </span>
              <ReadinessRingSvg size='h-16 w-16' />
            </div>
            <MasteryBars />
          </div>
        </div>
      </div>
    </div>
  </section>
)
