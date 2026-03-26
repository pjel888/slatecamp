import {
  Book,
  Leaf,
  Crosshair,
  MagnifyingGlass,
  GearSix,
  Lightning,
  Shield,
  Barbell,
} from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'
import type { QuizMode } from '@/types/quiz-config'

// ─── Zone definitions ────────────────────────────────────────────────────────

type Zone = 1 | 2 | 3

interface ModeEntry {
  mode: QuizMode
  label: string
  description: string
  zone: Zone
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties; 'aria-hidden'?: boolean | 'true' | 'false' }>
}

const ZONE_LABELS: Record<Zone, string> = {
  1: 'Learning',
  2: 'Performance',
  3: 'Simulation',
}

const MODES: ModeEntry[] = [
  {
    mode: 'camp',
    label: 'Camp Mode',
    description: 'Guided study with instant feedback and full explanations. No timer, no pressure.',
    zone: 1,
    Icon: ({ className, ...p }) => <Book className={className} {...p} />,
  },
  {
    mode: 'chill',
    label: 'Chill Mode',
    description: 'Relaxed practice at your own pace. Skip freely, go back anytime.',
    zone: 1,
    Icon: ({ className, ...p }) => <Leaf className={className} {...p} />,
  },
  {
    mode: 'subject',
    label: 'Subject Focus',
    description: 'Drill a specific subject area with full explanations and adaptive difficulty.',
    zone: 1,
    Icon: ({ className, ...p }) => <MagnifyingGlass className={className} {...p} />,
  },
  {
    mode: 'focused',
    label: 'Focus Review',
    description: 'Targets your developing skills. Pre-selected from your weakest areas.',
    zone: 2,
    Icon: ({ className, ...p }) => <Crosshair className={className} {...p} />,
  },
  {
    mode: 'custom',
    label: 'Custom Session',
    description: 'Full control: timer, feedback timing, navigation model, and difficulty.',
    zone: 2,
    Icon: ({ className, ...p }) => <GearSix className={className} {...p} />,
  },
  {
    mode: 'storm',
    label: 'Storm Mode',
    description: 'High-volume timed session. No feedback during. Results at the end.',
    zone: 2,
    Icon: ({ className, ...p }) => <Lightning className={className} {...p} />,
  },
  {
    mode: 'fullexam',
    label: 'Full Exam Simulation',
    description: '200 questions, 4-hour timer. Results available in 24 hours.',
    zone: 3,
    Icon: ({ className, ...p }) => <Shield className={className} {...p} />,
  },
  {
    mode: 'extended',
    label: 'Extended Practice',
    description: '50 questions with a count-up timer. Stamina analysis included.',
    zone: 3,
    Icon: ({ className, ...p }) => <Barbell className={className} {...p} />,
  },
]

// ─── Zone accent colours ──────────────────────────────────────────────────────

const zoneAccent = (zone: Zone) =>
  zone === 3 ? '#E8853A' : '#1B3FC4'

const zoneIconBg = (zone: Zone) =>
  zone === 3 ? 'rgba(232,133,58,0.10)' : 'rgba(27,63,196,0.10)'

// ─── Single mode card ─────────────────────────────────────────────────────────

interface ModeCardItemProps {
  entry: ModeEntry
  onSelect: (mode: QuizMode) => void
}

const ModeCardItem = ({ entry, onSelect }: ModeCardItemProps) => {
  const { mode, label, description, zone, Icon } = entry
  const accent = zoneAccent(zone)

  return (
    <button
      type="button"
      onClick={() => onSelect(mode)}
      className={cn(
        'group flex flex-col rounded-md border p-4 text-left w-full',
        'bg-white transition-all duration-150 ease-out',
        'hover:-translate-y-px hover:shadow-sm',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4]/30 focus-visible:ring-offset-2',
      )}
      style={{ borderColor: '#D4DAE3' }}
      aria-label={`${label}. ${description}`}
    >
      {/* Icon + zone badge */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm"
          style={{ backgroundColor: zoneIconBg(zone) }}
          aria-hidden="true"
        >
          <Icon className="h-3.5 w-3.5" style={{ color: accent } as React.CSSProperties} aria-hidden="true" />
        </div>
        <span
          className="text-[11px] font-medium uppercase tracking-wide"
          style={{ color: '#8896A7' }}
        >
          Zone {zone} · {ZONE_LABELS[zone]}
        </span>
      </div>

      {/* Label */}
      <h3 className="text-[15px] font-semibold text-[#1A2332] mb-1 leading-snug">{label}</h3>

      {/* Description */}
      <p className="text-[13px] text-[#4A5568] leading-relaxed mb-3">{description}</p>

      {/* CTA */}
      <span
        className="mt-auto inline-flex items-center justify-center rounded-sm w-full px-3 py-2 text-[13px] font-medium text-white transition-all duration-150 ease-out"
        style={{ backgroundColor: accent }}
        aria-hidden="true"
      >
        Set up session
      </span>
    </button>
  )
}

// ─── ModeSelector grid ────────────────────────────────────────────────────────

interface ModeSelectorProps {
  onSelect: (mode: QuizMode) => void
}

const ModeSelector = ({ onSelect }: ModeSelectorProps) => {
  const zones: Zone[] = [1, 2, 3]

  return (
    <div className="space-y-6">
      {zones.map((zone) => {
        const zoneModes = MODES.filter((m) => m.zone === zone)
        return (
          <section key={zone} aria-labelledby={`zone-${zone}-heading`}>
            <h2
              id={`zone-${zone}-heading`}
              className="text-[11px] font-medium uppercase tracking-wide text-[#8896A7] mb-3"
            >
              Zone {zone} — {ZONE_LABELS[zone]}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {zoneModes.map((entry) => (
                <ModeCardItem key={entry.mode} entry={entry} onSelect={onSelect} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

ModeSelector.displayName = 'ModeSelector'

export { ModeSelector }
export type { ModeEntry }
