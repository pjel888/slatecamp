import Link from 'next/link'
import { Check, Lock, ArrowRight, Clock } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'
import type { CampTrail, TrailEnrollment } from '@/types/app'

/* ------------------------------------------------------------------ */
/*  Trail type display config                                          */
/* ------------------------------------------------------------------ */

const TRAIL_TYPE_LABELS: Record<CampTrail['trail_type'], string> = {
  time_gated: 'TIME-GATED',
  subject_mastery: 'MASTERY',
  code_deep_dive: 'DEEP DIVE',
  remediation: 'REMEDIATION',
  exam_simulation: 'EXAM SIM',
}

const TRAIL_TYPE_STYLES: Record<CampTrail['trail_type'], string> = {
  time_gated: 'bg-primary-50 text-camp-cobalt',
  subject_mastery: 'bg-[#EEEDFE] text-[#534AB7]',
  code_deep_dive: 'bg-warning-50 text-[#8B6914]',
  remediation: 'bg-[#FFF3E8] text-[#9E5B1F]',
  exam_simulation: 'bg-destructive-50 text-camp-red',
}

/* ------------------------------------------------------------------ */
/*  Subject color map                                                   */
/* ------------------------------------------------------------------ */

const SUBJECT_COLORS: Record<string, string> = {
  'Building Laws': '#1B3FC4',
  'Fire & Life Safety': '#E63329',
  'Structural Design': '#E8853A',
  'Materials & Methods': '#1B7A3C',
  'MEPF Utilities': '#534AB7',
  'History & Theory': '#F5A623',
  'Planning': '#6B9B37',
  'Professional Practice': '#4A7B9D',
}

const getSubjectColor = (subject: string): string =>
  SUBJECT_COLORS[subject] ?? '#8896A7'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

type CardState = 'locked' | 'completed' | 'enrolled' | 'not_started'

const getCardState = (
  enrollment: TrailEnrollment | null | undefined,
  isLocked: boolean,
): CardState => {
  if (isLocked) return 'locked'
  if (enrollment?.status === 'completed') return 'completed'
  if (enrollment?.status === 'active' || enrollment?.status === 'paused') return 'enrolled'
  return 'not_started'
}

/* ------------------------------------------------------------------ */
/*  Mini Phase Map (7-column dot grid for enrolled trails)             */
/* ------------------------------------------------------------------ */

interface MiniPhaseMapProps {
  trail: CampTrail
  enrollment: TrailEnrollment
}

