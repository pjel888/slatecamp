import {
  Starburst,
  Pill,
  CircleArrow,
} from '@/components/marketing/LandingPrimitives'

/* ── Quiz answer mockup (simplified bar style) ── */

const QuizMockup = ({ theme = 'dark' }: { theme?: 'dark' | 'amber' }) => {
  const rowBase = theme === 'amber' ? 'bg-black/[0.10]' : 'bg-white/[0.07]'
  const rowFaint = theme === 'amber' ? 'bg-black/[0.06]' : 'bg-white/[0.04]'
  const radio = theme === 'amber' ? 'border-black/40' : 'border-current opacity-70'
  const bar = theme === 'amber' ? 'bg-black/30' : 'bg-current opacity-30'
  const correctBorder = theme === 'amber' ? 'border-camp-green/70' : 'border-emerald/45'
  const correctBg = theme === 'amber' ? 'bg-camp-green/20' : 'bg-emerald/[0.18]'
  const correctRadio = theme === 'amber' ? 'border-camp-green bg-camp-green' : 'border-emerald bg-emerald'
  const correctBar = theme === 'amber' ? 'bg-camp-green opacity-80' : 'bg-emerald opacity-70'

  return (
    <div className='mt-5 flex flex-col gap-[5px]' aria-hidden='true'>
      <div className={`flex items-center gap-2 rounded-[5px] ${rowBase} px-3 py-[7px]`}>
        <div className={`h-[11px] w-[11px] shrink-0 rounded-full border-[1.5px] ${radio}`} />
        <div className={`h-[7px] w-[72%] rounded-full ${bar}`} />
      </div>
      <div className={`flex items-center gap-2 rounded-[5px] border ${correctBorder} ${correctBg} px-3 py-[7px]`}>
        <div className={`h-[11px] w-[11px] shrink-0 rounded-full border-[1.5px] ${correctRadio}`} />
        <div className={`h-[7px] w-[55%] rounded-full ${correctBar}`} />
      </div>
      <div className={`flex items-center gap-2 rounded-[5px] ${rowBase} px-3 py-[7px]`}>
        <div className={`h-[11px] w-[11px] shrink-0 rounded-full border-[1.5px] ${radio}`} />
        <div className={`h-[7px] w-[80%] rounded-full ${bar}`} />
      </div>
      <div className={`flex items-center gap-2 rounded-[5px] ${rowFaint} px-3 py-[7px]`}>
        <div className={`h-[11px] w-[11px] shrink-0 rounded-full border-[1.5px] ${radio}`} />
        <div className={`h-[7px] w-[44%] rounded-full ${bar}`} />
      </div>
    </div>
  )
}

/* ── Subject mastery bars ── */

const SUBJECTS = [
  { name: 'Structural Design', pct: 85, tone: 'good' as const },
  { name: 'Building Technology', pct: 62, tone: 'neutral' as const },
  { name: 'Architectural Theory', pct: 41, tone: 'warn' as const },
  { name: 'History of Architecture', pct: 73, tone: 'neutral' as const },
  { name: 'Utilities (MEPFS)', pct: 88, tone: 'good' as const },
] as const

const MasteryBars = () => (
  <div className='space-y-[7px]' aria-hidden='true'>
    {SUBJECTS.map((s) => (
      <div key={s.name}>
        <div className='mb-[3px] flex items-center justify-between font-[family-name:var(--font-dm-mono)] text-[11px] text-white/40'>
          <span>{s.name}</span>
          <span>{s.pct}%</span>
        </div>
        <div className='h-1 w-full overflow-hidden rounded-[3px] bg-white/10'>
          <div
            className={`h-full rounded-[3px] ${
              s.tone === 'good'
                ? 'bg-emerald'
                : s.tone === 'warn'
                  ? 'bg-warning'
                  : 'bg-[#e2e2e6]'
            }`}
            style={{ width: `${s.pct}%` }}
          />
        </div>
      </div>
    ))}
  </div>
)

/* ── Inline readiness ring SVG ── */

const RING_R = 36
const RING_C = 2 * Math.PI * RING_R
const RING_OFFSET = RING_C - (78 / 100) * RING_C

