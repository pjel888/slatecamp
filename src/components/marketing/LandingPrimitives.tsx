import { ArrowUpRight } from 'lucide-react'
import { SLATECAMP_INK, SLATECAMP_BORDER, SLATECAMP_AMBER, hexToRgba } from '@/lib/constants'

/* ── Noise texture overlay ── */

export const NoiseOverlay = ({ opacity = 0.03 }: { opacity?: number }) => (
  <div
    className='pointer-events-none absolute inset-0'
    style={{
      opacity,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundSize: '128px 128px',
    }}
    aria-hidden='true'
  />
)

/* ── Dotted grid overlay ── */

export const DottedGridOverlay = () => (
  <div
    className="pointer-events-none absolute inset-0"
    style={{
      backgroundImage: `radial-gradient(circle at center, ${hexToRgba(SLATECAMP_INK.main, 0.07)} 1px, transparent 1px)`,
      backgroundSize: '24px 24px',
    }}
    aria-hidden="true"
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
    className="inline-block rounded-full border px-3 py-1 text-[11px] font-medium tracking-wide uppercase"
    style={
      variant === 'dark'
        ? { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }
        : { borderColor: hexToRgba(SLATECAMP_INK.main, 0.1), color: hexToRgba(SLATECAMP_INK.main, 0.5) }
    }
  >
    {children}
  </span>
)

/* ── Readiness score dial (hero conversion card) ── */

export const ReadinessDial = ({
  value,
  label,
}: {
  value: number
  label: string
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
            stroke={SLATECAMP_BORDER.DEFAULT}
            strokeWidth={6}
          />
          <circle
            cx={44}
            cy={44}
            r={radius}
            fill='none'
            stroke={SLATECAMP_AMBER.DEFAULT}
            strokeWidth={6}
            strokeLinecap='round'
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className='transition-[stroke-dashoffset] duration-500'
          />
        </svg>
        <span className='absolute inset-0 flex items-center justify-center text-[18px] font-bold' style={{ color: SLATECAMP_INK.main }}>
          {value}%
        </span>
      </div>
      <span className='mt-1 text-[11px] font-medium' style={{ color: SLATECAMP_INK.muted }}>
        {label}
      </span>
    </div>
  )
}

/* ── Arrow circle button ── */

export const CircleArrow = ({ variant = 'dark' }: { variant?: 'light' | 'dark' }) => (
  <span
    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-150 hover:opacity-100"
    style={
      variant === 'dark'
        ? { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.4)' }
        : { borderColor: hexToRgba(SLATECAMP_INK.main, 0.1), color: hexToRgba(SLATECAMP_INK.main, 0.4) }
    }
    aria-hidden="true"
  >
    <ArrowUpRight size={14} strokeWidth={1.5} />
  </span>
)