const MiniPhaseMap = ({ trail, enrollment }: MiniPhaseMapProps) => {
  const totalDays = trail.duration_days
  const currentDay = enrollment.current_day
  const daysCompleted = enrollment.days_completed
  const subjects = trail.subjects_covered ?? []

  // Show up to 14 dots (2 rows of 7)
  const dotsToShow = Math.min(totalDays, 14)

  return (
    <div className="grid grid-cols-7 gap-[3px] mb-3">
      {Array.from({ length: dotsToShow }, (_, i) => {
        const dayNum = i + 1
        const isCompleted = dayNum <= daysCompleted
        const isToday = dayNum === currentDay
        const isUpcoming = dayNum > currentDay
        const isRest = dayNum > totalDays

        // Assign a subject color based on index cycling through subjects
        const subjectIndex = subjects.length > 0 ? i % subjects.length : 0
        const subjectColor = subjects.length > 0 ? getSubjectColor(subjects[subjectIndex]) : '#D4DAE3'

        if (isRest) {
          return (
            <span
              key={i}
              className="aspect-square min-w-0 rounded-[3px] border border-border bg-transparent"
            />
          )
        }

        if (isToday) {
          return (
            <span
              key={i}
              className="aspect-square min-w-0 rounded-[3px]"
              style={{
                backgroundColor: subjectColor,
                boxShadow: `0 0 0 2px white, 0 0 0 3.5px #1B3FC4`,
              }}
            />
          )
        }

        if (isCompleted) {
          return (
            <span
              key={i}
              className="aspect-square min-w-0 rounded-[3px]"
              style={{ backgroundColor: subjectColor }}
            />
          )
        }

        if (isUpcoming) {
          return (
            <span
              key={i}
              className="aspect-square min-w-0 rounded-[3px] opacity-30"
              style={{ backgroundColor: subjectColor }}
            />
          )
        }

        return (
          <span
            key={i}
            className="aspect-square min-w-0 rounded-[3px] border border-border bg-transparent"
          />
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Subject Pips (for non-enrolled cards)                              */
/* ------------------------------------------------------------------ */

const SubjectPips = ({ subjects }: { subjects: string[] }) => {
  if (!subjects || subjects.length === 0) return null

  return (
    <div className="flex gap-[3px] mb-3">
      {subjects.map((subject) => (
        <span
          key={subject}
          className="h-1 rounded-sm opacity-65 flex-1"
          style={{ backgroundColor: getSubjectColor(subject) }}
          title={subject}
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  TrailCard                                                          */
/* ------------------------------------------------------------------ */

interface TrailCardProps {
  trail: CampTrail & { enrollment?: TrailEnrollment | null }
  isLocked: boolean
}

export const TrailCard = ({ trail, isLocked }: TrailCardProps) => {
  const state = getCardState(trail.enrollment, isLocked)
  const progressPercent =
    state === 'enrolled' && trail.enrollment
      ? Math.round((trail.enrollment.days_completed / trail.duration_days) * 100)
      : 0

  const hrsPerDay = (trail.daily_time_estimate_minutes / 60).toFixed(1)
  const href =
    state === 'locked'
      ? '/dashboard/upgrade'
      : `/dashboard/camptrails/${trail.slug}`

  return (
    <Link
      href={href}
      className={cn(
        'group relative flex flex-col rounded-lg border border-border bg-white transition-all duration-150 hover:border-[#B8B4AC] hover:shadow-sm cursor-pointer',
        'focus-visible:ring-2 focus-visible:ring-camp-cobalt/20 focus-visible:ring-offset-2 outline-none',
        state === 'enrolled' && 'border-[#534AB7] border-[1.5px]',
        state === 'completed' && 'bg-success-50 border-emerald/30',
        state === 'locked' && 'opacity-70',
      )}
    >
      <div className="flex flex-1 flex-col p-5">
        {/* Header: type badge + access badge */}
        <div className="flex justify-between items-start mb-3">
          <span
            className={cn(
              'font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 rounded',
              TRAIL_TYPE_STYLES[trail.trail_type],
            )}
          >
            {TRAIL_TYPE_LABELS[trail.trail_type]}
          </span>

          {trail.is_free ? (
            <span className="font-mono text-[11px] uppercase bg-success-50 text-emerald px-1.5 py-0.5 rounded-sm">
              Free
            </span>
          ) : (
            <span className="font-mono text-[11px] uppercase bg-text-primary text-white px-1.5 py-0.5 rounded-sm">
              Pro
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-text-primary mb-1 leading-snug">
          {trail.name}
        </h3>

        {/* Description */}
        {trail.description && (
          <p className="text-sm text-text-tertiary line-clamp-2 mb-4 flex-1">
            {trail.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-text-tertiary mb-3">
          <span className="inline-flex items-center gap-1">
            <Clock size={13} className="text-text-tertiary" />
            {trail.duration_days} days
          </span>
          <span>~{hrsPerDay} hrs/day</span>
        </div>

        {/* Subject pips or mini phase map */}
        {state === 'enrolled' && trail.enrollment ? (
          <MiniPhaseMap trail={trail} enrollment={trail.enrollment} />
        ) : (
          <SubjectPips subjects={trail.subjects_covered ?? []} />
        )}

        {/* Progress bar for enrolled */}
        {state === 'enrolled' && (
          <div className="h-[3px] rounded-sm bg-border mb-3">
            <div
              className="h-[3px] rounded-sm bg-[#534AB7] transition-all duration-150 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-1">
          {state === 'locked' ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-tertiary">
              <Lock size={14} weight="bold" />
              Upgrade to Access
            </span>
          ) : state === 'completed' ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald">
              <Check size={14} weight="bold" />
              Completed
            </span>
          ) : state === 'enrolled' ? (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-camp-cobalt transition-all duration-150 group-hover:gap-2">
              Continue
              <ArrowRight size={14} weight="bold" />
            </span>
          ) : (
            <span className="text-sm font-semibold text-camp-cobalt transition-all duration-150 group-hover:gap-2 inline-flex items-center gap-1">
              View Trail
            </span>
          )}

          {state === 'enrolled' && trail.enrollment && (
            <span className="font-mono text-[11px] text-text-tertiary tabular-nums">
              {trail.enrollment.days_completed}/{trail.duration_days}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