const ReadinessRingSvg = ({ size = 82 }: { size?: number }) => (
  <svg viewBox='0 0 100 100' width={size} height={size} className='shrink-0' aria-hidden='true'>
    <circle
      cx='50' cy='50' r={RING_R}
      fill='none' stroke='rgba(255,255,255,0.1)' strokeWidth='5'
    />
    <circle
      cx='50' cy='50' r={RING_R}
      fill='none' stroke='#E2E2E6' strokeWidth='5'
      strokeDasharray={RING_C} strokeDashoffset={RING_OFFSET}
      strokeLinecap='round' transform='rotate(-90 50 50)'
    />
    <text x='50' y='47' textAnchor='middle' fill='white' fontSize='22' fontWeight='700'
      style={{ fontFamily: 'var(--font-syne, Syne, sans-serif)' }}>
      78
    </text>
    <text x='50' y='62' textAnchor='middle' fill='rgba(255,255,255,0.3)' fontSize='6.5'
      letterSpacing='0.15em'
      style={{ fontFamily: 'var(--font-dm-mono, DM Mono, monospace)' }}>
      READINESS
    </text>
  </svg>
)

/* ── Heatmap cells ── */

const HEATMAP: { color: string; opacity: number }[] = [
  { color: '#2D9F6F', opacity: 0.8 }, { color: '#2D9F6F', opacity: 0.8 },
  { color: '#e2e2e6', opacity: 0.4 }, { color: '#e2e2e6', opacity: 0.4 },
  { color: '#2D9F6F', opacity: 0.8 }, { color: '#6b7280', opacity: 0.35 },
  { color: '#e2e2e6', opacity: 0.4 }, { color: '#2D9F6F', opacity: 0.8 },
  { color: '#2D9F6F', opacity: 0.8 }, { color: '#e2e2e6', opacity: 0.4 },
  { color: '#e2e2e6', opacity: 0.4 }, { color: '#2D9F6F', opacity: 0.8 },
  { color: '#6b7280', opacity: 0.35 }, { color: '#e2e2e6', opacity: 0.4 },
  { color: '#e2e2e6', opacity: 0.4 }, { color: '#2D9F6F', opacity: 0.8 },
  { color: '#2D9F6F', opacity: 0.8 }, { color: '#e2e2e6', opacity: 0.4 },
  { color: '#2D9F6F', opacity: 0.8 }, { color: '#e2e2e6', opacity: 0.4 },
  { color: '#6b7280', opacity: 0.35 }, { color: '#e2e2e6', opacity: 0.4 },
  { color: '#e2e2e6', opacity: 0.4 }, { color: '#2D9F6F', opacity: 0.8 },
]

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

      {/* ── Top grid: 3 cols, side cards span 2 rows ── */}
      <div className='grid grid-cols-1 gap-[10px] md:grid-cols-3 md:grid-rows-2'>

        {/* REVIEW MODE — Camp Amber + light noise */}
        <div className='landing-reveal landing-delay-1 relative overflow-hidden rounded-md bg-camp-amber p-7 noise-light transition-transform duration-150 hover:-translate-y-0.5 md:col-start-1 md:row-span-2 md:row-start-1 md:min-h-[480px]'>
          <div className='relative z-10 flex h-full flex-col justify-between'>
            <div>
              <div className='flex items-center justify-between'>
                <span className='font-[family-name:var(--font-dm-mono)] text-[11px] tracking-[0.2em] uppercase text-black/40'>
                  [ Review Mode ]
                </span>
                <Starburst className='h-3 w-3 text-camp-black' />
              </div>
              <h3 className='mt-7 font-[family-name:var(--font-syne)] text-[clamp(18px,2.2vw,26px)] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#111]'>
                Active Recall,
                <br />
                Zero Pressure
              </h3>
              <p className='mt-2 max-w-[340px] text-[13px] leading-relaxed text-black/50'>
                No timer. No analytics. Just you and the material — until it sticks.
              </p>
              <QuizMockup theme='amber' />
            </div>
            <div className='mt-4'>
              <div className='flex gap-[5px]'>
                <Pill variant='amber'>Active Recall</Pill>
                <Pill variant='amber'>Stress-Free</Pill>
              </div>
              <div className='mt-3 flex justify-end'>
                <CircleArrow variant='amber' />
              </div>
            </div>
          </div>
        </div>

        {/* STAT: 1 in 3 — Camp Cream (no noise) */}
        <div className='landing-reveal landing-delay-2 rounded-md border border-border-design bg-white p-7 transition-transform duration-150 hover:-translate-y-0.5 md:col-start-2 md:row-start-1'>
          <Starburst className='h-3 w-3 text-camp-amber' />
          <div className='mt-7 font-[family-name:var(--font-syne)] text-[72px] font-extrabold leading-[0.9] tracking-[-0.05em] text-camp-red'>
            1 in 3
          </div>
          <p className='mt-3 max-w-[200px] text-[13px] leading-[1.5] text-[#555]'>
            ALE examinees don&apos;t pass in a given sitting. Most didn&apos;t know
            they were at risk.
          </p>
          <p className='mt-2 font-[family-name:var(--font-dm-mono)] text-[11px] text-[#aaa]'>
            Source: PRC official results, 2024–2025
          </p>
        </div>

        {/* ANALYTICS — Camp Cobalt + heavy noise */}
        <div className='landing-reveal landing-delay-3 relative overflow-hidden rounded-md bg-camp-cobalt p-7 text-white noise-heavy transition-transform duration-150 hover:-translate-y-0.5 md:col-start-3 md:row-span-2 md:row-start-1 md:min-h-[480px]'>
          <div className='relative z-10 flex h-full flex-col justify-between'>
            <div>
              <div className='flex items-center justify-between'>
                <span className='font-[family-name:var(--font-dm-mono)] text-[11px] tracking-[0.2em] uppercase text-white/40'>
                  [ Analytics ]
                </span>
                <CircleArrow variant='dark' />
              </div>
              <h3 className='mt-7 font-[family-name:var(--font-syne)] text-[clamp(18px,2.2vw,26px)] font-extrabold leading-[1.1] tracking-[-0.02em] text-white'>
                Your Readiness,
                <br />
                Quantified
              </h3>
              <p className='mt-2 text-[13px] leading-relaxed text-white/55'>
                Taxonomy heatmap. Every node. Every gap. No hiding.
              </p>
            </div>
            <div className='mt-5'>
              <div className='flex items-center gap-4'>
                <ReadinessRingSvg />
                <div className='flex-1'>
                  <div className='grid grid-cols-6 gap-1' aria-hidden='true'>
                    {HEATMAP.map((cell, i) => (
                      <div
                        key={i}
                        className='aspect-square rounded-[3px]'
                        style={{ background: cell.color, opacity: cell.opacity }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className='mt-3 flex gap-[5px]'>
                <Pill variant='dark'>IRT-Calibrated</Pill>
                <Pill variant='dark'>EMA-Weighted</Pill>
              </div>
            </div>
          </div>
        </div>

        {/* QUOTE — Camp Red + noise */}
        <div className='landing-reveal landing-delay-4 relative overflow-hidden rounded-md bg-camp-red p-7 text-white noise transition-transform duration-150 hover:-translate-y-0.5 md:col-start-2 md:row-start-2'>
          <div className='relative z-10 flex h-full flex-col justify-between'>
            <div>
              <span className='font-[family-name:var(--font-dm-mono)] text-[11px] tracking-[0.2em] uppercase text-white/45'>
                SlateCamp
              </span>
              <p className='mt-3.5 font-[family-name:var(--font-syne)] text-[clamp(15px,1.8vw,19px)] font-bold italic leading-[1.3] text-white'>
                &ldquo;Trust the camp, put in the reps, and we will eliminate the{' '}
                <span className='underline decoration-white/40 underline-offset-[3px]'>
                  doubt.
                </span>
                &rdquo;
              </p>
            </div>
            <div className='mt-3 flex justify-end'>
              <CircleArrow variant='dark' />
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom row: 3 equal columns ── */}
      <div className='mt-[10px] grid grid-cols-1 gap-[10px] sm:grid-cols-3'>

        {/* 3D LAB — Camp Cream (no noise) */}
        <div className='landing-reveal landing-delay-5 rounded-md border border-border-design bg-white p-7 transition-transform duration-150 hover:-translate-y-0.5'>
          <div className='relative z-10'>
            <div className='flex items-center justify-between'>
              <h3 className='font-[family-name:var(--font-syne)] text-[22px] font-extrabold leading-tight tracking-tight text-[#111]'>
                3D Lab
              </h3>
              <Starburst className='h-3 w-3 text-camp-amber' />
            </div>
            <p className='mt-7 text-[13px] italic leading-[1.4] text-[#555]'>
              Visual learning,
              <br />
              built different.
            </p>
            <p className='mt-2 text-[12px] leading-[1.5] text-[#888]'>
              WebGL-powered models. Drag FAR — model responds in real time.
            </p>
            <div className='mt-3.5 flex items-center justify-between'>
              <Pill variant='light'>3D Models</Pill>
              <CircleArrow variant='light' />
            </div>
          </div>
        </div>

        {/* SESSIONS — Camp Green + noise */}
        <div className='landing-reveal landing-delay-5 relative overflow-hidden rounded-md bg-camp-green p-7 text-white noise transition-transform duration-150 hover:-translate-y-0.5'>
          <div className='relative z-10'>
            <div className='flex items-center justify-between'>
              <span className='font-[family-name:var(--font-dm-mono)] text-[11px] tracking-[0.2em] uppercase text-white/40'>
                [ Sessions ]
              </span>
              <CircleArrow variant='dark' />
            </div>
            <h3 className='mt-7 font-[family-name:var(--font-syne)] text-[22px] font-extrabold leading-[1.1] text-white'>
              Every Answer
              <br />
              Tracked
            </h3>
            <p className='mt-2 text-[12px] leading-[1.5] text-white/50'>
              Timed quizzes, full analytics. Watch your readiness climb.
            </p>
            <div className='mt-3 flex gap-[5px]'>
              <Pill variant='dark'>Camp Mode</Pill>
              <Pill variant='dark'>Storm Mode</Pill>
            </div>
          </div>
        </div>

        {/* AI — Camp Cream (no noise) */}
        <div className='landing-reveal landing-delay-6 rounded-md border border-border-design bg-white p-7 transition-transform duration-150 hover:-translate-y-0.5'>
          <div className='relative z-10'>
            <span className='font-[family-name:var(--font-dm-mono)] text-[11px] tracking-[0.2em] uppercase text-[#aaa]'>
              [ Bounded Intelligence ]
            </span>
            <h3 className='mt-7 font-[family-name:var(--font-syne)] text-[clamp(18px,2.2vw,26px)] font-extrabold leading-[1.1] tracking-[-0.02em] text-[#111]'>
              AI That Cites
              <br />
              Its Sources
            </h3>
            <p className='mt-2 text-[13px] leading-relaxed text-[#555]'>
              Tethered to our verified database. Temperature 0.0. Every response
              links to its exact source.
            </p>
            <div className='mt-3 flex gap-[5px]'>
              <Pill variant='light'>Zero-Hallucination</Pill>
            </div>
          </div>
        </div>
      </div>

      {/* ── Full-width Engine card — Camp Cobalt + noise ── */}
      <div className='landing-reveal mt-[10px] relative overflow-hidden rounded-md bg-camp-cobalt p-7 text-white noise md:p-8'>
        <div className='relative z-10 grid grid-cols-1 items-center gap-7 md:grid-cols-2'>
          <div>
            <span className='font-[family-name:var(--font-dm-mono)] text-[11px] tracking-[0.2em] uppercase text-camp-amber'>
              The Engine
            </span>
            <h3 className='mt-4 font-[family-name:var(--font-syne)] text-[28px] font-extrabold leading-tight tracking-tight text-white'>
              AI-Adaptive
              <br />
              Learning
            </h3>
            <p className='mt-3 max-w-[380px] text-[13px] leading-relaxed text-white/60'>
              Item Response Theory adjusts question difficulty to your exact
              ability level. Spaced repetition at the mathematically optimal
              interval.
            </p>
            <div className='mt-4 flex flex-wrap gap-[5px]'>
              <Pill variant='dark'>IRT Engine</Pill>
              <Pill variant='dark'>SM-2 Algorithm</Pill>
              <Pill variant='dark'>Lucky Guess Detector</Pill>
            </div>
          </div>
          <div className='rounded-lg bg-white/[0.09] p-[18px]'>
            <div className='mb-3.5 flex items-center justify-between'>
              <span className='font-[family-name:var(--font-dm-mono)] text-[11px] tracking-[0.15em] uppercase text-white/40'>
                Subject Mastery
              </span>
              <ReadinessRingSvg size={50} />
            </div>
            <MasteryBars />
          </div>
        </div>
      </div>
    </div>
  </section>
)
