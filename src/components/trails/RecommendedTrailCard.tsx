import Link from 'next/link'
import { Star } from '@phosphor-icons/react/dist/ssr'
import type { TrailRecommendation } from '@/types/app'

/* ------------------------------------------------------------------ */
/*  Subject color map for pips                                         */
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
/*  RecommendedTrailCard                                               */
/*  The ONLY cobalt-filled card in the product.                        */
/* ------------------------------------------------------------------ */

interface RecommendedTrailCardProps {
  recommendation: TrailRecommendation
  /** Optional callback — when omitted the CTA links to the trail page instead. */
  onStartTrail?: () => void
  isPending?: boolean
}

export const RecommendedTrailCard = ({
  recommendation,
  onStartTrail,
  isPending = false,
}: RecommendedTrailCardProps) => {
  const { trail, reasoning, weekOnePreview } = recommendation
  const hrsPerDay = (trail.daily_time_estimate_minutes / 60).toFixed(1)
  const subjectCount = trail.subjects_covered?.length ?? 0

  const ctaClasses = [
    'inline-block rounded-md bg-white px-5 py-2.5 text-sm font-bold text-[camp-cobalt]',
    'transition-all duration-150 ease-out text-center',
    'hover:bg-white/90 active:bg-white/80 active:scale-[0.98]',
    'focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[camp-cobalt] outline-none',
    'disabled:opacity-60 disabled:pointer-events-none',
  ].join(' ')

  return (
    <div className="relative rounded-lg bg-[camp-cobalt] p-6 text-white overflow-hidden">
      {/* Subtle gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 50%, rgba(0,0,0,0.06) 100%)',
        }}
      />

      <div className="relative z-10">
        {/* Star + badge row */}
        <div className="flex items-center gap-2 mb-4">
          <Star size={18} weight="fill" className="text-white" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-white/65">
            Best Match for Your Profile
          </span>
        </div>

        {/* Trail name */}
        <h2 className="text-xl font-bold text-white mb-3 leading-snug">
          {trail.name}
        </h2>

        {/* Rationale */}
        <p className="text-sm italic text-white/85 leading-relaxed mb-4">
          {reasoning}
        </p>

        {/* Week 1 preview */}
        {weekOnePreview && (
          <p className="text-sm text-white/85 leading-relaxed mb-4">
            {weekOnePreview}
          </p>
        )}

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/70">
            {trail.duration_days} Days
          </span>
          <span className="w-[3px] h-[3px] rounded-full bg-white/40" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/70">
            ~{hrsPerDay} Hrs/Day
          </span>
          <span className="w-[3px] h-[3px] rounded-full bg-white/40" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-white/70">
            {subjectCount} Subjects Covered
          </span>
        </div>

        {/* Footer: subject dots + CTA */}
        <div className="flex items-center justify-between">
          {/* Subject dots */}
          <div className="flex gap-1.5">
            {(trail.subjects_covered ?? []).map((subject) => (
              <span
                key={subject}
                className="w-2.5 h-2.5 rounded-[3px] opacity-70"
                style={{ backgroundColor: getSubjectColor(subject) }}
                title={subject}
              />
            ))}
          </div>

          {/* CTA */}
          {onStartTrail ? (
            <button
              type="button"
              onClick={onStartTrail}
              disabled={isPending}
              className={ctaClasses}
            >
              {isPending ? 'Starting...' : 'Start This Trail'}
            </button>
          ) : (
            <Link href={`/dashboard/camptrails/${trail.slug}`} className={ctaClasses}>
              View Trail
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
