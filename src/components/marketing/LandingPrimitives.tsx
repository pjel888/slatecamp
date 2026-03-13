import { AlertTriangle, ArrowUpRight } from 'lucide-react'

/* ── Noise texture overlay ── */

export const NoiseOverlay = ({ opacity = 0.03 }: { opacity?: number }) => (
  <div
    className='pointer-events-none absolute inset-0 opacity-[var(--noise-opacity,0.03)]'
    style={{
      ['--noise-opacity' as string]: opacity,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundSize: '128px 128px',
    }}
    aria-hidden='true'
  />
)

/* ── Dotted grid overlay ── */

export const DottedGridOverlay = () => (
  <div
    className='pointer-events-none absolute inset-0 z-0'
    style={{
      backgroundImage:
        'radial-gradient(circle at center, rgba(24,24,27,0.08) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    }}
    aria-hidden='true'
  />
)

/* ── Starburst decorative mark ── */

export const Starburst = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    viewBox='0 0 28 28'
    fill='currentColor'
    aria-hidden='true'
  >
    <polygon points='14,0 16.1,8.9 23.9,4.1 19.1,11.9 28,14 19.1,16.1 23.9,23.9 16.1,19.1 14,28 11.9,19.1 4.1,23.9 8.9,16.1 0,14 8.9,11.9 4.1,4.1 11.9,8.9' />
  </svg>
)

/* ── Pill badge ── */

export const Pill = ({
  children,
  variant = 'dark',
}: {
  children: React.ReactNode
  variant?: 'light' | 'dark'
}) => (
  <span
    className={
      'inline-block rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide uppercase ' +
      (variant === 'dark'
        ? 'border-white/10 text-white/60'
        : 'border-zinc-300 text-zinc-600')
    }
  >
    {children}
  </span>
)

/* ── Readiness score dial (hero conversion card) ── */

export const ReadinessDial = ({
  value,
  label,
  showWarning = true,
  tone = 'warning',
}: {
  value: number
  label: string
  showWarning?: boolean
  tone?: 'warning' | 'success'
}) => {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (value / 100) * circumference
  return (
    <div className='flex flex-col items-center'>
      <div className='relative h-[88px] w-[88px]'>
        <svg
          className='-rotate-90'
          width={88}
          height={88}
          viewBox='0 0 88 88'
          aria-hidden='true'
        >
          <circle
            cx={44}
            cy={44}
            r={radius}
            fill='none'
            stroke='#E4E4E7' // zinc-200
            strokeWidth={6}
          />
          <circle
            cx={44}
            cy={44}
            r={radius}
            fill='none'
            stroke={tone === 'success' ? '#16A34A' : '#EA580C'} // green-600 or orange-600
            strokeWidth={6}
            strokeLinecap='round'
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={
              tone === 'success'
                ? 'transition-[stroke-dashoffset] duration-500 '
                : 'transition-[stroke-dashoffset] duration-500 '
            }
          />
        </svg>
        <span className='absolute inset-0 flex items-center justify-center text-[18px] font-bold text-zinc-900'>
          {value}%
        </span>
        {showWarning && (
          <div className='absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-[0_0_12px_rgba(248,113,113,0.9)]'>
            <AlertTriangle className='h-3 w-3' aria-hidden='true' />
          </div>
        )}
      </div>
      <span className='mt-1 text-[11px] font-medium text-zinc-600'>
        {label}
      </span>
    </div>
  )
}

/* ── Arrow circle button ── */

export const CircleArrow = ({
  variant = 'dark',
}: {
  variant?: 'light' | 'dark'
}) => (
  <span
    className={
      'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-150 hover:opacity-100 ' +
      (variant === 'dark'
        ? 'border-white/10 text-white/60'
        : 'border-zinc-300 text-zinc-500')
    }
    aria-hidden='true'
  >
    <ArrowUpRight size={14} strokeWidth={1.5} />
  </span>
)
